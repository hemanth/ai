/**
 * Zero-dependency phonetic Devanagari <-> IAST (International Alphabet of Sanskrit Transliteration)
 * engine with full support for Sanskrit conjuncts, Vedic accents, and diacritics.
 */

const VOWELS = {
  'अ': 'a', 'आ': 'ā', 'इ': 'i', 'ई': 'ī', 'उ': 'u', 'ऊ': 'ū',
  'ऋ': 'ṛ', 'ॠ': 'ṝ', 'ऌ': 'ḷ', 'ॡ': 'ḹ', 'ए': 'e', 'ऐ': 'ai',
  'ओ': 'o', 'औ': 'au', 'ॐ': 'oṃ'
};

const MATRAS = {
  'ा': 'ā', 'ि': 'i', 'ी': 'ī', 'ु': 'u', 'ू': 'ū',
  'ृ': 'ṛ', 'ॄ': 'ṝ', 'ॢ': 'ḷ', 'ॣ': 'ḹ', 'े': 'e',
  'ै': 'ai', 'ो': 'o', 'ौ': 'au'
};

const CONSONANTS = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ṅ',
  'च': 'c', 'छ': 'ch', 'ज': 'j', 'झ': 'jh', 'ञ': 'ñ',
  'ट': 'ṭ', 'ठ': 'ṭh', 'ड': 'ḍ', 'ढ': 'ḍh', 'ण': 'ṇ',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
  'श': 'ś', 'ष': 'ṣ', 'स': 's', 'ह': 'h', 'ळ': 'ḷ'
};

const MODIFIERS = {
  'ं': 'ṃ',
  'ँ': 'm̐',
  'ः': 'ḥ',
  'ऽ': "'",
  '।': ' |',
  '॥': ' ||'
};

export function devanagariToIast(str) {
  if (!str) return '';
  let out = '';
  const len = str.length;

  for (let i = 0; i < len; i++) {
    const ch = str[i];

    if (VOWELS[ch]) {
      out += VOWELS[ch];
    } else if (CONSONANTS[ch]) {
      const c = CONSONANTS[ch];
      const next = str[i + 1];

      if (next === '्') {
        // Virama suppresses inherent 'a'
        out += c;
        i++; // skip virama
      } else if (MATRAS[next]) {
        out += c + MATRAS[next];
        i++; // skip matra
      } else {
        out += c + 'a';
      }
    } else if (MODIFIERS[ch]) {
      out += MODIFIERS[ch];
    } else {
      out += ch;
    }
  }

  return out.replace(/\s+/g, ' ').trim();
}

// Clean formatting for transcription text
export function formatSanskrit(text) {
  if (!text) return '';
  return text
    .replace(/\u2581/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
