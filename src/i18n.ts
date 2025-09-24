import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector'; // Import the detector

// Import des fichiers de traduction
import translationEN from './locales/en/translation.json';
import translationFR from './locales/fr/translation.json';

const resources = {
  en: {
    translation: translationEN,
  },
  fr: {
    translation: translationFR,
  },
};

i18n
  .use(LanguageDetector) // Use the language detector
  .use(initReactI18next) // passe i18n à react-i18next
  .init({
    resources,
    // lng: 'fr', // Remove hardcoded default language, let detector handle it
    fallbackLng: 'en', // langue de secours si la traduction n'est pas disponible
    detection: {
      order: ['localStorage', 'navigator'], // Prioritize localStorage
      caches: ['localStorage'], // Cache language in localStorage
    },
    interpolation: {
      escapeValue: false, // react-i18next protège déjà contre les XSS
    },
  });

export default i18n;