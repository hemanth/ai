# Agent Authentication & Access Policy (`/ai/attention/`)

## Public Read & Inference Access
All resources under `https://h3manth.com/ai/attention/` — including HTML, negotiated Markdown (`Accept: text/markdown`), static ONNX modules, and WebMCP browser tools — are publicly accessible without API keys or bearer tokens.

## Discovery Endpoints
- **API Catalog (RFC 9727)**: `https://h3manth.com/ai/attention/.well-known/api-catalog`
- **OAuth Protected Resource Metadata (RFC 9728)**: `https://h3manth.com/ai/attention/.well-known/oauth-protected-resource`
- **Web Bot Auth JWKS (RFC 9421)**: `https://h3manth.com/ai/attention/.well-known/http-message-signatures-directory`

## Content Signals
`content-signal: ai-train=yes, search=yes, ai-input=yes`
