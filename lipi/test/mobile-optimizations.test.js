/**
 * Test Suite: Mobile Performance, Audio Lifecycle, Viewport & UI Regression Tests
 * TDD tests for P0 & P1 mobile optimizations across stt-client.js, translator.js,
 * app.js, index.html, and index.css.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setupTestEnvironment } from './fixtures/test-env.js';
import { MockTranslationWorker } from './fixtures/mock-worker.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function oklchContrastRatio(fgL, fgC, fgH, bgL, bgC, bgH) {
  const toLinearRgb = (L, C, H) => {
    const h = (H * Math.PI) / 180;
    const a = C * Math.cos(h);
    const b = C * Math.sin(h);
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;
    return [
      +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    ].map(v => Math.min(1, Math.max(0, v)));
  };
  const lum = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const L1 = lum(toLinearRgb(fgL, fgC, fgH));
  const L2 = lum(toLinearRgb(bgL, bgC, bgH));
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}

describe('Mobile Performance & UX Optimizations', () => {
  describe('M1 — Swanada capability tiering & worker init config (stt-client.js)', () => {
    it('detectSwanadaTier routes deviceMemory === 4, iPadOS, and touch tablets to mobile tier', async () => {
      const { detectSwanadaTier } = await import('../stt-client.js');

      assert.strictEqual(
        detectSwanadaTier({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', deviceMemory: 4 }),
        'mobile',
        '4 GB RAM devices must use mobile tier'
      );
      assert.strictEqual(
        detectSwanadaTier({
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          platform: 'MacIntel',
          maxTouchPoints: 5,
          deviceMemory: 8,
        }),
        'mobile',
        'iPadOS desktop UA (MacIntel + maxTouchPoints > 1) must use mobile tier'
      );
      assert.strictEqual(
        detectSwanadaTier({
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
          platform: 'Linux x86_64',
          maxTouchPoints: 5,
          screenWidth: 800,
          deviceMemory: 8,
        }),
        'mobile',
        'Touch tablets (<1024px) must use mobile tier'
      );
      assert.strictEqual(
        detectSwanadaTier({
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          platform: 'MacIntel',
          maxTouchPoints: 0,
          screenWidth: 1440,
          deviceMemory: 8,
        }),
        'studio',
        'Desktop non-touch >= 8 GB should stay studio tier'
      );
    });

    it('buildSwanadaModelConfig includes executionProvider and mobile numThreads = 1', async () => {
      const { buildSwanadaModelConfig } = await import('../stt-client.js');

      const mobileCfg = buildSwanadaModelConfig('kn', 'mobile', '/ai/swanada');
      assert.strictEqual(mobileCfg.modelTier, 'mobile');
      assert.strictEqual(mobileCfg.executionProvider, 'wasm');
      assert.strictEqual(mobileCfg.numThreads, 1);

      const studioCfg = buildSwanadaModelConfig('kn', 'studio', '/ai/swanada');
      assert.strictEqual(studioCfg.modelTier, 'studio');
      assert.strictEqual(studioCfg.executionProvider, 'wasm');
      assert.strictEqual(studioCfg.numThreads, undefined);
    });
  });

  describe('M2 — AudioContext battery lifecycle, latencyHint & AudioWorklet watchdog (stt-client.js)', () => {
    it('enforces latencyHint: interactive, audioCtx.suspend on stop, and >=2500ms AudioWorklet watchdog', () => {
      // Runtime AudioContext / AudioWorklet / abort behavior is exercised end-to-end in test/stt-client-mobile.test.js
      const sttSrc = fs.readFileSync(path.join(ROOT, 'stt-client.js'), 'utf8');
      assert.match(sttSrc, /latencyHint:\s*['"]interactive['"]/, 'AudioContext must request latencyHint: interactive');
      assert.match(sttSrc, /audioCtx\.suspend/, 'stop() must suspend audioCtx when idle');
      assert.match(sttSrc, /2500/, 'AudioWorklet watchdog must be raised to >= 2500ms');
      assert.doesNotMatch(sttSrc, /,\s*900\s*\)/, '900ms AudioWorklet watchdog trap must be removed');
    });
  });

  describe('M3 — Translator runtimeHints & sequential batch timeout (translator.js)', () => {
    let translator;
    let mockWorker;

    beforeEach(async () => {
      setupTestEnvironment();
      translator = await import('../translator.js');
      mockWorker = new MockTranslationWorker();
      translator.setWorker(mockWorker);
      translator.clearTranslationCache();
    });

    it('includes mobile runtimeHints in translate and load-translation-model worker messages', async () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          ...globalThis.navigator,
          userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 10 Pro XL) AppleWebKit/537.36 Mobile',
          deviceMemory: 8,
          maxTouchPoints: 5,
        },
        configurable: true,
        writable: true,
      });

      const messages = [];
      const origPost = mockWorker.postMessage.bind(mockWorker);
      mockWorker.postMessage = (msg) => {
        messages.push(msg);
        origPost(msg);
      };

      await translator.preloadLanguageModel('kn');
      await translator.translateText('Hello world', 'kn');

      const loadMsg = messages.find(m => m.action === 'load-translation-model');
      const trMsg = messages.find(m => m.action === 'translate');
      assert.ok(loadMsg?.runtimeHints, 'load-translation-model must include runtimeHints');
      assert.strictEqual(loadMsg.runtimeHints.isMobile, true);
      assert.ok(trMsg?.runtimeHints, 'translate must include runtimeHints');
      assert.strictEqual(trMsg.runtimeHints.isMobile, true);
    });

    it('multi-sentence batch does not falsely time out behind earlier queued sentences or model progress', async () => {
      // 4 distinct sentences, each takes 35ms in worker = 140ms total (> 65ms per-sentence timeout).
      // Because timeouts only start when each sentence is dispatched (after prior sentence finishes),
      // and reset on model-loading/model-progress, ALL 4 sentences must succeed!
      const queue = [];
      let busy = false;
      const drain = () => {
        if (busy || queue.length === 0) return;
        busy = true;
        const msg = queue.shift();
        setTimeout(() => {
          mockWorker.emitMessage({
            type: 'translation-result',
            id: msg.id,
            text: `ಅನುವಾದ: ${msg.text}`,
            targetLang: msg.targetLang,
          });
          busy = false;
          drain();
        }, 35);
      };

      mockWorker.postMessage = (msg) => {
        if (msg.action === 'translate') {
          queue.push(msg);
          drain();
        }
      };

      const input = 'Sentence one. Sentence two. Sentence three. Sentence four.';
      const result = await translator.translateText(input, 'kn', { timeoutMs: 75 });
      assert.ok(result.includes('Sentence one.'), 'Sentence 1 must translate');
      assert.ok(result.includes('Sentence four.'), 'Sentence 4 must not prematurely time out behind sentences 1..3');
    });

    it('hung worker with no progress or response still rejects on timeoutMs', async () => {
      mockWorker.postMessage = () => {
        // Deliberately never respond
      };

      await assert.rejects(
        () => translator.translateText('Hang test.', 'hi', { timeoutMs: 40 }),
        /timed out/i
      );
    });

    it('T-1 — worker error and messageerror events fail fast and reset worker for recovery', async () => {
      let terminated = false;
      mockWorker.terminate = () => { terminated = true; };
      mockWorker.postMessage = () => {
        setTimeout(() => {
          mockWorker.emitError(new Error('RuntimeError: memory access out of bounds'));
        }, 10);
      };

      const t0 = Date.now();
      await assert.rejects(
        () => translator.translateText('Crash test.', 'hi', { timeoutMs: 5000 }),
        /memory access out of bounds/i
      );
      assert.ok(Date.now() - t0 < 500, 'Worker error event must reject immediately rather than waiting 5s');
      assert.strictEqual(terminated, true, 'Failed worker should be terminated and reset');

      // messageerror on preloadLanguageModel also rejects immediately
      const msgErrWorker = new MockTranslationWorker();
      translator.setWorker(msgErrWorker);
      msgErrWorker.postMessage = () => {
        setTimeout(() => {
          msgErrWorker.dispatchEvent('messageerror', { message: 'Deserialization failed' });
        }, 10);
      };
      await assert.rejects(
        () => translator.preloadLanguageModel('ta', 5000),
        /Deserialization failed|Translation worker error/i
      );

      // Recovery with a healthy worker succeeds
      const healthyWorker = new MockTranslationWorker();
      translator.setWorker(healthyWorker);
      const recovered = await translator.translateText('Hello world', 'hi');
      assert.strictEqual(recovered, 'नमस्ते दुनिया');
    });

    it('T-2 — setWorker() mid-batch prevents orphaned queued sentences from running on replacement worker', async () => {
      const workerADispatched = [];
      const workerA = new MockTranslationWorker();
      workerA.postMessage = (msg) => {
        workerADispatched.push(msg);
        // Hold first request pending while remaining sentences wait in dispatchChain
      };

      const workerBDispatched = [];
      const workerB = new MockTranslationWorker();
      const origBPost = workerB.postMessage.bind(workerB);
      workerB.postMessage = (msg) => {
        workerBDispatched.push(msg);
        origBPost(msg);
      };

      translator.setWorker(workerA);
      const batchPromise = translator.translateText(
        'Sentence alpha. Sentence beta. Sentence gamma. Sentence delta.',
        'hi',
        { timeoutMs: 2000 }
      );

      await new Promise(r => setTimeout(r, 10));
      assert.strictEqual(workerADispatched.length, 1);

      translator.setWorker(workerB);

      await assert.rejects(() => batchPromise, /Translation worker was replaced/i);
      await new Promise(r => setTimeout(r, 20));
      assert.strictEqual(
        workerBDispatched.length,
        0,
        'Queued sentences from replaced worker generation must NOT execute on replacement worker'
      );
    });

    it('inFlightSentences cleanup checks promise identity so setWorker() + re-translate preserves new entry', async () => {
      const workerA = new MockTranslationWorker();
      workerA.postMessage = () => {}; // pending

      const workerBDispatched = [];
      const workerB = new MockTranslationWorker();
      workerB.postMessage = (msg) => {
        workerBDispatched.push(msg);
        setTimeout(() => {
          workerB.emitMessage({
            type: 'translation-result',
            id: msg.id,
            text: 'ಹೊಸ ಅನುವಾದ',
            targetLang: msg.targetLang,
          });
        }, 30);
      };

      translator.setWorker(workerA);
      const stalePromise = translator.translateText('Identity check sentence.', 'kn', { timeoutMs: 2000 });
      stalePromise.catch(() => {});

      await new Promise(r => setTimeout(r, 5));
      translator.setWorker(workerB);

      const p1 = translator.translateText('Identity check sentence.', 'kn', { timeoutMs: 2000 });
      await new Promise(r => setTimeout(r, 10));
      const p2 = translator.translateText('Identity check sentence.', 'kn', { timeoutMs: 2000 });

      const [r1, r2] = await Promise.all([p1, p2]);
      assert.strictEqual(r1, 'ಹೊಸ ಅನುವಾದ');
      assert.strictEqual(r2, 'ಹೊಸ ಅನುವಾದ');
      assert.strictEqual(workerBDispatched.length, 1, 'Duplicate in-flight call on new worker must deduplicate');
    });

    it('enforces hard cumulative total-wait cap across repeated model-progress resets', async () => {
      assert.strictEqual(translator.MAX_MODEL_PROGRESS_WAIT_MS, 300000);

      let progressTimer = null;
      mockWorker.postMessage = (msg) => {
        let pct = 10;
        progressTimer = setInterval(() => {
          pct = Math.min(99, pct + 5);
          mockWorker.emitMessage({
            type: 'model-progress',
            language: msg.language || msg.targetLang || 'hi',
            progress: pct,
          });
        }, 15);
      };

      try {
        await assert.rejects(
          () => translator.translateText('Endless progress test.', 'hi', { timeoutMs: 40, maxWaitMs: 120 }),
          /timed out/i
        );
      } finally {
        clearInterval(progressTimer);
      }

      let preloadTimer = null;
      mockWorker.postMessage = (msg) => {
        preloadTimer = setInterval(() => {
          mockWorker.emitMessage({
            type: 'model-progress',
            language: msg.language,
            progress: 50,
          });
        }, 15);
      };

      try {
        await assert.rejects(
          () => translator.preloadLanguageModel('or', 40, 120),
          /Timeout loading translation model/i
        );
      } finally {
        clearInterval(preloadTimer);
      }
    });

    it('handleWorkerError() terminates and clears failedWorker BEFORE emitting model-error status', async () => {
      let terminatedBeforeEmit = false;
      let recoveredInsideListener = null;
      let oldTerminated = false;

      const failingWorker = new MockTranslationWorker();
      failingWorker.terminate = () => {
        oldTerminated = true;
      };
      failingWorker.postMessage = () => {
        setTimeout(() => {
          failingWorker.emitError(new Error('Fatal worker crash'));
        }, 10);
      };

      const replacementWorker = new MockTranslationWorker();
      let replacementTerminated = false;
      replacementWorker.terminate = () => {
        replacementTerminated = true;
      };

      const unsub = translator.onModelStatus((ev) => {
        if (ev?.type === 'model-error') {
          terminatedBeforeEmit = oldTerminated;
          // Registering a new worker synchronously inside the error listener must NOT be clobbered
          translator.setWorker(replacementWorker);
          recoveredInsideListener = translator.getWorker();
        }
      });

      try {
        translator.setWorker(failingWorker);
        await assert.rejects(
          () => translator.translateText('Trigger crash.', 'hi', { timeoutMs: 2000 }),
          /Fatal worker crash/
        );
        assert.strictEqual(terminatedBeforeEmit, true, 'failedWorker must be terminated before model-error status is emitted');
        assert.strictEqual(recoveredInsideListener, replacementWorker, 'Replacement worker set in listener must remain active');
        assert.strictEqual(translator.getWorker(), replacementWorker);
        assert.strictEqual(replacementTerminated, false, 'Replacement worker must not be terminated');
      } finally {
        unsub();
      }
    });
  });

  describe('M4 — Recording abort race & rAF interim coalescing (app.js)', () => {
    let env;
    let appMod;

    beforeEach(async () => {
      env = setupTestEnvironment();
      appMod = await import('../app.js');
    });

    it('tapping Stop while Swanada model download is awaiting start() cancels cleanly without remaining in recording state', async () => {
      let resolveStart;
      let startCalls = 0;
      let stopCalls = 0;
      const listeners = {};

      appMod.setSttController({
        on(evt, fn) { listeners[evt] = fn; },
        start() {
          startCalls++;
          return new Promise((resolve) => {
            resolveStart = resolve;
          });
        },
        async stop() {
          stopCalls++;
        },
      });

      appMod.setEditorMode('stt', false);
      appMod.setLanguage('kn', false);

      // Start recording (hangs on model download)
      const startPromise = appMod.startRecordingSession();
      assert.strictEqual(startCalls, 1);

      // User taps Stop before download finishes
      await appMod.stopRecordingSession();
      assert.strictEqual(stopCalls, 1);
      assert.strictEqual(env.mic.classList.contains('is-recording'), false, 'Mic must leave recording state on abort');

      // Now pending ctrl.start() resolves late
      resolveStart();
      await startPromise;

      assert.strictEqual(env.mic.classList.contains('is-recording'), false, 'Late start() resolution must NOT re-enter recording state');
      assert.ok(stopCalls >= 1, 'Controller stop must be invoked to release mic/stream');
    });

    it('A-1 — Start -> Stop -> Start race does not let stale start() call ctrl.stop() on active session', async () => {
      const startResolvers = [];
      let startCalls = 0;
      let stopCalls = 0;
      const listeners = {};

      appMod.setSttController({
        on(evt, fn) { listeners[evt] = fn; },
        start() {
          startCalls++;
          return new Promise((resolve) => {
            startResolvers.push(resolve);
          });
        },
        async stop() {
          stopCalls++;
        },
      });

      appMod.setEditorMode('stt', false);
      appMod.setLanguage('kn', false);

      // 1. Tap Record (attempt 1 hangs on model download)
      const pStart1 = appMod.startRecordingSession();
      assert.strictEqual(startCalls, 1);

      // 2. Tap Stop (cancels attempt 1)
      await appMod.stopRecordingSession();
      assert.strictEqual(stopCalls, 1);
      assert.strictEqual(env.mic.classList.contains('is-recording'), false);

      // 3. Immediately tap Record again (attempt 2 active)
      const pStart2 = appMod.startRecordingSession();
      assert.strictEqual(startCalls, 2);
      assert.strictEqual(env.mic.classList.contains('is-recording'), true);

      // 4. Stale attempt 1's ctrl.start() resolves late
      startResolvers[0]();
      await pStart1;

      assert.strictEqual(stopCalls, 1, 'Stale attempt 1 must NOT call ctrl.stop() while attempt 2 is recording');
      assert.strictEqual(env.mic.classList.contains('is-recording'), true, 'Active attempt 2 must stay in recording state');
      assert.ok(env.micLabel.textContent.length > 0, 'Stale attempt 1 must NOT clear active attempt label');

      // 5. Attempt 2 resolves cleanly
      startResolvers[1]();
      await pStart2;
      assert.strictEqual(env.mic.classList.contains('is-recording'), true);
      assert.strictEqual(stopCalls, 1);

      await appMod.stopRecordingSession();
      assert.strictEqual(stopCalls, 2);
    });

    it('A-2 — late partial emitted after stopRecordingSession() does not re-mount .interim', async () => {
      const listeners = {};
      appMod.setSttController({
        on(evt, fn) { listeners[evt] = fn; },
        async start() {},
        async stop() {},
      });

      appMod.setEditorMode('stt', false);
      appMod.setLanguage('kn', false);
      const ed = document.querySelector('#editor');
      ed.innerHTML = '';
      ed.innerText = '';

      await appMod.startRecordingSession();
      listeners.partial?.({ text: 'ನಮಸ್ಕಾರ' });
      const hasInterim = () => ed.children.some(c => c.className === 'interim' || c.classList?.contains('interim'));
      assert.ok(hasInterim());

      await appMod.stopRecordingSession();
      assert.strictEqual(hasInterim(), false);

      // Late partial arriving from worker flush after Stop
      listeners.partial?.({ text: 'ghost-partial-after-stop' });
      assert.strictEqual(hasInterim(), false, 'Late partial must NOT re-mount .interim');
      assert.strictEqual(ed.innerHTML.includes('ghost-partial-after-stop'), false);
    });

    it('same-frame rAF revert restores original text without flushing stale intermediate hypothesis', async () => {
      const rafCallbacks = [];
      globalThis.requestAnimationFrame = (cb) => {
        rafCallbacks.push(cb);
        return rafCallbacks.length;
      };
      globalThis.window.requestAnimationFrame = globalThis.requestAnimationFrame;
      globalThis.cancelAnimationFrame = () => {};
      globalThis.window.cancelAnimationFrame = globalThis.cancelAnimationFrame;

      const listeners = {};
      appMod.setSttController({
        on(evt, fn) { listeners[evt] = fn; },
        async start() {},
        async stop() {},
      });

      appMod.setEditorMode('stt', false);
      appMod.setLanguage('kn', false);
      const ed = document.querySelector('#editor');
      ed.innerHTML = '';
      ed.innerText = '';

      await appMod.startRecordingSession();

      // Mount initial interim 'abc'
      listeners.partial?.({ text: 'abc' });
      const interimEl = ed.children.find(c => c.className === 'interim' || c.classList?.contains('interim'));
      assert.ok(interimEl, 'Interim span should exist');
      assert.strictEqual(interimEl.textContent, 'abc');

      // Update to 'abcd' then revert to 'abc' within the same animation frame
      listeners.partial?.({ text: 'abcd' });
      listeners.partial?.({ text: 'abc' });

      while (rafCallbacks.length > 0) {
        rafCallbacks.shift()();
      }
      assert.strictEqual(interimEl.textContent, 'abc', 'Same-frame revert must NOT flush stale abcd');

      await appMod.stopRecordingSession();
    });

    it('coalesces rapid partial transcript updates via requestAnimationFrame and skips duplicate partial text', async () => {
      const rafCallbacks = [];
      globalThis.requestAnimationFrame = (cb) => {
        rafCallbacks.push(cb);
        return rafCallbacks.length;
      };
      globalThis.window.requestAnimationFrame = globalThis.requestAnimationFrame;
      globalThis.cancelAnimationFrame = () => {};
      globalThis.window.cancelAnimationFrame = globalThis.cancelAnimationFrame;

      const listeners = {};
      appMod.setSttController({
        on(evt, fn) { listeners[evt] = fn; },
        async start() {},
        async stop() {},
      });

      appMod.setEditorMode('stt', false);
      appMod.setLanguage('kn', false);
      const ed = document.querySelector('#editor');
      ed.innerHTML = '';
      ed.innerText = '';

      await appMod.startRecordingSession();

      // First partial mounts .interim immediately
      listeners.partial?.({ text: 'ನಮಸ್ಕಾರ' });
      assert.ok(ed.innerHTML.includes('ನಮಸ್ಕಾರ'));

      const interimEl = ed.children.find(c => c.className === 'interim' || c.classList?.contains('interim'));
      assert.ok(interimEl, 'Interim span should exist');

      // Rapid burst of 3 updates in the same frame should schedule at most 1 rAF update
      const initialRafCount = rafCallbacks.length;
      listeners.partial?.({ text: 'ನಮಸ್ಕಾರ ಬೆಂ' });
      listeners.partial?.({ text: 'ನಮಸ್ಕಾರ ಬೆಂಗ' });
      listeners.partial?.({ text: 'ನಮಸ್ಕಾರ ಬೆಂಗಳೂರು' });

      assert.strictEqual(
        rafCallbacks.length - initialRafCount,
        1,
        'Multiple partials in same frame must coalesce into a single rAF callback'
      );

      // Flush rAF callbacks
      while (rafCallbacks.length > 0) {
        rafCallbacks.shift()();
      }
      assert.strictEqual(interimEl.textContent, 'ನಮಸ್ಕಾರ ಬೆಂಗಳೂರು');

      // Duplicate partial text must NOT schedule another rAF
      const afterFlushRafCount = rafCallbacks.length;
      listeners.partial?.({ text: 'ನಮಸ್ಕಾರ ಬೆಂಗಳೂರು' });
      assert.strictEqual(rafCallbacks.length, afterFlushRafCount, 'Identical partial text must not schedule rAF');

      await appMod.stopRecordingSession();
    });

    it('stopRecordingSession() Start -> Stop -> Start guard does not overwrite active recording phase or #mic-label', async () => {
      let resolveStop;
      let startCalls = 0;
      let stopCalls = 0;

      appMod.setSttController({
        on() {},
        async start() {
          startCalls++;
        },
        stop() {
          stopCalls++;
          return new Promise((resolve) => {
            resolveStop = resolve;
          });
        },
      });

      appMod.setEditorMode('stt', false);
      appMod.setLanguage('kn', false);

      // 1. Start session #1
      await appMod.startRecordingSession();
      assert.strictEqual(startCalls, 1);
      assert.strictEqual(env.mic.classList.contains('is-recording'), true);
      assert.strictEqual(env.micLabel.dataset.phase, 'recording');

      // 2. Tap Stop (yields while sttController.stop() flushes)
      const pStop1 = appMod.stopRecordingSession();
      assert.strictEqual(stopCalls, 1);

      // 3. Immediately tap Start #2 while Stop #1 is still awaiting sttController.stop()
      const pStart2 = appMod.startRecordingSession();
      await pStart2;
      assert.strictEqual(startCalls, 2);
      assert.strictEqual(env.mic.classList.contains('is-recording'), true);
      assert.strictEqual(env.micLabel.dataset.phase, 'recording');
      assert.ok(env.micLabel.textContent.includes('Swanada'));

      // 4. Stale Stop #1's flush resolves
      resolveStop();
      await pStop1;

      assert.strictEqual(env.mic.classList.contains('is-recording'), true, 'Active session #2 must remain recording');
      assert.strictEqual(env.micLabel.dataset.phase, 'recording', 'Stale stop must NOT revert phase to ready');
      assert.ok(env.micLabel.textContent.includes('Swanada'), 'Stale stop must NOT clear #mic-label');

      // Clean stop #2
      const pStop2 = appMod.stopRecordingSession();
      resolveStop();
      await pStop2;
      assert.strictEqual(env.mic.classList.contains('is-recording'), false);
      assert.strictEqual(env.micLabel.dataset.phase, 'ready');
    });

    it('A-3 — late progress event after stopRecordingSession() is ignored and keeps #progress hidden', async () => {
      const listeners = {};
      appMod.setSttController({
        on(evt, fn) { listeners[evt] = fn; },
        async start() {},
        async stop() {},
      });

      appMod.setEditorMode('stt', false);
      appMod.setLanguage('kn', false);

      await appMod.startRecordingSession();
      await appMod.stopRecordingSession();

      assert.strictEqual(env.progress.hidden, true);
      assert.strictEqual(env.micLabel.textContent, '');

      // Emit late progress from worker after Stop
      listeners.progress?.({ progress: 0.42, tier: 'mobile' });
      await new Promise(r => setTimeout(r, 15));

      assert.strictEqual(env.progress.hidden, true, 'Late progress after stop must NOT unhide #progress');
      assert.strictEqual(env.micLabel.textContent, '', 'Late progress after stop must NOT overwrite #mic-label');
    });

    it('toast() replaces prior non-error toasts and caps mobile #toast-container to 1 visible toast', () => {
      // Desktop: rapid non-error toasts replace instead of stacking
      env.toastContainer.children.length = 0;
      appMod.setLanguage('hi', true);
      appMod.setLanguage('ta', true);
      appMod.setLanguage('ml', true);
      assert.strictEqual(env.toastContainer.children.length, 1, 'Non-error toasts must replace previous non-error toast');
      assert.ok(env.toastContainer.children[0].textContent.includes('Malayalam'));

      // Desktop: error toast stays visible alongside 1 non-error toast
      const ed = document.querySelector('#editor');
      ed.innerHTML = '';
      ed.innerText = '';
      appMod.saveFile(); // triggers error toast ('Editor is empty — nothing to save.')
      appMod.setLanguage('bn', true);
      assert.strictEqual(env.toastContainer.children.length, 2, 'Desktop may keep 1 error toast alongside 1 info toast');

      // Mobile (<= 640px): caps #toast-container at 1 toast even across error + info bursts
      window.matchMedia = (q) => ({
        matches: q.includes('640px'),
        media: q,
        addEventListener() {},
        removeEventListener() {},
      });
      globalThis.matchMedia = window.matchMedia;

      appMod.saveFile(); // error toast
      appMod.setLanguage('ur', true);
      appMod.setLanguage('ml', true);
      appMod.setEditorMode('translate', true);
      assert.strictEqual(env.toastContainer.children.length, 1, 'Mobile #toast-container must cap at 1 toast to avoid overlapping .editor');
      assert.ok(env.toastContainer.children[0].textContent.includes('Malayalam'));
    });
  });

  describe('M5 — Mobile CSS & HTML layout/performance invariants', () => {
    it('index.css & index.html enforce mobile visibility, safe-area, touch targets, and compositor-safe animations', () => {
      const css = fs.readFileSync(path.join(ROOT, 'index.css'), 'utf8');
      const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

      // 1. Mobile status label must NOT be hidden with display: none
      const mobileSection = css.slice(css.indexOf('@media (max-width: 640px)'));
      assert.doesNotMatch(
        mobileSection,
        /\.mic-label\s*\{\s*display:\s*none\s*;?\s*\}/,
        'Mobile CSS must not hide #mic-label with display: none'
      );
      assert.match(css, /\.mic-label:empty\s*\{\s*display:\s*none/, 'Empty #mic-label should collapse cleanly');

      // 2. Float bar mobile fit + safe-area-inset-bottom
      assert.match(mobileSection, /flex-wrap:\s*wrap|overflow-x:\s*auto/, '.float-bar on mobile must wrap or scroll cleanly');
      assert.match(css, /env\(safe-area-inset-bottom/, 'Must respect safe-area-inset-bottom');
      assert.match(css, /env\(safe-area-inset-top/, 'Must respect safe-area-inset-top');

      // 3. Touch targets >= 40px on mobile
      assert.match(mobileSection, /min-height:\s*4[04]px|height:\s*4[04]px/, 'Mobile interactive buttons must have >=40-44px touch targets');

      // 4. .back-btn pill surface & .cmd-del touch visibility
      assert.match(css, /\.back-btn\s*\{[^}]*background:/s, '.back-btn must have a pill background so text never obscures it');
      assert.match(css, /@media\s*\(hover:\s*none\)/, '.cmd-del must be visible on touch devices (@media (hover: none))');

      // 5. No blur(5px) or box-shadow pulse paint animations, no mobile backdrop-filter overdraw
      assert.doesNotMatch(css, /(?<!backdrop-)filter:\s*blur\(/, 'Hero animation must not use expensive filter: blur()');
      assert.doesNotMatch(css, /@keyframes\s+pulse\s*\{[^}]*box-shadow/s, 'Recording pulse must not animate box-shadow per frame');
      assert.match(mobileSection, /backdrop-filter:\s*none/, 'Mobile CSS should disable heavy backdrop-filter blur overdraw');

      // 6. Google Fonts includes &display=swap
      assert.match(html, /fonts\.googleapis\.com\/css2\?[^"]*display=swap/, 'Google Fonts URL must include display=swap');

      // 7. Dynamic .lang-menu max-height variable & fallback, .toast-box z-index & mobile non-overlap, .mode-btn 40px, recording label contrast >= 4.5:1
      assert.match(css, /\.lang-menu\s*\{[^}]*var\(--lang-menu-max-h/s, '.lang-menu must respect --lang-menu-max-h');
      assert.match(mobileSection, /\.lang-menu\s*\{[^}]*var\(--lang-menu-max-h/s, 'Mobile .lang-menu must respect --lang-menu-max-h');
      assert.match(mobileSection, /\.mode-btn\s*\{[^}]*min-height:\s*40px/s, 'Mobile .mode-btn must have min-height: 40px');

      const toastZMatch = css.match(/\.toast-box\s*\{[^}]*z-index:\s*(\d+)/s);
      const helpZMatch = css.match(/\.help-overlay\s*\{[^}]*z-index:\s*(\d+)/s);
      assert.ok(toastZMatch && helpZMatch, '.toast-box and .help-overlay must define z-index');
      assert.ok(Number(toastZMatch[1]) < Number(helpZMatch[1]), '.toast-box z-index must sit below .help-overlay');

      assert.match(mobileSection, /\.toast-box\s*\{[^}]*top:\s*calc\(0\.5rem/s, 'Mobile .toast-box must align in top header strip above .editor');
      assert.match(mobileSection, /\.toast-box\s*\{[^}]*right:/s, 'Mobile .toast-box must anchor to top-right away from .back-btn');
      assert.match(mobileSection, /\.toast-box\s*\{[^}]*left:\s*auto/s, 'Mobile .toast-box must not center-overlap .editor');

      const recColorMatch = css.match(/\.mic-label\[data-phase="recording"\]\s*\{\s*color:\s*oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/);
      assert.ok(recColorMatch, '.mic-label[data-phase="recording"] must define explicit oklch color');
      const ratio = oklchContrastRatio(
        Number(recColorMatch[1]),
        Number(recColorMatch[2]),
        Number(recColorMatch[3]),
        0.15,
        0.009,
        260
      );
      assert.ok(ratio >= 4.5, `Mobile #mic-label recording contrast (${ratio.toFixed(2)}:1) must be >= 4.5:1`);
    });
  });
});
