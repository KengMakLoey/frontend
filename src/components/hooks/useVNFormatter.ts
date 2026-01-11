import { useState, useCallback } from "react";
import { formatVN, parseVN } from "../utils/vnValidator";

interface UseVNFormatterReturn {
  formattedVN: string;
  isValid: boolean;
  error: string;
  formatInput: (input: string) => void;
  reset: () => void;
  parsedVN: ReturnType<typeof parseVN>;
}

/**
 * Custom Hook สำหรับจัดการ VN formatting
 * รองรับหลายรูปแบบ input และ validate
 */
export function useVNFormatter(): UseVNFormatterReturn {
  const [formattedVN, setFormattedVN] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState("");

  const formatInput = useCallback((input: string) => {
    setError("");

    if (!input.trim()) {
      setFormattedVN("");
      setIsValid(false);
      setError("กรุณากรอกเลข VN");
      return;
    }

    const formatted = formatVN(input);

    if (formatted) {
      setFormattedVN(formatted);
      setIsValid(true);
      setError("");
    } else {
      setFormattedVN("");
      setIsValid(false);
      setError(
        "รูปแบบ VN ไม่ถูกต้อง (กรอกได้: 0001, VN0001, หรือ VN260112-0001)"
      );
    }
  }, []);

  const reset = useCallback(() => {
    setFormattedVN("");
    setIsValid(false);
    setError("");
  }, []);

  const parsedVN = formattedVN ? parseVN(formattedVN) : null;

  return {
    formattedVN,
    isValid,
    error,
    formatInput,
    reset,
    parsedVN,
  };
}

/**
 * Hook สำหรับ auto-format VN ตอนพิมพ์
 * (แสดงผลแบบ real-time)
 */
export function useVNAutoFormat() {
  const [displayValue, setDisplayValue] = useState("");
  const [actualValue, setActualValue] = useState("");

  const handleChange = useCallback((input: string) => {
    setDisplayValue(input);

    const formatted = formatVN(input);
    if (formatted) {
      setActualValue(formatted);
    } else {
      setActualValue("");
    }
  }, []);

  const reset = useCallback(() => {
    setDisplayValue("");
    setActualValue("");
  }, []);

  return {
    displayValue,
    actualValue,
    handleChange,
    reset,
    isValid: !!actualValue,
  };
}
