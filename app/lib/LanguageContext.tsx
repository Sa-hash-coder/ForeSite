"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { translations, Language, Translations } from "./translations";

interface LanguageContextType {
  lang: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  t: translations.en,
  setLanguage: () => {},
  toggleLanguage: () => {},
});

const STORAGE_KEY = "foresite_lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("hi"); // Default to Hindi for high accessibility, or saved preference

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved === "en" || saved === "hi") {
      setLangState(saved);
    }
  }, []);

  const setLanguage = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
  };

  const toggleLanguage = () => {
    const nextLang: Language = lang === "en" ? "hi" : "en";
    setLanguage(nextLang);
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        t: translations[lang],
        setLanguage,
        toggleLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
