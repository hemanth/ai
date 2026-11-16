/**
 * Reference Language Registry Specification
 * Exact authoritative reference contract for 12 Indic languages supported by Udgam Labs Paar models.
 */

export const LANGUAGES = {
  hi: {
    id: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    script: 'Devanagari',
    unicodeRegex: /[\u0900-\u097F]/,
    direction: 'ltr',
    speechLocale: 'hi-IN',
    paarModel: 'udgamlabs/Paar-en-hi',
    defaultPlaceholder: 'यहाँ टाइप करें या बोलें...',
  },
  bn: {
    id: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    script: 'Bengali',
    unicodeRegex: /[\u0980-\u09FF]/,
    direction: 'ltr',
    speechLocale: 'bn-IN',
    paarModel: 'udgamlabs/Paar-en-bn',
    defaultPlaceholder: 'এখানে লিখুন বা বলুন...',
  },
  mr: {
    id: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    script: 'Devanagari',
    unicodeRegex: /[\u0900-\u097F]/,
    direction: 'ltr',
    speechLocale: 'mr-IN',
    paarModel: 'udgamlabs/Paar-en-mr',
    defaultPlaceholder: 'येथे टाइप करा किंवा बोला...',
  },
  te: {
    id: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    script: 'Telugu',
    unicodeRegex: /[\u0C00-\u0C7F]/,
    direction: 'ltr',
    speechLocale: 'te-IN',
    paarModel: 'udgamlabs/Paar-en-te',
    defaultPlaceholder: 'ఇక్కడ టైప్ చేయండి లేదా మాట్లాడండి...',
  },
  ta: {
    id: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    script: 'Tamil',
    unicodeRegex: /[\u0B80-\u0BFF]/,
    direction: 'ltr',
    speechLocale: 'ta-IN',
    paarModel: 'udgamlabs/Paar-en-ta',
    defaultPlaceholder: 'இங்கு தட்டச்சு செய்யவும் அல்லது பேசவும்...',
  },
  gu: {
    id: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    script: 'Gujarati',
    unicodeRegex: /[\u0A80-\u0AFF]/,
    direction: 'ltr',
    speechLocale: 'gu-IN',
    paarModel: 'udgamlabs/Paar-en-gu',
    defaultPlaceholder: 'અહીં ટાઇપ કરો અથવા બોલો...',
  },
  ur: {
    id: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    script: 'Nastaliq',
    unicodeRegex: /[\u0600-\u06FF]/,
    direction: 'rtl',
    speechLocale: 'ur-IN',
    paarModel: 'udgamlabs/Paar-en-ur',
    defaultPlaceholder: 'یہاں ٹائپ کریں یا بولیں...',
  },
  kn: {
    id: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    script: 'Kannada',
    unicodeRegex: /[\u0C80-\u0CFF]/,
    direction: 'ltr',
    speechLocale: 'kn-IN',
    paarModel: 'udgamlabs/Paar-en-kn',
    defaultPlaceholder: 'ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮಾತನಾಡಿ...',
  },
  ml: {
    id: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    script: 'Malayalam',
    unicodeRegex: /[\u0D00-\u0D7F]/,
    direction: 'ltr',
    speechLocale: 'ml-IN',
    paarModel: 'udgamlabs/Paar-en-ml',
    defaultPlaceholder: 'ഇവിടെ ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ സംസാരിക്കുക...',
  },
  pa: {
    id: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    script: 'Gurmukhi',
    unicodeRegex: /[\u0A00-\u0A7F]/,
    direction: 'ltr',
    speechLocale: 'pa-IN',
    paarModel: 'udgamlabs/Paar-en-pa',
    defaultPlaceholder: 'ਇੱਥੇ ਟਾਈਪ ਕਰੋ ਜਾਂ ਬੋਲੋ...',
  },
  or: {
    id: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    script: 'Odia',
    unicodeRegex: /[\u0B00-\u0B7F]/,
    direction: 'ltr',
    speechLocale: 'or-IN',
    paarModel: 'udgamlabs/Paar-en-or',
    defaultPlaceholder: 'ଏଠାରେ ଟାଇପ୍ କରନ୍ତୁ କିମ୍ବା କୁହନ୍ତୁ...',
  },
  as: {
    id: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    script: 'Assamese',
    unicodeRegex: /[\u0980-\u09FF]/,
    direction: 'ltr',
    speechLocale: 'as-IN',
    paarModel: 'udgamlabs/Paar-en-as',
    defaultPlaceholder: 'ইয়াত টাইপ কৰক বা কওক...',
  },
};

export const DEFAULT_LANGUAGE_ID = 'kn';

/**
 * Returns language configuration for a given language ID
 * Falls back to default language (kn) if id is invalid or not found.
 * @param {string} id
 * @returns {typeof LANGUAGES[keyof typeof LANGUAGES]}
 */
export function getLanguage(id) {
  if (typeof id === 'string' && LANGUAGES[id.toLowerCase()]) {
    return LANGUAGES[id.toLowerCase()];
  }
  return LANGUAGES[DEFAULT_LANGUAGE_ID];
}

/**
 * Returns array of all 12 supported Indic languages
 * @returns {Array<typeof LANGUAGES[keyof typeof LANGUAGES]>}
 */
export function getAllLanguages() {
  return Object.values(LANGUAGES);
}

/**
 * Validates if an ID corresponds to one of the 12 supported Indic languages
 * @param {string} id
 * @returns {boolean}
 */
export function isValidLanguage(id) {
  if (!id || typeof id !== 'string') return false;
  return Boolean(LANGUAGES[id.toLowerCase()]);
}
