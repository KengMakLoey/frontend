import { useState } from "react";
import type { QueueData } from "../shared/types";
import { API } from "../shared/api";
import { formatVN } from "../utils/vnValidator";

export function useQueueChecker() {
  const [vn, setVn] = useState("");
  const [queueData, setQueueData] = useState<QueueData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedVN = vn.trim();
    if (!trimmedVN) {
      setError("กรุณากรอกเลข VN");
      return;
    }

    // Format VN
    const formattedVN = formatVN(trimmedVN);
    if (!formattedVN) {
      setError(
        "รูปแบบ VN ไม่ถูกต้อง (กรอกได้: 0001, VN0001, หรือ VN260108-0001)"
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await API.getQueueByVN(formattedVN);
      if (data) {
        setQueueData(data);
      } else {
        setError("ไม่พบข้อมูลคิว กรุณาตรวจสอบเลข VN อีกครั้ง");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const resetQueue = () => {
    setVn("");
    setQueueData(null);
    setError("");
  };

  return {
    vn,
    setVn,
    queueData,
    setQueueData,
    loading,
    error,
    handleSubmit,
    resetQueue,
  };
}
