/**
 * Lipi Indic Voice Editor — Translation Client
 * Bridges UI to Web Worker for Paar neural translation models.
 * Handles sentence splitting, Unicode NFC normalization, caching,
 * worker request-response correlation, and model preloading.
 */

import { getLanguage, isValidLanguage } from './languages.js';

// Sentence splitting regex covering Latin punctuation (.!?), Indic dandas (।॥), and Urdu Khatma/Arabic Question Mark (۔؟)
export const SENTENCE_SPLIT_REGEX = /(?<=[.!?।॥۔؟])\s+/;

// In-memory translation cache: Map<`${targetLang}:${normalizedSentence}`, string>
const translationCache = new Map();

// Pending translation requests: Map<requestId, { resolve, reject, timeoutId }>
const pendingRequests = new Map();

// Pending model preload requests: Map<langId, { promise, resolve, reject, timeoutId }>
const pendingModelLoads = new Map();

// Set of loaded model languages
const loadedModels = new Set();

// Progress event listeners
const progressListeners = new Set();

// Active Worker reference
let activeWorker = null;
let listenerAttached = false;
let requestCounter = 0;

/**
 * Normalizes input text using Unicode NFC format.
 * @param {string} text
 * @returns {string}
 */
export function normalizeText(text) {
  if (typeof text !== 'string') return '';
  return text.normalize('NFC');
}

/**
 * Generate a unique correlation ID for worker communication.
 * @returns {string}
 */
function generateRequestId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (_) {}
  }
  return `tx-${++requestCounter}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Handle incoming messages from worker.js.
 * @param {MessageEvent|Object} event
 */
function handleWorkerMessage(event) {
  const data = event && event.data ? event.data : event;
  if (!data || typeof data !== 'object') return;

  switch (data.type) {
    case 'translation-result': {
      const { id, text } = data;
      const pending = pendingRequests.get(id);
      if (pending) {
        clearTimeout(pending.timeoutId);
        pendingRequests.delete(id);
        pending.resolve(text);
      }
      break;
    }

    case 'translation-error': {
      const { id, error } = data;
      const pending = pendingRequests.get(id);
      if (pending) {
        clearTimeout(pending.timeoutId);
        pendingRequests.delete(id);
        pending.reject(new Error(error || 'Translation failed'));
      }
      break;
    }

    case 'model-ready': {
      const lang = data.language;
      if (lang) {
        loadedModels.add(lang);
        const pendingLoad = pendingModelLoads.get(lang);
        if (pendingLoad) {
          clearTimeout(pendingLoad.timeoutId);
          pendingModelLoads.delete(lang);
          pendingLoad.resolve();
        }
      }
      break;
    }

    case 'model-error': {
      const lang = data.language;
      const pendingLoad = lang ? pendingModelLoads.get(lang) : null;
      if (pendingLoad) {
        clearTimeout(pendingLoad.timeoutId);
        pendingModelLoads.delete(lang);
        pendingLoad.reject(new Error(data.error || 'Model loading failed'));
      }
      break;
    }

    case 'model-progress': {
      for (const listener of progressListeners) {
        try {
          listener(data);
        } catch (_) {}
      }
      break;
    }
  }
}

/**
 * Attach message listener to a worker instance.
 * @param {Worker|Object} worker
 */
function attachWorkerListener(worker) {
  if (!worker || listenerAttached) return;
  if (typeof worker.addEventListener === 'function') {
    worker.addEventListener('message', handleWorkerMessage);
    listenerAttached = true;
  } else if ('onmessage' in worker) {
    const prev = worker.onmessage;
    worker.onmessage = (e) => {
      handleWorkerMessage(e);
      if (typeof prev === 'function') prev(e);
    };
    listenerAttached = true;
  }
}

/**
 * Inject or replace the active Worker instance (useful for test doubles).
 * @param {Worker|Object} worker
 */
export function setWorker(worker) {
  if (activeWorker && typeof activeWorker.removeEventListener === 'function') {
    try {
      activeWorker.removeEventListener('message', handleWorkerMessage);
    } catch (_) {}
  }
  activeWorker = worker;
  listenerAttached = false;
  if (activeWorker) {
    attachWorkerListener(activeWorker);
  }
}
export const setTranslationWorker = setWorker;

/**
 * Retrieve or lazily initialize the active Worker.
 * @returns {Worker|null}
 */
export function getWorker() {
  if (!activeWorker) {
    if (typeof Worker !== 'undefined') {
      try {
        activeWorker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
        attachWorkerListener(activeWorker);
      } catch (_) {
        try {
          activeWorker = new Worker('./worker.js', { type: 'module' });
          attachWorkerListener(activeWorker);
        } catch (_) {}
      }
    }
  }
  return activeWorker;
}
export const getTranslationWorker = getWorker;

/**
 * Split text into individual sentences using the Indic + Latin punctuation regex.
 * Handles leading/trailing spaces, empty chunks, and multiple delimiters.
 * @param {string} text
 * @returns {string[]}
 */
export function splitSentences(text) {
  if (!text || typeof text !== 'string') return [];
  const normalized = normalizeText(text.trim());
  if (!normalized) return [];
  return normalized
    .split(SENTENCE_SPLIT_REGEX)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Clear the in-memory translation cache.
 */
export function clearTranslationCache() {
  translationCache.clear();
}

/**
 * Retrieve the in-memory translation cache Map.
 * @returns {Map<string, string>}
 */
export function getTranslationCache() {
  return translationCache;
}

/**
 * Retrieve the size of the in-memory translation cache.
 * @returns {number}
 */
export function getCacheSize() {
  return translationCache.size;
}

/**
 * Register a listener for model loading progress events.
 * @param {Function} callback
 * @returns {Function} unsubscribe
 */
export function onModelProgress(callback) {
  progressListeners.add(callback);
  return () => progressListeners.delete(callback);
}

/**
 * Preload a Paar translation model for a specific target language.
 * Sends { action: 'load-translation-model', language, modelId } to worker.
 * @param {string} targetLang
 * @param {number} [timeoutMs=60000]
 * @returns {Promise<void>}
 */
export async function preloadLanguageModel(targetLang, timeoutMs = 60000) {
  if (!isValidLanguage(targetLang)) {
    throw new Error(`Unsupported target language: ${targetLang}`);
  }
  const langConfig = getLanguage(targetLang);
  const langId = langConfig.id;

  if (loadedModels.has(langId)) {
    return Promise.resolve();
  }

  if (pendingModelLoads.has(langId)) {
    return pendingModelLoads.get(langId).promise;
  }

  const worker = getWorker();
  if (!worker) {
    throw new Error('Translation worker is not available');
  }

  let resolveRef, rejectRef;
  const promise = new Promise((resolve, reject) => {
    resolveRef = resolve;
    rejectRef = reject;
  });

  const timeoutId = setTimeout(() => {
    if (pendingModelLoads.has(langId)) {
      pendingModelLoads.delete(langId);
      rejectRef(new Error(`Timeout loading translation model for ${langId}`));
    }
  }, timeoutMs);

  pendingModelLoads.set(langId, {
    promise,
    resolve: resolveRef,
    reject: rejectRef,
    timeoutId,
  });

  worker.postMessage({
    action: 'load-translation-model',
    language: langId,
    modelId: langConfig.paarModel,
  });

  return promise;
}

/**
 * Internal helper to translate a single sentence via worker with caching.
 * @param {string} sentence
 * @param {string} targetLang
 * @param {number} [timeoutMs=30000]
 * @returns {Promise<string>}
 */
async function translateSentence(sentence, targetLang, timeoutMs = 30000) {
  const normSentence = normalizeText(sentence).trim();
  if (!normSentence) return '';

  const cacheKey = `${targetLang}:${normSentence}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  const worker = getWorker();
  if (!worker) {
    throw new Error('Translation worker is not available');
  }

  const id = generateRequestId();

  const translationPromise = new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        reject(new Error(`Translation request ${id} timed out`));
      }
    }, timeoutMs);

    pendingRequests.set(id, {
      resolve: (text) => {
        clearTimeout(timeoutId);
        const normResult = normalizeText(text || '').trim();
        translationCache.set(cacheKey, normResult);
        resolve(normResult);
      },
      reject: (err) => {
        clearTimeout(timeoutId);
        reject(err);
      },
      timeoutId,
    });

    worker.postMessage({
      action: 'translate',
      text: normSentence,
      targetLang,
      id,
    });
  });

  return translationPromise;
}

/**
 * Translate arbitrary text into the target Indic language.
 * Performs Unicode NFC normalization, sentence splitting, paragraph preservation,
 * and caching.
 * @param {string} text
 * @param {string} targetLang
 * @returns {Promise<string>}
 */
export async function translateText(text, targetLang) {
  if (!text || typeof text !== 'string') return '';
  const normalized = normalizeText(text);
  if (!normalized.trim()) return '';

  if (!isValidLanguage(targetLang)) {
    throw new Error(`Unsupported target language: ${targetLang}`);
  }

  const langConfig = getLanguage(targetLang);
  const langId = langConfig.id;

  // Split by line breaks to preserve paragraph structure
  const lines = normalized.split(/\r?\n/);
  const translatedLines = await Promise.all(
    lines.map(async (line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return '';

      const sentences = splitSentences(trimmedLine);
      if (sentences.length === 0) return '';

      const translatedSentences = await Promise.all(
        sentences.map(sentence => translateSentence(sentence, langId))
      );
      return translatedSentences.join(' ');
    })
  );

  return translatedLines.join('\n');
}

export default {
  translateText,
  preloadLanguageModel,
  splitSentences,
  normalizeText,
  clearTranslationCache,
  getTranslationCache,
  getCacheSize,
  setWorker,
  setTranslationWorker,
  getWorker,
  getTranslationWorker,
  onModelProgress,
  SENTENCE_SPLIT_REGEX,
};
