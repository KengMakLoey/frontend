import { CheckCircle, Bell, Clock, AlertCircle } from "lucide-react";
import type { QueueData } from "../shared/types";

interface QueueStatusCardProps {
  queueData: QueueData;
}

export default function QueueStatusCard({ queueData }: QueueStatusCardProps) {
  if (queueData.status === "completed") {
    return (
      <div className="text-center p-6 bg-purple-50 border-2 border-purple-500 rounded-lg mb-4">
        <CheckCircle className="w-12 h-12 text-purple-600 mx-auto mb-3" />
        <p className="text-purple-700 font-bold text-xl mb-2">
          ✅ รับบริการเสร็จสิ้น
        </p>
        <p className="text-purple-600">ขอบคุณที่ใช้บริการ โรงพยาบาลนครพิงค์</p>
      </div>
    );
  }

  if (queueData.status === "called") {
    return (
      <div className="text-center p-6 bg-green-50 border-2 border-green-500 rounded-lg mb-4">
        <Bell className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <p className="text-green-700 font-bold text-xl mb-2">
          🔔 ถึงคิวของคุณแล้ว!
        </p>
        <p className="text-green-600">
          กรุณาเข้ารับบริการที่ {queueData.departmentLocation}
        </p>
      </div>
    );
  }

  if (queueData.status === "in_progress") {
    return (
      <div className="text-center p-6 bg-blue-50 border-2 border-blue-500 rounded-lg mb-4">
        <Clock className="w-12 h-12 text-blue-600 mx-auto mb-3" />
        <p className="text-blue-700 font-bold text-xl mb-2">
          ⏳ กำลังรับบริการ
        </p>
        <p className="text-blue-600">กรุณารอสักครู่ กำลังดำเนินการ</p>
      </div>
    );
  }

  if (queueData.isSkipped) {
    return (
      <div className="text-center p-6 bg-orange-50 border-2 border-orange-500 rounded-lg mb-4">
        <AlertCircle className="w-12 h-12 text-orange-600 mx-auto mb-3" />
        <p className="text-orange-700 font-bold text-xl mb-2">
          ⚠️ คิวของคุณถูกข้าม
        </p>
        <p className="text-orange-600 mb-3">
          กรุณาติดต่อเจ้าหน้าที่ที่ {queueData.departmentLocation}
        </p>
        <p className="text-sm text-orange-500">เพื่อรายงานตัวและรับบริการ</p>
      </div>
    );
  }

  return (
    <div className="text-center p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
      <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
      <p className="text-blue-700 font-semibold">
        กรุณารอเรียกคิว - ระบบจะแจ้งเตือนเมื่อถึงคิวของคุณ
      </p>
    </div>
  );
}
