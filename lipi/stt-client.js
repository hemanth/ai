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
  const nav = typeof navigator !== 'undefined' ? navigator : {};
  const scr = typeof screen !== 'undefined' ? screen : undefined;
  const ua = overrides.userAgent ?? (nav.userAgent || '');
  const mem = overrides.deviceMemory ?? nav.deviceMemory;
  const platform = overrides.platform ?? (nav.platform || '');
  const maxTouchPoints = overrides.maxTouchPoints ?? (nav.maxTouchPoints || 0);
  const screenWidth = overrides.screenWidth ?? (scr && typeof scr.width === 'number' ? scr.width : undefined);

  const isMobileUa = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  if (isMobileUa) return 'mobile';
  if (platform === 'MacIntel' && maxTouchPoints > 1) return 'mobile';
  if (maxTouchPoints > 1 && typeof screenWidth === 'number' && screenWidth > 0 && screenWidth < 1024) return 'mobile';
  if (typeof mem === 'number' && mem > 0 && mem <= 4) return 'mobile';
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
    executionProvider: 'wasm',
    numThreads: useMobile ? 1 : undefined,
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
  let workletLoaded = false;
  let workletLoadCtx = null;
  let workletLoadPromise = null;
  const pendingWorkletBlobUrls = new Set();
  let loadedAcousticLang = null;
  let activeInitPromise = null;
  let engineBootPromise = null;
  let activeStopPromise = null;
  let activeTargetLang = null;
  let destroySeq = 0;

  let audioCtx = null;
  let micStream = null;
  let micSource = null;
  let workletNode = null;
  let scriptProc = null;
  let silentSink = null;
  let watchdogTimer = null;
  let isStreaming = false;
  let sessionSeq = 0;
  let captureDesired = false;
  const pendingAcquiredStreams = new Set();
  const flushingStreams = new Set();
  const stoppedStreams = new WeakSet();
  let pendingCtxSuspend = null;
  let pendingCtxSuspendCtx = null;

  const revokeBlobUrl = (url) => {
    if (url && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
      try { URL.revokeObjectURL(url); } catch (_) {}
    }
  };

  const suspendCtxSafely = async (targetCtx) => {
    if (!targetCtx || targetCtx.state === 'closed' || typeof targetCtx.suspend !== 'function') return;
    if (pendingCtxSuspend && pendingCtxSuspendCtx === targetCtx) {
      await pendingCtxSuspend.catch(() => {});
      return;
    }
    const p = targetCtx.suspend().catch(() => {});
    pendingCtxSuspend = p;
    pendingCtxSuspendCtx = targetCtx;
    try {
      await p;
    } finally {
      if (pendingCtxSuspend === p) {
        pendingCtxSuspend = null;
        pendingCtxSuspendCtx = null;
      }
    }
  };

  const suspendIfIdleAndRunning = async (targetCtx) => {
    if (!captureDesired && !isStreaming && !micStream && audioCtx === targetCtx && targetCtx.state === 'running' && typeof targetCtx.suspend === 'function') {
      await suspendCtxSafely(targetCtx);
    }
  };

  const stopStreamTracks = (stream) => {
    if (!stream) return;
    pendingAcquiredStreams.delete(stream);
    flushingStreams.delete(stream);
    if (stoppedStreams.has(stream)) return;
    stoppedStreams.add(stream);
    try { stream.getTracks().forEach(t => t.stop()); } catch (_) {}
  };

  const cleanupAttemptResources = (stream, source, sink) => {
    stopStreamTracks(stream);
    try { source?.disconnect(); } catch (_) {}
    try { sink?.disconnect(); } catch (_) {}
    if (micStream === stream) {
      micStream = null;
      isStreaming = false;
    }
    if (micSource === source) {
      micSource = null;
    }
    if (silentSink === sink) {
      silentSink = null;
    }
  };

  const cleanupActiveCapture = () => {
    if (watchdogTimer) {
      clearTimeout(watchdogTimer);
      watchdogTimer = null;
    }
    isStreaming = false;
    const prevWorklet = workletNode;
    workletNode = null;
    const prevProc = scriptProc;
    scriptProc = null;
    const prevSource = micSource;
    micSource = null;
    const prevSink = silentSink;
    silentSink = null;
    const prevStream = micStream;
    micStream = null;

    if (prevWorklet) {
      try { prevWorklet.port.onmessage = null; } catch (_) {}
      try { prevWorklet.disconnect(); } catch (_) {}
    }
    if (prevProc) {
      try { prevProc.onaudioprocess = null; } catch (_) {}
      try { prevProc.disconnect(); } catch (_) {}
    }
    try { prevSource?.disconnect(); } catch (_) {}
    try { prevSink?.disconnect(); } catch (_) {}
    stopStreamTracks(prevStream);
  };

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

  async function bootWorkerClient(tier, initialLang) {
    if (workerClient) return workerClient;
    if (!engineBootPromise) {
      const bootGen = destroySeq;
      let localBoot = null;
      localBoot = (async () => {
        let localBlobUrl = null;
        let localClient = null;
        try {
          const { swanadaBase: base, isRemoteCrossOrigin: remote } = await resolveRuntimeBase();
          if (bootGen !== destroySeq) return null;

          const sdkUrl = remote
            ? `${base}/swanada.mjs?v=1.9.0`
            : `${window.location.origin}${base}/swanada.mjs?v=1.9.0`;
          const swanadaMod = await import(sdkUrl);
          if (bootGen !== destroySeq) return null;

          const SwanadaWorkerClient = swanadaMod.SwanadaWorkerClient;

          let workerUrl = `${base}/stt-worker.mjs?v=1.9.0`;
          if (remote) {
            const shim = [
              `const mod = await import(${JSON.stringify(`${base}/swanada.mjs?v=1.9.0`)});`,
              `Object.assign(globalThis, mod);`,
              `await import(${JSON.stringify(`${base}/stt-worker.mjs?v=1.9.0`)});`,
            ].join('\n');
            localBlobUrl = URL.createObjectURL(new Blob([shim], { type: 'text/javascript' }));
            workerUrl = localBlobUrl;
          }

          localClient = new SwanadaWorkerClient({
            workerUrl,
            wasmPaths: `${base}/ort/`,
          });

          if (bootGen !== destroySeq) {
            try { localClient.terminate?.(); } catch (_) {}
            revokeBlobUrl(localBlobUrl);
            return null;
          }

          if (workerClient) {
            try { localClient.terminate?.(); } catch (_) {}
            revokeBlobUrl(localBlobUrl);
            return workerClient;
          }

          workerBlobUrl = localBlobUrl;
          workerClient = localClient;

          workerClient.on('progress', (p) => {
            emit('progress', { ...p, language: activeTargetLang || loadedAcousticLang || initialLang, tier });
          });

          workerClient.on('ready', (r) => {
            loadedAcousticLang = (r && r.language) || activeTargetLang || initialLang;
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
              captureDesired = false;
              loadedAcousticLang = null;
              activeInitPromise = null;
              engineBootPromise = null;
              activeTargetLang = null;
              cleanupActiveCapture();
              for (const s of [...pendingAcquiredStreams]) {
                stopStreamTracks(s);
              }
              try { workerClient?.terminate(); } catch (_) {}
              workerClient = null;
              revokeBlobUrl(workerBlobUrl);
              workerBlobUrl = null;
              if (audioCtx && audioCtx.state === 'running' && typeof audioCtx.suspend === 'function') {
                void suspendCtxSafely(audioCtx);
              }
            }
            emit('error', err);
          });

          return workerClient;
        } catch (err) {
          if (localClient) {
            try { localClient.terminate?.(); } catch (_) {}
          }
          revokeBlobUrl(localBlobUrl);
          throw err;
        } finally {
          if (localBoot && engineBootPromise === localBoot) {
            engineBootPromise = null;
          }
        }
      })();
      engineBootPromise = localBoot;
    }

    const pendingBoot = engineBootPromise;
    const client = await pendingBoot;
    if (!client) {
      throw new Error('STT controller destroyed');
    }
    return client;
  }

  async function ensureEngine(acousticLang) {
    const entryGen = destroySeq;
    const tier = detectSwanadaTier();
    const client = await bootWorkerClient(tier, acousticLang);
    const { swanadaBase: base, isRemoteCrossOrigin: remote } = await resolveRuntimeBase();

    if (entryGen !== destroySeq || !workerClient || workerClient !== client) {
      throw new Error('STT controller destroyed');
    }

    if (loadedAcousticLang === acousticLang && workerClient === client) {
      return client;
    }

    while (activeInitPromise) {
      try { await activeInitPromise; } catch (_) {}
      if (entryGen !== destroySeq || !workerClient || workerClient !== client) {
        throw new Error('STT controller destroyed');
      }
      if (loadedAcousticLang === acousticLang) return workerClient;
    }

    const baseCfg = buildSwanadaModelConfig(acousticLang, tier, remote ? base : `${window.location.origin}${base}`);
    const cfg = {
      ...baseCfg,
      modelTier: tier,
      executionProvider: 'wasm',
      numThreads: tier === 'mobile' ? 1 : undefined,
    };
    activeTargetLang = acousticLang;
    const initGen = destroySeq;
    let localInit = null;
    localInit = (async () => {
      try {
        await client.init(cfg);
        if (initGen === destroySeq && workerClient === client) {
          loadedAcousticLang = acousticLang;
        }
      } finally {
        if (localInit && activeInitPromise === localInit) {
          activeInitPromise = null;
        }
      }
    })();
    activeInitPromise = localInit;

    await localInit;
    if (initGen !== destroySeq || !workerClient || workerClient !== client) {
      throw new Error('STT controller destroyed');
    }
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

  async function ensureWorkletLoaded(targetCtx) {
    if (workletLoaded && workletLoadCtx === targetCtx) return;
    if (workletLoadPromise && workletLoadCtx === targetCtx) {
      return workletLoadPromise;
    }
    let localLoad = null;
    localLoad = (async () => {
      let localWorkletBlobUrl = null;
      try {
        const { swanadaBase: base, isRemoteCrossOrigin: remote } = await resolveRuntimeBase();
        if (audioCtx !== targetCtx || targetCtx.state === 'closed') return;
        let modUrl = `${base}/audio-capture-worklet.js?v=1.5.4`;
        if (remote) {
          const resp = await fetch(modUrl);
          if (audioCtx !== targetCtx || targetCtx.state === 'closed') return;
          const code = await resp.text();
          if (audioCtx !== targetCtx || targetCtx.state === 'closed') return;
          localWorkletBlobUrl = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
          pendingWorkletBlobUrls.add(localWorkletBlobUrl);
          modUrl = localWorkletBlobUrl;
        }
        await targetCtx.audioWorklet.addModule(modUrl);
        if (audioCtx === targetCtx && targetCtx.state !== 'closed') {
          workletLoaded = true;
        }
      } finally {
        if (localWorkletBlobUrl) {
          revokeBlobUrl(localWorkletBlobUrl);
          pendingWorkletBlobUrls.delete(localWorkletBlobUrl);
          localWorkletBlobUrl = null;
        }
        if (workletLoadPromise === localLoad) {
          workletLoadPromise = null;
        }
      }
    })();
    workletLoadCtx = targetCtx;
    workletLoadPromise = localLoad;
    return localLoad;
  }

  async function start(acousticLang) {
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      throw new Error('Microphone capture requires HTTPS or localhost.');
    }

    const attemptId = ++sessionSeq;
    const startDestroyGen = destroySeq;
    activeStopPromise = null;
    captureDesired = true;
    cleanupActiveCapture();
    for (const s of [...pendingAcquiredStreams]) {
      stopStreamTracks(s);
    }

    // Request mic permission synchronously inside user gesture before awaiting ONNX init
    let localAcquiredStream = null;
    const streamPromise = navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: { ideal: 1 },
        echoCancellation: true,
        noiseSuppression: false,
        autoGainControl: true,
      },
    }).then((s) => {
      if (attemptId !== sessionSeq || startDestroyGen !== destroySeq || !captureDesired) {
        stopStreamTracks(s);
        return null;
      }
      localAcquiredStream = s;
      pendingAcquiredStreams.add(s);
      return s;
    });

    let acquiredStream = null;
    try {
      const [, stream] = await Promise.all([ensureEngine(acousticLang), streamPromise]);
      acquiredStream = stream;
    } catch (err) {
      stopStreamTracks(localAcquiredStream);
      streamPromise.then(s => stopStreamTracks(s)).catch(() => {});
      if (attemptId === sessionSeq) {
        captureDesired = false;
      }
      if (attemptId !== sessionSeq || startDestroyGen !== destroySeq) {
        return;
      }
      throw err;
    }

    if (!acquiredStream || attemptId !== sessionSeq || startDestroyGen !== destroySeq || !captureDesired) {
      stopStreamTracks(acquiredStream || localAcquiredStream);
      return;
    }

    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx || audioCtx.state === 'closed') {
      try {
        audioCtx = new AudioContextCtor({ latencyHint: 'interactive' });
      } catch (_) {
        audioCtx = new AudioContextCtor();
      }
      workletLoaded = false;
      workletLoadCtx = audioCtx;
      workletLoadPromise = null;
    }
    const targetCtx = audioCtx;
    if (pendingCtxSuspend && pendingCtxSuspendCtx === targetCtx) {
      await pendingCtxSuspend.catch(() => {});
      if (!workerClient || !captureDesired || attemptId !== sessionSeq || startDestroyGen !== destroySeq || audioCtx !== targetCtx || targetCtx.state === 'closed') {
        stopStreamTracks(acquiredStream);
        await suspendIfIdleAndRunning(targetCtx);
        return;
      }
    }
    if (targetCtx.state === 'suspended' || targetCtx.state === 'interrupted') {
      await targetCtx.resume().catch(() => {});
    }

    if (!workerClient || !captureDesired || attemptId !== sessionSeq || startDestroyGen !== destroySeq || audioCtx !== targetCtx || targetCtx.state === 'closed') {
      stopStreamTracks(acquiredStream);
      await suspendIfIdleAndRunning(targetCtx);
      return;
    }

    cleanupActiveCapture();

    let localSource = null;
    let localSink = null;
    try {
      localSource = targetCtx.createMediaStreamSource(acquiredStream);
      localSink = targetCtx.createGain();
      localSink.gain.value = 0;
      localSink.connect(targetCtx.destination);
    } catch (err) {
      cleanupAttemptResources(acquiredStream, localSource, localSink);
      if (attemptId === sessionSeq) {
        captureDesired = false;
      }
      await suspendIfIdleAndRunning(targetCtx);
      throw err;
    }

    if (!workerClient || !captureDesired || attemptId !== sessionSeq || startDestroyGen !== destroySeq) {
      cleanupAttemptResources(acquiredStream, localSource, localSink);
      await suspendIfIdleAndRunning(targetCtx);
      return;
    }

    pendingAcquiredStreams.delete(acquiredStream);
    micStream = acquiredStream;
    micSource = localSource;
    silentSink = localSink;

    workerClient.startStream();
    isStreaming = true;

    let usedWorklet = false;
    let receivedQuanta = 0;

    if (targetCtx.audioWorklet && typeof AudioWorkletNode === 'function') {
      try {
        await ensureWorkletLoaded(targetCtx);

        if (!workerClient || !captureDesired || attemptId !== sessionSeq || !isStreaming || startDestroyGen !== destroySeq || audioCtx !== targetCtx || targetCtx.state === 'closed') {
          cleanupAttemptResources(acquiredStream, localSource, localSink);
          await suspendIfIdleAndRunning(targetCtx);
          return;
        }

        const isMobile = detectSwanadaTier() === 'mobile';
        const node = new AudioWorkletNode(targetCtx, 'swanada-audio-capture-processor', {
          processorOptions: {
            chunkSamples: isMobile ? 2400 : 1600,
            sampleRate: targetCtx.sampleRate,
            noiseSuppressionEnabled: false,
            alcEnabled: true,
          },
        });
        workletNode = node;

        node.port.onmessage = (ev) => {
          const payload = ev.data;
          if (attemptId === sessionSeq && payload && payload.audioChunk && isStreaming && workerClient) {
            receivedQuanta++;
            if (receivedQuanta === 1 && watchdogTimer) {
              clearTimeout(watchdogTimer);
              watchdogTimer = null;
            }
            const chunk = payload.audioChunk;
            workerClient.pushAudio(new Float32Array(chunk), false);
            if (!payload.isTail) {
              try {
                node.port.postMessage({ type: 'recycle', buffer: chunk.buffer }, [chunk.buffer]);
              } catch (_) {}
            }
          }
        };

        localSource.connect(node);
        node.connect(localSink);
        usedWorklet = true;

        watchdogTimer = setTimeout(() => {
          watchdogTimer = null;
          if (attemptId === sessionSeq && isStreaming && receivedQuanta === 0 && micSource === localSource && silentSink === localSink) {
            try { workletNode?.disconnect(); } catch (_) {}
            workletNode = null;
            attachScriptProcessorFallback(localSource, localSink);
          }
        }, 2500);
      } catch (_) {
        usedWorklet = false;
        if (!workerClient || !captureDesired || attemptId !== sessionSeq || !isStreaming || startDestroyGen !== destroySeq || audioCtx !== targetCtx || targetCtx.state === 'closed') {
          cleanupAttemptResources(acquiredStream, localSource, localSink);
          await suspendIfIdleAndRunning(targetCtx);
          return;
        }
      }
    }

    if (!usedWorklet && attemptId === sessionSeq && isStreaming && startDestroyGen === destroySeq && micSource === localSource && silentSink === localSink) {
      attachScriptProcessorFallback(localSource, localSink);
    }
  }

  async function stop() {
    if (activeStopPromise) return activeStopPromise;

    sessionSeq++;
    const stopSeq = sessionSeq;
    captureDesired = false;

    if (watchdogTimer) {
      clearTimeout(watchdogTimer);
      watchdogTimer = null;
    }

    for (const s of [...pendingAcquiredStreams]) {
      stopStreamTracks(s);
    }

    if (!isStreaming) {
      if (audioCtx && audioCtx.state === 'running') {
        const targetCtx = audioCtx;
        const canSuspend = typeof audioCtx.suspend === 'function';
        const suspendPromise = (async () => {
          if (canSuspend) {
            await suspendCtxSafely(targetCtx);
          } else if (typeof targetCtx.close === 'function') {
            await targetCtx.close().catch(() => {});
            if (audioCtx === targetCtx) {
              audioCtx = null;
              workletLoaded = false;
              workletLoadCtx = null;
              workletLoadPromise = null;
            }
          }
        })();
        activeStopPromise = suspendPromise;
        try {
          await suspendPromise;
        } finally {
          if (activeStopPromise === suspendPromise) {
            activeStopPromise = null;
          }
        }
      }
      return;
    }
    isStreaming = false;

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
    if (closingStream) {
      flushingStreams.add(closingStream);
    }

    const localStop = (async () => {
      if (closingWorklet) {
        try { closingWorklet.port.postMessage({ type: 'flush' }); } catch (_) {}
        await new Promise(r => setTimeout(r, 60));
        try { closingWorklet.disconnect(); } catch (_) {}
        try { closingWorklet.port.onmessage = null; } catch (_) {}
      }
      if (closingProc) {
        try { closingProc.__flushTail?.(); } catch (_) {}
        try { closingProc.onaudioprocess = null; } catch (_) {}
        try { closingProc.disconnect(); } catch (_) {}
      }
      try { closingSource?.disconnect(); } catch (_) {}
      try { closingSink?.disconnect(); } catch (_) {}
      stopStreamTracks(closingStream);

      if (stopSeq !== sessionSeq || isStreaming) {
        return;
      }

      if (audioCtx && audioCtx.state !== 'closed') {
        const targetCtx = audioCtx;
        if (typeof audioCtx.suspend === 'function') {
          await suspendCtxSafely(targetCtx);
        } else if (typeof targetCtx.close === 'function') {
          await targetCtx.close().catch(() => {});
          if (audioCtx === targetCtx) {
            audioCtx = null;
            workletLoaded = false;
            workletLoadCtx = null;
            workletLoadPromise = null;
          }
        }
      }

      if (stopSeq !== sessionSeq || isStreaming) {
        return;
      }

      if (workerClient) {
        await workerClient.finishStream().catch(() => {});
      }
    })();

    activeStopPromise = localStop;
    try {
      await localStop;
    } finally {
      if (activeStopPromise === localStop) {
        activeStopPromise = null;
      }
    }
  }

  async function destroy() {
    destroySeq++;
    captureDesired = false;
    pendingCtxSuspend = null;
    pendingCtxSuspendCtx = null;
    engineBootPromise = null;
    activeInitPromise = null;
    activeTargetLang = null;
    await stop();
    for (const s of [...pendingAcquiredStreams]) {
      stopStreamTracks(s);
    }
    for (const s of [...flushingStreams]) {
      stopStreamTracks(s);
    }
    if (audioCtx && audioCtx.state !== 'closed' && typeof audioCtx.close === 'function') {
      await audioCtx.close().catch(() => {});
    }
    audioCtx = null;
    workletLoaded = false;
    workletLoadCtx = null;
    workletLoadPromise = null;
    try { workerClient?.terminate?.(); } catch (_) {}
    workerClient = null;
    loadedAcousticLang = null;
    revokeBlobUrl(workerBlobUrl);
    workerBlobUrl = null;
    for (const url of pendingWorkletBlobUrls) {
      revokeBlobUrl(url);
    }
    pendingWorkletBlobUrls.clear();
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
    destroy,
    ensureEngine,
    transcribeBuffer,
  };
}
