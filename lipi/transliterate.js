/**
 * Phonetic → Kannada transliteration engine.
 * Type English phonetically, get Kannada on space/enter.
 * Covers all consonants, vowels, conjuncts, and common patterns.
 */

// Vowel matras (after a consonant)
const MATRAS = {
  'aa': 'ಾ', 'A': 'ಾ',
  'ii': 'ೀ', 'I': 'ೀ', 'ee': 'ೀ',
  'uu': 'ೂ', 'U': 'ೂ', 'oo': 'ೂ',
  'ai': 'ೈ',
  'au': 'ೌ',
  'ou': 'ೌ',
  'E': 'ೇ',
  'O': 'ೋ',
  'a': '',    // inherent vowel, no matra
  'i': 'ಿ',
  'u': 'ು',
  'e': 'ೆ',
  'o': 'ೊ',
  'R': 'ೃ', 'Ru': 'ೃ',
};

// Independent vowels
const VOWELS = {
  'aa': 'ಆ', 'A': 'ಆ',
  'ii': 'ಈ', 'I': 'ಈ', 'ee': 'ಈ',
  'uu': 'ಊ', 'U': 'ಊ', 'oo': 'ಊ',
  'ai': 'ಐ',
  'au': 'ಔ',
  'ou': 'ಔ',
  'E': 'ಏ',
  'O': 'ಓ',
  'a': 'ಅ',
  'i': 'ಇ',
  'u': 'ಉ',
  'e': 'ಎ',
  'o': 'ಒ',
  'R': 'ಋ', 'Ru': 'ಋ',
};

// Consonants → Kannada base + halant for conjuncts
const CONSONANTS = {
  'kh': 'ಖ', 'gh': 'ಘ', 'ng': 'ಙ',
  'chh': 'ಛ', 'Ch': 'ಛ', 'ch': 'ಚ',
  'jh': 'ಝ', 'nj': 'ಞ',
  'Th': 'ಠ', 'Dh': 'ಢ', 'Sh': 'ಷ',
  'th': 'ಥ', 'dh': 'ಧ', 'ph': 'ಫ',
  'bh': 'ಭ', 'sh': 'ಶ',
  'T': 'ಟ', 'D': 'ಡ', 'N': 'ಣ',
  'k': 'ಕ', 'g': 'ಗ',
  'c': 'ಚ', 'j': 'ಜ',
  't': 'ತ', 'd': 'ದ', 'n': 'ನ',
  'p': 'ಪ', 'b': 'ಬ', 'm': 'ಮ',
  'y': 'ಯ', 'r': 'ರ', 'l': 'ಲ',
  'v': 'ವ', 'w': 'ವ',
  's': 'ಸ', 'h': 'ಹ',
  'L': 'ಳ', 'f': 'ಫ಼',
  'q': 'ಕ', 'x': 'ಕ್ಸ', 'z': 'ಜ಼',
};

const HALANT = '್';
const ANUSVARA = 'ಂ';
const VISARGA = 'ಃ';

// Sorted by length descending so longer matches come first
const CONSONANT_KEYS = Object.keys(CONSONANTS).sort((a, b) => b.length - a.length);
const VOWEL_KEYS = Object.keys(VOWELS).sort((a, b) => b.length - a.length);
const MATRA_KEYS = Object.keys(MATRAS).sort((a, b) => b.length - a.length);

function matchAt(str, pos, keys) {
  for (const key of keys) {
    if (str.substr(pos, key.length) === key) return key;
  }
  return null;
}

/**
 * Transliterate a Latin string to Kannada.
 */
export function transliterate(input) {
  let result = '';
  let i = 0;
  let lastWasConsonant = false;

  while (i < input.length) {
    const ch = input[i];

    // Numbers pass through
    if (/[0-9]/.test(ch)) {
      result += ch; i++; lastWasConsonant = false; continue;
    }

    // Punctuation / whitespace pass through
    if (/[^a-zA-Z]/.test(ch)) {
      result += ch; i++; lastWasConsonant = false; continue;
    }

    // Anusvara: M after vowel
    if (ch === 'M' && lastWasConsonant === false && i > 0) {
      result += ANUSVARA; i++; continue;
    }

    // H as visarga after vowel sound
    if (ch === 'H' && lastWasConsonant === false && i > 0 && i === input.length - 1) {
      result += VISARGA; i++; continue;
    }

    // Try consonant match
    const cKey = matchAt(input, i, CONSONANT_KEYS);
    if (cKey) {
      const base = CONSONANTS[cKey];
      i += cKey.length;

      // Look for a vowel matra after the consonant
      const mKey = matchAt(input, i, MATRA_KEYS);
      if (mKey) {
        result += base + MATRAS[mKey];
        i += mKey.length;
        lastWasConsonant = (MATRAS[mKey] === ''); // 'a' is inherent
      } else {
        // Check if next char is a consonant → add halant
        const nextC = matchAt(input, i, CONSONANT_KEYS);
        if (nextC && i < input.length) {
          result += base + HALANT;
          lastWasConsonant = true;
        } else if (i >= input.length) {
          // End of word, add halant
          result += base + HALANT;
          lastWasConsonant = false;
        } else {
          // Default: inherent 'a'
          result += base;
          lastWasConsonant = true;
        }
      }
      continue;
    }

    // Try independent vowel
    const vKey = matchAt(input, i, VOWEL_KEYS);
    if (vKey) {
      result += VOWELS[vKey];
      i += vKey.length;
      lastWasConsonant = false;
      continue;
    }

    // Fallback: pass through
    result += ch;
    i++;
    lastWasConsonant = false;
  }

  return result;
}
