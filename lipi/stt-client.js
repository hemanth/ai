/**
 * Lipi — Swanada In-Browser Neural Speech-to-Text Client (`stt-client.js`)
 *
 * Capability-routed 16 kHz Conformer-CTC INT8 streaming speech recognition:
 * - Mobile (< 4 GB RAM / phone / tablet): 25.35 MiB `swanada_mobile_ctc_int8.onnx` + 515 KB CTC head
 * - Studio (Desktop): 177.4 MiB `sushrota_sanskrit_ctc_int8.onnx` + 515 KB CTC head
 * - Frame-synchronous `+EN` Voronoi Latin code-switching enabled across Indic speech
 * - Shares origin CacheStorage (`swanada-onnx-v1.0.0`) with `/ai/swanada/` on `h3manth.com`
 */

import { getLanguage } from './languages.js';

const HF_MODEL_BASE = 'https://huggingface.co/gnumanth/swanada/resolve/main/onnx';
const HF_MOBILE_MODEL_BASE = 'https://huggingface.co/gnumanth/swanada/resolve/main/onnx_mobile';
const REMOTE_SWANADA_BASE = 'https://h3manth.com/ai/swanada';

export const SWANADA_SUPPORTED_CODES = new Set([
  'hi', 'bn', 'mr', 'te', 'ta', 'gu', 'kn', 'ml', 'pa', 'or', 'en', 'sa'
]);

/**
 * Detect optimal Swanada Conformer-CTC tier ('mobile' 25.4 MiB vs 'studio' 177.4 MiB).
 */
export function detectSwanadaTier(overrides = {}) {
  const ua = overrides.userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent || '' : '');
  const mem = overrides.deviceMemory ?? (typeof navigator !== 'undefined' ? navigator.deviceMemory : undefined);
  const isMobileUa = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  if (isMobileUa) return 'mobile';
  if (typeof mem === 'number' && mem > 0 && mem < 4) return 'mobile';
  return 'studio';
}

/**
 * Build capability-routed Swanada encoder, CTC head, and vocabulary URLs.
 */
export function buildSwanadaModelConfig(acousticLang, tier = 'mobile', swanadaBase = '/ai/swanada') {
  const base = swanadaBase.replace(/\/+$/, '');
  const useMobile = tier === 'mobile';
  const modelUrl = useMobile
    ? `${HF_MOBILE_MODEL_BASE}/swanada_mobile_ctc_int8.onnx?v=1.7.0`
    : `${HF_MODEL_BASE}/sushrota_sanskrit_ctc_int8.onnx?v=1.7.0`;

  const headVer = 'v=1.9.1';
  const headUrl = useMobile
    ? `${base}/heads_mobile/${acousticLang}.bin?${headVer}`
    : `${base}/heads/${acousticLang}.bin?${headVer}`;

  const vocabFile = acousticLang === 'sa' ? 'sanskrit_vocab.json' : `${acousticLang}_vocab.json`;
  const vocabUrl = `${base}/vocabularies/${vocabFile}?${headVer}`;

  return {
    language: acousticLang,
    modelTier: useMobile ? 'mobile' : 'studio',
    modelUrl,
    headUrl,
    vocabUrl,
    codeSwitchEn: acousticLang !== 'en',
  };
}

/**
 * Resolve which STT engine and acoustic head to use for a target language and mode:
 * - Translate mode (EN -> Indic): ALWAYS uses Swanada `'en'` head -> Paar NMT (covers all 12 languages 100% locally).
 * - Direct Indic STT mode: uses Swanada native Indic head for 10 languages, and Web Speech fallback for `ur` & `as`.
 */
export function resolveSttTarget(langId, translateMode = false) {
  if (translateMode) {
    return { engine: 'swanada', acousticLang: 'en' };
  }
  const langConfig = getLanguage(langId);
  if (langConfig.swanadaSupported && SWANADA_SUPPORTED_CODES.has(langConfig.id)) {
    return { engine: 'swanada', acousticLang: langConfig.id };
  }
  return { engine: 'webspeech', acousticLang: langConfig.speechLocale };
}

function resamplePcmLinear(input, fromRate, toRate) {
  if (fromRate === toRate || input.length === 0) return new Float32Array(input);
  const ratio = fromRate / toRate;
  const outLen = Math.max(1, Math.round(input.length / ratio));
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const srcPos = i * ratio;
    const lo = Math.floor(srcPos);
    const hi = Math.min(lo + 1, input.length - 1);
    const frac = srcPos - lo;
    out[i] = input[lo] * (1 - frac) + input[hi] * frac;
  }
  return out;
}

/**
 * Create a live browser Swanada STT controller managing Worker + 16 kHz AudioWorklet capture.
 */
export function createSwanadaSttController() {
  const listeners = new Map();
  let swanadaBase = null;
  let isRemoteCrossOrigin = false;
  let workerClient = null;
  let workerBlobUrl = null;
  let workletBlobUrl = null;
  let workletLoaded = false;
  let loadedAcousticLang = null;
  let activeInitPromise = null;

  let audioCtx = null;
  let micStream = null;
  let micSource = null;
  let workletNode = null;
  let scriptProc = null;
  let silentSink = null;
  let watchdogTimer = null;
  let isStreaming = false;

  const emit = (event, payload) => {
    const fn = listeners.get(event);
    if (typeof fn === 'function') {
      try { fn(payload); } catch (_) {}
    }
  };

  async function resolveRuntimeBase() {
    if (swanadaBase) return { swanadaBase, isRemoteCrossOrigin };
    try {
      const probe = await fetch('/ai/swanada/models_manifest.json', { method: 'HEAD' });
      if (probe.ok) {
        swanadaBase = '/ai/swanada';
        isRemoteCrossOrigin = false;
        return { swanadaBase, isRemoteCrossOrigin };
      }
    } catch (_) {}
    swanadaBase = REMOTE_SWANADA_BASE;
    isRemoteCrossOrigin = true;
    return { swanadaBase, isRemoteCrossOrigin };
  }

  async function ensureEngine(acousticLang) {
    const { swanadaBase: base, isRemoteCrossOrigin: remote } = await resolveRuntimeBase();
    const tier = detectSwanadaTier();

    if (!workerClient) {
      const sdkUrl = remote
        ? `${base}/swanada.mjs?v=1.9.0`
        : `${window.location.origin}${base}/swanada.mjs?v=1.9.0`;
      const swanadaMod = await import(sdkUrl);
      const SwanadaWorkerClient = swanadaMod.SwanadaWorkerClient;

      let workerUrl = `${base}/stt-worker.mjs?v=1.9.0`;
      if (remote) {
        const shim = [
          `const mod = await import(${JSON.stringify(`${base}/swanada.mjs?v=1.9.0`)});`,
          `Object.assign(globalThis, mod);`,
          `await import(${JSON.stringify(`${base}/stt-worker.mjs?v=1.9.0`)});`,
        ].join('\n');
        workerBlobUrl = URL.createObjectURL(new Blob([shim], { type: 'text/javascript' }));
        workerUrl = workerBlobUrl;
      }

      workerClient = new SwanadaWorkerClient({
        workerUrl,
        wasmPaths: `${base}/ort/`,
      });

      workerClient.on('progress', (p) => {
        emit('progress', { ...p, language: acousticLang, tier });
      });

      workerClient.on('ready', (r) => {
        loadedAcousticLang = (r && r.language) || acousticLang;
        emit('ready', { ...r, language: loadedAcousticLang, tier });
      });

      workerClient.on('partial', (data) => {
        emit('partial', data);
      });

      workerClient.on('final', (data) => {
        emit('final', data);
      });

      workerClient.on('error', (err) => {
        if (err && err.fatal) {
          loadedAcousticLang = null;
          try { workerClient?.terminate(); } catch (_) {}
          workerClient = null;
        }
        emit('error', err);
      });
    }

    if (loadedAcousticLang === acousticLang) {
      return workerClient;
    }

    if (activeInitPromise) {
      try { await activeInitPromise; } catch (_) {}
      if (loadedAcousticLang === acousticLang) return workerClient;
    }

    const cfg = buildSwanadaModelConfig(acousticLang, tier, remote ? base : `${window.location.origin}${base}`);
    activeInitPromise = (async () => {
      try {
        await workerClient.init(cfg);
        loadedAcousticLang = acousticLang;
      } finally {
        activeInitPromise = null;
      }
    })();

    await activeInitPromise;
    return workerClient;
  }

  function attachScriptProcessorFallback(sourceNode, sinkNode) {
    if (!audioCtx || !sourceNode || !sinkNode || scriptProc) return;
    const createProc = audioCtx.createScriptProcessor || audioCtx.createJavaScriptNode;
    if (typeof createProc !== 'function') return;

    const proc = createProc.call(audioCtx, 4096, 1, 1);
    const srcRate = audioCtx.sampleRate || 48000;
    let accum = new Float32Array(0);

    proc.__flushTail = () => {
      if (accum.length > 0 && workerClient) {
        const tail = accum;
        accum = new Float32Array(0);
        workerClient.pushAudio(tail, false);
      }
    };

    proc.onaudioprocess = (ev) => {
      if (!isStreaming || !workerClient) return;
      const input = ev.inputBuffer.getChannelData(0);
      if (!input || input.length === 0) return;
      const pcm16k = srcRate === 16000 ? new Float32Array(input) : resamplePcmLinear(input, srcRate, 16000);
      const merged = new Float32Array(accum.length + pcm16k.length);
      merged.set(accum, 0);
      merged.set(pcm16k, accum.length);
      let pos = 0;
      while (pos + 1600 <= merged.length) {
        const slice = merged.slice(pos, pos + 1600);
        pos += 1600;
        workerClient.pushAudio(slice, false);
      }
      accum = merged.slice(pos);
    };

    sourceNode.connect(proc);
    proc.connect(sinkNode);
    scriptProc = proc;
  }

  async function start(acousticLang) {
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      throw new Error('Microphone capture requires HTTPS or localhost.');
    }

    // Request mic permission synchronously inside user gesture before awaiting ONNX init
    const streamPromise = navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: { ideal: 1 },
        echoCancellation: true,
        noiseSuppression: false,
        autoGainControl: true,
      },
    });

    try {
      await ensureEngine(acousticLang);
      micStream = await streamPromise;
    } catch (err) {
      streamPromise.then(s => s.getTracks().forEach(t => t.stop())).catch(() => {});
      throw err;
    }

    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextCtor();
    }
    if (audioCtx.state === 'suspended' || audioCtx.state === 'interrupted') {
      await audioCtx.resume().catch(() => {});
    }

    micSource = audioCtx.createMediaStreamSource(micStream);
    silentSink = audioCtx.createGain();
    silentSink.gain.value = 0;
    silentSink.connect(audioCtx.destination);

    workerClient.startStream();
    isStreaming = true;

    let usedWorklet = false;
    let receivedQuanta = 0;

    if (audioCtx.audioWorklet && typeof AudioWorkletNode === 'function') {
      try {
        if (!workletLoaded) {
          const { swanadaBase: base, isRemoteCrossOrigin: remote } = await resolveRuntimeBase();
          let modUrl = `${base}/audio-capture-worklet.js?v=1.5.4`;
          if (remote) {
            const resp = await fetch(modUrl);
            const code = await resp.text();
            workletBlobUrl = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
            modUrl = workletBlobUrl;
          }
          await audioCtx.audioWorklet.addModule(modUrl);
          workletLoaded = true;
        }

        const isMobile = detectSwanadaTier() === 'mobile';
        const node = new AudioWorkletNode(audioCtx, 'swanada-audio-capture-processor', {
          processorOptions: {
            chunkSamples: isMobile ? 2400 : 1600,
            sampleRate: audioCtx.sampleRate,
            noiseSuppressionEnabled: false,
            alcEnabled: true,
          },
        });
        workletNode = node;

        node.port.onmessage = (ev) => {
          const payload = ev.data;
          if (payload && payload.audioChunk && isStreaming && workerClient) {
            receivedQuanta++;
            const chunk = payload.audioChunk;
            workerClient.pushAudio(new Float32Array(chunk), false);
            if (!payload.isTail) {
              try {
                node.port.postMessage({ type: 'recycle', buffer: chunk.buffer }, [chunk.buffer]);
              } catch (_) {}
            }
          }
        };

        micSource.connect(node);
        node.connect(silentSink);
        usedWorklet = true;

        watchdogTimer = setTimeout(() => {
          if (isStreaming && receivedQuanta === 0 && micSource && silentSink) {
            try { workletNode?.disconnect(); } catch (_) {}
            workletNode = null;
            attachScriptProcessorFallback(micSource, silentSink);
          }
        }, 900);
      } catch (_) {
        usedWorklet = false;
      }
    }

    if (!usedWorklet) {
      attachScriptProcessorFallback(micSource, silentSink);
    }
  }

  async function stop() {
    if (!isStreaming) return;
    isStreaming = false;

    if (watchdogTimer) {
      clearTimeout(watchdogTimer);
      watchdogTimer = null;
    }

    const closingWorklet = workletNode;
    workletNode = null;
    const closingProc = scriptProc;
    scriptProc = null;
    const closingSource = micSource;
    micSource = null;
    const closingSink = silentSink;
    silentSink = null;
    const closingStream = micStream;
    micStream = null;

    if (closingWorklet) {
      try { closingWorklet.port.postMessage({ type: 'flush' }); } catch (_) {}
      await new Promise(r => setTimeout(r, 60));
      try { closingWorklet.disconnect(); } catch (_) {}
    }
    if (closingProc) {
      try { closingProc.__flushTail?.(); } catch (_) {}
      try { closingProc.onaudioprocess = null; } catch (_) {}
      try { closingProc.disconnect(); } catch (_) {}
    }
    try { closingSource?.disconnect(); } catch (_) {}
    try { closingSink?.disconnect(); } catch (_) {}
    try { closingStream?.getTracks().forEach(t => t.stop()); } catch (_) {}

    if (workerClient) {
      await workerClient.finishStream().catch(() => {});
    }
  }

  async function transcribeBuffer(pcm16kFloat32, acousticLang) {
    await ensureEngine(acousticLang);
    workerClient.startStream();
    const chunkSize = 3200;
    for (let i = 0; i < pcm16kFloat32.length; i += chunkSize) {
      workerClient.pushAudio(pcm16kFloat32.slice(i, i + chunkSize), false);
    }
    await workerClient.finishStream();
  }

  return {
    on(event, fn) {
      listeners.set(event, fn);
    },
    start,
    stop,
    ensureEngine,
    transcribeBuffer,
  };
}
