---
name: inspect-attention
description: Inspect GPT-2 BPE token IDs, 768-D embeddings, Leave-One-Out causal attention Softmax weights, and top-4 next-token vocabulary logits for any sentence.
---

# Inspect Transformer Attention

## Usage

### 1. In-Browser WebMCP (`navigator.modelContext`)
Call the registered `inspect_transformer_attention` tool or `window.__attentionInspector.setSentence(sentence, focusIdx)`.

### 2. HTTP / Markdown Negotiation
- Request `Accept: text/markdown` on `https://h3manth.com/ai/attention/` for full Markdown documentation.
- Query `/ai/attention/api/infer?text=Astronauts+landed+on+the&focusIdx=3` when running against the Node ONNX server.
