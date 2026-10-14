# XKCD-Bench

> Multimodal benchmark and interactive studio for evaluating LLMs on explaining XKCD comics and performing calibrated reverse comic search.

Built on top of the Hugging Face datasets [`olivierdehaene/xkcd`](https://huggingface.co/datasets/olivierdehaene/xkcd) (2,630 comics with full transcripts and human-curated ExplainXKCD explanations) and [`dchichkov/explainxkcd`](https://huggingface.co/datasets/dchichkov/explainxkcd).

---

## Architecture & Evaluation Tracks

### Track 1: Comic Explanation Benchmark (`Explain-Bench`)
Evaluates how well language and vision-language models explain an XKCD comic compared against human-annotated **ExplainXKCD** references across four calibrated rubric pillars:

1. **Humor & Punchline (`30%`)** — Captures the comedic subversion, irony, or timing.
2. **Domain & Technical Depth (`30%`)** — Identifies the exact computer science, physics, math, or statistical mechanism (e.g., SQL injection in `#327`, p-hacking with 20 jelly bean colors in `#882`, open-source supply chain fragility in `#2347`, cetacean comparative anatomy in `#2630`).
3. **Visual & Panel Grounding (`20%`)** — Accurately references the visual layout, stick-figure actions, or diagrams without hallucination.
4. **Alt-Text Synthesis (`20%`)** — Connects the secondary joke in the mouseover `title-text` (`alt`) to the main strip.

Supports both **Deterministic Reference & Canonical Concept Recall Scoring** (zero API keys required) and **Calibrated AI Judge Verification** via **TypeSafe AI System One (`Jev`)** (`Noul` pillar probabilities) and **Gemini Multimodal Vision**.

### Track 2: Reverse Comic Search Benchmark (`Retrieval-Bench`)
Evaluates retrieval accuracy (`Hit@1`, `Hit@3`, `Hit@5`, `MRR@10`, `Calibration ECE`, and `P50 Latency`) across 20 ground-truth queries spanning four cognitive recall styles:
- **Technical Concept** (*"school calls mom because she named her son Robert DROP TABLE Students"*)
- **Vague Memory** (*"staying up late at computer because someone is wrong on the internet"*)
- **Visual Layout** (*"huge tower of blocks representing all modern digital infrastructure held up by one tiny block in Nebraska"*)
- **Punchline / Alt-Text** (*"there are 14 competing standards so let us create one universal standard and now there are 15"*)
- **Visual Image Reverse Lookup** — Perceptual 64-bit `dHash` + `aHash` + spatial ink-density fingerprinting (`<5ms`, zero-key) and `google/embeddinggemma-2` (EmbeddingGemma 2) / `gemini-embedding-2-preview` multimodal vector search.

---

## Quickstart

```bash
# 1. Build/refresh the benchmark corpus from Hugging Face (20 Iconic + 50 Recent comics)
.venv/bin/python fetch_xkcd.py 50

# 2. Run the CLI evaluation suite
.venv/bin/python run_benchmark.py

# 3. Start the interactive XKCD-Bench Web Studio (http://localhost:8080)
.venv/bin/python app.py
```
