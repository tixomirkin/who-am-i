import React, { createContext, useState } from 'react';
import type { Language, Translations } from './types';
import { ru } from './locales/ru';
import { en } from './locales/en';

export interface I18nContextType {
  language: Language;
  setLanguage(lang: Language): void;
  t: (key: keyof Translations, params?: Record<string, string | number>) => string;
}

const translations: Record<Language, Translations> = {
  ru,
  en,
};

export const I18nContext = createContext<I18nContextType | null>(null);

function getInitialLanguage(): Language {
  const saved = localStorage.getItem('app-language') as Language | null;
  if (saved && (saved === 'ru' || saved === 'en')) {
    return saved;
  }

  // Detect from browser/system language
  if (typeof navigator !== 'undefined') {
    const navLang = (navigator.language || (navigator as { userLanguage?: string }).userLanguage || '').toLowerCase();
    if (navLang.startsWith('ru') || navLang.startsWith('be') || navLang.startsWith('uk') || navLang.startsWith('kk')) {
      return 'ru';
    }
  }

  return 'en';
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: keyof Translations, params?: Record<string, string | number>): string => {
    const dict = translations[language] || translations.en;
    let text = dict[key] || translations.en[key] || String(key);

    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      });
    }

    return text;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export { useTranslation, useI18n } from './useTranslation';
