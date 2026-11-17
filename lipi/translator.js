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

// In-flight deduplication: Map<`${targetLang}:${normalizedSentence}`, Promise<string>>
const inFlightSentences = new Map();

// Pending translation requests: Map<requestId, { resolve, reject, timeoutId, resetTimeout }>
const pendingRequests = new Map();

// Pending model preload requests: Map<langId, { promise, resolve, reject, timeoutId, resetTimeout }>
const pendingModelLoads = new Map();

// Set of loaded model languages
const loadedModels = new Set();

// Sequential worker dispatch chain so queued sentences don't prematurely time out
let dispatchChain = Promise.resolve();

// Progress & lifecycle event listeners
const progressListeners = new Set();
const statusListeners = new Set();

function emitStatus(payload) {
  for (const listener of statusListeners) {
    try {
      listener(payload);
    } catch (_) {}
  }
}

// Active Worker reference
let activeWorker = null;
let listenerAttached = false;
let requestCounter = 0;
export const MAX_MODEL_PROGRESS_WAIT_MS = 300000;
let activeGeneration = { id: 0, abortError: null };

/**
 * Collect runtime device capability hints for worker WASM threading & LRU sizing.
 * @returns {Object}
 */
export function getRuntimeHints() {
  const nav = typeof navigator !== 'undefined' ? navigator : {};
  const scr = typeof screen !== 'undefined' ? screen : undefined;
  const ua = nav.userAgent || '';
  const platform = nav.platform || '';
  const maxTouchPoints = nav.maxTouchPoints || 0;
  const deviceMemory = nav.deviceMemory;
  const hardwareConcurrency = nav.hardwareConcurrency;
  const screenWidth = scr && typeof scr.width === 'number' ? scr.width : undefined;

  const isMobile =
    /Android|iPhone|iPad|iPod|Mobile/i.test(ua) ||
    (platform === 'MacIntel' && maxTouchPoints > 1) ||
    (maxTouchPoints > 1 && typeof screenWidth === 'number' && screenWidth > 0 && screenWidth < 1024) ||
    (typeof deviceMemory === 'number' && deviceMemory > 0 && deviceMemory <= 4);

  return {
    isMobile,
    userAgent: ua,
    platform,
    maxTouchPoints,
    deviceMemory,
    hardwareConcurrency,
    screenWidth,
  };
}

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

    case 'model-loading': {
      for (const pending of pendingRequests.values()) {
        pending.resetTimeout?.(Math.max(pending.baseTimeoutMs, 90000));
      }
      if (data.language && pendingModelLoads.has(data.language)) {
        pendingModelLoads.get(data.language).resetTimeout?.();
      }
      emitStatus({ ...data, type: 'model-loading' });
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
      for (const pending of pendingRequests.values()) {
        pending.resetTimeout?.(pending.baseTimeoutMs);
      }
      emitStatus({ ...data, type: 'model-ready' });
      for (const listener of progressListeners) {
        try {
          listener({ ...data, type: 'model-ready', status: 'ready', progress: 100 });
        } catch (_) {}
      }
      break;
    }

    case 'model-evicted': {
      if (data.language) {
        loadedModels.delete(data.language);
      }
      emitStatus({ ...data, type: 'model-evicted' });
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
      emitStatus({ ...data, type: 'model-error' });
      break;
    }

    case 'model-progress': {
      for (const pending of pendingRequests.values()) {
        pending.resetTimeout?.(Math.max(pending.baseTimeoutMs, 90000));
      }
      if (data.language && pendingModelLoads.has(data.language)) {
        pendingModelLoads.get(data.language).resetTimeout?.();
      }
      emitStatus(data);
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
 * Handle worker error or messageerror events by failing pending requests immediately
 * and resetting the failed worker reference.
 * @param {Event|ErrorEvent|Object} event
 */
function handleWorkerError(event) {
  const rawErr = event && (event.error || event.message);
  const message =
    rawErr instanceof Error
      ? rawErr.message
      : (typeof rawErr === 'string' && rawErr) || 'Translation worker error';
  const err = rawErr instanceof Error ? rawErr : new Error(message);

  activeGeneration.abortError = err;
  activeGeneration = { id: activeGeneration.id + 1, abortError: null };

  for (const [id, pending] of pendingRequests.entries()) {
    clearTimeout(pending.timeoutId);
    pendingRequests.delete(id);
    pending.reject(err);
  }
  for (const [langId, pendingLoad] of pendingModelLoads.entries()) {
    clearTimeout(pendingLoad.timeoutId);
    pendingModelLoads.delete(langId);
    pendingLoad.reject(err);
  }
  loadedModels.clear();
  inFlightSentences.clear();
  dispatchChain = Promise.resolve();

  const failedWorker = activeWorker;
  if (failedWorker) {
    detachWorkerListener(failedWorker);
    try {
      failedWorker.terminate?.();
    } catch (_) {}
    activeWorker = null;
    listenerAttached = false;
  }

  emitStatus({ type: 'model-error', error: err.message });
}

function detachWorkerListener(worker) {
  if (!worker) return;
  if (typeof worker.removeEventListener === 'function') {
    try { worker.removeEventListener('message', handleWorkerMessage); } catch (_) {}
    try { worker.removeEventListener('error', handleWorkerError); } catch (_) {}
    try { worker.removeEventListener('messageerror', handleWorkerError); } catch (_) {}
  }
}

/**
 * Attach message and error listeners to a worker instance.
 * @param {Worker|Object} worker
 */
function attachWorkerListener(worker) {
  if (!worker || listenerAttached) return;
  if (typeof worker.addEventListener === 'function') {
    worker.addEventListener('message', handleWorkerMessage);
    worker.addEventListener('error', handleWorkerError);
    worker.addEventListener('messageerror', handleWorkerError);
    listenerAttached = true;
  } else if ('onmessage' in worker) {
    const prevMsg = worker.onmessage;
    worker.onmessage = (e) => {
      handleWorkerMessage(e);
      if (typeof prevMsg === 'function') prevMsg(e);
    };
    if ('onerror' in worker) {
      const prevErr = worker.onerror;
      worker.onerror = (e) => {
        handleWorkerError(e);
        if (typeof prevErr === 'function') prevErr(e);
      };
    }
    listenerAttached = true;
  }
}

/**
 * Inject or replace the active Worker instance (useful for test doubles).
 * @param {Worker|Object} worker
 */
export function setWorker(worker) {
  if (activeWorker) {
    detachWorkerListener(activeWorker);
  }
  const replaceErr = new Error('Translation worker was replaced');
  activeGeneration.abortError = replaceErr;
  activeGeneration = { id: activeGeneration.id + 1, abortError: null };

  for (const [id, pending] of pendingRequests.entries()) {
    clearTimeout(pending.timeoutId);
    pendingRequests.delete(id);
    pending.reject(replaceErr);
  }
  for (const [langId, pendingLoad] of pendingModelLoads.entries()) {
    clearTimeout(pendingLoad.timeoutId);
    pendingModelLoads.delete(langId);
    pendingLoad.reject(replaceErr);
  }
  loadedModels.clear();
  inFlightSentences.clear();
  dispatchChain = Promise.resolve();

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
 * Register a listener for model lifecycle events (model-loading, model-progress, model-ready, model-error).
 * @param {Function} callback
 * @returns {Function} unsubscribe
 */
export function onModelStatus(callback) {
  statusListeners.add(callback);
  return () => statusListeners.delete(callback);
}

/**
 * Preload a Paar translation model for a specific target language.
 * Sends { action: 'load-translation-model', language, modelId } to worker.
 * @param {string} targetLang
 * @param {number} [timeoutMs=60000]
 * @returns {Promise<void>}
 */
export async function preloadLanguageModel(
  targetLang,
  timeoutMs = 60000,
  maxWaitMs = Math.max(timeoutMs, MAX_MODEL_PROGRESS_WAIT_MS)
) {
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

  const entry = {
    promise,
    resolve: resolveRef,
    reject: rejectRef,
    timeoutId: null,
    resetTimeout: null,
  };

  const deadline = Date.now() + Math.max(timeoutMs, maxWaitMs);
  const armTimeout = () => {
    clearTimeout(entry.timeoutId);
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      if (pendingModelLoads.has(langId)) {
        pendingModelLoads.delete(langId);
        rejectRef(new Error(`Timeout loading translation model for ${langId}`));
      }
      return;
    }
    entry.timeoutId = setTimeout(() => {
      if (pendingModelLoads.has(langId)) {
        pendingModelLoads.delete(langId);
        rejectRef(new Error(`Timeout loading translation model for ${langId}`));
      }
    }, Math.min(timeoutMs, remaining));
  };
  entry.resetTimeout = armTimeout;
  armTimeout();

  pendingModelLoads.set(langId, entry);

  worker.postMessage({
    action: 'load-translation-model',
    language: langId,
    modelId: langConfig.paarModel,
    runtimeHints: getRuntimeHints(),
  });

  return promise;
}

/**
 * Internal helper to translate a single sentence via worker with caching,
 * in-flight deduplication, and sequential dispatch queuing.
 * @param {string} sentence
 * @param {string} targetLang
 * @param {number} [timeoutMs=30000]
 * @param {number} [maxWaitMs=MAX_MODEL_PROGRESS_WAIT_MS]
 * @returns {Promise<string>}
 */
async function translateSentence(
  sentence,
  targetLang,
  timeoutMs = 30000,
  maxWaitMs = Math.max(timeoutMs, MAX_MODEL_PROGRESS_WAIT_MS)
) {
  const normSentence = normalizeText(sentence).trim();
  if (!normSentence) return '';

  const cacheKey = `${targetLang}:${normSentence}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  if (inFlightSentences.has(cacheKey)) {
    return inFlightSentences.get(cacheKey);
  }

  const worker = getWorker();
  if (!worker) {
    throw new Error('Translation worker is not available');
  }

  const capturedGen = activeGeneration;

  const runQueued = () => new Promise((resolve, reject) => {
    if (capturedGen !== activeGeneration) {
      reject(capturedGen.abortError || new Error('Translation worker was replaced'));
      return;
    }

    if (translationCache.has(cacheKey)) {
      resolve(translationCache.get(cacheKey));
      return;
    }

    const currentWorker = getWorker();
    if (!currentWorker) {
      reject(new Error('Translation worker is not available'));
      return;
    }

    const id = generateRequestId();
    const deadline = Date.now() + Math.max(timeoutMs, maxWaitMs);
    const pendingEntry = {
      baseTimeoutMs: timeoutMs,
      timeoutId: null,
      resetTimeout: null,
      resolve: (text) => {
        clearTimeout(pendingEntry.timeoutId);
        const normResult = normalizeText(text || '').trim();
        translationCache.set(cacheKey, normResult);
        resolve(normResult);
      },
      reject: (err) => {
        clearTimeout(pendingEntry.timeoutId);
        reject(err);
      },
    };

    const armTimeout = (ms = timeoutMs) => {
      clearTimeout(pendingEntry.timeoutId);
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        if (pendingRequests.has(id)) {
          pendingRequests.delete(id);
          reject(new Error(`Translation request ${id} timed out`));
        }
        return;
      }
      pendingEntry.timeoutId = setTimeout(() => {
        if (pendingRequests.has(id)) {
          pendingRequests.delete(id);
          reject(new Error(`Translation request ${id} timed out`));
        }
      }, Math.min(ms, remaining));
    };
    pendingEntry.resetTimeout = armTimeout;
    armTimeout(timeoutMs);

    pendingRequests.set(id, pendingEntry);

    currentWorker.postMessage({
      action: 'translate',
      text: normSentence,
      targetLang,
      id,
      runtimeHints: getRuntimeHints(),
    });
  });

  const queuedPromise = dispatchChain.then(runQueued, runQueued);
  dispatchChain = queuedPromise.catch(() => {});
  inFlightSentences.set(cacheKey, queuedPromise);

  try {
    return await queuedPromise;
  } finally {
    if (inFlightSentences.get(cacheKey) === queuedPromise) {
      inFlightSentences.delete(cacheKey);
    }
  }
}

/**
 * Translate arbitrary text into the target Indic language.
 * Performs Unicode NFC normalization, sentence splitting, paragraph preservation,
 * and caching.
 * @param {string} text
 * @param {string} targetLang
 * @param {{ timeoutMs?: number, maxWaitMs?: number }} [options]
 * @returns {Promise<string>}
 */
export async function translateText(text, targetLang, options = {}) {
  if (!text || typeof text !== 'string') return '';
  const normalized = normalizeText(text);
  if (!normalized.trim()) return '';

  if (!isValidLanguage(targetLang)) {
    throw new Error(`Unsupported target language: ${targetLang}`);
  }

  const langConfig = getLanguage(targetLang);
  const langId = langConfig.id;
  const timeoutMs = typeof options?.timeoutMs === 'number' ? options.timeoutMs : 30000;
  const maxWaitMs = typeof options?.maxWaitMs === 'number'
    ? options.maxWaitMs
    : Math.max(timeoutMs, MAX_MODEL_PROGRESS_WAIT_MS);

  // Split by line breaks to preserve paragraph structure
  const lines = normalized.split(/\r?\n/);
  const translatedLines = await Promise.all(
    lines.map(async (line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return '';

      const sentences = splitSentences(trimmedLine);
      if (sentences.length === 0) return '';

      const translatedSentences = await Promise.all(
        sentences.map(sentence => translateSentence(sentence, langId, timeoutMs, maxWaitMs))
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
