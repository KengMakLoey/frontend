import { useState, useEffect, useRef, useCallback } from "react";
import {
  Hourglass,
  Check,
  CheckCircle2,
  Circle,
  Volume2,
  VolumeX,
} from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import type { QueueData } from "../components/shared/types";
import { API } from "../components/shared/api";
import { useQueueWebSocket } from "../components/shared/useWebSocket";
import { playBeepSound } from "../components/shared/soundUtils";
import { toast } from "sonner";

interface PatientStatusProps {
  initialData: QueueData;
  onBack: () => void;
}

export default function PatientStatus({
  initialData,
  onBack,
}: PatientStatusProps) {
  const [queueData, setQueueData] = useState<QueueData>(initialData);
  const [currentTime, setCurrentTime] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);

  const hasPlayedSound = useRef(false);

  // --- 1. Clock Logic ---
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- 2. Real-time Logic ---
  const handleQueueUpdate = useCallback(
    (updatedData: QueueData) => {
      setQueueData((prev) => {
        if (
          updatedData.status === "called" &&
          prev.status !== "called" &&
          !hasPlayedSound.current
        ) {
          if (soundEnabled) playBeepSound();
          hasPlayedSound.current = true;
          toast.success("🔔 ถึงคิวของคุณแล้ว! กรุณาเข้าห้องตรวจ");
          if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
        }
        return updatedData;
      });
    },
    [soundEnabled]
  );

  const { isConnected } = useQueueWebSocket(initialData.vn, handleQueueUpdate);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    if (!isConnected) {
      intervalId = setInterval(async () => {
        try {
          const updated = await API.getQueueByVN(initialData.vn);
          if (isMounted && updated) {
            handleQueueUpdate(updated);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 5000);
    }

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [isConnected, initialData.vn, handleQueueUpdate]);

  useEffect(() => {
    hasPlayedSound.current = false;
  }, [initialData.vn]);

  // --- 3. Styles & Render Helpers ---
  const THEME_TEAL = "#3CAEA3";
  const THEME_DARK_BLUE = "#044C72";
  const THEME_RED = "#FF5A5A";
  const THEME_GREEN = "#87E74B";

  const isWaiting = queueData.status === "waiting";
  const isCalled = queueData.status === "called";
  const isInProgress = queueData.status === "in_progress";
  const isCompleted = queueData.status === "completed";

  const renderTimelineItem = (
    stepStatus: "active" | "inactive" | "completed",
    title: string,
    description?: string,
    isLast: boolean = false
  ) => {
    // กำหนดสีของเส้น: ถ้าสถานะเป็น active หรือ completed ให้เส้นเป็นสีเขียว
    const isLineActive = stepStatus === "active" || stepStatus === "completed";

    return (
      <div
        className={`relative flex gap-3 ${!isLast ? "pb-4 md:pb-6" : "pb-0"}`}
      >
        {/* Line Connector */}
        {!isLast && (
          <div
            className={`absolute left-[1.15rem] top-8 bottom-0 w-[2px] transition-colors duration-300 ${
              isLineActive ? "bg-[#87E74B]" : "bg-gray-200"
            }`}
            style={{ transform: "translateX(-50%)" }}
          />
        )}

        {/* Icon */}
        <div className="relative z-10 flex-shrink-0 flex items-start pt-1">
          {stepStatus === "active" ? (
            <div
              className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-md"
              style={{ backgroundColor: THEME_GREEN }}
            >
              <Check
                className="text-white w-5 h-5 md:w-6 md:h-6"
                strokeWidth={4}
              />
            </div>
          ) : (
            <div className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-gray-300 rounded-full" />
            </div>
          )}
        </div>

        {/* Text */}
        <div className="pt-1 flex-1 min-w-0">
          <p
            className={`font-bold text-base md:text-lg ${
              stepStatus === "active" ? "text-[#044C72]" : "text-[#044C72]/60"
            }`}
          >
            {title}
          </p>
          {stepStatus === "active" && description && (
            <p className="text-[11px] md:text-sm text-gray-400 mt-0.5 leading-snug break-words">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-white font-sans overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-blue-50/50 to-transparent -z-10" />

      {/* Header */}
      <div className="shrink-0">
        <Header />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-between px-4 py-2 w-full max-w-md mx-auto overflow-hidden">
        {/* Top Section */}
        <div className="flex flex-col items-center w-full space-y-2 pt-2 md:pt-6">
          {/* 1. Room/Location Pill (Dynamic) */}
          <div
            className="px-6 py-2 rounded-full shadow-md text-white font-bold text-lg md:text-xl tracking-wide"
            style={{ backgroundColor: THEME_TEAL }}
          >
            {/* แสดงข้อมูลห้อง (room) แทนข้อความ hardcoded */}
            {queueData.departmentLocation || "ห้องตรวจ"}
          </div>

          {/* 2. Big Queue Number */}
          <div className="text-center">
            <h1
              className="text-[5.5rem] md:text-[6.5rem] leading-[0.9] font-bold tracking-tighter"
              style={{ color: THEME_DARK_BLUE }}
            >
              {queueData.queueNumber}
            </h1>
          </div>

          {/* 3. Remaining Count Pill */}
          {isWaiting && (
            <div
              className="w-[90%] md:w-full rounded-full py-2 px-4 flex items-center justify-center gap-3 shadow-md relative overflow-hidden"
              style={{ backgroundColor: THEME_RED }}
            >
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Hourglass className="text-white w-5 h-5 md:w-6 md:h-6 animate-pulse" />
              </div>
              <div className="text-center text-white">
                <p className="font-bold text-lg md:text-xl leading-none">
                  เหลืออีก {queueData.yourPosition} คิว
                </p>
                <p className="text-[10px] md:text-xs opacity-90 font-light">
                  กรุณารอใกล้บริเวณห้องตรวจ
                </p>
              </div>
            </div>
          )}

          {/* Timestamp */}
          <p className="text-gray-400 text-xs md:text-sm font-medium mt-1">
            อัปเดตล่าสุด: {currentTime} น.
          </p>
        </div>

        {/* 4. Status Card */}
        <div className="w-full bg-white rounded-[1.5rem] shadow-sm border border-gray-200 mt-2 mb-1">
          {/* Header ที่มีความโค้งมนด้านบน (rounded-t) */}
          <div
            className="py-2.5 md:py-3 text-center text-white font-bold text-lg md:text-xl tracking-wide rounded-t-[1.5rem]"
            style={{ backgroundColor: THEME_TEAL }}
          >
            สถานะคิวของท่าน
          </div>

          <div className="p-5 pl-6 md:p-6 md:pl-8">
            {renderTimelineItem(
              isWaiting
                ? "active"
                : isCalled || isInProgress || isCompleted
                ? "completed"
                : "inactive",
              "รอเข้ารับบริการ",
              "ขณะนี้ยังไม่ถึงคิวของท่าน กรุณารอใกล้บริเวณห้องตรวจ"
            )}

            {renderTimelineItem(
              isCalled || isInProgress
                ? "active"
                : isCompleted
                ? "completed"
                : "inactive",
              "กำลังดำเนินการบริการ",
              "ถึงคิวของท่านแล้ว! กรุณาเข้าห้องตรวจ"
            )}

            {renderTimelineItem(
              isCompleted ? "active" : "inactive",
              "ได้รับบริการเรียบร้อยแล้ว",
              "การบริการเสร็จสิ้น",
              true
            )}
          </div>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="shrink-0 flex items-center gap-2 text-gray-400 hover:text-[#3CAEA3] transition-colors text-xs md:text-sm font-medium pb-1 md:pb-4"
        >
          {soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 md:w-4 md:h-4" />
          )}
          {soundEnabled ? "เปิดเสียงแจ้งเตือน" : "ปิดเสียงแจ้งเตือน"}
        </button>
      </main>

      {/* Footer */}
      <div className="shrink-0 w-full z-20">
        <Footer />
      </div>
    </div>
  );
}
