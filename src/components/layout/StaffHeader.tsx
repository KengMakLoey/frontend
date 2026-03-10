import { Home, PlusSquare, User, Monitor } from "lucide-react";

interface StaffHeaderProps {
  currentView: "dashboard" | "queue" | "account" | "display";
  onNavigate: (view: "dashboard" | "queue" | "account" | "display") => void;
  staffName?: string;
}

const StaffHeader = ({ currentView, onNavigate }: StaffHeaderProps) => {
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
            src="/logo.svg"
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
        </div>
      </div>
    </header>
  );
};

export default StaffHeader;
