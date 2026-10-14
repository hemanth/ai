"""FastAPI server for XKCD-Bench: LLM Comic Explanation & Reverse Comic Search Benchmark."""

from __future__ import annotations

import asyncio
import os
import time
from collections import Counter
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, File, Form, Request, UploadFile
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

from benchmark_suite import (
    BENCHMARK_MODELS,
    RETRIEVAL_LEADERBOARD,
    REVERSE_SEARCH_BENCHMARK,
    evaluate_explanation_deterministic,
    get_cached_comic_evaluation,
    get_explain_leaderboard,
    get_live_eval_data,
    get_model_explanation_for_comic,
    get_retrieval_leaderboard,
)
from engine import (
    EMBED_MODEL,
    IMAGES_DIR,
    IMAGE_COLLECTION,
    TYPESAFE_MODEL,
    embed_image,
    embed_text,
    evaluate_explanation_full,
    generate_live_explanation,
    get_chroma,
    get_comic_by_id,
    get_comics_metadata,
    search_bm25,
    search_chroma,
    search_hybrid,
    search_image_phash,
    search_typesafe,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    comics = get_comics_metadata()
    print(f"XKCD-Bench initialized: {len(comics)} benchmark comics loaded from Hugging Face corpus.")
    yield


app = FastAPI(title="XKCD-Bench — Comic Explanation & Reverse Lookup Evaluation Suite", lifespan=lifespan)
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")


def _extract_keys(request: Request, ts_form: str | None = None, gm_form: str | None = None) -> tuple[str | None, str | None]:
    ts_key = ts_form or request.headers.get("x-typesafe-api-key") or os.getenv("TYPESAFE_API_KEY")
    gm_key = gm_form or request.headers.get("x-gemini-api-key") or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    return ts_key, gm_key


def _extract_all_keys(request: Request) -> dict[str, str | None]:
    return {
        "typesafe": request.headers.get("x-typesafe-api-key") or os.getenv("TYPESAFE_API_KEY"),
        "gemini": request.headers.get("x-gemini-api-key") or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY"),
        "anthropic": request.headers.get("x-anthropic-api-key") or os.getenv("ANTHROPIC_API_KEY"),
        "openrouter": request.headers.get("x-openrouter-api-key") or os.getenv("OPENROUTER_API_KEY"),
    }


@app.api_route("/", methods=["GET", "HEAD"], response_class=HTMLResponse)
async def root():
    return FileResponse("static/index.html")


@app.get("/architecture-diagram.html", response_class=HTMLResponse)
async def serve_arch_diagram():
    return FileResponse("static/architecture-diagram.html")


@app.get("/data/{filename}")
async def serve_data_json(filename: str):
    safe_name = os.path.basename(filename)
    path = os.path.join("data", safe_name)
    if os.path.exists(path):
        return FileResponse(path)
    return JSONResponse({"error": "Data file not found"}, status_code=404)


@app.get("/favicon.ico")
async def favicon():
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">'
        '<rect width="32" height="32" rx="6" fill="#09090B" stroke="#FAFAFA" stroke-width="2"/>'
        '<text x="16" y="21" fill="#FAFAFA" font-family="monospace" font-size="13" font-weight="700" text-anchor="middle">XB</text>'
        '</svg>'
    )
    return HTMLResponse(content=svg, media_type="image/svg+xml")


@app.get("/comics/images/{filename}")
async def serve_comic_image(filename: str):
    safe_name = os.path.basename(filename)
    path = os.path.join(IMAGES_DIR, safe_name)
    if os.path.exists(path):
        return FileResponse(path)
    stem = os.path.splitext(safe_name)[0]
    if stem.isdigit():
        comic = get_comic_by_id(int(stem))
        if comic:
            img_url = comic.get("img_url")
            try:
                import httpx
                async with httpx.AsyncClient(timeout=6.0, follow_redirects=True) as client:
                    resp = await client.get(img_url) if img_url else None
                    if not resp or resp.status_code != 200 or len(resp.content) < 200:
                        info_resp = await client.get(f"https://xkcd.com/{stem}/info.0.json")
                        if info_resp.status_code == 200:
                            real_url = info_resp.json().get("img")
                            if real_url:
                                resp = await client.get(real_url)
                    if resp and resp.status_code == 200 and len(resp.content) > 200:
                        os.makedirs(IMAGES_DIR, exist_ok=True)
                        with open(path, "wb") as f:
                            f.write(resp.content)
                        return FileResponse(path)
            except Exception:
                pass
            if img_url:
                return RedirectResponse(img_url, status_code=307)
        title_esc = (comic.get("title") if comic else f"XKCD #{stem}").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        fallback_svg = (
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200">'
            '<rect width="320" height="200" fill="#ffffff" stroke="#000000" stroke-width="3"/>'
            f'<text x="160" y="90" fill="#000000" font-family="monospace" font-size="16" font-weight="700" text-anchor="middle">XKCD #{stem}</text>'
            f'<text x="160" y="120" fill="#444444" font-family="sans-serif" font-size="13" text-anchor="middle">{title_esc}</text>'
            '</svg>'
        )
        return HTMLResponse(content=fallback_svg, media_type="image/svg+xml")
    return JSONResponse({"error": "Comic image not found"}, status_code=404)


@app.get("/api/keys/status")
async def get_keys_status():
    ts_key = os.getenv("TYPESAFE_API_KEY")
    gm_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    anth_key = os.getenv("ANTHROPIC_API_KEY")
    or_key = os.getenv("OPENROUTER_API_KEY")
    chroma_indexed = False
    try:
        chroma = get_chroma()
        colls = [c.name for c in chroma.list_collections()]
        chroma_indexed = IMAGE_COLLECTION in colls
    except Exception:
        pass

    return {
        "typesafe_configured": bool(ts_key),
        "typesafe_masked": (ts_key[:8] + "..." + ts_key[-4:]) if ts_key and len(ts_key) > 12 else None,
        "gemini_configured": bool(gm_key),
        "gemini_masked": (gm_key[:8] + "..." + gm_key[-4:]) if gm_key and len(gm_key) > 12 else None,
        "anthropic_configured": bool(anth_key),
        "anthropic_masked": (anth_key[:10] + "..." + anth_key[-4:]) if anth_key and len(anth_key) > 14 else None,
        "openrouter_configured": bool(or_key),
        "openrouter_masked": (or_key[:10] + "..." + or_key[-4:]) if or_key and len(or_key) > 14 else None,
        "chroma_indexed": chroma_indexed,
    }


@app.get("/api/overview")
async def get_overview():
    """Return complete XKCD-Bench overview: HF dataset telemetry, empirical leaderboards, and per-comic live matrix."""
    comics = get_comics_metadata()
    domain_counts = Counter(c.get("category", "Science & Culture") for c in comics)
    difficulty_counts = Counter(c.get("difficulty", "Standard") for c in comics)
    iconic_count = sum(1 for c in comics if c.get("is_iconic"))

    live_data = get_live_eval_data()
    explain_lb = get_explain_leaderboard()
    retrieval_lb = get_retrieval_leaderboard()
    comic_evals = live_data.get("comic_evaluations", {})

    default_eval_ids = [327, 2347, 2630, 927, 386, 1838, 882, 1597]
    comic_matrix: dict[str, dict[str, dict[str, Any]]] = {}
    comic_matrix_rows: list[dict[str, Any]] = []
    for cid_val in live_data.get("evaluated_comic_ids", default_eval_ids):
        cid_str = str(cid_val)
        c_obj = get_comic_by_id(int(cid_val))
        if not c_obj:
            continue
        scores_by_model: dict[str, dict[str, Any]] = {}
        for m in explain_lb:
            mid = m["id"]
            entry = comic_evals.get(cid_str, {}).get(mid)
            if entry and entry.get("evaluation"):
                ev = entry["evaluation"]
                cell_payload = {
                    "overall": ev.get("overall_score", 0.0),
                    "overall_score": ev.get("overall_score", 0.0),
                    "humor": ev.get("pillars", {}).get("humor", 0.0),
                    "domain": ev.get("pillars", {}).get("domain", 0.0),
                    "visual": ev.get("pillars", {}).get("visual", 0.0),
                    "alt_text": ev.get("pillars", {}).get("alt_text", 0.0),
                    "concept_recall": ev.get("concept_recall", 0.0),
                    "latency_ms": entry.get("latency_ms", 0.0),
                }
                scores_by_model[mid] = cell_payload
                comic_matrix.setdefault(mid, {})[cid_str] = cell_payload
        comic_matrix_rows.append(
            {
                "comic_id": int(cid_val),
                "title": c_obj.get("title", ""),
                "category": c_obj.get("category", ""),
                "difficulty": c_obj.get("difficulty", ""),
                "scores": scores_by_model,
            }
        )

    return {
        "dataset": {
            "primary_hf": "olivierdehaene/xkcd",
            "secondary_hf": "devparagiri/dataset-xkcd-20250817-072745",
            "total_hf_rows": 2630,
            "loaded_corpus": len(comics),
            "iconic_count": iconic_count,
            "recent_count": len(comics) - iconic_count,
            "domains": dict(domain_counts),
            "difficulties": dict(difficulty_counts),
        },
        "live_eval_meta": {
            "is_live_empirical": bool(comic_evals),
            "evaluated_at": live_data.get("evaluated_at"),
            "evaluation_protocol": live_data.get(
                "evaluation_protocol",
                "Live Blind Multimodal Inference + TypeSafe System One (Noul) + ExplainXKCD Reference Grounding",
            ),
            "evaluated_comic_ids": live_data.get("evaluated_comic_ids", default_eval_ids),
            "comic_matrix": comic_matrix,
            "comic_matrix_rows": comic_matrix_rows,
        },
        "explain_leaderboard": explain_lb,
        "retrieval_leaderboard": retrieval_lb,
        "reverse_queries": REVERSE_SEARCH_BENCHMARK,
    }


@app.get("/api/comics")
async def list_comics(
    domain: str | None = None,
    difficulty: str | None = None,
    iconic_only: bool = False,
    q: str | None = None,
    limit: int = 1000,
):
    comics = get_comics_metadata()
    filtered = []
    q_low = (q or "").strip().lower()

    for c in comics:
        if iconic_only and not c.get("is_iconic"):
            continue
        if domain and domain != "all" and c.get("category") != domain:
            continue
        if difficulty and difficulty != "all" and c.get("difficulty") != difficulty:
            continue
        if q_low:
            blob = f"{c['num']} {c.get('title', '')} {c.get('alt', '')} {' '.join(c.get('key_concepts') or [])}".lower()
            if q_low not in blob:
                continue

        fname = c.get("filename", f"{c['num']}.png")
        filtered.append(
            {
                "num": int(c["num"]),
                "title": c.get("title", ""),
                "alt": c.get("alt", ""),
                "category": c.get("category", ""),
                "difficulty": c.get("difficulty", ""),
                "is_iconic": bool(c.get("is_iconic")),
                "key_concepts": c.get("key_concepts", []),
                "filename": fname,
                "img_url": c.get("img_url", ""),
                "has_local_image": os.path.exists(os.path.join(IMAGES_DIR, fname)),
                "transcript_preview": (c.get("transcript") or "")[:220],
                "explanation_preview": (c.get("explanation") or "")[:260],
            }
        )
        if len(filtered) >= limit:
            break

    return {"total": len(filtered), "comics": filtered}


@app.get("/api/comics/{comic_id}")
async def get_comic_detail(comic_id: int, request: Request):
    """Return full comic detail along with multi-model explanations and their 4-pillar evaluations."""
    comic = get_comic_by_id(comic_id)
    if not comic:
        return JSONResponse({"error": f"Comic #{comic_id} not found in corpus"}, status_code=404)

    models = get_explain_leaderboard()
    model_evaluations = []
    for m in models:
        mid = m["id"]
        cached = get_cached_comic_evaluation(comic_id, mid)
        if cached and cached.get("evaluation"):
            exp_text = cached["explanation"]
            det_eval = cached["evaluation"]
            lat_ms = cached.get("latency_ms", m["avg_latency_ms"])
            is_live = True
        else:
            exp_text = get_model_explanation_for_comic(comic, mid)
            det_eval = evaluate_explanation_deterministic(comic, exp_text)
            lat_ms = m["avg_latency_ms"]
            is_live = False

        model_evaluations.append(
            {
                "model_id": mid,
                "model_name": m["name"],
                "provider": m["provider"],
                "modality": m["modality"],
                "explanation": exp_text,
                "evaluation": det_eval,
                "latency_ms": lat_ms,
                "avg_latency_ms": lat_ms,
                "is_live_empirical": is_live,
                "verified_live": is_live,
            }
        )

    model_evaluations.sort(key=lambda x: x["evaluation"]["overall_score"], reverse=True)

    return {
        "comic": comic,
        "model_evaluations": model_evaluations,
    }


@app.post("/api/explain/eval")
async def evaluate_explanation_endpoint(
    request: Request,
    comic_id: int = Form(...),
    mode: str = Form("model"),  # "model" | "live_gemini" | "custom"
    model_id: str = Form("gemini-4-argon"),
    use_vision: bool = Form(True),
    custom_text: str | None = Form(None),
):
    """Evaluate an explanation on a comic using the 4-pillar rubric + TypeSafe System One Judge."""
    comic = get_comic_by_id(comic_id)
    if not comic:
        return JSONResponse({"error": f"Comic #{comic_id} not found"}, status_code=404)

    all_keys = _extract_all_keys(request)
    ts_key, gm_key = all_keys["typesafe"], all_keys["gemini"]
    models = get_explain_leaderboard()
    generation_meta: dict[str, Any] = {}

    if mode == "live_gemini":
        try:
            gen = await generate_live_explanation(
                comic=comic,
                model_name=model_id,
                use_vision=use_vision,
                gemini_api_key=gm_key,
                anthropic_api_key=all_keys["anthropic"],
                openrouter_api_key=all_keys["openrouter"],
            )
            candidate_text = gen["explanation"]
            generation_meta = {
                "source": "Live Frontier API Inference",
                "model": gen["model"],
                "modality": gen["modality"],
                "generation_latency_ms": gen["latency_ms"],
            }
        except Exception as e:
            return JSONResponse({"error": f"Live generation failed: {e}"}, status_code=500)

    elif mode == "custom":
        if not custom_text or not custom_text.strip():
            return JSONResponse({"error": "Provide custom explanation text to evaluate."}, status_code=400)
        candidate_text = custom_text.strip()
        generation_meta = {
            "source": "Custom / User Input",
            "model": "Custom Submission",
            "modality": "Direct Text",
            "generation_latency_ms": 0.0,
        }
    else:
        cached = get_cached_comic_evaluation(comic_id, model_id)
        model_info = next((m for m in models if m["id"] == model_id), models[0])
        if cached and cached.get("evaluation"):
            return {
                "comic_id": int(comic["num"]),
                "comic_title": comic.get("title", ""),
                "model_id": model_id,
                "explanation": cached["explanation"],
                "evaluation": cached["evaluation"],
                "judge": {
                    "judge_mode": "TypeSafe System One (jev Noul) + ExplainXKCD Reference Grounding (Verified Live Run)",
                    "calibrated": True,
                    "noul_scores": cached["evaluation"].get("typesafe_noul"),
                },
                "generation": {
                    "source": "Empirical Live Benchmark Run",
                    "model": model_info["name"],
                    "provider": model_info["provider"],
                    "modality": model_info["modality"],
                    "generation_latency_ms": cached.get("latency_ms", model_info["avg_latency_ms"]),
                },
            }
        candidate_text = get_model_explanation_for_comic(comic, model_id)
        generation_meta = {
            "source": "XKCD-Bench Corpus",
            "model": model_info["name"],
            "provider": model_info["provider"],
            "modality": model_info["modality"],
            "generation_latency_ms": model_info["avg_latency_ms"],
        }

    eval_result = await evaluate_explanation_full(
        comic=comic,
        candidate_explanation=candidate_text,
        model_id=model_id,
        typesafe_api_key=ts_key,
    )
    eval_result["generation"] = generation_meta
    return eval_result


MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB


@app.post("/api/search")
async def reverse_search_endpoint(
    request: Request,
    file: UploadFile | None = File(None),
    sample_comic_id: int | None = Form(None),
    query: str | None = Form(None),
    engine: str = Form("auto"),
    top_k: int = Form(5),
    model: str | None = Form(None),
):
    """Reverse Comic Search across Text and Image modalities."""
    ts_key, gm_key = _extract_keys(request)
    ts_model = model or TYPESAFE_MODEL
    top_k = max(1, min(top_k, 25))

    try:
        # 1. Image Search (Uploaded file OR sample_comic_id test image)
        image_bytes: bytes | None = None
        mime_type = "image/png"
        if file and file.filename:
            raw_bytes = await file.read(MAX_UPLOAD_BYTES + 1)
            if len(raw_bytes) > MAX_UPLOAD_BYTES:
                return JSONResponse({"error": "Uploaded image exceeds 10 MB limit."}, status_code=413)
            image_bytes = raw_bytes
            mime_type = file.content_type or "image/png"
        elif sample_comic_id is not None:
            sample_comic = get_comic_by_id(sample_comic_id)
            if sample_comic:
                img_path = os.path.join(IMAGES_DIR, sample_comic.get("filename", f"{sample_comic_id}.png"))
                if os.path.exists(img_path):
                    with open(img_path, "rb") as f:
                        image_bytes = f.read()

        if image_bytes is not None:
            # If engine explicitly requests chroma, try EmbeddingGemma 2 / ChromaDB first
            if engine in ("chroma", "rerank"):
                try:
                    t0 = time.perf_counter()
                    vec = embed_image(image_bytes, mime_type=mime_type, api_key=gm_key)
                    results = search_chroma(vec, query_type="image", top_k=top_k)
                    ms = round((time.perf_counter() - t0) * 1000, 1)
                    return {
                        "results": results,
                        "engine": "chroma",
                        "model": EMBED_MODEL,
                        "latency_ms": ms,
                        "has_match_noul": round(results[0]["score"], 4) if results else 0.0,
                    }
                except Exception:
                    pass

            # Default & zero-key fallback: Perceptual Image Fingerprint (dHash-64 + spatial grid)
            return search_image_phash(image_bytes, top_k=top_k)

        # 2. Text Reverse Lookup
        if not query or not query.strip():
            return JSONResponse({"error": "Provide a natural language query or comic image."}, status_code=400)
        q_clean = query.strip()

        if engine == "auto":
            engine = "hybrid" if ts_key else "bm25"

        if engine == "typesafe":
            if ts_key:
                return await search_typesafe(q_clean, top_k=top_k, model=ts_model, api_key=ts_key)
            resp = search_bm25(q_clean, top_k=top_k)
            resp["note"] = "TypeSafe API key not set — executed calibrated BM25F engine."
            return resp

        if engine == "hybrid":
            return await search_hybrid(q_clean, top_k=top_k, model=ts_model, typesafe_api_key=ts_key)

        if engine == "chroma":
            try:
                t0 = time.perf_counter()
                vec = embed_text(q_clean, api_key=gm_key)
                results = search_chroma(vec, query_type="text", top_k=top_k)
                ms = round((time.perf_counter() - t0) * 1000, 1)
                return {
                    "results": results,
                    "engine": "chroma",
                    "model": EMBED_MODEL,
                    "latency_ms": ms,
                    "has_match_noul": round(results[0]["score"], 4) if results else 0.0,
                }
            except Exception as e:
                resp = search_bm25(q_clean, top_k=top_k)
                resp["note"] = f"ChromaDB fallback to BM25F ({e})"
                return resp

        return search_bm25(q_clean, top_k=top_k)

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@app.post("/api/benchmark/run")
async def run_live_benchmark(
    request: Request,
    suite: str = Form("retrieval"),  # "retrieval" | "explain"
    engine: str = Form("auto"),
    limit: int = Form(30),
):
    """Execute a live evaluation sweep on either the Reverse Search Benchmark or Explanation Benchmark."""
    ts_key, gm_key = _extract_keys(request)

    if suite == "explain":
        live_data = get_live_eval_data()
        eval_ids = live_data.get("evaluated_comic_ids", [327, 2347, 2630, 927, 386, 1838, 882, 1597])
        comics = [get_comic_by_id(int(cid)) for cid in eval_ids if get_comic_by_id(int(cid))]
        if not comics:
            comics = [c for c in get_comics_metadata() if c.get("is_iconic")][: min(limit, 20)]
        models = get_explain_leaderboard()
        rows = []
        for c in comics:
            scores_by_model = {}
            for m in models:
                cached = get_cached_comic_evaluation(int(c["num"]), m["id"])
                if cached and cached.get("evaluation"):
                    ev = cached["evaluation"]
                else:
                    exp_text = get_model_explanation_for_comic(c, m["id"])
                    ev = evaluate_explanation_deterministic(c, exp_text)
                scores_by_model[m["id"]] = {
                    "overall": ev["overall_score"],
                    "humor": ev["pillars"]["humor"],
                    "domain": ev["pillars"]["domain"],
                    "visual": ev["pillars"]["visual"],
                    "alt_text": ev["pillars"]["alt_text"],
                    "concept_recall": ev["concept_recall"],
                }
            rows.append(
                {
                    "comic_id": int(c["num"]),
                    "title": c.get("title", ""),
                    "category": c.get("category", ""),
                    "difficulty": c.get("difficulty", ""),
                    "scores": scores_by_model,
                }
            )
        return {
            "suite": "explain",
            "comics_evaluated": len(rows),
            "models": models,
            "rows": rows,
        }

    # Default: Retrieval-Bench sweep across ground-truth queries
    active_engine = engine
    if active_engine == "auto":
        active_engine = "hybrid" if ts_key else "bm25"

    queries = REVERSE_SEARCH_BENCHMARK[: min(limit, len(REVERSE_SEARCH_BENCHMARK))]
    query_results = []
    latencies = []
    hits_at_1 = 0
    hits_at_3 = 0
    hits_at_5 = 0
    reciprocal_ranks = []

    for q_item in queries:
        q_str = q_item["query"]
        expected_id = int(q_item["expected_id"])

        if active_engine == "typesafe" and ts_key:
            resp = await search_typesafe(q_str, top_k=5, api_key=ts_key)
        elif active_engine == "hybrid":
            resp = await search_hybrid(q_str, top_k=5, typesafe_api_key=ts_key)
        else:
            resp = search_bm25(q_str, top_k=5)

        ms = resp["latency_ms"]
        latencies.append(ms)
        res_list = resp.get("results", [])
        ranked_ids = [int(r["comic_id"]) for r in res_list]

        rank = (ranked_ids.index(expected_id) + 1) if expected_id in ranked_ids else None
        if rank == 1:
            hits_at_1 += 1
        if rank is not None and rank <= 3:
            hits_at_3 += 1
        if rank is not None and rank <= 5:
            hits_at_5 += 1
        reciprocal_ranks.append((1.0 / rank) if rank is not None else 0.0)

        top = res_list[0] if res_list else {}
        query_results.append(
            {
                "id": q_item["id"],
                "query": q_str,
                "query_type": q_item["query_type"],
                "domain": q_item["domain"],
                "expected_id": expected_id,
                "expected_title": q_item["expected_title"],
                "predicted_id": top.get("comic_id"),
                "predicted_title": top.get("title"),
                "rank": rank,
                "correct_top1": rank == 1,
                "score": top.get("score"),
                "has_match_noul": resp.get("has_match_noul"),
                "latency_ms": ms,
            }
        )

    n = max(len(queries), 1)
    latencies_sorted = sorted(latencies)
    return {
        "suite": "retrieval",
        "engine": active_engine,
        "model": resp.get("model", active_engine) if queries else active_engine,
        "queries_count": len(queries),
        "hit_at_1": round((hits_at_1 / n) * 100, 1),
        "hit_at_3": round((hits_at_3 / n) * 100, 1),
        "hit_at_5": round((hits_at_5 / n) * 100, 1),
        "mrr_at_5": round(sum(reciprocal_ranks) / n, 3),
        "avg_latency_ms": round(sum(latencies) / n, 2) if latencies else 0.0,
        "p50_latency_ms": latencies_sorted[len(latencies_sorted) // 2] if latencies_sorted else 0.0,
        "min_latency_ms": latencies_sorted[0] if latencies_sorted else 0.0,
        "max_latency_ms": latencies_sorted[-1] if latencies_sorted else 0.0,
        "queries": query_results,
    }


@app.post("/api/index")
async def build_index_endpoint(request: Request):
    _, gm_key = _extract_keys(request)
    try:
        from index_comics import index_comics

        loop = asyncio.get_running_loop()
        indexed = await loop.run_in_executor(None, index_comics, gm_key)
        return {"success": True, "indexed": indexed}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8080"))
    uvicorn.run(app, host="0.0.0.0", port=port)
