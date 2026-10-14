"""Automated test suite for XKCD-Bench API, Rubric Scorer, Retrieval Engine, and Security."""

from __future__ import annotations

import io
import unittest
from fastapi.testclient import TestClient

from app import MAX_UPLOAD_BYTES, app
from benchmark_suite import (
    REVERSE_SEARCH_BENCHMARK,
    evaluate_explanation_deterministic,
    get_explain_leaderboard,
)
from engine import get_comic_by_id, search_bm25, search_image_phash


class XKCDBenchTestSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.client = TestClient(app)

    def test_overview_contract_and_comic_matrix(self) -> None:
        resp = self.client.get("/api/overview")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()

        # Verify corpus expansion to 891 comics cross-joined from olivierdehaene/xkcd + devparagiri/dataset-xkcd
        self.assertEqual(data["dataset"]["loaded_corpus"], 891)
        self.assertEqual(data["dataset"]["primary_hf"], "olivierdehaene/xkcd")
        self.assertIn("devparagiri/dataset-xkcd", data["dataset"]["secondary_hf"])

        # Verify Track 1 Leaderboard has 15 frontier models, Gemini 4 Argon #1, and no Llama 4 Maverick
        lb = data["explain_leaderboard"]
        self.assertEqual(len(lb), 15)
        self.assertEqual(lb[0]["id"], "gemini-4-argon")
        model_ids = {m["id"] for m in lb}
        self.assertIn("gemini-4-argon", model_ids)
        self.assertIn("claude-fable-5-1", model_ids)
        self.assertIn("gemini-3.7-flash", model_ids)
        self.assertIn("gemma-4-31b-it", model_ids)
        self.assertIn("nvidia/nemotron-3-ultra-550b-a55b:free", model_ids)
        self.assertNotIn("meta-llama/llama-4-maverick", model_ids)

        # Verify domain_scores exist for UI filter pills
        for m in lb:
            self.assertIn("domain_scores", m)
            self.assertIn("Computer Science & Security", m["domain_scores"])
            self.assertIn("AI & Machine Learning", m["domain_scores"])
            self.assertIn("Mathematics & Statistics", m["domain_scores"])

        # Verify Per-Comic Matrix matches frontend contract across all 8 canonical comics
        matrix = data["live_eval_meta"]["comic_matrix"]
        self.assertIsInstance(matrix, dict)
        self.assertIn("gemini-4-argon", matrix)
        for cid in ("327", "2347", "2630", "927", "386", "1838", "882", "1597"):
            self.assertIn(cid, matrix["gemini-4-argon"])
            cell = matrix["gemini-4-argon"][cid]
            self.assertGreater(cell["overall_score"], 0.0)

    def test_ui_medals_and_header_cleanliness(self) -> None:
        resp = self.client.get("/")
        self.assertEqual(resp.status_code, 200)
        html = resp.text
        self.assertIn("medal-gold", html)
        self.assertIn("medal-silver", html)
        self.assertIn("medal-bronze", html)
        self.assertIn("renderMedalSvg", html)
        self.assertNotIn("HF: olivierdehaene/xkcd", html)
        self.assertIn("Can AI actually get the joke, or just recite the punchline?", html)
        self.assertIn('<span class="brand-tag">v1</span>', html)
        self.assertIn('data-view="architecture"', html)
        self.assertIn('id="view-architecture"', html)
        self.assertIn('id="xkcd-arch-title"', html)
        self.assertIn('id="input-typesafe-key"', html)
        self.assertIn('id="input-gemini-key"', html)
        self.assertIn('id="input-anthropic-key"', html)
        self.assertIn('id="input-openrouter-key"', html)

        keys_resp = self.client.get("/api/keys/status")
        self.assertEqual(keys_resp.status_code, 200)
        keys_json = keys_resp.json()
        for k in ("typesafe_configured", "gemini_configured", "anthropic_configured", "openrouter_configured"):
            self.assertIn(k, keys_json)

        arch_resp = self.client.get("/static/architecture-diagram.html")
        self.assertEqual(arch_resp.status_code, 200)
        self.assertIn("xkcd-arch-title", arch_resp.text)

    def test_comic_detail_live_telemetry_contract(self) -> None:
        # On #2347 (Dependency), all 15 frontier models completed live blind evaluations
        resp_2347 = self.client.get("/api/comics/2347")
        self.assertEqual(resp_2347.status_code, 200)
        data_2347 = resp_2347.json()
        self.assertEqual(data_2347["comic"]["num"], 2347)
        evals_2347 = data_2347["model_evaluations"]
        self.assertEqual(len(evals_2347), 15)
        for item in evals_2347:
            self.assertTrue(item["is_live_empirical"])
            self.assertTrue(item["verified_live"])
            self.assertGreater(item["latency_ms"], 0)
            self.assertGreater(len(item["explanation"]), 100)

        # On #327 (Exploits of a Mom), 14 frontier models are live empirical, and any uncached model reports is_live_empirical=False
        resp_327 = self.client.get("/api/comics/327")
        self.assertEqual(resp_327.status_code, 200)
        evals_327 = resp_327.json()["model_evaluations"]
        live_count = sum(1 for item in evals_327 if item["is_live_empirical"])
        self.assertGreaterEqual(live_count, 14)
        argon = next(item for item in evals_327 if item["model_id"] == "gemini-4-argon")
        self.assertTrue(argon["is_live_empirical"])
        self.assertGreater(argon["evaluation"]["overall_score"], 70.0)

    def test_custom_explanation_grading_and_validation(self) -> None:
        # Empty custom explanation should return 400
        bad = self.client.post("/api/explain/eval", data={"comic_id": 327, "mode": "custom", "custom_text": "   "})
        self.assertEqual(bad.status_code, 400)

        # Valid custom explanation should return 4-pillar scores and concept hits
        good = self.client.post(
            "/api/explain/eval",
            data={
                "comic_id": 327,
                "mode": "custom",
                "custom_text": (
                    "This comic is a joke about SQL injection and database sanitization. "
                    "Mrs. Roberts named her son Robert'); DROP TABLE Students;-- (Bobby Tables), "
                    "which causes the school database to execute DROP TABLE Students when his name is entered "
                    "unsanitized. The alt-text adds a secondary joke about her daughter named Help I'm trapped "
                    "in a driver's license factory."
                ),
            },
        )
        self.assertEqual(good.status_code, 200)
        payload = good.json()
        self.assertGreater(payload["evaluation"]["overall_score"], 60.0)
        self.assertGreater(payload["evaluation"]["concept_recall"], 50.0)

    def test_reverse_search_text_and_image_and_upload_limit(self) -> None:
        # Missing query & image -> 400
        empty_resp = self.client.post("/api/search", data={"engine": "bm25"})
        self.assertEqual(empty_resp.status_code, 400)

        # Text BM25 search for #2347 Dependency
        txt_resp = self.client.post(
            "/api/search",
            data={
                "engine": "bm25",
                "query": "tower of blocks modern digital infrastructure held up by one guy in Nebraska",
                "top_k": 3,
            },
        )
        self.assertEqual(txt_resp.status_code, 200)
        res = txt_resp.json()["results"]
        self.assertEqual(res[0]["comic_id"], 2347)

        # Sample image pHash search for #327
        img_resp = self.client.post("/api/search", data={"sample_comic_id": 327, "top_k": 3})
        self.assertEqual(img_resp.status_code, 200)
        self.assertEqual(img_resp.json()["results"][0]["comic_id"], 327)

        # Comic image serves cached local PNG (200) or redirects to official xkcd img_url (307)
        redir_resp = self.client.get("/comics/images/340.png", follow_redirects=False)
        self.assertIn(redir_resp.status_code, (200, 307))

        # Oversized upload (>10 MB) -> 413
        oversized = io.BytesIO(b"x" * (MAX_UPLOAD_BYTES + 1024))
        big_resp = self.client.post(
            "/api/search",
            files={"file": ("huge.png", oversized, "image/png")},
        )
        self.assertEqual(big_resp.status_code, 413)

    def test_benchmark_queries_integrity(self) -> None:
        # Ensure all 30 ground-truth queries resolve to existing comics in the 891-comic corpus
        self.assertEqual(len(REVERSE_SEARCH_BENCHMARK), 30)
        for q in REVERSE_SEARCH_BENCHMARK:
            comic = get_comic_by_id(int(q["expected_id"]))
            self.assertIsNotNone(comic, f"Missing expected comic for {q['id']}: #{q['expected_id']}")
            self.assertEqual(comic["title"], q["expected_title"])


if __name__ == "__main__":
    unittest.main()
