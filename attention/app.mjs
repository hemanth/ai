import {
  MODEL_ID,
  DETERMINERS,
  SPATIAL_ACTION_WORDS,
  COPULA_STOP_WORDS,
  POLYSEMOUS_WORDS,
  computeInstantState,
  runRealTransformerInference
} from './transformer-engine.mjs';

const THREE = window.THREE;

// Tactile Studio Monochrome Carbon + Single Signal Accent (Zero AI-Slop Rainbow)
const COLORS = {
  ivory: 0xf4f4f5,     // High-attention primary data / #1 prediction / Cluster A
  silver: 0xd4d4d8,    // Rank-2 context / strong alignment
  pewter: 0xa1a1aa,    // Secondary context / Cluster B
  steel: 0x71717a,     // Baseline token geometry
  graphite: 0x3f3f46,  // Low-weight / structural wireframe
  obsidian: 0x27272a,  // Masked tiles & grid lines
  carbon: 0x141418,    // Token block body fill
  signal: 0xe84e36     // Single intentional accent: active focused token
};

const PRED_STYLES = [
  { col: COLORS.ivory, cls: 'focal' },
  { col: COLORS.silver, cls: 'primary' },
  { col: COLORS.pewter, cls: 'muted' },
  { col: COLORS.steel, cls: 'muted' }
];

// Sanitize untrusted strings before interpolating into HTML labels or descriptions
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function decoratePreds(preds) {
  return (preds || []).map((p, i) => ({
    ...p,
    col: PRED_STYLES[i % PRED_STYLES.length].col,
    cls: PRED_STYLES[i % PRED_STYLES.length].cls
  }));
}

let state = computeInstantState('River water flooded the bank', 4);
state.preds = decoratePreds(state.preds);

const screens = Array.from(document.querySelectorAll('.step-screen'));
const rail = document.getElementById('progress-rail');
const container = document.getElementById('webgl-container');
const labelsLayer = document.getElementById('labels-layer');
const animateCol = document.getElementById('animate-column');
const sentenceInput = document.getElementById('custom-sentence-input');
const tokenBar = document.getElementById('token-bar');
const telemetryEl = document.getElementById('model-telemetry');

function scrollToStep(idx) {
  const sec = screens[idx];
  if (!sec) return;
  sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Build right-edge progress rail
screens.forEach((_, idx) => {
  const pip = document.createElement('button');
  pip.className = 'rail-pip' + (idx === 0 ? ' active' : '');
  pip.setAttribute('aria-label', `Step ${idx + 1}`);
  pip.addEventListener('click', () => scrollToStep(idx));
  rail.appendChild(pip);
});
const pips = Array.from(rail.children);

let activeStep = 0;
function updateScrollState() {
  const isMobile = window.innerWidth <= 900;
  // On mobile, the reading pane sits below the fixed top dock + fixed 3D stage
  const readingTop = isMobile ? animateCol.getBoundingClientRect().bottom : 0;
  const readingCenterY = readingTop + (window.innerHeight - readingTop) * 0.45;

  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < screens.length; i++) {
    const rect = screens[i].getBoundingClientRect();
    const midY = rect.top + rect.height * 0.5;
    const dist = Math.abs(midY - readingCenterY);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }
  activeStep = bestIdx;
  screens.forEach((s, i) => s.classList.toggle('active', i === activeStep));
  pips.forEach((p, i) => p.classList.toggle('active', i === activeStep));
}
window.addEventListener('scroll', updateScrollState, { passive: true });

// ====================================================================
// THREE.JS SCENE, CAMERA, RENDERER & STUDIO LIGHTING
// ====================================================================
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0d0d10, 0.024);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 140);
camera.position.set(0, 2.0, 14.2);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setClearColor(0x0d0d10, 1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
container.appendChild(renderer.domElement);

// Architectural Studio Lighting (Neutral Alabaster & Brushed Zinc — Zero Neon Tint)
scene.add(new THREE.AmbientLight(0xf4f4f5, 0.85));

const keyLight = new THREE.DirectionalLight(0xffffff, 1.45);
keyLight.position.set(9, 15, 12);
scene.add(keyLight);

const fillLight = new THREE.PointLight(0xd4d4d8, 1.2, 30);
fillLight.position.set(-9, 6, 7);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0xa1a1aa, 0.9, 28);
rimLight.position.set(9, -6, 6);
scene.add(rimLight);

const globalGrid = new THREE.GridHelper(26, 26, 0x27272a, 0x18181b);
globalGrid.position.y = -4.2;
globalGrid.material.transparent = true;
globalGrid.material.opacity = 0.65;
scene.add(globalGrid);

const starGeo = new THREE.BufferGeometry();
const starCount = 120;
const starPos = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  starPos[i * 3] = (Math.random() - 0.5) * 28;
  starPos[i * 3 + 1] = (Math.random() - 0.5) * 18;
  starPos[i * 3 + 2] = (Math.random() - 0.5) * 18 - 3;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const starField = new THREE.Points(
  starGeo,
  new THREE.PointsMaterial({ color: 0x52525b, size: 0.065, transparent: true, opacity: 0.4 })
);
scene.add(starField);

// Drag-to-orbit camera offset
let isDragging = false;
let prevMouse = { x: 0, y: 0 };
let userYaw = 0;
let userPitch = 0;

animateCol.addEventListener('pointerdown', (e) => {
  isDragging = true;
  prevMouse = { x: e.clientX, y: e.clientY };
});
window.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  const dx = e.clientX - prevMouse.x;
  const dy = e.clientY - prevMouse.y;
  prevMouse = { x: e.clientX, y: e.clientY };
  userYaw = Math.max(-0.65, Math.min(0.65, userYaw - dx * 0.005));
  userPitch = Math.max(-0.45, Math.min(0.45, userPitch + dy * 0.004));
});
window.addEventListener('pointerup', () => {
  isDragging = false;
});

const CAM_PRESETS = [
  { pos: [0.1, 2.0, 14.2], target: [0.1, -0.3, 0] },
  { pos: [0.0, 2.1, 14.0], target: [0.0, 0.1, 0] },
  { pos: [2.2, 2.6, 12.2], target: [0.0, 0.2, 0] },
  { pos: [2.4, 2.5, 13.8], target: [0.0, -0.1, 0] },
  { pos: [-0.8, 1.8, 12.8], target: [0.1, 0.0, 0] },
  { pos: [1.5, 2.1, 11.4], target: [0.2, 0.2, 0] },
  { pos: [-2.4, 5.2, 11.2], target: [0.2, -0.3, 0] },
  { pos: [1.8, 2.4, 11.6], target: [-0.4, 0.3, 0] },
  { pos: [2.4, 1.4, 12.4], target: [0.4, 0.0, 0] },
  { pos: [2.8, 2.2, 12.6], target: [0.6, 0.1, 0] }
];

// ====================================================================
// 3D GEOMETRY, GPU DISPOSAL & LABEL HELPERS
// ====================================================================
const stageGroups = [];
let stageLabels = Array.from({ length: 10 }, () => []);

for (let i = 0; i < 10; i++) {
  const g = new THREE.Group();
  g.visible = i === 0;
  scene.add(g);
  stageGroups.push(g);
}

function addLabel(stageIdx, safeHtml, cls, localVec3, mobileHide = false) {
  const el = document.createElement('div');
  const mobileCls = mobileHide ? ' mobile-hide' : '';
  el.className = `label-3d ${cls || 'primary'}${mobileCls}`.trim();
  el.innerHTML = safeHtml;
  el.style.opacity = '0';
  labelsLayer.appendChild(el);
  const item = { el, pos: localVec3.clone(), stageIdx, mobileHide };
  stageLabels[stageIdx].push(item);
  return item;
}

function make3DArrow(from, to, hexColor, shaftRadius = 0.055, headLen = 0.38, headRad = 0.15) {
  const group = new THREE.Group();
  const dir = new THREE.Vector3().subVectors(to, from);
  const totalLen = Math.max(0.001, dir.length());
  const shaftLen = Math.max(0.01, totalLen - headLen);

  const mat = new THREE.MeshStandardMaterial({
    color: hexColor,
    emissive: hexColor,
    emissiveIntensity: 0.24,
    roughness: 0.28,
    metalness: 0.35
  });

  const shaftGeo = new THREE.CylinderGeometry(shaftRadius, shaftRadius, shaftLen, 16);
  shaftGeo.translate(0, shaftLen / 2, 0);
  group.add(new THREE.Mesh(shaftGeo, mat));

  const headGeo = new THREE.ConeGeometry(headRad, headLen, 20);
  headGeo.translate(0, shaftLen + headLen / 2, 0);
  group.add(new THREE.Mesh(headGeo, mat));

  group.position.copy(from);
  const up = new THREE.Vector3(0, 1, 0);
  group.quaternion.setFromUnitVectors(up, dir.clone().normalize());
  return group;
}

function makeCurvedTube(p0, p1, p2, hexColor, radius = 0.045, opacity = 0.85) {
  const curve = new THREE.QuadraticBezierCurve3(p0, p1, p2);
  const geo = new THREE.TubeGeometry(curve, 36, radius, 12, false);
  const mat = new THREE.MeshStandardMaterial({
    color: hexColor,
    emissive: hexColor,
    emissiveIntensity: 0.28,
    roughness: 0.32,
    metalness: 0.25,
    transparent: opacity < 1,
    opacity
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData.curve = curve;
  return mesh;
}

function make3DAxes(size = 4.2) {
  const g = new THREE.Group();
  const lineMat = new THREE.LineBasicMaterial({ color: 0x3f3f46, transparent: true, opacity: 0.75 });
  const pts = [
    new THREE.Vector3(-size, 0, 0), new THREE.Vector3(size, 0, 0),
    new THREE.Vector3(0, -size * 0.75, 0), new THREE.Vector3(0, size * 0.75, 0),
    new THREE.Vector3(0, 0, -size), new THREE.Vector3(0, 0, size)
  ];
  g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), lineMat));

  const ringGeo = new THREE.RingGeometry(size * 0.78, size * 0.8, 64);
  ringGeo.rotateX(-Math.PI / 2);
  g.add(
    new THREE.Mesh(
      ringGeo,
      new THREE.MeshBasicMaterial({ color: 0x27272a, side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
    )
  );
  return g;
}

let s0Objs = { blocks: [], travelers: [], meanings: [] };
let s1Objs = { byteCubes: [], crystals: [] };
let s2Objs = { bankArrow: null, natureSphere: null, financeSphere: null };
let s3Objs = { dials: [] };
let s4Objs = { prisms: [], photons: [] };
let s5Objs = { sphere: null };
let s6Objs = { towers: [] };
let s7Objs = { orb: null, pathPoints: [] };
let s8Objs = { pulses: [], heads: [], mlpBox: null };
let s9Objs = { slabs: [], bars: [] };

function disposeObject3D(root) {
  root.traverse((obj) => {
    if (obj.geometry) {
      obj.geometry.dispose();
    }
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => m && m.dispose());
      } else {
        obj.material.dispose();
      }
    }
  });
}

function clearAllStages() {
  labelsLayer.innerHTML = '';
  stageLabels = Array.from({ length: 10 }, () => []);
  stageGroups.forEach((g) => {
    disposeObject3D(g);
    while (g.children.length > 0) {
      g.remove(g.children[0]);
    }
  });
  s0Objs = { blocks: [], travelers: [], meanings: [] };
  s1Objs = { byteCubes: [], crystals: [] };
  s2Objs = { bankArrow: null, natureSphere: null, financeSphere: null };
  s3Objs = { dials: [] };
  s4Objs = { prisms: [], photons: [] };
  s5Objs = { sphere: null };
  s6Objs = { towers: [] };
  s7Objs = { orb: null, pathPoints: [] };
  s8Objs = { pulses: [], heads: [], mlpBox: null };
  s9Objs = { slabs: [], bars: [] };
}

function updateLeftColumnCopy() {
  const focusWord = state.tokens[state.focusIdx];
  const safeFocus = escapeHtml(focusWord);
  const safeSentence = escapeHtml(state.sentence);
  const focusClean = focusWord.toLowerCase().replace(/[^a-z0-9]/g, '');
  const N = state.tokens.length;

  const topUpstream = state.tokens
    .map((w, i) => ({ w, wt: state.weights[i], i }))
    .filter((item) => item.i !== state.focusIdx)
    .sort((a, b) => b.wt - a.wt)
    .slice(0, 2)
    .map((item) => `“${escapeHtml(item.w)}”`)
    .join(' and ');

  const s1Desc = document.getElementById('s1-desc');
  if (POLYSEMOUS_WORDS.has(focusClean)) {
    s1Desc.innerHTML = `Type any sentence above or click a token to focus it. In <strong id="s1-sentence">“${safeSentence}”</strong>, <strong id="s1-focus">“${safeFocus}”</strong> is ambiguous until it connects to ${topUpstream || 'neighboring words'}.`;
  } else if (DETERMINERS.has(focusClean) || SPATIAL_ACTION_WORDS.has(focusClean) || COPULA_STOP_WORDS.has(focusClean)) {
    s1Desc.innerHTML = `Type any sentence above or click a token to focus it. In <strong id="s1-sentence">“${safeSentence}”</strong>, <strong id="s1-focus">“${safeFocus}”</strong> looks back at ${topUpstream || 'earlier tokens'} to predict <strong>${escapeHtml(state.preds[0].w)}</strong> next.`;
  } else {
    s1Desc.innerHTML = `Type any sentence above or click a token to focus it. In <strong id="s1-sentence">“${safeSentence}”</strong>, <strong id="s1-focus">“${safeFocus}”</strong> gathers context from ${topUpstream || 'its neighbors'} to shape the next prediction.`;
  }

  document.getElementById('s1-pill').textContent = `"${state.sentence}"`;
  document.getElementById('s2-count').textContent = `${N} atomic token${N === 1 ? '' : 's'}`;
  document.getElementById('s2-pill').textContent = `[${state.tokenIds.map((id) => id.slice(1)).join(', ')}]`;

  document.getElementById('s3-focus').textContent = `“${focusWord}”`;
  document.getElementById('s4-slots').textContent = `0 → ${Math.max(0, N - 1)}`;
  document.getElementById('s5-focus').textContent = `“${focusWord}”`;
  document.getElementById('s6-focus').textContent = `“${focusWord}”`;
  document.getElementById('s8-focus').textContent = `“${focusWord}”`;
  document.getElementById('s8-pill').textContent = `x'_${focusWord} = x_${focusWord} + ∑ αⱼ vⱼ`;
  document.getElementById('s10-pred').textContent = state.preds[0].w;
}

function renderTokenChips() {
  tokenBar.innerHTML = '<span class="token-bar-label">Focus token:</span>';
  state.tokens.forEach((tok, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'token-chip' + (idx === state.focusIdx ? ' focused' : '');
    btn.textContent = tok;
    btn.addEventListener('click', () => {
      triggerSentenceUpdate(sentenceInput.value, idx);
    });
    tokenBar.appendChild(btn);
  });
}

function rebuildAll3DStages() {
  clearAllStages();

  const TOKENS = state.tokens;
  const SAFE_TOKENS = TOKENS.map(escapeHtml);
  const N = TOKENS.length;
  const focusIdx = state.focusIdx;
  const safeFocusWord = SAFE_TOKENS[focusIdx];
  const span = Math.min(8.6, Math.max(4.4, Math.max(1, N - 1) * 2.1));
  const xs = TOKENS.map((_, i) => (N === 1 ? 0 : -span / 2 + (i * span) / (N - 1)));
  const boxW = Math.min(1.55, (span / Math.max(2, N)) * 0.76);

  // Rank upstream tokens by attention weight so color encodes actual numerical salience, not a rainbow
  const topUpstreamIdx =
    TOKENS.map((_, i) => i)
      .filter((i) => i !== focusIdx)
      .sort((a, b) => state.weights[b] - state.weights[a])[0] ?? 0;

  const getColHex = (i) => {
    if (i === focusIdx) return COLORS.signal;
    if (i === topUpstreamIdx) return COLORS.ivory;
    return state.weights[i] >= 0.18 ? COLORS.silver : COLORS.steel;
  };

  const getColCls = (i) => {
    if (i === focusIdx) return 'signal';
    if (i === topUpstreamIdx) return 'focal';
    return state.weights[i] >= 0.18 ? 'primary' : 'muted';
  };

  // STAGE 01: THE SENTENCE
  (() => {
    const g = stageGroups[0];
    xs.forEach((x, i) => {
      const isFocus = i === focusIdx;
      const col = getColHex(i);
      const boxGeo = new THREE.BoxGeometry(boxW, 1.05, 0.9);
      const boxMat = new THREE.MeshStandardMaterial({
        color: COLORS.carbon,
        emissive: col,
        emissiveIntensity: isFocus ? 0.34 : i === topUpstreamIdx ? 0.22 : 0.08,
        roughness: 0.28,
        metalness: 0.45
      });
      const mesh = new THREE.Mesh(boxGeo, boxMat);
      mesh.position.set(x, -0.3, 0);
      mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(boxGeo), new THREE.LineBasicMaterial({ color: col })));
      g.add(mesh);
      s0Objs.blocks.push(mesh);

      const hideOnMobile = N > 3 && !isFocus && i !== topUpstreamIdx;
      addLabel(
        0,
        `${SAFE_TOKENS[i]}<span class="sub">${isFocus ? 'Focused Token' : `Slot ${i} · ${Math.round(state.weights[i] * 100)}%`}</span>`,
        getColCls(i),
        new THREE.Vector3(x, -1.25, 0.5),
        hideOnMobile
      );
    });

    const focusX = xs[focusIdx];
    const otherIndices = TOKENS.map((_, i) => i)
      .filter((i) => i !== focusIdx)
      .sort((a, b) => state.weights[b] - state.weights[a])
      .slice(0, 3);

    otherIndices.forEach((targetIdx, rank) => {
      const tx = xs[targetIdx];
      const h = 3.0 - rank * 0.65;
      const z = (rank - 1) * 0.5;
      const col = rank === 0 ? COLORS.ivory : rank === 1 ? COLORS.silver : COLORS.steel;
      const r = 0.065 - rank * 0.012;
      const p0 = new THREE.Vector3(focusX, 0.25, 0);
      const p1 = new THREE.Vector3((focusX + tx) / 2, h, z);
      const p2 = new THREE.Vector3(tx, 0.25, 0);
      const tube = makeCurvedTube(p0, p1, p2, col, r, 0.88);
      g.add(tube);

      const sp = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 16, 16),
        new THREE.MeshBasicMaterial({ color: COLORS.ivory })
      );
      g.add(sp);
      s0Objs.travelers.push({ mesh: sp, curve: tube.userData.curve, offset: rank * 0.33 });
    });

    const shoreOrb = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.45, 2),
      new THREE.MeshStandardMaterial({ color: COLORS.ivory, emissive: COLORS.ivory, emissiveIntensity: 0.35, wireframe: true })
    );
    shoreOrb.position.set(-2.2, -2.5, 0.8);
    g.add(shoreOrb);

    const vaultOrb = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.35, 1),
      new THREE.MeshStandardMaterial({ color: COLORS.steel, emissive: COLORS.steel, emissiveIntensity: 0.15, wireframe: true })
    );
    vaultOrb.position.set(2.4, -2.5, -0.6);
    g.add(vaultOrb);
    s0Objs.meanings.push(shoreOrb, vaultOrb);

    addLabel(0, `${escapeHtml(state.senseA.name)} · ${state.senseA.pct}%<span class="sub">${escapeHtml(state.senseA.sub)}</span>`, 'focal', new THREE.Vector3(-2.2, -3.35, 0.8));
    addLabel(0, `${escapeHtml(state.senseB.name)} · ${state.senseB.pct}%<span class="sub">${escapeHtml(state.senseB.sub)}</span>`, 'muted', new THREE.Vector3(2.4, -3.35, -0.6), true);
  })();

  // STAGE 02: TOKENS
  (() => {
    const g = stageGroups[1];
    let charIdx = 0;
    const totalBytes = new TextEncoder().encode(state.sentence).length;

    xs.forEach((tx, wIdx) => {
      const len = Math.min(8, Math.max(2, TOKENS[wIdx].length));
      const col = getColHex(wIdx);
      const stepC = Math.min(0.32, (boxW * 0.95) / len);

      for (let c = 0; c < len; c++) {
        const cx = tx + (c - (len - 1) / 2) * stepC;
        const cubeGeo = new THREE.BoxGeometry(0.24, 0.24, 0.24);
        const cubeMat = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.22, roughness: 0.3, metalness: 0.4 });
        const cube = new THREE.Mesh(cubeGeo, cubeMat);
        cube.position.set(cx, 2.3, 0);
        g.add(cube);
        s1Objs.byteCubes.push({ mesh: cube, cIdx: charIdx++ });
      }

      const coneGeo = new THREE.CylinderGeometry(len * stepC * 0.52, 0.5, 2.1, 16, 1, true);
      const cone = new THREE.Mesh(
        coneGeo,
        new THREE.MeshBasicMaterial({ color: col, wireframe: true, transparent: true, opacity: 0.2 })
      );
      cone.position.set(tx, 1.0, 0);
      g.add(cone);

      const cryGeo = new THREE.OctahedronGeometry(Math.min(0.75, boxW * 0.48), 0);
      const cryMat = new THREE.MeshStandardMaterial({
        color: COLORS.carbon,
        emissive: col,
        emissiveIntensity: 0.28,
        roughness: 0.24,
        metalness: 0.55,
        flatShading: true
      });
      const crystal = new THREE.Mesh(cryGeo, cryMat);
      crystal.position.set(tx, -0.55, 0);
      crystal.add(new THREE.LineSegments(new THREE.EdgesGeometry(cryGeo), new THREE.LineBasicMaterial({ color: col })));
      g.add(crystal);
      s1Objs.crystals.push(crystal);

      const hideOnMobile = N > 4 && wIdx !== focusIdx && wIdx !== 0 && wIdx !== topUpstreamIdx;
      addLabel(
        1,
        `${SAFE_TOKENS[wIdx]}<span class="sub">BPE ${escapeHtml(state.tokenIds[wIdx])}</span>`,
        getColCls(wIdx),
        new THREE.Vector3(tx, -1.85, 0.4),
        hideOnMobile
      );
    });

    addLabel(1, `UTF-8 Byte Stream (${totalBytes} bytes) → GPT-2 BPE IDs`, 'primary', new THREE.Vector3(0, 3.1, 0));
  })();

  // STAGE 03: EMBEDDINGS
  (() => {
    const g = stageGroups[2];
    g.add(make3DAxes(4.8));
    const origin = new THREE.Vector3(0, -1.4, 0);

    const natCenter = new THREE.Vector3(-2.7, 1.25, 0.8);
    const natGeo = new THREE.SphereGeometry(1.75, 28, 28);
    const natSphere = new THREE.Mesh(
      natGeo,
      new THREE.MeshStandardMaterial({ color: COLORS.ivory, emissive: COLORS.ivory, emissiveIntensity: 0.12, transparent: true, opacity: 0.12, roughness: 0.25 })
    );
    natSphere.position.copy(natCenter);
    natSphere.add(new THREE.Mesh(natGeo, new THREE.MeshBasicMaterial({ color: COLORS.ivory, wireframe: true, transparent: true, opacity: 0.18 })));
    g.add(natSphere);
    s2Objs.natureSphere = natSphere;
    addLabel(2, escapeHtml(state.basinALabel), 'focal', new THREE.Vector3(-2.7, 3.25, 0.8));

    const finCenter = new THREE.Vector3(2.8, 1.25, -0.8);
    const finSphere = new THREE.Mesh(
      natGeo,
      new THREE.MeshStandardMaterial({ color: COLORS.steel, emissive: COLORS.steel, emissiveIntensity: 0.1, transparent: true, opacity: 0.1, roughness: 0.25 })
    );
    finSphere.position.copy(finCenter);
    finSphere.add(new THREE.Mesh(natGeo, new THREE.MeshBasicMaterial({ color: COLORS.steel, wireframe: true, transparent: true, opacity: 0.16 })));
    g.add(finSphere);
    s2Objs.financeSphere = finSphere;
    addLabel(2, escapeHtml(state.basinBLabel), 'muted', new THREE.Vector3(2.8, 3.25, -0.8), true);

    TOKENS.forEach((_, idx) => {
      if (idx === focusIdx) return;
      const sv = (state.semVecs && state.semVecs[idx]) || { x: -2.4, y: 1.2, z: 0.5, domain: 'nature' };
      const vec = new THREE.Vector3(sv.x, sv.y, sv.z);
      const col = sv.domain === 'nature' ? COLORS.ivory : sv.domain === 'finance' ? COLORS.pewter : COLORS.steel;
      const cls = sv.domain === 'nature' ? 'primary' : 'muted';
      g.add(make3DArrow(origin, vec, col, 0.045, 0.34, 0.13));
      addLabel(2, SAFE_TOKENS[idx], cls, vec.clone().add(new THREE.Vector3(0, 0.32, 0)), idx !== topUpstreamIdx && N > 4);
    });

    const bankTip = new THREE.Vector3(0.0, 0.45, 0.0);
    const bankArrow = make3DArrow(origin, bankTip, COLORS.signal, 0.065, 0.42, 0.17);
    g.add(bankArrow);
    s2Objs.bankArrow = bankArrow;

    const dashMat = new THREE.LineDashedMaterial({ color: COLORS.pewter, dashSize: 0.2, gapSize: 0.14 });
    const tensionLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([natCenter, bankTip, finCenter]), dashMat);
    tensionLine.computeLineDistances();
    g.add(tensionLine);

    addLabel(
      2,
      `x_${safeFocusWord} (768-D → 3D)<span class="sub">Uncontextualized Layer-0 vector</span>`,
      'signal',
      new THREE.Vector3(0, -2.15, 0.6)
    );
  })();

  // STAGE 04: POSITION (RoPE)
  (() => {
    const g = stageGroups[3];
    const radius = 1.65;
    const spineGeo = new THREE.CylinderGeometry(0.035, 0.035, span + 1.4, 12);
    spineGeo.rotateZ(Math.PI / 2);
    g.add(new THREE.Mesh(spineGeo, new THREE.MeshBasicMaterial({ color: 0x3f3f46 })));

    const startX = N === 1 ? -2.2 : xs[0];
    const endX = N === 1 ? 2.2 : xs[N - 1];
    const helixPts = [];
    for (let i = 0; i <= 120; i++) {
      const u = i / 120;
      const x = startX + u * (endX - startX);
      const ang = -Math.PI / 2 + u * Math.PI;
      helixPts.push(new THREE.Vector3(x, Math.sin(ang) * radius, Math.cos(ang) * radius));
    }
    const helixCurve = new THREE.CatmullRomCurve3(helixPts);
    g.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(helixCurve, 100, 0.045, 12, false),
        new THREE.MeshStandardMaterial({ color: COLORS.ivory, emissive: COLORS.ivory, emissiveIntensity: 0.3, roughness: 0.28 })
      )
    );

    const stepDeg = Math.round(180 / Math.max(1, N - 1));
    xs.forEach((x, m) => {
      const deg = m * stepDeg;
      const rad = (-90 + deg) * (Math.PI / 180);
      const col = getColHex(m);

      const dialGroup = new THREE.Group();
      dialGroup.position.set(x, 0, 0);

      const torusGeo = new THREE.TorusGeometry(radius, 0.04, 16, 48);
      torusGeo.rotateY(Math.PI / 2);
      dialGroup.add(
        new THREE.Mesh(
          torusGeo,
          new THREE.MeshStandardMaterial({ color: 0x18181b, emissive: col, emissiveIntensity: 0.16, roughness: 0.32 })
        )
      );

      const tip = new THREE.Vector3(0, Math.sin(rad) * radius, Math.cos(rad) * radius);
      const arrow = make3DArrow(new THREE.Vector3(0, 0, 0), tip, col, 0.055, 0.36, 0.14);
      dialGroup.add(arrow);
      g.add(dialGroup);
      s3Objs.dials.push({ group: dialGroup, arrow });

      const hideOnMobile = N > 4 && m !== 0 && m !== focusIdx;
      addLabel(
        3,
        `${SAFE_TOKENS[m]} · m=${m}<span class="sub">θ = ${deg}° twist</span>`,
        getColCls(m),
        new THREE.Vector3(x, -2.35, 0),
        hideOnMobile
      );
    });

    addLabel(3, '3D Rotary Position Embedding Helix · R(m)xₘ', 'focal', new THREE.Vector3(0, 2.55, 0));
  })();

  // STAGE 05: Q, K, V
  (() => {
    const g = stageGroups[4];
    const srcPos = new THREE.Vector3(-4.2, 0, 0);
    const srcMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.75, 1),
      new THREE.MeshStandardMaterial({ color: COLORS.signal, emissive: COLORS.signal, emissiveIntensity: 0.32, roughness: 0.24, metalness: 0.45, flatShading: true })
    );
    srcMesh.position.copy(srcPos);
    g.add(srcMesh);
    addLabel(4, `x_${safeFocusWord} ∈ ℝ⁷⁶⁸<span class="sub">Focused Token</span>`, 'signal', new THREE.Vector3(-4.2, -1.35, 0));

    const branches = [
      { mat: 'W_Q', role: `q_${safeFocusWord} (Query)`, desc: 'Seeks upstream context', y: 2.2, z: 0.6, col: COLORS.ivory, cls: 'focal' },
      { mat: 'W_K', role: `k_${safeFocusWord} (Key)`, desc: `Advertises slot ${focusIdx}`, y: 0.0, z: 0.0, col: COLORS.silver, cls: 'primary' },
      { mat: 'W_V', role: `v_${safeFocusWord} (Value)`, desc: `Carries “${safeFocusWord}” payload`, y: -2.2, z: -0.6, col: COLORS.pewter, cls: 'muted' }
    ];

    branches.forEach((b, idx) => {
      const lensPos = new THREE.Vector3(-0.3, b.y, b.z);
      const outTip = new THREE.Vector3(3.9, b.y, b.z);
      const beam = makeCurvedTube(srcPos, new THREE.Vector3(-2.3, b.y * 0.6, b.z * 0.6), lensPos, b.col, 0.04, 0.78);
      g.add(beam);

      const photon = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 14), new THREE.MeshBasicMaterial({ color: COLORS.ivory }));
      g.add(photon);
      s4Objs.photons.push({ mesh: photon, curve: beam.userData.curve, offset: idx * 0.33 });

      const prismGeo = new THREE.BoxGeometry(1.35, 1.15, 1.15);
      const prism = new THREE.Mesh(
        prismGeo,
        new THREE.MeshStandardMaterial({ color: b.col, emissive: b.col, emissiveIntensity: 0.2, transparent: true, opacity: 0.28, roughness: 0.2, metalness: 0.55 })
      );
      prism.position.copy(lensPos);
      prism.add(new THREE.LineSegments(new THREE.EdgesGeometry(prismGeo), new THREE.LineBasicMaterial({ color: b.col })));
      g.add(prism);
      s4Objs.prisms.push(prism);

      addLabel(4, `Matrix ${b.mat}<span class="sub">ℝ⁷⁶⁸ → 12×ℝ⁶⁴</span>`, 'muted', lensPos.clone().add(new THREE.Vector3(0, 0.95, 0)), true);
      g.add(make3DArrow(lensPos.clone().add(new THREE.Vector3(0.75, 0, 0)), outTip, b.col, 0.065, 0.42, 0.16));
      addLabel(4, `${b.role}<span class="sub">${b.desc}</span>`, b.cls, outTip.clone().add(new THREE.Vector3(0, -0.58, 0)));
    });
  })();

  // STAGE 06: ALIGNMENT
  (() => {
    const g = stageGroups[5];
    const radius = 3.1;
    const sphGeo = new THREE.IcosahedronGeometry(radius, 2);
    const sphere = new THREE.Mesh(
      sphGeo,
      new THREE.MeshBasicMaterial({ color: 0x3f3f46, wireframe: true, transparent: true, opacity: 0.28 })
    );
    g.add(sphere);
    s5Objs.sphere = sphere;

    const eqGeo = new THREE.RingGeometry(radius - 0.02, radius + 0.02, 64);
    eqGeo.rotateX(Math.PI / 2);
    g.add(new THREE.Mesh(eqGeo, new THREE.MeshBasicMaterial({ color: COLORS.pewter, side: THREE.DoubleSide, transparent: true, opacity: 0.25 })));

    const origin = new THREE.Vector3(0, 0, 0);
    const qVec = new THREE.Vector3(-2.1, 2.0, 1.1).normalize().multiplyScalar(radius * 1.05);
    g.add(make3DArrow(origin, qVec, COLORS.signal, 0.075, 0.45, 0.18));
    addLabel(5, `q_${safeFocusWord} (Query)<span class="sub">Unit direction</span>`, 'signal', qVec.clone().multiplyScalar(1.18));

    const highDirs = [
      new THREE.Vector3(-2.5, 1.4, 0.9),
      new THREE.Vector3(-1.2, 2.5, 0.6),
      new THREE.Vector3(-0.3, 2.3, -0.5)
    ];
    const midDirs = [
      new THREE.Vector3(1.5, 0.9, 1.2),
      new THREE.Vector3(0.9, 1.8, -1.1)
    ];
    const lowDirs = [
      new THREE.Vector3(2.3, -1.5, -0.8),
      new THREE.Vector3(1.6, -2.1, 0.9),
      new THREE.Vector3(-1.5, -2.0, -1.1)
    ];
    let hUsed = 0, mUsed = 0, lUsed = 0;

    SAFE_TOKENS.forEach((safeTok, idx) => {
      const sc = state.dotScores[idx];
      let dir;
      if (sc >= 1.0) {
        dir = highDirs[hUsed++ % highDirs.length];
      } else if (sc >= 0) {
        dir = midDirs[mUsed++ % midDirs.length];
      } else {
        dir = lowDirs[lUsed++ % lowDirs.length];
      }
      const tip = dir.clone().normalize().multiplyScalar(radius * 0.96);
      const col = sc >= 1.0 ? COLORS.ivory : sc >= 0 ? COLORS.pewter : COLORS.graphite;
      const cls = idx === topUpstreamIdx ? 'focal' : sc >= 1.0 ? 'primary' : 'muted';
      g.add(make3DArrow(origin, tip, col, 0.052, 0.36, 0.14));
      const sign = sc > 0 ? '+' : '';
      addLabel(5, `k(${safeTok}) · ${sign}${sc.toFixed(1)}`, cls, tip.clone().multiplyScalar(1.18), sc < 0.8 && idx !== topUpstreamIdx);
    });
  })();

  // STAGE 07: SOFTMAX
  (() => {
    const g = stageGroups[6];
    const step = Math.min(1.25, 5.4 / Math.max(2, N));
    const cellW = step * 0.72;
    const baseY = -1.8;

    const slabGeo = new THREE.BoxGeometry(N * step + 1.0, 0.18, N * step + 1.0);
    const slab = new THREE.Mesh(slabGeo, new THREE.MeshStandardMaterial({ color: COLORS.carbon, roughness: 0.65, metalness: 0.25 }));
    slab.position.set(0, baseY - 0.1, 0);
    g.add(slab);

    const topFocusCols = new Set(
      TOKENS.map((_, c) => c)
        .filter((c) => c <= focusIdx)
        .sort((a, b) => state.matrix[focusIdx][b] - state.matrix[focusIdx][a])
        .slice(0, 3)
    );

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const x = (c - (N - 1) / 2) * step;
        const z = (r - (N - 1) / 2) * step;
        const masked = c > r;
        const wt = state.matrix[r][c];
        const isFocusRow = r === focusIdx;

        if (masked) {
          const tileGeo = new THREE.BoxGeometry(cellW, 0.08, cellW);
          const tile = new THREE.Mesh(
            tileGeo,
            new THREE.MeshBasicMaterial({ color: COLORS.graphite, wireframe: true, transparent: true, opacity: 0.4 })
          );
          tile.position.set(x, baseY + 0.04, z);
          g.add(tile);
        } else {
          const h = Math.max(0.18, wt * 4.2);
          const col = isFocusRow
            ? (c === topUpstreamIdx ? COLORS.ivory : wt >= 0.2 ? COLORS.silver : COLORS.steel)
            : COLORS.graphite;
          const towGeo = new THREE.BoxGeometry(cellW, h, cellW);
          const tower = new THREE.Mesh(
            towGeo,
            new THREE.MeshStandardMaterial({
              color: col,
              emissive: col,
              emissiveIntensity: isFocusRow ? 0.32 : 0.1,
              roughness: 0.26,
              metalness: 0.4
            })
          );
          tower.position.set(x, baseY + h / 2, z);
          tower.add(new THREE.LineSegments(new THREE.EdgesGeometry(towGeo), new THREE.LineBasicMaterial({ color: 0xf4f4f5, transparent: true, opacity: isFocusRow ? 0.35 : 0.12 })));
          g.add(tower);
          s6Objs.towers.push({ mesh: tower, baseH: h, baseY });

          if (isFocusRow && topFocusCols.has(c)) {
            addLabel(
              6,
              `${SAFE_TOKENS[c]} · ${Math.round(wt * 100)}%`,
              c === topUpstreamIdx ? 'focal' : 'primary',
              new THREE.Vector3(x, baseY + h + 0.55, z)
            );
          }
        }
      }
    }

    addLabel(6, `Row ${focusIdx + 1}: “${safeFocusWord}” 100% Softmax Spotlight`, 'signal', new THREE.Vector3(0, baseY - 0.65, 3.35));
    if (N > 1) {
      addLabel(6, 'Causal Mask (−∞ Future Hidden)', 'muted', new THREE.Vector3(2.8, baseY + 1.45, -2.8), true);
    }
  })();

  // STAGE 08: CONTEXT SHIFT
  (() => {
    const g = stageGroups[7];
    g.add(make3DAxes(4.6));

    const p0 = new THREE.Vector3(1.2, -1.6, 0.0);
    const p1 = new THREE.Vector3(-0.6, -0.3, 0.7);
    const p2 = new THREE.Vector3(-1.9, 1.0, 1.1);
    const p3 = new THREE.Vector3(-2.6, 1.9, 0.8);
    s7Objs.pathPoints = [p0, p1, p2, p3];

    const basinGeo = new THREE.SphereGeometry(1.65, 28, 28);
    const basin = new THREE.Mesh(
      basinGeo,
      new THREE.MeshStandardMaterial({ color: COLORS.ivory, emissive: COLORS.ivory, emissiveIntensity: 0.14, transparent: true, opacity: 0.14 })
    );
    basin.position.copy(p3);
    basin.add(new THREE.Mesh(basinGeo, new THREE.MeshBasicMaterial({ color: COLORS.ivory, wireframe: true, transparent: true, opacity: 0.22 })));
    g.add(basin);

    g.add(make3DArrow(p0, p1, COLORS.ivory, 0.065, 0.38, 0.15));
    g.add(make3DArrow(p1, p2, COLORS.silver, 0.065, 0.38, 0.15));
    g.add(make3DArrow(p2, p3, COLORS.pewter, 0.055, 0.34, 0.14));

    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 24, 24),
      new THREE.MeshStandardMaterial({ color: COLORS.ivory, emissive: COLORS.ivory, emissiveIntensity: 0.6, roughness: 0.15 })
    );
    g.add(orb);
    s7Objs.orb = orb;

    const topContributors = SAFE_TOKENS.map((w, i) => ({ w, wt: state.weights[i], i }))
      .sort((a, b) => b.wt - a.wt);
    const c0 = topContributors[0] || { w: SAFE_TOKENS[0], wt: 0.5 };
    const c1 = topContributors[1] || { w: SAFE_TOKENS[Math.min(1, N - 1)], wt: 0.3 };
    const c2 = topContributors[2] || { w: SAFE_TOKENS[Math.min(2, N - 1)], wt: 0.1 };

    addLabel(7, `x_${safeFocusWord} (Layer 0 Start)`, 'signal', p0.clone().add(new THREE.Vector3(0.4, -0.55, 0)));
    addLabel(7, `+${Math.round(c0.wt * 100)}% v(${c0.w})`, 'primary', p0.clone().lerp(p1, 0.5).add(new THREE.Vector3(-0.9, -0.2, 0.4)));
    addLabel(7, `+${Math.round(c1.wt * 100)}% v(${c1.w})`, 'muted', p1.clone().lerp(p2, 0.5).add(new THREE.Vector3(-1.0, 0.1, 0.4)), true);
    addLabel(7, `+${Math.round(c2.wt * 100)}% v(${c2.w})`, 'muted', p2.clone().lerp(p3, 0.5).add(new THREE.Vector3(-1.1, 0.2, 0.2)), true);
    addLabel(
      7,
      `x'_${safeFocusWord} (Layer 5 Contextualized)<span class='sub'>${state.senseA.pct}% ${escapeHtml(state.senseA.name)}</span>`,
      'focal',
      p3.clone().add(new THREE.Vector3(0, 0.95, 0))
    );
  })();

  // STAGE 09: TRANSFORMER BLOCK
  (() => {
    const g = stageGroups[8];
    const railX = -2.2;

    const pillarGeo = new THREE.CylinderGeometry(0.14, 0.14, 7.6, 24);
    const pillar = new THREE.Mesh(
      pillarGeo,
      new THREE.MeshStandardMaterial({ color: COLORS.ivory, emissive: COLORS.ivory, emissiveIntensity: 0.3, roughness: 0.25, metalness: 0.45 })
    );
    pillar.position.set(railX, 0, 0);
    g.add(pillar);

    [-0.3, 2.5].forEach((jy) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.36, 0.06, 16, 36),
        new THREE.MeshStandardMaterial({ color: COLORS.signal, emissive: COLORS.signal, emissiveIntensity: 0.45 })
      );
      ring.position.set(railX, jy, 0);
      g.add(ring);
    });

    const headColors = [COLORS.ivory, COLORS.silver, COLORS.pewter];
    headColors.forEach((hc, hi) => {
      const hz = (hi - 1) * 0.95;
      const hBox = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.9, 0.65),
        new THREE.MeshStandardMaterial({ color: hc, emissive: hc, emissiveIntensity: 0.2, transparent: true, opacity: 0.38, roughness: 0.24 })
      );
      hBox.position.set(1.9, -1.5, hz);
      hBox.add(new THREE.LineSegments(new THREE.EdgesGeometry(hBox.geometry), new THREE.LineBasicMaterial({ color: hc })));
      g.add(hBox);
      s8Objs.heads.push(hBox);
    });

    g.add(makeCurvedTube(new THREE.Vector3(railX, -2.7, 0), new THREE.Vector3(1.9, -2.7, 0), new THREE.Vector3(1.9, -1.9, 0), COLORS.silver, 0.05));
    g.add(makeCurvedTube(new THREE.Vector3(1.9, -1.0, 0), new THREE.Vector3(1.9, -0.3, 0), new THREE.Vector3(railX, -0.3, 0), COLORS.silver, 0.05));

    const mlpGeo = new THREE.BoxGeometry(2.8, 1.35, 1.5);
    const mlpBox = new THREE.Mesh(
      mlpGeo,
      new THREE.MeshStandardMaterial({ color: COLORS.ivory, emissive: COLORS.ivory, emissiveIntensity: 0.22, transparent: true, opacity: 0.3, roughness: 0.24, metalness: 0.45 })
    );
    mlpBox.position.set(1.9, 1.25, 0);
    mlpBox.add(new THREE.LineSegments(new THREE.EdgesGeometry(mlpGeo), new THREE.LineBasicMaterial({ color: COLORS.ivory })));
    g.add(mlpBox);
    s8Objs.mlpBox = mlpBox;

    g.add(makeCurvedTube(new THREE.Vector3(railX, 0.2, 0), new THREE.Vector3(1.9, 0.2, 0), new THREE.Vector3(1.9, 0.6, 0), COLORS.ivory, 0.05));
    g.add(makeCurvedTube(new THREE.Vector3(1.9, 1.9, 0), new THREE.Vector3(1.9, 2.5, 0), new THREE.Vector3(railX, 2.5, 0), COLORS.ivory, 0.05));

    for (let i = 0; i < 4; i++) {
      const sp = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), new THREE.MeshBasicMaterial({ color: COLORS.ivory }));
      g.add(sp);
      s8Objs.pulses.push({ mesh: sp, offset: i * 0.25 });
    }

    addLabel(8, 'Residual Stream Highway<span class="sub">x + MHA(x) + MLP(x)</span>', 'focal', new THREE.Vector3(railX, 3.45, 0));
    addLabel(8, 'Multi-Head Attention (12 Heads)<span class="sub">H1..H12 × 64d Subspaces</span>', 'primary', new THREE.Vector3(1.9, -2.55, 0.8));
    addLabel(8, `Feed-Forward MLP (768 → 3072 → 768)<span class="sub">Extracts features for “${safeFocusWord}”</span>`, 'muted', new THREE.Vector3(1.9, 2.35, 0.8));
  })();

  // STAGE 10: EMERGENCE
  (() => {
    const g = stageGroups[9];
    const stackX = -1.9;
    const baseY = -2.6;

    for (let l = 0; l < 8; l++) {
      const y = baseY + l * 0.68;
      const slabGeo = new THREE.BoxGeometry(3.4, 0.36, 2.2);
      const slab = new THREE.Mesh(
        slabGeo,
        new THREE.MeshStandardMaterial({ color: COLORS.carbon, emissive: COLORS.silver, emissiveIntensity: 0.12, transparent: true, opacity: 0.78, roughness: 0.28, metalness: 0.45 })
      );
      slab.position.set(stackX, y, 0);
      slab.add(new THREE.LineSegments(new THREE.EdgesGeometry(slabGeo), new THREE.LineBasicMaterial({ color: COLORS.pewter, transparent: true, opacity: 0.4 })));
      g.add(slab);
      s9Objs.slabs.push(slab);
    }

    addLabel(9, 'Transformer Layer Stack<span class="sub">L0 (Embeddings) → Final Logits (50,257 Vocab)</span>', 'muted', new THREE.Vector3(stackX, -3.35, 0.8), true);

    const topY = baseY + 7 * 0.68;
    g.add(makeCurvedTube(new THREE.Vector3(stackX + 1.7, topY, 0), new THREE.Vector3(0.5, topY + 0.8, 0), new THREE.Vector3(1.6, 1.6, 0), COLORS.ivory, 0.055));

    state.preds.forEach((pr, idx) => {
      const y = 1.6 - idx * 1.05;
      const barLen = Math.max(0.35, pr.p * 3.8);
      const barGeo = new THREE.BoxGeometry(barLen, 0.46, 0.56);
      const bar = new THREE.Mesh(
        barGeo,
        new THREE.MeshStandardMaterial({ color: pr.col, emissive: pr.col, emissiveIntensity: idx === 0 ? 0.42 : 0.14, roughness: 0.24, metalness: 0.35 })
      );
      bar.position.set(1.6 + barLen / 2, y, 0);
      bar.add(new THREE.LineSegments(new THREE.EdgesGeometry(barGeo), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: idx === 0 ? 0.45 : 0.2 })));
      g.add(bar);
      s9Objs.bars.push(bar);

      const logitSub = pr.logit !== undefined ? `<span class="sub">logit ${escapeHtml(pr.logit)} · BPE ${escapeHtml(pr.tokenId)}</span>` : '';
      addLabel(
        9,
        `${escapeHtml(pr.w)} · ${Math.round(pr.p * 100)}%${logitSub}`,
        pr.cls,
        new THREE.Vector3(1.6 + barLen + 1.05, y, 0),
        idx >= 1
      );
    });

    addLabel(
      9,
      `${escapeHtml(state.sentence)} → ${escapeHtml(state.preds[0].w)}`,
      'focal',
      new THREE.Vector3(2.6, -2.85, 0.5)
    );
  })();

  projectStageLabels();
}

// ====================================================================
// DUAL-RUNTIME LIVE ONNX INFERENCE (LOCAL SERVER OR IN-BROWSER WASM)
// ====================================================================
let inferAbort = null;
let debounceTimer = null;
let browserModelPromise = null;

async function getBrowserTransformer() {
  if (!browserModelPromise) {
    browserModelPromise = (async () => {
      if (telemetryEl) {
        telemetryEl.innerHTML = '<span class="telemetry-dot"></span> LOADING ONNX WASM · DistilGPT-2...';
      }
      const tf = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2/dist/transformers.web.min.js');
      const tokenizer = await tf.AutoTokenizer.from_pretrained(MODEL_ID);
      const model = await tf.AutoModelForCausalLM.from_pretrained(MODEL_ID, { dtype: 'q8' });
      return { tokenizer, model, Tensor: tf.Tensor };
    })();
  }
  return browserModelPromise;
}

function applyInferenceData(data) {
  state = {
    ...state,
    sentence: data.sentence,
    tokens: data.tokens,
    tokenIds: data.tokenIds,
    focusIdx: data.focusIdx,
    dotScores: data.dotScores,
    weights: data.weights,
    matrix: data.matrix,
    semVecs: data.semVecs,
    basinALabel: data.basinALabel,
    basinBLabel: data.basinBLabel,
    senseA: data.senseA,
    senseB: data.senseB,
    preds: decoratePreds(data.preds)
  };

  if (telemetryEl) {
    telemetryEl.innerHTML = `<span class="telemetry-dot"></span> LIVE ONNX · ${escapeHtml(data.modelName)} · ${escapeHtml(data.latencyMs)}ms`;
  }

  updateLeftColumnCopy();
  renderTokenChips();
  rebuildAll3DStages();
}

async function fetchLiveModelState(rawText, preferredFocusIdx = null) {
  if (inferAbort) inferAbort.abort();
  inferAbort = new AbortController();

  const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocalHost) {
    try {
      const apiBase = window.location.port === '8765' ? '' : 'http://localhost:8765';
      const params = new URLSearchParams({ text: rawText });
      if (preferredFocusIdx !== null && preferredFocusIdx !== undefined) {
        params.set('focusIdx', String(preferredFocusIdx));
      }
      const resp = await fetch(`${apiBase}/api/infer?${params.toString()}`, {
        signal: inferAbort.signal
      });
      if (resp.ok) {
        const data = await resp.json();
        applyInferenceData(data);
        return data;
      }
    } catch (err) {
      if (err.name === 'AbortError') return null;
    }
  }

  // Fallback to in-browser ONNX Runtime Web (@huggingface/transformers WASM/WebGPU) on static hosts
  try {
    const { tokenizer, model, Tensor } = await getBrowserTransformer();
    const data = await runRealTransformerInference({
      tokenizer,
      model,
      Tensor,
      rawText,
      preferredFocusIdx
    });
    applyInferenceData(data);
    return data;
  } catch {
    return state;
  }
}

function triggerSentenceUpdate(rawText, preferredFocusIdx = null) {
  const instant = computeInstantState(rawText, preferredFocusIdx);
  instant.preds = decoratePreds(instant.preds);
  state = instant;

  if (instant.isRealModel && telemetryEl) {
    telemetryEl.innerHTML = `<span class="telemetry-dot"></span> LIVE ONNX · ${escapeHtml(instant.modelName)} · ${escapeHtml(instant.latencyMs)}ms`;
  }

  updateLeftColumnCopy();
  renderTokenChips();
  rebuildAll3DStages();

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchLiveModelState(rawText, preferredFocusIdx);
  }, 50);
}

// Expose programmatic API for WebMCP & autonomous agents
window.__attentionInspector = {
  getState: () => structuredClone(state),
  setSentence: async (text, focusIdx = null) => {
    sentenceInput.value = text;
    triggerSentenceUpdate(text, focusIdx);
    const live = await fetchLiveModelState(text, focusIdx);
    return live || structuredClone(state);
  }
};

// Wire live input & preset buttons
sentenceInput.addEventListener('input', () => {
  triggerSentenceUpdate(sentenceInput.value);
});

document.querySelectorAll('.preset-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    const s = chip.getAttribute('data-sentence');
    sentenceInput.value = s;
    triggerSentenceUpdate(s);
  });
});

// ====================================================================
// RESIZE, MOBILE CAMERA SCALING & 3D-TO-2D LABEL PROJECTION LOOP
// ====================================================================
let viewW = 800;
let viewH = 600;
const camCurrentPos = new THREE.Vector3(0.1, 2.0, 14.2);
const camCurrentTarget = new THREE.Vector3(0.1, -0.3, 0);
const tempVec = new THREE.Vector3();
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function handleResize() {
  const rect = animateCol.getBoundingClientRect();
  viewW = Math.max(1, rect.width);
  viewH = Math.max(1, rect.height);
  camera.aspect = viewW / viewH;
  camera.updateProjectionMatrix();
  renderer.setSize(viewW, viewH, false);
}

function projectStageLabels() {
  const isCompactViewport = viewW < 640;
  const padX = isCompactViewport ? 56 : 96;
  const padRight = isCompactViewport ? 62 : 115;
  const padY = isCompactViewport ? 22 : 32;

  camera.updateMatrixWorld();

  stageLabels.forEach((list, sIdx) => {
    const isVisibleStage = sIdx === activeStep;
    const placed = [];
    stageGroups[sIdx].updateMatrixWorld();
    list.forEach((item) => {
      if (!isVisibleStage || (isCompactViewport && item.mobileHide)) {
        item.el.style.opacity = '0';
        return;
      }
      tempVec.copy(item.pos);
      stageGroups[sIdx].localToWorld(tempVec);
      tempVec.project(camera);

      if (tempVec.z > 1) {
        item.el.style.opacity = '0';
        return;
      }
      const x = (tempVec.x * 0.5 + 0.5) * viewW;
      const y = (-tempVec.y * 0.5 + 0.5) * viewH;
      const clampedX = Math.max(padX, Math.min(viewW - padRight, x));
      let clampedY = Math.max(padY, Math.min(viewH - padY, y));

      // Vertical collision avoidance on compact mobile screens
      if (isCompactViewport) {
        for (const p of placed) {
          if (Math.abs(clampedX - p.x) < 110 && Math.abs(clampedY - p.y) < 38) {
            clampedY = Math.min(viewH - padY, p.y + 40);
          }
        }
        placed.push({ x: clampedX, y: clampedY });
      }

      item.el.style.transform = `translate(-50%, -50%) translate3d(${Math.round(clampedX)}px, ${Math.round(clampedY)}px, 0)`;
      item.el.style.opacity = '1';
    });
  });
}

window.addEventListener('resize', () => {
  handleResize();
  updateScrollState();
  projectStageLabels();
});
handleResize();
updateScrollState();

// Initial build + live neural forward pass
triggerSentenceUpdate(sentenceInput.value, 4);

function animate(now) {
  const t = reducedMotionQuery.matches ? 0 : now * 0.001;

  for (let i = 0; i < 10; i++) {
    stageGroups[i].visible = i === activeStep;
  }

  const preset = CAM_PRESETS[activeStep];
  const idleX = Math.sin(t * 0.45) * 0.35;
  const idleY = Math.cos(t * 0.35) * 0.18;

  // Pull camera back automatically on narrow viewports so wide 3D graphs never clip
  const isCompactViewport = viewW < 640;
  const aspectZoom = isCompactViewport ? 1.28 : camera.aspect < 1.0 ? 1.15 : 1.0;

  const desiredPos = new THREE.Vector3(
    preset.pos[0] + idleX + userYaw * 5.0,
    preset.pos[1] + idleY + userPitch * 4.0,
    preset.pos[2] * aspectZoom
  );
  const desiredTarget = new THREE.Vector3(preset.target[0], preset.target[1], preset.target[2]);

  camCurrentPos.lerp(desiredPos, 0.08);
  camCurrentTarget.lerp(desiredTarget, 0.08);
  camera.position.copy(camCurrentPos);
  camera.lookAt(camCurrentTarget);

  starField.rotation.y = t * 0.025;

  if (activeStep === 0) {
    s0Objs.blocks.forEach((b, i) => {
      b.position.y = -0.3 + Math.sin(t * 2.2 + i * 0.7) * 0.07;
      b.rotation.y = Math.sin(t * 0.8 + i) * 0.06;
    });
    s0Objs.travelers.forEach((tr) => {
      const u = (t * 0.42 + tr.offset) % 1;
      tr.curve.getPoint(u, tr.mesh.position);
    });
    s0Objs.meanings.forEach((m, i) => {
      m.rotation.y = t * (i === 0 ? 0.8 : -0.6);
      m.rotation.x = t * 0.4;
    });
  } else if (activeStep === 1) {
    s1Objs.byteCubes.forEach((bc) => {
      bc.mesh.position.y = 2.3 + Math.sin(t * 3.0 + bc.cIdx * 0.4) * 0.1;
      bc.mesh.rotation.x = t * 1.2 + bc.cIdx;
      bc.mesh.rotation.y = t * 0.9;
    });
    s1Objs.crystals.forEach((cr, i) => {
      cr.rotation.y = t * 0.8 + i * 0.5;
      cr.position.y = -0.55 + Math.sin(t * 2.0 + i) * 0.07;
    });
  } else if (activeStep === 2) {
    stageGroups[2].rotation.y = Math.sin(t * 0.38) * 0.2;
    if (s2Objs.natureSphere) s2Objs.natureSphere.rotation.y = t * 0.22;
    if (s2Objs.financeSphere) s2Objs.financeSphere.rotation.y = -t * 0.22;
    if (s2Objs.bankArrow) s2Objs.bankArrow.position.x = Math.sin(t * 2.8) * 0.1;
  } else if (activeStep === 3) {
    s3Objs.dials.forEach((d, m) => {
      d.group.rotation.x = Math.sin(t * 1.4 + m * 0.4) * 0.1;
    });
  } else if (activeStep === 4) {
    s4Objs.prisms.forEach((pr, i) => {
      pr.rotation.x = t * 0.45 + i;
      pr.rotation.y = t * 0.65 + i;
    });
    s4Objs.photons.forEach((ph) => {
      const u = (t * 0.52 + ph.offset) % 1;
      ph.curve.getPoint(u, ph.mesh.position);
    });
  } else if (activeStep === 5) {
    stageGroups[5].rotation.y = Math.sin(t * 0.35) * 0.24;
    if (s5Objs.sphere) s5Objs.sphere.rotation.y = t * 0.1;
  } else if (activeStep === 6) {
    stageGroups[6].rotation.y = Math.sin(t * 0.32) * 0.16;
    s6Objs.towers.forEach((tw, idx) => {
      const pulse = 1 + Math.sin(t * 2.2 + idx * 0.5) * 0.035;
      tw.mesh.scale.y = pulse;
      tw.mesh.position.y = tw.baseY + (tw.baseH * pulse) / 2;
    });
  } else if (activeStep === 7) {
    stageGroups[7].rotation.y = Math.sin(t * 0.32) * 0.18;
    const pts = s7Objs.pathPoints;
    if (pts.length >= 4 && s7Objs.orb) {
      const segFloat = ((t * 0.6) % 1) * 3;
      const segIdx = Math.min(2, Math.floor(segFloat));
      const segFrac = segFloat - segIdx;
      s7Objs.orb.position.copy(pts[segIdx]).lerp(pts[segIdx + 1], segFrac);
    }
  } else if (activeStep === 8) {
    s8Objs.pulses.forEach((p) => {
      const u = (t * 0.35 + p.offset) % 1;
      p.mesh.position.set(-2.2, -3.6 + u * 7.2, 0);
    });
    s8Objs.heads.forEach((h, i) => {
      h.rotation.y = Math.sin(t * 1.4 + i) * 0.12;
    });
    if (s8Objs.mlpBox) s8Objs.mlpBox.rotation.y = Math.sin(t * 1.0) * 0.08;
  } else if (activeStep === 9) {
    const litIdx = Math.floor((t * 3.0) % 8);
    s9Objs.slabs.forEach((sl, idx) => {
      sl.material.emissiveIntensity = idx === litIdx ? 0.5 : 0.12;
      sl.scale.setScalar(idx === litIdx ? 1.03 : 1.0);
    });
  }

  renderer.render(scene, camera);
  projectStageLabels();

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
