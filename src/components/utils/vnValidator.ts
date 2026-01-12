/**
 * VN Validation และ Formatting Utilities
 * รูปแบบมาตรฐาน: VN260112-0001
 */

// ==================== CONSTANTS ====================
export const VN_REGEX = /^VN\d{6}-\d{4}$/;
export const VN_DATE_REGEX = /^VN(\d{2})(\d{2})(\d{2})-(\d{4})$/;
export const VN_NUMBER_ONLY_REGEX = /^\d+$/;
export const VN_PREFIX_ONLY_REGEX = /^VN\d+$/;

// ==================== VALIDATION ====================

/**
 * ตรวจสอบว่า VN ถูกต้องตามรูปแบบมาตรฐานหรือไม่
 * @param vn - หมายเลข VN ที่ต้องการตรวจสอบ
 * @returns true ถ้ารูปแบบถูกต้อง (VN260112-0001)
 */
export function isValidVN(vn: string): boolean {
  return VN_REGEX.test(vn.trim());
}

/**
 * ตรวจสอบว่า input เป็นตัวเลขเท่านั้นหรือไม่
 */
export function isNumberOnly(input: string): boolean {
  return VN_NUMBER_ONLY_REGEX.test(input.trim());
}

/**
 * ตรวจสอบว่า input มี VN prefix แต่ไม่มีวันที่
 */
export function isVNPrefixOnly(input: string): boolean {
  return VN_PREFIX_ONLY_REGEX.test(input.trim());
}

/**
 * ตรวจสอบว่าวันที่ใน VN เป็นวันที่ปัจจุบันหรือไม่
 */
export function isVNToday(vn: string): boolean {
  const parsed = parseVN(vn);
  if (!parsed) return false;

  const today = new Date();
  const yy = String(today.getFullYear()).slice(-2);
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  return parsed.year === `20${yy}` && parsed.month === mm && parsed.day === dd;
}

// ==================== FORMATTING ====================

/**
 * สร้าง VN date prefix จากวันที่ปัจจุบัน
 * @returns "VN260112-" สำหรับวันที่ 12 มกราคม 2026
 */
export function getTodayVNPrefix(): string {
  const today = new Date();
  const yy = String(today.getFullYear()).slice(-2);
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `VN${yy}${mm}${dd}-`;
}

/**
 * Format VN จาก input หลายรูปแบบให้เป็นรูปแบบมาตรฐาน
 *
 * รองรับ input:
 * - "1" หรือ "0001" -> "VN260112-0001"
 * - "VN1" หรือ "VN0001" -> "VN260112-0001"
 * - "VN260112-0001" -> "VN260112-0001"
 *
 * @param input - VN ที่ต้องการ format
 * @returns VN ที่ถูก format หรือ null ถ้ารูปแบบไม่ถูกต้อง
 */
export function formatVN(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const datePrefix = getTodayVNPrefix();

  // กรณีที่ 1: กรอกแค่ตัวเลข เช่น "1" หรือ "0001"
  if (isNumberOnly(trimmed)) {
    return `${datePrefix}${trimmed.padStart(4, "0")}`;
  }

  // กรณีที่ 2: กรอก "VN1" หรือ "VN0001" (ไม่มีวันที่)
  if (isVNPrefixOnly(trimmed)) {
    const num = trimmed.replace("VN", "");
    return `${datePrefix}${num.padStart(4, "0")}`;
  }

  // กรณีที่ 3: กรอกเต็ม "VN260112-0001"
  if (isValidVN(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Format VN เป็นรูปแบบที่แสดงผล (user-friendly)
 * @param vn - VN ที่ต้องการ format
 * @returns "VN 26/01/12 - 0001"
 */
export function formatVNDisplay(vn: string): string {
  const parsed = parseVN(vn);
  if (!parsed) return vn;

  return `VN ${parsed.date} - ${parsed.number}`;
}

/**
 * ดึงเฉพาะหมายเลขคิวจาก VN
 * @param vn - "VN260112-0001"
 * @returns "0001"
 */
export function extractVNNumber(vn: string): string {
  return vn.split("-").pop() || vn;
}

// ==================== PARSING ====================

/**
 * แยก VN เป็นส่วนประกอบต่างๆ
 *
 * @param vn - "VN260112-0001"
 * @returns {
 *   year: "2026",
 *   month: "01",
 *   day: "12",
 *   number: "0001",
 *   date: "26/01/12",
 *   fullDate: "2026-01-12"
 * }
 */
export function parseVN(vn: string): {
  year: string;
  month: string;
  day: string;
  number: string;
  date: string;
  fullDate: string;
} | null {
  const match = vn.match(VN_DATE_REGEX);
  if (!match) return null;

  const [, year, month, day, number] = match;
  const fullYear = `20${year}`;

  return {
    year: fullYear,
    month,
    day,
    number,
    date: `${year}/${month}/${day}`,
    fullDate: `${fullYear}-${month}-${day}`,
  };
}

// ==================== GENERATION ====================

/**
 * สร้าง VN ใหม่จากหมายเลขคิว
 * @param queueNumber - หมายเลขคิว เช่น 1, 2, 3...
 * @returns "VN260112-0001"
 */
export function generateVN(queueNumber: number): string {
  const datePrefix = getTodayVNPrefix();
  return `${datePrefix}${String(queueNumber).padStart(4, "0")}`;
}

/**
 * สร้าง VN แบบ random สำหรับทดสอบ
 */
export function generateRandomVN(): string {
  const randomNumber = Math.floor(Math.random() * 9999) + 1;
  return generateVN(randomNumber);
}

// ==================== COMPARISON ====================

/**
 * เปรียบเทียบว่า VN ไหนมาก่อน
 * @returns -1 ถ้า vn1 < vn2, 0 ถ้าเท่ากัน, 1 ถ้า vn1 > vn2
 */
export function compareVN(vn1: string, vn2: string): number {
  const parsed1 = parseVN(vn1);
  const parsed2 = parseVN(vn2);

  if (!parsed1 || !parsed2) return 0;

  // เปรียบเทียบวันที่ก่อน
  const date1 = new Date(parsed1.fullDate);
  const date2 = new Date(parsed2.fullDate);

  if (date1 < date2) return -1;
  if (date1 > date2) return 1;

  // ถ้าวันที่เท่ากัน เปรียบเทียบหมายเลข
  const num1 = parseInt(parsed1.number);
  const num2 = parseInt(parsed2.number);

  if (num1 < num2) return -1;
  if (num1 > num2) return 1;

  return 0;
}

// ==================== ERROR MESSAGES ====================

/**
 * ดึง error message สำหรับ VN ที่ไม่ถูกต้อง
 */
export function getVNErrorMessage(input: string): string {
  if (!input || !input.trim()) {
    return "กรุณากรอกเลข VN";
  }

  if (input.includes(" ")) {
    return "เลข VN ต้องไม่มีช่องว่าง";
  }

  if (input.length < 4) {
    return "เลข VN สั้นเกินไป";
  }

  if (input.length > 20) {
    return "เลข VN ยาวเกินไป";
  }

  return "รูปแบบ VN ไม่ถูกต้อง (กรอกได้: 0001, VN0001, หรือ VN260112-0001)";
}
