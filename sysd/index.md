---
title: "sysd — Local-First Distributed Systems Workbench"
description: "Sketch distributed systems topologies on Excalidraw and defend Staff-level trade-offs with live scene-graph diagnostics, 11 reference blueprints, Free-Flow practice, Cactus Needle 3 + Whistle WASM, and Kokoro neural TTS."
url: "https://h3manth.com/ai/sysd/"
image: "https://h3manth.com/ai/sysd/og-image.png"
author: "Hemanth HM"
repository: "https://github.com/hemanth/sysd"
---

# sysd — Distributed Systems Workbench

**sysd** (`https://h3manth.com/ai/sysd/`) is a 100% client-side system design workbench pairing an **Excalidraw** architecture whiteboard with a live **scene-graph topology parser**, **11 Staff-level reference blueprints**, unscripted **Free-Flow practice**, and **opaque on-device WASM/WebGPU intelligence**.

## Core Capabilities

- **Live Scene-Graph Topology Diagnostics**: Parses Excalidraw shapes, bound labels, directed arrows, and inline capacity math into a typed `TopologyGraph`. Flags structural anti-patterns in real time (`Client -> Primary DB`, missing presigned object-store offload, synchronous fan-out bottlenecks, orphaned stores).
- **Structured 4-Phase Mock Pacing (`35m`) + Free-Flow Mode**:
  - `01 Scope (5m)` -> `02 Contracts (5m)` -> `03 Topology (12m)` -> `04 Deep Dive (13m)` with 1-click SLA, CAP (`CP` / `AP`), and wire-protocol commitments.
  - `00 Free-Flow Architecture Canvas`: Open-ended practice with custom system prompts and 1-click failure/scale drills.
- **11 Canonical Archetypes + 1-Click Reference Topologies**:
  1. `seat-ticketing` — High-Demand Seat Ticketing (Virtual waiting room + Redis Lua hold TTL + Postgres CP fencing)
  2. `social-timeline` — Sub-200ms Social Timeline (Hybrid push fan-out for normal graphs + pull merge for >50k-follower celebrities)
  3. `cloud-file-sync` — Chunked Cloud File Sync (4 MB Content-Defined Chunking + SHA-256 dedup + presigned S3 PUT/GET)
  4. `ride-dispatch` — Real-Time Geospatial Dispatch (Sharded H3/Geohash RAM index + Redis Geo + fenced driver claim)
  5. `edge-rate-limiter` — Distributed API Rate Limiter (Edge sliding window + Redis Lua token-bucket + fail-open local quota)
  6. `realtime-chat` — Low-Latency Encrypted Chat (Stateful WebSocket gateways + session registry + per-conversation sequence inbox)
  7. `stream-aggregator` — Streaming Telemetry Aggregator (Partitioned Kafka log + Flink event-time watermarks + ClickHouse rollups)
  8. `code-runner` — Sandboxed Code Judge Engine (SQS/Kafka queue + rootless Firecracker microVMs + deterministic output hash)
  9. `url-shortener` — Global URL Shortener & Redirector (Range-allocated Base62 IDs + Edge/Redis 100:1 read cache + async analytics)
  10. `web-crawler` — Polite Planet-Scale Web Crawler (Domain-sharded politeness frontier + DNS cache + SimHash near-dedup)
  11. `post-search` — Real-Time Inverted Index Search (Document-partitioned NVMe/RAM inverted index shards + scatter-gather aggregator)

## On-Device AI & Voice Stack (Zero Server Calls)

- **Cactus Needle 3 (`35.3 MB` WASM)**: Grammar-constrained whiteboard tool calling (`add_component`, `connect_components`, `set_stage`, `select_challenge`, `control_timer`, `clear_board`), structured SLA/CAP signal extraction, and `3072-d` Playbook semantic matching.
- **Cactus Whistle (`16.9 MB` WASM) + `wasm-vad`**: `16 kHz` `AudioWorklet` speech-to-text with Aho-Corasick vocabulary biasing toward distributed-systems terminology and live Excalidraw box labels.
- **Kokoro-82M v1.0 (`kokoro-js` WebGPU `fp32` / WASM `q8`)**: Natural `24 kHz` neural text-to-speech (`af_heart`) with instant `wasm-vad` barge-in cutoff.
- **Socratic Coach LLM**: Auto-selects Chrome Built-in Gemini Nano (`window.LanguageModel`) or cached WebLLM WebGPU (`Qwen 2.5 1.5B` / `Llama 3.2 1B`), backed by a `<5 ms` deterministic graph coach.

## Agent & Programmatic Interfaces

- **WebMCP Browser Tools (`navigator.modelContext`)**:
  - `list_sysd_archetypes({ category })`
  - `get_sysd_reference_solution({ challengeId })`
  - `stamp_sysd_topology({ challengeId, customTopic, stampReference })`
- **API Catalog (RFC 9727)**: `https://h3manth.com/ai/sysd/.well-known/api-catalog`
- **A2A Agent Card**: `https://h3manth.com/ai/sysd/.well-known/agent-card.json`
- **MCP Server Card**: `https://h3manth.com/ai/sysd/.well-known/mcp/server-card.json`
- **Source Code**: `https://github.com/hemanth/sysd`
