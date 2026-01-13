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
  const [showCreateQueue, setShowCreateQueue] = useState(false);
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
      setShowCreateQueue(false);
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onBack}
            className="bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center shadow"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            กลับ
          </button>

          <div className="flex items-center gap-2">
            <svg
              className="w-8 h-8 text-teal-600"
              fill="#044C72"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            <h1 className="text-3xl font-bold text-gray-800">จัดการคิว</h1>
          </div>

          <button
            onClick={onRefresh}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold shadow"
          >
            รีเฟรช
          </button>
        </div>

        {/* Main Grid - 2 Columns */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Create Queue & Waiting List */}
          <div className="space-y-6">
            {/* Create Queue */}
            <div
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
              style={{ borderWidth: "2px", borderColor: "#BEBEBE" }}
            >
              <div className="bg-teal-500 py-3 text-center">
                <p className="text-white font-bold">สร้างคิวใหม่</p>
              </div>
              <div className="p-6">
                <form onSubmit={handleCreateQueue} className="space-y-3">
                  <div>
                    <label
                      className="block text-sm font-lg text-gray-700 mb-2"
                      style={{ color: "#044C72" }}
                    >
                      Visit Number (หมายเลขการมาใช้บริการ)
                    </label>
                    <input
                      type="text"
                      value={newQueueVN}
                      onChange={(e) =>
                        setNewQueueVN(e.target.value.toUpperCase())
                      }
                      placeholder="ตัวอย่าง: VN0001 หรือ 0001"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white px-6 py-3 rounded-lg hover:from-green-500 hover:to-green-600 font-bold disabled:opacity-50 flex items-center justify-center"
                  >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    {loading ? "กำลังสร้าง..." : "สร้าง"}
                  </button>
                </form>
              </div>
            </div>

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
                  {waitingQueues.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      ไม่มีคิวที่รออยู่
                    </div>
                  ) : (
                    waitingQueues.map((queue, index) => (
                      <div
                        key={queue.queueId}
                        className="bg-white rounded-3xl px-6 py-4 border-2 border-gray-200 hover:border-teal-300 transition-colors shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className="text-4xl font-bold text-gray-800"
                            style={{ color: "#044C72" }}
                          >
                            {queue.queueNumber}
                          </div>

                          <div className="flex-1 mx-6">
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
                              className="text-white px-8 py-3 rounded-full hover:from-green-500 hover:to-green-600 font-bold flex items-center shadow-md text-lg"
                              style={{ backgroundColor: "#87E74B" }}
                            >
                              <Bell className="w-5 h-5 mr-2" />
                              เรียก
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Current Queue & Skipped Queues */}
          <div className="space-y-6">
            {/* Current Queue */}
            <div
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
              style={{ borderWidth: "2px", borderColor: "#BEBEBE" }}
            >
              <div className="bg-teal-500 py-3 text-center">
                <p className="text-white font-bold">คิวปัจจุบัน</p>
              </div>
              <div className="p-6">
                {currentCalledQueue ? (
                  <div>
                    <div className="text-center mb-4">
                      <p className="text-gray-700 mb-1">
                        <span
                          className="font-semibold"
                          style={{ color: "#044C72" }}
                        >
                          สถานะ:
                        </span>{" "}
                        <span
                          className="font-medium"
                          style={{ color: "#044C72" }}
                        >
                          {currentCalledQueue.status === "in_progress"
                            ? "กำลังรับบริการ"
                            : "เรียกแล้ว"}
                        </span>
                      </p>
                      <div
                        className="text-7xl font-bold mb-3"
                        style={{ color: "#044C72" }}
                      >
                        {currentCalledQueue.queueNumber}
                      </div>
                      <p className="font-semibold text-gray-800 text-lg">
                        {currentCalledQueue.patientName}
                      </p>
                      <p className="text-sm text-gray-500">
                        VN{currentCalledQueue.vn.split("-").pop()}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center justify-center">
                        Tel: {currentCalledQueue.phoneNumber}
                      </p>
                    </div>

                    {currentCalledQueue.status === "called" ? (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() =>
                            handlePatientArrived(currentCalledQueue.queueId)
                          }
                          className="bg-gradient-to-r from-green-400 to-green-500 text-white px-6 py-3 rounded-lg hover:from-green-500 hover:to-green-600 font-bold flex items-center justify-center"
                        >
                          <CheckSquare className="w-5 h-5 mr-2" />
                          มาแล้ว
                        </button>
                        <button
                          onClick={() =>
                            handleSkipQueue(currentCalledQueue.queueId)
                          }
                          className="text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center"
                          style={{ backgroundColor: "#FF4C4C" }}
                        >
                          <X className="w-5 h-5 mr-2" />
                          ข้ามคิว
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() =>
                            handleCompleteQueue(currentCalledQueue.queueId)
                          }
                          className="text-white px-4 py-3 rounded-lg hover:bg-green-600 flex items-center justify-center font-semibold"
                          style={{ backgroundColor: "#87E74B" }}
                        >
                          <CheckSquare className="w-5 h-5 mr-2" />
                          เสร็จสิ้น
                        </button>
                        {nextQueue && (
                          <button
                            onClick={async () => {
                              await handleCompleteQueue(
                                currentCalledQueue.queueId
                              );
                              setTimeout(() => handleCallQueue(nextQueue), 500);
                            }}
                            className="text-white px-4 py-3 rounded-lg hover:bg-orange-200 flex items-center justify-center font-semibold"
                            style={{ backgroundColor: "#FFAE3C" }}
                          >
                            <Bell className="w-5 h-5 mr-2" />
                            เสร็จ & เรียกคิวถัดไป
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-6">
                      ไม่คิวในขณะนี้ กรุณาเพิ่มคิวปัจจุบัน
                    </p>
                    {nextQueue && (
                      <button
                        onClick={() => handleCallQueue(nextQueue)}
                        className="text-white px-8 py-3 rounded-lg hover:from-green-500 hover:to-green-600 font-bold flex items-center mx-auto"
                        style={{ backgroundColor: "#87E74B" }}
                      >
                        <Bell className="w-5 h-5 mr-2" />
                        เรียกคิวถัดไป ({nextQueue.queueNumber})
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

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
                  {skippedQueues.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      ไม่มีคิวที่ถูกข้าม
                    </div>
                  ) : (
                    skippedQueues.map((queue) => (
                      <div
                        key={queue.queueId}
                        className="bg-white rounded-3xl px-6 py-4 border-2 border-gray-200 hover:border-red-300 transition-colors shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className="text-4xl font-bold"
                            style={{ color: "#044C72" }}
                          >
                            {queue.queueNumber}
                          </div>

                          <div className="flex-1 mx-6">
                            <p className="font-bold text-gray-800 text-lg">
                              {queue.patientName}
                            </p>
                            <p className="text-sm text-gray-500">
                              VN{queue.vn.split("-").pop()}
                            </p>
                            <p className="text-sm text-gray-500">
                              Tel: {queue.phoneNumber}
                            </p>
                            {queue.skippedTime && (
                              <p className="text-xs text-gray-400 mt-1">
                                ข้ามเมื่อ:{" "}
                                {(() => {
                                  const date = new Date(queue.skippedTime);
                                  date.setHours(date.getHours() + 7);
                                  return date.toLocaleTimeString("th-TH", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  });
                                })()}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => handleRecallSkipped(queue.queueId)}
                            className="text-white px-8 py-3 rounded-full hover:from-green-500 hover:to-green-600 font-bold flex items-center shadow-md text-lg"
                            style={{ backgroundColor: "#87E74B" }}
                          >
                            <Bell className="w-5 h-5 mr-2" />
                            คิวถัดไป
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                  {/* Skip Confirmation Modal */}
                  {showSkipConfirm && queueToSkip && (
                    <div
                      className="fixed inset-0 flex items-center justify-center z-50"
                      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
                      onClick={() => {
                        setShowSkipConfirm(false);
                        setQueueToSkip(null);
                      }}
                    >
                      <div
                        className="bg-white rounded-3xl p-8 mx-4 shadow-2xl"
                        style={{ width: "520px", maxWidth: "70vw" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-start gap-4 mb-8 relative">
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: "#FF4C4C" }}
                          >
                            <AlertCircle className="w-10 h-10 text-white" />
                          </div>
                          <div className="flex-1">
                            <button
                              onClick={() => {
                                setShowSkipConfirm(false);
                                setQueueToSkip(null);
                              }}
                              className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2 pr-8">
                              ข้ามคิว
                            </h3>
                            <p className="text-gray-600 text-base leading-relaxed">
                              ไม่พบผู้รับบริการตามเลขคิว
                              <br />
                              ต้องการข้ามคิวหรือไม่?
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 w-full">
                          <button
                            onClick={confirmSkipQueue}
                            className="px-6 py-3 text-white rounded-xl font-bold text-base shadow-lg hover:opacity-90"
                            style={{ backgroundColor: "#939393" }}
                          >
                            ยืนยัน
                          </button>
                          <button
                            onClick={() => {
                              setShowSkipConfirm(false);
                              setQueueToSkip(null);
                            }}
                            className="px-6 py-3 bg-transparent border-2 border-gray-400 text-gray-500 rounded-xl hover:bg-gray-50 font-bold text-base"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
