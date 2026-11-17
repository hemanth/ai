/**
 * Test Suite: Swanada In-Browser Neural STT Integration
 * Validates capability-routed Mobile (25.4 MiB) / Studio (177.4 MiB) Conformer-CTC routing,
 * live partial -> final editor streaming, EN -> Indic Paar voice translation pipeline,
 * and graceful fallback for Urdu/Assamese native dictation.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { setupTestEnvironment, getLanguages } from './fixtures/test-env.js';
import { MockTranslationWorker } from './fixtures/mock-worker.js';

describe('Swanada In-Browser Neural STT + Paar Integration', async () => {
  const { LANGUAGES } = await getLanguages();

  it('S1 — Languages registry marks 10 Swanada-native Indic languages and 2 fallback languages (ur, as)', () => {
    const swanadaNative = ['hi', 'bn', 'mr', 'te', 'ta', 'gu', 'kn', 'ml', 'pa', 'or'];
    const fallbackOnly = ['ur', 'as'];

    for (const code of swanadaNative) {
      assert.strictEqual(
        LANGUAGES[code].swanadaSupported,
        true,
        `${code} must have swanadaSupported: true`
      );
    }
    for (const code of fallbackOnly) {
      assert.strictEqual(
        LANGUAGES[code].swanadaSupported,
        false,
        `${code} must have swanadaSupported: false`
      );
    }
  });

  it('S2 — stt-client capability-routes mobile (25.4 MiB) vs studio (177.4 MiB) tier and builds exact asset URLs', async () => {
    const sttMod = await import('../stt-client.js');

    assert.strictEqual(
      sttMod.detectSwanadaTier({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6)', deviceMemory: 8 }),
      'mobile'
    );
    assert.strictEqual(
      sttMod.detectSwanadaTier({ userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 10 Pro XL) Mobile', deviceMemory: 4 }),
      'mobile'
    );
    assert.strictEqual(
      sttMod.detectSwanadaTier({ userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 10 Pro XL) Mobile', deviceMemory: 8 }),
      'studio'
    );
    assert.strictEqual(
      sttMod.detectSwanadaTier({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', deviceMemory: 2 }),
      'mobile'
    );
    assert.strictEqual(
      sttMod.detectSwanadaTier({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', deviceMemory: 8 }),
      'studio'
    );

    const mobileUrls = sttMod.buildSwanadaModelConfig('kn', 'mobile', '/ai/swanada');
    assert.ok(mobileUrls.modelUrl.includes('onnx_mobile/swanada_mobile_ctc_int8.onnx'));
    assert.strictEqual(mobileUrls.headUrl, '/ai/swanada/heads_mobile/kn.bin?v=1.9.2');
    assert.strictEqual(mobileUrls.vocabUrl, '/ai/swanada/vocabularies/kn_vocab.json?v=1.9.2');
    assert.strictEqual(mobileUrls.codeSwitchEn, false);

    const studioUrls = sttMod.buildSwanadaModelConfig('hi', 'studio', '/ai/swanada');
    assert.ok(studioUrls.modelUrl.includes('onnx/sushrota_sanskrit_ctc_int8.onnx'));
    assert.strictEqual(studioUrls.headUrl, '/ai/swanada/heads/hi.bin?v=1.9.2');
    assert.strictEqual(studioUrls.vocabUrl, '/ai/swanada/vocabularies/hi_vocab.json?v=1.9.2');
    assert.strictEqual(studioUrls.codeSwitchEn, false);
  });

  it('S3 — resolveSttTarget routes native Indic heads for 10 languages and Swanada EN for all 12 in Translate mode', async () => {
    const sttMod = await import('../stt-client.js');

    // Direct Indic STT mode
    assert.deepStrictEqual(sttMod.resolveSttTarget('kn', false), { engine: 'swanada', acousticLang: 'kn' });
    assert.deepStrictEqual(sttMod.resolveSttTarget('ta', false), { engine: 'swanada', acousticLang: 'ta' });
    assert.deepStrictEqual(sttMod.resolveSttTarget('ur', false), { engine: 'webspeech', acousticLang: 'ur-IN' });
    assert.deepStrictEqual(sttMod.resolveSttTarget('as', false), { engine: 'webspeech', acousticLang: 'as-IN' });

    // EN -> Indic Translate mode: ALL 12 languages use 100% on-device Swanada EN -> Paar!
    for (const code of Object.keys(LANGUAGES)) {
      assert.deepStrictEqual(
        sttMod.resolveSttTarget(code, true),
        { engine: 'swanada', acousticLang: 'en' },
        `EN -> ${code} mode must use Swanada 'en' head`
      );
    }
  });

  describe('Live Editor Streaming via Swanada Backend', () => {
    let env;
    let appMod;
    let translatorMod;
    let mockPaarWorker;
    let mockSttListeners;
    let mockSttCalls;

    beforeEach(async () => {
      env = setupTestEnvironment();
      translatorMod = await import('../translator.js');
      mockPaarWorker = new MockTranslationWorker();
      translatorMod.setWorker(mockPaarWorker);

      appMod = await import('../app.js');
      mockSttListeners = {};
      mockSttCalls = [];

      // Inject deterministic Swanada STT backend double
      appMod.setSttController({
        async start(lang, opts) {
          mockSttCalls.push({ op: 'start', lang, opts });
          mockSttListeners.onStatus?.({ stage: 'ready', language: lang, tier: 'mobile' });
        },
        async stop() {
          mockSttCalls.push({ op: 'stop' });
        },
        on(evt, fn) {
          mockSttListeners[evt] = fn;
        },
        emit(evt, payload) {
          mockSttListeners[evt]?.(payload);
        },
      });
    });

    it('S4 — Indic STT mode streams Swanada partial transcripts and commits punctuated final text', async () => {
      appMod.setEditorMode('stt', false);
      appMod.setLanguage('kn', false);
      const ed = document.querySelector('#editor');
      ed.innerHTML = '';
      ed.innerText = '';

      await appMod.startRecordingSession();
      assert.strictEqual(mockSttCalls[0].lang, 'kn');

      // Emit partial CTC decode
      mockSttListeners.partial?.({ text: 'ನಮಸ್ಕಾರ ಬೆಂಗಳೂರು' });
      assert.ok(ed.innerHTML.includes('ನಮಸ್ಕಾರ ಬೆಂಗಳೂರು'), 'Interim span must display live Swanada partial');

      // Emit final CTC decode with voice command punctuation
      mockSttListeners.final?.({ text: 'ನಮಸ್ಕಾರ ಬೆಂಗಳೂರು full stop', rtf: 0.012 });
      await appMod.stopRecordingSession();

      assert.strictEqual(appMod.edText(), 'ನಮಸ್ಕಾರ ಬೆಂಗಳೂರು .');
    });

    it('S5 — EN -> Indic mode uses Swanada EN head and translates final utterance via Paar (including Urdu RTL)', async () => {
      appMod.setLanguage('ur', false);
      appMod.setEditorMode('translate', false);
      const ed = document.querySelector('#editor');
      ed.innerHTML = '';
      ed.innerText = '';

      await appMod.startRecordingSession();
      assert.strictEqual(mockSttCalls[0].lang, 'en', 'Urdu translate mode must record with Swanada EN acoustic head');

      mockSttListeners.final?.({ text: 'Hello world', rtf: 0.009 });
      await new Promise(r => setTimeout(r, 25));
      await appMod.stopRecordingSession();

      const finalUrdu = appMod.edText();
      assert.ok(LANGUAGES.ur.unicodeRegex.test(finalUrdu), `Expected Urdu script output, got: ${finalUrdu}`);
      assert.strictEqual(ed.getAttribute('dir'), 'rtl');
    });
  });
});
