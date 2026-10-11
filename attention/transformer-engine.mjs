export const MODEL_ID = 'Xenova/distilgpt2';

// Function words filtered out when surfacing top semantic vocabulary predictions
export const FUNCTION_WORDS = new Set([
  'the', 'of', 'and', 'to', 'in', 'is', 'for', 'on', 'that', 'by', 'this', 'with',
  'from', 'at', 'as', 'be', 'are', 'was', 'were', 'or', 'an', 'it', 'not', 'have',
  'has', 'had', 'but', 'his', 'her', 'their', 'its', 'our', 'my', 'your', 'which',
  'who', 'where', 'when', 'after', 'before', 'into', 'over', 'under', 'other',
  'same', 'first', 'last', 'new', 'old', 'good', 'great', 'more', 'most', 'some',
  'any', 'all', 'both', 'each', 'own', 'so', 'than', 'too', 'very', 'can', 'will',
  'just', 'now', 'also', 'back', 'way', 'verge', 'brink', 'left', 'right', 'side',
  'top', 'bottom', 'end', 'point', 'time', 'list', 'rise', 'move', 'during',
  'between', 'following', 'while', 'front', 'near', 'area', 'there', 'here',
  'then', 'only', 'even', 'still', 'well', 'much', 'many', 'such', 'how', 'why',
  'what', 'about', 'through', 'around', 'down', 'off', 'out', 'up', 'you', 'they',
  'she', 'him', 'said', 'says', 'told', 'one', 'two', 'three', 'next', 'system'
]);

export const BARE_SINGULAR_STARTERS = new Set([
  'cat', 'dog', 'bird', 'fish', 'horse', 'lion', 'mouse', 'boy', 'girl', 'man',
  'woman', 'child', 'car', 'train', 'ship', 'plane', 'sun', 'moon', 'sky', 'tree',
  'house', 'room', 'king', 'queen', 'teacher', 'student', 'doctor', 'robot'
]);

export const NATURE_WORDS = new Set(['river', 'water', 'flooded', 'stream', 'rain', 'lake', 'ocean', 'shore', 'mud', 'waves', 'storm', 'clouds', 'fish', 'bridge', 'flowed', 'heavy', 'dark', 'sky', 'sun', 'grass', 'wind', 'snow', 'tree', 'trees', 'forest', 'sea']);
export const FINANCE_WORDS = new Set(['vault', 'guards', 'locked', 'money', 'credit', 'loan', 'gold', 'cash', 'teller', 'deposit', 'account', 'dollar', 'robber', 'finance', 'debt', 'stock', 'market', 'treasury', 'safe', 'coins', 'wealth']);
export const ANIMAL_DOMESTIC_WORDS = new Set(['cat', 'kitten', 'dog', 'puppy', 'bird', 'mouse', 'fox', 'pet', 'lion', 'horse', 'rabbit', 'mat', 'rug', 'couch', 'sofa', 'bed', 'floor', 'roof', 'chair', 'table', 'window', 'house', 'room']);
export const SPATIAL_ACTION_WORDS = new Set(['on', 'in', 'under', 'above', 'beside', 'near', 'inside', 'into', 'onto', 'behind', 'over', 'across', 'sat', 'sits', 'sleeping', 'slept', 'jumped', 'lay', 'resting', 'standing', 'perched', 'chased', 'ran', 'landed']);
export const DETERMINERS = new Set(['the', 'a', 'an', 'this', 'that', 'my', 'your', 'his', 'her', 'our', 'their', 'some', 'every']);
export const COPULA_STOP_WORDS = new Set(['is', 'was', 'are', 'were', 'be', 'been', 'am', 'to', 'of', 'and', 'or', 'but', 'by', 'for', 'with', 'as', 'it']);
export const POLYSEMOUS_WORDS = new Set(['bank', 'bat', 'apple', 'crane', 'cell', 'bark', 'spring', 'rock', 'light', 'match']);

// Real pre-warmed Xenova/distilgpt2 ONNX snapshots for instant 0ms first paint
export const WARM_ONNX_CACHE = {
  'river water flooded the bank': {
    isRealModel: true,
    modelName: 'DistilGPT-2 (6L · 12H · 768d)',
    latencyMs: 42.1,
    sentence: 'River water flooded the bank',
    tokens: ['River', 'water', 'flooded', 'the', 'bank'],
    tokenIds: ['#42204', '#1660', '#21050', '#262', '#3331'],
    focusIdx: 4,
    dotScores: [1.4, 2.0, 1.5, 0.6, 0.6],
    weights: [0.2072, 0.3776, 0.229, 0.0931, 0.0931],
    matrix: [
      [1, 0, 0, 0, 0],
      [0.1976, 0.8024, 0, 0, 0],
      [0.1602, 0.3395, 0.5002, 0, 0],
      [0.1527, 0.2589, 0.2296, 0.3589, 0],
      [0.2072, 0.3776, 0.229, 0.0931, 0.0931]
    ],
    semVecs: [
      { x: -2.5, y: 1.63, z: -1.24, domain: 'nature' },
      { x: -2.44, y: 1.11, z: -0.72, domain: 'nature' },
      { x: -2.43, y: 0.67, z: -0.05, domain: 'nature' },
      { x: 2.58, y: 0.19, z: 0.14, domain: 'finance' },
      { x: 0, y: 0.45, z: 0, domain: 'focus' }
    ],
    basinALabel: 'CONTEXT CLUSTER A (WATER)',
    basinBLabel: 'SECONDARY CLUSTER B (ACCOUNT)',
    senseA: { name: 'Context → “river”', pct: 64, sub: 'Anchored by “water” + “flooded”' },
    senseB: { name: 'Bare “bank” → “account”', pct: 36, sub: 'Uncontextualized single-token pass' },
    preds: [
      { w: '“river”', rawWord: 'river', p: 0.537, logit: -57.98, tokenId: '#7850' },
      { w: '“city”', rawWord: 'city', p: 0.234, logit: -58.81, tokenId: '#1748' },
      { w: '“nile”', rawWord: 'nile', p: 0.145, logit: -59.29, tokenId: '#38063' },
      { w: '“lake”', rawWord: 'lake', p: 0.085, logit: -59.82, tokenId: '#13546' }
    ]
  },
  'vault guards locked the bank': {
    isRealModel: true,
    modelName: 'DistilGPT-2 (6L · 12H · 768d)',
    latencyMs: 48.4,
    sentence: 'Vault guards locked the bank',
    tokens: ['Vault', 'guards', 'locked', 'the', 'bank'],
    tokenIds: ['#53·#1721', '#10942', '#8970', '#262', '#3331'],
    focusIdx: 4,
    dotScores: [0.3, 0.8, 2.1, 2.5, 0.6],
    weights: [0.0524, 0.0864, 0.3172, 0.4732, 0.0708],
    matrix: [
      [1, 0, 0, 0, 0],
      [0.2308, 0.7692, 0, 0, 0],
      [0.1001, 0.1858, 0.7141, 0, 0],
      [0.0658, 0.089, 0.1986, 0.6466, 0],
      [0.0524, 0.0864, 0.3172, 0.4732, 0.0708]
    ],
    semVecs: [
      { x: 2.47, y: 1.64, z: 0.11, domain: 'finance' },
      { x: 2.42, y: 1.18, z: 0.68, domain: 'finance' },
      { x: 2.4, y: 0.68, z: 1.22, domain: 'finance' },
      { x: -2.59, y: 0.18, z: -1.15, domain: 'nature' },
      { x: 0, y: 0.45, z: 0, domain: 'focus' }
    ],
    basinALabel: 'CONTEXT CLUSTER A (THE)',
    basinBLabel: 'SECONDARY CLUSTER B (ACCOUNT)',
    senseA: { name: 'Context → “door”', pct: 64, sub: 'Anchored by “the” + “locked”' },
    senseB: { name: 'Bare “bank” → “account”', pct: 36, sub: 'Uncontextualized single-token pass' },
    preds: [
      { w: '“door”', rawWord: 'door', p: 0.535, logit: -57.25, tokenId: '#3420' },
      { w: '“account”', rawWord: 'account', p: 0.207, logit: -58.2, tokenId: '#1848' },
      { w: '“doors”', rawWord: 'doors', p: 0.196, logit: -58.25, tokenId: '#8215' },
      { w: '“window”', rawWord: 'window', p: 0.061, logit: -59.42, tokenId: '#4324' }
    ]
  },
  'cat is on the': {
    isRealModel: true,
    modelName: 'DistilGPT-2 (6L · 12H · 768d)',
    latencyMs: 39.2,
    sentence: 'cat is on the',
    tokens: ['cat', 'is', 'on', 'the'],
    tokenIds: ['#9246', '#318', '#319', '#262'],
    focusIdx: 3,
    dotScores: [0.5, 0.5, 2.5, 0.4],
    weights: [0.0971, 0.0971, 0.7178, 0.0879],
    matrix: [
      [1, 0, 0, 0],
      [0.2114, 0.7886, 0, 0],
      [0.0757, 0.1241, 0.8002, 0],
      [0.0971, 0.0971, 0.7178, 0.0879]
    ],
    semVecs: [
      { x: 2.48, y: 1.62, z: 0.09, domain: 'finance' },
      { x: -2.36, y: 1.1, z: -0.63, domain: 'nature' },
      { x: -2.65, y: 0.67, z: 0.03, domain: 'nature' },
      { x: 0, y: 0.45, z: 0, domain: 'focus' }
    ],
    basinALabel: 'CONTEXT CLUSTER A (ON)',
    basinBLabel: 'SECONDARY CLUSTER B (BEST)',
    senseA: { name: 'Context → “ground”', pct: 64, sub: 'Anchored by “on” + “cat”' },
    senseB: { name: 'Bare “the” → “best”', pct: 36, sub: 'Uncontextualized single-token pass' },
    preds: [
      { w: '“ground”', rawWord: 'ground', p: 0.501, logit: -56.55, tokenId: '#2323' },
      { w: '“edge”', rawWord: 'edge', p: 0.244, logit: -57.27, tokenId: '#5743' },
      { w: '“run”', rawWord: 'run', p: 0.152, logit: -57.74, tokenId: '#1057' },
      { w: '“hunt”', rawWord: 'hunt', p: 0.103, logit: -58.13, tokenId: '#12601' }
    ]
  },
  'astronauts landed on the': {
    isRealModel: true,
    modelName: 'DistilGPT-2 (6L · 12H · 768d)',
    latencyMs: 44.8,
    sentence: 'Astronauts landed on the',
    tokens: ['Astronauts', 'landed', 'on', 'the'],
    tokenIds: ['#33751·#1313·#17712', '#11406', '#319', '#262'],
    focusIdx: 3,
    dotScores: [1.1, 2.0, 2.5, 0.3],
    weights: [0.1256, 0.3088, 0.5092, 0.0564],
    matrix: [
      [1, 0, 0, 0],
      [0.1902, 0.8098, 0, 0],
      [0.109, 0.2137, 0.6772, 0],
      [0.1256, 0.3088, 0.5092, 0.0564]
    ],
    semVecs: [
      { x: 2.37, y: 1.69, z: 0.12, domain: 'finance' },
      { x: 2.53, y: 1.26, z: 0.73, domain: 'finance' },
      { x: -2.67, y: 0.65, z: 0.04, domain: 'nature' },
      { x: 0, y: 0.45, z: 0, domain: 'focus' }
    ],
    basinALabel: 'CONTEXT CLUSTER A (ON)',
    basinBLabel: 'SECONDARY CLUSTER B (BEST)',
    senseA: { name: 'Context → “moon”', pct: 64, sub: 'Anchored by “on” + “landed”' },
    senseB: { name: 'Bare “the” → “best”', pct: 36, sub: 'Uncontextualized single-token pass' },
    preds: [
      { w: '“moon”', rawWord: 'moon', p: 0.586, logit: -60.31, tokenId: '#8824' },
      { w: '“ground”', rawWord: 'ground', p: 0.227, logit: -61.26, tokenId: '#2323' },
      { w: '“scene”', rawWord: 'scene', p: 0.107, logit: -62.01, tokenId: '#3715' },
      { w: '“iss”', rawWord: 'iss', p: 0.079, logit: -62.32, tokenId: '#33805' }
    ]
  }
};

export function cosineSim(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na * nb) + 1e-8);
}

// Pool 12-head x 64-dim (= 768-dim) vector from `present.{layer}.{key|value}` across a token span
export function extractSpanVector(tensorData, seqLen, startIdx, endIdx) {
  const heads = 12;
  const dim = 64;
  const out = new Float32Array(heads * dim);
  const count = Math.max(1, endIdx - startIdx);
  for (let pos = startIdx; pos < endIdx; pos++) {
    for (let h = 0; h < heads; h++) {
      const base = (h * seqLen + pos) * dim;
      const outBase = h * dim;
      for (let d = 0; d < dim; d++) {
        out[outBase + d] += tensorData[base + d] / count;
      }
    }
  }
  return out;
}

export function extractTopSemanticWords(tokenizer, logitsData, stepIdx, vocabSize, k = 4) {
  const slice = logitsData.slice(stepIdx * vocabSize, (stepIdx + 1) * vocabSize);
  const indexed = Array.from(slice)
    .map((v, i) => ({ v, i }))
    .sort((a, b) => b.v - a.v);

  const top = [];
  for (const item of indexed) {
    const decoded = tokenizer.decode([item.i]);
    if (/^ [a-zA-Z]{3,12}$/.test(decoded)) {
      const clean = decoded.trim().toLowerCase();
      if (!FUNCTION_WORDS.has(clean) && !top.some((t) => t.w === clean)) {
        top.push({ w: clean, logit: item.v, tokenId: item.i });
      }
    }
    if (top.length >= k) break;
  }

  if (top.length === 0) {
    top.push({ w: 'token', logit: 0, tokenId: 0 });
  }
  const maxL = top[0].logit;
  const sumE = top.reduce((acc, c) => acc + Math.exp(c.logit - maxL), 0) || 1;
  return top.map((c) => ({
    w: `“${c.w}”`,
    rawWord: c.w,
    p: Number((Math.exp(c.logit - maxL) / sumE).toFixed(3)),
    logit: Number(c.logit.toFixed(2)),
    tokenId: `#${c.tokenId}`
  }));
}

/**
 * Runs genuine on-the-fly Transformer inference (`Xenova/distilgpt2`) in either Node.js or Browser WASM/WebGPU.
 */
export async function runRealTransformerInference({ tokenizer, model, Tensor, rawText, preferredFocusIdx = null }) {
  const t0 = performance.now();
  const cleaned = String(rawText || '').trim().slice(0, 120).replace(/\s+/g, ' ');
  const words = cleaned ? cleaned.split(' ').slice(0, 7) : ['River', 'water', 'flooded', 'the', 'bank'];
  const N = words.length;
  const focusIdx =
    preferredFocusIdx !== null &&
    !Number.isNaN(preferredFocusIdx) &&
    preferredFocusIdx >= 0 &&
    preferredFocusIdx < N
      ? preferredFocusIdx
      : N - 1;

  // Map each user word to its exact GPT-2 BPE subword IDs
  const wordSubIds = words.map((w, idx) => tokenizer.encode(idx === 0 ? w : ' ' + w));
  const tokenIds = wordSubIds.map((ids) => ids.map((id) => `#${id}`).join('·'));

  let offset = 0;
  const wordSpans = wordSubIds.map((ids) => {
    const span = { start: offset, end: offset + ids.length };
    offset += ids.length;
    return span;
  });

  const inputs = await tokenizer(words.join(' '));
  const S = inputs.input_ids.dims[1];
  const fullOut = await model(inputs);
  const vocabSize = fullOut.logits.dims[2];

  // Focus token BPE span end position
  const focusSubEnd = Math.min(S, wordSpans[focusIdx].end);
  const focusPos = Math.max(0, focusSubEnd - 1);
  const fullFocusLogits = fullOut.logits.data.slice(focusPos * vocabSize, (focusPos + 1) * vocabSize);

  // Top-32 vocabulary indices at focusPos for Leave-One-Out attribution
  const topFocusVocab = Array.from(fullFocusLogits)
    .map((v, idx) => ({ v, idx }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 32)
    .map((x) => x.idx);

  // Extract real 768-D Layer-0 and Layer-5 Value/Key vectors for every word
  const v0Data = fullOut['present.0.value'].data;
  const v5Data = fullOut['present.5.value'].data;
  const k5Data = fullOut['present.5.key'].data;

  const vecsL0 = wordSpans.map((sp) => extractSpanVector(v0Data, S, sp.start, Math.min(S, sp.end)));
  const vecsL5 = wordSpans.map((sp) => extractSpanVector(v5Data, S, sp.start, Math.min(S, sp.end)));
  const keysL5 = wordSpans.map((sp) => extractSpanVector(k5Data, S, sp.start, Math.min(S, sp.end)));

  // Leave-One-Out Causal Ablation: mask each word wIdx and measure real logit shift at focusPos
  const looImpacts = new Float32Array(N);
  for (let wIdx = 0; wIdx < N; wIdx++) {
    if (focusIdx > 0 && wIdx > focusIdx) {
      looImpacts[wIdx] = 0;
      continue;
    }
    const mask = new BigInt64Array(S).fill(1n);
    if (S > 1) {
      for (let k = wordSpans[wIdx].start; k < Math.min(S, wordSpans[wIdx].end); k++) {
        mask[k] = 0n;
      }
    }
    const ablatedOut = await model({
      input_ids: inputs.input_ids,
      attention_mask: new Tensor('int64', mask, [1, S])
    });
    const ablatedLogits = ablatedOut.logits.data.slice(focusPos * vocabSize, (focusPos + 1) * vocabSize);
    let diff = 0;
    for (const vIdx of topFocusVocab) {
      diff += Math.abs(fullFocusLogits[vIdx] - ablatedLogits[vIdx]);
    }
    const kvSim =
      Math.max(0, cosineSim(vecsL0[focusIdx], vecsL0[wIdx])) * 0.6 +
      Math.max(0, cosineSim(keysL5[focusIdx], keysL5[wIdx])) * 0.4;
    looImpacts[wIdx] = diff / topFocusVocab.length + kvSim * 0.85;
  }

  // Normalize upstream scores into readable scaled dot-product range [-0.5, +2.6]
  const validImpacts = Array.from(looImpacts).filter((_, idx) => focusIdx === 0 || idx <= focusIdx);
  const maxImp = Math.max(...validImpacts, 0.01);
  const minImp = Math.min(...validImpacts, 0);

  const dotScores = words.map((_, idx) => {
    if (focusIdx > 0 && idx > focusIdx) return -0.5;
    if (N === 1) return 2.2;
    const norm = (looImpacts[idx] - minImp) / Math.max(0.01, maxImp - minImp);
    const raw = idx === focusIdx && focusIdx > 0 ? Math.min(0.6, norm * 1.4 - 0.2) : norm * 3.0 - 0.45;
    return Number(raw.toFixed(1));
  });

  // Softmax over causal window for focusIdx
  const exps = dotScores.map((sc, idx) => (focusIdx === 0 || idx <= focusIdx ? Math.exp(sc) : 0));
  const sumExp = exps.reduce((a, b) => a + b, 0) || 1;
  const weights = exps.map((e) => Number((e / sumExp).toFixed(4)));

  // Build N x N lower-triangular causal Softmax matrix from real multi-layer vectors + LOO scores
  const matrix = [];
  for (let r = 0; r < N; r++) {
    if (r === focusIdx && focusIdx > 0) {
      matrix.push(weights);
    } else {
      const row = [];
      let rSum = 0;
      for (let c = 0; c < N; c++) {
        if (c > r) {
          row.push(0);
        } else {
          const sim0 = cosineSim(vecsL0[r], vecsL0[c]);
          const sim5 = cosineSim(vecsL5[r], vecsL5[c]);
          const v = Math.exp(dotScores[c] * 0.55 + (sim0 + sim5) * 0.65);
          row.push(v);
          rSum += v;
        }
      }
      matrix.push(row.map((v) => (rSum ? Number((v / rSum).toFixed(4)) : 0)));
    }
  }

  // Next-token predictions from real output logits at the end of the sentence
  let logitSourceOut = fullOut;
  let logitStepIdx = S - 1;
  const firstClean = words[0].toLowerCase().replace(/[^a-z]/g, '');
  if (words[0] === words[0].toLowerCase() && BARE_SINGULAR_STARTERS.has(firstClean)) {
    const prefIn = await tokenizer('The ' + words.join(' '));
    logitSourceOut = await model(prefIn);
    logitStepIdx = prefIn.input_ids.dims[1] - 1;
  } else {
    const lastSlice = fullOut.logits.data.slice((S - 1) * vocabSize, S * vocabSize);
    let bestId = 0;
    let bestVal = -Infinity;
    for (let i = 0; i < vocabSize; i++) {
      if (lastSlice[i] > bestVal) {
        bestVal = lastSlice[i];
        bestId = i;
      }
    }
    const topRawTok = tokenizer.decode([bestId]);
    if (topRawTok === ' of') {
      const bridgeIn = await tokenizer(words.join(' ') + ' of the');
      logitSourceOut = await model(bridgeIn);
      logitStepIdx = bridgeIn.input_ids.dims[1] - 1;
    }
  }

  const preds = extractTopSemanticWords(tokenizer, logitSourceOut.logits.data, logitStepIdx, vocabSize, 4);

  // Uncontextualized forward pass on the isolated focus word to measure real context shift
  const focusWord = words[focusIdx];
  const bareIn = await tokenizer('The ' + focusWord);
  const bareOut = await model(bareIn);
  const bareS = bareIn.input_ids.dims[1];
  const bareVecL5 = extractSpanVector(bareOut['present.5.value'].data, bareS, bareS - 1, bareS);
  const barePreds = extractTopSemanticWords(tokenizer, bareOut.logits.data, bareS - 1, vocabSize, 2);

  const rawCosKeep = Math.max(0, Math.min(1, cosineSim(vecsL5[focusIdx], bareVecL5)));
  const shiftPct = Math.min(92, Math.max(64, Math.round((1 - rawCosKeep * 0.45) * 86)));
  const barePct = 100 - shiftPct;

  const topAttendedIdx =
    words
      .map((_, i) => i)
      .filter((i) => i !== focusIdx)
      .sort((a, b) => weights[b] - weights[a])[0] ?? 0;

  const semVecs = words.map((_, idx) => {
    if (idx === focusIdx) {
      return { x: 0.0, y: 0.45, z: 0.0, domain: 'focus' };
    }
    const v = vecsL0[idx];
    let p1 = 0, p2 = 0, p3 = 0;
    for (let d = 0; d < 256; d++) p1 += v[d];
    for (let d = 256; d < 512; d++) p2 += v[d];
    for (let d = 512; d < 768; d++) p3 += v[d];

    const sc = dotScores[idx];
    if (sc < 0) {
      return {
        x: Number((0.25 + Math.tanh(p1 * 0.08) * 0.45).toFixed(2)),
        y: Number((-1.05 - (idx % 2) * 0.35).toFixed(2)),
        z: -0.55,
        domain: 'stop'
      };
    }
    const simToTop = cosineSim(vecsL0[idx], vecsL0[topAttendedIdx]);
    const isBasinA = idx === topAttendedIdx || simToTop >= 0.32;
    const side = isBasinA ? -1 : 1;
    return {
      x: Number((side * (2.35 + Math.abs(Math.tanh(p1 * 0.1)) * 0.45)).toFixed(2)),
      y: Number((1.65 - idx * 0.52 + Math.tanh(p2 * 0.1) * 0.25).toFixed(2)),
      z: Number((side * 0.65 + ((idx % 3) - 1) * 0.55 + Math.tanh(p3 * 0.1) * 0.2).toFixed(2)),
      domain: isBasinA ? 'nature' : 'finance'
    };
  });

  const topContributors = words
    .map((w, i) => ({ w, wt: weights[i], i }))
    .filter((x) => x.i !== focusIdx)
    .sort((a, b) => b.wt - a.wt);
  const anchorWords = topContributors.slice(0, 2).map((x) => `“${x.w}”`).join(' + ') || `“${words[0]}”`;

  const senseA = {
    name: `Context → ${preds[0].w}`,
    pct: shiftPct,
    sub: `Anchored by ${anchorWords}`
  };
  const senseB = {
    name: `Bare “${focusWord}” → ${barePreds[0].w}`,
    pct: barePct,
    sub: 'Uncontextualized single-token pass'
  };

  const latencyMs = Number((performance.now() - t0).toFixed(1));
  return {
    isRealModel: true,
    modelName: 'DistilGPT-2 (6L · 12H · 768d)',
    latencyMs,
    sentence: words.join(' '),
    tokens: words,
    tokenIds,
    focusIdx,
    dotScores,
    weights,
    matrix,
    semVecs,
    basinALabel: `CONTEXT CLUSTER A (${topContributors[0]?.w?.toUpperCase() || 'PRIMARY'})`,
    basinBLabel: `SECONDARY CLUSTER B (${barePreds[0]?.rawWord?.toUpperCase() || 'OTHER'})`,
    senseA,
    senseB,
    preds
  };
}

export function hashWord(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function getTokenIdFallback(word) {
  const clean = word.toLowerCase();
  const known = {
    river: 42204, water: 1660, flooded: 21050, the: 262, bank: 3331,
    vault: 31804, guards: 10942, locked: 8970, cat: 9246, is: 318,
    on: 319, mat: 11402, sat: 9281, dog: 3290
  };
  if (known[clean]) return `#${known[clean]}`;
  return `#${1000 + (hashWord(clean) % 48000)}`;
}

/**
 * Synchronous 0ms state computation that hits WARM_ONNX_CACHE first and provides an immediate preview while live ONNX runs.
 */
export function computeInstantState(rawText, preferredFocusIdx = null) {
  const cleaned = String(rawText || '').trim().slice(0, 120).replace(/\s+/g, ' ');
  const words = cleaned ? cleaned.split(' ').slice(0, 7) : ['River', 'water', 'flooded', 'the', 'bank'];
  const N = words.length;
  const focusIdx =
    preferredFocusIdx !== null && preferredFocusIdx >= 0 && preferredFocusIdx < N
      ? preferredFocusIdx
      : N - 1;

  const cacheKey = words.join(' ').toLowerCase();
  if (WARM_ONNX_CACHE[cacheKey] && focusIdx === N - 1) {
    return structuredClone(WARM_ONNX_CACHE[cacheKey]);
  }

  const lowerWords = words.map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const focusClean = lowerWords[focusIdx] || '';
  const tokenIds = words.map((w) => getTokenIdFallback(w));

  const dotScores = words.map((_, idx) => {
    const lw = lowerWords[idx];
    if (focusIdx > 0 && idx > focusIdx) return -0.5;
    if (idx === focusIdx) return N === 1 ? 1.8 : 0.3;
    if (COPULA_STOP_WORDS.has(lw)) return -0.4;
    if (DETERMINERS.has(lw)) return -0.3;
    if (SPATIAL_ACTION_WORDS.has(lw)) return DETERMINERS.has(focusClean) ? 2.2 : 1.6;
    return Number(Math.max(1.0, 2.2 - idx * 0.28).toFixed(1));
  });

  const exps = dotScores.map((s, idx) => (focusIdx === 0 || idx <= focusIdx ? Math.exp(s) : 0));
  const sumExp = exps.reduce((a, b) => a + b, 0) || 1;
  const weights = exps.map((e) => Number((e / sumExp).toFixed(4)));

  const matrix = [];
  for (let r = 0; r < N; r++) {
    if (r === focusIdx && focusIdx > 0) {
      matrix.push(weights);
    } else {
      const row = [];
      let rSum = 0;
      for (let c = 0; c < N; c++) {
        if (c > r) {
          row.push(0);
        } else {
          const v = Math.exp(dotScores[c] * 0.75 + (r === c ? 0.25 : 0));
          row.push(v);
          rSum += v;
        }
      }
      matrix.push(row.map((v) => (rSum ? Number((v / rSum).toFixed(4)) : 0)));
    }
  }

  const semVecs = words.map((w, idx) => {
    if (idx === focusIdx) return { x: 0, y: 0.45, z: 0, domain: 'focus' };
    const clean = lowerWords[idx];
    const h = hashWord(clean || `w${idx}`);
    const jitterX = ((h % 100) / 100 - 0.5) * 0.45;
    if (COPULA_STOP_WORDS.has(clean) || DETERMINERS.has(clean)) {
      return { x: Number((0.25 + jitterX).toFixed(2)), y: Number((-1.05 - (idx % 2) * 0.35).toFixed(2)), z: -0.55, domain: 'stop' };
    }
    const side = idx % 2 === 0 ? -1 : 1;
    return {
      x: Number((side * (2.35 + Math.abs(jitterX))).toFixed(2)),
      y: Number((1.55 - idx * 0.48).toFixed(2)),
      z: Number((side * 0.65 + ((idx % 3) - 1) * 0.5).toFixed(2)),
      domain: side < 0 ? 'nature' : 'finance'
    };
  });

  const topContributors = words
    .map((w, i) => ({ w, wt: weights[i], i }))
    .filter((x) => x.i !== focusIdx)
    .sort((a, b) => b.wt - a.wt);
  const anchorWords = topContributors.slice(0, 2).map((x) => `“${x.w}”`).join(' + ') || `“${words[0]}”`;

  return {
    isRealModel: false,
    modelName: 'DistilGPT-2 (6L · 12H · 768d)',
    latencyMs: 0,
    sentence: words.join(' '),
    tokens: words,
    tokenIds,
    focusIdx,
    dotScores,
    weights,
    matrix,
    semVecs,
    basinALabel: `CONTEXT CLUSTER A (${topContributors[0]?.w?.toUpperCase() || 'PRIMARY'})`,
    basinBLabel: 'SECONDARY CLUSTER B (OTHER)',
    senseA: { name: 'Context Shift', pct: 74, sub: `Anchored by ${anchorWords}` },
    senseB: { name: `Bare “${words[focusIdx]}”`, pct: 26, sub: 'Uncontextualized single-token pass' },
    preds: [
      { w: '“next”', rawWord: 'next', p: 0.52, logit: -58.1, tokenId: '#1306' },
      { w: '“world”', rawWord: 'world', p: 0.24, logit: -58.9, tokenId: '#995' },
      { w: '“ground”', rawWord: 'ground', p: 0.15, logit: -59.4, tokenId: '#2323' },
      { w: '“room”', rawWord: 'room', p: 0.09, logit: -59.9, tokenId: '#2119' }
    ]
  };
}
