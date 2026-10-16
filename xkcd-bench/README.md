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

## Live Benchmark Leaderboard (20 Canonical Iconic Comics · 16 Frontier Models)

Live studio: **[h3manth.com/ai/xkcd-bench](https://h3manth.com/ai/xkcd-bench/)** · Architecture Diagram: **[architecture-diagram.html](https://h3manth.com/ai/xkcd-bench/architecture-diagram.html)**

Evaluated across all 20 canonical iconic XKCD strips (`#149, #208, #303, #327, #353, #386, #552, #882, #927, #979, #1053, #1172, #1205, #1319, #1513, #1597, #1838, #2173, #2347, #2630` — 320 live evaluations):

| Rank | Model | Provider | Overall | Humor (30%) | Technical (30%) | Visual (20%) | Alt-Text (20%) | Latency |
| ---: | :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | **Gemini 4 Argon** | Google DeepMind | **85.2%** | 76.2% | 91.6% | 93.4% | 80.6% | 18,358ms |
| 2 | **Claude Fable 5.1** | Anthropic | **85.1%** | 77.7% | 94.3% | 86.2% | 81.4% | 19,212ms |
| 3 | **Claude Opus 5** | Anthropic | **84.9%** | 77.9% | 93.4% | 92.6% | 75.0% | 9,505ms |
| 4 | **Claude Opus 5.5** | Anthropic | **84.5%** | 77.5% | 92.1% | 87.9% | 80.2% | 21,984ms |
| 5 | **Claude Sonnet 5.5** | Anthropic | **83.9%** | 75.8% | 90.0% | 91.0% | 79.9% | 7,187ms |
| 6 | **Gemini 3.1 Pro** | Google DeepMind | **82.1%** | 76.0% | 87.0% | 91.8% | 74.1% | 22,557ms |
| 7 | **Gemini 3.8 Flash** | Google DeepMind | **82.0%** | 75.8% | 88.2% | 89.2% | 74.8% | 16,690ms |
| 8 | **Gemini 3.7 Flash** | Google DeepMind | **82.0%** | 75.7% | 86.9% | 92.0% | 73.9% | 12,188ms |
| 9 | **Claude Opus 4.6** | Anthropic | **81.2%** | 72.1% | 85.7% | 87.6% | 81.7% | 13,560ms |
| 10 | **Claude Opus 4.8** | Anthropic | **81.0%** | 72.3% | 87.7% | 84.5% | 80.4% | 10,879ms |
| 11 | **Gemini 2.5 Pro** | Google DeepMind | **80.3%** | 74.0% | 84.9% | 90.0% | 73.0% | 23,551ms |
| 12 | **NVIDIA Nemotron 3.5 Super VL** *(Open)* | NVIDIA | **78.0%** | 73.0% | 83.2% | 87.1% | 68.7% | 32,747ms |
| 13 | **Gemma 4 31B IT** *(Open)* | Google Open | **74.7%** | 71.0% | 81.0% | 82.8% | 62.6% | 27,828ms |
| 14 | **Gemma 4 26B A4B MoE** *(Open)* | Google Open | **73.2%** | 69.8% | 78.6% | 81.0% | 62.4% | 20,762ms |
| 15 | **NVIDIA Nemotron 3 Ultra 550B** *(Open)* | NVIDIA | **69.7%** | 68.2% | 74.3% | 74.9% | 59.8% | 28,950ms |
| 16 | **GPT-6 Luna** | OpenAI (via OR) | **59.8%** | 65.1% | 65.5% | 52.8% | 50.5% | 19,225ms |

---

## Quickstart

```bash
# 1. Build/refresh the benchmark corpus from Hugging Face (20 Iconic + 50 Recent comics)
.venv/bin/python fetch_xkcd.py 50

# 2. Run the 20-comic live multimodal evaluation suite across all 16 models
.venv/bin/python run_live_evals.py

# 3. Run the CLI evaluation suite & unit tests
.venv/bin/python run_benchmark.py
.venv/bin/python -m unittest test_xkcd_bench.py -v

# 4. Start the interactive XKCD-Bench Web Studio (http://localhost:8080)
.venv/bin/python app.py
```

