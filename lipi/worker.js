/**
 * Lipi Indic Voice Editor — Web Worker
 * Runs Udgam Labs Paar neural translation models (12 Indic languages) in-browser
 * via Hugging Face Transformers.js (quantized q8 ONNX).
 */

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3';

// Fetch quantized ONNX weights directly from Hugging Face Hub in browser
env.allowLocalModels = false;

const ctx = typeof self !== 'undefined' ? self : globalThis;

// ─── Translation Pipelines Cache ───
const translationPipelines = new Map();
const loadingPipelines = new Map();

// ─── Sequential Queue for Deterministic Execution ───
const translationQueue = [];
let isProcessing = false;

function resolvePaarModelId(language, modelId) {
  if (modelId) return modelId;
  if (language) return `udgamlabs/Paar-en-${language}`;
  return null;
}

async function getTranslationPipeline(modelId, language) {
  if (translationPipelines.has(modelId)) {
    return translationPipelines.get(modelId);
  }

  if (loadingPipelines.has(modelId)) {
    return await loadingPipelines.get(modelId);
  }

  const loadPromise = (async () => {
    try {
      ctx.postMessage({
        type: 'model-loading',
        language,
        modelId,
      });

      const translator = await pipeline('translation', modelId, {
        dtype: 'q8',
        progress_callback: (progress) => {
          ctx.postMessage({
            type: 'model-progress',
            language,
            modelId,
            progress:
              progress.progress ??
              (progress.total ? Math.round((progress.loaded / progress.total) * 100) : 0),
            ...progress,
          });
        },
      });

      translationPipelines.set(modelId, translator);
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

async function loadTranslationModel(language, modelId) {
  const resolvedModelId = resolvePaarModelId(language, modelId);
  if (!resolvedModelId) {
    throw new Error('Missing modelId or language for translation model loading');
  }

  if (translationPipelines.has(resolvedModelId)) {
    ctx.postMessage({
      type: 'model-ready',
      language,
      modelId: resolvedModelId,
    });
    return translationPipelines.get(resolvedModelId);
  }

  return await getTranslationPipeline(resolvedModelId, language);
}

async function executeTranslation({ text, targetLang, id, modelId }) {
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

    const translator = await getTranslationPipeline(resolvedModelId, targetLang);

    // Greedy decoding per Udgam Labs Paar configuration
    const output = await translator(text, {
      num_beams: 1,
      max_new_tokens: 200,
      decoder_start_token_id: 2,
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
      await executeTranslation(nextTask);
    } catch (err) {
      console.error('[worker] Unexpected translation task error:', err);
    } finally {
      isProcessing = false;
      scheduleNext();
    }
  })();
}

ctx.addEventListener('message', async (e) => {
  const data = e.data || {};
  const { action, modelId, language, targetLang, text, id } = data;

  switch (action) {
    case 'load-translation-model':
      try {
        await loadTranslationModel(language, modelId);
      } catch (err) {
        ctx.postMessage({
          type: 'model-error',
          language,
          modelId,
          error: err.message || String(err),
        });
        ctx.postMessage({
          type: 'translation-error',
          language,
          modelId,
          error: err.message || String(err),
        });
      }
      break;

    case 'translate':
      translationQueue.push({ text, targetLang, id, modelId });
      scheduleNext();
      break;

    default:
      console.warn(`[worker] Unknown action: ${action}`);
      break;
  }
});
