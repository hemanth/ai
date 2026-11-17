/**
 * Lipi — Indic Voice Editor (`app.js`)
 *
 * LIVE STT:   Swanada 16 kHz Conformer-CTC INT8 (25.4 MiB Mobile / 177.4 MiB Studio + <1ms +EN code-switching)
 * TRANSLATE:  Udgam Labs Paar int8 ONNX neural translation via Transformers.js (12 Indic scripts)
 */

import { transliterate } from './transliterate.js';
import {
  DEFAULT_LANGUAGE_ID,
  getLanguage,
  isValidLanguage,
  getAllLanguages,
} from './languages.js';
import {
  translateText,
  preloadLanguageModel,
  onModelStatus,
} from './translator.js';
import {
  resolveSttTarget,
  detectSwanadaTier,
  createSwanadaSttController,
} from './stt-client.js?v=8';

const STORAGE_KEYS = {
  CONTENT: 'lipi-editor-content',
  LANGUAGE: 'lipi-selected-lang',
  LEGACY_CONTENT: 'kn-ed',
};

// ─── Voice Commands ───
const DEFAULT_COMMANDS = [
  { trigger: 'next line',        output: '\n',   builtin: true },
  { trigger: 'new line',         output: '\n',   builtin: true },
  { trigger: 'new paragraph',    output: '\n\n', builtin: true },
  { trigger: 'full stop',        output: '.',    builtin: true },
  { trigger: 'period',           output: '.',    builtin: true },
  { trigger: 'comma',            output: ',',    builtin: true },
  { trigger: 'question mark',    output: '?',    builtin: true },
  { trigger: 'exclamation mark', output: '!',    builtin: true },
  { trigger: 'open bracket',     output: '(',    builtin: true },
  { trigger: 'close bracket',    output: ')',    builtin: true },
  { trigger: 'colon',            output: ':',    builtin: true },
  { trigger: 'semicolon',        output: ';',    builtin: true },
];

function loadCommands() {
  try {
    const saved = JSON.parse(localStorage.getItem('lipi-commands') || '[]');
    return [...DEFAULT_COMMANDS, ...saved];
  } catch {
    return [...DEFAULT_COMMANDS];
  }
}

function saveCustomCommands(cmds) {
  const custom = cmds.filter(c => !c.builtin);
  try {
    localStorage.setItem('lipi-commands', JSON.stringify(custom));
  } catch {}
}

let voiceCommands = loadCommands();

function processVoiceCommands(text) {
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
let pauseThreshold = 1.5;
let pauseTimer = null;

function loadPauseSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('lipi-pause') || '{}');
    pauseEnabled = s.enabled || false;
    pauseThreshold = s.threshold || 1.5;
  } catch {}
}

function savePauseSettings() {
  try {
    localStorage.setItem('lipi-pause', JSON.stringify({ enabled: pauseEnabled, threshold: pauseThreshold }));
  } catch {}
}

loadPauseSettings();

const state = {
  phase: 'idle',
  isRecording: false,
  activeSttEngine: null, // 'swanada' | 'webspeech' | null
  kannadaMode: true,
  currentLanguage: DEFAULT_LANGUAGE_ID,
  voiceTranslateMode: false,
  langMenuOpen: false,
  heroIndex: 0,
};

let sttController = null;
let sttListenersAttached = false;
let recognition = null;
let interimSpan = null;
let _interimRAF = null;
let _pendingInterimText = null;
let _lastInterimText = '';
let _scrollRAF = null;
let recordingAttemptId = 0;
let isCaptureReady = false;
let heroTimer = null;
let heroSwapTimer = null;
let clearTranslitBuffer = () => {};
let flushTranslitBuffer = () => {};

const $ = s => document.querySelector(s);

function clearElementChildren(el) {
  if (!el) return;
  if (el.children && typeof el.removeChild === 'function') {
    while (el.children.length > 0) {
      el.removeChild(el.children[0]);
    }
  }
  el.innerHTML = '';
}

// ─── Boot ───
document.addEventListener('DOMContentLoaded', () => {
  populateLanguages();
  renderHeroStrip();
  initModelProgress();
  bind();
  loadStoredState();
  syncHeroToLanguage(state.currentLanguage);
  startHeroAnimation();
  setPhase('ready');

  if (typeof window !== 'undefined') {
    window.__lipiTranscribeBuffer = async (pcm16kFloat32) => {
      const ctrl = ensureSttController();
      const target = resolveSttTarget(state.currentLanguage, state.voiceTranslateMode);
      const acousticLang = target.engine === 'swanada' ? target.acousticLang : 'en';
      await ctrl.transcribeBuffer(pcm16kFloat32, acousticLang);
    };
  }

  if (location.hash === '#editor') openEditor();
});

// ═══════════════════════════════════
//  12-Script Landing Hero Animation
// ═══════════════════════════════════

function getOrderedHeroLanguages() {
  return getAllLanguages();
}

export function renderHeroStrip() {
  const strip = $('#hero-script-strip');
  if (!strip) return;
  clearElementChildren(strip);

  const allLangs = getOrderedHeroLanguages();
  allLangs.forEach((lang, index) => {
    const btn = document.createElement('button');
    btn.setAttribute('type', 'button');
    btn.className = 'hero-script-pill' + (index === state.heroIndex ? ' is-active' : '');
    btn.dataset.lang = lang.id;
    btn.dataset.index = String(index);
    btn.setAttribute('title', `${lang.name} (${lang.nativeName})`);
    btn.setAttribute('aria-label', `${lang.name}: ${lang.lipiWord}`);
    btn.innerHTML = `<span dir="${lang.direction}" lang="${lang.id}">${esc(lang.lipiWord)}</span><span class="hero-script-pill-code">${esc(lang.id.toUpperCase())}</span>`;

    btn.addEventListener('click', () => {
      stopHeroAnimation();
      setHeroLanguageIndex(index, { animate: true });
      setLanguage(lang.id, false);
    });

    strip.appendChild(btn);
  });
}

function syncHeroToLanguage(langId) {
  const allLangs = getOrderedHeroLanguages();
  const idx = allLangs.findIndex(l => l.id === langId);
  if (idx !== -1) {
    setHeroLanguageIndex(idx, { animate: false });
  }
}

export function setHeroLanguageIndex(index, { animate = true } = {}) {
  const allLangs = getOrderedHeroLanguages();
  if (!allLangs.length) return;

  const normalizedIdx = ((index % allLangs.length) + allLangs.length) % allLangs.length;
  state.heroIndex = normalizedIdx;
  const lang = allLangs[normalizedIdx];

  const titleWord = $('#hero-title-word');
  const meta = $('#hero-script-meta');
  const strip = $('#hero-script-strip');

  if (strip && strip.children) {
    const items = Array.isArray(strip.children) ? strip.children : Array.from(strip.children);
    items.forEach((pill, i) => {
      pill.classList?.toggle('is-active', i === normalizedIdx);
    });
  }

  const applyWord = () => {
    if (titleWord) {
      titleWord.textContent = lang.lipiWord;
      titleWord.setAttribute('dir', lang.direction);
      titleWord.setAttribute('lang', lang.id);
    }
    if (meta) {
      meta.textContent = `${lang.nativeName} · ${lang.name}`;
    }
  };

  const reducedMotion = typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!animate || reducedMotion || !titleWord) {
    applyWord();
    return;
  }

  clearTimeout(heroSwapTimer);
  titleWord.classList.remove('is-entering');
  titleWord.classList.add('is-exiting');

  heroSwapTimer = setTimeout(() => {
    applyWord();
    titleWord.classList.remove('is-exiting');
    titleWord.classList.add('is-entering');
  }, 190);
}

export function startHeroAnimation(intervalMs = 2200) {
  stopHeroAnimation();
  const reducedMotion = typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  heroTimer = setInterval(() => {
    const landing = $('#landing');
    if (landing && landing.hidden) return;
    setHeroLanguageIndex(state.heroIndex + 1, { animate: true });
  }, intervalMs);
}

export function stopHeroAnimation() {
  if (heroTimer) {
    clearInterval(heroTimer);
    heroTimer = null;
  }
  if (heroSwapTimer) {
    clearTimeout(heroSwapTimer);
    heroSwapTimer = null;
  }
}

function normalizeEmptyEditor(ed = $('#editor')) {
  if (!ed || interimSpan) return;
  if (ed.querySelector?.('.interim, .kn-buffer, .translating-chunk')) return;
  if (!(ed.textContent || '').trim()) {
    if (ed.innerHTML !== '') ed.innerHTML = '';
  }
}

// ─── View switching ───
function openEditor() {
  stopHeroAnimation();
  closeLangMenu();
  const landing = $('#landing');
  const edView = $('#editor-view');
  if (landing) landing.hidden = true;
  if (edView) edView.hidden = false;
  normalizeEmptyEditor();

  const isMobile = window.matchMedia('(max-width: 640px)').matches || 'ontouchstart' in window;
  if (!isMobile) $('#editor')?.focus();
  history.replaceState(null, '', '#editor');

  if (state.voiceTranslateMode) {
    const preload = () => {
      preloadLanguageModel(state.currentLanguage).catch(() => {});
    };
    if ('requestIdleCallback' in window) requestIdleCallback(preload, { timeout: 2500 });
    else setTimeout(preload, 600);
  }
}

function closeEditor() {
  if (state.isRecording) stopRecordingSession();
  closeLangMenu();
  document.documentElement?.classList?.remove('direct-editor');
  const edView = $('#editor-view');
  const landing = $('#landing');
  if (edView) edView.hidden = true;
  if (landing) landing.hidden = false;
  history.replaceState(null, '', location.pathname);
  syncHeroToLanguage(state.currentLanguage);
  startHeroAnimation();
}

// ═══════════════════════════════════
//  Swanada Neural STT + Fallback Controller
// ═══════════════════════════════════

export function setSttController(customController) {
  recordingAttemptId++;
  isCaptureReady = false;
  state.isRecording = false;
  state.activeSttEngine = null;
  removeInterim();
  sttController = customController;
  sttListenersAttached = false;
  if (sttController) {
    attachSttListeners(sttController);
  }
}

function ensureSttController() {
  if (!sttController) {
    sttController = createSwanadaSttController();
    sttListenersAttached = false;
  }
  if (!sttListenersAttached) {
    attachSttListeners(sttController);
  }
  return sttController;
}

function appendTextWithBreaks(container, text, hasLeadingSpace = false) {
  const parts = String(text || '').split('\n');
  parts.forEach((part, i) => {
    if (i > 0) container.appendChild(document.createElement('br'));
    if (part) {
      const chunk = i === 0 && hasLeadingSpace ? ` ${part}` : part;
      container.appendChild(document.createTextNode(chunk));
    }
  });
}

function scheduleEditorScroll(ed) {
  if (!ed) return;
  if (_scrollRAF) return;
  _scrollRAF = requestAnimationFrame(() => {
    _scrollRAF = null;
    ed.scrollTop = ed.scrollHeight;
  });
}

function hasCommittedEditorContent(ed) {
  if (!ed) return false;
  if (!interimSpan && !ed.querySelector?.('.kn-buffer, .translating-chunk')) {
    return (ed.textContent || '').trim().length > 0;
  }
  return edText().length > 0;
}

function renderInterimTranscript(text) {
  const ed = $('#editor');
  if (!ed || !text) return;

  if (!interimSpan) {
    interimSpan = document.createElement('span');
    interimSpan.className = 'interim';
    interimSpan.textContent = text;
    _lastInterimText = text;
    const prefix = hasCommittedEditorContent(ed) ? ' ' : '';
    if (prefix) ed.appendChild(document.createTextNode(prefix));
    ed.appendChild(interimSpan);
    scheduleEditorScroll(ed);
    return;
  }

  if (!_interimRAF && text === _lastInterimText && text === interimSpan.textContent) {
    return;
  }

  _pendingInterimText = text;
  if (_interimRAF) return;
  _interimRAF = requestAnimationFrame(() => {
    _interimRAF = null;
    if (!interimSpan || _pendingInterimText === null) return;
    const nextText = _pendingInterimText;
    _pendingInterimText = null;
    if (nextText !== _lastInterimText || interimSpan.textContent !== nextText) {
      interimSpan.textContent = nextText;
      _lastInterimText = nextText;
    }
    ed.scrollTop = ed.scrollHeight;
  });
}

function removeInterim() {
  if (_interimRAF) {
    cancelAnimationFrame(_interimRAF);
    _interimRAF = null;
  }
  _pendingInterimText = null;
  _lastInterimText = '';
  if (interimSpan && interimSpan.parentNode) {
    interimSpan.remove();
  }
  interimSpan = null;
}

function commitRecognizedTranscript(rawText) {
  const ed = $('#editor');
  if (!ed) return;
  removeInterim();

  const processed = processVoiceCommands(String(rawText || '').trim());
  if (!processed) return;

  const needsLeadingSpace = hasCommittedEditorContent(ed);

  if (state.voiceTranslateMode) {
    const pendingSpan = document.createElement('span');
    pendingSpan.className = 'translating-chunk';
    if (needsLeadingSpace) ed.appendChild(document.createTextNode(' '));
    pendingSpan.textContent = processed;
    ed.appendChild(pendingSpan);
    scheduleEditorScroll(ed);

    const lbl = $('#mic-label');
    if (lbl) lbl.textContent = 'Translating…';

    const targetLang = state.currentLanguage;
    translateText(processed, targetLang)
      .then((translated) => {
        if (pendingSpan.parentNode) {
          const replacement = document.createTextNode(translated);
          pendingSpan.replaceWith(replacement);
        }
        if (state.isRecording && lbl) {
          lbl.textContent = '● EN → ' + state.currentLanguage.toUpperCase();
        } else if (lbl) {
          lbl.textContent = '';
        }
        scheduleEditorScroll(ed);
        saveDoc();
      })
      .catch((err) => {
        if (pendingSpan.parentNode) pendingSpan.classList.remove('translating-chunk');
        toast(`Translation error: ${err.message}`, 'error');
        if (state.isRecording && lbl) lbl.textContent = '● EN → ' + state.currentLanguage.toUpperCase();
      });
  } else {
    appendTextWithBreaks(ed, processed, needsLeadingSpace);
    scheduleEditorScroll(ed);
    saveDoc();
  }

  clearTimeout(pauseTimer);
  if (pauseEnabled && state.isRecording) {
    pauseTimer = setTimeout(() => {
      if (state.isRecording && hasCommittedEditorContent(ed)) {
        ed.appendChild(document.createElement('br'));
        scheduleEditorScroll(ed);
        saveDoc();
      }
    }, pauseThreshold * 1000);
  }
}

function attachSttListeners(ctrl) {
  if (!ctrl || sttListenersAttached) return;
  sttListenersAttached = true;

  ctrl.on('progress', (p) => {
    if (!state.isRecording) return;
    const pct = Math.round((p.progress || 0) * 100);
    const tierMb = p.tier === 'mobile' ? '25 MB' : 'Studio';
    if (pct >= 100) {
      hideProg();
    } else {
      showProg(pct, `Loading Swanada (${tierMb})… ${pct}%`);
    }
  });

  ctrl.on('ready', () => {
    hideProg();
    if (state.isRecording && isCaptureReady) {
      setPhase('recording');
    }
  });

  ctrl.on('partial', (data) => {
    if (!state.isRecording) return;
    const t = (data && data.text ? data.text : '').trim();
    if (t) renderInterimTranscript(t);
  });

  ctrl.on('final', (data) => {
    const t = (data && data.text ? data.text : '').trim();
    if (t) commitRecognizedTranscript(t);
    else removeInterim();
  });

  ctrl.on('error', (err) => {
    hideProg();
    const msg = (err && (err.message || err.error)) || 'Speech engine error';
    toast(msg, 'error');
  });
}

// ─── Web Speech Fallback (only for direct Urdu / Assamese native STT) ───
async function initFallbackWebSpeech(locale) {
  const SpeechAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechAPI) {
    toast('Direct Urdu/Assamese STT requires Chrome/Safari — or use EN → UR / EN → AS mode for 100% on-device Swanada + Paar.', 'error');
    return false;
  }

  recognition = new SpeechAPI();
  recognition.lang = locale;
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    let interim = '', final = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const t = event.results[i][0].transcript;
      if (event.results[i].isFinal) final += t;
      else interim += t;
    }
    if (final) commitRecognizedTranscript(final);
    if (interim) renderInterimTranscript(interim);
  };

  recognition.onerror = (event) => {
    if (event.error === 'no-speech' || event.error === 'aborted') return;
    if (event.error === 'not-allowed') {
      toast('Microphone access denied.', 'error');
      stopRecordingSession();
    }
  };

  recognition.onend = () => {
    if (state.isRecording && state.activeSttEngine === 'webspeech') {
      try { recognition.start(); } catch {}
    }
  };

  return true;
}

// ─── Paar Model Download Lifecycle ───
let _unsubModelStatus = null;

export function initModelProgress() {
  if (typeof _unsubModelStatus === 'function') {
    _unsubModelStatus();
    _unsubModelStatus = null;
  }

  _unsubModelStatus = onModelStatus((data) => {
    if (!data || (data.language && data.language !== state.currentLanguage)) return;

    const langName = getLanguage(data.language || state.currentLanguage).name;

    if (data.type === 'model-ready' || data.status === 'ready') {
      hideProg();
      return;
    }

    if (data.type === 'model-error') {
      hideProg();
      if (data.error) toast(`Paar model error: ${data.error}`, 'error');
      return;
    }

    if (data.type === 'model-loading') {
      showProg(2, `Loading Paar ${langName}…`);
      return;
    }

    if (data.type === 'model-progress') {
      if (data.status === 'done' || data.status === 'initiate' || data.status === 'download') {
        return;
      }
      const pct = typeof data.progress === 'number'
        ? Math.round(data.progress)
        : (data.total ? Math.round((data.loaded / data.total) * 100) : null);

      if (pct !== null) {
        if (pct >= 100) {
          hideProg();
        } else {
          showProg(pct, `Loading Paar ${langName}… ${pct}%`);
        }
      }
    }
  });
}

// ═══════════════════════════════════
//  Custom Language Picker & Switching
// ═══════════════════════════════════

export function populateLanguages() {
  const allLangs = getAllLanguages();

  const sel = $('#lang-select');
  if (sel) {
    sel.innerHTML = allLangs.map(lang =>
      `<option value="${lang.id}"${lang.id === state.currentLanguage ? ' selected' : ''}>${lang.nativeName} (${lang.name})</option>`
    ).join('');
    sel.value = state.currentLanguage;
  }

  const menu = $('#lang-menu');
  if (menu) {
    clearElementChildren(menu);

    allLangs.forEach((lang) => {
      const isSelected = lang.id === state.currentLanguage;
      const opt = document.createElement('button');
      opt.setAttribute('type', 'button');
      opt.setAttribute('role', 'option');
      opt.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      opt.className = 'lang-option' + (isSelected ? ' is-selected' : '');
      opt.dataset.lang = lang.id;

      const rtlBadge = lang.direction === 'rtl' ? '<span class="lang-option-rtl">RTL</span>' : '';
      opt.innerHTML = `
        <span class="lang-option-text">
          <span class="lang-option-native" dir="${lang.direction}">${esc(lang.nativeName)}</span>
          <span class="lang-option-sub">${esc(lang.name)} ${rtlBadge}</span>
        </span>
        <svg class="lang-option-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      `;

      opt.addEventListener('click', () => {
        setLanguage(lang.id, true);
        closeLangMenu(true);
      });

      menu.appendChild(opt);
    });
  }

  syncLangPickerUI(getLanguage(state.currentLanguage));
}

function syncLangPickerUI(langConfig) {
  const triggerLabel = $('#lang-trigger-label');
  const triggerCode = $('#lang-trigger-code');
  const voiceModeLabel = $('#voice-mode-label');
  const menu = $('#lang-menu');

  if (triggerLabel) {
    triggerLabel.textContent = langConfig.nativeName;
    triggerLabel.setAttribute('dir', langConfig.direction);
  }
  if (triggerCode) {
    triggerCode.textContent = langConfig.id.toUpperCase();
  }
  if (voiceModeLabel) {
    voiceModeLabel.textContent = `EN → ${langConfig.id.toUpperCase()}`;
  }

  if (menu && menu.children) {
    const items = Array.isArray(menu.children) ? menu.children : Array.from(menu.children);
    items.forEach((opt) => {
      const selected = opt.dataset && opt.dataset.lang === langConfig.id;
      opt.classList?.toggle('is-selected', Boolean(selected));
      opt.setAttribute?.('aria-selected', selected ? 'true' : 'false');
    });
  }
}

function syncLangMenuMaxHeight() {
  const bar = $('#float-bar');
  const popover = $('#lang-popover');
  const menu = $('#lang-menu');
  if (!menu && !popover) return;

  const vv = typeof window !== 'undefined' ? window.visualViewport : null;
  const vvHeight = vv && typeof vv.height === 'number'
    ? vv.height
    : (typeof window !== 'undefined' && typeof window.innerHeight === 'number' ? window.innerHeight : 800);
  const vvTop = vv && typeof vv.offsetTop === 'number' ? vv.offsetTop : 0;

  const barRect = bar && typeof bar.getBoundingClientRect === 'function' ? bar.getBoundingClientRect() : null;
  const hasBarRect = Boolean(barRect && (barRect.height > 0 || barRect.top > 0));
  const isNarrow = typeof window !== 'undefined' &&
    ((typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 640px)').matches) ||
     (typeof window.innerWidth === 'number' && window.innerWidth <= 640));
  const barHeight = hasBarRect ? barRect.height : (isNarrow ? 108 : 44);
  const targetBarTop = vvHeight - 10 - barHeight;
  const actualBarTop = hasBarRect ? (barRect.top - vvTop) : targetBarTop;
  const effectiveBarTop = Math.min(actualBarTop, targetBarTop);

  const maxH = Math.min(420, Math.max(140, Math.floor(effectiveBarTop - 74)));
  const px = `${maxH}px`;

  if (popover?.style && typeof popover.style.setProperty === 'function') {
    popover.style.setProperty('--lang-menu-max-h', px);
  }
  if (menu?.style) {
    if (typeof menu.style.setProperty === 'function') {
      menu.style.setProperty('--lang-menu-max-h', px);
    }
    menu.style.maxHeight = px;
  }
}

function openLangMenu() {
  const picker = $('#lang-picker');
  const trigger = $('#lang-trigger');
  const popover = $('#lang-popover');
  const menu = $('#lang-menu');
  if (!picker || !popover || !trigger) return;

  state.langMenuOpen = true;
  popover.hidden = false;
  syncLangMenuMaxHeight();
  picker.classList.add('is-open');
  trigger.setAttribute('aria-expanded', 'true');

  if (menu && menu.children) {
    const items = Array.isArray(menu.children) ? menu.children : Array.from(menu.children);
    const activeItem = items.find(el => el.dataset?.lang === state.currentLanguage) || items[0];
    activeItem?.focus?.();
  }
}

function closeLangMenu(restoreFocus = false) {
  const picker = $('#lang-picker');
  const trigger = $('#lang-trigger');
  const popover = $('#lang-popover');
  if (!picker || !popover || !trigger) return;

  state.langMenuOpen = false;
  popover.hidden = true;
  picker.classList.remove('is-open');
  trigger.setAttribute('aria-expanded', 'false');
  if (restoreFocus) trigger.focus?.();
}

function toggleLangMenu() {
  state.langMenuOpen ? closeLangMenu(true) : openLangMenu();
}

export function setLanguage(langId, notify = true) {
  if (!isValidLanguage(langId)) {
    langId = DEFAULT_LANGUAGE_ID;
  }
  const langConfig = getLanguage(langId);
  const prevLang = state.currentLanguage;
  state.currentLanguage = langConfig.id;

  const sel = $('#lang-select');
  if (sel && sel.value !== langConfig.id) {
    sel.value = langConfig.id;
  }
  syncLangPickerUI(langConfig);

  const ed = $('#editor');
  if (ed) {
    ed.dir = langConfig.direction;
    ed.setAttribute('dir', langConfig.direction);
    ed.setAttribute('lang', langConfig.id);
    ed.setAttribute('placeholder', langConfig.defaultPlaceholder);
    ed.setAttribute('data-placeholder', langConfig.defaultPlaceholder);
    ed.setAttribute('aria-label', `${langConfig.name} text editor`);
    ed.classList.toggle('is-rtl', langConfig.direction === 'rtl');
  }

  // If currently recording and language changed, restart recording cleanly with the new target head
  if (state.isRecording && prevLang !== langConfig.id) {
    stopRecordingSession().then(() => startRecordingSession()).catch(() => {});
  }

  const knToggle = $('#kn-toggle');
  if (knToggle) {
    if (langConfig.id === 'kn') {
      knToggle.hidden = false;
      state.kannadaMode = knToggle.classList.contains('is-active');
      knToggle.setAttribute('aria-pressed', String(state.kannadaMode));
    } else {
      knToggle.hidden = true;
      state.kannadaMode = false;
      if (typeof flushTranslitBuffer === 'function') flushTranslitBuffer();
    }
  }

  if (state.voiceTranslateMode) {
    try {
      preloadLanguageModel(langConfig.id).catch(() => {});
    } catch {}
  }

  saveLanguagePreference(langConfig.id);

  if (notify && prevLang !== langConfig.id) {
    toast(`Language: ${langConfig.name} (${langConfig.nativeName})`, 'info');
  }
}

export async function translateCurrentContent(targetLang = state.currentLanguage) {
  const ed = $('#editor');
  const text = edText();
  if (!text) {
    toast('Type or dictate English text first to translate.', 'info');
    return '';
  }

  const langConfig = getLanguage(targetLang);
  const lbl = $('#mic-label');
  const prevLabel = lbl ? lbl.textContent : '';
  if (lbl) lbl.textContent = 'Translating…';
  if (ed) ed.classList.add('is-translating');

  try {
    const translated = await translateText(text, langConfig.id);
    if (ed) {
      ed.innerHTML = translated.split('\n').map(esc).join('<br>');
      ed.dir = langConfig.direction;
      ed.setAttribute('dir', langConfig.direction);
      ed.classList.toggle('is-rtl', langConfig.direction === 'rtl');
    }
    saveDoc();
    toast(`Translated to ${langConfig.name}!`, 'success');
    return translated;
  } catch (err) {
    toast(`Translation failed: ${err.message}`, 'error');
    throw err;
  } finally {
    if (ed) ed.classList.remove('is-translating');
    if (lbl) lbl.textContent = prevLabel;
  }
}

// ═══════════════════════════════════
//  RECORD — Swanada Neural STT (with Web Speech fallback for UR/AS native)
// ═══════════════════════════════════

async function toggleRec() {
  state.isRecording ? await stopRecordingSession() : await startRecordingSession();
}

export async function startRecordingSession() {
  if (state.isRecording) return;
  const attemptId = ++recordingAttemptId;

  const target = resolveSttTarget(state.currentLanguage, state.voiceTranslateMode);

  if (target.engine === 'swanada') {
    const ctrl = ensureSttController();
    const tierLabel = detectSwanadaTier() === 'mobile' ? '25 MB' : 'Studio';
    const lbl = $('#mic-label');

    try {
      state.activeSttEngine = 'swanada';
      state.isRecording = true;
      isCaptureReady = false;
      setPhase('recording');
      if (lbl) lbl.textContent = `Loading Swanada (${tierLabel})…`;
      await ctrl.start(target.acousticLang, { mode: state.voiceTranslateMode ? 'translate' : 'stt' });
      if (attemptId !== recordingAttemptId || !state.isRecording) {
        if (!state.isRecording) {
          try { await ctrl.stop?.(); } catch {}
          hideProg();
        }
        return;
      }
      isCaptureReady = true;
      hideProg();
      setPhase('recording');
    } catch (err) {
      if (attemptId !== recordingAttemptId) {
        if (!state.isRecording) hideProg();
        return;
      }
      isCaptureReady = false;
      state.isRecording = false;
      state.activeSttEngine = null;
      hideProg();
      setPhase('ready');
      toast(err.message || 'Microphone or Swanada init failed.', 'error');
    }
    return;
  }

  // Fallback for direct native Urdu / Assamese dictation
  if (!(await initFallbackWebSpeech(target.acousticLang))) {
    return;
  }
  if (attemptId !== recordingAttemptId) return;
  try {
    state.activeSttEngine = 'webspeech';
    recognition.start();
    state.isRecording = true;
    isCaptureReady = true;
    setPhase('recording');
  } catch {
    state.activeSttEngine = null;
    toast('Could not start speech recognition.', 'error');
  }
}

export async function stopRecordingSession() {
  recordingAttemptId++;
  const stopAttempt = recordingAttemptId;
  if (!state.isRecording) return;

  const engine = state.activeSttEngine;
  isCaptureReady = false;
  state.isRecording = false;
  state.activeSttEngine = null;
  clearTimeout(pauseTimer);
  hideProg();

  if (engine === 'swanada' && sttController) {
    const lbl = $('#mic-label');
    if (lbl) lbl.textContent = 'Finishing…';
    try {
      await sttController.stop();
    } catch {}
  } else if (engine === 'webspeech' && recognition) {
    try { recognition.stop(); } catch {}
  }

  if (stopAttempt !== recordingAttemptId || state.isRecording) return;

  removeInterim();
  setPhase('ready');
  saveDoc();
}

export function setEditorMode(mode, notify = true) {
  const translateActive = mode === 'translate';
  const changed = state.voiceTranslateMode !== translateActive;
  state.voiceTranslateMode = translateActive;

  const sttBtn = $('#mode-stt-btn');
  const trBtn = $('#mode-translate-btn');
  if (sttBtn) {
    sttBtn.classList.toggle('is-active', !translateActive);
    sttBtn.setAttribute('aria-pressed', String(!translateActive));
  }
  if (trBtn) {
    trBtn.classList.toggle('is-active', translateActive);
    trBtn.setAttribute('aria-pressed', String(translateActive));
  }

  if (state.isRecording && changed) {
    stopRecordingSession().then(() => startRecordingSession()).catch(() => {});
  }

  const langConfig = getLanguage(state.currentLanguage);
  if (translateActive) {
    try {
      preloadLanguageModel(langConfig.id).catch(() => {});
    } catch {}
  }

  if (notify && changed) {
    toast(
      translateActive
        ? `Mode: English → ${langConfig.name} (Swanada EN + Paar)`
        : `Mode: Native ${langConfig.name} STT`,
      'info'
    );
  }
}

function getRecordingStatusLabel() {
  if (state.voiceTranslateMode) {
    return '● EN → ' + state.currentLanguage.toUpperCase();
  }
  if (state.activeSttEngine === 'swanada' && !isCaptureReady) {
    return 'Starting Swanada…';
  }
  const nativeName = getLanguage(state.currentLanguage).nativeName;
  return `● Swanada Live (${nativeName})…`;
}

// ─── Phase ───
function setPhase(p) {
  state.phase = p;
  const mic = $('#mic'), lbl = $('#mic-label');

  if (mic) {
    mic.disabled = !['ready', 'recording'].includes(p);
    mic.classList.toggle('is-recording', state.isRecording);
  }

  if (lbl) {
    lbl.dataset.phase = p;
    lbl.textContent = {
      idle: '',
      ready: '',
      recording: getRecordingStatusLabel(),
    }[p] || '';
  }
}

// ─── Progress ───
let _progRAF = null;
let _lastPct = -1;

function showProg(pct, message) {
  _lastPct = pct;
  const msg = message || ('Loading model… ' + pct + '%');

  if (_progRAF) cancelAnimationFrame(_progRAF);
  _progRAF = requestAnimationFrame(() => {
    _progRAF = null;
    const bar = $('#progress'), fill = $('#progress-fill'), lbl = $('#mic-label');
    if (bar) bar.hidden = false;
    if (fill) fill.style.transform = 'scaleX(' + (Math.max(0, Math.min(100, _lastPct)) / 100) + ')';
    if (lbl) lbl.textContent = msg;
  });
}

function hideProg() {
  _lastPct = -1;
  if (_progRAF) { cancelAnimationFrame(_progRAF); _progRAF = null; }
  const bar = $('#progress'), fill = $('#progress-fill'), lbl = $('#mic-label');
  if (bar) bar.hidden = true;
  if (fill) fill.style.transform = 'scaleX(0)';
  if (lbl) {
    lbl.textContent = state.isRecording ? getRecordingStatusLabel() : '';
  }
}

// ─── Events ───
function bind() {
  $('#hero-open-editor')?.addEventListener('click', openEditor);
  $('#back-btn')?.addEventListener('click', closeEditor);

  $('#lang-select')?.addEventListener('change', e => {
    setLanguage(e.target.value, true);
  });

  $('#lang-trigger')?.addEventListener('click', e => {
    e.stopPropagation?.();
    toggleLangMenu();
  });

  $('#lang-menu')?.addEventListener('keydown', e => {
    const menu = $('#lang-menu');
    if (!menu || !menu.children) return;
    const items = Array.isArray(menu.children) ? menu.children : Array.from(menu.children);
    if (!items.length) return;

    const currentIdx = items.indexOf(document.activeElement);
    let nextIdx = -1;

    if (e.key === 'ArrowDown') nextIdx = currentIdx < 0 ? 0 : Math.min(items.length - 1, currentIdx + 2);
    else if (e.key === 'ArrowUp') nextIdx = currentIdx < 0 ? 0 : Math.max(0, currentIdx - 2);
    else if (e.key === 'ArrowRight') nextIdx = currentIdx < 0 ? 0 : (currentIdx + 1) % items.length;
    else if (e.key === 'ArrowLeft') nextIdx = currentIdx <= 0 ? items.length - 1 : currentIdx - 1;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = items.length - 1;
    else if (e.key === 'Escape') {
      e.preventDefault?.();
      closeLangMenu(true);
      return;
    }

    if (nextIdx >= 0) {
      e.preventDefault?.();
      items[nextIdx]?.focus?.();
    }
  });

  document.addEventListener('click', e => {
    if (!state.langMenuOpen) return;
    const picker = $('#lang-picker');
    if (picker && picker.contains && !picker.contains(e.target)) {
      closeLangMenu(false);
    }
  });

  $('#mic')?.addEventListener('click', toggleRec);
  $('#mode-stt-btn')?.addEventListener('click', () => setEditorMode('stt', true));
  $('#mode-translate-btn')?.addEventListener('click', () => setEditorMode('translate', true));
  $('#translate-btn')?.addEventListener('click', () => {
    translateCurrentContent().catch(() => {});
  });

  $('#copy-btn')?.addEventListener('click', async () => {
    try { await copyContent(); } catch {}
  });

  $('#save-btn')?.addEventListener('click', () => {
    saveFile();
  });

  $('#clear-btn')?.addEventListener('click', () => {
    clearEditor();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && state.langMenuOpen) {
      e.preventDefault();
      closeLangMenu(true);
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
      e.preventDefault();
      if (['ready', 'recording'].includes(state.phase)) toggleRec();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === '/') {
      e.preventDefault();
      toggleHelp();
    }
  });

  const kn = $('#kn-toggle');
  if (kn) {
    kn.addEventListener('click', () => {
      state.kannadaMode = !state.kannadaMode;
      kn.classList.toggle('is-active', state.kannadaMode);
      kn.setAttribute('aria-pressed', String(state.kannadaMode));
      toast(state.kannadaMode ? 'Kannada phonetic typing ON' : 'Kannada phonetic typing OFF', 'success');
    });
  }

  $('#help-btn')?.addEventListener('click', toggleHelp);
  $('#help-close')?.addEventListener('click', toggleHelp);
  $('#help-overlay')?.addEventListener('click', e => { if (e.target.id === 'help-overlay') toggleHelp(); });

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

  $('#cmd-reset')?.addEventListener('click', () => {
    voiceCommands = [...DEFAULT_COMMANDS];
    saveCustomCommands(voiceCommands);
    renderCommandTable();
    toast('Reset to defaults', 'success');
  });

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

  if (window.visualViewport) {
    const bar = $('#float-bar');
    const ed = $('#editor');
    let vvRAF = null;
    const syncVisualViewport = () => {
      if (vvRAF) return;
      let syncDone = false;
      vvRAF = requestAnimationFrame(() => {
        syncDone = true;
        vvRAF = null;
        const vv = window.visualViewport;
        if (!vv) return;
        const kbOffset = Math.max(0, Math.round(window.innerHeight - (vv.height + (vv.offsetTop || 0))));
        if (bar) bar.style.bottom = kbOffset > 50 ? `${kbOffset + 8}px` : '';
        if (ed) ed.style.paddingBottom = kbOffset > 50 ? `${kbOffset + 120}px` : '';
        syncLangMenuMaxHeight();
      });
      if (syncDone) vvRAF = null;
    };
    window.visualViewport.addEventListener('resize', syncVisualViewport);
    window.visualViewport.addEventListener('scroll', syncVisualViewport);
  }
  const barEl = $('#float-bar');
  if (barEl && typeof barEl.addEventListener === 'function') {
    barEl.addEventListener('transitionend', (e) => {
      if (state.langMenuOpen && (!e?.propertyName || e.propertyName === 'bottom')) {
        syncLangMenuMaxHeight();
      }
    });
  }
  window.addEventListener?.('resize', () => {
    if (state.langMenuOpen) syncLangMenuMaxHeight();
  });

  initTranslit();
  const debouncedSave = debounce(saveDoc, 800);
  $('#editor')?.addEventListener('input', () => {
    normalizeEmptyEditor();
    debouncedSave();
  });
  window.addEventListener?.('beforeunload', () => {
    saveDoc();
  });
}

// ═══════════════════════════════════
//  Editor Operations & Persistence
// ═══════════════════════════════════

export function edText() {
  const ed = $('#editor');
  if (!ed) return '';
  if (typeof ed.cloneNode === 'function') {
    const clone = ed.cloneNode(true);
    clone.querySelectorAll?.('.interim, .kn-buffer, .translating-chunk').forEach(el => el.remove());
    return (clone.innerText || clone.textContent || '').trim();
  }
  if (Array.isArray(ed.children) && ed.children.length > 0) {
    return ed.children
      .filter(el => !el.classList?.contains('interim') && !el.classList?.contains('kn-buffer') && !el.classList?.contains('translating-chunk'))
      .map(el => (el.tagName === 'BR' ? '\n' : (el.textContent || '')))
      .join('')
      .trim();
  }
  return (ed.innerText || ed.textContent || '').trim();
}

export function saveFile() {
  const text = edText();
  if (!text) {
    toast('Editor is empty — nothing to save.', 'error');
    return null;
  }

  const lang = getLanguage(state.currentLanguage);
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `${lang.name.toLowerCase()}-${dateStr}.txt`;
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);

  toast('Saved!', 'success');
  return { filename, blob, content: text };
}

export async function copyContent() {
  const text = edText();
  if (!text) {
    toast('Editor is empty.', 'info');
    return '';
  }
  try {
    await navigator.clipboard.writeText(text);
    toast('Copied!', 'success');
    return text;
  } catch (err) {
    toast('Failed to copy text', 'error');
    throw err;
  }
}

export function clearEditor() {
  const ed = $('#editor');
  if (ed && ed.textContent.trim() && !confirm('Clear?')) return;

  if (state.isRecording) stopRecordingSession();

  if (ed) {
    ed.innerHTML = '';
    ed.innerText = '';
  }

  if (typeof clearTranslitBuffer === 'function') {
    clearTranslitBuffer();
  }

  saveDoc();
  toast('Editor cleared', 'info');
}

export function saveDoc() {
  const text = edText();
  try {
    localStorage.setItem(STORAGE_KEYS.CONTENT, text);
    localStorage.setItem(STORAGE_KEYS.LEGACY_CONTENT, text);
  } catch {}
}

export function loadDoc() {
  try {
    let s = localStorage.getItem(STORAGE_KEYS.CONTENT);
    if (s === null) s = localStorage.getItem(STORAGE_KEYS.LEGACY_CONTENT);
    const ed = $('#editor');
    if (s && ed) {
      ed.innerHTML = s.split('\n').map(esc).join('<br>');
    }
  } catch {}
}

export function saveLanguagePreference(langId) {
  try {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, langId);
  } catch {}
}

export function loadLanguagePreference() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    if (saved && isValidLanguage(saved)) return saved;
  } catch {}
  return DEFAULT_LANGUAGE_ID;
}

export function loadStoredState() {
  const savedLang = loadLanguagePreference();
  setLanguage(savedLang, false);
  loadDoc();
  normalizeEmptyEditor();
}

// ─── Toast ───
function toast(msg, type = 'info') {
  const c = $('#toast-container');
  if (!c) return;
  const isErrorToast = (node) =>
    Boolean(node?.classList?.contains?.('toast--error')) ||
    /\btoast--error\b/.test(String(node?.className || ''));
  const isMobile = typeof window !== 'undefined' &&
    ((typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 640px)').matches) ||
     (typeof window.innerWidth === 'number' && window.innerWidth > 0 && window.innerWidth <= 640));

  for (const prev of Array.from(c.children || [])) {
    if (!isErrorToast(prev) || type === 'error' || isMobile) {
      if (typeof prev.remove === 'function') prev.remove();
      else c.removeChild?.(prev);
    }
  }

  const el = document.createElement('div');
  el.className = 'toast toast--' + type;
  el.classList?.add?.('toast', 'toast--' + type);
  el.textContent = msg;
  c.appendChild(el);
  requestAnimationFrame(() => el.classList.add('is-visible'));
  setTimeout(() => {
    el.classList.remove('is-visible');
    el.ontransitionend = () => el.remove();
  }, 3000);
}

// ─── Transliteration (Kannada phonetic helper) ───
function initTranslit() {
  const ed = $('#editor');
  if (!ed) return;
  let buf = '';

  const isTranslitActive = () => state.currentLanguage === 'kn' && state.kannadaMode;

  function getBufSpan() {
    let s = ed.querySelector('.kn-buffer');
    if (!s) {
      s = document.createElement('span');
      s.className = 'kn-buffer';
      s.contentEditable = 'false';
    }
    return s;
  }

  function rmBuf() {
    const s = ed.querySelector('.kn-buffer');
    if (s) s.remove();
  }

  function insertText(txt) {
    rmBuf();
    const sel = window.getSelection?.();
    if (!sel || !sel.rangeCount) {
      ed.appendChild(document.createTextNode(txt));
      return;
    }
    const r = sel.getRangeAt(0);
    r.deleteContents();
    const n = document.createTextNode(txt);
    r.insertNode(n);
    r.setStartAfter(n);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);
  }

  function showBuf() {
    const s = getBufSpan();
    s.textContent = buf;
    if (!s.parentNode) {
      const sel = window.getSelection?.();
      if (sel && sel.rangeCount) {
        const r = sel.getRangeAt(0);
        r.deleteContents();
        r.insertNode(s);
        r.setStartAfter(s);
        r.collapse(true);
        sel.removeAllRanges();
        sel.addRange(r);
      } else {
        ed.appendChild(s);
      }
    }
  }

  function flush(sep) {
    if (!buf) return;
    const c = transliterate(buf);
    buf = '';
    insertText(c + (sep || ''));
  }

  flushTranslitBuffer = () => { if (buf) flush(''); };
  clearTranslitBuffer = () => { buf = ''; rmBuf(); };

  ed.addEventListener('keydown', e => {
    if (!isTranslitActive() || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Unidentified' || e.key === 'Process') return;
    if (e.key === ' ' || e.key === 'Enter') {
      if (buf) { e.preventDefault(); flush(e.key === 'Enter' ? '\n' : ' '); }
      return;
    }
    if (e.key === 'Backspace') {
      if (buf) { e.preventDefault(); buf = buf.slice(0, -1); buf ? showBuf() : rmBuf(); }
      return;
    }
    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
      e.preventDefault();
      buf += e.key;
      showBuf();
      return;
    }
    if (e.key.length === 1 && buf) flush('');
  });

  ed.addEventListener('beforeinput', e => {
    if (!isTranslitActive()) return;

    if (e.inputType === 'insertText' && e.data) {
      if (/^[a-zA-Z]$/.test(e.data)) {
        e.preventDefault();
        buf += e.data;
        showBuf();
        return;
      }
      if (e.data.length > 1 && /[a-zA-Z]/.test(e.data)) {
        e.preventDefault();
        if (buf) flush('');
        const converted = e.data.replace(/[a-zA-Z]+/g, match => transliterate(match));
        insertText(converted);
        return;
      }
      if (e.data === ' ' && buf) {
        e.preventDefault();
        flush(' ');
        return;
      }
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
    }
  });

  ed.addEventListener('mousedown', () => { if (buf) flush(''); });
  ed.addEventListener('touchend', () => { if (buf) flush(''); });
  ed.addEventListener('blur', () => { if (buf) flush(''); });

  ed.addEventListener('paste', e => {
    if (!isTranslitActive()) return;
    const plain = (e.clipboardData || window.clipboardData)?.getData('text');
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
    const delBtn = tr.querySelector?.('.cmd-del');
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        voiceCommands.splice(i, 1);
        saveCustomCommands(voiceCommands);
        renderCommandTable();
      });
    }
    tbody.appendChild(tr);
  });
}

// ─── Util ───
function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function debounce(fn, ms) {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
}
