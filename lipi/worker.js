/**
 * Lipi Indic Voice Editor — Web Worker
 * Runs Udgam Labs Paar neural translation models (12 Indic languages) in-browser
 * via Hugging Face Transformers.js (quantized q8 ONNX).
 */

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3';

// Fetch quantized ONNX weights directly from Hugging Face Hub in browser
env.allowLocalModels = false;

const ctx = typeof self !== 'undefined' ? self : globalThis;

// ─── Runtime Capability & WASM Configuration ───
let latestRuntimeHints = {};

export function detectMobileWorker(hints = {}) {
  const merged = { ...latestRuntimeHints, ...(hints || {}) };
  if (typeof merged.isMobile === 'boolean') {
    return merged.isMobile;
  }
  const nav = typeof navigator !== 'undefined' ? navigator : {};
  const ua = merged.userAgent ?? nav.userAgent ?? '';
  const platform = merged.platform ?? nav.platform ?? '';
  const maxTouch = merged.maxTouchPoints ?? nav.maxTouchPoints ?? 0;
  const mem = merged.deviceMemory ?? nav.deviceMemory;
  const screenWidth = merged.screenWidth;

  if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return true;
  if (platform === 'MacIntel' && maxTouch > 1) return true;
  if (maxTouch > 1 && typeof screenWidth === 'number' && screenWidth > 0 && screenWidth < 1024) return true;
  if (typeof mem === 'number' && mem > 0 && mem <= 4) return true;
  return false;
}

export function applyWasmConfig(isMobile, envObj = env) {
  const wasm = envObj?.backends?.onnx?.wasm;
  if (!wasm) return;

  // Never redirect Transformers.js wasmPaths to /ai/swanada/ort/ (different ORT version).
  if (isMobile) {
    wasm.numThreads = 1;
    return;
  }

  const isolated = typeof crossOriginIsolated !== 'undefined' ? crossOriginIsolated : false;
  if (isolated) {
    const cores = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 4) : 4;
    wasm.numThreads = Math.min(4, Math.max(1, cores));
  } else {
    wasm.numThreads = 1;
  }
}

// Configure initial WASM threading before any pipeline loads
applyWasmConfig(detectMobileWorker());

// ─── Translation Pipelines LRU Cache ───
const translationPipelines = new Map();
const pipelineLanguages = new Map();
const loadingPipelines = new Map();

export function getLoadedPipelineCount() {
  return translationPipelines.size;
}

function touchPipeline(modelId) {
  const existing = translationPipelines.get(modelId);
  translationPipelines.delete(modelId);
  translationPipelines.set(modelId, existing);
  return existing;
}

async function evictPipelinesIfNeeded(maxCapacity, excludeModelId = null) {
  while (translationPipelines.size >= maxCapacity) {
    let victimKey = null;
    for (const key of translationPipelines.keys()) {
      if (key !== excludeModelId) {
        victimKey = key;
        break;
      }
    }
    if (!victimKey) break;

    const oldPipeline = translationPipelines.get(victimKey);
    const oldLang = pipelineLanguages.get(victimKey);
    translationPipelines.delete(victimKey);
    pipelineLanguages.delete(victimKey);

    if (oldPipeline && typeof oldPipeline.dispose === 'function') {
      try {
        await oldPipeline.dispose();
      } catch (err) {
        console.warn(`[worker] Failed to dispose pipeline ${victimKey}:`, err);
      }
    }

    ctx.postMessage({
      type: 'model-evicted',
      language: oldLang,
      modelId: victimKey,
    });
  }
}

// ─── Sequential Queue for Deterministic Execution ───
const translationQueue = [];
let isProcessing = false;

function resolvePaarModelId(language, modelId) {
  if (modelId) return modelId;
  if (language) return `udgamlabs/Paar-en-${language}`;
  return null;
}

async function getTranslationPipeline(modelId, language, runtimeHints) {
  const isMobile = detectMobileWorker(runtimeHints);
  applyWasmConfig(isMobile);

  if (translationPipelines.has(modelId)) {
    return touchPipeline(modelId);
  }

  if (loadingPipelines.has(modelId)) {
    return await loadingPipelines.get(modelId);
  }

  const maxCapacity = isMobile ? 1 : 3;

  const loadPromise = (async () => {
    try {
      await evictPipelinesIfNeeded(maxCapacity, modelId);

      ctx.postMessage({
        type: 'model-loading',
        language,
        modelId,
      });

      const pipelineOptions = {
        dtype: 'q8',
        progress_callback: (progress) => {
          const payload = {
            type: 'model-progress',
            language,
            modelId,
            ...progress,
          };
          if (typeof progress.progress !== 'number' && progress.status === 'progress' && progress.total) {
            payload.progress = Math.round((progress.loaded / progress.total) * 100);
          }
          ctx.postMessage(payload);
        },
      };

      if (isMobile) {
        pipelineOptions.session_options = {
          enableCpuMemArena: false,
          enableMemPattern: false,
        };
      }

      const translator = await pipeline('translation', modelId, pipelineOptions);

      translationPipelines.set(modelId, translator);
      if (language) {
        pipelineLanguages.set(modelId, language);
      }
      ctx.postMessage({
        type: 'model-ready',
        language,
        modelId,
      });
      return translator;
    } finally {
      loadingPipelines.delete(modelId);
    }
  })();

  loadingPipelines.set(modelId, loadPromise);
  return await loadPromise;
}

async function loadTranslationModel(language, modelId, runtimeHints) {
  const resolvedModelId = resolvePaarModelId(language, modelId);
  if (!resolvedModelId) {
    throw new Error('Missing modelId or language for translation model loading');
  }

  if (translationPipelines.has(resolvedModelId)) {
    const isMobile = detectMobileWorker(runtimeHints);
    applyWasmConfig(isMobile);
    touchPipeline(resolvedModelId);
    ctx.postMessage({
      type: 'model-ready',
      language,
      modelId: resolvedModelId,
    });
    return translationPipelines.get(resolvedModelId);
  }

  return await getTranslationPipeline(resolvedModelId, language, runtimeHints);
}

async function executeTranslation({ text, targetLang, id, modelId, runtimeHints }) {
  if (!text || !text.trim()) {
    ctx.postMessage({
      type: 'translation-result',
      id,
      text: text || '',
      targetLang,
    });
    return;
  }

  try {
    const resolvedModelId = resolvePaarModelId(targetLang, modelId);
    if (!resolvedModelId) {
      throw new Error(`Cannot resolve model ID for target language: ${targetLang}`);
    }

    const translator = await getTranslationPipeline(resolvedModelId, targetLang, runtimeHints);

    // Greedy decoding per Udgam Labs Paar configuration
    const output = await translator(text, {
      num_beams: 1,
      max_new_tokens: 200,
    });

    let translatedText = '';
    if (Array.isArray(output) && output.length > 0) {
      const first = output[0];
      if (typeof first === 'string') {
        translatedText = first;
      } else if (first && typeof first === 'object') {
        translatedText = first.translation_text ?? first.generated_text ?? '';
      }
    } else if (output && typeof output === 'object') {
      translatedText = output.translation_text ?? output.generated_text ?? '';
    } else if (typeof output === 'string') {
      translatedText = output;
    }

    ctx.postMessage({
      type: 'translation-result',
      id,
      text: translatedText.trim(),
      targetLang,
    });
  } catch (err) {
    ctx.postMessage({
      type: 'translation-error',
      id,
      targetLang,
      error: err.message || String(err),
    });
  }
}

function scheduleNext() {
  if (isProcessing || translationQueue.length === 0) return;

  const nextTask = translationQueue.shift();
  isProcessing = true;

  (async () => {
    try {
      if (nextTask.kind === 'load') {
        try {
          await loadTranslationModel(nextTask.language, nextTask.modelId, nextTask.runtimeHints);
        } catch (err) {
          ctx.postMessage({
            type: 'model-error',
            language: nextTask.language,
            modelId: nextTask.modelId,
            error: err.message || String(err),
          });
          ctx.postMessage({
            type: 'translation-error',
            language: nextTask.language,
            modelId: nextTask.modelId,
            error: err.message || String(err),
          });
        }
      } else {
        await executeTranslation(nextTask);
      }
    } catch (err) {
      console.error('[worker] Unexpected translation task error:', err);
    } finally {
      isProcessing = false;
      scheduleNext();
    }
  })();
}

ctx.addEventListener('message', (e) => {
  const data = e.data || {};
  const { action, modelId, language, targetLang, text, id, runtimeHints } = data;

  if (runtimeHints && typeof runtimeHints === 'object') {
    latestRuntimeHints = { ...latestRuntimeHints, ...runtimeHints };
    applyWasmConfig(detectMobileWorker(latestRuntimeHints));
  }

  switch (action) {
    case 'load-translation-model':
      translationQueue.push({ kind: 'load', language, modelId, runtimeHints });
      scheduleNext();
      break;

    case 'translate':
      translationQueue.push({ kind: 'translate', text, targetLang, id, modelId, runtimeHints });
      scheduleNext();
      break;

    default:
      console.warn(`[worker] Unknown action: ${action}`);
      break;
  }
});
