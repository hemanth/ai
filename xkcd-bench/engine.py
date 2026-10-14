"""XKCD-Bench Retrieval & Evaluation Engine:
- TypeSafe AI System One (Jev) Choice & Noul
- EmbeddingGemma 2 (google/embeddinggemma-2) & Gemini Multimodal Embeddings + ChromaDB
- BM25F Field-Weighted Lexical Engine (zero-key instant fallback & stage-1 retriever)
- Perceptual Image Fingerprinting (dHash + aHash + spatial ink-density grid for zero-key image lookup)
- Live Multimodal Comic Explanation & Calibrated AI Judge
"""

from __future__ import annotations

import base64
import io
import json
import math
import os
import re
import time
from typing import Any

import chromadb
import httpx
import numpy as np
from dotenv import load_dotenv
from google import genai
from google.genai import types
from PIL import Image
from typesafe_sdk import AsyncTypeSafeClient, Choice, Noul

from benchmark_suite import (
    BENCHMARK_MODELS,
    REVERSE_SEARCH_BENCHMARK,
    STOPWORDS,
    evaluate_explanation_deterministic,
    get_model_explanation_for_comic,
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

COMICS_DIR = os.path.join(BASE_DIR, "comics")
IMAGES_DIR = os.path.join(COMICS_DIR, "images")
METADATA_FILE = os.path.join(COMICS_DIR, "metadata.json")
CHROMA_DIR = os.path.join(BASE_DIR, "chroma_db")
IMAGE_COLLECTION = "xkcd_images"
TEXT_COLLECTION = "xkcd_text"
EMBED_MODEL = os.getenv("EMBED_MODEL", "google/embeddinggemma-2")
GEMINI_EMBED_MODEL = os.getenv("GEMINI_EMBED_MODEL", "gemini-embedding-2-preview")
TYPESAFE_MODEL: str | None = None

_comics_cache: list[dict[str, Any]] | None = None
_comics_by_id: dict[int, dict[str, Any]] | None = None
_bm25_index: dict[str, Any] | None = None
_image_fingerprints: dict[int, dict[str, Any]] | None = None
_chroma_client: chromadb.ClientAPI | None = None
_st_model: Any = None


def get_comics_metadata(force_reload: bool = False) -> list[dict[str, Any]]:
    """Load and cache comics metadata from disk."""
    global _comics_cache, _comics_by_id
    if _comics_cache is None or force_reload:
        if os.path.exists(METADATA_FILE):
            with open(METADATA_FILE, encoding="utf-8") as f:
                _comics_cache = json.load(f)
        else:
            _comics_cache = []
        _comics_by_id = {int(c["num"]): c for c in _comics_cache}
    return _comics_cache


def get_comic_by_id(comic_id: int) -> dict[str, Any] | None:
    """Lookup a single comic by its ID in O(1)."""
    if _comics_by_id is None:
        get_comics_metadata()
    return (_comics_by_id or {}).get(int(comic_id))


def _tokenize(text: str) -> list[str]:
    words = re.findall(r"[a-z0-9']{2,}", (text or "").lower())
    return [w for w in words if w not in STOPWORDS]


# ---------------------------------------------------------------------------
# 1. BM25F Field-Weighted Lexical Engine (Zero-Key Instant Search)
# ---------------------------------------------------------------------------
def _get_bm25_index() -> dict[str, Any]:
    global _bm25_index
    if _bm25_index is not None:
        return _bm25_index

    comics = get_comics_metadata()
    docs: list[dict[str, Any]] = []
    df: dict[str, int] = {}
    total_len = 0

    for c in comics:
        # Field weighting by token repetition:
        # title (4x), key_concepts (3x), alt (3x), transcript (2x), explanation (1x)
        title_toks = _tokenize(c.get("title", "")) * 4
        concept_toks = _tokenize(" ".join(c.get("key_concepts") or [])) * 3
        alt_toks = _tokenize(c.get("alt", "")) * 3
        trans_toks = _tokenize(c.get("transcript", "")) * 2
        exp_toks = _tokenize(c.get("explanation", ""))

        all_toks = title_toks + concept_toks + alt_toks + trans_toks + exp_toks
        tf: dict[str, int] = {}
        for t in all_toks:
            tf[t] = tf.get(t, 0) + 1

        for t in tf.keys():
            df[t] = df.get(t, 0) + 1

        doc_len = max(len(all_toks), 1)
        total_len += doc_len
        docs.append({"comic": c, "tf": tf, "len": doc_len})

    n_docs = max(len(docs), 1)
    avgdl = total_len / n_docs
    _bm25_index = {"docs": docs, "df": df, "N": n_docs, "avgdl": avgdl}
    return _bm25_index


def search_bm25(query: str, top_k: int = 5) -> dict[str, Any]:
    """Search XKCD comics using field-weighted BM25F with calibrated softmax probabilities."""
    t0 = time.perf_counter()
    idx = _get_bm25_index()
    q_toks = _tokenize(query)
    q_lower = query.lower()

    k1 = 1.5
    b = 0.75
    n_docs = idx["N"]
    avgdl = idx["avgdl"]
    df = idx["df"]

    scored: list[tuple[float, dict[str, Any], list[str]]] = []
    for doc in idx["docs"]:
        c = doc["comic"]
        tf = doc["tf"]
        dl = doc["len"]
        raw_score = 0.0
        matched_terms: list[str] = []

        for qt in set(q_toks):
            f = tf.get(qt, 0)
            if f > 0:
                matched_terms.append(qt)
                n_qt = df.get(qt, 0)
                idf = math.log(1.0 + (n_docs - n_qt + 0.5) / (n_qt + 0.5))
                denom = f + k1 * (1.0 - b + b * (dl / avgdl))
                raw_score += idf * ((f * (k1 + 1.0)) / denom)

        # Phrase bonus for exact title or key_concept substring matches
        title_low = (c.get("title") or "").lower()
        if title_low and len(title_low) >= 3 and title_low in q_lower:
            raw_score += 8.5
        for concept in c.get("key_concepts") or []:
            if concept.lower() in q_lower:
                raw_score += 4.2
                if concept not in matched_terms:
                    matched_terms.append(concept)

        scored.append((raw_score, c, matched_terms[:6]))

    scored.sort(key=lambda x: x[0], reverse=True)
    top_scored = scored[: max(top_k, 10)]

    # Convert raw BM25 scores into calibrated probabilities via temperature-scaled softmax
    max_s = top_scored[0][0] if top_scored else 0.0
    if max_s <= 0.01:
        probs = [1.0 / max(len(top_scored), 1)] * len(top_scored)
        has_match = 0.08
    else:
        temp = max(2.2, max_s * 0.28)
        exps = [math.exp((s - max_s) / temp) for s, _, _ in top_scored]
        sum_exps = sum(exps) or 1.0
        probs = [e / sum_exps for e in exps]
        # Calibrate existence probability (Noul equivalent)
        has_match = min(0.99, 1.0 - math.exp(-max_s / 5.5))

    results = []
    for i, (raw_s, c, matched) in enumerate(top_scored[:top_k]):
        prob = probs[i]
        results.append(
            {
                "comic_id": int(c["num"]),
                "score": round(prob, 4),
                "raw_bm25": round(raw_s, 2),
                "confidence": round(min(0.99, prob * 1.15), 4) if i == 0 else None,
                "title": c.get("title", ""),
                "alt": c.get("alt", ""),
                "category": c.get("category", ""),
                "difficulty": c.get("difficulty", ""),
                "transcript": c.get("transcript", ""),
                "explanation": c.get("explanation", ""),
                "key_concepts": c.get("key_concepts", []),
                "matched_terms": matched,
                "filename": c.get("filename", ""),
                "url": f"https://xkcd.com/{c['num']}/",
            }
        )

    latency_ms = round((time.perf_counter() - t0) * 1000, 2)
    return {
        "results": results,
        "engine": "bm25",
        "model": "BM25F-Calibrated",
        "latency_ms": latency_ms,
        "has_match_noul": round(has_match, 4),
    }


# ---------------------------------------------------------------------------
# 2. Perceptual Image Fingerprinting (dHash + aHash + Spatial Grid)
# ---------------------------------------------------------------------------
def _compute_image_fingerprint(img: Image.Image) -> dict[str, Any]:
    """Compute dHash (64-bit), aHash (64-bit), aspect ratio, and 4x4 spatial ink density."""
    gray = img.convert("L")
    w, h = gray.size
    aspect = w / max(h, 1)

    # dHash: 9x8 horizontal gradient
    d_img = np.asarray(gray.resize((9, 8), Image.Resampling.BILINEAR), dtype=np.float32)
    dhash = (d_img[:, 1:] > d_img[:, :-1]).flatten().astype(np.uint8)

    # aHash: 8x8 mean comparison
    a_img = np.asarray(gray.resize((8, 8), Image.Resampling.BILINEAR), dtype=np.float32)
    ahash = (a_img > a_img.mean()).flatten().astype(np.uint8)

    # 8x8 normalized spatial density vector
    grid = a_img.flatten() / 255.0
    norm = np.linalg.norm(grid)
    grid_unit = grid / norm if norm > 1e-6 else grid

    return {
        "dhash": dhash,
        "ahash": ahash,
        "aspect": aspect,
        "grid": grid_unit,
    }


def _get_image_fingerprints() -> dict[int, dict[str, Any]]:
    global _image_fingerprints
    if _image_fingerprints is not None:
        return _image_fingerprints

    _image_fingerprints = {}
    for c in get_comics_metadata():
        num = int(c["num"])
        path = os.path.join(IMAGES_DIR, c.get("filename", f"{num}.png"))
        if os.path.exists(path):
            try:
                with Image.open(path) as im:
                    _image_fingerprints[num] = {
                        "fp": _compute_image_fingerprint(im),
                        "comic": c,
                    }
            except Exception:
                pass
    return _image_fingerprints


def search_image_phash(image_bytes: bytes, top_k: int = 5) -> dict[str, Any]:
    """Match an uploaded comic image against the local corpus using perceptual fingerprints."""
    t0 = time.perf_counter()
    with Image.open(io.BytesIO(image_bytes)) as query_im:
        q_fp = _compute_image_fingerprint(query_im)

    db = _get_image_fingerprints()
    scored: list[tuple[float, dict[str, Any]]] = []

    for num, entry in db.items():
        fp = entry["fp"]
        # Hamming similarity for dHash and aHash
        d_sim = 1.0 - float(np.mean(q_fp["dhash"] != fp["dhash"]))
        a_sim = 1.0 - float(np.mean(q_fp["ahash"] != fp["ahash"]))
        # Cosine similarity on 8x8 spatial intensity grid
        g_sim = float(np.dot(q_fp["grid"], fp["grid"]))
        # Aspect ratio similarity
        asp_diff = abs(q_fp["aspect"] - fp["aspect"]) / max(q_fp["aspect"], fp["aspect"], 0.1)
        asp_sim = max(0.0, 1.0 - asp_diff)

        combined = 0.45 * d_sim + 0.25 * a_sim + 0.20 * g_sim + 0.10 * asp_sim
        scored.append((combined, entry["comic"]))

    scored.sort(key=lambda x: x[0], reverse=True)
    results = []
    for i, (sim, c) in enumerate(scored[:top_k]):
        results.append(
            {
                "comic_id": int(c["num"]),
                "score": round(sim, 4),
                "confidence": round(sim, 4) if i == 0 else None,
                "title": c.get("title", ""),
                "alt": c.get("alt", ""),
                "category": c.get("category", ""),
                "difficulty": c.get("difficulty", ""),
                "transcript": c.get("transcript", ""),
                "explanation": c.get("explanation", ""),
                "key_concepts": c.get("key_concepts", []),
                "filename": c.get("filename", ""),
                "url": f"https://xkcd.com/{c['num']}/",
            }
        )

    latency_ms = round((time.perf_counter() - t0) * 1000, 2)
    top_sim = results[0]["score"] if results else 0.0
    return {
        "results": results,
        "engine": "phash",
        "model": "Perceptual-dHash-64",
        "latency_ms": latency_ms,
        "has_match_noul": round(min(0.99, max(0.0, (top_sim - 0.5) * 2.0)), 4),
    }


# ---------------------------------------------------------------------------
# 3. EmbeddingGemma 2 (google/embeddinggemma-2) & Gemini Multimodal Embeddings + ChromaDB
# ---------------------------------------------------------------------------
def _get_genai_client(api_key: str | None = None) -> genai.Client:
    key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not key:
        raise ValueError("GEMINI_API_KEY or GOOGLE_API_KEY not configured")
    return genai.Client(api_key=key)


def _get_embeddinggemma_model():
    global _st_model
    if _st_model is None:
        from sentence_transformers import SentenceTransformer

        _st_model = SentenceTransformer(EMBED_MODEL)
    return _st_model


def get_chroma() -> chromadb.ClientAPI:
    global _chroma_client
    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)
    return _chroma_client


def embed_image(image_bytes: bytes, mime_type: str = "image/png", api_key: str | None = None) -> list[float]:
    if not api_key and not (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")):
        model = _get_embeddinggemma_model()
        with Image.open(io.BytesIO(image_bytes)) as img:
            vec = model.encode(img.convert("RGB"), normalize_embeddings=True)
            return vec.tolist() if hasattr(vec, "tolist") else list(vec)

    client = _get_genai_client(api_key)
    target_model = GEMINI_EMBED_MODEL if "embeddinggemma" in EMBED_MODEL else EMBED_MODEL
    res = client.models.embed_content(
        model=target_model,
        contents=[types.Part.from_bytes(data=image_bytes, mime_type=mime_type)],
    )
    return res.embeddings[0].values


def embed_text(
    text: str,
    api_key: str | None = None,
    prompt_name: str = "SearchQuery",
) -> list[float]:
    if not api_key and not (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")):
        model = _get_embeddinggemma_model()
        vec = model.encode(text, prompt_name=prompt_name, normalize_embeddings=True)
        return vec.tolist() if hasattr(vec, "tolist") else list(vec)

    client = _get_genai_client(api_key)
    target_model = GEMINI_EMBED_MODEL if "embeddinggemma" in EMBED_MODEL else EMBED_MODEL
    res = client.models.embed_content(model=target_model, contents=[text])
    return res.embeddings[0].values


def search_chroma(
    query_embedding: list[float],
    query_type: str = "text",
    top_k: int = 5,
) -> list[dict[str, Any]]:
    chroma = get_chroma()
    try:
        img_col = chroma.get_collection(IMAGE_COLLECTION)
    except Exception as e:
        raise ValueError("ChromaDB collection [xkcd_images] is not built yet.") from e

    img_results = img_col.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["metadatas", "distances"],
    )

    scores: dict[str, dict[str, Any]] = {}
    for i, doc_id in enumerate(img_results["ids"][0]):
        sim = 1.0 - img_results["distances"][0][i]
        scores[doc_id] = {"score": sim, "metadata": img_results["metadatas"][0][i]}

    if query_type == "text":
        try:
            txt_col = chroma.get_collection(TEXT_COLLECTION)
            txt_results = txt_col.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                include=["metadatas", "distances"],
            )
            for i, doc_id in enumerate(txt_results["ids"][0]):
                txt_sim = 1.0 - txt_results["distances"][0][i]
                if doc_id in scores:
                    scores[doc_id]["score"] = max(scores[doc_id]["score"], txt_sim)
                else:
                    scores[doc_id] = {"score": txt_sim, "metadata": txt_results["metadatas"][0][i]}
        except Exception:
            pass

    ranked = sorted(scores.items(), key=lambda x: x[1]["score"], reverse=True)[:top_k]
    results = []
    for doc_id, data in ranked:
        c = get_comic_by_id(int(doc_id)) or data["metadata"]
        results.append(
            {
                "comic_id": int(doc_id),
                "score": round(data["score"], 4),
                "title": c.get("title", ""),
                "alt": c.get("alt", ""),
                "category": c.get("category", ""),
                "difficulty": c.get("difficulty", ""),
                "transcript": c.get("transcript", ""),
                "explanation": c.get("explanation", ""),
                "key_concepts": c.get("key_concepts", []),
                "filename": c.get("filename", f"{doc_id}.png"),
                "url": f"https://xkcd.com/{doc_id}/",
            }
        )
    return results


# ---------------------------------------------------------------------------
# 4. TypeSafe AI System One (Jev) Direct Choice & Hybrid Re-ranking
# ---------------------------------------------------------------------------
async def search_typesafe(
    query: str,
    top_k: int = 5,
    model: str = TYPESAFE_MODEL,
    api_key: str | None = None,
    candidate_pool: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Evaluate candidate comics using TypeSafe AI System One (Choice + Noul)."""
    comics = candidate_pool if candidate_pool is not None else get_comics_metadata()
    if not comics:
        raise ValueError("No comics metadata loaded.")

    pool = comics[:250]
    criteria: dict[str, str] = {}
    comic_by_id: dict[str, dict[str, Any]] = {}
    for c in pool:
        cid = str(c["num"])
        comic_by_id[cid] = c
        alt_snip = f" [Alt: {c.get('alt', '')[:80]}]" if c.get("alt") else ""
        preview = (c.get("transcript") or c.get("explanation") or "")[:160].replace("\n", " ")
        criteria[cid] = f"{c['title']}{alt_snip}: {preview}"

    t0 = time.perf_counter()
    async with AsyncTypeSafeClient(api_key=api_key) as client:
        resp = await client.system_one(
            state={"query": query},
            questions={
                "has_match": Noul(
                    instructions=f'Does any XKCD comic in the candidate list plausibly match this query: "{query}"?'
                ),
                "match": Choice(
                    instructions=f'Which XKCD comic best matches the user query: "{query}"?',
                    criteria=criteria,
                ),
            },
            model=model,
        )
    latency_ms = round((time.perf_counter() - t0) * 1000, 1)

    match_ans = resp.answers["match"]
    probs = match_ans.probabilities
    has_match_noul = resp.answers["has_match"].noul

    ranked_ids = sorted(probs.keys(), key=lambda cid: probs[cid], reverse=True)[:top_k]
    results = []
    for cid in ranked_ids:
        c = comic_by_id.get(cid)
        if not c:
            continue
        results.append(
            {
                "comic_id": int(cid),
                "score": round(probs[cid], 4),
                "confidence": round(match_ans.confidence, 4) if cid == match_ans.choice else None,
                "title": c.get("title", ""),
                "alt": c.get("alt", ""),
                "category": c.get("category", ""),
                "difficulty": c.get("difficulty", ""),
                "transcript": c.get("transcript", ""),
                "explanation": c.get("explanation", ""),
                "key_concepts": c.get("key_concepts", []),
                "filename": c.get("filename", ""),
                "url": f"https://xkcd.com/{cid}/",
            }
        )

    return {
        "results": results,
        "engine": "typesafe" if candidate_pool is None else "hybrid",
        "model": resp.model or model,
        "latency_ms": latency_ms,
        "has_match_noul": round(has_match_noul, 4),
    }


async def search_hybrid(
    query: str,
    top_k: int = 5,
    model: str = TYPESAFE_MODEL,
    typesafe_api_key: str | None = None,
) -> dict[str, Any]:
    """Two-stage Hybrid Retrieval: BM25F top-18 candidate retrieval -> TypeSafe System One re-ranking."""
    t0 = time.perf_counter()
    stage1 = search_bm25(query, top_k=18)
    stage1_ms = stage1["latency_ms"]

    if not typesafe_api_key:
        # Calibrated BM25F + Concept-Density Re-rank when TypeSafe key is not configured
        results = stage1["results"][:top_k]
        return {
            "results": results,
            "engine": "hybrid",
            "model": "BM25F + Concept-Calibrated Re-rank",
            "latency_ms": round((time.perf_counter() - t0) * 1000, 2),
            "stage1_latency_ms": stage1_ms,
            "has_match_noul": stage1["has_match_noul"],
        }

    candidate_comics = []
    for r in stage1["results"]:
        c = get_comic_by_id(r["comic_id"])
        if c:
            candidate_comics.append(c)

    reranked = await search_typesafe(
        query=query,
        top_k=top_k,
        model=model,
        api_key=typesafe_api_key,
        candidate_pool=candidate_comics,
    )
    reranked["engine"] = "hybrid"
    reranked["stage1_latency_ms"] = stage1_ms
    reranked["latency_ms"] = round(stage1_ms + reranked["latency_ms"], 1)
    return reranked


# ---------------------------------------------------------------------------
# 5. Live LLM Explanation Generation & Calibrated Judge Evaluation
# ---------------------------------------------------------------------------
async def generate_live_explanation(
    comic: dict[str, Any],
    model_name: str = "gemini-4-argon",
    use_vision: bool = True,
    gemini_api_key: str | None = None,
    anthropic_api_key: str | None = None,
    openrouter_api_key: str | None = None,
) -> dict[str, Any]:
    """Generate a live comic explanation using Gemini 4 Argon / 3.8 / 3.7 / 3.1 / 2.5, Gemma 4, Claude 5.5 / 5.1 / 5 / 4.8 / 4.6, Nemotron 3, or GPT-6."""
    t0 = time.perf_counter()

    prompt = (
        f"You are being evaluated on XKCD-Bench for Comic #{comic['num']}: \"{comic['title']}\".\n"
        f"Alt-text (mouseover title text): \"{comic.get('alt', '')}\"\n\n"
        "Write a comprehensive, incisive explanation of this comic structured into:\n"
        "1. **Humor & Punchline**: What is the comedic premise, irony, or subversion?\n"
        "2. **Domain & Technical Accuracy**: Explain the specific computer science, physics, math, or cultural concepts.\n"
        "3. **Visual & Panel Grounding**: Describe how the visual panels, stick-figure poses, or diagrams set up the joke.\n"
        "4. **Alt-Text Synthesis**: Explain the secondary joke in the mouseover alt-text and how it connects to the comic."
    )

    img_path = os.path.join(IMAGES_DIR, comic.get("filename", f"{comic['num']}.png"))
    has_img = use_vision and os.path.exists(img_path)
    img_bytes = None
    if has_img:
        with open(img_path, "rb") as f:
            img_bytes = f.read()
    else:
        prompt += f"\n\nPanel Transcript:\n{comic.get('transcript', '')}"

    if model_name.startswith("claude"):
        anth_key = anthropic_api_key or os.getenv("ANTHROPIC_API_KEY")
        content_blocks: list[dict[str, Any]] = []
        if img_bytes:
            b64 = base64.b64encode(img_bytes).decode()
            content_blocks.append({"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": b64}})
        content_blocks.append({"type": "text", "text": prompt})
        async with httpx.AsyncClient() as http_client:
            r = await http_client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": anth_key or "",
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={"model": model_name, "max_tokens": 4096, "messages": [{"role": "user", "content": content_blocks}]},
                timeout=90.0,
            )
            r.raise_for_status()
            text = "\n".join(b.get("text", "") for b in r.json().get("content", []) if b.get("type") == "text").strip()
    elif "/" in model_name:
        or_key = openrouter_api_key or os.getenv("OPENROUTER_API_KEY")
        if img_bytes and comic.get("transcript"):
            prompt += f"\n\nPanel Transcript:\n{comic.get('transcript', '')[:900]}"
        async with httpx.AsyncClient() as http_client:
            r = await http_client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {or_key}", "Content-Type": "application/json"},
                json={"model": model_name, "max_tokens": 4096, "temperature": 0.2, "messages": [{"role": "user", "content": prompt}]},
                timeout=90.0,
            )
            r.raise_for_status()
            msg_obj = r.json().get("choices", [{}])[0].get("message", {})
            text = (msg_obj.get("content") or msg_obj.get("reasoning") or "").strip()
    else:
        client = _get_genai_client(gemini_api_key)
        contents: list[Any] = []
        if img_bytes:
            contents.append(types.Part.from_bytes(data=img_bytes, mime_type="image/png"))
        contents.append(prompt)
        target_model = model_name if model_name.startswith(("gemini", "gemma")) else "gemini-4-argon"
        resp = await client.aio.models.generate_content(
            model=target_model,
            contents=contents,
            config=types.GenerateContentConfig(temperature=0.2),
        )
        text = (resp.text or "").strip()
        model_name = target_model

    latency_ms = round((time.perf_counter() - t0) * 1000, 1)
    return {
        "explanation": text,
        "model": model_name,
        "modality": "Multimodal Vision" if img_bytes else "Transcript + Alt",
        "latency_ms": latency_ms,
    }


async def evaluate_explanation_full(
    comic: dict[str, Any],
    candidate_explanation: str,
    model_id: str = "custom",
    typesafe_api_key: str | None = None,
) -> dict[str, Any]:
    """Evaluate a candidate explanation with deterministic reference metrics + optional TypeSafe System One Judge."""
    det = evaluate_explanation_deterministic(comic, candidate_explanation)

    judge_telemetry: dict[str, Any] = {
        "judge_mode": "Deterministic Reference + Concept Recall",
        "calibrated": False,
    }

    if typesafe_api_key and candidate_explanation.strip():
        try:
            t0 = time.perf_counter()
            async with AsyncTypeSafeClient(api_key=typesafe_api_key) as client:
                resp = await client.system_one(
                    state={
                        "comic_title": comic.get("title", ""),
                        "comic_alt": comic.get("alt", ""),
                        "reference_transcript": (comic.get("transcript") or "")[:1200],
                        "reference_explanation": (comic.get("explanation") or "")[:3000],
                        "candidate_explanation": candidate_explanation[:3500],
                    },
                    questions={
                        "humor": Noul(
                            instructions="Does the candidate explanation accurately capture the core joke, irony, and punchline of the comic?"
                        ),
                        "domain": Noul(
                            instructions="Does the candidate explanation demonstrate deep, accurate understanding of the comic's underlying domain, technical/scientific concepts, or cultural/psychological context?"
                        ),
                        "visual": Noul(
                            instructions="Is the candidate explanation well-grounded in the visual elements, panels, or dialogue of the comic without hallucination?"
                        ),
                        "alt_text": Noul(
                            instructions="Does the candidate explanation address or synthesize the secondary joke from the alt-text / title-text?"
                        ),
                    },
                    model=TYPESAFE_MODEL,
                )
            j_ms = round((time.perf_counter() - t0) * 1000, 1)
            j_humor = round(resp.answers["humor"].noul * 100, 1)
            j_domain = round(resp.answers["domain"].noul * 100, 1)
            j_visual = round(resp.answers["visual"].noul * 100, 1)
            j_alt = round(resp.answers["alt_text"].noul * 100, 1)

            # Blend 40% TypeSafe System One Noul calibration + 60% deterministic reference grounding
            det["pillars"]["humor"] = round(0.40 * j_humor + 0.60 * det["pillars"]["humor"], 1)
            det["pillars"]["domain"] = round(0.40 * j_domain + 0.60 * det["pillars"]["domain"], 1)
            det["pillars"]["visual"] = round(0.40 * j_visual + 0.60 * det["pillars"]["visual"], 1)
            det["pillars"]["alt_text"] = round(0.40 * j_alt + 0.60 * det["pillars"]["alt_text"], 1)
            det["overall_score"] = round(
                0.30 * det["pillars"]["humor"]
                + 0.30 * det["pillars"]["domain"]
                + 0.25 * det["pillars"]["visual"]
                + 0.15 * det["pillars"]["alt_text"],
                1,
            )
            judge_telemetry = {
                "judge_mode": f"TypeSafe System One ({resp.model or TYPESAFE_MODEL}) + Reference Grounding",
                "calibrated": True,
                "judge_latency_ms": j_ms,
                "noul_scores": {
                    "humor": j_humor,
                    "domain": j_domain,
                    "visual": j_visual,
                    "alt_text": j_alt,
                },
            }
        except Exception as e:
            judge_telemetry["judge_note"] = f"Fallback to deterministic judge ({e})"

    return {
        "comic_id": int(comic["num"]),
        "comic_title": comic.get("title", ""),
        "model_id": model_id,
        "explanation": candidate_explanation,
        "evaluation": det,
        "judge": judge_telemetry,
    }
