/**
 * ಕನ್ನಡ Voice Editor — Web Worker
 * Handles model loading + transcription.
 * Designed to handle sequential chunk requests during live recording.
 */

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3';

env.allowLocalModels = false;

let transcriber = null;
let currentModelId = null;
let busy = false;
let queue = []; // queue chunks if one is already being processed

async function loadModel(modelId) {
  if (transcriber && currentModelId === modelId) {
    self.postMessage({ type: 'model-ready', modelId });
    return;
  }

  if (transcriber) {
    try { await transcriber.dispose(); } catch (_) {}
    transcriber = null;
  }

  self.postMessage({ type: 'model-loading', modelId });

  transcriber = await pipeline('automatic-speech-recognition', modelId, {
    dtype: 'fp32',
    device: 'wasm',
    progress_callback: (progress) => {
      self.postMessage({ type: 'model-progress', ...progress });
    },
  });

  currentModelId = modelId;
  self.postMessage({ type: 'model-ready', modelId });
}

async function transcribeChunk(audioData, chunkId, isFinal) {
  if (!transcriber) return;

  try {
    const opts = {
      // Condition the decoder to output clean Kannada text
      initial_prompt: 'ಕನ್ನಡ ಭಾಷೆಯಲ್ಲಿ ಸ್ಪಷ್ಟವಾಗಿ ಬರೆಯಿರಿ.',
    };

    const result = await transcriber(audioData, opts);
    let text = (result.text || '').trim();

    // Filter garbage: repetitive patterns, non-Kannada hallucinations
    if (isGarbage(text)) {
      text = '';
    }

    self.postMessage({
      type: 'transcription-chunk',
      text,
      chunkId,
      isFinal,
    });
  } catch (err) {
    self.postMessage({
      type: 'transcription-error',
      error: err.message || String(err),
      chunkId,
    });
  }
}

/**
 * Detect garbage/hallucinated output from Whisper.
 * Common patterns: repeated phrases, non-Kannada text when expecting Kannada,
 * single repeated characters, or very long repetitive sequences.
 */
function isGarbage(text) {
  if (!text || text.length < 2) return false;

  // Detect repeated short phrases (e.g. "ನಮಸ್ಕಾರ ನಮಸ್ಕಾರ ನಮಸ್ಕಾರ")
  const words = text.split(/\s+/);
  if (words.length >= 4) {
    const unique = new Set(words);
    if (unique.size <= 2) return true; // same 1-2 words repeated 4+ times
  }

  // Detect character-level repetition (e.g. "aaaaaaa" or "।।।।।।")
  if (/(.)\1{6,}/.test(text)) return true;

  // Detect repeated bigrams/trigrams filling the output
  if (words.length >= 6) {
    const bigrams = [];
    for (let i = 0; i < words.length - 1; i++) bigrams.push(words[i] + ' ' + words[i + 1]);
    const uniqueBigrams = new Set(bigrams);
    if (uniqueBigrams.size === 1) return true;
  }

  // Mostly non-Kannada when we expect Kannada (Latin/CJK hallucination)
  const kannadaChars = (text.match(/[\u0C80-\u0CFF]/g) || []).length;
  const totalAlpha = (text.match(/[^\s\d.,!?;:'"()\-]/g) || []).length;
  if (totalAlpha > 5 && kannadaChars / totalAlpha < 0.3) return true;

  return false;
}

async function processQueue() {
  if (busy || queue.length === 0) return;
  busy = true;

  const { audioData, chunkId, isFinal } = queue.shift();
  await transcribeChunk(audioData, chunkId, isFinal);

  busy = false;
  processQueue(); // process next in queue
}

self.addEventListener('message', async (e) => {
  const { action, modelId, audioData, chunkId, isFinal } = e.data;

  switch (action) {
    case 'load-model':
      try { await loadModel(modelId); }
      catch (err) { self.postMessage({ type: 'model-error', error: err.message || String(err) }); }
      break;

    case 'transcribe-chunk':
      queue.push({ audioData, chunkId, isFinal });
      processQueue();
      break;
  }
});
