import { useState, useEffect, useRef, useCallback } from "react";
import {
  Volume2,
  VolumeX,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  RotateCcw,
} from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import type { QueueData } from "../components/shared/types";
import { API } from "../components/shared/api";
import { useQueueWebSocket } from "../components/shared/useWebSocket";
import { playBeepSound } from "../components/shared/soundUtils";
import { Button } from "../components/ui/button";

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
  const [isFlashing, setIsFlashing] = useState(false);

  const hasPlayedSound = useRef(false);

  // --- Clock Logic ---
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

  // --- Real-time Logic ---
  const handleQueueUpdate = useCallback(
    (updatedData: QueueData) => {
      setQueueData((prev) => {
        // Play sound if status changed to 'called'
        if (
          updatedData.status === "called" &&
          prev.status !== "called" &&
          !hasPlayedSound.current
        ) {
          if (soundEnabled) playBeepSound();
          hasPlayedSound.current = true;

          // Trigger Flashing Effect
          setIsFlashing(true);
          setTimeout(() => setIsFlashing(false), 5000);

          // Vibrate
          if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
        }
        return updatedData;
      });
    },
    [soundEnabled]
  );

  // WebSocket Connection
  const { isConnected } = useQueueWebSocket(initialData.vn, handleQueueUpdate);

  // Polling Fallback
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

  // Reset sound flag when queue changes (if used in future)
  useEffect(() => {
    hasPlayedSound.current = false;
  }, [initialData.vn]);

  // --- Helper for Status Colors & Text ---
  const getStatusColor = () => {
    if (queueData.isSkipped) return "text-red-600";
    if (queueData.status === "called") return "text-[#005691]"; // Flashy Blue/Green?
    if (queueData.status === "in_progress") return "text-[#005691]";
    return "text-[#005691]"; // Default Brand Blue
  };

  const isNear =
    queueData.status === "waiting" &&
    queueData.yourPosition <= 5 &&
    queueData.yourPosition > 0;

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-white font-sans overflow-hidden">
      {/* Header */}
      <div className="shrink-0">
        <Header />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-6 pt-4 pb-4 overflow-y-auto">
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Department Info */}
          <div className="flex justify-between items-end border-b pb-4">
            <div>
              <p className="text-[#044C72] text-xl font-bold">
                {queueData.department}
              </p>
              <p className="text-gray-500 text-sm">แผนกตรวจโรคทั่วไป</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs">ห้องตรวจ</p>
              <p className="text-[#044C72] text-2xl font-bold flex items-center gap-1">
                <MapPin className="w-5 h-5" />
                {queueData.departmentLocation}
              </p>
            </div>
          </div>

          {/* Notifications Banner */}
          {queueData.isSkipped ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm animate-pulse">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <div>
                  <p className="font-bold text-red-700">พลาดคิว / ถูกข้าม</p>
                  <p className="text-xs text-red-600">
                    กรุณาติดต่อเจ้าหน้าที่ทันที
                  </p>
                </div>
              </div>
            </div>
          ) : queueData.status === "called" ? (
            <div
              className={`bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg shadow-sm ${
                isFlashing ? "animate-pulse" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <Volume2 className="w-6 h-6 text-green-600 animate-bounce" />
                <div>
                  <p className="font-bold text-green-700">กำลังเรียกคิวคุณ</p>
                  <p className="text-xs text-green-600">
                    กรุณาเข้าห้องตรวจทันที
                  </p>
                </div>
              </div>
            </div>
          ) : isNear ? (
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg shadow-sm">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-orange-500" />
                <div>
                  <p className="font-bold text-orange-700">ใกล้ถึงคิว</p>
                  <p className="text-xs text-orange-600">
                    กรุณาเตรียมตัวรอเรียก
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Queue Number Display */}
          <div className="text-center relative py-4">
            {/* Time Stamp */}
            <div className="absolute top-0 right-0 text-gray-400 text-sm flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {currentTime}
            </div>

            {/* Queue Number */}
            <div
              className={`text-[8rem] leading-none font-bold tracking-tighter ${getStatusColor()} transition-all duration-500`}
            >
              {queueData.queueNumber}
            </div>

            {/* Remaining Count */}
            {queueData.status === "waiting" && (
              <p className="text-gray-500 font-medium mt-2">
                เหลืออีก{" "}
                <span className="text-[#044C72] font-bold text-xl">
                  {queueData.yourPosition}
                </span>{" "}
                คิว
              </p>
            )}
            {queueData.status === "completed" && (
              <p className="text-green-600 font-medium mt-2">
                เสร็จสิ้นการบริการ
              </p>
            )}
          </div>

          {/* Queue Status Timeline */}
          <div className="space-y-2">
            <h3 className="text-[#044C72] font-bold text-lg mb-4">
              สถานะคิวของท่าน
            </h3>

            {/* Step 1: Waiting */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {queueData.status === "waiting" ? (
                  <div className="w-6 h-6 bg-[#044C72] rounded-full flex items-center justify-center shadow-md ring-4 ring-blue-50">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  </div>
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                )}
                {/* Vertical Line */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gray-200"></div>
              </div>
              <p
                className={`${
                  queueData.status === "waiting"
                    ? "text-[#044C72] font-bold"
                    : "text-gray-400"
                }`}
              >
                รอเข้ารับบริการ
              </p>
            </div>

            {/* Step 2: In Progress / Called */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {queueData.status === "called" ||
                queueData.status === "in_progress" ? (
                  <div className="w-6 h-6 bg-[#044C72] rounded-full flex items-center justify-center shadow-md ring-4 ring-blue-50">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  </div>
                ) : queueData.status === "completed" ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-300 fill-gray-100" />
                )}
                {/* Vertical Line */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gray-200"></div>
              </div>
              <p
                className={`${
                  queueData.status === "called" ||
                  queueData.status === "in_progress"
                    ? "text-[#044C72] font-bold"
                    : "text-gray-400"
                }`}
              >
                กำลังดำเนินการบริการ
              </p>
            </div>

            {/* Step 3: Completed */}
            <div className="flex items-center gap-4">
              <div>
                {queueData.status === "completed" ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-300 fill-gray-100" />
                )}
              </div>
              <p
                className={`${
                  queueData.status === "completed"
                    ? "text-green-600 font-bold"
                    : "text-gray-400"
                }`}
              >
                ได้รับบริการเรียบร้อยแล้ว
              </p>
            </div>
          </div>

          {/* Sound Toggle (Optional UX addition) */}
          <div className="pt-4 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-gray-400 hover:text-[#044C72]"
            >
              {soundEnabled ? (
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" /> เสียงแจ้งเตือนเปิด
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <VolumeX className="w-4 h-4" /> เสียงแจ้งเตือนปิด
                </div>
              )}
            </Button>
          </div>
        </div>
      </main>

      {/* Back Button (Floating or Fixed) - As per request "If you leave..." */}
      <div className="px-6 pb-2 w-full max-w-md mx-auto">
        <Button
          variant="outline"
          className="w-full border-gray-300 text-gray-500 hover:text-[#044C72] hover:border-[#044C72]"
          onClick={onBack}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          ออกหน้าคิว (สแกนใหม่)
        </Button>
      </div>

      <div className="shrink-0 w-full mt-2">
        <Footer />
      </div>
    </div>
  );
}
