import { useState, useEffect, useRef, useCallback } from "react";
import type { QueueData } from "../shared/types";
import { useQueueWebSocket } from "../shared/useWebSocket";
import { API } from "../shared/api";
import { playBeepSound } from "../shared/soundUtils";

const NOTIFICATION_DURATION = 15000; // 15 วินาที
const POLLING_INTERVAL = 5000; // 5 วินาที

export function useQueueNotification(queueData: QueueData | null) {
  const [notification, setNotification] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);

  const hasPlayedSound = useRef(false);
  const notificationTimeout = useRef<NodeJS.Timeout | null>(null);

  const showNotification = useCallback(
    (message: string) => {
      setNotification(message);

      if (soundEnabled) {
        playBeepSound();
      }

      // เพิ่มการสั่นของมือถือ (ถ้ารองรับ)
      if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200, 100, 200]);
      }

      // Clear timeout เก่า
      if (notificationTimeout.current) {
        clearTimeout(notificationTimeout.current);
      }

      // ตั้ง timeout ใหม่
      notificationTimeout.current = setTimeout(() => {
        setNotification("");
      }, NOTIFICATION_DURATION);
    },
    [soundEnabled]
  );

  const handleQueueUpdate = useCallback(
    (updatedData: QueueData) => {
      const oldStatus = queueData?.status;

      if (
        updatedData.status === "called" &&
        oldStatus !== "called" &&
        !hasPlayedSound.current
      ) {
        showNotification("🔔 ถึงคิวของคุณแล้ว! กรุณาเข้ารับบริการ");
        hasPlayedSound.current = true;
      }
    },
    [queueData?.status, showNotification]
  );

  const { isConnected: wsConnected } = useQueueWebSocket(
    queueData?.vn,
    handleQueueUpdate
  );

  // Polling fallback เมื่อ WebSocket ไม่ทำงาน
  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    if (queueData && !wsConnected) {
      const updateQueue = async () => {
        if (!isMounted) return;

        try {
          const updated = await API.getQueueByVN(queueData.vn);
          if (isMounted && updated) {
            if (
              updated.status === "called" &&
              queueData.status !== "called" &&
              !hasPlayedSound.current
            ) {
              showNotification("🔔 ถึงคิวของคุณแล้ว! กรุณาเข้ารับบริการ");
              hasPlayedSound.current = true;
            }
          }
        } catch (err) {
          console.error("Error updating queue:", err);
        }
      };

      intervalId = setInterval(updateQueue, POLLING_INTERVAL);
    }

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
      if (notificationTimeout.current)
        clearTimeout(notificationTimeout.current);
    };
  }, [queueData, wsConnected, showNotification]);

  // Reset hasPlayedSound เมื่อเปลี่ยนคิว
  useEffect(() => {
    hasPlayedSound.current = false;
  }, [queueData?.vn]);

  return {
    notification,
    soundEnabled,
    setSoundEnabled,
  };
}
