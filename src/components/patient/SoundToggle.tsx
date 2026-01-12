import { Volume2, VolumeX } from "lucide-react";

interface SoundToggleProps {
  soundEnabled: boolean;
  onToggle: () => void;
}

export default function SoundToggle({
  soundEnabled,
  onToggle,
}: SoundToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        soundEnabled
          ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {soundEnabled ? (
        <>
          <Volume2 className="w-5 h-5" />
          <span>เสียงเปิดอยู่</span>
        </>
      ) : (
        <>
          <VolumeX className="w-5 h-5" />
          <span>เสียงปิดอยู่</span>
        </>
      )}
    </button>
  );
}
