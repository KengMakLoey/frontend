import { useState } from "react";
import type { ViewType, QueueData } from "./components/shared/types";
import LandingPage from "./pages/LandingPage"; // Import ไฟล์ใหม่เข้ามา
import PatientVN from "./pages/patient/PatientVN";
import PatientStatus from "./pages/patient/PatientStatus";
import StaffView from "./pages/staff/StaffView";
import { Toaster } from "./components/ui/sonner";

type ExtendedViewType = ViewType | "queue-status";

export default function App() {
  const [view, setView] = useState<ExtendedViewType>("landing");
  const [queueData, setQueueData] = useState<QueueData | null>(null);

  // 1. หน้ากรอกข้อมูลผู้ป่วย
  if (view === "patient") {
    return (
      <>
        <PatientVN
          onBack={() => setView("landing")}
          onSuccess={(data) => {
            setQueueData(data);
            setView("queue-status");
          }}
        />
        <Toaster />
      </>
    );
  }

  // 2. หน้าแสดงผลสถานะคิว
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

  // 4. หน้า Landing Page (เรียกใช้ Component ใหม่)
  return (
    <>
      <LandingPage
        onPatientClick={() => setView("patient")}
        onStaffClick={() => setView("staff")}
      />
      <Toaster />
    </>
  );
}
