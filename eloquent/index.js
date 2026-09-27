// ─── Eloquent Web — Voice Dictation & AI Notes Controller ───

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// ─── DOM ───
const splash = $('#splash');
const splashError = $('#splash-error');
const splashProgress = $('#splash-progress');
const progressBarFill = $('#progress-bar-fill');
const progressPercentage = $('#progress-percentage');
const progressStatus = $('#progress-status');
const progressDetail = $('#progress-detail');
const mainApp = $('#main-app');

// Record tab
const tabRecord = $('#tab-record');
const listeningPill = $('#listening-pill');
const polishingPill = $('#polishing-pill');
const statsCard = $('#stats-card');
const statWords = $('#stat-words');
const statWpm = $('#stat-wpm');
const editorEl = $('#text-content');
const transcriptionPanel = $('#transcription-panel');
const transcriptionToggle = $('#transcription-toggle');
const transcriptionBody = $('#transcription-body');
const transcriptionText = $('#transcription-text');
const timerEl = $('#timer');
const waveformCanvas = $('#waveform');
const pauseBtn = $('#pause-btn');
const stopBtnRec = $('#stop-btn-rec');
const recordingPanel = $('#recording-panel');
const micContainer = $('#mic-container');
const textAreaHeader = $('#text-area-header');
const copyBtn = $('#copy-btn');
const copyToast = $('#copy-toast');
const transformChips = $('#transform-chips');
const thinkingBanner = $('#thinking-banner');
const thinkingBannerText = $('#thinking-banner-text');
const originalTextPanel = $('#original-text-panel');
const originalTextContent = $('#original-text-content');
const originalTextToggle = $('#original-text-toggle');

// History tab
const tabHistory = $('#tab-history');
const historyList = $('#history-list');
const historyEmpty = $('#history-empty');
const searchInput = $('#search-notes');

// Settings tab
const tabSettings = $('#tab-settings');
const tempSlider = $('#temp-slider');
const tempValue = $('#temp-value');
const tokensSlider = $('#tokens-slider');
const tokensValue = $('#tokens-value');

// Tab bar
const tabBar = $('#tab-bar');
const headerNav = $('#header-nav');
const recordBtn = $('#record-btn');

// ─── Constants ───
const STORAGE_KEY = 'eloquent-notes';
const SETTINGS_KEY = 'eloquent-settings';
const SYSTEM_PROMPT = `You clean up dictated speech into written text. Rules:
- Remove filler words (um, uh, like, you know, I mean, actually, basically)
- When the speaker corrects themselves, keep ONLY the correction
- Fix grammar and punctuation
- Keep all names as-is
- Output ONLY the cleaned text`;

const POLISH_EXAMPLE_IN_1 = `So um I talked to uh Jake yesterday and he said the deadline is Friday. No wait, I mean Monday. And uh can you also like send the report to Sarah? I mean send the summary to Sarah.`;
const POLISH_EXAMPLE_OUT_1 = `I talked to Jake yesterday and he said the deadline is Monday. Can you also send the summary to Sarah?`;

const POLISH_EXAMPLE_IN_2 = `Hey so basically we need like three designers. Sorry, two designers and uh one developer for the project. And the budget is um fifty thousand, or rather sixty thousand dollars. You know we should probably like book the large conference room for Thursday.`;
const POLISH_EXAMPLE_OUT_2 = `We need two designers and one developer for the project. The budget is sixty thousand dollars. We should book the large conference room for Thursday.`;

const TRANSFORM_PROMPTS = {
  polish: {
    system: SYSTEM_PROMPT,
    messages: (text) => [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: POLISH_EXAMPLE_IN_1 },
      { role: 'assistant', content: POLISH_EXAMPLE_OUT_1 },
      { role: 'user', content: POLISH_EXAMPLE_IN_2 },
      { role: 'assistant', content: POLISH_EXAMPLE_OUT_2 },
      { role: 'user', content: text },
    ],
    temperature: 0,
  },
  formal: {
    system: 'You rewrite text in a formal professional tone. Output ONLY the rewritten text.',
    messages: (text) => [
      { role: 'system', content: 'You rewrite text in a formal professional tone. Output ONLY the rewritten text.' },
      { role: 'user', content: text },
    ],
    temperature: 0.3,
  },
  keypoints: {
    system: 'You extract key action items as bullet points. Output ONLY bullet points.',
    messages: (text) => [
      { role: 'system', content: 'You extract key action items as bullet points. Output ONLY bullet points.' },
      { role: 'user', content: text },
    ],
    temperature: 0,
  },
  short: {
    system: 'You make text concise. Output ONLY the shortened text.',
    messages: (text) => [
      { role: 'system', content: 'You make text concise. Output ONLY the shortened text.' },
      { role: 'user', content: text },
    ],
    temperature: 0.3,
  },
  long: {
    system: 'You expand text with more detail. Output ONLY the expanded text.',
    messages: (text) => [
      { role: 'system', content: 'You expand text with more detail. Output ONLY the expanded text.' },
      { role: 'user', content: text },
    ],
    temperature: 0.5,
  },
};

// ─── State ───
let notes = loadNotes();
let currentNote = null;
let isRecording = false;
let isPaused = false;
let mediaRecorder = null;
let audioChunks = [];
let audioCtx = null;
let analyser = null;
let mediaStream = null;
let animFrameId = null;
let recordStartTime = 0;
let pausedElapsed = 0;
let pauseStartedAt = 0;
let timerInterval = null;
let modelReady = false;
let isTransforming = false;
let generationStarted = false;
let generatedWordCount = 0;
let worker = null;
let saveTimeout = null;

const defaultSettings = { temperature: 0.7, maxTokens: 2048 };
let settings = loadSettings();

// ─── Progress ───
let _progressRAF = 0;
function setProgress(pct, detail) {
  cancelAnimationFrame(_progressRAF);
  _progressRAF = requestAnimationFrame(() => {
    progressBarFill.style.transform = `scaleX(${pct / 100})`;
    progressPercentage.textContent = Math.round(pct) + '%';
    if (detail !== undefined) progressDetail.textContent = detail;
  });
}

function showSplashError(msg, retryable = false, title = 'Model Error') {
  splashProgress.classList.add('hidden');
  const h3 = splashError.querySelector('h3');
  if (h3) h3.textContent = title;
  const p = splashError.querySelector('p');
  p.style.whiteSpace = 'pre-wrap';
  p.style.textAlign = 'left';
  p.style.fontSize = '0.85rem';
  p.textContent = msg;

  // Show or create retry button
  let retryBtn = splashError.querySelector('.retry-btn');
  if (retryable) {
    if (!retryBtn) {
      retryBtn = document.createElement('button');
      retryBtn.className = 'retry-btn';
      retryBtn.textContent = 'Retry';
      retryBtn.style.cssText = 'margin-top:16px;padding:10px 32px;border-radius:9999px;border:none;background:var(--primary);color:var(--on-primary);font-family:inherit;font-size:0.875rem;font-weight:600;cursor:pointer;transition:opacity 150ms ease;';
      retryBtn.addEventListener('mouseenter', () => retryBtn.style.opacity = '0.85');
      retryBtn.addEventListener('mouseleave', () => retryBtn.style.opacity = '1');
      retryBtn.addEventListener('click', retryModelLoad);
      splashError.appendChild(retryBtn);
    }
    retryBtn.classList.remove('hidden');
  } else if (retryBtn) {
    retryBtn.classList.add('hidden');
  }

  splashError.classList.remove('hidden');
}

function retryModelLoad() {
  // Reset splash UI
  splashError.classList.add('hidden');
  splashProgress.classList.remove('hidden');
  setProgress(0, '');
  progressStatus.textContent = 'Retrying download…';
  // A stalled load may still own downloads and GPU sessions. Start clean.
  worker?.terminate();
  modelReady = false;
  initWorker();
  if (worker) {
    worker.postMessage({ type: 'load' });
    resetDownloadTimeout();
  }
}

// ── Download Timeout Tracker ──
let _downloadTimeout = null;
const DOWNLOAD_TIMEOUT_MS = 120_000; // 2 minutes with no progress = stalled

function resetDownloadTimeout() {
  clearTimeout(_downloadTimeout);
  if (!modelReady || isTransforming) {
    _downloadTimeout = setTimeout(() => {
      if (!modelReady || isTransforming) {
        recoverModelFailure('Model loading or processing stalled. Your note is saved. Retry to reconnect.');
      }
    }, DOWNLOAD_TIMEOUT_MS);
  }
}

function clearDownloadTimeout() {
  clearTimeout(_downloadTimeout);
  _downloadTimeout = null;
}

function recoverModelFailure(message) {
  clearDownloadTimeout();
  worker?.terminate();
  worker = null;
  modelReady = false;
  isTransforming = false;
  generationStarted = false;
  generatedWordCount = 0;
  editorEl.classList.remove('polishing-active');
  if (thinkingBanner) thinkingBanner.classList.add('hidden');
  if (originalTextContent.textContent.trim()) editorEl.textContent = originalTextContent.textContent;
  saveCurrentNote();
  enableTransformChips();
  polishingPill.classList.add('hidden');
  splash.classList.remove('hidden');
  showSplashError(message, true);
}

// ══════════════════════════════════════════
// Worker
// ══════════════════════════════════════════
function initWorker() {
  try { worker = new Worker('./worker.js?v=34', { type: 'module' }); }
  catch (e) { recoverModelFailure('Worker: ' + e.message); return; }

  worker.onerror = (ev) => {
    ev.preventDefault();
    const msg = ev.message || 'Worker failed to load. Check DevTools console (F12) for details.';
    console.error('[Eloquent] Worker error:', ev);
    recoverModelFailure(msg);
  };

  const fileProgress = {};
  let isCachedLoad = false;

  worker.addEventListener('message', (e) => {
    const { type, data } = e.data;
    switch (type) {
      case 'loading':
        isCachedLoad = Boolean(data?.cached);
        if (isCachedLoad) {
          progressStatus.textContent = 'Loading model from device cache…';
          progressDetail.textContent = 'Restoring cached weights from local storage';
        } else {
          progressStatus.textContent = 'Loading speech recognition…';
        }
        resetDownloadTimeout();
        break;

      case 'model-status':
        resetDownloadTimeout();
        if (!modelReady) {
          progressStatus.textContent = data.message;
        }
        break;

      case 'phase':
        if (data?.phase && isTransforming) {
          const pillText = polishingPill.querySelector('span:last-of-type');
          if (pillText) {
            pillText.textContent = data.phase === 'transcribing' ? 'Transcribing…' : 'Polishing…';
          }
        }
        break;

      case 'model-warning':
        transcriptionPanel.classList.remove('hidden');
        transcriptionText.textContent = data.message;
        break;

      case 'replace':
        editorEl.classList.remove('polishing-active');
        if (thinkingBanner) thinkingBanner.classList.add('hidden');
        editorEl.textContent = data.text;
        saveCurrentNote();
        break;

      case 'warmup':
        resetDownloadTimeout();
        if (!modelReady) {
          setProgress(100);
          progressStatus.textContent = 'Testing speech recognition…';
          progressDetail.textContent = 'Checking this browser can run the model';
        }
        break;

      case 'progress':
        if (data?.file) {
          resetDownloadTimeout();
          fileProgress[(data.model || '') + '/' + data.file] = { loaded: data.loaded || 0, total: data.total || 0 };
          const files = Object.values(fileProgress);
          const total = files.reduce((s, f) => s + f.total, 0);
          const loaded = files.reduce((s, f) => s + f.loaded, 0);
          const mb = (n) => (n / 1048576).toFixed(1);
          const detailText = `${mb(loaded)} / ${mb(total)} MB`;
          if (!modelReady) {
            if (isCachedLoad) {
              progressStatus.textContent = 'Restoring model from device storage…';
            }
            setProgress(total > 0 ? (loaded / total) * 100 : 0, detailText);
          }
        }
        break;

      case 'ready':
        modelReady = true;
        clearDownloadTimeout();
        setProgress(100);
        progressStatus.textContent = 'Ready!';
        progressDetail.textContent = '';
        $('#model-dot').classList.add('ready');
        // Update settings model name
        const modelNameEl = $('#model-name');
        if (modelNameEl) {
          modelNameEl.textContent = data?.transcriptionOnly ? 'Moonshine Base · polishing loads when needed' : 'Moonshine Base + Superwhisper S1-mini';
        }
        setTimeout(() => {
          splash.classList.add('hidden');
          mainApp.classList.remove('hidden');
          mainApp.classList.add('fade-in');
          if (notes.length) loadNote(notes[0].id); else createNote();
        }, 600);
        break;

      case 'start':
        generationStarted = false;
        generatedWordCount = 0;
        resetDownloadTimeout();
        break;

      case 'live-transcript':
        if (isRecording && data?.text) {
          transcriptionText.textContent = data.text;
          if (currentNote) currentNote.rawText = data.text;
        }
        break;

      case 'raw':
        if (data?.rawText) {
          originalTextContent.textContent = data.rawText;
          transcriptionText.textContent = data.rawText;
          if (currentNote) currentNote.rawText = data.rawText;
          const pillText = polishingPill.querySelector('span:last-of-type');
          if (pillText) pillText.textContent = 'Polishing…';
          saveCurrentNote();
        }
        break;

      case 'token':
        if (data?.token && isTransforming) {
          resetDownloadTimeout();
          if (!generationStarted) {
            editorEl.textContent = '';
            editorEl.classList.remove('polishing-active');
            if (thinkingBanner) thinkingBanner.classList.add('hidden');
          }
          generationStarted = true;
          editorEl.textContent += data.token;
          scheduleAutoSave();
        }
        break;

      case 'complete': {
        clearDownloadTimeout();
        isTransforming = false;
        generationStarted = false;
        generatedWordCount = 0;
        editorEl.classList.remove('polishing-active');
        if (thinkingBanner) thinkingBanner.classList.add('hidden');
        enableTransformChips();

        // Fallback: If editor text is empty but we have recorded transcript, restore it
        if (!editorEl.textContent.trim() && originalTextContent.textContent.trim()) {
          editorEl.textContent = originalTextContent.textContent.trim();
        }

        saveCurrentNote();

        // Hide polishing/processing state
        polishingPill.classList.add('hidden');

        // Show results UI
        textAreaHeader.classList.remove('hidden');
        transformChips.classList.remove('hidden');
        originalTextPanel.classList.remove('hidden');

        // Calculate and show stats
        const wordCount = editorEl.textContent.trim().split(/\s+/).filter(Boolean).length;
        const durationMins = lastRecordingDuration / 60;
        const wpm = durationMins > 0 ? Math.round(wordCount / durationMins) : 0;
        statWords.textContent = wordCount;
        statWpm.textContent = wpm;
        statsCard.classList.remove('hidden');

        // Store transcription result as original text
        if (!originalTextContent.textContent.trim()) {
          originalTextContent.textContent = editorEl.textContent.trim();
        }

        // Auto-copy if document is active and focused
        if (typeof document.hasFocus === 'function' && document.hasFocus()) {
          copyToClipboard(false);
        }
        break;
      }

      case 'error': {
        clearDownloadTimeout();
        const errMsg = data?.message || 'Unknown error';
        if (isTransforming) {
          isTransforming = false;
          enableTransformChips();
          polishingPill.classList.add('hidden');
          textAreaHeader.classList.remove('hidden');
          transformChips.classList.remove('hidden');
          originalTextPanel.classList.remove('hidden');

          if (!editorEl.textContent.trim() && originalTextContent.textContent.trim()) {
            editorEl.textContent = originalTextContent.textContent.trim();
          } else if (!editorEl.textContent.trim()) {
            editorEl.textContent = '⚠ Error: ' + errMsg;
          }
          saveCurrentNote();
        }
        if (!modelReady) showSplashError(errMsg, true);
        break;
      }
    }
  });
}

function enableTransformChips() {
  $$('.transform-chip').forEach(c => { c.classList.remove('processing'); c.disabled = false; });
}

// ══════════════════════════════════════════
// Notes
// ══════════════════════════════════════════
function createNote() {
  const note = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    text: '', rawText: '',
    createdAt: Date.now(), updatedAt: Date.now(),
  };
  notes.unshift(note);
  saveNotes();
  loadNote(note.id);
  return note;
}

function loadNote(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;
  currentNote = note;
  editorEl.textContent = note.text;
  transcriptionText.textContent = note.rawText || '';
  updateTransformBarVisibility();
}

function saveCurrentNote() {
  if (!currentNote) return;
  currentNote.text = editorEl.textContent;
  currentNote.updatedAt = Date.now();
  saveNotes();
  updateTransformBarVisibility();
}

function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  saveNotes();
  if (currentNote?.id === id) {
    if (notes.length) loadNote(notes[0].id); else createNote();
  }
  renderHistory();
}

function scheduleAutoSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveCurrentNote, 1000);
}

function updateTransformBarVisibility() {
  const hasText = editorEl.textContent.trim().length > 0;
  if (hasText && modelReady) transformChips.classList.remove('hidden');
  else transformChips.classList.add('hidden');
}

function loadNotes() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function saveNotes() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); } catch {}
}

function formatDate(ts) {
  const d = new Date(ts); const now = new Date(); const diff = now - d;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// ══════════════════════════════════════════
// History
// ══════════════════════════════════════════
function renderHistory(filter = '') {
  const filtered = filter
    ? notes.filter(n => (n.text + n.rawText).toLowerCase().includes(filter.toLowerCase()))
    : notes;

  if (!filtered.length) {
    historyList.innerHTML = '';
    historyEmpty.classList.remove('hidden');
    return;
  }
  historyEmpty.classList.add('hidden');

  historyList.innerHTML = filtered.map(n => {
    const title = (n.text || n.rawText || 'Empty note').split('\n')[0].slice(0, 60);
    const preview = (n.text || n.rawText || '').slice(0, 100);
    const active = currentNote?.id === n.id ? ' active' : '';
    return `<div class="history-item${active}" data-id="${n.id}">
      <div class="history-item-title">${esc(title)}</div>
      <div class="history-item-preview">${esc(preview)}</div>
      <div class="history-item-date">${formatDate(n.updatedAt)}</div>
    </div>`;
  }).join('');

  historyList.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', () => { loadNote(el.dataset.id); switchTab('record'); });
  });
}

function esc(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

// ══════════════════════════════════════════
// Voice Recording — 100% On-Device
// MediaRecorder → audio capture → Moonshine Base ASR → Superwhisper S1-mini
// ══════════════════════════════════════════

let liveASRInterval = null;
let scriptNode = null;
let streamedAudioChunks = [];
let startingRecording = false;
let recordingMimeType = '';
let recordingSampleRate = 48000;

async function resampleAudio(samples, sourceRate, targetRate = 16000) {
  if (sourceRate === targetRate) return samples;
  const frameCount = Math.max(1, Math.ceil(samples.length * targetRate / sourceRate));
  const OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!OfflineContext) return samples;
  const offline = new OfflineContext(1, frameCount, targetRate);
  const sourceBuffer = offline.createBuffer(1, samples.length, sourceRate);
  sourceBuffer.copyToChannel(samples, 0);
  const source = offline.createBufferSource();
  source.buffer = sourceBuffer;
  source.connect(offline.destination);
  source.start(0);
  const rendered = await offline.startRendering();
  return rendered.getChannelData(0).slice();
}

async function startRecording() {
  if (isRecording || startingRecording || isTransforming) return;
  startingRecording = true;
  recordBtn.disabled = true;
  try {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      throw new Error('Recording is unavailable. Open this app over HTTPS in a supported browser.');
    }
    // Unlock audio during the tap, before the permission prompt can consume activation.
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
    const audioReady = audioCtx.resume().then(() => null, error => error);
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      }
    }).catch(async () => {
      // Fallback to basic audio constraints if advanced properties are unsupported
      return await navigator.mediaDevices.getUserMedia({ audio: true });
    });
    const audioError = await audioReady;
    if (audioError) throw audioError;
    const candidates = [
      'audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/aac', 'audio/ogg;codecs=opus',
    ];
    let mimeType = '';
    if (typeof MediaRecorder.isTypeSupported === 'function') {
      mimeType = candidates.find(type => MediaRecorder.isTypeSupported(type)) || '';
    }
    try {
      mediaRecorder = new MediaRecorder(mediaStream, mimeType ? { mimeType } : undefined);
    } catch {
      mediaRecorder = new MediaRecorder(mediaStream);
    }
    recordingMimeType = mediaRecorder.mimeType || mimeType;
    audioChunks = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };
    mediaRecorder.onstop = () => onRecordingStopped();
    mediaRecorder.onerror = () => {
      mediaRecorder.onstop = null;
      stopRecording();
      audioChunks = [];
      transcriptionPanel.classList.remove('hidden');
      transcriptionText.textContent = 'Recording was interrupted. Please try again.';
    };
    mediaRecorder.start(1000);
  } catch (e) {
    if (mediaRecorder) {
      mediaRecorder.onstop = null;
      if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    }
    stopMicStream();
    transcriptionPanel.classList.remove('hidden');
    transcriptionText.textContent = e.name === 'NotAllowedError'
      ? 'Microphone access was denied. Allow microphone access in your browser settings, then try again.'
      : 'Could not start recording. ' + e.message;
    return;
  } finally {
    startingRecording = false;
    recordBtn.disabled = false;
  }

  createNote();
  transcriptionText.textContent = '';
  editorEl.textContent = '';
  originalTextContent.textContent = '';
  textAreaHeader.classList.add('hidden');
  copyToast.classList.add('hidden');
  statsCard.classList.add('hidden');
  transformChips.classList.add('hidden');
  originalTextPanel.classList.add('hidden');
  polishingPill.classList.add('hidden');
  if (thinkingBanner) thinkingBanner.classList.add('hidden');
  isRecording = true;
  isPaused = false;
  if (worker && modelReady) {
    worker.postMessage({ type: 'prewarm' });
  }

  // Show recording UI
  listeningPill.classList.remove('hidden');
  transcriptionPanel.classList.remove('hidden');
  transcriptionText.textContent = 'Listening… transcribing live with on-device Moonshine.';
  recordingPanel.classList.remove('hidden');
  micContainer.classList.add('hidden');

  recordStartTime = Date.now();
  pausedElapsed = 0;
  timerInterval = setInterval(updateTimer, 1000);

  // Set up waveform visualizer and live ASR streaming
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 64;
  const source = audioCtx.createMediaStreamSource(mediaStream);
  source.connect(analyser);
  drawWaveform();

  // Stream audio chunks to Moonshine for real-time live transcription
  recordingSampleRate = audioCtx.sampleRate;
  streamedAudioChunks = [];
  try {
    scriptNode = audioCtx.createScriptProcessor(4096, 1, 1);
    scriptNode.onaudioprocess = (e) => {
      if (!isRecording || isPaused) return;
      const inputData = e.inputBuffer.getChannelData(0);
      streamedAudioChunks.push(new Float32Array(inputData));
    };
    // Route through zero gain to prevent audio feedback screech through phone speakers
    const muteNode = audioCtx.createGain();
    muteNode.gain.value = 0;
    source.connect(scriptNode);
    scriptNode.connect(muteNode);
    muteNode.connect(audioCtx.destination);
  } catch (err) {
    console.warn('Live audio processor setup error:', err);
  }

  clearInterval(liveASRInterval);
  let isStreamingChunk = false;
  liveASRInterval = setInterval(async () => {
    if (!isRecording || isPaused || !streamedAudioChunks.length || !modelReady || !worker || isStreamingChunk) return;
    isStreamingChunk = true;
    try {
      const totalLen = streamedAudioChunks.reduce((acc, c) => acc + c.length, 0);
      // Cap live streaming payload to avoid mobile OOM / battery drain on long recordings
      if (totalLen > (audioCtx?.sampleRate || 48000) * 45) return;
      const combined = new Float32Array(totalLen);
      let offset = 0;
      for (const chunk of streamedAudioChunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }
      const resampled = await resampleAudio(combined, audioCtx?.sampleRate || 48000, 16000);
      worker.postMessage({
        type: 'stream-audio',
        data: { audio: resampled }
      });
    } catch (err) {
      console.warn('Live ASR streaming chunk error:', err);
    } finally {
      isStreamingChunk = false;
    }
  }, 1500);
}

function pauseRecording() {
  if (!isRecording) return;
  if (isPaused) {
    // Resume
    isPaused = false;
    pauseBtn.querySelector('.material-symbols-outlined').textContent = 'pause';
    listeningPill.classList.remove('hidden');
    pausedElapsed += Date.now() - pauseStartedAt;
    mediaRecorder?.resume();
  } else {
    // Pause
    isPaused = true;
    pauseStartedAt = Date.now();
    pauseBtn.querySelector('.material-symbols-outlined').textContent = 'play_arrow';
    listeningPill.classList.add('hidden');
    mediaRecorder?.pause();
  }
}

let lastRecordingDuration = 0;

function stopRecording() {
  if (!isRecording) return;
  isRecording = false;
  isPaused = false;

  lastRecordingDuration = (Date.now() - recordStartTime - pausedElapsed) / 1000;

  // Clean up live streaming intervals
  clearInterval(liveASRInterval);
  if (scriptNode) {
    try { scriptNode.disconnect(); } catch {}
    scriptNode = null;
  }

  // Hide recording UI
  listeningPill.classList.add('hidden');
  recordingPanel.classList.add('hidden');
  micContainer.classList.remove('hidden');
  clearInterval(timerInterval);
  cancelAnimationFrame(animFrameId);

  // Stop MediaRecorder — triggers onstop → onRecordingStopped()
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  stopMicStream();
}

/**
 * Called after MediaRecorder stops.
 * Decodes audio to 16kHz mono Float32Array and sends to Moonshine + S1-mini.
 */
async function onRecordingStopped() {
  if (!audioChunks.length) {
    return;
  }

  // Keep a new recording from replacing audio while decoding is in progress.
  isTransforming = true;

  // Show processing state — clean single indicator
  polishingPill.classList.remove('hidden');
  const pillText = polishingPill.querySelector('span:last-of-type');
  if (pillText) pillText.textContent = 'Transcribing…';
  if (thinkingBanner) thinkingBanner.classList.add('hidden');
  transcriptionPanel.classList.add('hidden');

  try {
    // Convert recorded chunks to a single audio blob
    const blob = new Blob(audioChunks, { type: recordingMimeType || audioChunks[0]?.type || '' });
    audioChunks = [];

    // Decode to 16kHz mono Float32Array
    const arrayBuffer = await blob.arrayBuffer();
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    let decodeCtx;
    try {
      decodeCtx = new AudioContextClass({ sampleRate: 16000 });
    } catch {
      decodeCtx = new AudioContextClass();
    }
    let audioData;
    try {
      const audioBuffer = await decodeCtx.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);
      audioData = audioBuffer.sampleRate === 16000
        ? channelData
        : await resampleAudio(channelData, audioBuffer.sampleRate, 16000);
    } catch (error) {
      // Some browsers can record a container their audio decoder cannot read.
      // Preserve the recording using the PCM already captured for live ASR.
      if (!streamedAudioChunks.length) throw error;
      const samples = new Float32Array(streamedAudioChunks.reduce((n, chunk) => n + chunk.length, 0));
      let offset = 0;
      for (const chunk of streamedAudioChunks) {
        samples.set(chunk, offset);
        offset += chunk.length;
      }
      audioData = await resampleAudio(samples, recordingSampleRate);
    } finally {
      streamedAudioChunks = [];
      try { await decodeCtx?.close(); } catch {}
    }

    // Send to worker for Moonshine ASR + S1-mini normalization
    if (modelReady && worker) {
      isTransforming = true;
      editorEl.textContent = '';
      worker.postMessage({
        type: 'transcribe',
        data: { audio: audioData }
      });
    } else {
      isTransforming = false;
      polishingPill.classList.add('hidden');
      if (thinkingBanner) thinkingBanner.classList.add('hidden');
      editorEl.classList.remove('polishing-active');
      editorEl.textContent = '⚠ Model not ready yet. Please wait for it to load.';
    }
  } catch (err) {
    console.error('Audio processing error:', err);
    isTransforming = false;
    polishingPill.classList.add('hidden');
    if (thinkingBanner) thinkingBanner.classList.add('hidden');
    editorEl.classList.remove('polishing-active');
    editorEl.textContent = '⚠ Audio processing failed: ' + err.message;
  }
}

function updateTimer() {
  const elapsed = Math.floor((Date.now() - recordStartTime - pausedElapsed) / 1000);
  const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
  const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
  const s = String(elapsed % 60).padStart(2, '0');
  timerEl.textContent = `${h}:${m}:${s}`;
}

function stopMicStream() {
  mediaStream?.getTracks().forEach(t => t.stop());
  mediaStream = null;
  audioCtx?.close();
  audioCtx = null;
  analyser = null;
  clearWaveform();
}

function drawWaveform() {
  if (!analyser) return;
  const ctx = waveformCanvas.getContext('2d');
  const w = waveformCanvas.width;
  const h = waveformCanvas.height;
  const bufLen = analyser.frequencyBinCount;
  const data = new Uint8Array(bufLen);

  const draw = () => {
    animFrameId = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(data);
    ctx.clearRect(0, 0, w, h);
    const barW = 3, gap = 2;
    const totalW = (barW + gap) * bufLen;
    let x = (w - totalW) / 2;
    const waveColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#6750A4';
    for (let i = 0; i < bufLen; i++) {
      const v = data[i] / 255;
      const barH = Math.max(2, v * h * 0.9);
      const y = (h - barH) / 2;
      ctx.fillStyle = waveColor;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 1);
      ctx.fill();
      x += barW + gap;
    }
  };
  draw();
}

function clearWaveform() {
  const ctx = waveformCanvas.getContext('2d');
  ctx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
  const w = waveformCanvas.width, h = waveformCanvas.height;
  const dotCount = 30, gap = 5, dotR = 2;
  const totalW = (dotR * 2 + gap) * dotCount;
  let x = (w - totalW) / 2 + dotR;
  const dotColor = getComputedStyle(document.documentElement).getPropertyValue('--outline-variant').trim() || '#dadce0';
  ctx.fillStyle = dotColor;
  for (let i = 0; i < dotCount; i++) {
    ctx.beginPath();
    ctx.arc(x, h / 2, dotR, 0, Math.PI * 2);
    ctx.fill();
    x += dotR * 2 + gap;
  }
}

// ══════════════════════════════════════════
// Copy to Clipboard
// ══════════════════════════════════════════
let _toastTimer = 0;
function copyToClipboard(isUserAction = true) {
  const text = editorEl.textContent.trim();
  if (!text || !navigator.clipboard?.writeText) return;
  navigator.clipboard.writeText(text).then(() => {
    // Flash the copy button
    copyBtn.classList.add('copied');
    setTimeout(() => copyBtn.classList.remove('copied'), 1500);
    // Show toast
    copyToast.classList.remove('hidden');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => copyToast.classList.add('hidden'), 2500);
  }).catch(err => {
    if (isUserAction) console.warn('Copy failed:', err);
  });
}

// ══════════════════════════════════════════
// Text Transformation (AI)
// ══════════════════════════════════════════
function transformText(mode) {
  if (!modelReady || isTransforming) return;

  const currentText = editorEl.textContent.trim();
  const rawText = originalTextContent.textContent.trim();
  const text = rawText || currentText;
  if (!text) return;

  isTransforming = true;

  // Disable all chips, highlight active one
  $$('.transform-chip').forEach(c => c.disabled = true);
  const activeChip = $(`.transform-chip[data-transform="${mode}"]`);
  if (activeChip) activeChip.classList.add('processing');

  // Save current text as original before clearing
  if (!originalTextContent.textContent.trim()) {
    originalTextContent.textContent = currentText;
  }

  // Softly dim the text instead of rainbow shimmer
  editorEl.classList.add('polishing-active');

  const modeLabels = {
    polish: 'Polishing note…',
    keypoints: 'Extracting key points…',
    formal: 'Rewriting in formal tone…',
    short: 'Condensing prose…',
  };
  const label = modeLabels[mode] || 'Transforming text…';

  // Keep top status pill hidden during chip transform to avoid duplicate loading states
  polishingPill.classList.add('hidden');

  if (thinkingBanner) {
    thinkingBanner.classList.remove('hidden');
    if (thinkingBannerText) thinkingBannerText.textContent = label;
  }

  // Send to worker for S1-mini normalization / transformation
  worker.postMessage({
    type: 'generate',
    data: {
      mode,
      text,
      settings: {
        maxTokens: settings.maxTokens
      }
    }
  });
}

// ══════════════════════════════════════════
// Tabs
// ══════════════════════════════════════════
function switchTab(name) {
  $$('.tab-content').forEach(t => t.classList.add('hidden'));
  // Sync both mobile bottom tabs and desktop header tabs
  $$('.tab').forEach(t => t.classList.remove('active'));
  $$('.header-tab').forEach(t => t.classList.remove('active'));
  const content = $(`#tab-${name}`);
  const mobileTab = $(`.tab[data-tab="${name}"]`);
  const desktopTab = $(`.header-tab[data-tab="${name}"]`);
  if (content) content.classList.remove('hidden');
  if (mobileTab) mobileTab.classList.add('active');
  if (desktopTab) desktopTab.classList.add('active');
  if (name === 'history') renderHistory();
}

// ══════════════════════════════════════════
// Settings
// ══════════════════════════════════════════
function loadSettings() {
  try { return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) }; }
  catch { return { ...defaultSettings }; }
}
function saveSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {}
}

// ══════════════════════════════════════════
// Events
// ══════════════════════════════════════════

// Tab bar — Record tab starts recording, others just switch
tabBar.addEventListener('click', (e) => {
  const tab = e.target.closest('.tab');
  if (!tab) return;
  const name = tab.dataset.tab;

  if (name === 'record') {
    switchTab('record');
    // Start recording if not already recording and model is ready
    if (!isRecording && modelReady) {
      startRecording();
    }
  } else {
    switchTab(name);
  }
});

// Desktop header nav tabs
headerNav.addEventListener('click', (e) => {
  const tab = e.target.closest('.header-tab');
  if (!tab) return;
  const name = tab.dataset.tab;
  if (name === 'record') {
    switchTab('record');
    if (!isRecording && modelReady) startRecording();
  } else {
    switchTab(name);
  }
});

pauseBtn.addEventListener('click', pauseRecording);
stopBtnRec.addEventListener('click', stopRecording);

// Record / Mic button — starts recording
recordBtn.addEventListener('click', () => {
  if (!isRecording && modelReady) startRecording();
});

// Transcription toggle
transcriptionToggle.addEventListener('click', () => {
  transcriptionPanel.classList.toggle('collapsed');
});

// Original text toggle
originalTextToggle.addEventListener('click', () => {
  originalTextPanel.classList.toggle('collapsed');
});

// Copy button
copyBtn.addEventListener('click', copyToClipboard);

// Text editor auto-save + show/hide transforms
editorEl.addEventListener('input', () => {
  scheduleAutoSave();
  updateTransformBarVisibility();
});

// Transform chips (inside text card)
$$('.transform-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    // Show polishing state
    polishingPill.classList.remove('hidden');
    statsCard.classList.add('hidden');
    transformText(chip.dataset.transform);
  });
});

// History search
searchInput.addEventListener('input', () => renderHistory(searchInput.value));

// Settings
tempSlider.addEventListener('input', () => {
  settings.temperature = parseFloat(tempSlider.value);
  tempValue.textContent = settings.temperature;
  saveSettings();
});
tokensSlider.addEventListener('input', () => {
  settings.maxTokens = parseInt(tokensSlider.value);
  tokensValue.textContent = settings.maxTokens;
  saveSettings();
});

// Keyboard
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isRecording) stopRecording();
});

// ══════════════════════════════════════════
// Theme Toggle
// ══════════════════════════════════════════
const THEME_KEY = 'eloquent-theme';
const themeToggle = $('#theme-toggle');
const themeIcon = themeToggle?.querySelector('.material-symbols-outlined');

function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (themeIcon) {
    themeIcon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
  }
}

applyTheme(getPreferredTheme());

themeToggle?.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
});

// Listen for OS theme change
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem(THEME_KEY)) {
    applyTheme(e.matches ? 'dark' : 'light');
  }
});

// ══════════════════════════════════════════
// Init
// ══════════════════════════════════════════
tempSlider.value = settings.temperature;
tempValue.textContent = settings.temperature;
tokensSlider.value = settings.maxTokens;
tokensValue.textContent = settings.maxTokens;

clearWaveform();

// ── Device Capability Check ──
function checkDeviceCapability() {
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const deviceMem = navigator.deviceMemory || 0; // GB, 0 if unsupported
  const connection = navigator.connection || {};
  const isSlowConnection = connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g';
  const isSaveData = connection.saveData === true;
  const cores = navigator.hardwareConcurrency || 4;
  const isLowEndDevice = (deviceMem > 0 && deviceMem < 2) || (isMobile && cores <= 2);

  return {
    ok: true,
    warning: isSlowConnection || isSaveData
      ? 'Speech recognition downloads first. Polishing downloads when needed; this may take a while on your connection.'
      : isLowEndDevice ? 'Memory is limited. Close other tabs while models load.' : null,
  };
}

const capability = checkDeviceCapability();

if (!capability.ok) {
  showSplashError(capability.message, true);
  splashError.querySelector('h3').textContent = capability.title;
  const retryBtn = splashError.querySelector('.retry-btn');
  if (retryBtn) retryBtn.textContent = 'Try Anyway';
} else {
  if (capability.warning) {
    progressStatus.textContent = capability.warning;
  }
  progressStatus.textContent = progressStatus.textContent || 'Loading speech recognition into browser…';

  initWorker();
  worker.postMessage({ type: 'load' });
  resetDownloadTimeout();
}
