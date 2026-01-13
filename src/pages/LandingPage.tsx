import { ArrowRight } from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

interface LandingPageProps {
  onPatientClick: () => void;
  onStaffClick: () => void;
}

export default function LandingPage({
  onPatientClick,
  onStaffClick,
}: LandingPageProps) {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-white font-sans overflow-hidden">
      {/* Header จาก Component กลาง */}
      <div className="shrink-0">
        <Header />
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-[#0e4b75] mb-2">ระบบคิว</h1>
          <p className="text-3xl font-bold text-[#0e4b75] font-medium">
            โรงพยาบาลนครพิงค์
          </p>
        </div>

        <div className="w-full max-w-md space-y-6">
          {/* การ์ดผู้ป่วย */}
          <div
            onClick={onPatientClick}
            className="bg-white rounded-[2rem] p-6 cursor-pointer border-2 border-[#557c3e] hover:shadow-xl transition-all transform hover:-translate-y-1 relative overflow-hidden group"
          >
            <div className="flex flex-col items-center text-center">
              <h2 className="text-3xl font-bold text-[#3e5c2d] mb-4">
                สำหรับผู้ป่วย
              </h2>

              {/* เรียกใช้รูปจาก /public (ตรวจสอบชื่อไฟล์ให้ตรงกับที่คุณวางไว้นะครับ) */}
              <div className="mb-6 mt-2">
                <img
                  src="/patient.icon.svg"
                  alt="patient.icon"
                  className="w-24 h-24 drop-shadow-sm transition-transform group-hover:scale-105"
                />
              </div>

              <p className="text-gray-500 text-sm mb-6">
                ตรวจสอบคิวของท่านด้วยเลข VN
              </p>

              <button className="w-full bg-[#87E74B] text-white py-3 rounded-full font-bold text-lg shadow-md flex justify-center items-center gap-2 group-hover:from-[#71af13] group-hover:to-[#568a0b] transition-all">
                เข้าสู่ระบบผู้ป่วย
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* การ์ดเจ้าหน้าที่ */}
          <div
            onClick={onStaffClick}
            className="bg-white rounded-[2rem] p-6 cursor-pointer border-2 border-[#2b5ba3] hover:shadow-xl transition-all transform hover:-translate-y-1 relative overflow-hidden group"
          >
            <div className="flex flex-col items-center text-center">
              <h2 className="text-3xl font-bold text-[#1e4275] mb-4">
                สำหรับเจ้าหน้าที่
              </h2>

              {/* เรียกใช้รูปจาก /public */}
              <div className="mb-6 mt-2">
                <img
                  src="/staff.icon.svg"
                  alt="staff.icon"
                  className="w-24 h-24 drop-shadow-sm transition-transform group-hover:scale-105"
                />
              </div>

              <p className="text-gray-500 text-sm mb-6">จัดการผู้ป่วยในแผนก</p>

              <button className="w-full bg-[#4169e1] text-white py-3 rounded-full font-bold text-lg shadow-md flex justify-center items-center gap-2 group-hover:bg-[#3456b8] transition-all">
                เข้าสู่ระบบเจ้าหน้าที่
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer จาก Component กลาง */}
      <div className="shrink-0 w-full">
        <Footer />
      </div>
    </div>
  );
}
