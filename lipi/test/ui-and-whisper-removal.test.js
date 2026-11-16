/**
 * Test Suite: Whisper Removal, 12-Script Landing Hero Animation & Custom Language Picker
 * TDD validation for pure Paar + Web Speech API + Transformers.js architecture and UI polish.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setupTestEnvironment, getLanguages } from './fixtures/test-env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

describe('Whisper Removal, 12-Language Lipi Hero Animation & Custom Dropdown', async () => {
  const { LANGUAGES, getAllLanguages } = await getLanguages();

  it('U1 — Every language in LANGUAGES defines lipiWord in its native Unicode script', () => {
    const all = getAllLanguages();
    assert.strictEqual(all.length, 12);

    for (const lang of all) {
      assert.strictEqual(
        typeof lang.lipiWord,
        'string',
        `${lang.id} (${lang.name}) must define a string lipiWord`
      );
      assert.ok(lang.lipiWord.trim().length > 0, `${lang.id} lipiWord must be non-empty`);
      assert.ok(
        lang.unicodeRegex.test(lang.lipiWord),
        `${lang.id} lipiWord '${lang.lipiWord}' must match ${lang.unicodeRegex}`
      );
    }
  });

  it('U2 — Whisper is completely removed from index.html, app.js, worker.js, and llms.txt', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const appJs = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
    const workerJs = fs.readFileSync(path.join(ROOT, 'worker.js'), 'utf8');
    const llmsTxt = fs.readFileSync(path.join(ROOT, 'llms.txt'), 'utf8');

    assert.strictEqual(/whisper/i.test(html), false, 'index.html must not mention Whisper');
    assert.strictEqual(/polish-btn|model-select|upload-btn/.test(html), false, 'index.html must not render legacy Whisper controls');
    assert.ok(html.includes('Paar Models'), 'Footer must credit Paar Models');
    assert.ok(html.includes('Web Speech API'), 'Footer must credit Web Speech API');
    assert.ok(html.includes('Transformers.js'), 'Footer must credit Transformers.js');

    assert.strictEqual(/whisper|astronova001|transcribe-chunk|startPolish|doPolish/i.test(appJs), false, 'app.js must not contain Whisper ASR or Polish logic');
    assert.strictEqual(/whisper|automatic-speech-recognition|transcribeChunk/i.test(workerJs), false, 'worker.js must only run Paar translation pipelines, not Whisper ASR');
    assert.strictEqual(/whisper/i.test(llmsTxt), false, 'llms.txt must reflect the 12-language Paar Indic Voice Editor without Whisper');
  });

  it('U3 — Landing page HTML mounts animated 12-script hero title, script meta, and script strip', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

    assert.ok(html.includes('id="hero-title-word"'), 'Hero title must contain animated word target #hero-title-word');
    assert.ok(html.includes('id="hero-script-meta"'), 'Hero must contain active language/script caption #hero-script-meta');
    assert.ok(html.includes('id="hero-script-strip"'), 'Hero must contain 12-language interactive script strip #hero-script-strip');
  });

  it('U4 — Custom language picker HTML and CSS replace bare native select styling', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const css = fs.readFileSync(path.join(ROOT, 'index.css'), 'utf8');

    assert.ok(html.includes('id="lang-picker"'), 'Toolbar must include #lang-picker wrapper');
    assert.ok(html.includes('id="lang-trigger"'), 'Toolbar must include custom trigger #lang-trigger');
    assert.ok(html.includes('id="lang-menu"'), 'Toolbar must include custom popover listbox #lang-menu');
    assert.ok(html.includes('role="listbox"'), '#lang-menu must declare role="listbox"');
    assert.ok(html.includes('id="translate-btn"'), 'Toolbar must include #translate-btn for Paar translation');
    assert.ok(html.includes('id="voice-mode-btn"'), 'Toolbar must include #voice-mode-btn for EN->Indic voice translation');

    assert.ok(css.includes('.landing[hidden]'), 'index.css must hide .landing[hidden] despite display:flex');
    assert.ok(css.includes('.lang-picker'), 'index.css must style .lang-picker');
    assert.ok(css.includes('.lang-trigger'), 'index.css must style .lang-trigger');
    assert.ok(css.includes('.lang-menu'), 'index.css must style .lang-menu popover');
    assert.ok(css.includes('.lang-option'), 'index.css must style .lang-option items');
  });

  describe('Runtime Hero Cycle & Custom Dropdown State Sync', () => {
    let env;
    let appMod;

    beforeEach(async () => {
      env = setupTestEnvironment();
      appMod = await import('../app.js');
    });

    it('U5b — renderHeroStrip and populateLanguages work with getter-only Element.children (real browser DOM parity)', () => {
      const strip = document.querySelector('#hero-script-strip');
      const menu = document.querySelector('#lang-menu');

      for (const el of [strip, menu]) {
        let backing = [];
        Object.defineProperty(el, 'children', {
          get: () => backing,
          configurable: true,
        });
        el.appendChild = (child) => {
          child.parentNode = el;
          backing.push(child);
          return child;
        };
        const origInnerHTMLDescriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'innerHTML');
        Object.defineProperty(el, 'innerHTML', {
          get: () => origInnerHTMLDescriptor.get.call(el),
          set: (val) => {
            if (val === '') backing = [];
            origInnerHTMLDescriptor.set.call(el, val);
          },
          configurable: true,
        });
      }

      assert.doesNotThrow(() => appMod.renderHeroStrip());
      assert.doesNotThrow(() => appMod.populateLanguages());
      assert.strictEqual(strip.children.length, 12);
      assert.strictEqual(menu.children.length, 12);
    });

    it('U5 — stepHeroLanguage cycles across all 12 scripts and sets RTL for Urdu', () => {
      assert.strictEqual(typeof appMod.renderHeroStrip, 'function', 'app.js must export renderHeroStrip');
      assert.strictEqual(typeof appMod.setHeroLanguageIndex, 'function', 'app.js must export setHeroLanguageIndex');

      const titleWord = env.elements.get('hero-title-word') || document.querySelector('#hero-title-word');
      const meta = env.elements.get('hero-script-meta') || document.querySelector('#hero-script-meta');
      const strip = env.elements.get('hero-script-strip') || document.querySelector('#hero-script-strip');

      appMod.renderHeroStrip();
      const all = getAllLanguages();
      assert.strictEqual(strip.children.length, 12, 'Hero strip must render 12 script pills');

      const seenWords = new Set();
      all.forEach((lang, idx) => {
        appMod.setHeroLanguageIndex(idx, { animate: false });
        assert.strictEqual(titleWord.textContent, lang.lipiWord);
        assert.ok(meta.textContent.includes(lang.name), `Meta should display ${lang.name}`);
        assert.strictEqual(titleWord.getAttribute('dir'), lang.direction);
        seenWords.add(`${lang.id}:${titleWord.textContent}`);
      });

      assert.strictEqual(seenWords.size, 12, 'Must cycle through all 12 Indic languages');
    });

    it('U6 — Custom language dropdown populates 12 options and stays synced with setLanguage()', () => {
      const langMenu = document.querySelector('#lang-menu');
      const langTriggerLabel = document.querySelector('#lang-trigger-label');
      const langTriggerCode = document.querySelector('#lang-trigger-code');
      const langSelect = document.querySelector('#lang-select');

      appMod.populateLanguages();
      assert.strictEqual(langMenu.children.length, 12, 'Custom menu must contain 12 option buttons');

      appMod.setLanguage('ur', false);
      assert.strictEqual(langSelect.value, 'ur');
      assert.strictEqual(langTriggerLabel.textContent, LANGUAGES.ur.nativeName);
      assert.strictEqual(langTriggerCode.textContent, 'UR');

      const urOption = langMenu.children.find(c => c.dataset.lang === 'ur');
      const knOption = langMenu.children.find(c => c.dataset.lang === 'kn');
      assert.ok(urOption, 'Urdu option must exist in custom menu');
      assert.strictEqual(urOption.getAttribute('aria-selected'), 'true');
      assert.strictEqual(urOption.classList.contains('is-selected'), true);
      assert.strictEqual(knOption.getAttribute('aria-selected'), 'false');
    });
  });
});
