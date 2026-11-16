/**
 * Test Suite: Languages Registry & Unicode Scripts
 * Tier 1 Feature Coverage: 12 Indic Languages Configuration & Script Validation
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getLanguages } from './fixtures/test-env.js';

describe('Tier 1: Languages Registry & Unicode Scripts', async () => {
  const { LANGUAGES, getLanguage, getAllLanguages, isValidLanguage } = await getLanguages();

  const EXPECTED_LANG_CODES = [
    'hi', 'bn', 'mr', 'te', 'ta', 'gu', 'ur', 'kn', 'ml', 'pa', 'or', 'as'
  ];

  it('T1.1.1 — Language registry contains exactly the 12 Paar-supported Indic languages', () => {
    const keys = Object.keys(LANGUAGES);
    assert.strictEqual(keys.length, 12, 'Must contain exactly 12 language definitions');
    for (const code of EXPECTED_LANG_CODES) {
      assert.ok(keys.includes(code), `Language registry missing expected code: ${code}`);
    }
  });

  it('T1.1.2 — Every language entry conforms to LanguageConfig schema', () => {
    for (const code of EXPECTED_LANG_CODES) {
      const lang = LANGUAGES[code];
      assert.strictEqual(typeof lang.id, 'string', `${code}: id must be string`);
      assert.strictEqual(typeof lang.name, 'string', `${code}: name must be string`);
      assert.strictEqual(typeof lang.nativeName, 'string', `${code}: nativeName must be string`);
      assert.strictEqual(typeof lang.script, 'string', `${code}: script must be string`);
      assert.ok(lang.unicodeRegex instanceof RegExp, `${code}: unicodeRegex must be RegExp`);
      assert.ok(['ltr', 'rtl'].includes(lang.direction), `${code}: direction must be ltr or rtl`);
      assert.strictEqual(typeof lang.speechLocale, 'string', `${code}: speechLocale must be string`);
      assert.strictEqual(typeof lang.paarModel, 'string', `${code}: paarModel must be string`);
      assert.strictEqual(typeof lang.defaultPlaceholder, 'string', `${code}: defaultPlaceholder must be string`);
    }
  });

  it('T1.1.3 — All 12 Paar model identifiers follow udgamlabs/Paar-en-<lang>', () => {
    for (const code of EXPECTED_LANG_CODES) {
      const lang = LANGUAGES[code];
      const expectedModel = `udgamlabs/Paar-en-${code}`;
      assert.strictEqual(lang.paarModel, expectedModel, `Model ID mismatch for ${code}`);
    }
  });

  it('T1.1.4 — Directionality contract: Urdu is RTL, other 11 languages are LTR', () => {
    assert.strictEqual(LANGUAGES.ur.direction, 'rtl', 'Urdu must be right-to-left (rtl)');
    for (const code of EXPECTED_LANG_CODES) {
      if (code !== 'ur') {
        assert.strictEqual(LANGUAGES[code].direction, 'ltr', `${code} must be left-to-right (ltr)`);
      }
    }
  });

  it('T1.1.5 — Speech locales match Indian regional BCP-47 codes (*-IN)', () => {
    for (const code of EXPECTED_LANG_CODES) {
      const lang = LANGUAGES[code];
      assert.match(lang.speechLocale, /^[a-z]{2}-IN$/, `${code} speech locale must be *-IN`);
      assert.strictEqual(lang.speechLocale, `${code}-IN`, `${code} speech locale mismatch`);
    }
  });

  it('T1.1.6 — getLanguage(id) retrieves correct config for valid ISO codes (case-insensitive)', () => {
    for (const code of EXPECTED_LANG_CODES) {
      const lower = getLanguage(code);
      const upper = getLanguage(code.toUpperCase());
      assert.strictEqual(lower.id, code);
      assert.strictEqual(upper.id, code);
      assert.strictEqual(lower.name, LANGUAGES[code].name);
    }
  });

  it('T1.1.7 — getLanguage(id) falls back gracefully for unknown, null, or undefined IDs', () => {
    const unknown = getLanguage('xyz');
    assert.ok(unknown, 'Must return fallback language object');
    assert.ok(EXPECTED_LANG_CODES.includes(unknown.id), 'Fallback must be a valid language code');

    const fromNull = getLanguage(null);
    assert.ok(fromNull, 'Must return fallback for null');
    assert.ok(EXPECTED_LANG_CODES.includes(fromNull.id));

    const fromEmpty = getLanguage('');
    assert.ok(fromEmpty, 'Must return fallback for empty string');
  });

  it('T1.1.8 — getAllLanguages() returns array of length 12 with all configurations', () => {
    const all = getAllLanguages();
    assert.ok(Array.isArray(all), 'Must return an array');
    assert.strictEqual(all.length, 12, 'Must contain 12 languages');
    const ids = all.map(l => l.id);
    for (const code of EXPECTED_LANG_CODES) {
      assert.ok(ids.includes(code), `getAllLanguages missing ${code}`);
    }
  });

  it('T1.1.9 — isValidLanguage(id) returns true for valid codes and false for invalid inputs', () => {
    for (const code of EXPECTED_LANG_CODES) {
      assert.strictEqual(isValidLanguage(code), true, `isValidLanguage should be true for ${code}`);
      assert.strictEqual(isValidLanguage(code.toUpperCase()), true, `isValidLanguage should be true for ${code.toUpperCase()}`);
    }
    assert.strictEqual(isValidLanguage('en'), false, 'English is not an Indic target language');
    assert.strictEqual(isValidLanguage('xyz'), false);
    assert.strictEqual(isValidLanguage(''), false);
    assert.strictEqual(isValidLanguage(null), false);
    assert.strictEqual(isValidLanguage(undefined), false);
    assert.strictEqual(isValidLanguage(123), false);
  });

  it('T1.1.10 — Hindi Devanagari script regex matches Hindi and rejects Tamil, Telugu, Urdu', () => {
    const hiRegex = LANGUAGES.hi.unicodeRegex;
    assert.ok(hiRegex.test('नमस्ते दुनिया'), 'Devanagari must match Hindi text');
    assert.strictEqual(hiRegex.test('வணக்கம்'), false, 'Devanagari must not match Tamil');
    assert.strictEqual(hiRegex.test('నమస్కారం'), false, 'Devanagari must not match Telugu');
    assert.strictEqual(hiRegex.test('ہیلو دنیا'), false, 'Devanagari must not match Urdu');
  });

  it('T1.1.11 — Bengali & Assamese script regex matches Bengali and Assamese glyphs', () => {
    const bnRegex = LANGUAGES.bn.unicodeRegex;
    const asRegex = LANGUAGES.as.unicodeRegex;
    assert.ok(bnRegex.test('নমস্কার বিশ্ব'), 'Must match Bengali text');
    assert.ok(asRegex.test('অসমীয়া ভাষা'), 'Must match Assamese text');
  });

  it('T1.1.12 — South Dravidian script regexes match Telugu, Tamil, Kannada, Malayalam', () => {
    assert.ok(LANGUAGES.te.unicodeRegex.test('నమస్కారం ప్రపంచం'), 'Telugu regex failed');
    assert.ok(LANGUAGES.ta.unicodeRegex.test('வணக்கம் உலகம்'), 'Tamil regex failed');
    assert.ok(LANGUAGES.kn.unicodeRegex.test('ನಮಸ್ಕಾರ ಪ್ರಪಂಚ'), 'Kannada regex failed');
    assert.ok(LANGUAGES.ml.unicodeRegex.test('നമസ്കാരം ലോകം'), 'Malayalam regex failed');
  });

  it('T1.1.13 — Western and Northern script regexes match Gujarati, Punjabi, Odia', () => {
    assert.ok(LANGUAGES.gu.unicodeRegex.test('નમસ્તે દુનિયા'), 'Gujarati regex failed');
    assert.ok(LANGUAGES.pa.unicodeRegex.test('ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਦੁਨੀਆਂ'), 'Punjabi regex failed');
    assert.ok(LANGUAGES.or.unicodeRegex.test('ନମସ୍କାର ଦୁନିଆ'), 'Odia regex failed');
  });

  it('T1.1.14 — Urdu Perso-Arabic regex matches Urdu Nastaliq and rejects Devanagari', () => {
    const urRegex = LANGUAGES.ur.unicodeRegex;
    assert.ok(urRegex.test('ہیلو دنیا'), 'Urdu text must match Perso-Arabic regex');
    assert.strictEqual(urRegex.test('नमस्ते'), false, 'Urdu regex must not match Devanagari');
  });

  it('T1.1.15 — Each language nativeName matches its own unicodeRegex', () => {
    for (const code of EXPECTED_LANG_CODES) {
      const lang = LANGUAGES[code];
      assert.ok(
        lang.unicodeRegex.test(lang.nativeName),
        `${code} nativeName '${lang.nativeName}' must match regex ${lang.unicodeRegex}`
      );
    }
  });

  it('T1.1.16 — Script regexes do not falsely match plain ASCII English text', () => {
    const englishSample = 'The quick brown fox jumps over the lazy dog 12345!?';
    for (const code of EXPECTED_LANG_CODES) {
      const lang = LANGUAGES[code];
      assert.strictEqual(
        lang.unicodeRegex.test(englishSample),
        false,
        `${code} regex must not match ASCII text`
      );
    }
  });

  describe('Tier 5: Adversarial Hardening — Languages & Scripts', () => {
    it('T5.1.1 — Indic script regexes match ZWJ and ZWNJ conjuncts across scripts', () => {
      assert.ok(LANGUAGES.mr.unicodeRegex.test('\u0930\u094D\u200C\u092F'), 'Marathi eyelash-Ra with ZWNJ must match Devanagari regex');
      assert.ok(LANGUAGES.ml.unicodeRegex.test('\u0D23\u0D4D\u200D'), 'Malayalam chillu with ZWJ must match Malayalam regex');
      assert.ok(LANGUAGES.bn.unicodeRegex.test('\u09A4\u09CD\u200D'), 'Bengali Khanda-Ta with ZWJ must match Bengali regex');
      assert.ok(LANGUAGES.ur.unicodeRegex.test('\u0628\u06D2\u200C\u06A9\u0627\u0631'), 'Urdu compound with ZWNJ must match Perso-Arabic regex');
    });

    it('T5.1.2 — Nuktas across Hindi, Bengali, Gurmukhi, and Odia match script regexes', () => {
      assert.ok(LANGUAGES.hi.unicodeRegex.test('क़ ख़ ग़ ज़ ड़ ढ़ फ़'), 'Hindi nuktas must match Devanagari regex');
      assert.ok(LANGUAGES.bn.unicodeRegex.test('ড় ঢ় য়'), 'Bengali nuktas must match Bengali regex');
      assert.ok(LANGUAGES.pa.unicodeRegex.test('ਖ਼ ਗ਼ ਜ਼ ਫ਼'), 'Gurmukhi nuktas must match Gurmukhi regex');
      assert.ok(LANGUAGES.or.unicodeRegex.test('ଡ଼ ଢ଼'), 'Odia nuktas must match Odia regex');
    });
  });
});
