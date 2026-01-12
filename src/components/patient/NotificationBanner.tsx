import { Bell } from "lucide-react";

interface NotificationBannerProps {
  notification: string;
}

export default function NotificationBanner({
  notification,
}: NotificationBannerProps) {
  if (!notification) return null;

  return (
    <>
      <style>{`
        @keyframes shake-long {
          0%, 100% { transform: translateX(0); }
          5%, 15%, 25%, 35%, 45%, 55%, 65%, 75%, 85%, 95% { 
            transform: translateX(-8px) rotate(-2deg); 
          }
          10%, 20%, 30%, 40%, 50%, 60%, 70%, 80%, 90% { 
            transform: translateX(8px) rotate(2deg); 
          }
        }

        @keyframes pulse-intense {
          0%, 100% { 
            opacity: 1;
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          }
          50% { 
            opacity: 0.9;
            transform: scale(1.03);
            box-shadow: 0 0 20px 10px rgba(34, 197, 94, 0);
          }
        }

        .animate-shake-long {
          animation: shake-long 3s ease-in-out;
        }

        .animate-pulse-intense {
          animation: pulse-intense 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-2xl mx-auto mb-6 bg-green-500 text-white p-5 rounded-xl flex items-center shadow-2xl animate-pulse-intense">
        <Bell className="w-8 h-8 mr-3 flex-shrink-0 animate-shake-long" />
        <span className="font-bold text-xl">{notification}</span>
      </div>
    </>
  );
}
