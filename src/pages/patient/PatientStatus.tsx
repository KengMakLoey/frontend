import { useState, useEffect, useRef, useCallback } from "react";
import { Volume2, VolumeX, X } from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import type { QueueData } from "../../components/shared/types";
import { API } from "../../components/shared/api";
import { useQueueWebSocket } from "../../components/shared/useWebSocket";
import { playBeepSound, playTTS } from "../../components/shared/soundUtils";
import { useLanguage } from "../../components/contexts/LanguageContext";

interface PatientStatusProps {
  initialData: QueueData;
  onBack: () => void;
}

type OverlayType = "success" | "warning" | "error";

interface NotificationOverlayState {
  visible: boolean;
  type: OverlayType;
  title: string;
  message: string;
}

export default function PatientStatus({ initialData }: PatientStatusProps) {
  const { t, currentLanguage } = useLanguage();
  const [queueData, setQueueData] = useState<QueueData>(initialData);
  const [currentTime, setCurrentTime] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [overlay, setOverlay] = useState<NotificationOverlayState>({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  const hasPlayedSound = useRef(false);
  const hasWarnedNear = useRef(false);

  // --- 1. Clock Logic ---
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const locale = currentLanguage.code === "th" ? "th-TH" : "en-US";
      setCurrentTime(
        now.toLocaleTimeString(locale, {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [currentLanguage.code]);

  // --- 2. Real-time Logic ---
  const handleQueueUpdate = useCallback(
    (updatedData: QueueData) => {
      setQueueData((prev) => {
        // Condition 1: Called (Green) -> เรียกคิว
        if (
          updatedData.status === "called" &&
          prev.status !== "called" &&
          !hasPlayedSound.current
        ) {
          if (soundEnabled) {
            const locationLabel =
              updatedData.departmentLocation || t.status.room;
            const message = `${t.status.called} ${updatedData.queueNumber} ${locationLabel}`;
            playTTS(message);
          }

          hasPlayedSound.current = true;
          if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);

          setOverlay({
            visible: true,
            type: "success",
            title: t.patient_status.alert_called_title,
            message: t.patient_status.alert_called_message,
          });
        }

        // Condition 2: Skipped (Red) -> ถูกข้าม
        if (updatedData.isSkipped && !prev.isSkipped) {
          if (soundEnabled) {
            const message = `${t.status.skipped} ${updatedData.queueNumber}`;
            playTTS(message);
          }
          if ("vibrate" in navigator) navigator.vibrate([500]);

          setOverlay({
            visible: true,
            type: "error",
            title: t.patient_status.alert_skipped_title,
            message: t.patient_status.alert_skipped_message,
          });
        }

        // Condition 3: Near (Yellow) -> ใกล้ถึงคิว
        if (
          updatedData.status === "waiting" &&
          updatedData.yourPosition <= 5 &&
          updatedData.yourPosition > 0 &&
          prev.yourPosition > 5 &&
          !hasWarnedNear.current
        ) {
          hasWarnedNear.current = true;
          if (soundEnabled) {
            playBeepSound();
          }

          setOverlay({
            visible: true,
            type: "warning",
            title: t.patient_status.alert_near_title,
            message: t.patient_status.alert_near_message.replace(
              "{count}",
              updatedData.yourPosition.toString(),
            ),
          });
        }

        return updatedData;
      });
    },
    [soundEnabled, t],
  );

  const { isConnected } = useQueueWebSocket(initialData.vn, handleQueueUpdate);

  useEffect(() => {
    let isMounted = true;
    // --- แก้ไขจุดที่ Error ตรงนี้ ---
    // เปลี่ยนจาก NodeJS.Timeout เป็น ReturnType<typeof setInterval>
    let intervalId: ReturnType<typeof setInterval> | null = null;

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
    hasWarnedNear.current = false;
  }, [initialData.vn]);

  // --- 3. Styles & Helpers ---
  const THEME_TEAL = "#3CAEA3";
  const THEME_DARK_BLUE = "#044C72";
  const THEME_RED = "#FF5A5A";
  const THEME_GREEN = "#87E74B";
  const THEME_YELLOW = "#FFAE3C";

  const renderTimelineItem = (
    stepStatus: "active" | "inactive" | "completed",
    title: string,
    description?: string,
    isLast: boolean = false,
  ) => {
    const isLineActive = stepStatus === "completed";

    return (
      <div
        className={`relative flex gap-3 ${!isLast ? "pb-4 md:pb-6" : "pb-0"}`}
      >
        {!isLast && (
          <div
            className={`absolute left-[1.15rem] top-8 bottom-0 w-[2px] transition-colors duration-300 ${
              isLineActive ? "bg-[#87E74B]" : "bg-gray-200"
            }`}
            style={{ transform: "translateX(-50%)" }}
          />
        )}
        <div className="relative z-10 flex-shrink-0 flex items-start pt-1">
          {stepStatus === "active" || stepStatus === "completed" ? (
            <div
              className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-300 scale-100"
              style={{ backgroundColor: THEME_GREEN }}
            >
              <img
                src="/check-symbol.svg"
                alt="check"
                className="w-4 h-4 md:w-5 md:h-5 brightness-0 invert"
              />
            </div>
          ) : (
            <div className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-gray-300 rounded-full" />
            </div>
          )}
        </div>
        <div className="pt-1 flex-1 min-w-0">
          <p
            className={`font-bold text-base md:text-lg ${
              stepStatus === "active" || stepStatus === "completed"
                ? "text-[#044C72]"
                : "text-[#044C72]/60"
            }`}
          >
            {title}
          </p>
          {(stepStatus === "active" || stepStatus === "completed") &&
            description && (
              <p className="text-[11px] md:text-sm text-gray-400 mt-0.5 leading-snug break-words">
                {description}
              </p>
            )}
        </div>
      </div>
    );
  };

  const renderNotificationBanner = () => {
    if (!overlay.visible) return null;

    let iconBgColor = "";
    let iconSrc = "";

    switch (overlay.type) {
      case "success": // Called
        iconBgColor = "bg-[#87E74B]";
        iconSrc = "/bell.svg";
        break;
      case "warning": // Near
        iconBgColor = "bg-[#FFAE3C]";
        iconSrc = "/bell.svg";
        break;
      case "error": // Skipped
        iconBgColor = "bg-[#FF5A5A]";
        iconSrc = "/warning-triangle.svg";
        break;
    }

    return (
      <>
        <div
          className="fixed inset-0 bg-black/60 z-[90] transition-opacity duration-300 backdrop-blur-[2px]"
          onClick={() => setOverlay({ ...overlay, visible: false })}
        />
        <div className="fixed top-8 left-4 right-4 z-[100] flex justify-center pointer-events-none">
          <div
            className={`
              pointer-events-auto cursor-pointer
              w-full max-w-sm bg-white rounded-[2rem] p-4 pr-10
              shadow-2xl
              flex items-center gap-4
              relative
              animate-in slide-in-from-top duration-500 ease-out
              border border-white/20
            `}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOverlay({ ...overlay, visible: false });
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div
              className={`shrink-0 w-16 h-16 ${iconBgColor} rounded-full flex items-center justify-center shadow-lg ring-4 ring-white`}
            >
              <img
                src={iconSrc}
                alt="icon"
                className="w-8 h-8 invert brightness-0 animate-[swing_1s_ease-in-out_infinite]"
              />
            </div>
            <div className="flex-1 min-w-0 py-1">
              <h3 className="font-bold text-[#044C72] text-xl leading-tight mb-1">
                {overlay.title}
              </h3>
              <p className="text-sm text-gray-500 leading-snug">
                {overlay.message}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  };

  const getStatusCardContent = () => {
    if (queueData.isSkipped) {
      return {
        color: THEME_RED,
        iconPath: "/warning-triangle.svg",
        title: t.patient_status.alert_skipped_title,
        subtitle: t.patient_status.alert_skipped_message,
        animate: false,
      };
    }

    switch (queueData.status) {
      case "called":
      case "in_progress":
        return {
          color: THEME_GREEN,
          iconPath: "/bell.svg",
          title: t.patient_status.alert_called_title,
          subtitle: t.patient_status.alert_called_message,
          animate: true,
        };
      case "completed":
        return {
          color: THEME_TEAL,
          iconPath: "/check-symbol.svg",
          title: t.status.completed,
          subtitle: t.common.hospital_name,
          animate: false,
        };
      default: // waiting
        if (queueData.yourPosition <= 5) {
          return {
            color: THEME_YELLOW,
            iconPath: "/sandclock.svg",
            title: t.status.queue_count.replace(
              "{count}",
              queueData.yourPosition.toString(),
            ),
            subtitle: t.patient_status.alert_near_message.replace(
              "{count}",
              queueData.yourPosition.toString(),
            ),
            animate: true,
          };
        }
        return {
          color: THEME_RED,
          iconPath: "/sandclock.svg",
          title: t.status.queue_count.replace(
            "{count}",
            queueData.yourPosition.toString(),
          ),
          subtitle: t.status.please_wait,
          animate: true,
        };
    }
  };

  const statusCard = getStatusCardContent();

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-white font-sans overflow-hidden relative">
      {renderNotificationBanner()}

      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-blue-50/50 to-transparent -z-10" />

      <div className="shrink-0">
        <Header />
      </div>

      <main className="flex-1 flex flex-col items-center justify-between px-4 py-2 w-full max-w-md mx-auto overflow-hidden">
        {/* Top Section */}
        <div className="flex flex-col items-center w-full space-y-2 pt-2 md:pt-6">
          {/* Room Pill */}
          <div
            className="px-6 py-2 rounded-full shadow-md text-white font-bold text-lg md:text-xl tracking-wide"
            style={{ backgroundColor: THEME_TEAL }}
          >
            {queueData.departmentLocation || t.status.room}
          </div>

          {/* Queue Number */}
          <div className="text-center">
            <h1
              className="text-[5.5rem] md:text-[6.5rem] leading-[0.9] font-bold tracking-tighter"
              style={{ color: THEME_DARK_BLUE }}
            >
              {queueData.queueNumber}
            </h1>
          </div>

          {/* Dynamic Status Card (Always Visible) */}
          <div
            className="w-[90%] md:w-full rounded-full py-2 px-4 flex items-center justify-center gap-3 shadow-md relative overflow-hidden transition-colors duration-500"
            style={{ backgroundColor: statusCard.color }}
          >
            <div className="bg-white/20 p-1.5 rounded-lg flex items-center justify-center">
              <img
                src={statusCard.iconPath}
                alt="status-icon"
                className={`w-5 h-5 md:w-6 md:h-6 brightness-0 invert ${
                  statusCard.animate ? "animate-pulse" : ""
                }`}
              />
            </div>
            <div className="text-center text-white">
              <p className="font-bold text-lg md:text-xl leading-none">
                {statusCard.title}
              </p>
              <p className="text-[10px] md:text-xs opacity-90 font-light mt-0.5">
                {statusCard.subtitle}
              </p>
            </div>
          </div>

          <p className="text-gray-400 text-xs md:text-sm font-medium mt-1">
            VN{queueData.vn.split("-").pop()}
          </p>
          <p className="text-gray-400 text-xs md:text-sm font-medium mt-1">
            {t.patient_status.last_update.replace("{time}", currentTime)}
          </p>
        </div>

        {/* Timeline Status Card */}
        <div className="w-full bg-white rounded-[1.5rem] shadow-sm border border-gray-200 mt-2 mb-1">
          <div
            className="py-2.5 md:py-3 text-center text-white font-bold text-lg md:text-xl tracking-wide rounded-t-[1.5rem]"
            style={{ backgroundColor: THEME_TEAL }}
          >
            {t.patient_status.timeline_title}
          </div>

          <div className="p-5 pl-6 md:p-6 md:pl-8">
            {renderTimelineItem(
              queueData.status === "waiting" && !queueData.isSkipped
                ? "active"
                : queueData.status === "called" ||
                    queueData.status === "in_progress" ||
                    queueData.status === "completed"
                  ? "completed"
                  : "inactive",
              t.status.waiting,
              t.status.please_wait,
            )}

            {renderTimelineItem(
              queueData.status === "called" ||
                queueData.status === "in_progress"
                ? "active"
                : queueData.status === "completed"
                  ? "completed"
                  : "inactive",
              t.status.called,
              t.patient_status.alert_called_message,
            )}

            {renderTimelineItem(
              queueData.status === "completed" ? "active" : "inactive",
              t.status.completed,
              t.status.completed,
              true,
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
          {soundEnabled
            ? t.patient_status.sound_on
            : t.patient_status.sound_off}
        </button>
      </main>

      <div className="shrink-0 w-full z-20">
        <Footer />
      </div>
    </div>
  );
}
