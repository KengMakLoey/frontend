import React from "react";
import { QrCode } from "lucide-react";

interface QueueCheckFormProps {
  vn: string;
  setVn: (vn: string) => void;
  loading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}

export default function QueueCheckForm({
  vn,
  setVn,
  loading,
  error,
  onSubmit,
}: QueueCheckFormProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex justify-center mb-6">
        <QrCode className="w-16 h-16 text-blue-600" />
      </div>

      <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
        ตรวจสอบคิวของคุณ
      </h2>
      <p className="text-center text-gray-600 mb-8">
        กรุณากรอกเลข VN (Visit Number) ของคุณ
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            หมายเลข VN
          </label>
          <input
            type="text"
            value={vn}
            onChange={(e) => setVn(e.target.value)}
            placeholder="ตัวอย่าง: VN0001 หรือ 0001"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
            disabled={loading}
          />
          <p className="text-sm text-gray-500 mt-2">
            *หมายเลข VN จะอยู่ในใบนัดหมายของคุณ
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg disabled:opacity-50"
        >
          {loading ? "กำลังตรวจสอบ..." : "ตรวจสอบคิว"}
        </button>
      </form>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700 mb-2">
          <strong>คำแนะนำ:</strong> ถ้าคุณไม่มีหมายเลข VN
          กรุณาติดต่อเจ้าหน้าที่ที่จุดรับบัตร
        </p>
      </div>
    </div>
  );
}
