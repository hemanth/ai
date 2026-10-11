---
title: "From a Sentence to Attention — Interactive 3D Transformer First Principles"
description: "Interactive 3D WebGL visual explainer of Transformer Self-Attention powered by live DistilGPT-2 ONNX neural inference."
url: "https://h3manth.com/ai/attention/"
author: "Hemanth HM"
model: "Xenova/distilgpt2 (6 layers, 12 heads, 768 dimensions, 50,257 BPE vocabulary)"
---

# From a Sentence to Attention — Interactive 3D First Principles

An interactive two-column 3D WebGL (`Three.js`) and live Transformer (`Xenova/distilgpt2` ONNX Runtime) explainer that builds Self-Attention from the smallest unit (UTF-8 bytes and BPE subword tokens) to a full multi-layer causal language model.

## Live Neural Architecture (`Xenova/distilgpt2`)
- **Layers**: 6 Transformer Decoder blocks
- **Attention Heads**: 12 heads per layer (`d_k = 64`, `d_model = 768`)
- **Vocabulary**: 50,257 GPT-2 BPE subword tokens
- **Inference Engine**: ONNX Runtime (`@huggingface/transformers`) running live on `/api/infer` and in-browser via WebAssembly / WebGPU.

## The 10 First-Principles Stages

### 01 / 10 · The Sentence
Start with any custom sentence (e.g. `"River water flooded the bank"`, `"Vault guards locked the bank"`, `"Astronauts landed on the"`). Click any token chip to focus it and inspect how upstream words disambiguate its meaning.

### 02 / 10 · Tokens (`UTF-8 Bytes → GPT-2 BPE IDs`)
Silicon only computes on numbers. The GPT-2 Byte-Pair Encoding (BPE) tokenizer splits your sentence into subword tokens and looks up each integer ID in the 50,257-entry vocabulary:
- `"River water flooded the bank"` → `[#42204, #1660, #21050, #262, #3331]`
- `"Astronauts landed on the"` → `[#33751·#1313·#17712, #11406, #319, #262]`

### 03 / 10 · Embeddings (`x_i = E[t_i] ∈ ℝ^768`)
Each token ID maps to a 768-dimensional vector projected into 3D space. Because lookup is static, polysemous tokens start uncontextualized between competing semantic basins.

### 04 / 10 · Position (`R(m) · x_m = x_m e^(i m θ)`)
Processing tokens in parallel erases word order. Rotary Position Embedding (RoPE) rotates each token vector along a 3D helix according to its sequence slot `m`.

### 05 / 10 · Query, Key, Value (`q = W_Q x, k = W_K x, v = W_V x`)
Three learned projection matrices split the focused token into a **Query** (what it seeks), a **Key** (what it advertises), and a **Value** (the payload it carries).

### 06 / 10 · Alignment (`s_ij = (q_i · k_j) / √d_k`)
The focused token compares its Query against every upstream token's Key via scaled dot-product alignment on a 3D unit sphere.

### 07 / 10 · Softmax & Causal Mask (`α_ij = softmax(Q K^T / √d_k + M)`)
Softmax converts raw alignment scores into a 100% probability spotlight while the upper-triangular Causal Mask (`-∞`) hides future tokens.

### 08 / 10 · Context Shift (`x'_i = x_i + ∑ α_ij v_j`)
Weighted Value vectors physically pull the uncontextualized Layer-0 embedding along a 3D trajectory into its contextualized Layer-5 representation.

### 09 / 10 · Transformer Block (`y = x + MHA(x) + MLP(x)`)
12 parallel attention heads and a `768 → 3072 → 768` Feed-Forward MLP read from and write back to the Residual Stream highway.

### 10 / 10 · Emergence (`P(next) = softmax(W_U · Block_L(x))`)
Stacking Transformer layers projects the final hidden state onto the 50,257-token vocabulary to predict the next token:
- `"River water flooded the bank"` → `"river"` (54%, logit `-57.98`, BPE `#7850`)
- `"Vault guards locked the bank"` → `"door"` (54%, logit `-57.25`, BPE `#3420`)
- `"Astronauts landed on the"` → `"moon"` (59%, logit `-60.31`, BPE `#8824`)

## Agent & Programmatic Interfaces
- **WebMCP Tool**: `inspect_transformer_attention({ sentence, focusIdx })` registered on `navigator.modelContext`
- **HTTP Inference API**: `GET /api/infer?text=Astronauts+landed+on+the&focusIdx=3`
- **API Catalog (RFC 9727)**: `/ai/attention/.well-known/api-catalog`
- **A2A Agent Card**: `/ai/attention/.well-known/agent-card.json`
- **MCP Server Card**: `/ai/attention/.well-known/mcp/server-card.json`
