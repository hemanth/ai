import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MODEL_ID, runRealTransformerInference } from './transformer-engine.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8765);

let AutoTokenizer;
let AutoModelForCausalLM;
let Tensor;

try {
  ({ AutoTokenizer, AutoModelForCausalLM, Tensor } = await import('@huggingface/transformers'));
} catch {
  ({ AutoTokenizer, AutoModelForCausalLM, Tensor } = await import(
    '/Users/lika/labs/webml-kit/node_modules/@huggingface/transformers/src/transformers.js'
  ));
}

let tokenizer = null;
let model = null;

async function initModel() {
  console.log(`[Attention 3D] Loading real Transformer ${MODEL_ID}...`);
  const t0 = performance.now();
  tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID);
  model = await AutoModelForCausalLM.from_pretrained(MODEL_ID, { dtype: 'q8' });
  console.log(`[Attention 3D] Loaded ${MODEL_ID} in ${(performance.now() - t0).toFixed(0)}ms`);
}

function wantsMarkdown(acceptHeader) {
  if (!acceptHeader || !acceptHeader.includes('text/markdown')) return false;
  const parts = acceptHeader.split(',').map((p) => p.trim());
  let mdQ = -1;
  let htmlQ = -1;
  for (const part of parts) {
    const [type, ...params] = part.split(';').map((s) => s.trim());
    let q = 1.0;
    for (const param of params) {
      if (param.startsWith('q=')) q = parseFloat(param.slice(2)) || q;
    }
    if (type.toLowerCase() === 'text/markdown') mdQ = q;
    if (type.toLowerCase() === 'text/html') htmlQ = q;
  }
  return mdQ >= 0 && (htmlQ < 0 || mdQ >= htmlQ);
}

const AGENT_LINK_HEADER = [
  '</ai/attention/.well-known/api-catalog>; rel="api-catalog"',
  '</ai/attention/.well-known/agent-skills/index.json>; rel="service-desc"',
  '</ai/attention/.well-known/mcp/server-card.json>; rel="describedby"',
  '</ai/attention/.well-known/agent-card.json>; rel="describedby"',
  '</ai/attention/llms.txt>; rel="describedby"',
  '</ai/attention/.well-known/ai-catalog.json>; rel="ai-catalog"'
].join(', ');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

await initModel();

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Link', AGENT_LINK_HEADER);
    res.setHeader('content-signal', 'ai-train=yes, search=yes, ai-input=yes');
    res.setHeader('Vary', 'Accept');

    if (url.pathname === '/api/infer' || url.pathname === '/ai/attention/api/infer') {
      const text = (url.searchParams.get('text') || 'River water flooded the bank').slice(0, 120);
      const focusParam = url.searchParams.get('focusIdx');
      const preferredFocusIdx = focusParam !== null && focusParam !== '' ? Number(focusParam) : null;
      const result = await runRealTransformerInference({
        tokenizer,
        model,
        Tensor,
        rawText: text,
        preferredFocusIdx
      });
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result));
      return;
    }

    const cleanPath = url.pathname.replace(/^\/ai\/attention/, '') || '/';
    if ((cleanPath === '/' || cleanPath === '/index.html') && wantsMarkdown(req.headers.accept)) {
      const mdPath = path.join(__dirname, 'index.md');
      const htmlPath = path.join(__dirname, 'index.html');
      const mdContent = fs.readFileSync(mdPath, 'utf8');
      const htmlContent = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf8') : '';
      res.writeHead(200, {
        'Content-Type': 'text/markdown; charset=utf-8',
        'x-markdown-tokens': String(Math.ceil(mdContent.length / 4)),
        'x-original-tokens': String(Math.ceil(htmlContent.length / 4))
      });
      res.end(mdContent);
      return;
    }

    const relPath = cleanPath === '/' ? 'index.html' : cleanPath.slice(1);
    const filePath = path.resolve(__dirname, relPath);
    if (!filePath.startsWith(__dirname)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath);
    const baseName = path.basename(filePath);
    const contentType =
      baseName === 'api-catalog'
        ? 'application/linkset+json; charset=utf-8'
        : MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error('[Attention 3D Server Error]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`[Attention 3D] Live Transformer Server listening at http://localhost:${PORT}`);
});
