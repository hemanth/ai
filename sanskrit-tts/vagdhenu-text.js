/**
 * Vāgdhenu — Pure JavaScript Deterministic Sanskrit Phonetic & Chandas Engine
 * Exact port of:
 *   - src/prep_text.py (Brahmic script detection, Devanagari <-> SLP1 <-> Kannada, visarga sandhi)
 *   - src/render_core.py (homorganic anusvāra, satva, visarga-kṣa echo, daṇḍa-final fix, hna metathesis, akṣara counter)
 *   - src/tts_syllabify.py (Pāṇinian maximize-onset syllable segmenter)
 *   - src/tts_weight.py (Guru / Laghu prosodic weight tagger with causes)
 *   - src/tts_meter.py (Vṛtta / Chandas meter classifier & sutra detector)
 *
 * Zero dependencies. Runs in <1ms in any desktop/mobile browser or Node/Bun/Deno runtime.
 */

// ── 1. Brahmic Script Detection & Transliteration (Devanagari <-> SLP1 <-> Kannada) ──

const SCRIPT_BLOCKS = [
  [0x0900, 0x097F, "devanagari", 0x0900],
  [0x0980, 0x09FF, "bengali",    0x0980],
  [0x0A00, 0x0A7F, "gurmukhi",   0x0A00],
  [0x0A80, 0x0AFF, "gujarati",   0x0A80],
  [0x0B00, 0x0B7F, "oriya",      0x0B00],
  [0x0B80, 0x0BFF, "tamil",      0x0B80],
  [0x0C00, 0x0C7F, "telugu",     0x0C00],
  [0x0C80, 0x0CFF, "kannada",    0x0C80],
  [0x0D00, 0x0D7F, "malayalam",  0x0D00],
  [0x11300, 0x1137F, "grantha",  0x11300],
];

// Devanagari independent vowels -> SLP1
const DEVA_INDEP_VOWELS = {
  "अ": "a", "आ": "A", "इ": "i", "ई": "I", "उ": "u", "ऊ": "U",
  "ऋ": "f", "ॠ": "F", "ऌ": "x", "ॡ": "X",
  "ए": "e", "ऐ": "E", "ओ": "o", "औ": "O",
  "ॲ": "e", "ऑ": "o", "ऎ": "e", "ऒ": "o"
};

// Devanagari vowel matras -> SLP1
const DEVA_MATRA_TO_SLP1 = {
  "ा": "A", "ि": "i", "ी": "I", "ु": "u", "ू": "U",
  "ृ": "f", "ॄ": "F", "ॢ": "x", "ॣ": "X",
  "े": "e", "ै": "E", "ो": "o", "ौ": "O",
  "ॅ": "e", "ॉ": "o", "ॆ": "e", "ॊ": "o"
};

// Devanagari consonants -> SLP1 (without inherent 'a')
const DEVA_CONS_TO_SLP1 = {
  "क": "k", "ख": "K", "ग": "g", "घ": "G", "ङ": "N",
  "च": "c", "छ": "C", "ज": "j", "झ": "J", "ञ": "Y",
  "ट": "w", "ठ": "W", "ड": "q", "ढ": "Q", "ण": "R",
  "त": "t", "थ": "T", "द": "d", "ध": "D", "न": "n",
  "प": "p", "फ": "P", "ब": "b", "भ": "B", "म": "m",
  "य": "y", "र": "r", "ल": "l", "ळ": "L", "व": "v",
  "श": "S", "ष": "z", "स": "s", "ह": "h"
};

const DEVA_MISC_TO_SLP1 = {
  "ं": "M",
  "ः": "H",
  "ँ": "~",
  "ऽ": "'",
  "ॐ": "oM",
  "।": ".",
  "॥": "..",
  "०": "0", "१": "1", "२": "2", "३": "3", "४": "4",
  "५": "5", "६": "6", "७": "7", "८": "8", "९": "9"
};

// SLP1 -> Kannada maps
const SLP1_INDEP_TO_KAN = {
  "a": "ಅ", "A": "ಆ", "i": "ಇ", "I": "ಈ", "u": "ಉ", "U": "ಊ",
  "f": "ಋ", "F": "ೠ", "x": "ಌ", "X": "ೡ",
  "e": "ಏ", "E": "ಐ", "o": "ಓ", "O": "ಔ"
};

const SLP1_MATRA_TO_KAN = {
  "a": "",  "A": "ಾ", "i": "ಿ", "I": "ೀ", "u": "ು", "U": "ೂ",
  "f": "ೃ", "F": "ೄ", "x": "ೢ", "X": "ೣ",
  "e": "ೇ", "E": "ೈ", "o": "ೋ", "O": "ೌ"
};

const SLP1_CONS_TO_KAN = {
  "k": "ಕ", "K": "ಖ", "g": "ಗ", "G": "ಘ", "N": "ಙ",
  "c": "ಚ", "C": "ಛ", "j": "ಜ", "J": "ಝ", "Y": "ಞ",
  "w": "ಟ", "W": "ಠ", "q": "ಡ", "Q": "ಢ", "R": "ಣ",
  "t": "ತ", "T": "ಥ", "d": "ದ", "D": "ಧ", "n": "ನ",
  "p": "ಪ", "P": "ಫ", "b": "ಬ", "B": "ಭ", "m": "ಮ",
  "y": "ಯ", "r": "ರ", "l": "ಲ", "L": "ಳ", "v": "ವ",
  "S": "ಶ", "z": "ಷ", "s": "ಸ", "h": "ಹ"
};

const SLP1_MISC_TO_KAN = {
  "M": "ಂ",
  "H": "ಃ",
  "~": "ँ",
  "'": "ಽ"
};

// Kannada short e/o -> long ē/ō normalization when converting to Devanagari
const SHORT_DRAVIDIAN_OFFSETS = new Map([
  [0x0E, 0x0F], // short Indep E -> long Indep E
  [0x12, 0x13], // short Indep O -> long Indep O
  [0x46, 0x47], // short matra e -> long matra e
  [0x4A, 0x4B], // short matra o -> long matra o
]);

export function detectScript(text) {
  for (const ch of text) {
    const code = ch.codePointAt(0);
    for (const [lo, hi, scheme] of SCRIPT_BLOCKS) {
      if (code >= lo && code <= hi) return scheme;
    }
  }
  return "devanagari";
}

export function toDeva(text) {
  const src = detectScript(text);
  if (src === "devanagari") return text;
  const block = SCRIPT_BLOCKS.find((b) => b[2] === src);
  if (!block) return text;
  const base = block[3];
  let out = "";
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (code >= block[0] && code <= block[1]) {
      let offset = code - base;
      if (SHORT_DRAVIDIAN_OFFSETS.has(offset)) {
        offset = SHORT_DRAVIDIAN_OFFSETS.get(offset);
      }
      out += String.fromCodePoint(0x0900 + offset);
    } else {
      out += ch;
    }
  }
  return out;
}

export function devaToSlp1(deva) {
  const chars = Array.from(deva);
  const n = chars.length;
  let out = "";
  let i = 0;
  while (i < n) {
    const c = chars[i];
    if (DEVA_INDEP_VOWELS[c] !== undefined) {
      out += DEVA_INDEP_VOWELS[c];
      i++;
    } else if (DEVA_CONS_TO_SLP1[c] !== undefined) {
      out += DEVA_CONS_TO_SLP1[c];
      const nxt = i + 1 < n ? chars[i + 1] : "";
      if (nxt === "्") {
        i += 2; // Virama suppresses inherent 'a'
      } else if (DEVA_MATRA_TO_SLP1[nxt] !== undefined) {
        out += DEVA_MATRA_TO_SLP1[nxt];
        i += 2;
      } else {
        out += "a";
        i++;
      }
    } else if (DEVA_MATRA_TO_SLP1[c] !== undefined) {
      out += DEVA_MATRA_TO_SLP1[c];
      i++;
    } else if (c === "्") {
      i++;
    } else if (DEVA_MISC_TO_SLP1[c] !== undefined) {
      out += DEVA_MISC_TO_SLP1[c];
      i++;
    } else {
      out += c;
      i++;
    }
  }
  return out;
}

export function slp1ToKannada(slp) {
  const chars = Array.from(slp);
  const n = chars.length;
  let out = "";
  let i = 0;
  while (i < n) {
    const c = chars[i];
    if (SLP1_CONS_TO_KAN[c] !== undefined) {
      out += SLP1_CONS_TO_KAN[c];
      const nxt = i + 1 < n ? chars[i + 1] : "";
      if (SLP1_MATRA_TO_KAN[nxt] !== undefined) {
        out += SLP1_MATRA_TO_KAN[nxt];
        i += 2;
      } else {
        out += "್";
        i++;
      }
    } else if (SLP1_INDEP_TO_KAN[c] !== undefined) {
      out += SLP1_INDEP_TO_KAN[c];
      i++;
    } else if (SLP1_MISC_TO_KAN[c] !== undefined) {
      out += SLP1_MISC_TO_KAN[c];
      i++;
    } else {
      out += c;
      i++;
    }
  }
  return out;
}

// ── 2. Text Normalization & Visarga / Anusvāra Sandhi (src/prep_text.py & src/render_core.py) ──

const VISARGA = "ः";
const PUNCT_DROP = new Set(Array.from("।॥|/\\—–\"'“”‘’„«»‹›*•·().,;!?‌‍"));

export function fixColon(deva) {
  return deva.replace(/:-/g, VISARGA).replace(/:/g, VISARGA);
}

export function stripPunct(deva) {
  const s = fixColon(deva);
  const out = [];
  for (const c of s) {
    if (
      PUNCT_DROP.has(c) ||
      (c >= "0" && c <= "9") ||
      (c >= "०" && c <= "९") ||
      c === "-" || c === "–" || c === "—"
    ) {
      continue;
    }
    out.push(c);
  }
  return out.join("").replace(/\s+/g, " ").trim();
}

const VS_VOICED = new Set(Array.from("gGjJqQdDbBNYRnmyrlvh"));
const VS_OTHERV = new Set(Array.from("iIuUfFxXeEoO"));
const VS_ALLV   = new Set(Array.from("aAiIuUfFxXeEoO"));
const VS_LEN    = { a: "A", i: "I", u: "U", f: "F", A: "A", I: "I", U: "U" };

export function visargaSandhi(slp) {
  const ws = slp.split(" ");
  const out = [];
  let i = 0;
  while (i < ws.length) {
    const w = ws[i];
    if (w.endsWith("H") && i < ws.length - 1 && w.length >= 2) {
      const V = w[w.length - 2];
      const base = w.slice(0, -1);
      const nxt = ws[i + 1];
      const F = nxt ? nxt[0] : "";
      if (F === "r") {
        out.push(base.slice(0, -1) + (VS_LEN[V] || V));
        i++;
        continue;
      }
      if ((w === "saH" || w === "ezaH") && F !== "a") {
        out.push(base);
        i++;
        continue;
      }
      if (!VS_ALLV.has(F) && !VS_VOICED.has(F)) {
        out.push(w);
        i++;
        continue;
      }
      if (V === "a") {
        if (F === "a") {
          out.push(base.slice(0, -1) + "o");
          ws[i + 1] = "'" + nxt.slice(1);
          i++;
          continue;
        }
        if (VS_VOICED.has(F)) {
          out.push(base.slice(0, -1) + "o");
          i++;
          continue;
        }
        out.push(base);
        i++;
        continue;
      }
      if (V === "A") {
        out.push(base);
        i++;
        continue;
      }
      if (VS_OTHERV.has(V)) {
        out.push(base + "r");
        i++;
        continue;
      }
      out.push(w);
      i++;
    } else {
      out.push(w);
      i++;
    }
  }
  return out.join(" ");
}

export function visargaEchoFinal(slp) {
  const ws = slp.split(" ");
  if (ws.length > 0) {
    const last = ws[ws.length - 1];
    if (last.endsWith("H") && last.length >= 2 && VS_ALLV.has(last[last.length - 2])) {
      ws[ws.length - 1] = last.slice(0, -1) + "h" + last[last.length - 2];
    }
  }
  return ws.join(" ");
}

export function modelText(srcText) {
  let slp = devaToSlp1(stripPunct(toDeva(srcText)));
  slp = slp.replace(/F/g, "rU");
  return slp1ToKannada(slp);
}

export function modelTextSandhi(srcText, echoFinal = true) {
  let slp = devaToSlp1(stripPunct(toDeva(srcText)));
  slp = visargaSandhi(slp);
  if (echoFinal) {
    slp = visargaEchoFinal(slp);
  }
  slp = slp.replace(/F/g, "rU");
  return slp1ToKannada(slp);
}

export function alignSlp1(srcText) {
  let slp = devaToSlp1(stripPunct(toDeva(srcText)));
  slp = slp.replace(/['’]/g, "");
  slp = slp.replace(/L/g, "l").replace(/\|/g, "");
  slp = slp.replace(/F/g, "rU");
  return slp.replace(/\s+/g, " ").trim();
}

// ── 3. Render-time Kannada Phonetic Refinements (src/render_core.py) ──

const VMATRA = new Set(Array.from("ಾಿೀುೂೃೄೆೇೈೊೋೌ"));
const VECHO_SHORT = { "ಿ": "ಹಿ", "ು": "ಹು", "ೃ": "ಹೃ" };
const VLONG = new Set(Array.from("ಾೀೂೄೆೇೈೊೋೌ"));

export function dandaFix(s) {
  s = s.trimEnd();
  if (!s) return s;
  if (s.endsWith("ಃ")) {
    const core = s.slice(0, -1);
    const pv = core ? core[core.length - 1] : "";
    if (VECHO_SHORT[pv] !== undefined) {
      s = core + VECHO_SHORT[pv];
    } else if (VLONG.has(pv)) {
      // keep ಃ after long vowel
    } else {
      s = core + "ಹ";
    }
  } else if (s.endsWith("ಂ")) {
    s = s.slice(0, -1) + "ಮ್";
  }
  return s;
}

const AN_KA  = new Set(Array.from("ಕಖಗಘಙ"));
const AN_CA  = new Set(Array.from("ಚಛಜಝಞ"));
const AN_TTA = new Set(Array.from("ಟಠಡಢಣ"));
const AN_TA  = new Set(Array.from("ತಥದಧನ"));

export function anusvaraM(s) {
  const chars = Array.from(s);
  const n = chars.length;
  const res = [];
  for (let i = 0; i < n; i++) {
    const c = chars[i];
    if (c === "ಂ") {
      let j = i + 1;
      while (j < n && chars[j] === " ") j++;
      const nxt = j < n ? chars[j] : "";
      if (!nxt) res.push("ಂ");
      else if (AN_KA.has(nxt)) res.push("ಙ್");
      else if (AN_CA.has(nxt)) res.push("ಞ್");
      else if (AN_TTA.has(nxt)) res.push("ಣ್");
      else if (AN_TA.has(nxt)) res.push("ನ್");
      else res.push("ಮ್");
    } else {
      res.push(c);
    }
  }
  return res.join("");
}

const SATVA_MAP = { "ಚ": "ಶ್", "ಛ": "ಶ್", "ಟ": "ಷ್", "ಠ": "ಷ್", "ತ": "ಸ್", "ಥ": "ಸ್" };

export function satva(s) {
  const chars = Array.from(s);
  const n = chars.length;
  const out = [];
  let i = 0;
  while (i < n) {
    const c = chars[i];
    if (c === "ಃ") {
      let j = i + 1;
      while (j < n && chars[j] === " ") j++;
      const nxt = j < n ? chars[j] : "";
      if (SATVA_MAP[nxt] !== undefined) {
        out.push(SATVA_MAP[nxt]);
        i = j;
        continue;
      }
    }
    out.push(c);
    i++;
  }
  return out.join("");
}

const KSHA = "ಕ್ಷ";

export function visargaKsha(s) {
  const chars = Array.from(s);
  const n = chars.length;
  const out = [];
  let i = 0;
  while (i < n) {
    const c = chars[i];
    if (c === "ಃ") {
      let j = i + 1;
      while (j < n && chars[j] === " ") j++;
      if (chars.slice(j, j + 3).join("") === KSHA) {
        const pv = out.length > 0 ? out[out.length - 1] : "";
        if (VECHO_SHORT[pv] !== undefined) {
          out.push(VECHO_SHORT[pv]);
          i++;
          continue;
        } else if (VLONG.has(pv)) {
          out.push("ಃ");
          i++;
          continue;
        } else {
          out.push("ಹ");
          i++;
          continue;
        }
      }
    }
    out.push(c);
    i++;
  }
  return out.join("");
}

export function hnaMetathesis(s) {
  return s.replace(/ಹ್ಣ/g, "ಣ್ಹ").replace(/ಹ್ನ/g, "ನ್ಹ");
}

export function vocalicL(s) {
  return s.replace(/ೢ/g, "್ಲೃ").replace(/ೣ/g, "್ಲೄ").replace(/ಌ/g, "ಲೃ").replace(/ೡ/g, "ಲೄ");
}

export function nAksharas(s) {
  const chars = Array.from(s);
  const L = chars.length;
  let n = 0;
  for (let i = 0; i < L; i++) {
    const o = chars[i].codePointAt(0);
    const indep = (o >= 0x0905 && o <= 0x0914) || (o >= 0x0C85 && o <= 0x0C94);
    const cons  = (o >= 0x0915 && o <= 0x0939) || (o >= 0x0C95 && o <= 0x0CB9);
    if (indep) {
      n++;
    } else if (cons) {
      const nxt = i + 1 < L ? chars[i + 1] : "";
      if (nxt !== "्" && nxt !== "್") {
        n++;
      }
    }
  }
  return n;
}

export function aksharas(s) {
  const chars = Array.from(s);
  const out = [];
  let cur = "";
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    const o = c.codePointAt(0);
    const base =
      (o >= 0x0C85 && o <= 0x0C94) ||
      (o >= 0x0905 && o <= 0x0914) ||
      (o >= 0x0C95 && o <= 0x0CB9) ||
      (o >= 0x0915 && o <= 0x0939);
    const prev = i > 0 ? chars[i - 1] : "";
    if (base && prev !== "್" && prev !== "्") {
      if (cur) out.push(cur);
      cur = c;
    } else {
      cur += c;
    }
  }
  if (cur) out.push(cur);
  return out;
}

export function repDepths(aks) {
  const n = aks.length;
  let mono = 1;
  let i = 0;
  while (i < n) {
    let j = i + 1;
    while (j < n && aks[j] === aks[i]) j++;
    mono = Math.max(mono, j - i);
    i = j > i + 1 ? j : i + 1;
  }
  let di = 1;
  i = 0;
  while (i + 1 < n) {
    if (aks[i] !== aks[i + 1]) {
      let cnt = 1;
      let j = i + 2;
      while (j + 1 < n && aks[j] === aks[i] && aks[j + 1] === aks[i + 1]) {
        cnt++;
        j += 2;
      }
      di = Math.max(di, cnt);
      i = cnt > 1 ? j : i + 1;
    } else {
      i++;
    }
  }
  return [mono, di];
}

export function endsHalant(txt) {
  const t = txt.replace(/[ ।॥|.,;:!?‌‍]+$/g, "");
  return t.length > 0 && (t.endsWith("्") || t.endsWith("್"));
}

export function splitPadas(text) {
  const pieces = [];
  const norm = text.replace(/॥/g, "।").replace(/\|/g, "।");
  for (const line of norm.split(/\r?\n/)) {
    for (const seg of line.split("।")) {
      const s = seg.trim();
      if (s) pieces.push(s);
    }
  }
  if (pieces.length === 0 && text.trim()) {
    return [text.trim()];
  }
  return pieces;
}

export function preparePieces(text, noSandhi = false) {
  const padas = Array.isArray(text) ? text : splitPadas(text);
  let pieces = padas.map((p) =>
    !noSandhi ? modelTextSandhi(p, false) : modelText(p)
  );
  if (!noSandhi) {
    pieces = pieces.map((x) => satva(x));
  }
  pieces = pieces.map((x) => dandaFix(visargaKsha(anusvaraM(x))));
  pieces = pieces.map((x) => hnaMetathesis(x));
  pieces = pieces.map((x) => vocalicL(x));
  return { padas, pieces };
}

// ── 4. Syllable Segmenter, Guru/Laghu Weight Tagger & Vṛtta Classifier ──

const SLP_VOWELS = new Set(Array.from("aAiIuUfFxXeEoO"));
const SLP_SEPS   = new Set([" ", "|"]);
const LONG_VOWELS = new Set(Array.from("AIUFXeEoO"));

export function syllabify(slp1) {
  const syllables = [];
  const n = slp1.length;
  let i = 0;
  let onsetBuf = [];

  function attachTrailingToLast(cons) {
    if (syllables.length === 0) return;
    const txt = cons.join("");
    syllables[syllables.length - 1].coda += txt;
    syllables[syllables.length - 1].text += txt;
  }

  while (i < n) {
    const c = slp1[i];
    if (c === "'") {
      i++;
      continue;
    }
    if (SLP_SEPS.has(c)) {
      attachTrailingToLast(onsetBuf);
      onsetBuf = [];
      if (c === "|" && syllables.length > 0) {
        syllables[syllables.length - 1].is_pada_final = true;
        syllables[syllables.length - 1].is_word_final = true;
      } else if (c === " " && syllables.length > 0) {
        syllables[syllables.length - 1].is_word_final = true;
      }
      i++;
      continue;
    }
    if (SLP_VOWELS.has(c)) {
      const syl = {
        text: onsetBuf.join("") + c,
        onset: onsetBuf.join(""),
        vowel: c,
        coda: "",
        is_word_final: false,
        is_pada_final: false,
      };
      syllables.push(syl);
      onsetBuf = [];
      i++;
      const consBetween = [];
      while (
        i < n &&
        !SLP_VOWELS.has(slp1[i]) &&
        !SLP_SEPS.has(slp1[i]) &&
        slp1[i] !== "'"
      ) {
        const cc = slp1[i];
        if (cc === "~" && consBetween.length > 0) {
          consBetween[consBetween.length - 1] += "~";
        } else {
          consBetween.push(cc);
        }
        i++;
      }
      if (i < n && SLP_VOWELS.has(slp1[i])) {
        if (consBetween.length >= 2) {
          const codaPart = consBetween.slice(0, -1);
          const onsetPart = consBetween.slice(-1);
          syllables[syllables.length - 1].coda = codaPart.join("");
          syllables[syllables.length - 1].text += syllables[syllables.length - 1].coda;
          onsetBuf = onsetPart;
        } else if (consBetween.length === 1) {
          onsetBuf = consBetween;
        }
      } else {
        syllables[syllables.length - 1].coda = consBetween.join("");
        syllables[syllables.length - 1].text += syllables[syllables.length - 1].coda;
        onsetBuf = [];
      }
      continue;
    }
    if (c === "~" && onsetBuf.length > 0) {
      onsetBuf[onsetBuf.length - 1] += "~";
    } else {
      onsetBuf.push(c);
    }
    i++;
  }

  attachTrailingToLast(onsetBuf);
  if (syllables.length > 0) {
    syllables[syllables.length - 1].is_word_final = true;
    syllables[syllables.length - 1].is_pada_final = true;
  }
  return syllables;
}

function clusterChars(s) {
  return Array.from(s).filter((c) => c !== "~");
}

export function tagWeights(syllables) {
  for (let k = 0; k < syllables.length; k++) {
    const s = syllables[k];
    const v = s.vowel;
    if (LONG_VOWELS.has(v)) {
      s.weight = "G";
      s.weight_cause = "long_vowel";
      continue;
    }
    const gap = clusterChars(s.coda);
    if (!s.is_pada_final && k + 1 < syllables.length) {
      gap.push(...clusterChars(syllables[k + 1].onset));
    }
    if (gap.length > 0 && gap[0] === "H") {
      s.weight = "G";
      s.weight_cause = "visarga";
      continue;
    }
    if (gap.length > 0 && gap[0] === "M") {
      s.weight = "G";
      s.weight_cause = "anusvara";
      continue;
    }
    if (gap.length >= 2) {
      s.weight = "G";
      s.weight_cause = "cluster";
      continue;
    }
    if (s.is_pada_final) {
      s.weight = "G";
      s.weight_cause = "pada_final_anceps";
      continue;
    }
    s.weight = "L";
    s.weight_cause = "light";
  }
}

export const METERS = [
  ["indravajra",        11, ["GGLGGLLGLGG"]],
  ["upendravajra",      11, ["LGLGGLLGLGG"]],
  ["upajati",           11, ["GGLGGLLGLGG", "LGLGGLLGLGG"]],
  ["vamshastha",        12, ["LGLGGLLGLGLG"]],
  ["indravamsha",       12, ["GGLGGLLGLGLG"]],
  ["vasantatilaka",     14, ["GGLGLLLGLLGLGG"]],
  ["malini",            15, ["LLLLLLGGLGGLGGG"]],
  ["shikharini",        17, ["LGGGGGLLLLLGGGGLG"]],
  ["mandakranta",       17, ["GGGGLLLLLGGLGGLGG"]],
  ["harini",            17, ["LLLLLGGGGGLGLLGLG"]],
  ["prithvi",           17, ["LGLLLGLGLLLGGLGGL"]],
  ["shardulavikridita", 19, ["GGGLLGLGLLLGGGLGGLG"]],
  ["sragdhara",         21, ["GGGGLGGGLLLLLLGGLGGLG"]],
];

const ANUSHTUBH_PADA = 8;

function matchPada(observed, template) {
  if (observed.length !== template.length) return false;
  for (let i = 0; i < template.length - 1; i++) {
    if (observed[i] !== template[i]) return false;
  }
  return true; // last position is anceps
}

function matchMeter(pattern, plen, templates) {
  if (pattern.length !== 4 * plen) return false;
  for (let i = 0; i < 4; i++) {
    const pada = pattern.slice(i * plen, (i + 1) * plen);
    if (!templates.some((t) => matchPada(pada, t))) return false;
  }
  return true;
}

export function detectMeter(syllables) {
  const pattern = syllables.map((s) => s.weight).join("");
  const n = pattern.length;
  for (const [name, plen, templates] of METERS) {
    if (matchMeter(pattern, plen, templates)) {
      return {
        name,
        pada_length: plen,
        num_padas: 4,
        padas: [0, 1, 2, 3].map((i) => pattern.slice(i * plen, (i + 1) * plen)),
      };
    }
  }
  if (n === 4 * ANUSHTUBH_PADA) {
    return {
      name: "anushtubh",
      pada_length: ANUSHTUBH_PADA,
      num_padas: 4,
      padas: [0, 1, 2, 3].map((i) => pattern.slice(i * 8, (i + 1) * 8)),
    };
  }
  if (n === 2 * ANUSHTUBH_PADA) {
    return {
      name: "anushtubh_half",
      pada_length: ANUSHTUBH_PADA,
      num_padas: 2,
      padas: [0, 1].map((i) => pattern.slice(i * 8, (i + 1) * 8)),
    };
  }
  return {
    name: "unknown",
    pada_length: null,
    num_padas: null,
    padas: [pattern],
  };
}

export function detectMeterKey(text) {
  try {
    let d = toDeva(text).replace(/॥/g, "|").replace(/।/g, "|").replace(/\r?\n/g, " | ");
    d = Array.from(d)
      .filter((c) => !((c >= "0" && c <= "9") || (c >= "०" && c <= "९")) && !"\"'“”‘’()".includes(c))
      .join("");
    const slp = devaToSlp1(d).replace(/\s+/g, " ").trim();
    const syls = syllabify(slp);
    tagWeights(syls);
    const name = detectMeter(syls).name;
    if (name === "anushtubh_half" || name === "anushtubh") return "anushtubh";
    if (!name || name === "unknown") return "";
    return name;
  } catch {
    return "";
  }
}

export function analyzeVerse(text, noSandhi = false) {
  let d = toDeva(text).replace(/॥/g, "|").replace(/।/g, "|").replace(/\r?\n/g, " | ");
  d = Array.from(d)
    .filter((c) => !((c >= "0" && c <= "9") || (c >= "०" && c <= "९")) && !"\"'“”‘’()".includes(c))
    .join("");
  const slp = devaToSlp1(d).replace(/\s+/g, " ").trim();
  const syllables = syllabify(slp);
  tagWeights(syllables);
  const meter = detectMeter(syllables);
  const detectedKey = detectMeterKey(text);
  const { padas, pieces } = preparePieces(text, noSandhi);
  const nSylls = pieces.map((x) => nAksharas(x));
  return {
    script: detectScript(text),
    deva: toDeva(text),
    slp1: slp,
    syllables,
    meter,
    detectedMeterKey: detectedKey || "vasantatilaka",
    isFallbackMeter: !detectedKey,
    padas,
    kannadaPieces: pieces,
    nSylls,
  };
}
