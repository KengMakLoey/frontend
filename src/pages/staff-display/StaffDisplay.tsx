import { useState } from "react";
import { ArrowLeft, Monitor } from "lucide-react";
import DisplayScreen from "./DisplayScreen"; // เปลี่ยนชื่อ import

// ข้อมูลจำลองแผนก
const DEPARTMENTS = [
  { id: 1, name: "อายุรกรรม", label: "Medicine" },
  { id: 2, name: "ศัลยกรรม", label: "Surgery" },
  { id: 3, name: "กุมารเวชกรรม", label: "Pediatrics" },
  { id: 4, name: "สูติ-นรีเวชกรรม", label: "Obstetrics-Gynecology" },
  { id: 5, name: "ทันตกรรม", label: "Dentistry" },
  { id: 6, name: "ตรวจสุขภาพ", label: "Check-up Center" },
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
      <div className="max-w-4xl w-full">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-500 hover:text-[#044C72] transition-colors"
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
            กลับหน้าหลัก
          </button>
          <h1 className="text-3xl font-bold text-[#044C72] flex items-center gap-3">
            <Monitor className="w-8 h-8" />
            เลือกแผนกเพื่อแสดงผล (Display Mode)
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
