import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation resources
import translationEN from './locales/en.json';
import translationAR from './locales/ar.json';

const resources = {
  en: {
    translation: translationEN,
  },
  ar: {
    translation: translationAR,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    // i18next v23+ uses the v3/v4 plural format by default (the
    // suffixed key is the **plural form**, e.g. `_one` for count=1
    // and `_other` for count!=1). Without this flag, every plural
    // key in the project is silently treated as a plain key and the
    // base form is always returned — the most visible symptom was
    // the dashboard cooldown banner reading "60 day" instead of
    // "60 days", and the assessment dashboard's "attemptsCount"
    // always showing the singular "1 attempt" for any count.
    //
    // Note: an earlier draft of this comment claimed `v1` could be
    // used to keep the project's old `_plural` suffix convention,
    // but that's wrong — `v1` is silently ignored in i18next v26.
    // Setting `v2` here switches the lookup to the modern format
    // and the locale files have been updated to use `_other` keys
    // (`bannerInCooldown_other`, `attemptsCount_other`) — the
    // un-suffixed base key serves as the singular fallback for
    // count === 1. (Proper Arabic pluralization with `_zero` /
    // `_two` / `_few` / `_many` / `_other` is a separate,
    // project-wide effort and is out of scope for this fix.)
    compatibilityJSON: 'v2',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

// Handle RTL direction dynamically
i18n.on('languageChanged', (lng) => {
  const isAr = lng && lng.toLowerCase().startsWith('ar');
  document.documentElement.dir = isAr ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

// Set initial direction
const initialLng = i18n.language || 'en';
const initialIsAr = initialLng.toLowerCase().startsWith('ar');
document.documentElement.dir = initialIsAr ? 'rtl' : 'ltr';
document.documentElement.lang = initialLng;

export default i18n;
