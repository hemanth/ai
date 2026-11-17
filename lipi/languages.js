/**
 * Lipi Indic Voice Editor — Language Registry
 * Central definition for the 12 Paar-supported Indic languages:
 * Hindi, Bengali, Marathi, Telugu, Tamil, Gujarati, Urdu, Kannada,
 * Malayalam, Punjabi, Odia, Assamese.
 *
 * STT: Swanada Conformer-CTC INT8 (10 Indic heads + English head for EN->Indic)
 * NMT: Udgam Labs Paar Models (https://udgamlabs.com/models/paar)
 */

export const DEFAULT_LANGUAGE_ID = 'kn';

export const LANGUAGES = Object.freeze({
  hi: Object.freeze({
    id: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    lipiWord: 'लिपि',
    script: 'Devanagari',
    unicodeRegex: /[\u0900-\u097F]/,
    direction: 'ltr',
    speechLocale: 'hi-IN',
    swanadaSupported: true,
    paarModel: 'udgamlabs/Paar-en-hi',
    defaultPlaceholder: 'यहाँ टाइप करें या बोलें...',
  }),
  bn: Object.freeze({
    id: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    lipiWord: 'লিপি',
    script: 'Bengali',
    unicodeRegex: /[\u0980-\u09FF]/,
    direction: 'ltr',
    speechLocale: 'bn-IN',
    swanadaSupported: true,
    paarModel: 'udgamlabs/Paar-en-bn',
    defaultPlaceholder: 'এখানে লিখুন বা বলুন...',
  }),
  mr: Object.freeze({
    id: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    lipiWord: 'लिपी',
    script: 'Devanagari',
    unicodeRegex: /[\u0900-\u097F]/,
    direction: 'ltr',
    speechLocale: 'mr-IN',
    swanadaSupported: true,
    paarModel: 'udgamlabs/Paar-en-mr',
    defaultPlaceholder: 'येथे टाइप करा किंवा बोला...',
  }),
  te: Object.freeze({
    id: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    lipiWord: 'లిపి',
    script: 'Telugu',
    unicodeRegex: /[\u0C00-\u0C7F]/,
    direction: 'ltr',
    speechLocale: 'te-IN',
    swanadaSupported: true,
    paarModel: 'udgamlabs/Paar-en-te',
    defaultPlaceholder: 'ఇక్కడ టైప్ చేయండి లేదా మాట్లాడండి...',
  }),
  ta: Object.freeze({
    id: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    lipiWord: 'லிபி',
    script: 'Tamil',
    unicodeRegex: /[\u0B80-\u0BFF]/,
    direction: 'ltr',
    speechLocale: 'ta-IN',
    swanadaSupported: true,
    paarModel: 'udgamlabs/Paar-en-ta',
    defaultPlaceholder: 'இங்கு தட்டச்சு செய்யவும் அல்லது பேசவும்...',
  }),
  gu: Object.freeze({
    id: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    lipiWord: 'લિપિ',
    script: 'Gujarati',
    unicodeRegex: /[\u0A80-\u0AFF]/,
    direction: 'ltr',
    speechLocale: 'gu-IN',
    swanadaSupported: true,
    paarModel: 'udgamlabs/Paar-en-gu',
    defaultPlaceholder: 'અહીં ટાઇપ કરો અથવા બોલો...',
  }),
  ur: Object.freeze({
    id: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    lipiWord: 'لپی',
    script: 'Nastaliq',
    unicodeRegex: /[\u0600-\u06FF]/,
    direction: 'rtl',
    speechLocale: 'ur-IN',
    swanadaSupported: false,
    paarModel: 'udgamlabs/Paar-en-ur',
    defaultPlaceholder: 'یہاں ٹائپ کریں یا بولیں...',
  }),
  kn: Object.freeze({
    id: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    lipiWord: 'ಲಿಪಿ',
    script: 'Kannada',
    unicodeRegex: /[\u0C80-\u0CFF]/,
    direction: 'ltr',
    speechLocale: 'kn-IN',
    swanadaSupported: true,
    paarModel: 'udgamlabs/Paar-en-kn',
    defaultPlaceholder: 'ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮಾತನಾಡಿ...',
  }),
  ml: Object.freeze({
    id: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    lipiWord: 'ലിപി',
    script: 'Malayalam',
    unicodeRegex: /[\u0D00-\u0D7F]/,
    direction: 'ltr',
    speechLocale: 'ml-IN',
    swanadaSupported: true,
    paarModel: 'udgamlabs/Paar-en-ml',
    defaultPlaceholder: 'ഇവിടെ ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ സംസാരിക്കുക...',
  }),
  pa: Object.freeze({
    id: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    lipiWord: 'ਲਿਪੀ',
    script: 'Gurmukhi',
    unicodeRegex: /[\u0A00-\u0A7F]/,
    direction: 'ltr',
    speechLocale: 'pa-IN',
    swanadaSupported: true,
    paarModel: 'udgamlabs/Paar-en-pa',
    defaultPlaceholder: 'ਇੱਥੇ ਟਾਈਪ ਕਰੋ ਜਾਂ ਬੋਲੋ...',
  }),
  or: Object.freeze({
    id: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    lipiWord: 'ଲିପି',
    script: 'Odia',
    unicodeRegex: /[\u0B00-\u0B7F]/,
    direction: 'ltr',
    speechLocale: 'or-IN',
    swanadaSupported: true,
    paarModel: 'udgamlabs/Paar-en-or',
    defaultPlaceholder: 'ଏଠାରେ ଟାଇପ୍ କରନ୍ତୁ କିମ୍ବା କୁହନ୍ତୁ...',
  }),
  as: Object.freeze({
    id: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    lipiWord: 'লিপি',
    script: 'Assamese',
    unicodeRegex: /[\u0980-\u09FF]/,
    direction: 'ltr',
    speechLocale: 'as-IN',
    swanadaSupported: false,
    paarModel: 'udgamlabs/Paar-en-as',
    defaultPlaceholder: 'ইয়াত টাইপ কৰক বা কওক...',
  }),
});

export function isValidLanguage(id) {
  if (!id || typeof id !== 'string') return false;
  return Object.prototype.hasOwnProperty.call(LANGUAGES, id.toLowerCase().trim());
}

export function getLanguage(id) {
  if (id && typeof id !== 'string') return LANGUAGES[DEFAULT_LANGUAGE_ID];
  if (id && typeof id === 'string') {
    const key = id.toLowerCase().trim();
    if (Object.prototype.hasOwnProperty.call(LANGUAGES, key)) {
      return LANGUAGES[key];
    }
  }
  return LANGUAGES[DEFAULT_LANGUAGE_ID] || Object.values(LANGUAGES)[0];
}

export function getAllLanguages() {
  return Object.values(LANGUAGES);
}

export default LANGUAGES;
