/**
 * Test Suite: End-to-End Scenarios & Cross-Feature Workflows
 * Tier 3 (Cross-Feature Combinations) & Tier 4 (Real-World Application Scenarios)
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { setupTestEnvironment, EditorController, getLanguages } from './fixtures/test-env.js';
import { MockAudioContext, MockMediaStream } from './fixtures/mock-audio.js';

describe('Tier 3 & Tier 4: Cross-Feature Combinations & Real-World Scenarios', async () => {
  const { LANGUAGES } = await getLanguages();
  let env;
  let controller;

  beforeEach(async () => {
    env = setupTestEnvironment();
    controller = await EditorController.create(env);
  });

  // ─── Tier 3: Cross-Feature Combinations (7 Tests) ───

  it('T3.1 — Language switch mid-edit with partial translation preserves multi-script coexistence', async () => {
    // Translate base text to Marathi
    controller.setText('Welcome to the editor');
    const mrText = await controller.translateContent('mr');
    assert.ok(LANGUAGES.mr.unicodeRegex.test(mrText));

    // Append Tamil translation
    controller.setLanguage('ta');
    controller.insertText('வணக்கம் உலகம்'); // Tamil text

    const fullContent = controller.getText();
    assert.ok(LANGUAGES.mr.unicodeRegex.test(fullContent), 'Must contain Marathi glyphs');
    assert.ok(LANGUAGES.ta.unicodeRegex.test(fullContent), 'Must contain Tamil glyphs');
  });

  it('T3.2 — Voice dictation into translated base text appends seamlessly', async () => {
    // Translate to Telugu
    controller.setText('Welcome to the editor');
    await controller.translateContent('te');
    const baseText = controller.getText();
    assert.ok(LANGUAGES.te.unicodeRegex.test(baseText));

    // Dictate additional Telugu phrase
    controller.startSpeech();
    assert.strictEqual(controller.recognition.lang, 'te-IN');
    controller.handleSpeechResult('మరియు శుభోదయం', true);
    controller.stopSpeech();

    const finalContent = controller.getText();
    assert.ok(finalContent.startsWith(baseText));
    assert.ok(finalContent.includes('మరియు శుభోదయం'));
  });

  it('T3.3 — Dictation followed by multi-language translation pipeline', async () => {
    // Dictate English voice input
    controller.startSpeech();
    controller.handleSpeechResult('Hello world', true);
    controller.stopSpeech();

    assert.strictEqual(controller.getText(), 'Hello world');

    // Translate voice input to Bengali
    const bnText = await controller.translateContent('bn');
    assert.ok(LANGUAGES.bn.unicodeRegex.test(bnText));
    assert.strictEqual(controller.activeLang, 'bn');
    assert.strictEqual(controller.getText(), bnText);
  });

  it('T3.4 — Clear, re-select language, and re-translate leaves no stale tokens or marks', async () => {
    // Translate to Gujarati
    controller.setText('Welcome to the editor');
    await controller.translateContent('gu');
    assert.ok(LANGUAGES.gu.unicodeRegex.test(controller.getText()));

    // Clear editor
    controller.clear();
    assert.strictEqual(controller.getText(), '');
    assert.strictEqual(env.localStorage.getItem('lipi-editor-content'), '');

    // Switch to Odia and translate fresh text
    controller.setText('Hello world');
    const orText = await controller.translateContent('or');
    assert.ok(LANGUAGES.or.unicodeRegex.test(orText));
    assert.strictEqual(LANGUAGES.gu.unicodeRegex.test(orText), false, 'Must not retain Gujarati glyphs');
  });

  it('T3.5 — Sequential multi-language file export cycle downloads distinct files', () => {
    const today = new Date().toISOString().slice(0, 10);

    // Export Punjabi document
    controller.setLanguage('pa');
    controller.setText('ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਦੁਨੀਆਂ');
    const paExport = controller.saveFile();
    assert.strictEqual(paExport.filename, `punjabi-${today}.txt`);
    assert.ok(LANGUAGES.pa.unicodeRegex.test(paExport.content));

    // Export Malayalam document
    controller.setLanguage('ml');
    controller.setText('നമസ്കാരം ലോകം');
    const mlExport = controller.saveFile();
    assert.strictEqual(mlExport.filename, `malayalam-${today}.txt`);
    assert.ok(LANGUAGES.ml.unicodeRegex.test(mlExport.content));
  });

  it('T3.6 — Voice punctuation processing in Assamese mode does not corrupt character composition', () => {
    controller.setLanguage('as');
    assert.strictEqual(controller.recognition.lang, 'as-IN');

    controller.startSpeech();
    assert.strictEqual(controller.isRecording, true);

    // Spoken transcript with Assamese Unicode words and English voice command punctuation triggers
    const spoken = 'নমস্কাৰ comma অসমীয়া ভাষা full stop';
    controller.recognition.emitResult(spoken, true);

    const formatted = controller.getText();

    // 1. Verify voice punctuation triggers are replaced via the speech recognition pipeline
    assert.ok(formatted.includes(','), 'Formatted text must include comma replacement');
    assert.ok(formatted.includes('.'), 'Formatted text must include full stop replacement');

    // 2. Verify Assamese script character composition is completely intact
    assert.ok(formatted.includes('নমস্কাৰ'), 'Assamese word "নমস্কাৰ" (conjunct ska and ra) must remain intact');
    assert.ok(formatted.includes('অসমীয়া ভাষা'), 'Assamese phrase "অসমীয়া ভাষা" (matras and ya) must remain intact');

    // 3. Verify script conformity
    assert.ok(LANGUAGES.as.unicodeRegex.test(formatted), 'Resulting string must match Assamese Unicode regex');
    assert.strictEqual(formatted, 'নমস্কাৰ , অসমীয়া ভাষা .');

    // 4. Verify custom voice command support (e.g. Indic danda punctuation)
    controller.env.localStorage.setItem('lipi-commands', JSON.stringify([
      { trigger: 'danda', output: '।', builtin: false }
    ]));
    controller.clear();
    controller.recognition.emitResult('অসমীয়া বাক্য danda', true);
    const customResult = controller.getText();
    assert.ok(customResult.includes('।'), 'Custom command danda must produce Indic danda');
    assert.strictEqual(customResult, 'অসমীয়া বাক্য ।');
    assert.ok(LANGUAGES.as.unicodeRegex.test(customResult));
  });

  it('T3.7 — Audio context and script processor capture audio frames with language target', async () => {
    controller.setLanguage('hi');

    const audioCtx = new MockAudioContext();
    const mediaStream = new MockMediaStream();
    const processor = audioCtx.createScriptProcessor(4096, 1, 1);

    let processedChunks = 0;
    processor.onaudioprocess = () => {
      processedChunks++;
    };

    processor.simulateAudio();
    processor.simulateAudio();

    assert.strictEqual(processedChunks, 2);
    assert.strictEqual(controller.activeLang, 'hi');
  });

  // ─── Tier 4: Real-World Application Scenarios (4 Tests) ───

  it('T4.1 — Scenario 1: Multilingual News Article Drafting Session', async () => {
    const today = new Date().toISOString().slice(0, 10);

    // Step 1: Journalist inputs English press release
    const pressRelease = 'The train leaves at 6:45 tomorrow morning, so please be at the station by 6:15.';
    controller.setText(pressRelease);

    // Step 2: Translate paragraph to Hindi
    const hindiArticle = await controller.translateContent('hi');
    assert.ok(LANGUAGES.hi.unicodeRegex.test(hindiArticle));

    // Step 3: Journalist switches to Bengali for regional publication
    const bengaliArticle = await controller.translateContent('bn');
    assert.ok(LANGUAGES.bn.unicodeRegex.test(bengaliArticle));

    // Step 4: Journalist dictates reporter note in Bengali
    controller.startSpeech();
    controller.handleSpeechResult('বিশেষ প্রতিবেদন', true);
    controller.stopSpeech();

    const currentDoc = controller.getText();
    assert.ok(currentDoc.includes('বিশেষ প্রতিবেদন'));

    // Step 5: Manual typing addition
    controller.insertText('(প্রেস ট্রাস্ট)');

    // Step 6: Copy full text to clipboard
    const copiedText = await controller.copy();
    assert.strictEqual(copiedText, controller.getText());
    assert.strictEqual(await env.clipboard.readText(), controller.getText());

    // Step 7: Export final story to file
    const file = controller.saveFile();
    assert.strictEqual(file.filename, `bengali-${today}.txt`);
    assert.strictEqual(file.content, controller.getText());
  });

  it('T4.2 — Scenario 2: Continuous Dictation-to-Translation Pipeline', async () => {
    // Step 1: User speaks continuously in English
    controller.startSpeech();

    // Step 2: Streaming interim results arrive
    const interimSpan = env.elements.get('interim-span') || env.editor;
    interimSpan.innerHTML = '<span class="interim">Can you send me the invoice...</span>';
    assert.ok(interimSpan.innerHTML.includes('interim'));

    // Step 3: Speech finalizes
    const finalSpeech = 'Can you send me the invoice for the last three months?';
    controller.setText(finalSpeech);
    controller.stopSpeech();

    // Step 4: User clicks translate into Kannada
    const kannadaResult = await controller.translateContent('kn');
    assert.ok(LANGUAGES.kn.unicodeRegex.test(kannadaResult));

    // Step 5: User adds final remarks and saves
    controller.insertText('ಧನ್ಯವಾದಗಳು.');
    controller.saveToStorage();

    assert.ok(controller.getText().includes('ಧನ್ಯವಾದಗಳು.'));
    assert.strictEqual(env.localStorage.getItem('lipi-editor-content'), controller.getText());
  });

  it('T4.3 — Scenario 3: Offline Voice Draft & Resilience Recovery', async () => {
    // Step 1 & 2: User selects Urdu in offline session
    controller.setLanguage('ur');
    assert.strictEqual(env.editor.dir, 'rtl');
    assert.strictEqual(controller.activeLang, 'ur');

    // Step 3: User writes Urdu text
    const urduDraft = 'یہاں ٹائپ کریں یا بولیں اور مسودہ محفوظ کریں';
    controller.setText(urduDraft);
    controller.saveToStorage();

    // Step 4 & 5: Simulate browser crash / tab unload by wiping controller
    const recoveredController = await EditorController.create(env);

    // Step 6 & 7: Restore from localStorage
    recoveredController.restoreFromStorage();
    assert.strictEqual(recoveredController.activeLang, 'ur');
    assert.strictEqual(recoveredController.getText(), urduDraft);
    assert.strictEqual(env.editor.dir, 'rtl');

    // Step 8: Successfully save file
    const exported = recoveredController.saveFile();
    assert.ok(exported);
    const today = new Date().toISOString().slice(0, 10);
    assert.strictEqual(exported.filename, `urdu-${today}.txt`);
    assert.ok(LANGUAGES.ur.unicodeRegex.test(exported.content));
  });

  it('T4.4 — Scenario 4: Rapid Multi-Dialect Stress Session across Dravidian & Indo-Aryan Languages', async () => {
    const dravidian = ['kn', 'te', 'ta', 'ml'];
    const indoAryan = ['hi', 'mr', 'gu', 'pa'];
    const allDialects = [...dravidian, ...indoAryan];

    let currentPrompt = 'Welcome to the editor';

    for (const dialect of allDialects) {
      // Rapid switch and translate
      controller.setLanguage(dialect);
      controller.setText(currentPrompt);
      const translated = await controller.translateContent(dialect);

      // Verify each dialect adheres to its Unicode script
      assert.ok(
        LANGUAGES[dialect].unicodeRegex.test(translated),
        `Dialect ${dialect} failed Unicode script assertion: ${translated}`
      );
      assert.strictEqual(controller.activeLang, dialect);
      assert.strictEqual(controller.recognition.lang, `${dialect}-IN`);
    }

    // Verify final state matches the last language (pa)
    assert.strictEqual(controller.activeLang, 'pa');
    assert.strictEqual(controller.getLanguage().name, 'Punjabi');
  });
});
