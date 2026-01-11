import QueueCheckForm from "./QueueCheckForm";
import QueueDisplay from "./QueueDisplay";
import NotificationBanner from "./NotificationBanner";
import SoundToggle from "./SoundToggle";
import { useQueueChecker } from "../hooks/useQueueChecker";
import { useQueueNotification } from "../hooks/useQueueNotification";

interface PatientViewProps {
  onBack: () => void;
}

export default function PatientView({ onBack }: PatientViewProps) {
  const { vn, setVn, queueData, loading, error, handleSubmit, resetQueue } =
    useQueueChecker();

  const { notification, soundEnabled, setSoundEnabled } =
    useQueueNotification(queueData);

  const handleBack = () => {
    resetQueue();
    onBack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={handleBack}
          className="text-blue-600 hover:text-blue-700 mb-6 flex items-center"
        >
          ← กลับหน้าหลัก
        </button>

        {queueData && (
          <div className="max-w-2xl mx-auto mb-4">
            <SoundToggle
              soundEnabled={soundEnabled}
              onToggle={() => setSoundEnabled(!soundEnabled)}
            />
          </div>
        )}

        <NotificationBanner notification={notification} />

        <div className="max-w-2xl mx-auto">
          {!queueData ? (
            <QueueCheckForm
              vn={vn}
              setVn={setVn}
              loading={loading}
              error={error}
              onSubmit={handleSubmit}
            />
          ) : (
            <QueueDisplay queueData={queueData} onCheckAnother={resetQueue} />
          )}
        </div>
      </div>
    </div>
  );
}
