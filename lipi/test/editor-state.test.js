/**
 * Test Suite: Editor State & Operations
 * Tier 1 & Tier 2: Editor Operations (Text, Copy, Clear, Save), BiDi/RTL, Speech Locale, and Persistence
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { setupTestEnvironment, EditorController, getLanguages } from './fixtures/test-env.js';

describe('Tier 1 & Tier 2: Editor State, Operations & BiDi', async () => {
  const { LANGUAGES } = await getLanguages();
  let env;
  let controller;

  beforeEach(async () => {
    env = setupTestEnvironment();
    controller = await EditorController.create(env);
  });

  // ─── Tier 1: Core Operations Across Indic Languages ───

  it('T1.4.1 — Direct Indic text insertion and retrieval across multiple scripts in editor', () => {
    controller.setText('नमस्ते दुनिया'); // Hindi
    assert.strictEqual(controller.getText(), 'नमस्ते दुनिया');

    controller.insertText('வணக்கம்'); // Tamil
    assert.strictEqual(controller.getText(), 'नमस्ते दुनिया வணக்கம்');

    controller.insertText('హలో'); // Telugu
    assert.strictEqual(controller.getText(), 'नमस्ते दुनिया வணக்கம் హలో');
  });

  it('T1.4.2 — Clipboard copy writes editor content to navigator.clipboard and displays toast', async () => {
    controller.setText('ನಮಸ್ಕಾರ ಪ್ರಪಂಚ');
    const copied = await controller.copy();

    assert.strictEqual(copied, 'ನಮಸ್ಕಾರ ಪ್ರಪಂಚ');
    assert.strictEqual(await env.clipboard.readText(), 'ನಮಸ್ಕಾರ ಪ್ರಪಂಚ');
    const toasts = env.toastContainer.children;
    assert.ok(toasts.length > 0, 'Toast container must have toast element');
    assert.strictEqual(toasts[toasts.length - 1].textContent, 'Copied!');
  });

  it('T1.4.3 — Editor clear empties editor content and updates storage', () => {
    controller.setText('Some Indic text to be cleared');
    assert.ok(controller.getText().length > 0);

    controller.clear();
    assert.strictEqual(controller.getText(), '');
    assert.strictEqual(env.editor.innerHTML, '');
    assert.strictEqual(env.localStorage.getItem('lipi-editor-content'), '');
  });

  it('T1.4.4 — File export produces text/plain blob with <language>-YYYY-MM-DD.txt naming', () => {
    controller.setLanguage('gu');
    controller.setText('નમસ્તે દુનિયા');

    const exported = controller.saveFile();
    assert.ok(exported, 'Export result must not be null');
    assert.strictEqual(exported.content, 'નમસ્તે દુનિયા');

    const today = new Date().toISOString().slice(0, 10);
    assert.strictEqual(exported.filename, `gujarati-${today}.txt`);
    assert.strictEqual(exported.blob.type, 'text/plain;charset=utf-8');
  });

  it('T1.4.5 — Language switching updates editor direction: Urdu is RTL, other languages are LTR', () => {
    // Switch to Urdu
    controller.setLanguage('ur');
    assert.strictEqual(env.editor.dir, 'rtl');
    assert.strictEqual(env.editor.getAttribute('dir'), 'rtl');

    // Switch to Hindi
    controller.setLanguage('hi');
    assert.strictEqual(env.editor.dir, 'ltr');
    assert.strictEqual(env.editor.getAttribute('dir'), 'ltr');

    // Switch to Bengali
    controller.setLanguage('bn');
    assert.strictEqual(env.editor.dir, 'ltr');
  });

  it('T1.4.6 — Language switching updates SpeechRecognition locale to matching Indic locale', () => {
    controller.setLanguage('ta');
    assert.strictEqual(controller.recognition.lang, 'ta-IN');

    controller.setLanguage('ml');
    assert.strictEqual(controller.recognition.lang, 'ml-IN');

    controller.setLanguage('pa');
    assert.strictEqual(controller.recognition.lang, 'pa-IN');
  });

  it('T1.4.7 — Language switching updates export filename prefix dynamically', () => {
    const today = new Date().toISOString().slice(0, 10);

    controller.setLanguage('hi');
    controller.setText('हिन्दी पाठ');
    assert.strictEqual(controller.saveFile().filename, `hindi-${today}.txt`);

    controller.setLanguage('ur');
    controller.setText('اردو متن');
    assert.strictEqual(controller.saveFile().filename, `urdu-${today}.txt`);

    controller.setLanguage('bn');
    controller.setText('বাংলা টেক্সট');
    assert.strictEqual(controller.saveFile().filename, `bengali-${today}.txt`);
  });

  it('T1.4.8 — Text saved to localStorage is restored upon editor reload/recovery', async () => {
    controller.setText('Persistent Marathi: नमस्कार जग');

    // Simulate page reload by creating a fresh controller with the same storage environment
    const freshController = await EditorController.create(env);
    freshController.restoreFromStorage();

    assert.strictEqual(freshController.getText(), 'Persistent Marathi: नमस्कार जग');
  });

  it('T1.4.9 — Active language choice is persisted to localStorage and restored on reload', async () => {
    controller.setLanguage('te');
    controller.saveToStorage();

    const freshController = await EditorController.create(env);
    freshController.restoreFromStorage();

    assert.strictEqual(freshController.activeLang, 'te');
    assert.strictEqual(freshController.getLanguage().name, 'Telugu');
  });

  it('T1.4.10 — Mic recording lifecycle updates state and toggles UI recording class', () => {
    assert.strictEqual(controller.isRecording, false);
    assert.strictEqual(env.mic.classList.contains('is-recording'), false);

    controller.startSpeech();
    assert.strictEqual(controller.isRecording, true);
    assert.strictEqual(env.mic.classList.contains('is-recording'), true);
    assert.strictEqual(controller.recognition.isStarted, true);

    controller.stopSpeech();
    assert.strictEqual(controller.isRecording, false);
    assert.strictEqual(env.mic.classList.contains('is-recording'), false);
    assert.strictEqual(controller.recognition.isStarted, false);
  });

  it('T1.4.11 — Final speech recognition result commits transcript into editor content', () => {
    controller.setText('Existing text');
    controller.handleSpeechResult('new transcribed sentence', true);

    assert.strictEqual(controller.getText(), 'Existing text new transcribed sentence');
  });

  it('T1.4.12 — Voice commands: voice punctuation triggers format text appropriately', () => {
    controller.clear();
    controller.startSpeech();
    assert.strictEqual(controller.isRecording, true);

    const rawTranscript = 'Hello world comma this is Lipi full stop new line Welcome';
    // Emit speech recognition event through mock recognition pipeline
    controller.recognition.emitResult(rawTranscript, true);

    const editorText = controller.getText();
    assert.ok(editorText.includes(','), 'Editor text must contain formatted comma');
    assert.ok(editorText.includes('.'), 'Editor text must contain formatted full stop');
    assert.ok(editorText.includes('\n'), 'Editor text must contain formatted newline');
    assert.strictEqual(editorText, 'Hello world , this is Lipi . \n Welcome');
  });

  // ─── Tier 2: Boundary & Corner Cases ───

  it('T2.8 — Clipboard copy failure handles rejection gracefully without throwing uncaught errors', async () => {
    env.clipboard.shouldFail = true;
    controller.setText('Valuable draft text');

    await assert.rejects(
      async () => await controller.copy(),
      /Clipboard write permission denied/
    );

    // Text must remain intact in editor despite clipboard failure
    assert.strictEqual(controller.getText(), 'Valuable draft text');
  });

  it('T2.9 — LocalStorage QuotaExceededError is caught and editor continues in-memory', () => {
    env.localStorage.shouldThrowQuotaError = true;
    controller.setText('Text in quota exhausted browser');

    // Must not throw uncaught exception
    assert.doesNotThrow(() => {
      controller.saveToStorage();
    });

    assert.strictEqual(controller.getText(), 'Text in quota exhausted browser');
  });

  it('T2.10 — Exporting empty editor content returns null and avoids downloading empty files', () => {
    controller.clear();
    const result = controller.saveFile();
    assert.strictEqual(result, null, 'Empty editor export should return null');
  });

  it('T2.11 — Rapid sequential language switching updates state cleanly without race conditions', () => {
    const sequence = ['hi', 'bn', 'te', 'ta', 'gu', 'ur', 'kn', 'ml', 'pa', 'or', 'as', 'mr'];
    for (const code of sequence) {
      controller.setLanguage(code);
    }
    assert.strictEqual(controller.activeLang, 'mr');
    assert.strictEqual(controller.getLanguage().name, 'Marathi');
    assert.strictEqual(env.editor.dir, 'ltr');
    assert.strictEqual(controller.recognition.lang, 'mr-IN');
  });
});
