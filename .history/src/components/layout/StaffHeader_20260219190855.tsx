import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Check,
  Home,
  PlusSquare,
  User,
  Monitor,
} from "lucide-react"; // 1. เพิ่ม Monitor
import {
  useLanguage,
  LANGUAGES,
  type LanguageCode,
} from "../contexts/LanguageContext";

interface StaffHeaderProps {
  currentView: "dashboard" | "queue" | "account" | "display"; // 2. เพิ่ม Type display
  onNavigate: (view: "dashboard" | "queue" | "account" | "display") => void; // 3. อัปเดต Type onNavigate
  staffName?: string;
}

const StaffHeader = ({ currentView, onNavigate }: StaffHeaderProps) => {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getMenuClass = (viewName: string) => {
    const isActive = currentView === viewName;
    return `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer font-bold text-sm sm:text-base
      ${
        isActive
          ? "text-[#005691] bg-blue-50"
          : "text-[#005691] hover:bg-gray-50 hover:text-[#39AAAD]"
      }`;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 py-3 px-4 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => onNavigate("dashboard")}
        >
          <img
            src="/logo.png"
            alt="Nakornping Hospital Logo"
            className="h-10 w-auto object-contain sm:h-12"
          />
          <div className="flex flex-col justify-center">
            <h1 className="text-[#005691] font-bold text-lg sm:text-xl leading-tight">
              โรงพยาบาลนครพิงค์
            </h1>
            <p className="text-[#005691] text-xs sm:text-base font-normal leading-tight">
              Nakornping Hospital
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          <button
            className={getMenuClass("dashboard")}
            onClick={() => onNavigate("dashboard")}
          >
            <Home className="w-5 h-5" strokeWidth={2.5} />
            <span className="hidden sm:inline">หน้าหลัก</span>
          </button>

          <button
            className={getMenuClass("queue")}
            onClick={() => onNavigate("queue")}
          >
            <PlusSquare className="w-5 h-5" strokeWidth={2.5} />
            <span className="hidden sm:inline">จัดการคิว</span>
          </button>

          {/* 4. เพิ่มปุ่ม Display */}
          <button
            className={getMenuClass("display")}
            onClick={() => onNavigate("display")}
          >
            <Monitor className="w-5 h-5" strokeWidth={2.5} />
            <span className="hidden sm:inline">จอแสดงผล</span>
          </button>

          <button
            className={getMenuClass("account")}
            onClick={() => onNavigate("account")}
          >
            <User className="w-5 h-5" strokeWidth={2.5} />
            <span className="hidden sm:inline uppercase">Account</span>
          </button>

          <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className={`
                flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-full border-2 transition-all duration-200 outline-none
                ${
                  isLangOpen
                    ? "border-[#39AAAD] bg-teal-50"
                    : "border-[#39AAAD] bg-white hover:bg-gray-50"
                }
              `}
              style={{ minWidth: "70px", justifyContent: "space-between" }}
            >
              <div className="flex-shrink-0 scale-90">
                {currentLanguage.flag}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#39AAAD] transition-transform duration-200 ${
                  isLangOpen ? "rotate-180" : ""
                }`}
                strokeWidth={3}
              />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code as LanguageCode);
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-teal-50 transition-colors
                      ${
                        currentLanguage.code === lang.code
                          ? "text-[#005691] font-semibold bg-blue-50/30"
                          : "text-gray-600"
                      }
                    `}
                  >
                    <span className="flex items-center gap-3">
                      <span className="scale-100">{lang.flag}</span>
                      <span>{lang.label}</span>
                    </span>
                    {currentLanguage.code === lang.code && (
                      <Check
                        className="w-4 h-4 text-[#39AAAD]"
                        strokeWidth={2.5}
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default StaffHeader;
