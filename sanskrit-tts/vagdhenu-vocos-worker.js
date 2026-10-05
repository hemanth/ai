/* Dedicated CPU Web Worker for Vocos Neural Vocoder (runs in parallel with WebGPU DiT) */
importScripts("https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.2/dist/ort.all.min.js");

let vocosSession = null;

self.onmessage = async (e) => {
  const { id, type, modelBuffer, melData, dims } = e.data;
  try {
    if (type === "init") {
      ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.2/dist/";
      ort.env.wasm.numThreads = 1;
      ort.env.wasm.simd = true;
      vocosSession = await ort.InferenceSession.create(modelBuffer, {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all",
      });
      self.postMessage({ id, ok: true });
    } else if (type === "run") {
      const melTensor = new ort.Tensor("float32", melData, dims);
      const out = await vocosSession.run({ mel: melTensor });
      const wav = new Float32Array(out.wav.data);
      self.postMessage({ id, ok: true, wav }, [wav.buffer]);
    }
  } catch (err) {
    self.postMessage({ id, ok: false, error: String(err && err.message ? err.message : err) });
  }
};
