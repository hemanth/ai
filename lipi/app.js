/**
 * ಕನ್ನಡ Voice Editor — app.js
 *
 * LIVE:   Web Speech API streams text word-by-word as user speaks
 * RECORD: ScriptProcessorNode silently captures raw PCM in parallel
 * POLISH: User clicks ✨ Polish → Whisper re-transcribes the raw audio for accuracy
 * FILE:   Uploaded audio goes straight to Whisper
 */

import { transliterate } from './transliterate.js';

const MODELS = [
  { id: 'astronova001/whisper-small-kannada-ONNX', name: 'Whisper Small · Kannada', size: '~244 MB' },
  { id: 'astronova001/whisper-kannada-tiny-ONNX',  name: 'Whisper Tiny · Kannada',  size: '~75 MB'  },
];

const CHUNK_SEC = 10;
const SR = 16000;

// ─── Voice Commands ───
const DEFAULT_COMMANDS = [
  { trigger: 'next line',         output: '\n',  builtin: true },
  { trigger: 'new line',          output: '\n',  builtin: true },
  { trigger: 'new paragraph',     output: '\n\n', builtin: true },
  { trigger: 'full stop',         output: '.',   builtin: true },
  { trigger: 'period',            output: '.',   builtin: true },
  { trigger: 'comma',             output: ',',   builtin: true },
  { trigger: 'question mark',     output: '?',   builtin: true },
  { trigger: 'exclamation mark',  output: '!',   builtin: true },
  { trigger: 'open bracket',      output: '(',   builtin: true },
  { trigger: 'close bracket',     output: ')',   builtin: true },
  { trigger: 'colon',             output: ':',   builtin: true },
  { trigger: 'semicolon',         output: ';',   builtin: true },
];

function loadCommands() {
  try {
    const saved = JSON.parse(localStorage.getItem('lipi-commands') || '[]');
    return [...DEFAULT_COMMANDS, ...saved];
  } catch { return [...DEFAULT_COMMANDS]; }
}

function saveCustomCommands(cmds) {
  const custom = cmds.filter(c => !c.builtin);
  try { localStorage.setItem('lipi-commands', JSON.stringify(custom)); } catch {}
}

let voiceCommands = loadCommands();

function processVoiceCommands(text) {
  // Sort by trigger length (longest first) to match greedy
  const sorted = [...voiceCommands].sort((a, b) => b.trigger.length - a.trigger.length);
  let result = text;
  for (const cmd of sorted) {
    const re = new RegExp(cmd.trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(re, cmd.output);
  }
  return result;
}

// ─── Pause detection ───
let pauseEnabled = false;
let pauseThreshold = 1.5; // seconds
let lastFinalTime = 0;
let pauseTimer = null;

function loadPauseSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('lipi-pause') || '{}');
    pauseEnabled = s.enabled || false;
    pauseThreshold = s.threshold || 1.5;
  } catch {}
}

function savePauseSettings() {
  try { localStorage.setItem('lipi-pause', JSON.stringify({ enabled: pauseEnabled, threshold: pauseThreshold })); } catch {}
}

loadPauseSettings();

const state = {
  phase: 'idle',
  modelId: MODELS[0].id,
  modelReady: false,
  isRecording: false,
  kannadaMode: true,
};

let worker, audioCtx, mediaStream, scriptProc, audioSrc;
let recognition = null;
let interimSpan = null;
let pcmChunks = [];          // raw audio saved for polish
let lastSessionPCM = null;   // merged PCM from last recording session
let sessionStartMark = null; // DOM marker for where this session's text begins

const $ = s => document.querySelector(s);

// ─── Boot ───
document.addEventListener('DOMContentLoaded', () => {
  populateModels();
  initWorker();
  bind();
  loadDoc();
  setPhase('ready');

  // Check hash for direct link to editor
  if (location.hash === '#editor') openEditor();
});

// ─── View switching ───
function openEditor() {
  $('#landing').hidden = true;
  $('#editor-view').hidden = false;
  // Don't auto-focus on mobile — avoids keyboard popping up on entry
  const isMobile = window.matchMedia('(max-width: 600px)').matches || 'ontouchstart' in window;
  if (!isMobile) $('#editor')?.focus();
  history.replaceState(null, '', '#editor');

  // Preload Whisper model in the background
  if (!state.modelReady) {
    const preload = () => worker.postMessage({ action: 'load-model', modelId: state.modelId });
    if ('requestIdleCallback' in window) requestIdleCallback(preload, { timeout: 3000 });
    else setTimeout(preload, 1000);
  }
}

function closeEditor() {
  // Stop recording if active
  if (state.isRecording) stopRec();
  $('#editor-view').hidden = true;
  $('#landing').hidden = false;
  history.replaceState(null, '', location.pathname);
}

// ═══════════════════════════════════
//  Web Speech API — real-time streaming
// ═══════════════════════════════════
async function initSpeech() {
  const SpeechAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechAPI) {
    toast('Speech API not available. Use Chrome or Edge.', 'error');
    return false;
  }

  recognition = new SpeechAPI();
  recognition.lang = 'kn-IN';
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  // Try on-device recognition if supported (no cloud, works offline)
  if ('processLocally' in recognition) {
    try {
      const availability = await SpeechAPI.available({ langs: ['kn-IN'], processLocally: true });
      if (availability === 'available') {
        recognition.processLocally = true;
        console.log('[Lipi] On-device Kannada recognition available');
      } else if (availability === 'downloadable') {
        toast('Downloading on-device Kannada model…', 'info');
        await SpeechAPI.install({ langs: ['kn-IN'], processLocally: true });
        recognition.processLocally = true;
        console.log('[Lipi] On-device Kannada model installed');
      } else {
        console.log('[Lipi] On-device not available for Kannada, using cloud');
      }
    } catch (e) {
      console.log('[Lipi] On-device check failed, using cloud:', e.message);
    }
  }

  recognition.onresult = (event) => {
    const ed = $('#editor');
    if (!ed) return;

    let interim = '', final = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const t = event.results[i][0].transcript;
      if (event.results[i].isFinal) final += t;
      else interim += t;
    }

    // Commit final text
    if (final) {
      removeInterim();
      // Process voice commands before inserting
      const processed = processVoiceCommands(final.trim());
      if (processed) {
        // Handle newlines: split by \n and insert <br> nodes
        const parts = processed.split('\n');
        parts.forEach((part, i) => {
          if (i > 0) ed.appendChild(document.createElement('br'));
          if (part) {
            if (i === 0 && ed.textContent.trim()) ed.appendChild(document.createTextNode(' '));
            ed.appendChild(document.createTextNode(part));
          }
        });
        ed.scrollTop = ed.scrollHeight;
        saveDoc();
      }

      // Reset pause timer
      lastFinalTime = Date.now();
      clearTimeout(pauseTimer);
      if (pauseEnabled && state.isRecording) {
        pauseTimer = setTimeout(() => {
          if (state.isRecording && ed.textContent.trim()) {
            ed.appendChild(document.createElement('br'));
            ed.scrollTop = ed.scrollHeight;
            saveDoc();
          }
        }, pauseThreshold * 1000);
      }
    }

    // Show interim (partial, still changing)
    if (interim) {
      if (!interimSpan) {
        interimSpan = document.createElement('span');
        interimSpan.className = 'interim';
        if (ed.textContent.trim() && !final) ed.appendChild(document.createTextNode(' '));
        ed.appendChild(interimSpan);
      }
      interimSpan.textContent = interim;
      ed.scrollTop = ed.scrollHeight;
    }
  };

  recognition.onerror = (event) => {
    if (event.error === 'no-speech' || event.error === 'aborted') return;
    console.warn('Speech error:', event.error);
  };

  recognition.onend = () => {
    if (state.isRecording) {
      try { recognition.start(); } catch {}
    }
  };

  return true;
}

function removeInterim() {
  if (interimSpan && interimSpan.parentNode) {
    interimSpan.remove();
    interimSpan = null;
  }
}

// ═══════════════════════════════════
//  Whisper Worker — for polish + file upload
// ═══════════════════════════════════
function initWorker() {
  worker = new Worker('./worker.js', { type: 'module' });
  worker.onmessage = ({ data: m }) => {
    switch (m.type) {
      case 'model-loading': showProg(0, 'Downloading Whisper…'); break;
      case 'model-progress':
        if (m.status === 'progress' && m.total)
          showProg(Math.round(m.loaded / m.total * 100), m.file);
        break;
      case 'model-ready':
        hideProg();
        state.modelReady = true;
        // If polish was waiting for model, trigger it now
        if (state._polishPending) { state._polishPending = false; doPolish(); }
        if (state._filePending) { state._filePending(); state._filePending = null; }
        break;
      case 'model-error': hideProg(); toast('Model error: ' + m.error, 'error'); break;
      case 'transcription-chunk': onWhisperChunk(m.text, m.isFinal); break;
      case 'transcription-error': toast('Whisper error: ' + m.error, 'error'); setPhase('ready'); break;
    }
  };
}

function ensureModel(cb) {
  if (state.modelReady) { cb(); return; }
  state._filePending = cb;
  worker.postMessage({ action: 'load-model', modelId: state.modelId });
}

// ═══════════════════════════════════
//  RECORD — auto-detects Speech API vs Whisper fallback
//
//  Speech API available (Chrome/Edge/Safari):
//    → Web Speech streams text live + PCM captured for polish
//  No Speech API (Firefox, etc.):
//    → Whisper processes 5s audio chunks while recording
// ═══════════════════════════════════

const hasSpeechAPI = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
let chunkTimer = null;

async function toggleRec() {
  state.isRecording ? stopRec() : await startRec();
}

async function startRec() {
  // For Whisper fallback, ensure model is loaded first
  if (!hasSpeechAPI && !state.modelReady) {
    toast('Downloading Whisper model for speech…', 'info');
    ensureModel(() => startRec());
    return;
  }

  // Init speech recognition if available
  if (hasSpeechAPI && !recognition && !(await initSpeech())) {
    // Speech init failed, try Whisper fallback
    if (!state.modelReady) {
      toast('Downloading Whisper model…', 'info');
      ensureModel(() => startRec());
      return;
    }
  }

  try {
    // Get mic stream
    if (!audioCtx || audioCtx.state === 'closed') audioCtx = new AudioContext({ sampleRate: SR });
    if (audioCtx.state === 'suspended') await audioCtx.resume();

    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: { sampleRate: SR, channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });

    // Start Web Speech API if available
    if (recognition) {
      try { recognition.start(); } catch {}
    }

    // Start raw PCM capture (for polish, or for Whisper fallback)
    audioSrc = audioCtx.createMediaStreamSource(mediaStream);
    scriptProc = audioCtx.createScriptProcessor(4096, 1, 1);
    pcmChunks = [];

    scriptProc.onaudioprocess = (e) => {
      pcmChunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
    };

    audioSrc.connect(scriptProc);
    scriptProc.connect(audioCtx.destination);

    // Mark where this session's recorded text starts
    const ed = $('#editor');
    if (ed) {
      // Remove any stale marks from a previous session
      ed.querySelectorAll('.session-start, .session-end').forEach(m => m.remove());

      sessionStartMark = document.createElement('span');
      sessionStartMark.className = 'session-mark session-start';
      ed.appendChild(sessionStartMark);
    }

    state.isRecording = true;
    setPhase('recording');

    // Whisper fallback: send chunks every 5s while recording
    if (!recognition) {
      chunkTimer = setInterval(() => flushChunk(false), 5000);
    }

  } catch (err) {
    toast('Microphone access denied.', 'error');
  }
}

function stopRec() {
  // Stop chunk timer (Whisper fallback)
  if (chunkTimer) { clearInterval(chunkTimer); chunkTimer = null; }

  // Stop speech recognition
  if (recognition) { try { recognition.stop(); } catch {} }

  // Stop PCM capture
  if (scriptProc) { scriptProc.disconnect(); scriptProc.onaudioprocess = null; scriptProc = null; }
  if (audioSrc) { audioSrc.disconnect(); audioSrc = null; }
  if (mediaStream) { mediaStream.getTracks().forEach(t => t.stop()); mediaStream = null; }

  // Commit interim text
  removeInterim();

  // Place end mark after the recorded text
  const ed = $('#editor');
  if (ed) {
    const endMark = document.createElement('span');
    endMark.className = 'session-mark session-end';
    ed.appendChild(endMark);
  }

  // Whisper fallback: flush remaining audio
  if (!recognition) {
    flushChunk(true);
  }

  // Merge and save PCM for polish
  if (pcmChunks.length > 0) {
    const totalLen = pcmChunks.reduce((s, a) => s + a.length, 0);
    lastSessionPCM = new Float32Array(totalLen);
    let off = 0;
    for (const c of pcmChunks) { lastSessionPCM.set(c, off); off += c.length; }
    pcmChunks = [];

    showPolishBtn(true);
  } else {
    // No audio captured — hide polish, remove marks
    showPolishBtn(false);
    ed?.querySelectorAll('.session-start, .session-end').forEach(m => m.remove());
  }

  state.isRecording = false;
  setPhase('ready');
  saveDoc();
}

// ─── Whisper fallback: send accumulated audio chunk to worker ───
let _chunkN = 0;

function flushChunk(isFinal) {
  if (pcmChunks.length === 0) return;

  // Merge accumulated samples
  const totalLen = pcmChunks.reduce((s, a) => s + a.length, 0);
  const merged = new Float32Array(totalLen);
  let off = 0;
  for (const c of pcmChunks) { merged.set(c, off); off += c.length; }

  // Don't clear pcmChunks here — stopRec needs them for polish
  // Instead, copy and track what's been sent
  if (!isFinal) {
    pcmChunks = []; // reset for next interval (polish will use lastSessionPCM anyway)
  }

  // Skip silence
  const rms = Math.sqrt(merged.reduce((s, v) => s + v * v, 0) / merged.length);
  if (rms < 0.005) return;

  worker.postMessage(
    { action: 'transcribe-chunk', audioData: merged, chunkId: ++_chunkN, isFinal },
    [merged.buffer]
  );
}

// ═══════════════════════════════════
//  POLISH — re-transcribe with Whisper
// ═══════════════════════════════════
function showPolishBtn(show) {
  const btn = $('#polish-btn');
  if (btn) {
    btn.hidden = !show;
    btn.disabled = false;
  }
}

function lockEditor() {
  const ed = $('#editor');
  if (ed) { ed.contentEditable = 'false'; ed.classList.add('is-polishing'); }
}

function unlockEditor() {
  const ed = $('#editor');
  if (ed) { ed.contentEditable = 'true'; ed.classList.remove('is-polishing'); }
}

function startPolish() {
  if (!lastSessionPCM) {
    toast('Nothing to polish — record first.', 'error');
    return;
  }

  const btn = $('#polish-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Polishing…'; }
  lockEditor();

  if (!state.modelReady) {
    state._polishPending = true;
    toast('Downloading Whisper model…', 'info');
    worker.postMessage({ action: 'load-model', modelId: state.modelId });
    return;
  }

  doPolish();
}

function doPolish() {
  const btn = $('#polish-btn');
  if (btn) { btn.textContent = 'Polishing…'; }
  lockEditor();

  // Remove only the recorded text (between session-start and session-end marks)
  const ed = $('#editor');
  const startMark = ed?.querySelector('.session-start');
  const endMark = ed?.querySelector('.session-end');

  if (startMark && endMark) {
    // Remove everything between start and end marks
    let node = startMark.nextSibling;
    while (node && node !== endMark) {
      const next = node.nextSibling;
      node.remove();
      node = next;
    }
  }

  // Send audio to Whisper in chunks
  const chunkSamples = CHUNK_SEC * SR;
  const totalChunks = Math.ceil(lastSessionPCM.length / chunkSamples);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSamples;
    const end = Math.min(start + chunkSamples, lastSessionPCM.length);
    const chunk = lastSessionPCM.slice(start, end);

    worker.postMessage(
      { action: 'transcribe-chunk', audioData: chunk, chunkId: i + 1, isFinal: i === totalChunks - 1 },
      [chunk.buffer]
    );
  }

  lastSessionPCM = null; // consumed
}

let polishMode = false;

function onWhisperChunk(text, isFinal) {
  const ed = $('#editor');
  if (!ed) return;
  const t = (text || '').trim();

  if (t) {
    // Insert polished text before the end mark (or at end if no mark)
    const endMark = ed.querySelector('.session-end');
    const span = document.createElement('span');
    span.className = 'polished';
    span.textContent = t;

    if (endMark) {
      endMark.parentNode.insertBefore(document.createTextNode(' '), endMark);
      endMark.parentNode.insertBefore(span, endMark);
    } else {
      if (ed.textContent.trim()) ed.appendChild(document.createTextNode(' '));
      ed.appendChild(span);
    }

    setTimeout(() => span.classList.add('settled'), 1200);
    ed.scrollTop = ed.scrollHeight;
  }

  if (isFinal) {
    ed.querySelectorAll('.polished').forEach(s => s.replaceWith(document.createTextNode(s.textContent)));
    // Clean up marks
    ed.querySelectorAll('.session-start, .session-end').forEach(m => m.remove());
    const btn = $('#polish-btn');
    if (btn) { btn.textContent = 'Polish'; btn.hidden = true; }
    unlockEditor();
    saveDoc();
    sessionStartMark = null;
  }
}

// ─── Phase ───
function setPhase(p) {
  state.phase = p;
  const mic = $('#mic'), lbl = $('#mic-label'), up = $('#upload-btn');

  if (mic) {
    mic.disabled = !['ready', 'recording'].includes(p);
    mic.classList.toggle('is-recording', state.isRecording);
  }

  if (lbl) {
    lbl.dataset.phase = p;
    lbl.textContent = {
      idle: '',
      ready: '',
      recording: '● Streaming…',
      processing: 'Processing file…',
    }[p] || '';
  }

  if (up) up.disabled = !['ready'].includes(p);
}

// ─── Progress ───
let _progRAF = null;
let _lastPct = -1;

function showProg(pct, file) {
  if (pct === _lastPct) return;
  _lastPct = pct;

  if (_progRAF) return;
  _progRAF = requestAnimationFrame(() => {
    _progRAF = null;
    const bar = $('#progress'), fill = $('#progress-fill'), lbl = $('#mic-label');
    if (bar) bar.hidden = false;
    if (fill) fill.style.transform = 'scaleX(' + (_lastPct / 100) + ')';
    if (lbl) lbl.textContent = 'Downloading\u2026 ' + _lastPct + '%';
  });
}

function hideProg() {
  _lastPct = -1;
  if (_progRAF) { cancelAnimationFrame(_progRAF); _progRAF = null; }
  const bar = $('#progress'), fill = $('#progress-fill'), lbl = $('#mic-label');
  if (bar) bar.hidden = true;
  if (fill) fill.style.transform = 'scaleX(0)';
  if (lbl) lbl.textContent = '';
}

function populateModels() {
  const s = $('#model-select'); if (!s) return;
  s.innerHTML = MODELS.map(m => `<option value="${m.id}">${m.name} (${m.size})</option>`).join('');
  s.value = state.modelId;
}

// ─── File upload ───
async function processFile(file) {
  if (!file.type.startsWith('audio/') && !file.name.match(/\.(wav|mp3|webm|ogg|m4a|flac)$/i))
    return toast('Upload an audio file.', 'error');

  ensureModel(async () => {
    setPhase('processing');
    try {
      if (!audioCtx || audioCtx.state === 'closed') audioCtx = new AudioContext({ sampleRate: SR });
      const buf = await audioCtx.decodeAudioData(await file.arrayBuffer());
      let data = buf.getChannelData(0);
      if (buf.sampleRate !== SR) data = resample(data, buf.sampleRate, SR);

      const chunkSz = CHUNK_SEC * SR, total = Math.ceil(data.length / chunkSz);
      for (let i = 0; i < total; i++) {
        const chunk = data.slice(i * chunkSz, Math.min((i + 1) * chunkSz, data.length));
        worker.postMessage(
          { action: 'transcribe-chunk', audioData: chunk, chunkId: i + 1, isFinal: i === total - 1 },
          [chunk.buffer]
        );
      }
    } catch (e) { setPhase('ready'); toast('Audio error: ' + e.message, 'error'); }
  });
}

function resample(data, from, to) {
  const r = from / to, n = Math.round(data.length / r), out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const s = i * r, lo = Math.floor(s), hi = Math.min(lo + 1, data.length - 1), f = s - lo;
    out[i] = data[lo] * (1 - f) + data[hi] * f;
  }
  return out;
}

// ─── Events ───
function bind() {
  // View switching
  $('#hero-open-editor')?.addEventListener('click', openEditor);
  $('#back-btn')?.addEventListener('click', closeEditor);

  $('#model-select')?.addEventListener('change', e => { state.modelId = e.target.value; state.modelReady = false; });
  $('#mic')?.addEventListener('click', toggleRec);
  $('#polish-btn')?.addEventListener('click', startPolish);
  $('#upload-btn')?.addEventListener('click', () => $('#file-input')?.click());
  $('#file-input')?.addEventListener('change', e => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ''; });

  $('#copy-btn')?.addEventListener('click', () => {
    const t = edText(); if (t) navigator.clipboard.writeText(t).then(() => toast('Copied!', 'success'));
  });
  $('#save-btn')?.addEventListener('click', () => {
    const t = edText(); if (!t) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([t], { type: 'text/plain;charset=utf-8' }));
    a.download = 'kannada-' + new Date().toISOString().slice(0, 10) + '.txt';
    a.click(); URL.revokeObjectURL(a.href);
    toast('Saved!', 'success');
  });
  $('#clear-btn')?.addEventListener('click', () => {
    const ed = $('#editor');
    if (ed && ed.textContent.trim() && !confirm('Clear?')) return;
    if (ed) ed.innerHTML = '';
    showPolishBtn(false);
    lastSessionPCM = null;
    saveDoc();
  });

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
      e.preventDefault(); if (['ready', 'recording'].includes(state.phase)) toggleRec();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === '/') {
      e.preventDefault(); toggleHelp();
    }
  });

  const kn = $('#kn-toggle');
  if (kn) { kn.addEventListener('click', () => {
    state.kannadaMode = !state.kannadaMode;
    kn.classList.toggle('is-active', state.kannadaMode);
    kn.setAttribute('aria-pressed', state.kannadaMode);
    toast(state.kannadaMode ? 'Kannada ON' : 'Kannada OFF', 'success');
  }); }

  // Help overlay
  $('#help-btn')?.addEventListener('click', toggleHelp);
  $('#help-close')?.addEventListener('click', toggleHelp);
  $('#help-overlay')?.addEventListener('click', e => { if (e.target.id === 'help-overlay') toggleHelp(); });

  // Custom command form
  $('#cmd-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const trigger = $('#cmd-trigger')?.value?.trim().toLowerCase();
    const output = $('#cmd-output')?.value?.trim();
    if (!trigger || !output) return;
    voiceCommands.push({ trigger, output });
    saveCustomCommands(voiceCommands);
    renderCommandTable();
    $('#cmd-trigger').value = '';
    $('#cmd-output').value = '';
    toast('Command added', 'success');
  });

  // Reset commands
  $('#cmd-reset')?.addEventListener('click', () => {
    voiceCommands = [...DEFAULT_COMMANDS];
    saveCustomCommands(voiceCommands);
    renderCommandTable();
    toast('Reset to defaults', 'success');
  });

  // Pause settings
  const pauseToggle = $('#pause-toggle');
  const pauseSlider = $('#pause-threshold');
  const pauseVal = $('#pause-val');
  const pauseWrap = $('#pause-slider-wrap');
  if (pauseToggle) {
    pauseToggle.checked = pauseEnabled;
    if (pauseWrap) pauseWrap.hidden = !pauseEnabled;
    pauseToggle.addEventListener('change', () => {
      pauseEnabled = pauseToggle.checked;
      if (pauseWrap) pauseWrap.hidden = !pauseEnabled;
      savePauseSettings();
    });
  }
  if (pauseSlider) {
    pauseSlider.value = pauseThreshold;
    if (pauseVal) pauseVal.textContent = pauseThreshold;
    pauseSlider.addEventListener('input', () => {
      pauseThreshold = parseFloat(pauseSlider.value);
      if (pauseVal) pauseVal.textContent = pauseThreshold;
      savePauseSettings();
    });
  }

  // Mobile keyboard fix: keep toolbar above virtual keyboard
  if (window.visualViewport) {
    const bar = $('#float-bar');
    const ed = $('#editor');
    window.visualViewport.addEventListener('resize', () => {
      const kbHeight = window.innerHeight - window.visualViewport.height;
      if (bar) bar.style.bottom = kbHeight > 50 ? `${kbHeight + 8}px` : '';
      if (ed) ed.style.paddingBottom = kbHeight > 50 ? `${kbHeight + 60}px` : '';
    });
  }

  initTranslit();
  $('#editor')?.addEventListener('input', debounce(saveDoc, 800));
}

// ─── Persistence ───
function edText() { return $('#editor')?.innerText?.trim() || ''; }
function saveDoc() { try { localStorage.setItem('kn-ed', edText()); } catch {} }
function loadDoc() { try { const s = localStorage.getItem('kn-ed'), e = $('#editor'); if (s && e) e.innerHTML = s.split('\n').map(esc).join('<br>'); } catch {} }

// ─── Toast ───
function toast(msg, type = 'info') {
  const c = $('#toast-container'); if (!c) return;
  const el = document.createElement('div'); el.className = 'toast toast--' + type; el.textContent = msg;
  c.appendChild(el); requestAnimationFrame(() => el.classList.add('is-visible'));
  setTimeout(() => { el.classList.remove('is-visible'); el.ontransitionend = () => el.remove(); }, 3000);
}

// ─── Transliteration ───
function initTranslit() {
  const ed = $('#editor'); if (!ed) return;
  let buf = '';

  function getBufSpan() { let s = ed.querySelector('.kn-buffer'); if (!s) { s = document.createElement('span'); s.className = 'kn-buffer'; s.contentEditable = 'false'; } return s; }
  function rmBuf() { const s = ed.querySelector('.kn-buffer'); if (s) s.remove(); }

  function insertText(txt) {
    rmBuf();
    const sel = window.getSelection();
    if (!sel.rangeCount) { ed.appendChild(document.createTextNode(txt)); return; }
    const r = sel.getRangeAt(0); r.deleteContents();
    const n = document.createTextNode(txt); r.insertNode(n);
    r.setStartAfter(n); r.collapse(true); sel.removeAllRanges(); sel.addRange(r);
  }

  function showBuf() {
    const s = getBufSpan(); s.textContent = buf;
    if (!s.parentNode) {
      const sel = window.getSelection();
      if (sel.rangeCount) { const r = sel.getRangeAt(0); r.deleteContents(); r.insertNode(s); r.setStartAfter(s); r.collapse(true); sel.removeAllRanges(); sel.addRange(r); }
      else ed.appendChild(s);
    }
  }

  function flush(sep) { if (!buf) return; const c = transliterate(buf); buf = ''; insertText(c + (sep || '')); }

  // Desktop: keydown handles physical keyboards
  ed.addEventListener('keydown', e => {
    if (!state.kannadaMode || e.ctrlKey || e.metaKey || e.altKey) return;
    // Skip if key is Unidentified (mobile virtual keyboard)
    if (e.key === 'Unidentified' || e.key === 'Process') return;
    if (e.key === ' ' || e.key === 'Enter') { if (buf) { e.preventDefault(); flush(e.key === 'Enter' ? '\n' : ' '); } return; }
    if (e.key === 'Backspace') { if (buf) { e.preventDefault(); buf = buf.slice(0, -1); buf ? showBuf() : rmBuf(); } return; }
    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) { e.preventDefault(); buf += e.key; showBuf(); return; }
    if (e.key.length === 1 && buf) flush('');
  });

  // Mobile: beforeinput handles virtual keyboards
  // On desktop, keydown fires first and preventDefault() stops beforeinput from firing.
  // On mobile, keydown fires with key="Unidentified" so it falls through here.
  ed.addEventListener('beforeinput', e => {
    if (!state.kannadaMode) return;

    if (e.inputType === 'insertText' && e.data) {
      // Latin letter → buffer it
      if (/^[a-zA-Z]$/.test(e.data)) {
        e.preventDefault();
        buf += e.data;
        showBuf();
        return;
      }
      // Space → flush buffer
      if (e.data === ' ' && buf) {
        e.preventDefault();
        flush(' ');
        return;
      }
      // Any other character while buffer is active → flush first
      if (buf) flush('');
    }

    if (e.inputType === 'insertParagraph' && buf) {
      e.preventDefault();
      flush('\n');
      return;
    }

    if (e.inputType === 'deleteContentBackward' && buf) {
      e.preventDefault();
      buf = buf.slice(0, -1);
      buf ? showBuf() : rmBuf();
      return;
    }
  });

  ed.addEventListener('mousedown', () => { if (buf) flush(''); });
  ed.addEventListener('touchend', () => { if (buf) flush(''); });
  ed.addEventListener('blur', () => { if (buf) flush(''); });

  ed.addEventListener('paste', e => {
    if (!state.kannadaMode) return;
    const plain = (e.clipboardData || window.clipboardData).getData('text');
    if (!plain) return;
    e.preventDefault();
    if (buf) flush('');
    const converted = plain.replace(/[a-zA-Z]+/g, match => transliterate(match));
    insertText(converted);
  });
}

// ─── Help overlay ───
function toggleHelp() {
  const overlay = $('#help-overlay');
  if (!overlay) return;
  const isOpen = !overlay.hidden;
  overlay.hidden = isOpen;
  if (!isOpen) renderCommandTable();
}

function renderCommandTable() {
  const tbody = $('#cmd-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  voiceCommands.forEach((cmd, i) => {
    const tr = document.createElement('tr');
    const displayOutput = cmd.output.replace(/\n/g, '\\n');
    const label = cmd.builtin ? '<span class="cmd-default">default</span>' : '';
    tr.innerHTML = `<td>${esc(cmd.trigger)}${label}</td><td><code>${esc(displayOutput)}</code></td><td>${cmd.builtin ? '' : '<button class="cmd-del" title="Remove">✕</button>'}</td>`;
    const delBtn = tr.querySelector('.cmd-del');
    if (delBtn) delBtn.addEventListener('click', () => {
      voiceCommands.splice(i, 1);
      saveCustomCommands(voiceCommands);
      renderCommandTable();
    });
    tbody.appendChild(tr);
  });
}

// ─── Util ───
function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
