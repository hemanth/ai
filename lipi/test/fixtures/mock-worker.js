/**
 * Deterministic MockTranslationWorker Test Double
 * Simulates Web Worker handling Udgam Labs Paar translation and Whisper models.
 * Completely offline, sub-millisecond, and deterministic.
 */

// Verbatim Golden Test Assertions from Udgam Labs Paar Evaluations
const GOLDEN_PAIRS = {
  // Test Sentence A:
  'Can you send me the invoice for the last three months?': {
    hi: 'क्या आप मुझे पिछले तीन महीनों से चालान भेज सकते हैं?',
    bn: 'আপনি কি আমাকে গত তিন মাস ধরে চালানটি পাঠাতে পারেন?',
    mr: 'तुम्ही मला गेल्या तीन महिन्यांपासून चलन पाठवू शकता का?',
    te: 'మీరు గత మూడు నెలలుగా నన్ను ఇన్వాయిస్ పంపగలరా?',
    ta: 'கடந்த மூன்று மாதங்களுக்கு நீங்கள் எனக்கு விலைப்பட்டியல் அனுப்ப முடியுமா?',
    gu: 'શું તમે મને છેલ્લા ત્રણ મહિના માટે ઇન્વૉઇઝન મોકલી શકો છો?',
    ur: 'کیا آپ مجھے پچھلے تین مہینوں سے انوائس بھیج سکتے ہیں؟',
    kn: 'ನೀವು ಕಳೆದ ಮೂರು ತಿಂಗಳುಗಳಿಂದ ನನಗೆ ಇನ್ವಾಯ್ಸ್ ಕಳುಹಿಸಬಹುದೇ?',
    ml: 'കഴിഞ്ഞ മൂന്ന് മാസമായി നിങ്ങൾക്ക് എനിക്ക് ഇൻവോയ്സ് അയയ്ക്കാൻ കഴിയുമോ?',
    pa: 'ਕੀ ਤੁਸੀਂ ਮੈਨੂੰ ਪਿਛਲੇ ਤਿੰਨ ਮਹੀਨਿਆਂ ਲਈ ਚਲਾਨ ਭੇਜ ਸਕਦੇ ਹੋ?',
    or: 'ଆପଣ ମୋତେ ଗତ ତିନି ମାସ ଧରି ଇନଭଏସ୍ ପଠାଇପାରିବେ କି?',
    as: 'আপুনি যোৱা তিনি মাহ ধৰি মোক চালান প্ৰেৰণ কৰিব পাৰিবনে?',
  },
  // Test Sentence B:
  'The train leaves at 6:45 tomorrow morning, so please be at the station by 6:15.': {
    hi: 'ट्रेन कल सुबह 6.45 बजे रवाना होती है, इसलिए कृपया स्टेशन पर 6.15 बजे तक रहें।',
    bn: 'ট্রেনটি আগামীকাল সকাল 6টা 45 মিনিটে চলে যায়, তাই দয়া করে 6টা 15 মিনিটের মধ্যে স্টেশনে থাকে।',
    mr: 'ट्रेन उद्या सकाळी 6:45 वाजता निघून जाते, म्हणून कृपया 6:15 द्वारे स्थानकावर रहा.',
    te: 'రైలు రేపు ఉదయం 6.45 కి బయలుదేరుతుంది, కాబట్టి దయచేసి స్టేషన్లో 6.15 వద్ద ఉంటుంది.',
    ta: 'ரயில் நாளை காலை 6.45 மணிக்கு செல்கிறது, எனவே தயவுசெய்து 6:15 க்குள் நிலையத்தில் இருங்கள்.',
    gu: 'ટ્રેન આવતીકાલે સવારે 6.45 પર રવાના થાય છે, તેથી મહેરબાની કરીને 6:15 દ્વારા સ્ટેશન પર રહો.',
    ur: 'ٹرین کل صبح 6 بج کر 45 منٹ پر چلی جاتی ہے، اس لیے براہ کرم اسٹیشن پر 6:15 تک رہیں۔',
    kn: 'ರೈಲು ನಾಳೆ ಬೆಳಿಗ್ಗೆ 6:45 ಕ್ಕೆ ಹೊರಟು ಹೋಗುತ್ತದೆ, ಆದ್ದರಿಂದ ದಯವಿಟ್ಟು 6:15 ರ ವೇಳೆಗೆ ನಿಲ್ದಾಣದಲ್ಲಿರಿರಿ.',
    ml: 'ട്രെയിൻ നാളെ രാവിലെ 6.45 ന് പോകുന്നു, അതിനാൽ ദയവായി 6:15 ഓടെ സ്റ്റേഷനിൽ ഉണ്ടാകുക.',
    pa: 'ਰੇਲਗੱਡੀ ਕੱਲ੍ਹ ਸਵੇਰੇ 6.45 ਵਜੇ ਰਵਾਨਾ ਹੁੰਦੀ ਹੈ, ਇਸ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਸਟੇਸ਼ਨ \'ਤੇ 6:15 ਤੱਕ ਰਹੋ।',
    or: 'ଟ୍ରେନ୍ ଆସନ୍ତାକାଲି ସକାଳେ 6:45 ରେ ପ୍ରସ୍ଥାନ କରେ, ତେଣୁ ଦଯ଼ାକରି ଷ୍ଟେସନରେ 6:15 ସୁଦ୍ଧା ରୁହନ୍ତୁ',
    as: 'ৰে "লখন কাইলৈ ৰাতিপুৱা 6ঃ45 ত গুচি যায়, সেয়েহে অনুগ্ৰহ কৰি 6:15 ৰ দ্বাৰা ষ্টেচনত থাকিব।',
  },
  // Test Sentence C:
  'My phone battery dies by the afternoon even though I charge it overnight.': {
    hi: 'दोपहर तक मेरी फोन की बैटरी की मृत्यु हो जाती है, भले ही मैं इसे रातोंरात चार्ज करता हूं।',
    bn: 'আমি রাতারাতি চার্জ করার পরেও বিকেলের মধ্যে আমার ফোন ব্যাটারি মারা যায়।',
    mr: 'मी एका रात्रीत चार्ज करत असतानाही माझी फोन बॅटरी दुपारपर्यंत मरते.',
    te: 'నేను రాత్రిపూట ఛార్జ్ చేసినప్పటికీ నా ఫోన్ బ్యాటరీ మధ్యాహ్నం నాటికి మరణిస్తుంది.',
    ta: 'நான் ஒரே இரவில் சார்ஜ் செய்தாலும் எனது தொலைபேசி பேட்டரி பிற்பகல்க்குள் இறந்துவிடுகிறது.',
    gu: 'હું તેને રાતોરાત ચાર્જ કરું છું તેમ છતાં મારી ફોનની બેટરી બપોર સુધીમાં મૃત્યુ પામે છે.',
    ur: 'میری فون بیٹری دوپہر تک مر جاتی ہے حالانکہ میں اسے راتوں رات چارج کرتا ہوں۔',
    kn: 'ನಾನು ರಾತ್ರಿಯಿಡೀ ಚಾರ್ಜ್ ಮಾಡಿದರೂ ನನ್ನ ಫೋನ್ ಬ್ಯಾಟರಿ ಮಧ್ಯಾಹ್ನದೊಳಗೆ ಸಾಯುತ್ತದೆ.',
    ml: 'ഞാൻ ഒറ്റരാത്രികൊണ്ട് ചാർജ് ചെയ്തെങ്കിലും എന്റെ ഫോൺ ബാറ്ററി ഉച്ചകഴിഞ്ഞ് മരിക്കുന്നു.',
    pa: 'ਮੇਰੀ ਫੋਨ ਬੈਟਰੀ ਦੁਪਹਿਰ ਤੱਕ ਮਰ ਜਾਂਦੀ ਹੈ ਭਾਵੇਂ ਕਿ ਮੈਂ ਇਸ ਨੂੰ ਰਾਤ ਭਰ ਚਾਰਜ ਕਰਦਾ ਹਾਂ।',
    or: 'ମୁଁ ରାତାରାତି ଚାର୍ଜ କରିବା ସତ୍ତ୍ୱେ ଅପରାହ୍ନରେ ମୋ ଫୋନ୍ ବ୍ଯ଼ାଟେରୀ ମରିଯାଏ',
    as: 'মই ৰাতিৰাতি চাৰ্জ কৰিলেও মোৰ ফোন বেটাৰিৰ মৃত্যু হয়।',
  },
  // Common Phrases
  'Hello world': {
    hi: 'नमस्ते दुनिया',
    bn: 'নমস্কার বিশ্ব',
    mr: 'नमस्कार जग',
    te: 'నమస్కారం ప్రపంచం',
    ta: 'வணக்கம் உலகம்',
    gu: 'નમસ્તે દુનિયા',
    ur: 'ہیلو دنیا',
    kn: 'ನಮಸ್ಕಾರ ಪ್ರಪಂಚ',
    ml: 'നമസ്കാരം ലോകം',
    pa: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਦੁਨੀਆਂ',
    or: 'ନମସ୍କାର ଦୁନିଆ',
    as: 'নমস্কাৰ বিশ্ব',
  },
  'Welcome to the editor': {
    hi: 'संपादक में आपका स्वागत है',
    bn: 'সম্পাদক এ আপনাকে স্বাগতম',
    mr: 'संपादकात आपले स्वागत आहे',
    te: 'ఎడిటర్‌కు స్వాగతం',
    ta: 'தொகுப்பாளருக்கு வருக',
    gu: 'સંપાદકમાં આપનું સ્વાગત છે',
    ur: 'ایڈیٹر میں خوش آمدید',
    kn: 'ಸಂಪಾದಕಕ್ಕೆ ಸುಸ್ವಾಗತ',
    ml: 'എഡിറ്ററിലേക്ക് സ്വാഗതം',
    pa: 'ਸੰਪਾਦਕ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ',
    or: 'ସମ୍ପାଦକକୁ ସ୍ୱାଗତ',
    as: 'সম্পাদকত আপোনাক স্বাগতম',
  },
};

// Base lexicon for deterministic fallback mapping ensuring valid Indic script regex match
const SCRIPT_FALLBACKS = {
  hi: 'नमस्ते यह एक अनुवादित पाठ है',
  bn: 'নমস্কার এটি একটি অনুবাদিত পাঠ্য',
  mr: 'नमस्कार हा एक अनुवादित मजकूर आहे',
  te: 'నమస్కారం ఇది అనువదించబడిన వచనం',
  ta: 'வணக்கம் இது ஒரு மொழிபெயர்க்கப்பட்ட உரை',
  gu: 'નમસ્તે આ એક અનુવાદિત લખાણ છે',
  ur: 'ہیلو یہ ایک ترجمہ شدہ متن ہے',
  kn: 'ನಮಸ್ಕಾರ ಇದು ಅನುವಾದಿಸಿದ ಪಠ್ಯ',
  ml: 'നമസ്കാരം ഇത് വിവർത്തനം ചെയ്ത വാചകം',
  pa: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਇਹ ਇੱਕ ਅਨੁਵਾਦ ਕੀਤਾ ਪਾਠ ਹੈ',
  or: 'ନମସ୍କାର ଏହା ଏକ ଅନୁବାଦିତ ପାଠ୍ୟ',
  as: 'নমস্কাৰ এইটো এটা অনুবাদিত পাঠ',
};

export class MockTranslationWorker {
  constructor() {
    this.onmessage = null;
    this.onerror = null;
    this._listeners = new Map();
    this.shouldFail = false;
    this.failReason = 'Simulated worker failure';
  }

  addEventListener(event, handler) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(handler);
  }

  removeEventListener(event, handler) {
    if (this._listeners.has(event)) {
      this._listeners.get(event).delete(handler);
    }
  }

  dispatchEvent(event, data) {
    const handlers = this._listeners.get(event);
    if (handlers) {
      for (const handler of handlers) {
        handler(data);
      }
    }
  }

  emitMessage(data) {
    queueMicrotask(() => {
      const event = { data };
      if (this.onmessage) this.onmessage(event);
      this.dispatchEvent('message', event);
    });
  }

  emitError(error) {
    queueMicrotask(() => {
      const event = { error };
      if (this.onerror) this.onerror(event);
      this.dispatchEvent('error', event);
    });
  }

  postMessage(message) {
    if (!message || typeof message !== 'object') return;

    if (this.shouldFail) {
      this.emitMessage({
        type: 'translation-error',
        id: message.id || 'error-id',
        error: this.failReason,
      });
      return;
    }

    const { action, language, targetLang, text, modelId, id } = message;

    if (action === 'load-translation-model' || action === 'load-model') {
      const lang = language || targetLang || 'hi';
      this.emitMessage({
        type: 'model-progress',
        language: lang,
        progress: 100,
      });
      this.emitMessage({
        type: 'model-ready',
        language: lang,
        modelId: modelId || `udgamlabs/Paar-en-${lang}`,
      });
      return;
    }

    if (action === 'translate') {
      const lang = targetLang || 'hi';
      const cleanText = (text || '').trim();

      if (!cleanText) {
        this.emitMessage({
          type: 'translation-result',
          id,
          text: '',
          targetLang: lang,
        });
        return;
      }

      // Check Golden Pairs first
      let translated = GOLDEN_PAIRS[cleanText]?.[lang];

      // If not in golden pairs, generate deterministic Indic script text
      if (!translated) {
        const fallback = SCRIPT_FALLBACKS[lang] || SCRIPT_FALLBACKS.hi;
        // Check if paragraph breaks exist
        const paragraphs = cleanText.split(/\n+/);
        if (paragraphs.length > 1) {
          translated = paragraphs
            .map((p, idx) => `${fallback} (${idx + 1}): ${p.slice(0, 20)}`)
            .join('\n\n');
        } else {
          translated = `${fallback}: ${cleanText.slice(0, 30)}`;
        }
      }

      this.emitMessage({
        type: 'translation-result',
        id,
        text: translated,
        targetLang: lang,
      });
      return;
    }

    if (action === 'whisper' || action === 'transcribe') {
      this.emitMessage({
        type: 'whisper-result',
        text: 'Transcribed speech text from audio input',
        id,
      });
      return;
    }
  }

  terminate() {
    this._listeners.clear();
    this.onmessage = null;
    this.onerror = null;
  }
}
