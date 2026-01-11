import type { QueueData } from "../shared/types";
import QueueStatusCard from "./QueueStatusCard";
import QueueDetailsSection from "./QueueDetailsSection";

interface QueueDisplayProps {
  queueData: QueueData;
  onCheckAnother: () => void;
}

export default function QueueDisplay({
  queueData,
  onCheckAnother,
}: QueueDisplayProps) {
  const getQueueNumberBgColor = () => {
    switch (queueData.status) {
      case "called":
        return "bg-gradient-to-br from-green-500 to-green-600 animate-pulse";
      case "in_progress":
        return "bg-gradient-to-br from-blue-500 to-blue-600";
      case "completed":
        return "bg-gradient-to-br from-purple-500 to-purple-600";
      default:
        return "bg-gradient-to-br from-blue-500 to-blue-600";
    }
  };

  const getPatientNameTextColor = () => {
    return queueData.status === "in_progress" ||
      queueData.status === "completed"
      ? "text-white"
      : "text-blue-100";
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-block bg-blue-100 px-6 py-2 rounded-full mb-4">
          <span className="text-blue-600 font-semibold">
            {queueData.department}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">คิวของคุณ</h2>
        <p className="text-gray-600">VN: {queueData.vn.split("-").pop()}</p>
      </div>

      {/* Queue Number Card */}
      <div
        className={`${getQueueNumberBgColor()} rounded-2xl p-8 text-center mb-6`}
      >
        <p className="text-white text-lg mb-2">หมายเลขคิวของคุณ</p>
        <div className="text-8xl font-bold text-white mb-2">
          {queueData.queueNumber}
        </div>
        <p className={getPatientNameTextColor()}>{queueData.patientName}</p>
      </div>

      {/* Queue Details */}
      <QueueDetailsSection queueData={queueData} />

      {/* Status Card */}
      <QueueStatusCard queueData={queueData} />

      {/* Check Another Button */}
      <button
        onClick={onCheckAnother}
        className="w-full mt-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
      >
        ตรวจสอบคิวอื่น
      </button>
    </div>
  );
}
