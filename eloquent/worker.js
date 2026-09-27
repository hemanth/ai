import { createModelCache, isModelCached } from "./model-cache.js?v=34";

/**
 * Web Worker — Pure On-Device Pipeline
 *
 * Models:
 *   - ASR: onnx-community/moonshine-base-ONNX (~247 MB fp32)
 *   - Normalizer & Transforms: onnx-community/s1-mini-ONNX (~355–403 MB GPU weights, Superwhisper S1-mini)
 *
 * Message protocol:
 *   loading → progress → warmup → ready
 *   transcribe(audio) → start → raw → token → complete
 *   generate({ mode, text }) → start → token → complete
 */

const TJS = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0";

const ASR_MODEL = "onnx-community/moonshine-base-ONNX";
const NORMALIZER_MODEL = "onnx-community/s1-mini-ONNX";
const MODEL_REVISIONS = {
  [ASR_MODEL]: "b1e9b6aae3c3c7298f10c3798393fdf38e8fbbad",
  [NORMALIZER_MODEL]: "545466fa40a4c79f4063cf5359df037dee8f2c8d",
};

const S1_SYSTEM_PROMPT =
  "You are a text normalizer for speech-to-text transcripts. The input begins " +
  "with a control line specifying the styling, structure, and context settings; " +
  "clean the transcript to match those settings and output only the cleaned text.";

const S1_CONTROL_LINES = {
  polish: "[Styling: Standard] [Structure: Prose] [Context: General]",
  formal: "[Styling: Formal] [Structure: Prose] [Context: General]",
  keypoints: "[Styling: Standard] [Structure: Lists] [Context: General]",
  short: "[Styling: Concise] [Structure: Prose] [Context: General]",
};

let transcriber = null;
let normalizer = null;

let loadingASR = null;
let loadingNormalizer = null;
let backend = null;
const modelCache = createModelCache();

async function runtime() {
  const transformers = await import(TJS);
  transformers.env.allowLocalModels = false;
  transformers.env.useBrowserCache = true;
  transformers.env.useCustomCache = true;
  transformers.env.customCache = modelCache;
  // Static mobile hosting is usually not cross-origin isolated.
  if (!self.crossOriginIsolated) transformers.env.backends.onnx.wasm.numThreads = 1;
  return transformers;
}

async function detectBackend() {
  if (backend) return backend;
  try {
    const adapter = await navigator.gpu?.requestAdapter();
    if (adapter) {
      backend = { device: "webgpu", dtype: adapter.features.has("shader-f16") ? "q4f16" : "q4" };
      return backend;
    }
  } catch {}
  backend = { device: "wasm", dtype: "q8" };
  return backend;
}

function progressCallback(model) {
  return info => {
    if (info.status === "progress" && info.file) {
      self.postMessage({ type: "progress", data: {
        model, file: info.file, loaded: info.loaded || 0, total: info.total || 0,
      } });
    }
  };
}

async function createModel(task, model, warmup) {
  const { pipeline } = await runtime();
  const preferred = await detectBackend();
  // This S1 export uses GatherBlockQuantized, unsupported by the WASM runtime.
  // Do not download its much larger q8 weights only to fail session creation.
  if (model === NORMALIZER_MODEL && preferred.device !== "webgpu") {
    throw new Error("Polishing requires working WebGPU in this browser. Transcription is still available.");
  }
  const attempts = preferred.device === "webgpu" && model === ASR_MODEL
    ? [preferred, { device: "wasm", dtype: "q8" }] : [preferred];
  for (let i = 0; i < attempts.length; i++) {
    const { device, dtype } = attempts[i];
    let candidate;
    try {
      const cached = await isModelCached(model);
      self.postMessage({ type: "model-status", data: { model, message:
        model === ASR_MODEL
          ? (cached ? "Restoring speech recognition from device storage…" : "Loading speech recognition…")
          : (cached ? "Restoring polishing model from device storage…" : "Loading polishing model for the first time…") } });
      candidate = await pipeline(task, model, {
        device,
        revision: MODEL_REVISIONS[model],
        // Keep ASR fp32: quantized Moonshine can fail on missing QDQ scales.
        dtype: model === ASR_MODEL ? "fp32" : dtype,
        progress_callback: progressCallback(model),
      });
      self.postMessage({ type: "warmup", data: { model } });
      await warmup(candidate);
      return candidate;
    } catch (error) {
      // Release successfully constructed sessions before trying another backend.
      try { await candidate?.dispose(); } catch {}
      if (i === attempts.length - 1) throw error;
      self.postMessage({ type: "model-status", data: { model,
        message: "Trying CPU compatibility mode. This may take longer…" } });
    }
  }
}

function ensureTranscriber() {
  if (transcriber) return Promise.resolve(transcriber);
  if (!loadingASR) {
    loadingASR = createModel("automatic-speech-recognition", ASR_MODEL,
      model => model(new Float32Array(16000), { max_new_tokens: 1 }))
      .then(model => (transcriber = model))
      .finally(() => { loadingASR = null; });
  }
  return loadingASR;
}

function ensureNormalizer() {
  if (normalizer) return Promise.resolve(normalizer);
  if (!loadingNormalizer) {
    loadingNormalizer = createModel("text-generation", NORMALIZER_MODEL, model => model([
      { role: "system", content: S1_SYSTEM_PROMPT },
      { role: "user", content: `${S1_CONTROL_LINES.polish}\nhello world` },
    ], { max_new_tokens: 2, do_sample: false,
      tokenizer_encode_kwargs: { enable_thinking: false } }))
      .then(model => (normalizer = model))
      .finally(() => { loadingNormalizer = null; });
  }
  return loadingNormalizer;
}

async function loadModels() {
  const cached = await isModelCached(ASR_MODEL);
  self.postMessage({ type: "loading", data: { cached } });
  try {
    await ensureTranscriber();
    self.postMessage({ type: "ready", data: { transcriptionOnly: true } });
  } catch (err) {
    self.postMessage({ type: "error", data: { message: err.message || String(err) } });
  }
}

/**
 * Transcribe audio using Moonshine Base and normalize using S1-mini
 * @param {Object} data - { audio: Float32Array }
 */
async function transcribe({ audio }) {
  if (!transcriber) {
    self.postMessage({ type: "error", data: { message: "Models not ready." } });
    return;
  }

  try {
    self.postMessage({ type: "start" });
    self.postMessage({ type: "phase", data: { phase: "transcribing" } });

    // Step 1: Moonshine ASR Transcription
    const maxAsrTokens = Math.max(6, Math.floor(audio.length / 16000) * 6);
    const asrResult = await transcriber(audio, { max_new_tokens: maxAsrTokens });
    const rawTranscript = (
      typeof asrResult === "string" ? asrResult : asrResult?.text || ""
    ).trim();

    if (!rawTranscript) {
      self.postMessage({ type: "complete" });
      return;
    }

    // Emit raw ASR transcript to frontend for immediate display
    self.postMessage({ type: "raw", data: { rawText: rawTranscript } });
    self.postMessage({ type: "phase", data: { phase: "polishing" } });

    // Step 2: Inverse Text Normalization via Superwhisper S1-mini
    let streamedTokens = "";
    try {
      await ensureNormalizer();
      const transformers = await import(TJS);
      const { TextStreamer } = transformers;

      const streamer = new TextStreamer(normalizer.tokenizer, {
        skip_prompt: true,
        skip_special_tokens: true,
        callback_function: (token) => {
          streamedTokens += token;
          self.postMessage({ type: "token", data: { token } });
        },
      });

      const messages = [
        { role: "system", content: S1_SYSTEM_PROMPT },
        { role: "user", content: `${S1_CONTROL_LINES.polish}\n${rawTranscript}` },
      ];

      const tokenizedRaw = normalizer.tokenizer(rawTranscript);
      const inputTokens = tokenizedRaw?.input_ids?.size ?? tokenizedRaw?.input_ids?.dims?.at(-1) ?? 128;
      const maxNewTokens = Math.min(1024, Math.max(64, Math.ceil(inputTokens * 1.3) + 32));

      const out = await normalizer(messages, {
        max_new_tokens: maxNewTokens,
        do_sample: false,
        streamer,
        tokenizer_encode_kwargs: { enable_thinking: false },
      });

      // Fallback if streamer did not fire callbacks
      if (!streamedTokens.trim()) {
        const generated = out?.[0]?.generated_text;
        const text = Array.isArray(generated)
          ? generated[generated.length - 1]?.content
          : typeof generated === "string"
          ? generated
          : "";
        if (text) {
          self.postMessage({ type: "token", data: { token: text } });
        }
      }
    } catch (normErr) {
      console.warn("[worker] S1-mini normalization error, falling back to raw transcript:", normErr);
      self.postMessage({ type: "replace", data: { text: rawTranscript } });
      self.postMessage({ type: "model-warning", data: {
        message: "Polishing is unavailable. Your transcript is saved; tap Polish to retry.",
      } });
    }

    self.postMessage({ type: "complete" });
  } catch (err) {
    console.error("[worker] Transcribe error:", err);
    self.postMessage({
      type: "error",
      data: { message: err.message || String(err) },
    });
  }
}

/**
 * Text transformation via S1-mini control lines
 */
async function generate({ mode = "polish", text = "", settings = {} }) {
  const rawText = text.trim();
  if (!rawText) {
    self.postMessage({ type: "complete" });
    return;
  }

  const controlLine = S1_CONTROL_LINES[mode] || S1_CONTROL_LINES.polish;

  try {
    await ensureNormalizer();
    const transformers = await import(TJS);
    const { TextStreamer } = transformers;

    self.postMessage({ type: "start" });
    self.postMessage({ type: "phase", data: { phase: "polishing", mode } });

    let streamedTokens = "";
    const streamer = new TextStreamer(normalizer.tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function: (token) => {
        streamedTokens += token;
        self.postMessage({ type: "token", data: { token } });
      },
    });

    const messages = [
      { role: "system", content: S1_SYSTEM_PROMPT },
      { role: "user", content: `${controlLine}\n${rawText}` },
    ];

    const tokenizedRaw = normalizer.tokenizer(rawText);
    const inputTokens = tokenizedRaw?.input_ids?.size ?? tokenizedRaw?.input_ids?.dims?.at(-1) ?? 128;
    const maxNewTokens = settings.maxTokens || Math.min(1024, Math.max(64, Math.ceil(inputTokens * 1.3) + 32));

    const out = await normalizer(messages, {
      max_new_tokens: maxNewTokens,
      do_sample: false,
      streamer,
      tokenizer_encode_kwargs: { enable_thinking: false },
    });

    if (!streamedTokens.trim()) {
      const generated = out?.[0]?.generated_text;
      const textVal = Array.isArray(generated)
        ? generated[generated.length - 1]?.content
        : typeof generated === "string"
        ? generated
        : "";
      if (textVal) {
        self.postMessage({ type: "token", data: { token: textVal } });
      }
    }

    self.postMessage({ type: "complete" });
  } catch (err) {
    self.postMessage({ type: "model-warning", data: { message: err.message || String(err) } });
    self.postMessage({
      type: "error",
      data: { message: err.message || String(err) },
    });
  }
}

let isStreamingASR = false;

async function streamAudio({ audio }) {
  if (!transcriber || isStreamingASR) return;
  try {
    isStreamingASR = true;
    const result = await transcriber(audio);
    const text = (
      typeof result === "string" ? result : result?.text || ""
    ).trim();
    if (text) {
      self.postMessage({ type: "live-transcript", data: { text } });
    }
  } catch (err) {
    // Non-fatal interim chunk error
  } finally {
    isStreamingASR = false;
  }
}

// ONNX sessions must not run overlapping live and final inference.
let inferenceQueue = Promise.resolve();
let queuedInference = 0;
self.addEventListener("message", (event) => {
  const { type, data } = event.data;
  if (type === "load") {
    void loadModels();
    return;
  }
  if (type === "prewarm") {
    if (!normalizer && !loadingNormalizer) {
      detectBackend().then((b) => {
        if (b.device === "webgpu") {
          void ensureNormalizer().catch(() => {});
        }
      });
    }
    return;
  }
  const operation = { "stream-audio": streamAudio, transcribe, generate }[type];
  if (!operation || (type === "stream-audio" && queuedInference)) return;
  queuedInference++;
  inferenceQueue = inferenceQueue.then(() => operation(data))
    .catch(error => self.postMessage({ type: "error", data: { message: error.message } }))
    .finally(() => { queuedInference--; });
});
