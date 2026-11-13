# Agent Authentication & Access Policy (`/ai/sysd/`)

## Public Read & Local Execution Access
All resources under `https://h3manth.com/ai/sysd/` — including HTML, negotiated Markdown (`Accept: text/markdown`), static WASM/ONNX modules, Staff-level reference blueprints, and WebMCP browser tools — are publicly accessible without API keys, OAuth tokens, or rate-limit walls. All inference executes 100% locally inside the client runtime.

## Discovery Endpoints
- **API Catalog (RFC 9727)**: `https://h3manth.com/ai/sysd/.well-known/api-catalog`
- **A2A Agent Card (v1.0.0)**: `https://h3manth.com/ai/sysd/.well-known/agent-card.json`
- **MCP Server Card (SEP-1649)**: `https://h3manth.com/ai/sysd/.well-known/mcp/server-card.json`
- **Agent Skills Index (RFC v0.2.0)**: `https://h3manth.com/ai/sysd/.well-known/agent-skills/index.json`
- **OAuth Protected Resource Metadata (RFC 9728)**: `https://h3manth.com/ai/sysd/.well-known/oauth-protected-resource`
- **Web Bot Auth JWKS (RFC 9421)**: `https://h3manth.com/ai/sysd/.well-known/http-message-signatures-directory`

## Content Signals
`content-signal: ai-train=yes, search=yes, ai-input=yes`
