import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SUPPORTED_LANGUAGES, translate, getLanguageMeta } from './translations';

const STORAGE_KEY = 'yatrago_language';
const LanguageContext = createContext(null);

const detectInitialLanguage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) return stored;
    const browser = (navigator.language || 'en').slice(0, 2).toLowerCase();
    if (SUPPORTED_LANGUAGES.some((l) => l.code === browser)) return browser;
  } catch {
    /* storage unavailable */
  }
  return 'en';
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(detectInitialLanguage);

  useEffect(() => {
    const meta = getLanguageMeta(language);
    document.documentElement.setAttribute('lang', meta.code);
    document.documentElement.setAttribute('dir', meta.dir);
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      /* ignore */
    }
  }, [language]);

  const t = useCallback((key) => translate(language, key), [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      languages: SUPPORTED_LANGUAGES,
      currentLanguage: getLanguageMeta(language),
      isHindi: language === 'hi'
    }),
    [language, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  // Safe fallback so components can be rendered without the provider (tests, stories).
  return (
    ctx || {
      language: 'en',
      setLanguage: () => {},
      t: (key) => translate('en', key),
      languages: SUPPORTED_LANGUAGES,
      currentLanguage: getLanguageMeta('en'),
      isHindi: false
    }
  );
};
