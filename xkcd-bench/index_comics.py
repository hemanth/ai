"""Index XKCD benchmark comics into ChromaDB using EmbeddingGemma 2 (google/embeddinggemma-2) or Gemini Multimodal Embeddings."""

from __future__ import annotations

import os
import time

from engine import (
    IMAGES_DIR,
    IMAGE_COLLECTION,
    TEXT_COLLECTION,
    embed_image,
    embed_text,
    get_chroma,
    get_comics_metadata,
)


def index_comics(api_key: str | None = None) -> int:
    comics = get_comics_metadata()
    if not comics:
        raise ValueError("No comics found in comics/metadata.json. Run fetch_xkcd.py first.")

    chroma = get_chroma()
    img_col = chroma.get_or_create_collection(IMAGE_COLLECTION, metadata={"hnsw:space": "cosine"})
    txt_col = chroma.get_or_create_collection(TEXT_COLLECTION, metadata={"hnsw:space": "cosine"})

    indexed = 0
    for c in comics:
        cid = str(c["num"])
        img_path = os.path.join(IMAGES_DIR, c.get("filename", f"{cid}.png"))
        if not os.path.exists(img_path):
            continue

        meta = {
            "title": c.get("title", ""),
            "alt": (c.get("alt") or "")[:500],
            "category": c.get("category", ""),
            "transcript": (c.get("transcript") or "")[:1000],
            "explanation": (c.get("explanation") or "")[:1000],
            "filename": c.get("filename", f"{cid}.png"),
        }

        with open(img_path, "rb") as f:
            img_vec = embed_image(f.read(), api_key=api_key)
        img_col.upsert(ids=[cid], embeddings=[img_vec], metadatas=[meta])

        title = c.get("title", "") or "none"
        content = f"{c.get('alt', '')}. {c.get('transcript', '')[:600]} {c.get('explanation', '')[:600]}"
        text_blob = f"title: {title} | text: {content}"
        txt_vec = embed_text(text_blob, api_key=api_key, prompt_name="Document")
        txt_col.upsert(ids=[cid], embeddings=[txt_vec], metadatas=[meta])

        indexed += 1
        time.sleep(0.05)

    return indexed


if __name__ == "__main__":
    count = index_comics()
    print(f"Indexed {count} comics into ChromaDB.")
