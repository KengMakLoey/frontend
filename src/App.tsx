import { useState, useEffect } from "react";
import type { ViewType, QueueData } from "./components/shared/types";
import LandingPage from "./pages/LandingPage";
import PatientVN from "./pages/patient/PatientVN";
import PatientStatus from "./pages/patient/PatientStatus";
import StaffView from "./pages/staff/StaffView";
import { Toaster } from "./components/ui/sonner";

type ExtendedViewType = ViewType | "queue-status";

export default function App() {
  const [view, setView] = useState<ExtendedViewType>(() => {
    // ตรวจ patient ก่อน
    if (sessionStorage.getItem("patient_queue")) return "queue-status";
    // ตรวจ staff
    if (localStorage.getItem("staff_token") === "true") return "staff";
    return "landing";
  });

  const [queueData, setQueueData] = useState<QueueData | null>(() => {
    const saved = sessionStorage.getItem("patient_queue");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vn = params.get("vn");
    if (vn) {
      fetch(`${import.meta.env.VITE_API_URL}/api/queue/${vn}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            sessionStorage.setItem("patient_queue", JSON.stringify(data)); // ← เพิ่ม
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
            sessionStorage.setItem("patient_queue", JSON.stringify(data)); // ← เพิ่ม
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
            sessionStorage.removeItem("patient_queue"); // ← เพิ่ม
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
    <>
      <LandingPage
        onPatientClick={() => setView("patient")}
        onStaffClick={() => setView("staff")}
      />
      <Toaster />
    </>
  );
}