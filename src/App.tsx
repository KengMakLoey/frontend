import { useState, useEffect } from "react";
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vn = params.get("vn");
    if (vn) {
      fetch(`${import.meta.env.VITE_API_URL}/api/queue/${vn}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setQueueData(data);
            setView("queue-status");
          }
        })
        .catch(() => {});
    }
  }, []);

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
