import { createContext, useContext, useState, type ReactNode } from "react";

// 1. เพิ่ม Type ภาษา จีน (cn) และ พม่า (mm)
export type LanguageCode = "th" | "en" | "cn" | "mm";

export interface Language {
  code: LanguageCode;
  label: string;
  flag: ReactNode;
}

// --- SVG Components (รูปแบบวงกลมทั้งหมด) ---

const ThaiFlag = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    className="w-6 h-6 rounded-full shadow-sm"
  >
    <mask id="mask-th">
      <circle cx="16" cy="16" r="16" fill="white" />
    </mask>
    <g mask="url(#mask-th)">
      <path fill="#F4F5F8" d="M0 0h32v32H0z" />
      <path fill="#ED1C24" d="M0 0h32v32H0z" />
      <path fill="#F4F5F8" d="M0 5.33h32v21.33H0z" />
      <path fill="#241D4F" d="M0 10.66h32v10.66H0z" />
    </g>
  </svg>
);

const UKFlag = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    className="w-6 h-6 rounded-full shadow-sm"
  >
    <mask id="mask-uk">
      <circle cx="16" cy="16" r="16" fill="white" />
    </mask>
    <g mask="url(#mask-uk)">
      {/* พื้นหลังสีน้ำเงิน */}
      <path fill="#012169" d="M0 0h32v32H0z" />

      {/* กากบาททแยงสีขาว (White Saltire) */}
      <path
        stroke="#FFF"
        strokeWidth="4"
        d="M0 0l32 32M32 0L0 32"
        strokeLinecap="square"
      />

      {/* กากบาททแยงสีแดง (Red Saltire) */}
      <path
        stroke="#C8102E"
        strokeWidth="2"
        d="M0 0l32 32M32 0L0 32"
        strokeLinecap="square"
      />

      {/* กากบาทตรงสีขาว (White Cross) */}
      <path stroke="#FFF" strokeWidth="8" d="M16 0v32M0 16h32" />

      {/* กากบาทตรงสีแดง (Red Cross) */}
      <path stroke="#C8102E" strokeWidth="4" d="M16 0v32M0 16h32" />
    </g>
  </svg>
);

const ChineseFlag = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    className="w-6 h-6 rounded-full shadow-sm"
  >
    <mask id="mask-cn">
      <circle cx="16" cy="16" r="16" fill="white" />
    </mask>
    <g mask="url(#mask-cn)">
      <path fill="#DE2910" d="M0 0h32v32H0z" />
      <path
        fill="#FFDE00"
        d="M5.5 8l1-3h3l-2.5-1.5L8 0l-2 2.5L4 0l1 3.5L2.5 5h3z"
      />
      <path
        fill="#FFDE00"
        d="M11 4.5l.5-1.5h1.5l-1-.5L12.5 1l-1 1L10 1.5l.5 1.5H9z"
      />
      <path
        fill="#FFDE00"
        d="M13 8.5l.5-1.5h1.5l-1-.5L14.5 5l-1 1L12 5.5l.5 1.5H11z"
      />
      <path
        fill="#FFDE00"
        d="M13 13.5l.5-1.5h1.5l-1-.5L14.5 10l-1 1L12 10.5l.5 1.5H11z"
      />
      <path
        fill="#FFDE00"
        d="M11 17.5l.5-1.5h1.5l-1-.5L12.5 14l-1 1L10 14.5l.5 1.5H9z"
      />
    </g>
  </svg>
);

const BurmeseFlag = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    className="w-6 h-6 rounded-full shadow-sm"
  >
    <mask id="mask-mm">
      <circle cx="16" cy="16" r="16" fill="white" />
    </mask>
    <g mask="url(#mask-mm)">
      <path fill="#FECB00" d="M0 0h32v10.67H0z" />
      <path fill="#34B233" d="M0 10.67h32v10.66H0z" />
      <path fill="#EA2839" d="M0 21.33h32V32H0z" />
      <path
        fill="#FFF"
        d="M16 6l2.5 7.5h7.5l-6 4.5 2.5 7.5-6-4.5-6 4.5 2.5-7.5-6-4.5h7.5z"
      />
    </g>
  </svg>
);

// 2. อัปเดตรายการภาษา
export const LANGUAGES: Language[] = [
  { code: "th", label: "ไทย", flag: <ThaiFlag /> },
  { code: "en", label: "English", flag: <UKFlag /> },
  { code: "cn", label: "中文", flag: <ChineseFlag /> },
  { code: "mm", label: "မြန်မာ", flag: <BurmeseFlag /> },
];

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (code: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [languageCode, setLanguageCode] = useState<LanguageCode>("th");

  const currentLanguage =
    LANGUAGES.find((l) => l.code === languageCode) || LANGUAGES[0];

  const setLanguage = (code: LanguageCode) => {
    setLanguageCode(code);
  };

  const t = (text: string) => text;

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
