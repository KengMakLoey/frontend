import { useState, useEffect } from "react";
import {
  Bell,
  CheckSquare,
  AlertCircle,
  ArrowLeft,
  X,
  PlusCircle,
  Hourglass,
} from "lucide-react";
import type { StaffData, StaffQueue } from "../../components/shared/types";
import { API } from "../../components/shared/api";

interface QueueManagementProps {
  staffData: StaffData | null;
  staffQueues: StaffQueue[];
  onBack: () => void;
  onRefresh: () => Promise<void>;
}

export default function QueueManagement({
  staffData,
  staffQueues,
  onBack,
  onRefresh,
}: QueueManagementProps) {
  const [currentCalledQueue, setCurrentCalledQueue] =
    useState<StaffQueue | null>(
      () =>
        staffQueues.find(
          (q) => q.status === "called" || q.status === "in_progress"
        ) || null
    );

  const waitingQueues = staffQueues.filter(
    (q) => q.status === "waiting" && !q.isSkipped
  );
  const skippedQueues = staffQueues.filter((q) => q.isSkipped);
  const nextQueue = waitingQueues[0];
  const [loading, setLoading] = useState(false);
  const [newQueueVN, setNewQueueVN] = useState("");
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [queueToSkip, setQueueToSkip] = useState<StaffQueue | null>(null);

  useEffect(() => {
    const called = staffQueues.find(
      (q) => q.status === "called" || q.status === "in_progress"
    );
    if (called) {
      setCurrentCalledQueue(called);
    } else if (
      currentCalledQueue &&
      !staffQueues.find((q) => q.queueId === currentCalledQueue.queueId)
    ) {
      setCurrentCalledQueue(null);
    }
  }, [staffQueues]);

  const handleCallQueue = async (queue: StaffQueue) => {
    try {
      await API.callQueue(queue.queueId, staffData?.staffName || "staff");
      setCurrentCalledQueue(queue);
      await onRefresh();
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเรียกคิว");
    }
  };

  const handlePatientArrived = async (queueId: number) => {
    try {
      await API.updatePatientArrived(queueId, staffData?.staffName || "staff");
      await onRefresh();
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการอัพเดทสถานะ");
    }
  };

  const handleSkipQueue = async (queueId: number) => {
    const queue = staffQueues.find((q) => q.queueId === queueId);
    if (!queue) return;

    setQueueToSkip(queue);
    setShowSkipConfirm(true);
  };

  const confirmSkipQueue = async () => {
    if (!queueToSkip) return;

    try {
      await API.skipQueue(queueToSkip.queueId, staffData?.staffName || "staff");

      if (currentCalledQueue?.queueId === queueToSkip.queueId) {
        setCurrentCalledQueue(null);
      }

      await onRefresh();
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการข้ามคิว");
    } finally {
      setShowSkipConfirm(false);
      setQueueToSkip(null);
    }
  };

  const handleCompleteQueue = async (queueId: number) => {
    try {
      await API.completeQueue(queueId, staffData?.staffName || "staff");
      setCurrentCalledQueue(null);
      await onRefresh();
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการทำรายการให้เสร็จสิ้น");
    }
  };

  const handleRecallSkipped = async (queueId: number) => {
    if (!confirm("ต้องการให้คนไข้เข้าคิวใหม่ใช่หรือไม่?")) return;
    try {
      await API.recallSkippedQueue(queueId, staffData?.staffName || "staff");
      await onRefresh();
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเรียกคืนคิว");
    }
  };

  const handleCreateQueue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!staffData) return;

    let inputVN = newQueueVN.trim();

    if (!inputVN) {
      alert("กรุณากรอกเลข VN");
      return;
    }

    const today = new Date();
    const yy = String(today.getFullYear()).slice(-2);
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const datePrefix = `VN${yy}${mm}${dd}-`;

    if (/^\d+$/.test(inputVN)) {
      inputVN = `${datePrefix}${inputVN.padStart(4, "0")}`;
    } else if (/^VN\d+$/.test(inputVN)) {
      const num = inputVN.replace("VN", "");
      inputVN = `${datePrefix}${num.padStart(4, "0")}`;
    } else if (!/^VN\d{6}-\d{4}$/.test(inputVN)) {
      alert("รูปแบบ VN ไม่ถูกต้อง");
      return;
    }

    setLoading(true);
    try {
      const result = await API.createQueue(inputVN, staffData.staffId);
      alert(`สร้างคิวสำเร็จ: ${result.queueNumber}`);
      setNewQueueVN("");
      await onRefresh();
    } catch (err) {
      const error = err as Error;
      alert(error.message || "เกิดข้อผิดพลาดในการสร้างคิว");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-white">
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        ...
      </div>

      {/* Main Grid - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

        {/* Left Column */}
        <div className="space-y-6">

          {/* Waiting Queue List */}
          <div
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
            style={{ borderWidth: "2px", borderColor: "#BEBEBE" }}
          >
            <div
              className="py-3 text-center"
              style={{ backgroundColor: "#FFAE3C" }}
            >
              <p className="text-white font-bold flex items-center justify-center gap-2">
                <Hourglass className="w-5 h-5" />
                คิวที่รออยู่
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {waitingQueues.map((queue) => (
                  <div
                    key={queue.queueId}
                    className="bg-white rounded-3xl px-4 sm:px-6 py-4 border-2 border-gray-200 hover:border-teal-300 transition-colors shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                      <div
                        className="text-3xl sm:text-4xl font-bold text-gray-800"
                        style={{ color: "#044C72" }}
                      >
                        {queue.queueNumber}
                      </div>

                      <div className="flex-1 sm:mx-6">
                        <p className="font-bold text-gray-800 text-lg">
                          {queue.patientName}
                        </p>
                        <p className="text-sm text-gray-500">
                          VN{queue.vn.split("-").pop()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Tel: {queue.phoneNumber}
                        </p>
                      </div>

                      {!currentCalledQueue && (
                        <button
                          onClick={() => handleCallQueue(queue)}
                          className="text-white w-full sm:w-auto px-6 py-3 rounded-full font-bold flex items-center justify-center shadow-md text-lg"
                          style={{ backgroundColor: "#87E74B" }}
                        >
                          <Bell className="w-5 h-5 mr-2" />
                          เรียก
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">

          {/* Current Queue Buttons */}
          {currentCalledQueue && (
            <>
              {currentCalledQueue.status === "called" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  ...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  ...
                </div>
              )}
            </>
          )}

          {/* Skipped Queues */}
          <div
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
            style={{ borderWidth: "2px", borderColor: "#BEBEBE" }}
          >
            <div
              className="py-3 text-center"
              style={{ backgroundColor: "#FF4C4C" }}
            >
              <p className="text-white font-bold flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5" />
                คิวที่ถูกข้าม
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {skippedQueues.map((queue) => (
                  <div
                    key={queue.queueId}
                    className="bg-white rounded-3xl px-4 sm:px-6 py-4 border-2 border-gray-200 hover:border-red-300 transition-colors shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                      <div
                        className="text-3xl sm:text-4xl font-bold"
                        style={{ color: "#044C72" }}
                      >
                        {queue.queueNumber}
                      </div>

                      <div className="flex-1 sm:mx-6">
                        <p className="font-bold text-gray-800 text-lg">
                          {queue.patientName}
                        </p>
                        <p className="text-sm text-gray-500">
                          VN{queue.vn.split("-").pop()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Tel: {queue.phoneNumber}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          handleRecallSkipped(queue.queueId)
                        }
                        className="text-white w-full sm:w-auto px-6 py-3 rounded-full font-bold flex items-center justify-center shadow-md text-lg"
                        style={{ backgroundColor: "#87E74B" }}
                      >
                        <Bell className="w-5 h-5 mr-2" />
                        คิวถัดไป
                      </button>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
);
}