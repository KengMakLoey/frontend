import { useState } from "react";
import type { QueueData } from "../shared/types";
import { API } from "../shared/api";
import { formatVN } from "../utils/vnValidator";

export function useQueueChecker() {
  const [inputValue, setInputValue] = useState(""); // เปลี่ยนชื่อจาก vn เป็น inputValue เพื่อความชัดเจน
  const [queueData, setQueueData] = useState<QueueData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = inputValue.trim();

    if (!input) {
      setError("กรุณากรอกข้อมูล");
      return;
    }

    setLoading(true);
    setError("");
    setQueueData(null);

    try {
      let data: QueueData | null = null;

      // 1. ตรวจสอบว่าเป็นเบอร์โทรศัพท์หรือไม่ (ตัวเลข 10 หลัก ขึ้นต้นด้วย 0)
      const isPhoneNumber = /^0\d{9}$/.test(input);

      if (isPhoneNumber) {
        // ค้นหาด้วยเบอร์โทรศัพท์
        data = await API.getQueueByPhone(input);
      } else {
        // 2. ถ้าไม่ใช่เบอร์โทร ลอง Format เป็น VN
        const formattedVN = formatVN(input);

        if (formattedVN) {
          // ค้นหาด้วย VN
          data = await API.getQueueByVN(formattedVN);
        } else {
          // ถ้า Format ไม่ได้ทั้งคู่
          setError(
            "รูปแบบข้อมูลไม่ถูกต้อง กรุณากรอกเลข VN หรือ เบอร์โทรศัพท์ 10 หลัก"
          );
          setLoading(false);
          return;
        }
      }

      if (data) {
        setQueueData(data);
      } else {
        setError("ไม่พบข้อมูลคิว กรุณาตรวจสอบข้อมูลอีกครั้ง");
      }
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const resetQueue = () => {
    setInputValue("");
    setQueueData(null);
    setError("");
  };

  return {
    vn: inputValue, // ส่งออกไปในชื่อเดิมเพื่อให้ Component ไม่พัง
    setVn: setInputValue, // ส่งออกไปในชื่อเดิม
    queueData,
    loading,
    error,
    handleSubmit,
    resetQueue,
  };
}
