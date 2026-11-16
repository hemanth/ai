/**
 * Minimal Headless DOM and Test Environment Helper for Node.js
 * Provides document, window, localStorage, and navigator.clipboard test doubles.
 */

import { MockSpeechRecognition } from './mock-speech.js';
import { MockTranslationWorker } from './mock-worker.js';
import { MockAudioContext, MockMediaStream } from './mock-audio.js';

let _cachedLanguages = null;
let _cachedTranslator = null;

/**
 * Dynamic module loader: loads implementation from root if exists, otherwise reference
 */
export async function getLanguages() {
  if (_cachedLanguages) return _cachedLanguages;
  try {
    _cachedLanguages = await import('../../languages.js');
    return _cachedLanguages;
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND') {
      _cachedLanguages = await import('./reference-languages.js');
      return _cachedLanguages;
    }
    throw err;
  }
}

export async function getTranslator() {
  if (_cachedTranslator) return _cachedTranslator;
  try {
    _cachedTranslator = await import('../../translator.js');
    return _cachedTranslator;
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND') {
      _cachedTranslator = await import('./reference-translator.js');
      return _cachedTranslator;
    }
    throw err;
  }
}

/**
 * Built-in default voice commands (identical to app.js specification)
 */
export const DEFAULT_VOICE_COMMANDS = [
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

/**
 * Greedy regex replacement for voice commands and punctuation
 * @param {string} text
 * @param {Array<{trigger: string, output: string}>} customCommands
 * @returns {string}
 */
export function processVoiceCommands(text, customCommands = []) {
  if (!text || typeof text !== 'string') return '';
  const cmds = [...DEFAULT_VOICE_COMMANDS, ...customCommands].sort((a, b) => b.trigger.length - a.trigger.length);
  let result = text;
  for (const cmd of cmds) {
    const re = new RegExp(cmd.trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(re, cmd.output);
  }
  return result;
}

export class SimpleDOMNode {
  constructor(tagName = 'div', id = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.children = [];
    this.parentNode = null;
    this.attributes = new Map();
    this.style = {};
    this.dataset = {};
    this.hidden = false;
    this.download = '';
    this.href = '';
    this.contentEditable = 'true';
    this.scrollTop = 0;
    this.scrollHeight = 100;
    this.classList = {
      _classes: new Set(),
      add: (...cls) => cls.forEach(c => this.classList._classes.add(c)),
      remove: (...cls) => cls.forEach(c => this.classList._classes.delete(c)),
      contains: (cls) => this.classList._classes.has(cls),
      toggle: (cls, force) => {
        if (force === undefined) {
          if (this.classList.contains(cls)) {
            this.classList.remove(cls);
            return false;
          }
          this.classList.add(cls);
          return true;
        }
        if (force) {
          this.classList.add(cls);
          return true;
        }
        this.classList.remove(cls);
        return false;
      },
    };
    this._listeners = new Map();
    this._innerHTML = '';
    this._value = '';
    this.disabled = false;
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(val) {
    this._innerHTML = String(val);
  }

  get innerText() {
    return this._innerHTML.replace(/<[^>]*>/g, '');
  }

  set innerText(val) {
    this._innerHTML = String(val);
  }

  get textContent() {
    return this.innerText;
  }

  set textContent(val) {
    this.innerText = val;
  }

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = String(val);
  }

  get dir() {
    return this.getAttribute('dir') || 'ltr';
  }

  set dir(val) {
    this.setAttribute('dir', val);
  }

  setAttribute(name, value) {
    const strVal = String(value);
    this.attributes.set(name, strVal);
    if (name === 'download') this.download = strVal;
    if (name === 'href') this.href = strVal;
    if (name === 'hidden') this.hidden = true;
    if (name === 'dir') this._dir = strVal;
  }

  getAttribute(name) {
    return this.attributes.get(name) || null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
    if (name === 'download') this.download = '';
    if (name === 'href') this.href = '';
    if (name === 'hidden') this.hidden = false;
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  appendChild(child) {
    if (child) {
      child.parentNode = this;
      this.children.push(child);
      this._innerHTML += (child.innerHTML || child.textContent || '');
    }
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      child.parentNode = null;
      this.children.splice(idx, 1);
    }
    return child;
  }

  remove() {
    if (this.parentNode && Array.isArray(this.parentNode.children)) {
      this.parentNode.removeChild(this);
    }
  }

  replaceWith(newNode) {
    if (this.parentNode && Array.isArray(this.parentNode.children)) {
      const idx = this.parentNode.children.indexOf(this);
      if (idx !== -1) {
        this.parentNode.children.splice(idx, 1, newNode);
        newNode.parentNode = this.parentNode;
      }
    }
  }

  insertBefore(newNode, refNode) {
    if (refNode) {
      const idx = this.children.indexOf(refNode);
      if (idx !== -1) {
        this.children.splice(idx, 0, newNode);
        newNode.parentNode = this;
        return newNode;
      }
    }
    return this.appendChild(newNode);
  }

  addEventListener(event, handler) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(handler);
  }

  removeEventListener(event, handler) {
    if (this._listeners.has(event)) {
      this._listeners.get(event).delete(handler);
    }
  }

  dispatchEvent(event) {
    const type = typeof event === 'string' ? event : event.type;
    const handlers = this._listeners.get(type);
    if (handlers) {
      const evt = typeof event === 'string' ? { type: event, target: this } : event;
      if (!evt.target) evt.target = this;
      for (const handler of handlers) {
        handler(evt);
      }
    }
    return true;
  }

  click() {
    this.dispatchEvent('click');
  }

  focus() {}
  blur() {}

  querySelector(selector) {
    if (selector.startsWith('#')) {
      const id = selector.slice(1);
      if (this.id === id) return this;
      for (const child of this.children) {
        if (child.querySelector) {
          const found = child.querySelector(selector);
          if (found) return found;
        }
      }
    }
    return null;
  }

  querySelectorAll(selector) {
    const results = [];
    if (selector.startsWith('#')) {
      const id = selector.slice(1);
      if (this.id === id) results.push(this);
      for (const child of this.children) {
        if (child.querySelectorAll) {
          results.push(...child.querySelectorAll(selector));
        }
      }
    }
    return results;
  }
}

class MockLocalStorage {
  constructor() {
    this._store = new Map();
    this.shouldThrowQuotaError = false;
  }

  getItem(key) {
    return this._store.has(key) ? this._store.get(key) : null;
  }

  setItem(key, value) {
    if (this.shouldThrowQuotaError) {
      const err = new Error('QuotaExceededError: DomException');
      err.name = 'QuotaExceededError';
      throw err;
    }
    this._store.set(key, String(value));
  }

  removeItem(key) {
    this._store.delete(key);
  }

  clear() {
    this._store.clear();
  }

  get length() {
    return this._store.size;
  }
}

class MockClipboard {
  constructor() {
    this.text = '';
    this.shouldFail = false;
  }

  async writeText(text) {
    if (this.shouldFail) {
      throw new Error('Clipboard write permission denied');
    }
    this.text = String(text);
    return true;
  }

  async readText() {
    return this.text;
  }
}

/**
 * Sets up global DOM, window, localStorage, and navigator environments
 */
export function setupTestEnvironment() {
  const elements = new Map();
  const blobStore = new Map();
  const documentListeners = new Map();

  const getOrCreate = (id, tag = 'div') => {
    if (!elements.has(id)) {
      elements.set(id, new SimpleDOMNode(tag, id));
    }
    return elements.get(id);
  };

  const env = {
    elements,
    blobs: blobStore,
    lastDownload: null,
    editor: null,
    floatBar: null,
    langSelect: null,
    mic: null,
    micLabel: null,
    copyBtn: null,
    clearBtn: null,
    saveBtn: null,
    toastContainer: null,
    progress: null,
    progressFill: null,
    helpOverlay: null,
    localStorage: null,
    clipboard: null,
  };

  const documentMock = {
    _listeners: documentListeners,
    createElement: (tag) => {
      const el = new SimpleDOMNode(tag);
      if (tag === 'a') {
        el.click = () => {
          env.lastDownload = {
            filename: el.download || el.getAttribute('download') || '',
            href: el.href || el.getAttribute('href') || '',
            blob: blobStore.get(el.href || el.getAttribute('href') || '') || null,
          };
          el.dispatchEvent('click');
        };
      }
      return el;
    },
    createTextNode: (text) => {
      const node = new SimpleDOMNode('span');
      node.textContent = String(text);
      return node;
    },
    getElementById: (id) => elements.get(id) || null,
    querySelector: (selector) => {
      if (selector.startsWith('#')) {
        return getOrCreate(selector.slice(1));
      }
      return null;
    },
    querySelectorAll: (selector) => {
      if (selector.startsWith('#')) {
        const el = getOrCreate(selector.slice(1));
        return [el];
      }
      return [];
    },
    body: new SimpleDOMNode('body', 'body'),
    addEventListener: (event, handler) => {
      if (!documentListeners.has(event)) {
        documentListeners.set(event, new Set());
      }
      documentListeners.get(event).add(handler);
    },
    removeEventListener: (event, handler) => {
      if (documentListeners.has(event)) {
        documentListeners.get(event).delete(handler);
      }
    },
    dispatchEvent: (event) => {
      const type = typeof event === 'string' ? event : event.type;
      const handlers = documentListeners.get(type);
      if (handlers) {
        const evt = typeof event === 'string' ? { type: event, target: documentMock } : event;
        if (!evt.target) evt.target = documentMock;
        for (const handler of handlers) {
          handler(evt);
        }
      }
      return true;
    },
  };

  const localStorageMock = new MockLocalStorage();
  const clipboardMock = new MockClipboard();

  // Create core Lipi editor elements
  const editor = getOrCreate('editor', 'div');
  editor.setAttribute('contenteditable', 'true');

  const floatBar = getOrCreate('float-bar', 'div');
  const langSelect = getOrCreate('lang-select', 'select');
  const mic = getOrCreate('mic', 'button');
  const micLabel = getOrCreate('mic-label', 'span');
  const copyBtn = getOrCreate('copy-btn', 'button');
  const clearBtn = getOrCreate('clear-btn', 'button');
  const saveBtn = getOrCreate('save-btn', 'button');
  const toastContainer = getOrCreate('toast-container', 'div');
  const progress = getOrCreate('progress', 'div');
  const progressFill = getOrCreate('progress-fill', 'div');
  const helpOverlay = getOrCreate('help-overlay', 'div');

  const urlMock = {
    createObjectURL: (blob) => {
      const url = `blob:mock-${Math.random().toString(36).slice(2)}`;
      blobStore.set(url, blob);
      return url;
    },
    revokeObjectURL: (url) => {
      blobStore.delete(url);
    },
  };

  const windowMock = {
    document: documentMock,
    localStorage: localStorageMock,
    navigator: {
      clipboard: clipboardMock,
      mediaDevices: {
        getUserMedia: async () => new MockMediaStream(),
      },
    },
    SpeechRecognition: MockSpeechRecognition,
    webkitSpeechRecognition: MockSpeechRecognition,
    AudioContext: MockAudioContext,
    webkitAudioContext: MockAudioContext,
    Worker: MockTranslationWorker,
    confirm: () => true,
    matchMedia: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    }),
    requestAnimationFrame: (cb) => setTimeout(cb, 0),
    cancelAnimationFrame: (id) => clearTimeout(id),
    location: { hash: '#editor', pathname: '/', href: 'http://localhost/' },
    history: { replaceState: () => {}, pushState: () => {} },
    URL: urlMock,
  };

  // Bind to Node.js global
  globalThis.window = windowMock;
  globalThis.document = documentMock;
  globalThis.Worker = MockTranslationWorker;
  globalThis.matchMedia = windowMock.matchMedia;
  globalThis.requestAnimationFrame = windowMock.requestAnimationFrame;
  globalThis.cancelAnimationFrame = windowMock.cancelAnimationFrame;
  globalThis.location = windowMock.location;
  globalThis.history = windowMock.history;
  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, 'navigator', {
    value: windowMock.navigator,
    configurable: true,
    writable: true,
  });
  globalThis.confirm = windowMock.confirm;
  if (!globalThis.URL) {
    globalThis.URL = urlMock;
  } else {
    globalThis.URL.createObjectURL = urlMock.createObjectURL;
    globalThis.URL.revokeObjectURL = urlMock.revokeObjectURL;
  }

  env.editor = editor;
  env.floatBar = floatBar;
  env.langSelect = langSelect;
  env.mic = mic;
  env.micLabel = micLabel;
  env.copyBtn = copyBtn;
  env.clearBtn = clearBtn;
  env.saveBtn = saveBtn;
  env.toastContainer = toastContainer;
  env.progress = progress;
  env.progressFill = progressFill;
  env.helpOverlay = helpOverlay;
  env.localStorage = localStorageMock;
  env.clipboard = clipboardMock;

  return env;
}

/**
 * High-level Editor Controller for testing state synchronization across operations
 */
export class EditorController {
  static async create(env = setupTestEnvironment(), options = {}) {
    const languagesModule = await getLanguages();
    const translatorModule = await getTranslator();
    const controller = new EditorController(env, languagesModule, translatorModule);
    if (options.lang) {
      controller.setLanguage(options.lang);
    }
    return controller;
  }

  constructor(env, languagesModule = null, translatorModule = null) {
    this.env = env || setupTestEnvironment();
    this.languagesModule = languagesModule || _cachedLanguages;
    this.translatorModule = translatorModule || _cachedTranslator;
    this.activeLang = 'kn';
    this.isRecording = false;
    this.editor = this.env.editor;
    this.worker = new MockTranslationWorker();
    this.recognition = new MockSpeechRecognition();

    if (this.translatorModule) {
      if (typeof this.translatorModule.setTranslationWorker === 'function') {
        this.translatorModule.setTranslationWorker(this.worker);
      } else if (typeof this.translatorModule.setWorker === 'function') {
        this.translatorModule.setWorker(this.worker);
      }
    }

    const lang = this.getLanguage('kn');
    this.recognition.lang = (lang && lang.speechLocale) ? lang.speechLocale : 'kn-IN';

    // Wire recognition onresult to editor speech handling pipeline
    this.recognition.onresult = (event) => {
      let final = '';
      if (event && event.results) {
        for (let i = event.resultIndex || 0; i < event.results.length; i++) {
          const item = event.results[i];
          if (item && item.isFinal) {
            final += item[0] ? item[0].transcript : (item.transcript || '');
          }
        }
      }
      if (final) {
        this.handleSpeechResult(final, true);
      }
    };
  }

  getLanguage(id = this.activeLang) {
    if (this.languagesModule && typeof this.languagesModule.getLanguage === 'function') {
      return this.languagesModule.getLanguage(id);
    }
    if (this.languagesModule && this.languagesModule.LANGUAGES && this.languagesModule.LANGUAGES[id]) {
      return this.languagesModule.LANGUAGES[id];
    }
    const nameMap = {
      hi: 'Hindi', bn: 'Bengali', mr: 'Marathi', te: 'Telugu',
      ta: 'Tamil', gu: 'Gujarati', ur: 'Urdu', kn: 'Kannada',
      ml: 'Malayalam', pa: 'Punjabi', or: 'Odia', as: 'Assamese'
    };
    return {
      id,
      name: nameMap[id] || (id.charAt(0).toUpperCase() + id.slice(1)),
      direction: id === 'ur' ? 'rtl' : 'ltr',
      speechLocale: `${id}-IN`,
      defaultPlaceholder: '',
    };
  }

  setLanguage(langId) {
    const lang = this.getLanguage(langId);
    this.activeLang = lang.id;
    if (this.env.langSelect) {
      this.env.langSelect.value = lang.id;
      this.env.langSelect.dispatchEvent('change');
    }
    if (this.editor) {
      this.editor.dir = lang.direction;
      this.editor.setAttribute('dir', lang.direction);
      this.editor.setAttribute('placeholder', lang.defaultPlaceholder || '');
    }
    if (this.recognition) {
      this.recognition.lang = lang.speechLocale;
    }

    if (this.translatorModule && typeof this.translatorModule.preloadLanguageModel === 'function') {
      this.translatorModule.preloadLanguageModel(lang.id);
    }
  }

  setText(text) {
    this.editor.innerText = text;
    this.editor.dispatchEvent('input');
    this.saveToStorage();
  }

  getText() {
    return this.editor.innerText;
  }

  insertText(text) {
    const current = this.getText();
    this.setText(current ? `${current} ${text}` : text);
  }

  clear() {
    this.editor.innerText = '';
    this.editor.innerHTML = '';
    if (this.env.clearBtn) {
      this.env.clearBtn.click();
    }
    this.saveToStorage();
  }

  async copy() {
    const text = this.getText();
    if (this.env.copyBtn) {
      this.env.copyBtn.click();
    }
    await this.env.clipboard.writeText(text);
    this.showToast('Copied!', 'success');
    return text;
  }

  saveFile() {
    const text = this.getText();
    if (!text) return null;
    if (this.env.saveBtn) {
      this.env.saveBtn.click();
    }
    const lang = this.getLanguage(this.activeLang);
    const dateStr = new Date().toISOString().slice(0, 10);
    const langName = (lang && lang.name ? lang.name : this.activeLang).toLowerCase();
    const filename = `${langName}-${dateStr}.txt`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    return { filename, blob, content: text };
  }

  saveToStorage() {
    try {
      this.env.localStorage.setItem('lipi-editor-content', this.getText());
      this.env.localStorage.setItem('lipi-selected-lang', this.activeLang);
    } catch {}
  }

  restoreFromStorage() {
    const savedContent = this.env.localStorage.getItem('lipi-editor-content');
    const savedLang = this.env.localStorage.getItem('lipi-selected-lang');
    if (savedLang) this.setLanguage(savedLang);
    if (savedContent) this.editor.innerText = savedContent;
  }

  showToast(message, type = 'info') {
    const toast = new SimpleDOMNode('div', 'toast');
    toast.textContent = message;
    toast.classList.add(`toast--${type}`);
    if (this.env.toastContainer) {
      this.env.toastContainer.appendChild(toast);
    }
  }

  async translateContent(targetLang) {
    const current = this.getText();
    if (!current) return '';
    let translated = current;
    if (this.translatorModule && typeof this.translatorModule.translateText === 'function') {
      translated = await this.translatorModule.translateText(current, targetLang);
    }
    this.setText(translated);
    this.setLanguage(targetLang);
    return translated;
  }

  startSpeech() {
    this.isRecording = true;
    if (this.env.mic) {
      this.env.mic.classList.add('is-recording');
    }
    this.recognition.start();
  }

  stopSpeech() {
    this.isRecording = false;
    if (this.env.mic) {
      this.env.mic.classList.remove('is-recording');
    }
    this.recognition.stop();
  }

  getCustomCommands() {
    try {
      return JSON.parse(this.env.localStorage.getItem('lipi-commands') || '[]');
    } catch {
      return [];
    }
  }

  processVoiceCommands(text) {
    return processVoiceCommands(text, this.getCustomCommands());
  }

  handleSpeechResult(transcript, isFinal = false) {
    if (isFinal) {
      const processed = this.processVoiceCommands(transcript.trim());
      this.insertText(processed);
    }
  }
}
