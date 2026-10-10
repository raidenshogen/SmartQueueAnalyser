import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { en } from "./en";
import { fr } from "./fr";
import { ar } from "./ar";

type Language = "en" | "fr" | "ar";
type Translations = typeof en;

const translations: Record<Language, Translations> = { en, fr, ar };

interface I18nContextType {
  lang: Language;
  t: (key: string, params?: Record<string, string | number>) => string;
  setLang: (lang: Language) => void;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("lang");
    return (saved as Language) || "en";
  });
  const [dir, setDir] = useState<"ltr" | "rtl">(() => {
    const saved = localStorage.getItem("lang");
    return saved === "ar" ? "rtl" : "ltr";
  });

  useEffect(() => {
    localStorage.setItem("lang", lang);
    setDir(lang === "ar" ? "rtl" : "ltr");
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let value: any = translations[lang];
    
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    if (typeof value !== "string") {
      console.warn(`Translation key is not a string: ${key}`);
      return key;
    }

    if (params) {
      return Object.entries(params).reduce(
        (str, [paramKey, paramValue]) => str.replace(`{${paramKey}}`, String(paramValue)),
        value
      );
    }

    return value;
  };

  return (
    <I18nContext.Provider value={{ lang, t, setLang, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}