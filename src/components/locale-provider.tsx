"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isLocale, t, type Locale, type MessageKey } from "@/lib/i18n";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  tr: (key: MessageKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("sr");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("vitrina-locale");
      if (saved && isLocale(saved)) setLocaleState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    try {
      localStorage.setItem("vitrina-locale", next);
      document.documentElement.lang = next === "sr" ? "sr" : next;
    } catch {
      /* ignore */
    }
  }

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      tr: (key: MessageKey) => t(locale, key),
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
