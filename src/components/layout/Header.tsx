import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import {
  useLanguage,
  LANGUAGES,
  type LanguageCode,
} from "../contexts/LanguageContext";

const Header = () => {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 py-3 px-4 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo and Hospital Name */}
        <div className="flex items-center gap-4">
          <img
            src="/logo.svg"
            alt="Nakornping Hospital Logo"
            className="h-12 w-auto object-contain"
          />
          <div className="flex flex-col justify-center">
            <h1 className="text-[#005691] font-bold text-xl leading-tight">
              โรงพยาบาลนครพิงค์
            </h1>
            <p className="text-[#005691] text-base font-normal leading-tight">
              Nakornping Hospital
            </p>
          </div>
        </div>

        {/* Language Switcher Dropdown (Pill Shape with Flag) */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`
              flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-full border-2 transition-all duration-200 outline-none
              ${
                isOpen
                  ? "border-[#39AAAD] bg-teal-50"
                  : "border-[#39AAAD] bg-white hover:bg-gray-50"
              }
            `}
            style={{ minWidth: "80px", justifyContent: "space-between" }} // กำหนดความกว้างให้ดูสมส่วนแบบ Pill
          >
            {/* Flag Icon (SVG from Context) */}
            <div className="flex-shrink-0">{currentLanguage.flag}</div>

            {/* Teal Chevron Icon */}
            <ChevronDown
              className={`w-5 h-5 text-[#39AAAD] transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
              strokeWidth={3}
            />
          </button>

          {/* Dropdown Menu Content */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as LanguageCode);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-teal-50 transition-colors
                    ${
                      currentLanguage.code === lang.code
                        ? "text-[#005691] font-semibold bg-blue-50/30"
                        : "text-gray-600"
                    }
                  `}
                >
                  <span className="flex items-center gap-3">
                    {/* Flag in Dropdown */}
                    <span className="scale-110">{lang.flag}</span>
                    <span className="text-base">{lang.label}</span>
                  </span>
                  {currentLanguage.code === lang.code && (
                    <Check
                      className="w-5 h-5 text-[#39AAAD]"
                      strokeWidth={2.5}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
