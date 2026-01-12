import { Globe } from "lucide-react";
import { Button } from "../ui/button";

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-100 py-4 px-4 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo and Hospital Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#005691] rounded-lg flex items-center justify-center shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-6 h-6 text-white"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <div className="leading-tight">
            <h1 className="text-[#005691] font-bold text-base">
              โรงพยาบาลนครพิงค์
            </h1>
            <p className="text-[#005691]/70 text-xs font-medium">
              Nakornping Hospital
            </p>
          </div>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center gap-2 text-gray-400">
          <Globe className="w-5 h-5" />
          <span className="text-sm font-medium">TH</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
