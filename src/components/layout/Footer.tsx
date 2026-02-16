import { QrCode } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#39AAAD] text-white py-6 px-4">
      <div className="container mx-auto text-center space-y-4">
        <div className="text-sm leading-relaxed text-white/90">
          <p>{t.footer.notice_title}</p>
          <p>{t.footer.notice_desc}</p>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-white/70 pt-2 border-t border-white/10 w-fit mx-auto px-4">
          <span>{t.footer.contact_staff}</span>
          <QrCode className="w-4 h-4" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
