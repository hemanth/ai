/**
 * Lipi — Indic Voice Editor (app.js)
 *
 * LIVE VOICE: Web Speech API streams native speech across 12 Indic locales (or English -> Indic via Paar)
 * TRANSLATE:  Udgam Labs Paar neural translation models run locally in-browser via Transformers.js
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
  kannadaMode: true,
  currentLanguage: DEFAULT_LANGUAGE_ID,
  voiceTranslateMode: false,
  langMenuOpen: false,
  heroIndex: 0,
};

let recognition = null;
let interimSpan = null;
let heroTimer = null;
let heroSwapTimer = null;
let clearTranslitBuffer = () => {};
let flushTranslitBuffer = () => {};

const $ = s => document.querySelector(s);

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

  if (location.hash === '#editor') openEditor();
});

// ═══════════════════════════════════
//  12-Script Landing Hero Animation
// ═══════════════════════════════════

function getOrderedHeroLanguages() {
  return getAllLanguages();
}

function clearElementChildren(el) {
  if (!el) return;
  if (el.children && typeof el.removeChild === 'function') {
    while (el.children.length > 0) {
      el.removeChild(el.children[0]);
    }
  }
  el.innerHTML = '';
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

  if (strip && Array.isArray(strip.children)) {
    for (let i = 0; i < strip.children.length; i++) {
      const pill = strip.children[i];
      if (pill && pill.classList) {
        pill.classList.toggle('is-active', i === normalizedIdx);
      }
    }
  } else if (strip && strip.children) {
    Array.from(strip.children).forEach((pill, i) => {
      pill.classList.toggle('is-active', i === normalizedIdx);
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

// ─── View switching ───
function openEditor() {
  stopHeroAnimation();
  closeLangMenu();
  const landing = $('#landing');
  const edView = $('#editor-view');
  if (landing) landing.hidden = true;
  if (edView) edView.hidden = false;

  const isMobile = window.matchMedia('(max-width: 640px)').matches || 'ontouchstart' in window;
  if (!isMobile) $('#editor')?.focus();
  history.replaceState(null, '', '#editor');

  // Only preload Paar ONNX model if user is in EN -> Indic Translate mode;
  // default Indic STT mode needs zero model downloads.
  if (state.voiceTranslateMode) {
    const preload = () => {
      preloadLanguageModel(state.currentLanguage).catch(() => {});
    };
    if ('requestIdleCallback' in window) requestIdleCallback(preload, { timeout: 2500 });
    else setTimeout(preload, 600);
  }
}

function closeEditor() {
  if (state.isRecording) stopRec();
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
//  Web Speech API — Live Streaming & Translation
// ═══════════════════════════════════
async function initSpeech() {
  const SpeechAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechAPI) {
    toast('Web Speech API requires Chrome, Edge, or Safari.', 'error');
    return false;
  }

  const langConfig = getLanguage(state.currentLanguage);
  recognition = new SpeechAPI();
  recognition.lang = state.voiceTranslateMode ? 'en-IN' : langConfig.speechLocale;
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  if ('processLocally' in recognition) {
    try {
      const locale = recognition.lang;
      const availability = await SpeechAPI.available({ langs: [locale], processLocally: true });
      if (availability === 'available') {
        recognition.processLocally = true;
      } else if (availability === 'downloadable') {
        await SpeechAPI.install({ langs: [locale], processLocally: true });
        recognition.processLocally = true;
      }
    } catch {}
  }

  recognition.onresult = handleSpeechResult;

  recognition.onerror = (event) => {
    if (event.error === 'no-speech' || event.error === 'aborted') return;
    if (event.error === 'not-allowed') {
      toast('Microphone access denied.', 'error');
      stopRec();
    }
  };

  recognition.onend = () => {
    if (state.isRecording) {
      try { recognition.start(); } catch {}
    }
  };

  return true;
}

function renderTextToFragment(text, hasLeadingSpace = false) {
  const frag = document.createDocumentFragment();
  const parts = text.split('\n');
  parts.forEach((part, i) => {
    if (i > 0) frag.appendChild(document.createElement('br'));
    if (part) {
      if (i === 0 && hasLeadingSpace) frag.appendChild(document.createTextNode(' '));
      frag.appendChild(document.createTextNode(part));
    }
  });
  return frag;
}

function handleSpeechResult(event) {
  const ed = $('#editor');
  if (!ed) return;

  let interim = '', final = '';
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const t = event.results[i][0].transcript;
    if (event.results[i].isFinal) final += t;
    else interim += t;
  }

  if (final) {
    removeInterim();
    const processed = processVoiceCommands(final.trim());
    if (processed) {
      const needsLeadingSpace = ed.textContent.trim().length > 0;

      if (state.voiceTranslateMode) {
        const pendingSpan = document.createElement('span');
        pendingSpan.className = 'translating-chunk';
        if (needsLeadingSpace) ed.appendChild(document.createTextNode(' '));
        pendingSpan.textContent = processed;
        ed.appendChild(pendingSpan);
        ed.scrollTop = ed.scrollHeight;

        const lbl = $('#mic-label');
        if (lbl) lbl.textContent = 'Translating…';

        const targetLang = state.currentLanguage;
        translateText(processed, targetLang)
          .then((translated) => {
            if (pendingSpan.parentNode) {
              const frag = renderTextToFragment(translated, false);
              pendingSpan.parentNode.replaceChild(frag, pendingSpan);
            }
            if (state.isRecording && lbl) lbl.textContent = '● Streaming…';
            else if (lbl) lbl.textContent = '';
            ed.scrollTop = ed.scrollHeight;
            saveDoc();
          })
          .catch((err) => {
            if (pendingSpan.parentNode) pendingSpan.classList.remove('translating-chunk');
            toast(`Translation error: ${err.message}`, 'error');
            if (state.isRecording && lbl) lbl.textContent = '● Streaming…';
          });
      } else {
        const frag = renderTextToFragment(processed, needsLeadingSpace);
        ed.appendChild(frag);
        ed.scrollTop = ed.scrollHeight;
        saveDoc();
      }
    }

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
}

function removeInterim() {
  if (interimSpan && interimSpan.parentNode) {
    interimSpan.remove();
    interimSpan = null;
  }
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

  // 1. Sync hidden <select id="lang-select">
  const sel = $('#lang-select');
  if (sel) {
    sel.innerHTML = allLangs.map(lang =>
      `<option value="${lang.id}"${lang.id === state.currentLanguage ? ' selected' : ''}>${lang.nativeName} (${lang.name})</option>`
    ).join('');
    sel.value = state.currentLanguage;
  }

  // 2. Populate custom glassmorphic listbox (#lang-menu)
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

function openLangMenu() {
  const picker = $('#lang-picker');
  const trigger = $('#lang-trigger');
  const popover = $('#lang-popover');
  const menu = $('#lang-menu');
  if (!picker || !popover || !trigger) return;

  state.langMenuOpen = true;
  popover.hidden = false;
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

  // 1. Sync hidden select & custom dropdown UI
  const sel = $('#lang-select');
  if (sel && sel.value !== langConfig.id) {
    sel.value = langConfig.id;
  }
  syncLangPickerUI(langConfig);

  // 2. Update editor attributes & BiDi
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

  // 3. Update speech recognition locale
  if (recognition) {
    const targetLocale = state.voiceTranslateMode ? 'en-IN' : langConfig.speechLocale;
    if (recognition.lang !== targetLocale) {
      if (state.isRecording) {
        try { recognition.stop(); } catch {}
        recognition.lang = targetLocale;
        try { recognition.start(); } catch {}
      } else {
        recognition.lang = targetLocale;
      }
    }
  }

  // 4. Update Kannada phonetic toggle visibility
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

  // 5. Lazy-load Paar model ONLY when EN -> Indic Translate mode is active
  if (state.voiceTranslateMode) {
    try {
      preloadLanguageModel(langConfig.id).catch(() => {});
    } catch {}
  }

  // 6. Persist preference
  saveLanguagePreference(langConfig.id);

  // 7. Toast feedback on user-initiated change
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
//  RECORD — Web Speech API Streaming
// ═══════════════════════════════════

async function toggleRec() {
  state.isRecording ? stopRec() : await startRec();
}

async function startRec() {
  if (!recognition && !(await initSpeech())) {
    return;
  }

  const langConfig = getLanguage(state.currentLanguage);
  recognition.lang = state.voiceTranslateMode ? 'en-IN' : langConfig.speechLocale;

  try {
    recognition.start();
    state.isRecording = true;
    setPhase('recording');
  } catch (err) {
    toast('Could not start speech recognition.', 'error');
  }
}

function stopRec() {
  if (recognition) {
    try { recognition.stop(); } catch {}
  }
  clearTimeout(pauseTimer);
  removeInterim();
  state.isRecording = false;
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

  const langConfig = getLanguage(state.currentLanguage);
  if (recognition) {
    const targetLocale = translateActive ? 'en-IN' : langConfig.speechLocale;
    if (recognition.lang !== targetLocale) {
      recognition.lang = targetLocale;
      if (state.isRecording) {
        try { recognition.stop(); } catch {}
      }
    }
  }

  if (state.isRecording) {
    setPhase('recording');
  }

  // Lazy-preload Paar model only when entering EN -> Indic translation mode
  if (translateActive) {
    try {
      preloadLanguageModel(langConfig.id).catch(() => {});
    } catch {}
  }

  if (notify && changed) {
    toast(
      translateActive
        ? `Mode: English → ${langConfig.name} live translation`
        : `Mode: Native ${langConfig.name} STT`,
      'info'
    );
  }
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
      recording: state.voiceTranslateMode ? '● EN → ' + state.currentLanguage.toUpperCase() : '● Streaming…',
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
    lbl.textContent = state.isRecording
      ? (state.voiceTranslateMode ? '● EN → ' + state.currentLanguage.toUpperCase() : '● Streaming…')
      : '';
  }
}

// ─── Events ───
function bind() {
  $('#hero-open-editor')?.addEventListener('click', openEditor);
  $('#back-btn')?.addEventListener('click', closeEditor);

  // Sync hidden <select id="lang-select">
  $('#lang-select')?.addEventListener('change', e => {
    setLanguage(e.target.value, true);
  });

  // Custom language dropdown interactions
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

  // Help overlay
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
    window.visualViewport.addEventListener('resize', () => {
      const kbHeight = window.innerHeight - window.visualViewport.height;
      if (bar) bar.style.bottom = kbHeight > 50 ? `${kbHeight + 8}px` : '';
      if (ed) ed.style.paddingBottom = kbHeight > 50 ? `${kbHeight + 60}px` : '';
    });
  }

  initTranslit();
  $('#editor')?.addEventListener('input', debounce(saveDoc, 800));
  window.addEventListener('beforeunload', () => {
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

  if (state.isRecording) stopRec();

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
}

// ─── Toast ───
function toast(msg, type = 'info') {
  const c = $('#toast-container');
  if (!c) return;
  const el = document.createElement('div');
  el.className = 'toast toast--' + type;
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
