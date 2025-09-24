import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

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
  .use(initReactI18next) // passe i18n à react-i18next
  .init({
    resources,
    lng: 'fr', // langue par défaut
    fallbackLng: 'en', // langue de secours si la traduction n'est pas disponible

    interpolation: {
      escapeValue: false, // react-i18next protège déjà contre les XSS
    },
  });

export default i18n;