'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Locale = 'en' | 'vi';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Import messages
import enMessages from '@/messages/en.json';
import viMessages from '@/messages/vi.json';

const messages = {
  en: enMessages,
  vi: viMessages
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('vi'); // Default to Vietnamese

  // Load locale from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'vi')) {
      setLocale(savedLocale);
    }
  }, []);

  // Save locale to localStorage when changed
  useEffect(() => {
    localStorage.setItem('locale', locale);
  }, [locale]);

  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.');
    let value: any = messages[locale];

    for (const k of keys) {
      value = value?.[k];
    }

    if (typeof value !== 'string') {
      return key; // Return key if translation not found
    }

    // Replace parameters in the string
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match: string, paramKey: string) => {
        return params[paramKey] || match;
      });
    }

    return value;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
