import { useState } from "react";
import { Users, UserCog, Hospital, ArrowRight } from "lucide-react";
import type { ViewType, QueueData } from "./components/shared/types";
import PatientVN from "./pages/PatientVN";
import PatientStatus from "./pages/PatientStatus"; // Import หน้าใหม่
import StaffView from "./StaffView";
import { Toaster } from "./components/ui/sonner";

// เพิ่ม Type ให้ View รองรับหน้าแสดงผลคิว
type ExtendedViewType = ViewType | "queue-status";

export default function App() {
  const [view, setView] = useState<ExtendedViewType>("landing");
  const [queueData, setQueueData] = useState<QueueData | null>(null);

  // 1. หน้ากรอกข้อมูลผู้ป่วย (PatientVN)
  if (view === "patient") {
    return (
      <>
        <PatientVN
          onBack={() => setView("landing")}
          onSuccess={(data) => {
            setQueueData(data);
            setView("queue-status"); // เมื่อเจอคิว เปลี่ยนไปหน้าแสดงผล PatientStatus
          }}
        />
        <Toaster />
      </>
    );
  }

  // 2. หน้าแสดงผลสถานะคิว (PatientStatus)
  if (view === "queue-status" && queueData) {
    return (
      <>
        <PatientStatus
          initialData={queueData}
          onBack={() => {
            setQueueData(null);
            setView("landing");
          }}
        />
        <Toaster />
      </>
    );
  }

  // 3. หน้าเจ้าหน้าที่
  if (view === "staff") {
    return <StaffView onBack={() => setView("landing")} />;
  }

  // 4. หน้า Landing Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Hospital className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">NakornpingQ</h1>
          <p className="text-gray-600">ระบบจัดการคิวโรงพยาบาลนครพิงค์</p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          <div
            onClick={() => setView("patient")} // กดแล้วไปหน้า PatientVN
            className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-400"
          >
            <div className="flex flex-col items-center text-center h-full">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <Users className="w-12 h-12 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                สำหรับผู้ป่วย
              </h2>
              <p className="text-gray-600 mb-6">ตรวจสอบคิวของคุณด้วยเลข VN</p>
              <div className="mt-auto">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center">
                  เข้าสู่ระบบผู้ป่วย
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          </div>

          <div
            onClick={() => setView("staff")}
            className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow border-2 border-transparent hover:border-green-400"
          >
            <div className="flex flex-col items-center text-center h-full">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <UserCog className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                สำหรับเจ้าหน้าที่
              </h2>
              <p className="text-gray-600 mb-6">จัดการคิวผู้ป่วยในแผนก</p>
              <div className="mt-auto">
                <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center">
                  เข้าสู่ระบบเจ้าหน้าที่
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
