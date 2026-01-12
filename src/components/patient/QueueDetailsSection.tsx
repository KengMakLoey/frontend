import type { QueueData } from "../shared/types";

interface QueueDetailsSectionProps {
  queueData: QueueData;
}

export default function QueueDetailsSection({
  queueData,
}: QueueDetailsSectionProps) {
  const showWaitingDetails =
    queueData.status !== "called" &&
    queueData.status !== "completed" &&
    queueData.status !== "in_progress" &&
    !queueData.isSkipped;

  return (
    <div className="space-y-4 mb-6">
      <DetailRow label="สถานที่" value={queueData.departmentLocation} />

      {showWaitingDetails && (
        <>
          <DetailRow
            label="คิวปัจจุบัน"
            value={queueData.currentQueue}
            valueClassName="font-bold text-xl text-blue-600"
          />
          <DetailRow
            label="อีก"
            value={`${queueData.yourPosition} คิว`}
            valueClassName="font-bold text-xl text-orange-600"
          />
          <DetailRow
            label="เวลารอโดยประมาณ"
            value={queueData.estimatedTime}
            valueClassName="font-bold text-gray-800"
          />
        </>
      )}

      <DetailRow
        label="เวลาที่ออกคิว"
        value={queueData.issuedTime}
        valueClassName="font-semibold text-gray-800"
      />
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  valueClassName?: string;
}

function DetailRow({
  label,
  value,
  valueClassName = "font-semibold text-gray-800",
}: DetailRowProps) {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
      <span className="text-gray-600">{label}:</span>
      <span className={valueClassName}>{value}</span>
    </div>
  );
}
