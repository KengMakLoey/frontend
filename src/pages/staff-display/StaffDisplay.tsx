import { useState } from "react";
import { ArrowLeft, Monitor } from "lucide-react";
import DisplayScreen from "./DisplayScreen";

// ข้อมูลแผนกให้ตรงกับฐานข้อมูล
const DEPARTMENTS = [
  { id: 1, name: "คลินิกศัลยกรรมทางเดินปัสสาวะ", label: "Urology" },
  { id: 2, name: "คลินิกกุมาร", label: "Pediatrics" },
  { id: 3, name: "คลินิกสูติ-นรีเวช", label: "Obstetrics-Gynecology" },
  { id: 4, name: "คลินิกโรคเรื้อรัง", label: "NCD Clinic" },
  { id: 5, name: "คลินิกพิเศษอายุรกรรม", label: "Special Medicine" },
  { id: 6, name: "ไตเทียม", label: "Dialysis" },
  { id: 7, name: "คลินิกอายุรกรรม", label: "Medicine" },
  { id: 8, name: "คลินิกตา", label: "Ophthalmology" },
  { id: 9, name: "คลินิกทันตกรรม", label: "Dentistry" },
  { id: 10, name: "คลินิกหู คอ จมูก", label: "ENT" },
  { id: 11, name: "ห้องตรวจสุขภาพพิเศษ", label: "Special Check-up" },
];

export default function StaffDisplay({ onBack }: { onBack: () => void }) {
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);

  // ถ้ามีการเลือกแผนกแล้ว ให้แสดงหน้า DisplayScreen
  if (selectedDeptId) {
    return (
      <DisplayScreen
        departmentId={selectedDeptId}
        departmentInfo={DEPARTMENTS.find((d) => d.id === selectedDeptId)!}
        onExit={() => setSelectedDeptId(null)}
      />
    );
  }

  // หน้าเลือกแผนก
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-center mb-8 relative">
          <button
            onClick={onBack}
            className="flex items-center text-gray-500 hover:text-[#044C72] transition-colors absolute left-0"
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
            กลับ
          </button>
          <h1 className="text-3xl font-bold text-[#044C72] flex items-center gap-3">
            <Monitor className="w-8 h-8" />
            เลือกแผนกเพื่อแสดงผล (Display Mode)
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setSelectedDeptId(dept.id)}
              className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border-2 border-transparent hover:border-[#39AAAD] transition-all duration-300 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Monitor className="w-24 h-24 text-[#044C72]" />
              </div>
              <h3 className="text-2xl font-bold text-[#044C72] mb-1 relative z-10">
                {dept.name}
              </h3>
              <p className="text-gray-400 text-lg relative z-10">
                {dept.label}
              </p>
              <div className="mt-6 inline-flex items-center text-[#39AAAD] font-semibold group-hover:gap-2 transition-all">
                เปิดจอแสดงผล <span>→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
