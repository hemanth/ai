/**
 * Test Suite: Real worker.js Mobile WASM & LRU Memory Disposal Verification
 * Registers an ESM loader hook for the CDN Transformers.js URL so the real
 * worker.js module runs directly inside Node.js against a controlled mock runtime.
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3') {
      return { shortCircuit: true, url: 'mock:transformers' };
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url === 'mock:transformers') {
      return {
        shortCircuit: true,
        format: 'module',
        source: `
          export const env = {
            allowLocalModels: true,
            backends: {
              onnx: {
                wasm: {
                  numThreads: 4,
                  wasmPaths: undefined,
                }
              }
            }
          };
          export async function pipeline(task, modelId, options) {
            globalThis.__workerPipelineCalls = globalThis.__workerPipelineCalls || [];
            globalThis.__workerPipelineCalls.push({ task, modelId, options });
            const instance = async (text, genOpts) => [{ translation_text: 'tr:' + modelId + ':' + text }];
            instance.modelId = modelId;
            instance.disposed = false;
            instance.dispose = async () => {
              instance.disposed = true;
              globalThis.__workerDisposedModels = globalThis.__workerDisposedModels || [];
              globalThis.__workerDisposedModels.push(modelId);
            };
            return instance;
          }
        `,
      };
    }
    return nextLoad(url, context);
  },
});

describe('worker.js — Mobile WASM Threading, Session Options & LRU Disposal', () => {
  let workerModule;
  let transformersMock;
  let postedMessages;
  let messageListener;

  before(async () => {
    postedMessages = [];
    globalThis.__workerPipelineCalls = [];
    globalThis.__workerDisposedModels = [];

    globalThis.self = {
      postMessage: (msg) => postedMessages.push(msg),
      addEventListener: (type, fn) => {
        if (type === 'message') messageListener = fn;
      },
    };
    globalThis.crossOriginIsolated = true;

    transformersMock = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3');
    workerModule = await import('../worker.js');
  });

  async function sendWorkerMessage(data) {
    assert.ok(messageListener, 'worker.js must register a message listener');
    await messageListener({ data });
    // Allow queued sequential task to settle
    await new Promise(r => setTimeout(r, 15));
  }

  it('W1 — configures numThreads = 1 and arena-free session_options on mobile even under crossOriginIsolated', async () => {
    postedMessages.length = 0;
    globalThis.__workerPipelineCalls.length = 0;
    transformersMock.env.backends.onnx.wasm.numThreads = 4;

    await sendWorkerMessage({
      action: 'load-translation-model',
      language: 'kn',
      modelId: 'udgamlabs/Paar-en-kn',
      runtimeHints: {
        isMobile: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 10 Pro XL)',
        deviceMemory: 4,
      },
    });

    assert.strictEqual(
      transformersMock.env.backends.onnx.wasm.numThreads,
      1,
      'Mobile worker must force numThreads = 1 even when crossOriginIsolated === true'
    );
    assert.strictEqual(
      transformersMock.env.backends.onnx.wasm.wasmPaths,
      undefined,
      'Must NOT redirect Transformers.js wasmPaths to /ai/swanada/ort/'
    );

    const call = globalThis.__workerPipelineCalls.at(-1);
    assert.strictEqual(call.modelId, 'udgamlabs/Paar-en-kn');
    assert.strictEqual(call.options.dtype, 'q8');
    assert.deepStrictEqual(
      call.options.session_options,
      { enableCpuMemArena: false, enableMemPattern: false },
      'Mobile pipeline must pass enableCpuMemArena: false and enableMemPattern: false'
    );
  });

  it('W2 — enforces LRU capacity = 1 on mobile and calls dispose() before loading next language', async () => {
    globalThis.__workerDisposedModels.length = 0;
    postedMessages.length = 0;

    // Load a new language ('hi') on mobile — must dispose 'udgamlabs/Paar-en-kn'
    await sendWorkerMessage({
      action: 'translate',
      id: 'req-hi-1',
      targetLang: 'hi',
      text: 'Hello',
      runtimeHints: { isMobile: true, deviceMemory: 4 },
    });

    assert.ok(
      globalThis.__workerDisposedModels.includes('udgamlabs/Paar-en-kn'),
      'Switching to Hindi on mobile must dispose the previous Kannada pipeline'
    );
    assert.ok(
      postedMessages.some(m => m.type === 'model-evicted' && m.language === 'kn'),
      'Worker should emit model-evicted for evicted language'
    );
    assert.ok(
      postedMessages.some(m => m.type === 'translation-result' && m.id === 'req-hi-1'),
      'Hindi translation must complete cleanly after evicting Kannada'
    );
    if (typeof workerModule.getLoadedPipelineCount === 'function') {
      assert.strictEqual(workerModule.getLoadedPipelineCount(), 1, 'Mobile LRU must retain at most 1 pipeline');
    }
  });

  it('W3 — allows multi-threaded WASM and LRU capacity = 3 on desktop under crossOriginIsolated', async () => {
    globalThis.__workerDisposedModels.length = 0;
    globalThis.__workerPipelineCalls.length = 0;
    transformersMock.env.backends.onnx.wasm.numThreads = 1;

    await sendWorkerMessage({
      action: 'load-translation-model',
      language: 'ta',
      modelId: 'udgamlabs/Paar-en-ta',
      runtimeHints: { isMobile: false, hardwareConcurrency: 8, deviceMemory: 16 },
    });

    assert.ok(
      transformersMock.env.backends.onnx.wasm.numThreads > 1,
      'Desktop worker under crossOriginIsolated should enable multi-threaded WASM'
    );
    const taCall = globalThis.__workerPipelineCalls.at(-1);
    assert.strictEqual(taCall.options.session_options, undefined, 'Desktop pipeline does not disable CPU arena');

    // Load te and ml -> total 3 active pipelines (hi from W2 + ta + te), wait: hi was loaded earlier, then ta, te -> 3 total, then ml evicts hi!
    await sendWorkerMessage({
      action: 'load-translation-model',
      language: 'te',
      modelId: 'udgamlabs/Paar-en-te',
      runtimeHints: { isMobile: false, hardwareConcurrency: 8, deviceMemory: 16 },
    });
    assert.strictEqual(workerModule.getLoadedPipelineCount(), 3);
    assert.strictEqual(globalThis.__workerDisposedModels.length, 0);

    await sendWorkerMessage({
      action: 'load-translation-model',
      language: 'ml',
      modelId: 'udgamlabs/Paar-en-ml',
      runtimeHints: { isMobile: false, hardwareConcurrency: 8, deviceMemory: 16 },
    });
    assert.strictEqual(workerModule.getLoadedPipelineCount(), 3, 'Desktop LRU capacity must stay bounded at 3');
    assert.ok(
      globalThis.__workerDisposedModels.includes('udgamlabs/Paar-en-hi'),
      'Loading 4th language on desktop must evict & dispose least-recently-used pipeline (hi)'
    );
  });
});
