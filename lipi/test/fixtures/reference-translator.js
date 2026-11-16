/**
 * Reference Translation Client Specification
 * Exact authoritative reference contract for translator.js
 */

import { getLanguage, isValidLanguage } from './reference-languages.js';
import { MockTranslationWorker } from './mock-worker.js';

export const SENTENCE_SPLIT_REGEX = /(?<=[.!?।॥۔؟])\s+/;

const translationCache = new Map();
let translationWorker = null;
let pendingRequests = new Map();
let requestIdCounter = 0;

/**
 * Normalizes input text using Unicode NFC format
 * @param {string} text
 * @returns {string}
 */
export function normalizeText(text) {
  if (typeof text !== 'string') return '';
  return text.normalize('NFC');
}

/**
 * Splits text into sentences using the Paar contract regex
 * @param {string} text
 * @returns {string[]}
 */
export function splitSentences(text) {
  if (!text || typeof text !== 'string') return [];
  const normalized = normalizeText(text.trim());
  if (!normalized) return [];
  return normalized.split(SENTENCE_SPLIT_REGEX).filter(s => s.trim().length > 0);
}

/**
 * Clears the in-memory translation cache (useful between tests)
 */
export function clearTranslationCache() {
  translationCache.clear();
}

/**
 * Returns cache size for testing caching behavior
 * @returns {number}
 */
export function getCacheSize() {
  return translationCache.size;
}

/**
 * Gets or initializes the translation worker instance
 */
export function getTranslationWorker() {
  if (!translationWorker) {
    if (typeof Worker !== 'undefined') {
      try {
        translationWorker = new Worker(new URL('../../worker.js', import.meta.url), { type: 'module' });
      } catch {
        translationWorker = new MockTranslationWorker();
      }
    } else {
      translationWorker = new MockTranslationWorker();
    }

    translationWorker.onmessage = (event) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'translation-result') {
        const resolver = pendingRequests.get(data.id);
        if (resolver) {
          pendingRequests.delete(data.id);
          resolver.resolve(data.text);
        }
      } else if (data.type === 'translation-error') {
        const resolver = pendingRequests.get(data.id);
        if (resolver) {
          pendingRequests.delete(data.id);
          resolver.reject(new Error(data.error || 'Translation failed'));
        }
      }
    };
  }
  return translationWorker;
}

/**
 * Sets an explicit worker instance (for deterministic mocking in tests)
 * @param {any} workerInstance
 */
export function setTranslationWorker(workerInstance) {
  translationWorker = workerInstance;
  if (workerInstance) {
    workerInstance.onmessage = (event) => {
      const data = event.data;
      if (!data) return;
      if (data.type === 'translation-result') {
        const resolver = pendingRequests.get(data.id);
        if (resolver) {
          pendingRequests.delete(data.id);
          resolver.resolve(data.text);
        }
      } else if (data.type === 'translation-error') {
        const resolver = pendingRequests.get(data.id);
        if (resolver) {
          pendingRequests.delete(data.id);
          resolver.reject(new Error(data.error || 'Translation failed'));
        }
      }
    };
  }
}

/**
 * Preloads a language translation model
 * @param {string} targetLang
 * @returns {Promise<void>}
 */
export async function preloadLanguageModel(targetLang) {
  const langConfig = getLanguage(targetLang);
  const worker = getTranslationWorker();
  return new Promise((resolve) => {
    const handler = (event) => {
      if (event.data?.type === 'model-ready' && event.data?.language === langConfig.id) {
        if (worker.removeEventListener) {
          worker.removeEventListener('message', handler);
        }
        resolve();
      }
    };
    if (worker.addEventListener) {
      worker.addEventListener('message', handler);
    }
    worker.postMessage({
      action: 'load-translation-model',
      language: langConfig.id,
      modelId: langConfig.paarModel,
    });
    // In mock environments or immediate resolution:
    setTimeout(resolve, 20);
  });
}

/**
 * Translates input text into the target Indic language
 * Handles caching, NFC normalization, and sentence splitting.
 * @param {string} text
 * @param {string} targetLang
 * @returns {Promise<string>}
 */
export async function translateText(text, targetLang) {
  if (typeof text !== 'string') return '';
  const trimmed = text.trim();
  if (!trimmed) return '';

  const target = (targetLang || 'kn').toLowerCase();
  if (!isValidLanguage(target)) {
    throw new Error(`Unsupported target language: ${targetLang}`);
  }

  const normalized = normalizeText(trimmed);
  const cacheKey = `${target}:${normalized}`;

  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  const worker = getTranslationWorker();
  const id = `tx-${++requestIdCounter}-${Date.now()}`;

  const translationPromise = new Promise((resolve, reject) => {
    pendingRequests.set(id, { resolve, reject });
    worker.postMessage({
      action: 'translate',
      id,
      text: normalized,
      targetLang: target,
    });
  });

  const result = await translationPromise;
  translationCache.set(cacheKey, result);
  return result;
}
