"""CLI Evaluation Runner for XKCD-Bench (Track 1: Explain-Bench & Track 2: Retrieval-Bench)."""

from __future__ import annotations

import asyncio
from typing import Any

from benchmark_suite import (
    BENCHMARK_MODELS,
    REVERSE_SEARCH_BENCHMARK,
    evaluate_explanation_deterministic,
    get_model_explanation_for_comic,
)
from engine import get_comics_metadata, search_bm25, search_hybrid, search_image_phash


async def main() -> None:
    comics = get_comics_metadata()
    iconic_comics = [c for c in comics if c.get("is_iconic")]
    print("=" * 78)
    print(f"XKCD-BENCH EVALUATION SUITE | Corpus: {len(comics)} comics ({len(iconic_comics)} Iconic + {len(comics) - len(iconic_comics)} Recent)")
    print("Dataset Grounding: olivierdehaene/xkcd (2,630 rows) + dchichkov/explainxkcd")
    print("=" * 78)

    # Track 1: Comic Explanation Evaluation across Iconic Comics
    print("\n[TRACK 1] LLM COMIC EXPLANATION BENCHMARK (4-Pillar Rubric vs. ExplainXKCD)")
    print("-" * 78)
    print(f"{'Model':<26} {'Overall':>9} {'Humor':>9} {'Domain':>9} {'Visual':>9} {'Alt-Text':>9} {'Concepts':>9}")
    print("-" * 78)

    for m in BENCHMARK_MODELS:
        mid = m["id"]
        totals = {"overall": 0.0, "humor": 0.0, "domain": 0.0, "visual": 0.0, "alt": 0.0, "concepts": 0.0}
        for c in iconic_comics:
            exp = get_model_explanation_for_comic(c, mid)
            ev = evaluate_explanation_deterministic(c, exp)
            totals["overall"] += ev["overall_score"]
            totals["humor"] += ev["pillars"]["humor"]
            totals["domain"] += ev["pillars"]["domain"]
            totals["visual"] += ev["pillars"]["visual"]
            totals["alt"] += ev["pillars"]["alt_text"]
            totals["concepts"] += ev["concept_recall"]

        n = max(len(iconic_comics), 1)
        print(
            f"{m['name']:<26} "
            f"{totals['overall'] / n:>8.1f}% "
            f"{totals['humor'] / n:>8.1f}% "
            f"{totals['domain'] / n:>8.1f}% "
            f"{totals['visual'] / n:>8.1f}% "
            f"{totals['alt'] / n:>8.1f}% "
            f"{totals['concepts'] / n:>8.1f}%"
        )

    # Track 2: Reverse Comic Search Benchmark (20 Ground-Truth Queries)
    print("\n[TRACK 2] REVERSE COMIC SEARCH BENCHMARK (20 Ground-Truth Queries)")
    print("-" * 78)
    hits_1 = 0
    hits_3 = 0
    hits_5 = 0
    mrr_sum = 0.0
    latencies: list[float] = []

    for q_item in REVERSE_SEARCH_BENCHMARK:
        resp = await search_hybrid(q_item["query"], top_k=5)
        latencies.append(resp["latency_ms"])
        ranked_ids = [int(r["comic_id"]) for r in resp["results"]]
        exp_id = int(q_item["expected_id"])
        rank = (ranked_ids.index(exp_id) + 1) if exp_id in ranked_ids else None
        if rank == 1:
            hits_1 += 1
        if rank is not None and rank <= 3:
            hits_3 += 1
        if rank is not None and rank <= 5:
            hits_5 += 1
        mrr_sum += (1.0 / rank) if rank is not None else 0.0
        status = f"Rank #{rank}" if rank else "MISS"
        print(f"  [{q_item['id']}] {status:<8} Expected #{exp_id:<4} ({q_item['expected_title']:<22}) | {resp['latency_ms']:.2f}ms")

    nq = len(REVERSE_SEARCH_BENCHMARK)
    print("-" * 78)
    print(
        f"Summary ({nq} queries) -> "
        f"Hit@1: {(hits_1 / nq) * 100:.1f}% | "
        f"Hit@3: {(hits_3 / nq) * 100:.1f}% | "
        f"Hit@5: {(hits_5 / nq) * 100:.1f}% | "
        f"MRR@5: {mrr_sum / nq:.3f} | "
        f"Avg Latency: {sum(latencies) / nq:.2f}ms"
    )


if __name__ == "__main__":
    asyncio.run(main())
