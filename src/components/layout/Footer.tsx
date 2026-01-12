import { QrCode } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#39AAAD] text-white py-6 px-4">
      <div className="container mx-auto text-center space-y-4">
        <div className="text-sm leading-relaxed text-white/90">
          <p>หากท่านได้ทำการออกหน้านี้</p>
          <p>ท่านสามารถสแกนคิวอาร์โค้ดใหม่ เพื่อเข้าดูหน้าคิวได้อีกครั้ง</p>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-white/70 pt-2 border-t border-white/10 w-fit mx-auto px-4">
          <span>หากมีข้อสงสัย กรุณาติดต่อเจ้าหน้าที่</span>
          <QrCode className="w-4 h-4" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
