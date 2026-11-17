/**
 * Test Suite: Real stt-client.js Controller Runtime Lifecycle & Mobile Behavior
 * Registers an ESM loader hook for http://localhost/ai/swanada/swanada.mjs?v=1.9.0
 * so createSwanadaSttController() runs end-to-end with SpyAudioContext & SpyAudioWorkletNode.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { setupTestEnvironment } from './fixtures/test-env.js';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'http://localhost/ai/swanada/swanada.mjs?v=1.9.0') {
      return { shortCircuit: true, url: 'mock:swanada-sdk' };
    }
    if (specifier === 'https://h3manth.com/ai/swanada/swanada.mjs?v=1.9.0') {
      return { shortCircuit: true, url: 'mock:swanada-sdk-slow' };
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url === 'mock:swanada-sdk' || url === 'mock:swanada-sdk-slow') {
      const slowPrefix = url === 'mock:swanada-sdk-slow'
        ? 'await new Promise(r => setTimeout(r, 60));\n'
        : '';
      return {
        shortCircuit: true,
        format: 'module',
        source: `
          ${slowPrefix}
          export class SwanadaWorkerClient {
            constructor(opts) {
              this.opts = opts;
              this._handlers = new Map();
              this._inFlightInits = 0;
              this.maxConcurrentInits = 0;
              globalThis.__swanadaWorkerClients = globalThis.__swanadaWorkerClients || [];
              globalThis.__swanadaWorkerClients.push(this);
            }
            on(evt, fn) { this._handlers.set(evt, fn); }
            async init(cfg) {
              this._inFlightInits++;
              if (this._inFlightInits > this.maxConcurrentInits) {
                this.maxConcurrentInits = this._inFlightInits;
              }
              try {
                globalThis.__swanadaInitCalls = globalThis.__swanadaInitCalls || [];
                globalThis.__swanadaInitCalls.push(cfg);
                if (globalThis.__swanadaInitDelayMs) {
                  await new Promise(r => setTimeout(r, globalThis.__swanadaInitDelayMs));
                }
                if (typeof globalThis.__swanadaOnInit === 'function') {
                  await globalThis.__swanadaOnInit(this, cfg);
                }
                this._handlers.get('ready')?.({ language: cfg.language });
              } finally {
                this._inFlightInits--;
              }
            }
            startStream() {
              globalThis.__swanadaStartStreamCalls = (globalThis.__swanadaStartStreamCalls || 0) + 1;
            }
            pushAudio() {}
            async finishStream() {
              globalThis.__swanadaFinishStreamCalls = (globalThis.__swanadaFinishStreamCalls || 0) + 1;
            }
            terminate() {
              this.terminated = true;
            }
          }
        `,
      };
    }
    return nextLoad(url, context);
  },
});

describe('stt-client.js — Runtime AudioContext, Watchdog & Abort Lifecycle', () => {
  let env;
  let sttMod;
  let origFetch;
  let origAudioWorkletNode;
  let audioCtxInstances;
  let fallbackScriptProcCount;
  let stoppedTrackCount;

  beforeEach(async () => {
    env = setupTestEnvironment();
    globalThis.window.location = {
      ...globalThis.window.location,
      origin: 'http://localhost',
    };
    globalThis.location = globalThis.window.location;
    origFetch = globalThis.fetch;
    origAudioWorkletNode = globalThis.AudioWorkletNode;

    audioCtxInstances = [];
    fallbackScriptProcCount = 0;
    stoppedTrackCount = 0;

    globalThis.__swanadaWorkerClients = [];
    globalThis.__swanadaInitCalls = [];
    globalThis.__swanadaInitDelayMs = 0;
    globalThis.__swanadaOnInit = null;
    globalThis.__swanadaStartStreamCalls = 0;
    globalThis.__swanadaFinishStreamCalls = 0;

    globalThis.fetch = async (url) => {
      if (String(url).includes('models_manifest.json')) {
        return { ok: true };
      }
      return { ok: true, text: async () => '' };
    };

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        ...globalThis.navigator,
        userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 10 Pro XL) Mobile',
        deviceMemory: 4,
        maxTouchPoints: 5,
        mediaDevices: {
          getUserMedia: async () => ({
            getTracks: () => [{ stop: () => { stoppedTrackCount++; } }],
          }),
        },
      },
      configurable: true,
      writable: true,
    });

    class SpyAudioContext {
      constructor(opts) {
        this.ctorOpts = opts;
        this.sampleRate = 48000;
        this.state = 'running';
        this.suspendCalls = 0;
        this.resumeCalls = 0;
        this.closeCalls = 0;
        this.destination = { connect() {} };
        this.audioWorklet = {
          addModule: async () => {},
        };
        audioCtxInstances.push(this);
      }
      createMediaStreamSource() {
        return { connect() {}, disconnect() {} };
      }
      createGain() {
        return { gain: { value: 1 }, connect() {}, disconnect() {} };
      }
      createScriptProcessor() {
        fallbackScriptProcCount++;
        return { connect() {}, disconnect() {}, onaudioprocess: null };
      }
      async suspend() {
        this.suspendCalls++;
        this.state = 'suspended';
      }
      async resume() {
        this.resumeCalls++;
        this.state = 'running';
      }
      async close() {
        this.closeCalls++;
        this.state = 'closed';
      }
    }

    globalThis.AudioWorkletNode = class SpyAudioWorkletNode {
      constructor(ctx, name, opts) {
        this.ctx = ctx;
        this.name = name;
        this.opts = opts;
        this.port = { onmessage: null, postMessage() {} };
        globalThis.__lastWorkletNode = this;
      }
      connect() {}
      disconnect() {}
    };

    globalThis.window.AudioContext = SpyAudioContext;
    globalThis.window.webkitAudioContext = SpyAudioContext;

    sttMod = await import('../stt-client.js');
  });

  afterEach(() => {
    globalThis.fetch = origFetch;
    globalThis.AudioWorkletNode = origAudioWorkletNode;
  });

  it('S6 — passes mobile tier/numThreads/wasm to workerClient.init, uses latencyHint: interactive, and suspends/resumes AudioContext across stop/start', async () => {
    const ctrl = sttMod.createSwanadaSttController();

    await ctrl.start('kn');

    assert.strictEqual(globalThis.__swanadaInitCalls.length, 1);
    const initCfg = globalThis.__swanadaInitCalls[0];
    assert.strictEqual(initCfg.modelTier, 'mobile');
    assert.strictEqual(initCfg.numThreads, 1);
    assert.strictEqual(initCfg.executionProvider, 'wasm');

    assert.strictEqual(audioCtxInstances.length, 1);
    const ctx = audioCtxInstances[0];
    assert.deepStrictEqual(ctx.ctorOpts, { latencyHint: 'interactive' });
    assert.strictEqual(ctx.state, 'running');

    // Simulate receiving an audio chunk via worklet so watchdog is cleared cleanly
    globalThis.__lastWorkletNode.port.onmessage({
      data: { audioChunk: new Float32Array(1600), isTail: false },
    });

    await ctrl.stop();
    assert.strictEqual(ctx.suspendCalls, 1, 'stop() must suspend AudioContext to release Android audio HAL');
    assert.strictEqual(ctx.state, 'suspended');
    assert.strictEqual(stoppedTrackCount, 1, 'stop() must stop micStream tracks');

    // Starting a second session reuses & resumes the suspended AudioContext
    await ctrl.start('kn');
    assert.strictEqual(audioCtxInstances.length, 1, 'Should reuse suspended AudioContext');
    assert.strictEqual(ctx.resumeCalls, 1, 'Subsequent start() must resume suspended AudioContext');
    assert.strictEqual(ctx.state, 'running');

    await ctrl.destroy();
    assert.strictEqual(ctx.closeCalls, 1, 'destroy() must close AudioContext');
    assert.strictEqual(globalThis.__swanadaWorkerClients[0].terminated, true);
  });

  it('S7 — AudioWorklet watchdog waits >= 2500ms before falling back to ScriptProcessorNode', async () => {
    const ctrl = sttMod.createSwanadaSttController();
    await ctrl.start('kn');

    // At 1000ms (> old 900ms trap), fallback must NOT have triggered yet
    await new Promise(r => setTimeout(r, 1000));
    assert.strictEqual(fallbackScriptProcCount, 0, 'Must NOT degrade to ScriptProcessorNode at 1000ms');

    // Sending an audio chunk at ~1050ms clears the watchdog so fallback never triggers
    globalThis.__lastWorkletNode.port.onmessage({
      data: { audioChunk: new Float32Array(1600), isTail: false },
    });
    await new Promise(r => setTimeout(r, 1600));
    assert.strictEqual(fallbackScriptProcCount, 0, 'Receiving worklet chunk before 2500ms must cancel ScriptProcessor fallback');

    await ctrl.destroy();
  });

  it('S8 — calling stop() while start() is awaiting model init aborts mic stream and never calls startStream()', async () => {
    globalThis.__swanadaInitDelayMs = 80;
    const ctrl = sttMod.createSwanadaSttController();

    const startPromise = ctrl.start('kn');
    await new Promise(r => setTimeout(r, 15));
    await ctrl.stop();
    await startPromise;

    assert.strictEqual(globalThis.__swanadaStartStreamCalls, 0, 'Aborted start() must not start audio stream');
    assert.strictEqual(stoppedTrackCount, 1, 'Aborted start() must immediately stop acquired micStream tracks');

    await ctrl.destroy();
  });

  it('S9 (S-1) — stop() 60ms worklet flush does not suspend or finishStream() a newly restarted session', async () => {
    const ctrl = sttMod.createSwanadaSttController();
    await ctrl.start('kn');

    const ctx = audioCtxInstances[0];
    assert.strictEqual(ctx.state, 'running');
    assert.strictEqual(globalThis.__swanadaStartStreamCalls, 1);

    // Trigger stop() which yields 60ms for worklet flush, then restart at 15ms
    const pStop = ctrl.stop();
    await new Promise(r => setTimeout(r, 15));
    const pStart = ctrl.start('kn');
    await Promise.all([pStop, pStart]);

    assert.strictEqual(ctx.state, 'running', 'Stale stop() flush must NOT suspend restarted AudioContext');
    assert.strictEqual(ctx.suspendCalls, 0, 'Stale stop() flush must NOT call suspend() after restart');
    assert.strictEqual(globalThis.__swanadaFinishStreamCalls, 0, 'Stale stop() must NOT finishStream() on restarted session');
    assert.strictEqual(globalThis.__swanadaStartStreamCalls, 2);
    assert.strictEqual(stoppedTrackCount, 1, 'Only first session mic track should be stopped; restarted track remains active');

    await ctrl.destroy();
  });

  it('S10 (S-2) — overlapping start/stop/start during slow SDK import deduplicates SwanadaWorkerClient and revokes all blobs on destroy()', async () => {
    globalThis.fetch = async (url) => {
      if (String(url).includes('models_manifest.json')) {
        await new Promise(r => setTimeout(r, 30));
        return { ok: false };
      }
      return { ok: true, text: async () => '' };
    };

    const ctrl = sttMod.createSwanadaSttController();
    const p1 = ctrl.start('kn');
    await new Promise(r => setTimeout(r, 10));
    await ctrl.stop();
    const p2 = ctrl.start('hi');
    await Promise.all([p1, p2]);

    assert.strictEqual(
      globalThis.__swanadaWorkerClients.length,
      1,
      'Overlapping start/stop/start during slow SDK import must instantiate exactly 1 SwanadaWorkerClient'
    );

    await ctrl.destroy();
    assert.strictEqual(globalThis.__swanadaWorkerClients[0].terminated, true);
    assert.strictEqual(env.blobs.size, 0, 'destroy() must revoke all created Blob URLs');

    // Also verify destroy() mid-boot aborts cleanly without leaking workers or blobs
    const ctrl2 = sttMod.createSwanadaSttController();
    const pMidBoot = ctrl2.start('kn');
    await new Promise(r => setTimeout(r, 10));
    await ctrl2.destroy();
    await pMidBoot.catch(() => {});
    assert.strictEqual(globalThis.__swanadaWorkerClients.length, 1, 'Destroyed mid-boot controller must not leak a new worker');
    assert.strictEqual(env.blobs.size, 0);
  });

  it('S11 — getUserMedia() permission denial rejects fast during slow model init with zero unhandledRejection', async () => {
    globalThis.__swanadaInitDelayMs = 250;
    navigator.mediaDevices.getUserMedia = async () => {
      throw new Error('Permission denied');
    };

    let unhandledCount = 0;
    const onUnhandled = () => { unhandledCount++; };
    process.on('unhandledRejection', onUnhandled);

    const ctrl = sttMod.createSwanadaSttController();
    const t0 = Date.now();
    try {
      await assert.rejects(() => ctrl.start('kn'), /Permission denied/);
      const elapsed = Date.now() - t0;
      assert.ok(elapsed < 120, `Permission denial must reject fast without waiting for 250ms init (took ${elapsed}ms)`);
      // Allow a microtask/timer turn to confirm no delayed unhandledRejection fires
      await new Promise(r => setTimeout(r, 20));
      assert.strictEqual(unhandledCount, 0, 'Must emit zero unhandledRejection events');
    } finally {
      process.off('unhandledRejection', onUnhandled);
      await ctrl.destroy();
    }
  });

  it('S12 (S-3a) — destroy() mid-boot followed by concurrent starts preserves new engineBootPromise identity', async () => {
    globalThis.fetch = async (url) => {
      if (String(url).includes('models_manifest.json')) {
        await new Promise(r => setTimeout(r, 80));
        return { ok: false }; // remote SDK
      }
      return { ok: true, text: async () => '' };
    };

    const ctrl = sttMod.createSwanadaSttController();
    const pKn = ctrl.start('kn');
    pKn.catch(() => {});
    await new Promise(r => setTimeout(r, 10));
    await ctrl.destroy();

    const pHi = ctrl.start('hi');
    // Wait 75ms: pKn's 80ms boot settles at t=80ms (70ms after destroy), while pHi's 80ms boot is still pending until t=90ms
    await new Promise(r => setTimeout(r, 75));
    const pTa = ctrl.start('ta');
    await Promise.all([pHi, pTa]);

    assert.strictEqual(globalThis.__swanadaWorkerClients.length, 1, 'Must instantiate exactly 1 SwanadaWorkerClient after post-destroy concurrent starts');
    await ctrl.destroy();
    assert.strictEqual(globalThis.__swanadaWorkerClients[0].terminated, true);
    assert.strictEqual(env.blobs.size, 0, 'Must leave 0 unrevoked blobs');
  });

  it('S13 (S-3b) — destroy() mid-init followed by concurrent starts preserves activeInitPromise identity and serializes init()', async () => {
    globalThis.__swanadaInitDelayMs = 80;
    const ctrl = sttMod.createSwanadaSttController();

    const pKn = ctrl.start('kn');
    pKn.catch(() => {});
    await new Promise(r => setTimeout(r, 15));
    await ctrl.destroy();

    const pHi = ctrl.start('hi');
    await new Promise(r => setTimeout(r, 75));
    const pTa = ctrl.start('ta');
    await Promise.all([pHi, pTa]);

    assert.strictEqual(globalThis.__swanadaWorkerClients.length, 2);
    const client2 = globalThis.__swanadaWorkerClients[1];
    assert.strictEqual(client2.maxConcurrentInits, 1, 'client2.init() must run sequentially without overlapping concurrent inits');
    await ctrl.destroy();
    assert.strictEqual(env.blobs.size, 0);
  });

  it('S14 (S-4) — overlapping remote audioWorklet.addModule() calls serialize per context and never leak localWorkletBlobUrl', async () => {
    globalThis.fetch = async (url) => {
      if (String(url).includes('models_manifest.json')) {
        return { ok: false }; // force remote worklet fetch + Blob URL
      }
      return { ok: true, text: async () => 'class P {} registerProcessor("p", P);' };
    };

    let addModuleCalls = 0;
    const OrigCtx = globalThis.window.AudioContext;
    class SlowWorkletAudioContext extends OrigCtx {
      constructor(opts) {
        super(opts);
        this.audioWorklet = {
          addModule: async () => {
            addModuleCalls++;
            await new Promise(r => setTimeout(r, 60));
          },
        };
      }
    }
    globalThis.window.AudioContext = SlowWorkletAudioContext;
    globalThis.window.webkitAudioContext = SlowWorkletAudioContext;

    const ctrl = sttMod.createSwanadaSttController();
    const pKn = ctrl.start('kn');
    await new Promise(r => setTimeout(r, 25));
    await ctrl.stop();
    const pHi = ctrl.start('hi');
    await Promise.all([pKn, pHi]);
    await ctrl.destroy();

    assert.strictEqual(addModuleCalls, 1, 'Per-context addModule must serialize and execute once');
    assert.strictEqual(env.blobs.size, 0, 'All worklet & worker Blob URLs must be revoked without leaks');
  });

  it('S15 — concurrent ctrl.stop() + ctrl.stop() shares activeStopPromise and invokes finishStream() once', async () => {
    const ctrl = sttMod.createSwanadaSttController();
    await ctrl.start('kn');

    await Promise.all([ctrl.stop(), ctrl.stop()]);
    assert.strictEqual(globalThis.__swanadaFinishStreamCalls, 1, 'Concurrent stop() calls must flush once and call finishStream() once');

    await ctrl.destroy();
  });

  it('S16 (S-5a) — audioCtx.resume() race on Start -> Stop -> Start keeps session 3 mic active and stops stale session 2 track', async () => {
    const tracks = [];
    navigator.mediaDevices.getUserMedia = async () => {
      const track = {
        id: tracks.length + 1,
        stopped: false,
        stop() {
          if (!this.stopped) {
            this.stopped = true;
            stoppedTrackCount++;
          }
        },
      };
      tracks.push(track);
      return { getTracks: () => [track] };
    };

    let resumeDelayMs = 0;
    const OrigCtx = globalThis.window.AudioContext;
    class AsyncResumeAudioContext extends OrigCtx {
      async resume() {
        this.resumeCalls++;
        if (resumeDelayMs > 0) {
          await new Promise(r => setTimeout(r, resumeDelayMs));
        }
        if (this.state !== 'closed') {
          this.state = 'running';
        }
      }
    }
    globalThis.window.AudioContext = AsyncResumeAudioContext;
    globalThis.window.webkitAudioContext = AsyncResumeAudioContext;

    const ctrl = sttMod.createSwanadaSttController();
    await ctrl.start('kn');
    await ctrl.stop();

    const ctx = audioCtxInstances[0];
    assert.strictEqual(ctx.state, 'suspended');
    assert.strictEqual(tracks[0].stopped, true);

    // Session 2 enters async audioCtx.resume() (30ms), then Stop at 5ms, then Session 3 starts with fast resume (2ms)
    resumeDelayMs = 30;
    const p2 = ctrl.start('hi');
    await new Promise(r => setTimeout(r, 5));
    await ctrl.stop();

    resumeDelayMs = 2;
    const p3 = ctrl.start('ta');
    await Promise.all([p2, p3]);

    assert.strictEqual(tracks.length, 3);
    assert.strictEqual(tracks[1].stopped, true, 'Stale session 2 track must be stopped');
    assert.strictEqual(tracks[2].stopped, false, 'Active session 3 track must stay active');
    assert.strictEqual(ctx.state, 'running', 'Stale session 2 abort must NOT suspend active session 3 AudioContext');

    // Also verify Start -> Stop (without subsequent Start) mid-resume() suspends AudioContext and stops tracks
    await ctrl.stop();
    assert.strictEqual(ctx.state, 'suspended');
    resumeDelayMs = 30;
    const pAbortOnly = ctrl.start('hi');
    await new Promise(r => setTimeout(r, 5));
    await ctrl.stop();
    await pAbortOnly;
    assert.strictEqual(ctx.state, 'suspended', 'Start -> Stop mid-resume() must leave AudioContext suspended');
    assert.strictEqual(
      tracks.filter(t => !t.stopped).length,
      0,
      'Start -> Stop mid-resume() must stop all MediaStreamTracks'
    );

    await ctrl.destroy();
    assert.strictEqual(
      tracks.filter(t => !t.stopped).length,
      0,
      'destroy() must stop all MediaStreamTracks'
    );

    // Also verify destroy() mid-resume() stops all tracks and does not suspend closed AudioContext
    const ctrl2 = sttMod.createSwanadaSttController();
    resumeDelayMs = 0;
    await ctrl2.start('kn');
    await ctrl2.stop();
    const ctx2 = audioCtxInstances[1];
    const suspendBeforeMidResumeDestroy = ctx2.suspendCalls;
    resumeDelayMs = 30;
    const pMidResume = ctrl2.start('hi');
    await new Promise(r => setTimeout(r, 5));
    await ctrl2.destroy();
    assert.strictEqual(
      tracks.filter(t => !t.stopped).length,
      0,
      'destroy() mid-resume() must stop acquired MediaStreamTracks immediately'
    );
    await pMidResume;
    assert.strictEqual(ctx2.state, 'closed');
    assert.strictEqual(ctx2.suspendCalls, suspendBeforeMidResumeDestroy, 'Stale resume must not suspend closed AudioContext');
  });

  it('S17 (S-5b) — overlapping start() mid-addModule and consecutive start() calls never leak MediaStreamTracks or Blobs', async () => {
    const tracks = [];
    navigator.mediaDevices.getUserMedia = async () => {
      const track = {
        id: tracks.length + 1,
        stopped: false,
        stop() {
          if (!this.stopped) {
            this.stopped = true;
            stoppedTrackCount++;
          }
        },
      };
      tracks.push(track);
      return { getTracks: () => [track] };
    };

    globalThis.fetch = async (url) => {
      if (String(url).includes('models_manifest.json')) {
        return { ok: false }; // force remote worklet fetch + Blob URL
      }
      return { ok: true, text: async () => 'class P {} registerProcessor("p", P);' };
    };

    const OrigCtx = globalThis.window.AudioContext;
    class SlowWorkletAudioContext extends OrigCtx {
      constructor(opts) {
        super(opts);
        this.audioWorklet = {
          addModule: async () => {
            await new Promise(r => setTimeout(r, 60));
          },
        };
      }
    }
    globalThis.window.AudioContext = SlowWorkletAudioContext;
    globalThis.window.webkitAudioContext = SlowWorkletAudioContext;

    // Case 1: overlapping start('kn') -> 25ms (mid-addModule) -> start('hi') -> 15ms -> destroy()
    const ctrl1 = sttMod.createSwanadaSttController();
    const p1 = ctrl1.start('kn');
    await new Promise(r => setTimeout(r, 25));
    const p2 = ctrl1.start('hi');
    await new Promise(r => setTimeout(r, 15));
    await ctrl1.destroy();
    await Promise.all([p1, p2]);

    assert.strictEqual(
      tracks.filter(t => !t.stopped).length,
      0,
      'Overlapping start() mid-addModule followed by destroy() must leave 0 active tracks'
    );
    assert.strictEqual(env.blobs.size, 0, 'Must leave 0 unrevoked Blob URLs after overlapping start/destroy');

    // Case 2: consecutive start('kn') -> start('hi') -> stop()
    const ctrl2 = sttMod.createSwanadaSttController();
    await ctrl2.start('kn');
    await ctrl2.start('hi');
    assert.strictEqual(
      tracks.filter(t => !t.stopped).length,
      1,
      'Consecutive start() must stop prior active track and keep only the latest track active'
    );
    await ctrl2.stop();
    assert.strictEqual(
      tracks.filter(t => !t.stopped).length,
      0,
      'stop() after consecutive start() calls must leave 0 active tracks'
    );
    await ctrl2.destroy();
    assert.strictEqual(env.blobs.size, 0, 'Must leave 0 unrevoked Blob URLs after consecutive start/stop/destroy');
  });

  it('S18 — stop() re-checks sessionSeq/isStreaming after async audioCtx.suspend() before calling finishStream()', async () => {
    const tracks = [];
    navigator.mediaDevices.getUserMedia = async () => {
      const track = {
        id: tracks.length + 1,
        stopped: false,
        stop() {
          if (!this.stopped) {
            this.stopped = true;
            stoppedTrackCount++;
          }
        },
      };
      tracks.push(track);
      return { getTracks: () => [track] };
    };

    const OrigCtx = globalThis.window.AudioContext;
    class SlowSuspendAudioContext extends OrigCtx {
      async suspend() {
        this.suspendCalls++;
        await new Promise(r => setTimeout(r, 40));
        if (this.state !== 'closed') {
          this.state = 'suspended';
        }
      }
    }
    globalThis.window.AudioContext = SlowSuspendAudioContext;
    globalThis.window.webkitAudioContext = SlowSuspendAudioContext;

    const ctrl = sttMod.createSwanadaSttController();
    await ctrl.start('kn');
    const ctx = audioCtxInstances[0];

    // stop() takes ~60ms flush + 40ms suspend(); start('hi') runs during suspend()
    const pStop = ctrl.stop();
    await new Promise(r => setTimeout(r, 70));
    const pRestart = ctrl.start('hi');
    await Promise.all([pStop, pRestart]);

    assert.strictEqual(
      globalThis.__swanadaFinishStreamCalls,
      0,
      'Stale stop() waking after slow suspend() must NOT call finishStream() on restarted session'
    );
    assert.strictEqual(tracks.filter(t => !t.stopped).length, 1, 'Restarted session track must stay active');
    assert.strictEqual(ctx.state, 'running');

    await ctrl.destroy();
    assert.strictEqual(tracks.filter(t => !t.stopped).length, 0);
  });

  it('S19 (S-6) — fast getUserMedia() + slow ensureEngine() stops track immediately on stop()/destroy() and prevents simultaneous mic tracks', async () => {
    globalThis.__swanadaInitDelayMs = 80;

    let activeTracks = 0;
    let maxSimultaneousActiveTracks = 0;
    navigator.mediaDevices.getUserMedia = async () => {
      await new Promise(r => setTimeout(r, 5));
      const track = {
        stopped: false,
        stop() {
          if (!this.stopped) {
            this.stopped = true;
            activeTracks--;
            stoppedTrackCount++;
          }
        },
      };
      activeTracks++;
      if (activeTracks > maxSimultaneousActiveTracks) {
        maxSimultaneousActiveTracks = activeTracks;
      }
      return { getTracks: () => [track] };
    };

    // (a) start('kn') -> 15ms -> await ctrl.stop() -> activeRightAfterStop === 0
    const ctrlA = sttMod.createSwanadaSttController();
    const pA = ctrlA.start('kn');
    await new Promise(r => setTimeout(r, 15));
    await ctrlA.stop();
    const activeRightAfterStop = activeTracks;
    assert.strictEqual(activeRightAfterStop, 0, 'stop() while ensureEngine() is pending must stop fast-acquired mic track immediately');
    await pA;
    assert.strictEqual(activeTracks, 0);
    await ctrlA.destroy();

    // (b) start('kn') -> 15ms -> await ctrl.destroy() -> activeRightAfterDestroy === 0
    const ctrlB = sttMod.createSwanadaSttController();
    const pB = ctrlB.start('kn');
    await new Promise(r => setTimeout(r, 15));
    await ctrlB.destroy();
    const activeRightAfterDestroy = activeTracks;
    assert.strictEqual(activeRightAfterDestroy, 0, 'destroy() while ensureEngine() is pending must stop fast-acquired mic track immediately');
    await pB;
    assert.strictEqual(activeTracks, 0);

    // (c) start('kn') -> 15ms -> await ctrl.stop() -> start('hi') -> maxSimultaneousActiveTracks <= 1
    maxSimultaneousActiveTracks = 0;
    const ctrlC = sttMod.createSwanadaSttController();
    const pC1 = ctrlC.start('kn');
    await new Promise(r => setTimeout(r, 15));
    await ctrlC.stop();
    const pC2 = ctrlC.start('hi');
    await Promise.all([pC1, pC2]);
    assert.ok(maxSimultaneousActiveTracks <= 1, `Restart after early stop must keep maxSimultaneousActiveTracks <= 1 (got ${maxSimultaneousActiveTracks})`);
    assert.strictEqual(activeTracks, 1);
    await ctrlC.destroy();
    assert.strictEqual(activeTracks, 0);

    // Also verify overlapping start('kn') -> 15ms -> start('hi') without stop() never exceeds 1 live track
    maxSimultaneousActiveTracks = 0;
    const ctrlD = sttMod.createSwanadaSttController();
    const pD1 = ctrlD.start('kn');
    await new Promise(r => setTimeout(r, 15));
    const pD2 = ctrlD.start('hi');
    await Promise.all([pD1, pD2]);
    assert.ok(maxSimultaneousActiveTracks <= 1, `Overlapping start() must keep maxSimultaneousActiveTracks <= 1 (got ${maxSimultaneousActiveTracks})`);
    await ctrlD.destroy();
    assert.strictEqual(activeTracks, 0);
  });

  it('S20 — fatal workerClient error firing mid-ensureWorkletLoaded() stops streaming, releases mic tracks, and revokes all blobs', async () => {
    let activeTracks = 0;
    navigator.mediaDevices.getUserMedia = async () => {
      const track = {
        stopped: false,
        stop() {
          if (!this.stopped) {
            this.stopped = true;
            activeTracks--;
            stoppedTrackCount++;
          }
        },
      };
      activeTracks++;
      return { getTracks: () => [track] };
    };

    globalThis.fetch = async (url) => {
      if (String(url).includes('models_manifest.json')) {
        return { ok: false }; // exercise worker & worklet Blob URL creation + revocation
      }
      return { ok: true, text: async () => 'class P {} registerProcessor("p", P);' };
    };

    let workletNodesCreated = 0;
    const BaseWorkletNode = globalThis.AudioWorkletNode;
    globalThis.AudioWorkletNode = class CountingWorkletNode extends BaseWorkletNode {
      constructor(ctx, name, opts) {
        workletNodesCreated++;
        super(ctx, name, opts);
      }
    };

    let notifyAddModuleEntered;
    const addModuleEntered = new Promise((resolve) => {
      notifyAddModuleEntered = resolve;
    });
    let releaseAddModule;
    const addModuleGate = new Promise((resolve) => {
      releaseAddModule = resolve;
    });

    const OrigCtx = globalThis.window.AudioContext;
    class GatedWorkletAudioContext extends OrigCtx {
      constructor(opts) {
        super(opts);
        this.audioWorklet = {
          addModule: async () => {
            notifyAddModuleEntered();
            await addModuleGate;
          },
        };
      }
    }
    globalThis.window.AudioContext = GatedWorkletAudioContext;
    globalThis.window.webkitAudioContext = GatedWorkletAudioContext;

    const receivedErrors = [];
    const ctrl = sttMod.createSwanadaSttController();
    ctrl.on('error', (err) => receivedErrors.push(err));

    const pStart = ctrl.start('kn');
    await addModuleEntered;

    // Trigger fatal workerClient error while addModule() is pending
    const client = globalThis.__swanadaWorkerClients[0];
    client._handlers.get('error')({ fatal: true, message: 'WASM OOM' });

    assert.strictEqual(receivedErrors.length, 1);
    assert.strictEqual(activeTracks, 0, 'Fatal error mid-addModule must release active mic tracks');

    releaseAddModule();
    await pStart;

    assert.strictEqual(activeTracks, 0, 'Post-addModule guard must leave 0 active tracks');
    assert.strictEqual(workletNodesCreated, 0, 'Must not instantiate AudioWorkletNode after fatal worker error');
    assert.strictEqual(fallbackScriptProcCount, 0, 'Must not attach ScriptProcessor fallback after fatal worker error');

    // Verify controller is no longer streaming: stop() must NOT call finishStream()
    await ctrl.stop();
    assert.strictEqual(globalThis.__swanadaFinishStreamCalls, 0, 'isStreaming must be false after fatal error mid-addModule');

    await ctrl.destroy();
    assert.strictEqual(activeTracks, 0);
    assert.strictEqual(env.blobs.size, 0, 'All Blob URLs must be revoked after fatal error and destroy()');
  });

  it('S21 — fatal workerClient error mid-ensureEngine() while client.init() hangs drops active tracks to 0 and allows recovery start() without deadlock', async () => {
    let activeTracks = 0;
    let notifyGumResolved;
    const gumResolved = new Promise((resolve) => {
      notifyGumResolved = resolve;
    });
    navigator.mediaDevices.getUserMedia = async () => {
      const track = {
        stopped: false,
        stop() {
          if (!this.stopped) {
            this.stopped = true;
            activeTracks--;
            stoppedTrackCount++;
          }
        },
      };
      activeTracks++;
      notifyGumResolved();
      return { getTracks: () => [track] };
    };

    let initCallIndex = 0;
    let notifyInit1Entered;
    const init1Entered = new Promise((resolve) => {
      notifyInit1Entered = resolve;
    });
    globalThis.__swanadaOnInit = async () => {
      initCallIndex++;
      if (initCallIndex === 1) {
        notifyInit1Entered();
        await new Promise(() => {}); // Simulate terminated worker whose init() RPC never settles
      }
    };

    const receivedErrors = [];
    const ctrl = sttMod.createSwanadaSttController();
    ctrl.on('error', (err) => receivedErrors.push(err));

    const pHungStart = ctrl.start('kn');
    pHungStart.catch(() => {});
    await Promise.all([init1Entered, gumResolved]);

    const client1 = globalThis.__swanadaWorkerClients[0];
    client1._handlers.get('error')({ fatal: true, message: 'OOM' });

    assert.strictEqual(receivedErrors.length, 1);
    assert.strictEqual(receivedErrors[0].message, 'OOM');
    assert.strictEqual(client1.terminated, true);
    assert.strictEqual(activeTracks, 0, 'Fatal error mid-ensureEngine() must immediately stop pending mic tracks');

    // Recovery start() must NOT deadlock waiting on hung client1.init()
    await Promise.race([
      ctrl.start('hi'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Recovery ctrl.start() deadlocked on stale activeInitPromise')), 400)),
    ]);

    assert.strictEqual(globalThis.__swanadaWorkerClients.length, 2, 'Recovery start() must boot a fresh SwanadaWorkerClient');
    assert.ok(activeTracks >= 1, `Recovery start() must acquire an active mic track (got ${activeTracks})`);
    assert.strictEqual(globalThis.__swanadaStartStreamCalls, 1, 'Recovery start() must startStream() on the new client');

    await ctrl.destroy();
    assert.strictEqual(activeTracks, 0);
    assert.strictEqual(globalThis.__swanadaWorkerClients[1].terminated, true);
    assert.strictEqual(env.blobs.size, 0);
  });

  it('S22 — fatal workerClient error mid-pendingCtxSuspend / resume() / ensureWorkletLoaded() and localSource throw leave AudioContext suspended without calling stop() and recover cleanly', async () => {
    let activeTracks = 0;
    navigator.mediaDevices.getUserMedia = async () => {
      const track = {
        stopped: false,
        stop() {
          if (!this.stopped) {
            this.stopped = true;
            activeTracks--;
            stoppedTrackCount++;
          }
        },
      };
      activeTracks++;
      return { getTracks: () => [track] };
    };

    let sourceCalls = 0;
    let sourceCalledWithStoppedTrack = false;
    let throwOnCreateSource = false;
    let throwOnSinkConnect = false;
    let workletNodesCreated = 0;

    const BaseWorkletNode = globalThis.AudioWorkletNode;
    globalThis.AudioWorkletNode = class CountingWorkletNode extends BaseWorkletNode {
      constructor(ctx, name, opts) {
        workletNodesCreated++;
        super(ctx, name, opts);
      }
    };

    let suspendGate = null;
    let notifySuspendEntered = null;
    let resumeGate = null;
    let notifyResumeEntered = null;
    let addModuleGate = null;
    let notifyAddModuleEntered = null;

    const OrigCtx = globalThis.window.AudioContext;
    class LifecycleGateAudioContext extends OrigCtx {
      constructor(opts) {
        super(opts);
        this.audioWorklet = {
          addModule: async () => {
            if (notifyAddModuleEntered) notifyAddModuleEntered();
            if (addModuleGate) await addModuleGate;
          },
        };
      }
      createMediaStreamSource(stream) {
        sourceCalls++;
        if (stream.getTracks().some(t => t.stopped)) {
          sourceCalledWithStoppedTrack = true;
        }
        if (throwOnCreateSource) {
          throw new Error('Source creation failed');
        }
        return super.createMediaStreamSource(stream);
      }
      createGain() {
        const gainNode = super.createGain();
        const origConnect = gainNode.connect.bind(gainNode);
        gainNode.connect = (...args) => {
          if (throwOnSinkConnect) {
            throw new Error('Sink connect failed');
          }
          return origConnect(...args);
        };
        return gainNode;
      }
      async suspend() {
        this.suspendCalls++;
        if (notifySuspendEntered) notifySuspendEntered();
        if (suspendGate) await suspendGate;
        if (this.state !== 'closed') {
          this.state = 'suspended';
        }
      }
      async resume() {
        this.resumeCalls++;
        if (notifyResumeEntered) notifyResumeEntered();
        if (resumeGate) await resumeGate;
        if (this.state !== 'closed') {
          this.state = 'running';
        }
      }
    }
    globalThis.window.AudioContext = LifecycleGateAudioContext;
    globalThis.window.webkitAudioContext = LifecycleGateAudioContext;

    // (a) Fatal workerClient error mid-pendingCtxSuspend
    {
      const ctrl = sttMod.createSwanadaSttController();
      await ctrl.start('kn');
      const ctx = audioCtxInstances[audioCtxInstances.length - 1];

      let releaseSuspend;
      suspendGate = new Promise((r) => { releaseSuspend = r; });
      const suspendEntered = new Promise((r) => { notifySuspendEntered = r; });
      const pStop = ctrl.stop();
      await suspendEntered;

      const pStart2 = ctrl.start('hi');
      await new Promise(r => setTimeout(r, 15));

      const sourcesBeforeFatal = sourceCalls;
      const resumesBeforeFatal = ctx.resumeCalls;
      const client1 = globalThis.__swanadaWorkerClients[globalThis.__swanadaWorkerClients.length - 1];
      client1._handlers.get('error')({ fatal: true, message: 'OOM mid-suspend' });
      assert.strictEqual(activeTracks, 0);

      releaseSuspend();
      suspendGate = null;
      notifySuspendEntered = null;
      await Promise.all([pStop, pStart2]);

      assert.strictEqual(ctx.state, 'suspended', '(a) AudioContext must be suspended after start() settles on fatal error mid-pendingCtxSuspend');
      assert.strictEqual(ctx.resumeCalls, resumesBeforeFatal, '(a) start() must NOT call resume() after fatal error mid-pendingCtxSuspend');
      assert.strictEqual(sourceCalls, sourcesBeforeFatal, '(a) start() must NOT call createMediaStreamSource() on already-stopped tracks');
      assert.strictEqual(sourceCalledWithStoppedTrack, false);

      await ctrl.start('ta');
      assert.strictEqual(activeTracks, 1, '(a) subsequent recovery start() must succeed');
      assert.strictEqual(ctx.state, 'running');
      await ctrl.destroy();
      assert.strictEqual(activeTracks, 0);
    }

    // (b) Fatal workerClient error mid-targetCtx.resume()
    {
      const ctrl = sttMod.createSwanadaSttController();
      await ctrl.start('kn');
      await ctrl.stop();
      const ctx = audioCtxInstances[audioCtxInstances.length - 1];
      assert.strictEqual(ctx.state, 'suspended');

      let releaseResume;
      resumeGate = new Promise((r) => { releaseResume = r; });
      const resumeEntered = new Promise((r) => { notifyResumeEntered = r; });
      const pStart2 = ctrl.start('hi');
      await resumeEntered;

      const sourcesBeforeFatal = sourceCalls;
      const client1 = globalThis.__swanadaWorkerClients[globalThis.__swanadaWorkerClients.length - 1];
      client1._handlers.get('error')({ fatal: true, message: 'OOM mid-resume' });
      assert.strictEqual(activeTracks, 0);

      releaseResume();
      resumeGate = null;
      notifyResumeEntered = null;
      await pStart2;

      assert.strictEqual(ctx.state, 'suspended', '(b) AudioContext must be suspended immediately after start() settles without calling stop()');
      assert.strictEqual(sourceCalls, sourcesBeforeFatal, '(b) start() must NOT call createMediaStreamSource() after fatal error mid-resume()');
      assert.strictEqual(sourceCalledWithStoppedTrack, false);

      await ctrl.start('ta');
      assert.strictEqual(activeTracks, 1, '(b) subsequent recovery start() must succeed');
      assert.strictEqual(ctx.state, 'running');
      await ctrl.destroy();
      assert.strictEqual(activeTracks, 0);
    }

    // (c) Fatal workerClient error mid-ensureWorkletLoaded()
    {
      workletNodesCreated = 0;
      let releaseAddModule;
      addModuleGate = new Promise((r) => { releaseAddModule = r; });
      const addModuleEntered = new Promise((r) => { notifyAddModuleEntered = r; });

      const ctrl = sttMod.createSwanadaSttController();
      const pStart = ctrl.start('kn');
      await addModuleEntered;

      const ctx = audioCtxInstances[audioCtxInstances.length - 1];
      const client1 = globalThis.__swanadaWorkerClients[globalThis.__swanadaWorkerClients.length - 1];
      client1._handlers.get('error')({ fatal: true, message: 'OOM mid-addModule' });

      releaseAddModule();
      addModuleGate = null;
      notifyAddModuleEntered = null;
      await pStart;

      assert.strictEqual(ctx.state, 'suspended', '(c) AudioContext must be suspended immediately after start() settles without calling stop()');
      assert.strictEqual(activeTracks, 0);
      assert.strictEqual(workletNodesCreated, 0);
      assert.strictEqual(fallbackScriptProcCount, 0);

      await ctrl.start('hi');
      assert.strictEqual(activeTracks, 1, '(c) subsequent recovery start() must succeed');
      assert.strictEqual(ctx.state, 'running');
      await ctrl.destroy();
      assert.strictEqual(activeTracks, 0);
    }

    // (d) Synchronous throw in localSource/localSink creation
    {
      const ctrl = sttMod.createSwanadaSttController();
      throwOnCreateSource = true;
      await assert.rejects(() => ctrl.start('kn'), /Source creation failed/);

      const ctx = audioCtxInstances[audioCtxInstances.length - 1];
      assert.strictEqual(ctx.state, 'suspended', '(d) AudioContext must be suspended after synchronous throw in localSource without calling stop()');
      assert.strictEqual(activeTracks, 0);

      throwOnCreateSource = false;
      throwOnSinkConnect = true;
      await assert.rejects(() => ctrl.start('kn'), /Sink connect failed/);
      assert.strictEqual(ctx.state, 'suspended', '(d) AudioContext must be suspended after synchronous throw in localSink.connect() without calling stop()');
      assert.strictEqual(activeTracks, 0);

      throwOnSinkConnect = false;
      await ctrl.start('hi');
      assert.strictEqual(activeTracks, 1, '(d) subsequent recovery start() must succeed');
      assert.strictEqual(ctx.state, 'running');
      await ctrl.destroy();
      assert.strictEqual(activeTracks, 0);
    }

    assert.strictEqual(env.blobs.size, 0);
  });
});
