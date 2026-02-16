import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type { Dictionary } from "../../lang/types";

import { th } from "../../lang/th";
import { en } from "../../lang/en";
import { cn } from "../../lang/cn";
import { mm } from "../../lang/mm";

export type LanguageCode = "th" | "en" | "cn" | "mm";

export interface Language {
  code: LanguageCode;
  label: string;
  flag: ReactNode;
}

const DICTIONARIES: Record<LanguageCode, Dictionary> = {
  th: th,
  en: en,
  cn: cn,
  mm: mm,
};

// สร้าง Component ย่อยเพื่อคุม Style ของธงให้เหมือนกันทุกอัน
const FlagIcon = ({ src, alt }: { src: string; alt: string }) => (
  <img
    src={src}
    alt={alt}
    className="w-6 h-6 rounded-full shadow-sm object-cover"
  />
);

// แก้ไขส่วน LANGUAGES ให้เรียกใช้ไฟล์จาก public/flags/ แทน
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

  // เลือก Dictionary ตามภาษาปัจจุบัน
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
