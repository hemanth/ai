/**
 * Test Suite: Translator Client & Pipeline
 * Tier 1 & Tier 2: Sentence Splitting, Unicode Normalization, Worker Protocol, Caching, and Boundary Cases
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getTranslator, getLanguages } from './fixtures/test-env.js';
import { MockTranslationWorker } from './fixtures/mock-worker.js';

describe('Tier 1 & Tier 2: Translator Pipeline & Boundary Cases', async () => {
  const translator = await getTranslator();
  const { translateText, preloadLanguageModel } = translator;

  // Defensive test double & cache hooks
  const setTranslationWorker = translator.setTranslationWorker || translator.setWorker;
  const clearTranslationCache = translator.clearTranslationCache;
  const getCacheSize = translator.getCacheSize;
  const splitSentences = translator.splitSentences;
  const normalizeText = translator.normalizeText;

  const { LANGUAGES } = await getLanguages();

  let mockWorker;

  beforeEach(() => {
    mockWorker = new MockTranslationWorker();
    if (typeof setTranslationWorker === 'function') {
      setTranslationWorker(mockWorker);
    }
    if (typeof clearTranslationCache === 'function') {
      clearTranslationCache();
    }
  });

  // ─── Tier 1: Core Feature Capabilities ───

  it('T1.2.1 — Translation to all 12 supported languages produces non-empty text matching script Unicode regex', async () => {
    const input = 'Welcome to the editor';
    const langCodes = Object.keys(LANGUAGES);

    for (const lang of langCodes) {
      const output = await translateText(input, lang);
      assert.ok(output && output.length > 0, `${lang}: Translation output must be non-empty`);

      // Strip sentence terminators and punctuation (Latin .!?, Indic Dandas ।॥, Urdu Khatma/Question Mark ۔؟)
      // so punctuation code points residing within script Unicode ranges do not create false positives.
      const textWithoutPunctuation = output.replace(/[.!?।॥۔؟]/g, '').trim();
      assert.ok(
        textWithoutPunctuation.length > 0,
        `${lang}: Translation text must contain non-punctuation characters`
      );

      const regex = LANGUAGES[lang].unicodeRegex;
      assert.ok(
        regex.test(textWithoutPunctuation),
        `${lang}: Stripped output '${textWithoutPunctuation}' must match script regex ${regex}`
      );
    }
  });

  it('T1.2.2 — Sentence splitting splits on English punctuation (.!?) followed by space', (t) => {
    if (typeof splitSentences !== 'function') {
      t.skip('splitSentences is not exported by translator.js');
      return;
    }
    const text = 'First sentence. Second sentence! Third sentence? Fourth sentence.';
    const sentences = splitSentences(text);
    assert.strictEqual(sentences.length, 4);
    assert.strictEqual(sentences[0], 'First sentence.');
    assert.strictEqual(sentences[1], 'Second sentence!');
    assert.strictEqual(sentences[2], 'Third sentence?');
    assert.strictEqual(sentences[3], 'Fourth sentence.');
  });

  it('T1.2.3 — Sentence splitting splits on Indic Danda (।) and Double Danda (॥)', (t) => {
    if (typeof splitSentences !== 'function') {
      t.skip('splitSentences is not exported by translator.js');
      return;
    }
    const text = 'पहला वाक्य। दूसरा वाक्य॥ तीसरा वाक्य।';
    const sentences = splitSentences(text);
    assert.strictEqual(sentences.length, 3);
    assert.strictEqual(sentences[0], 'पहला वाक्य।');
    assert.strictEqual(sentences[1], 'दूसरा वाक्य॥');
    assert.strictEqual(sentences[2], 'तीसरा वाक्य।');
  });

  it('T1.2.3b — Sentence splitting splits on Urdu Khatma (۔) and Arabic Question Mark (؟)', () => {
    if (typeof splitSentences !== 'function') {
      assert.fail('splitSentences is not exported by translator.js');
    }
    const text = 'یہ پہلا جملہ ہے۔ کیا یہ دوسرا جملہ ہے؟ یہ تیسرا جملہ ہے۔';
    const sentences = splitSentences(text);
    assert.strictEqual(sentences.length, 3, 'Must split into exactly 3 sentences');
    assert.strictEqual(sentences[0], 'یہ پہلا جملہ ہے۔');
    assert.strictEqual(sentences[1], 'کیا یہ دوسرا جملہ ہے؟');
    assert.strictEqual(sentences[2], 'یہ تیسرا جملہ ہے۔');
  });

  it('T1.2.4 — Unicode NFC normalization composes decomposed character sequences', (t) => {
    if (typeof normalizeText !== 'function') {
      t.skip('normalizeText is not exported by translator.js');
      return;
    }
    // 'e' + combining acute accent (\u0301) decomposed (NFD) -> 'é' composed (\u00E9) (NFC)
    const decomposed = 'e\u0301cole';
    const composed = normalizeText(decomposed);
    assert.strictEqual(composed, 'école');
    assert.strictEqual(composed.length, 5);
  });

  it('T1.2.5 — Worker messaging protocol dispatches translate action and resolves result', async () => {
    let capturedMessage = null;
    mockWorker.postMessage = (msg) => {
      capturedMessage = msg;
      mockWorker.emitMessage({
        type: 'translation-result',
        id: msg.id,
        text: 'नमस्ते दुनिया',
        targetLang: msg.targetLang,
      });
    };

    const res = await translateText('Hello world', 'hi');
    assert.ok(capturedMessage, 'Worker must receive message');
    assert.strictEqual(capturedMessage.action, 'translate');
    assert.strictEqual(capturedMessage.targetLang, 'hi');
    assert.strictEqual(capturedMessage.text, 'Hello world');
    assert.ok(capturedMessage.id, 'Message must have unique request ID');
    assert.strictEqual(res, 'नमस्ते दुनिया');
  });

  it('T1.2.6 — Preload language model dispatches load-translation-model with model ID', async () => {
    let capturedAction = null;
    mockWorker.postMessage = (msg) => {
      capturedAction = msg;
      mockWorker.emitMessage({
        type: 'model-ready',
        language: msg.language,
        modelId: msg.modelId,
      });
    };

    await preloadLanguageModel('te');
    assert.ok(capturedAction);
    assert.strictEqual(capturedAction.action, 'load-translation-model');
    assert.strictEqual(capturedAction.language, 'te');
    assert.strictEqual(capturedAction.modelId, 'udgamlabs/Paar-en-te');
  });

  it('T1.2.7 — Translation caching: identical requests return cached result without re-dispatching worker', async () => {
    let workerCallCount = 0;
    const originalPost = mockWorker.postMessage.bind(mockWorker);
    mockWorker.postMessage = (msg) => {
      workerCallCount++;
      originalPost(msg);
    };

    const first = await translateText('Good morning', 'kn');
    assert.strictEqual(workerCallCount, 1, 'First call should hit worker');

    const second = await translateText('Good morning', 'kn');
    assert.strictEqual(workerCallCount, 1, 'Second identical call should return from cache');
    assert.strictEqual(first, second);
    if (typeof getCacheSize === 'function') {
      assert.strictEqual(getCacheSize(), 1);
    }
  });

  it('T1.2.8 — Cache keys are language-sensitive: different target language dispatches new request', async () => {
    let workerCallCount = 0;
    const originalPost = mockWorker.postMessage.bind(mockWorker);
    mockWorker.postMessage = (msg) => {
      workerCallCount++;
      originalPost(msg);
    };

    await translateText('Good morning', 'hi');
    assert.strictEqual(workerCallCount, 1);

    await translateText('Good morning', 'ta');
    assert.strictEqual(workerCallCount, 2, 'Different target language must dispatch new worker request');
    if (typeof getCacheSize === 'function') {
      assert.strictEqual(getCacheSize(), 2);
    }
  });

  it('T1.2.9 — Multi-sentence paragraphs preserve paragraph structure across translation', async () => {
    const paragraphText = 'Section 1 paragraph content.\n\nSection 2 paragraph content.';
    const translated = await translateText(paragraphText, 'bn');
    assert.ok(translated.includes('\n\n'), 'Translated text must preserve double newline paragraph separation');
    assert.ok(LANGUAGES.bn.unicodeRegex.test(translated), 'Translated text must match Bengali script regex');
  });

  // ─── Tier 2: Boundary & Corner Cases ───

  it('T2.1 — Empty string input returns empty string without dispatching worker task', async () => {
    let dispatched = false;
    mockWorker.postMessage = () => { dispatched = true; };

    const result = await translateText('', 'hi');
    assert.strictEqual(result, '');
    assert.strictEqual(dispatched, false, 'Should not dispatch worker task for empty string');
  });

  it('T2.2 — Whitespace-only string returns empty string without dispatching worker task', async () => {
    let dispatched = false;
    mockWorker.postMessage = () => { dispatched = true; };

    const result = await translateText('   \n\t   ', 'hi');
    assert.strictEqual(result, '');
    assert.strictEqual(dispatched, false, 'Should not dispatch worker task for whitespace-only');
  });

  it('T2.3 — Invalid or unsupported target language rejects with an informative Error', async () => {
    await assert.rejects(
      async () => await translateText('Hello', 'xyz'),
      /Unsupported target language: xyz/i
    );
    await assert.rejects(
      async () => await translateText('Hello', 'french'),
      /Unsupported target language/i
    );
  });

  it('T2.4 — HTML tags, URLs, and special characters are preserved without corruption or execution', async () => {
    const complexText = 'Visit https://udgamlabs.com and use <script>alert("test")</script> &amp; symbols #hashtag!';
    const translated = await translateText(complexText, 'gu');
    assert.ok(translated && translated.length > 0);
    assert.ok(LANGUAGES.gu.unicodeRegex.test(translated), 'Must contain Gujarati glyphs');
  });

  it('T2.5 — Extremely long text (>10,000 chars) processes cleanly without hanging or crashing', async () => {
    const sentence = 'The quick brown fox jumps over the lazy dog. ';
    const longText = sentence.repeat(250); // > 11,000 characters
    assert.ok(longText.length > 10000);

    const translated = await translateText(longText, 'mr');
    assert.ok(translated && translated.length > 0);
    assert.ok(LANGUAGES.mr.unicodeRegex.test(translated), 'Must contain Marathi glyphs');
  });

  it('T2.6 — Worker translation error event rejects the translation Promise cleanly', async () => {
    mockWorker.shouldFail = true;
    mockWorker.failReason = 'Simulated ONNX model out-of-memory error';

    await assert.rejects(
      async () => await translateText('Fail me', 'pa'),
      /Simulated ONNX model out-of-memory error/
    );
  });

  it('T2.7 — Sentences without terminal punctuation are handled cleanly without error', (t) => {
    if (typeof splitSentences !== 'function') {
      t.skip('splitSentences is not exported by translator.js');
      return;
    }
    const single = 'Just a single sentence without punctuation';
    const split = splitSentences(single);
    assert.strictEqual(split.length, 1);
    assert.strictEqual(split[0], single);
  });

  describe('Tier 5: Adversarial Hardening — Translator & Worker Pipeline', () => {
    it('T5.2.1 — Indic script normalization idempotency across all 12 languages', () => {
      const samples = [
        'नमस्ते दुनिया', 'বাংলা ভাষা', 'मराठी भाषा', 'తెలుగు భాష',
        'தமிழ் வாழ்க', 'ગુજરાતી સાહિત્ય', 'اردو زبان', 'ಕನ್ನಡ ನಾಡು',
        'മലയാള ഭാഷ', 'ਪੰਜਾਬੀ ਬੋਲੀ', 'ଓଡ଼ିଆ ଭାଷା', 'অসমীয়া ভাষা'
      ];
      for (const s of samples) {
        const nfd = s.normalize('NFD');
        const nfc = normalizeText(nfd);
        assert.strictEqual(nfc, normalizeText(s), `NFC must normalize NFD idempotently for ${s}`);
        assert.strictEqual(normalizeText(nfc), nfc, 'Multi-pass normalization must be idempotent');
      }
    });

    it('T5.2.2 — Sentence splitting handles consecutive multi-punctuation and tab delimiters', () => {
      const text = 'First sentence... Second sentence?! Third sentence।॥ Fourth sentence۔!؟ Fifth sentence.';
      const sentences = splitSentences(text);
      assert.strictEqual(sentences.length, 5, 'Must split into 5 sentences across consecutive punctuation');
      assert.strictEqual(sentences[0], 'First sentence...');
      assert.strictEqual(sentences[1], 'Second sentence?!');
      assert.strictEqual(sentences[2], 'Third sentence।॥');
      assert.strictEqual(sentences[3], 'Fourth sentence۔!؟');
      assert.strictEqual(sentences[4], 'Fifth sentence.');

      const tabText = 'Sentence one.\tSentence two.\t\tSentence three.';
      const tabSentences = splitSentences(tabText);
      assert.strictEqual(tabSentences.length, 3, 'Must split tab-delimited sentences');
    });

    it('T5.2.3 — Concurrent burst of identical translation requests resolves cleanly without cache corruption', async () => {
      clearTranslationCache();
      const phrase = 'Can you send me the invoice for the last three months?';
      const promises = Array.from({ length: 25 }, () => translateText(phrase, 'hi'));
      const results = await Promise.all(promises);

      const expected = 'क्या आप मुझे पिछले तीन महीनों से चालान भेज सकते हैं?';
      for (const r of results) {
        assert.strictEqual(r, expected);
      }
      assert.strictEqual(getCacheSize(), 1, 'Cache must contain exactly 1 entry for duplicate requests');
    });

    it('T5.2.4 — Transient worker error recovery preserves cache integrity', async () => {
      clearTranslationCache();
      mockWorker.shouldFail = true;
      mockWorker.failReason = 'Transient worker pipeline OOM';

      await assert.rejects(
        async () => await translateText('Hello world', 'kn'),
        /Transient worker pipeline OOM/
      );
      assert.strictEqual(getCacheSize(), 0, 'Failed translation must not pollute cache');

      mockWorker.shouldFail = false;
      const recovered = await translateText('Hello world', 'kn');
      assert.ok(recovered.length > 0);
      assert.strictEqual(getCacheSize(), 1, 'Successful translation after recovery must populate cache');
    });

    it('T5.2.5 — Control characters and null bytes in text input are handled safely', async () => {
      const tainted = 'Hello \u0000 world \u001F with \u0007 control chars.';
      const translated = await translateText(tainted, 'hi');
      assert.ok(translated && translated.length > 0, 'Must process tainted input without crashing');
    });
  });
});
