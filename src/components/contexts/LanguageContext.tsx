import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type { Dictionary } from "../../lang/lang_types";

// Import ภาษาเดิม
import { th } from "../../lang/th";
import { en } from "../../lang/en";
import { cn } from "../../lang/cn";
import { mm } from "../../lang/mm";
import { es } from "../../lang/es";
import { la } from "../../lang/la";
import { jp } from "../../lang/jp";
import { kr } from "../../lang/kr";
import { shn } from "../../lang/shn";
import { km } from "../../lang/km";

export type LanguageCode =
  | "th"
  | "en"
  | "cn"
  | "mm"
  | "es"
  | "la"
  | "jp"
  | "kr"
  | "shn"
  | "km";

export interface Language {
  code: LanguageCode;
  label: string;
  flag: ReactNode;
}

// Dictionary
const DICTIONARIES: Record<LanguageCode, Dictionary> = {
  th: th,
  en: en,
  cn: cn,
  mm: mm,
  es: es,
  la: la,
  jp: jp,
  kr: kr,
  shn: shn,
  km: km,
};

const FlagIcon = ({ src, alt }: { src: string; alt: string }) => (
  <img
    src={src}
    alt={alt}
    className="w-6 h-6 rounded-full shadow-sm object-cover border border-black/10"
  />
);

export const LANGUAGES: Language[] = [
  {
    code: "th",
    label: "ไทย",
    flag: <FlagIcon src="/flags/th.svg" alt="Thai Flag" />,
  },
  {
    code: "en",
    label: "English",
    flag: <FlagIcon src="/flags/en.svg" alt="UK Flag" />,
  },
  {
    code: "cn",
    label: "中文",
    flag: <FlagIcon src="/flags/cn.svg" alt="Chinese Flag" />,
  },
  {
    code: "mm",
    label: "မြန်မာ",
    flag: <FlagIcon src="/flags/mm.svg" alt="Myanmar Flag" />,
  },
  {
    code: "la",
    label: "ລາວ",
    flag: <FlagIcon src="/flags/la.svg" alt="Laos Flag" />,
  },
  {
    code: "shn",
    label: "ၽႃႇသႃႇတႆး", // ไทใหญ่
    flag: <FlagIcon src="/flags/shn.svg" alt="Shan Flag" />,
  },
  {
    code: "km",
    label: "ខ្មែរ",
    flag: <FlagIcon src="/flags/km.svg" alt="Cambodia Flag" />,
  },
  {
    code: "es",
    label: "Español",
    flag: <FlagIcon src="/flags/es.svg" alt="Spain Flag" />,
  },
  {
    code: "jp",
    label: "日本語",
    flag: <FlagIcon src="/flags/jp.svg" alt="Japan Flag" />,
  },
  {
    code: "kr",
    label: "한국어",
    flag: <FlagIcon src="/flags/kr.svg" alt="South Korea Flag" />,
  },
];

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (code: LanguageCode) => void;
  t: Dictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [languageCode, setLanguageCode] = useState<LanguageCode>("th");

  const currentLanguage =
    LANGUAGES.find((l) => l.code === languageCode) || LANGUAGES[0];

  const setLanguage = (code: LanguageCode) => {
    setLanguageCode(code);
  };

  const t = DICTIONARIES[languageCode];

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
