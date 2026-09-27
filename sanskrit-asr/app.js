/**
 * Su-śrotā (सुश्रोता) — In-Browser Sanskrit Speech Recognition
 * Powered by IndicConformer-CTC and WebML-Kit (ONNX Runtime WebAssembly SIMD).
 * 100% Client-Side. Zero Cloud Servers.
 */

import {
  createOnnxPipeline,
  isCached,
  clearCache,
  getCacheSize,
  formatSize,
} from './webml-kit.js';
import { devanagariToIast, formatSanskrit } from './transliterate.js';

// ─── Constants & Configuration ───

const MODEL_CONFIG = {
  task: 'automatic-speech-recognition',
  modelId: 'gnumanth/sushrota-sanskrit-asr-onnx',
  device: 'wasm',
  modelFile: 'sushrota_sanskrit_ctc_int8.onnx',
  preprocessorFile: 'preprocessor.onnx',
  vocabFile: 'sanskrit_vocab.json',
  cache: true,
};

const SAMPLE_RATE = 16000;
const MAX_RECORD_SECONDS = 30;

// ─── State ───

let pipeline = null;
let modelLoaded = false;
let isLoading = false;

let isRecording = false;
let mediaStream = null;
let audioContext = null;
let sourceNode = null;
let analyserNode = null;
let processorNode = null;
let pcmBuffer = [];
let recordTimer = null;
let recordStartTime = 0;

let currentAudioUrl = null;
let currentAudioBlob = null;
let animFrameId = null;

const historyItems = [];

// ─── DOM References ───

const $ = id => document.getElementById(id);
const btnLoadModel = $('btnLoadModel');
const loadCard = $('loadCard');
const mainApp = $('mainApp');
const progressBar = $('progressBar');
const progressFill = $('progressFill');
const progressText = $('progressText');
const statusBadge = $('statusBadge');
const cacheStatusWrap = $('cacheStatusWrap');
const cacheStatusText = $('cacheStatusText');
const btnClearCache = $('btnClearCache');

const btnRecord = $('btnRecord');
const recordTimeLabel = $('recordTimeLabel');
const canvasWaveform = $('canvasWaveform');
const dropZone = $('dropZone');
const fileInput = $('fileInput');

const resultSection = $('resultSection');
const devanagariOutput = $('devanagariOutput');
const iastOutput = $('iastOutput');
const statLatency = $('statLatency');
const statDuration = $('statDuration');
const statRtf = $('statRtf');
const statBackend = $('statBackend');

const btnCopyDev = $('btnCopyDev');
const btnCopyIast = $('btnCopyIast');
const btnExportJson = $('btnExportJson');
const audioPlayer = $('audioPlayer');
const historyList = $('historyList');
const historyEmpty = $('historyEmpty');

// ─── Formatting Helpers ───

function fmtSize(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 ** 3)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 ** 2)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

function fmtTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ─── Cache Management ───

export async function checkCacheStatus() {
  try {
    const cached =
      (await isCached('sushrota_sanskrit_ctc_int8.onnx')) ||
      (await isCached('sushrota-sanskrit-asr-onnx'));

    if (cached) {
      const size = await getCacheSize();
      const sizeStr = size > 0 ? ` (${formatSize(size)})` : ' (~178 MB)';
      if (cacheStatusWrap) cacheStatusWrap.hidden = false;
      if (cacheStatusText) {
        cacheStatusText.textContent = `Model cached in browser${sizeStr} · Instant load`;
      }
      if (btnLoadModel && !isLoading && !modelLoaded) {
        btnLoadModel.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Load from Local Cache (Instant)
        `;
      }
    } else {
      if (cacheStatusWrap) cacheStatusWrap.hidden = true;
      if (btnLoadModel && !isLoading && !modelLoaded) {
        btnLoadModel.textContent = 'Initialize Model (~178 MB)';
      }
    }
  } catch (err) {
    console.warn('Cache status check error:', err);
  }
}

export async function handleClearCache() {
  if (
    !confirm(
      'Clear locally cached Sanskrit ASR model weights (~178 MB)? You will need to re-download on next load.',
    )
  ) {
    return;
  }

  try {
    await clearCache();
    if (cacheStatusWrap) cacheStatusWrap.hidden = true;
    if (btnLoadModel && !isLoading && !modelLoaded) {
      btnLoadModel.textContent = 'Initialize Model (~178 MB)';
    }
    alert('Model cache cleared.');
  } catch (err) {
    alert(`Failed to clear cache: ${err.message}`);
  }
}

// ─── Initialize Model via WebML-Kit ───

export async function initModel() {
  if (modelLoaded || isLoading) return;
  isLoading = true;

  btnLoadModel.disabled = true;
  progressBar.hidden = false;
  progressText.textContent = 'Initializing WebML-Kit ONNX runtime...';
  progressFill.style.width = '10%';

  try {
    const cached =
      (await isCached('sushrota_sanskrit_ctc_int8.onnx')) ||
      (await isCached('sushrota-sanskrit-asr-onnx'));

    if (cached) {
      progressText.textContent = 'Loading models from local Cache API...';
      progressFill.style.width = '40%';
    }

    pipeline = await createOnnxPipeline(
      MODEL_CONFIG,
      (progress) => {
        if (progress.status === 'ready') {
          progressFill.style.width = '100%';
          progressText.textContent = `Loaded ${progress.file || 'asset'} from local cache`;
        } else if (progress.status === 'downloading') {
          const pct = progress.percent || 0;
          progressFill.style.width = `${Math.min(98, Math.max(10, pct))}%`;
          if (progress.total > 0) {
            progressText.textContent = `${progress.file || 'model'}: ${fmtSize(progress.loaded)} / ${fmtSize(progress.total)} (${pct}%)`;
          } else {
            progressText.textContent = `Downloading ${progress.file || 'model'}...`;
          }
        }
      },
    );

    progressFill.style.width = '100%';
    progressText.textContent = 'Model loaded & ready!';
    modelLoaded = true;

    // Transition UI
    setTimeout(() => {
      loadCard.style.display = 'none';
      mainApp.hidden = false;
      mainApp.scrollIntoView({ behavior: 'smooth' });
    }, 400);

    const numThreads = window.ort?.env?.wasm?.numThreads || 4;
    statusBadge.innerHTML = `<span class="dot green"></span> Ready (WebML-Kit · WASM SIMD ${numThreads}T)`;
    statusBadge.className = 'status-badge ready';

  } catch (err) {
    console.error('Failed to load Su-śrotā model via WebML-Kit:', err);
    progressText.textContent = `Error: ${err.message}`;
    progressFill.style.background = '#ef4444';
    btnLoadModel.disabled = false;
    btnLoadModel.textContent = 'Retry Download';
  } finally {
    isLoading = false;
  }
}

// ─── ASR Inference via WebML-Kit ───

export async function runInference(pcmFloat32) {
  if (!modelLoaded || !pipeline) {
    alert('Please initialize the model first.');
    return;
  }

  const durationSec = pcmFloat32.length / SAMPLE_RATE;
  if (durationSec < 0.2) {
    alert('Audio too short (less than 0.2s). Please record or provide a longer utterance.');
    return;
  }

  // Show running status
  resultSection.hidden = false;
  devanagariOutput.innerHTML = '<span class="loading-pulse">प्रक्रियते... (Transcribing via WebML-Kit)</span>';
  iastOutput.textContent = '...';
  statLatency.textContent = '...';
  statDuration.textContent = `${durationSec.toFixed(2)}s`;
  statRtf.textContent = '...';
  const numThreads = window.ort?.env?.wasm?.numThreads || 4;
  statBackend.textContent = `WASM SIMD (${numThreads}T)`;

  resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  const startTime = performance.now();

  try {
    const res = await pipeline(pcmFloat32);
    const elapsedMs = Math.round(performance.now() - startTime);
    const rtf = (elapsedMs / (durationSec * 1000)).toFixed(2);

    const rawText = res?.text || '';
    const devText = formatSanskrit(rawText);
    const iastText = devanagariToIast(devText);

    // Render output
    devanagariOutput.textContent = devText || '(No speech detected)';
    iastOutput.textContent = iastText || '—';

    statLatency.textContent = `${elapsedMs} ms`;
    statDuration.textContent = `${durationSec.toFixed(2)}s`;
    statRtf.textContent = `${rtf}x RTF`;

    // Save history item
    addToHistory({
      dev: devText,
      iast: iastText,
      duration: durationSec,
      latency: elapsedMs,
      rtf: rtf,
      audioUrl: currentAudioUrl,
      timestamp: new Date().toLocaleTimeString(),
    });

  } catch (err) {
    console.error('Inference error:', err);
    devanagariOutput.innerHTML = `<span style="color:#ef4444">Transcription failed: ${err.message}</span>`;
  }
}

// ─── Audio Recording & Visualizer ───

function drawWaveform() {
  if (!analyserNode || !isRecording) return;

  const canvas = canvasWaveform;
  const ctx = canvas.getContext('2d');
  const bufferLength = analyserNode.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  analyserNode.getByteTimeDomainData(dataArray);

  ctx.fillStyle = '#0a0a0d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = 2.2;
  ctx.strokeStyle = '#f59e0b';
  ctx.beginPath();

  const sliceWidth = canvas.width / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * canvas.height) / 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  }

  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();

  animFrameId = requestAnimationFrame(drawWaveform);
}

export async function toggleRecord() {
  if (!isRecording) {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
    } catch (err) {
      alert(`Microphone permission error: ${err.message}`);
      return;
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx({ sampleRate: SAMPLE_RATE });

    sourceNode = audioContext.createMediaStreamSource(mediaStream);
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 1024;

    processorNode = audioContext.createScriptProcessor(4096, 1, 1);
    pcmBuffer = [];

    processorNode.onaudioprocess = (e) => {
      if (!isRecording) return;
      const input = e.inputBuffer.getChannelData(0);
      for (let i = 0; i < input.length; i++) {
        pcmBuffer.push(input[i]);
      }
    };

    sourceNode.connect(analyserNode);
    analyserNode.connect(processorNode);
    processorNode.connect(audioContext.destination);

    isRecording = true;
    btnRecord.classList.add('recording');
    btnRecord.innerHTML = '<span class="rec-dot"></span> Stop Recording';
    canvasWaveform.hidden = false;
    recordStartTime = Date.now();

    drawWaveform();

    recordTimer = setInterval(() => {
      const elapsed = (Date.now() - recordStartTime) / 1000;
      recordTimeLabel.textContent = `${fmtTime(elapsed)} / ${fmtTime(MAX_RECORD_SECONDS)}`;
      if (elapsed >= MAX_RECORD_SECONDS) {
        toggleRecord();
      }
    }, 200);

  } else {
    // Stop recording
    isRecording = false;
    clearInterval(recordTimer);
    if (animFrameId) cancelAnimationFrame(animFrameId);

    btnRecord.classList.remove('recording');
    btnRecord.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg> Start Recording';
    canvasWaveform.hidden = true;
    recordTimeLabel.textContent = '00:00';

    if (processorNode) processorNode.disconnect();
    if (analyserNode) analyserNode.disconnect();
    if (sourceNode) sourceNode.disconnect();
    if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop());
    }
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close();
    }

    if (pcmBuffer.length > 0) {
      const pcmFloat32 = new Float32Array(pcmBuffer);
      // Create audio playback blob
      const wavBytes = encodeWav(pcmFloat32, SAMPLE_RATE);
      currentAudioBlob = new Blob([wavBytes], { type: 'audio/wav' });
      if (currentAudioUrl) URL.revokeObjectURL(currentAudioUrl);
      currentAudioUrl = URL.createObjectURL(currentAudioBlob);
      audioPlayer.src = currentAudioUrl;
      audioPlayer.hidden = false;

      // Run inference
      runInference(pcmFloat32);
    }
  }
}

// ─── WAV Encoder for Playback ───

function encodeWav(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return buffer;
}

// ─── File Audio Processing ───

export async function handleAudioFile(file) {
  if (!file) return;

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();
  const arrayBuffer = await file.arrayBuffer();

  try {
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    ctx.close();

    // Resample to 16kHz mono via OfflineAudioContext
    const offlineCtx = new OfflineAudioContext(1, Math.ceil(audioBuffer.duration * SAMPLE_RATE), SAMPLE_RATE);
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);

    const renderedBuffer = await offlineCtx.startRendering();
    const pcmFloat32 = renderedBuffer.getChannelData(0);

    if (currentAudioUrl) URL.revokeObjectURL(currentAudioUrl);
    currentAudioUrl = URL.createObjectURL(file);
    audioPlayer.src = currentAudioUrl;
    audioPlayer.hidden = false;

    return await runInference(pcmFloat32);
  } catch (err) {
    alert(`Could not decode audio file: ${err.message}`);
  }
}

// ─── Sample Audio Player ───

export async function playSample(samplePath, triggerBtn) {
  // Clear previous chip states
  document.querySelectorAll('.sample-chip').forEach(c => {
    c.classList.remove('processing', 'playing');
  });

  if (triggerBtn) {
    triggerBtn.classList.add('processing');
  }

  // Ensure model is initialized
  if (!modelLoaded) {
    const shouldLoad = confirm(
      'The Sanskrit ASR model (~178 MB) is not initialized yet. Initialize it now to transcribe this recitation?',
    );
    if (!shouldLoad) {
      triggerBtn?.classList.remove('processing');
      return;
    }
    await initModel();
    if (!modelLoaded) {
      triggerBtn?.classList.remove('processing');
      return;
    }
  }

  const sampleName =
    triggerBtn?.querySelector('.sample-name')?.textContent || 'Authentic Sanskrit Recitation';

  // Immediate visual feedback in Results section
  resultSection.hidden = false;
  devanagariOutput.innerHTML = `<span class="loading-pulse">प्रक्रियते... Transcribing ${sampleName}</span>`;
  iastOutput.textContent = 'Processing audio via WebML-Kit Conformer-CTC...';
  statLatency.textContent = '...';
  statDuration.textContent = '...';
  statRtf.textContent = '...';
  const numThreads = window.ort?.env?.wasm?.numThreads || 4;
  statBackend.textContent = `WASM SIMD (${numThreads}T)`;
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  try {
    const response = await fetch(samplePath);
    const blob = await response.blob();
    const cleanName = samplePath.split('/').pop().split('?')[0];
    const file = new File([blob], cleanName, { type: 'audio/wav' });

    await handleAudioFile(file);

    if (triggerBtn) {
      triggerBtn.classList.remove('processing');
      triggerBtn.classList.add('playing');
    }

    if (audioPlayer) {
      audioPlayer.play().catch(() => {});
      audioPlayer.onended = () => {
        triggerBtn?.classList.remove('playing');
      };
      audioPlayer.onpause = () => {
        triggerBtn?.classList.remove('playing');
      };
    }
  } catch (err) {
    console.error('Failed to play sample audio:', err);
    triggerBtn?.classList.remove('processing', 'playing');
  }
}

// ─── Session History ───

function addToHistory(item) {
  historyItems.unshift(item);
  if (historyItems.length > 10) historyItems.pop();
  renderHistory();
}

function renderHistory() {
  if (historyItems.length === 0) {
    historyEmpty.hidden = false;
    historyList.innerHTML = '';
    return;
  }
  historyEmpty.hidden = true;

  historyList.innerHTML = historyItems.map((item) => `
    <div class="history-card">
      <div class="history-top">
        <span class="history-time">${item.timestamp}</span>
        <span class="history-meta">${item.duration.toFixed(1)}s · ${item.latency}ms (${item.rtf}x)</span>
      </div>
      <div class="history-dev">${item.dev}</div>
      <div class="history-iast">${item.iast}</div>
      ${item.audioUrl ? `<audio controls src="${item.audioUrl}" class="mini-audio"></audio>` : ''}
    </div>
  `).join('');
}

// ─── Event Bindings ───

document.addEventListener('DOMContentLoaded', () => {
  // Check local cache on startup
  checkCacheStatus();

  btnLoadModel.addEventListener('click', initModel);
  btnClearCache?.addEventListener('click', handleClearCache);
  btnRecord.addEventListener('click', toggleRecord);

  // File Drop
  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    if (e.target.files?.length) {
      handleAudioFile(e.target.files[0]);
    }
  });

  ['dragenter', 'dragover'].forEach(name => {
    dropZone.addEventListener(name, (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    dropZone.addEventListener(name, (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    if (e.dataTransfer.files?.length) {
      handleAudioFile(e.dataTransfer.files[0]);
    }
  });

  // Sample Buttons with subtle processing animation
  document.querySelectorAll('[data-sample]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sample = btn.getAttribute('data-sample');
      playSample(sample, btn);
    });
  });

  // Copy Buttons
  btnCopyDev.addEventListener('click', () => {
    navigator.clipboard.writeText(devanagariOutput.textContent);
    btnCopyDev.textContent = 'Copied!';
    setTimeout(() => { btnCopyDev.textContent = 'Copy Devānagarī'; }, 1500);
  });

  btnCopyIast.addEventListener('click', () => {
    navigator.clipboard.writeText(iastOutput.textContent);
    btnCopyIast.textContent = 'Copied!';
    setTimeout(() => { btnCopyIast.textContent = 'Copy IAST'; }, 1500);
  });

  // Export JSON
  btnExportJson.addEventListener('click', () => {
    const data = {
      engine: 'webml-kit',
      model: 'Su-srota IndicConformer-CTC INT8',
      devanagari: devanagariOutput.textContent,
      iast: iastOutput.textContent,
      latency: statLatency.textContent,
      duration: statDuration.textContent,
      rtf: statRtf.textContent,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sushrota-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Keyboard shortcut: Spacebar to Record/Stop (when not focused in inputs)
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target === document.body && modelLoaded) {
      e.preventDefault();
      toggleRecord();
    }
  });
});
