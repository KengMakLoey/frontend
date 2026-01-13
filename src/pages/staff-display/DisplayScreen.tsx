import { useState, useEffect } from "react";
import { Clock, Maximize2, Minimize2, Monitor } from "lucide-react";
import { API } from "../../components/shared/api";
import type { StaffQueue } from "../../components/shared/types";

interface DisplayScreenProps {
  departmentId: number;
  departmentInfo: { name: string; label: string };
  onExit: () => void;
}

export default function DisplayScreen({
  departmentId,
  departmentInfo,
  onExit,
}: DisplayScreenProps) {
  const [queues, setQueues] = useState<StaffQueue[]>([]);
  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 1. Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch Data (Polling ทุก 3 วินาที)
  useEffect(() => {
    const fetchQueues = async () => {
      try {
        const data = await API.getDepartmentQueues(departmentId);
        setQueues(data);
      } catch (err) {
        console.error("Failed to fetch queues for display", err);
      }
    };

    fetchQueues();
    const interval = setInterval(fetchQueues, 3000);
    return () => clearInterval(interval);
  }, [departmentId]);

  // Logic กรองข้อมูล: แสดงเฉพาะสถานะ called และ in_progress
  const activeQueues = queues
    .filter((q) => ["called", "in_progress"].includes(q.status))
    .sort((a, b) => {
      return (
        new Date(b.issuedTime).getTime() - new Date(a.issuedTime).getTime()
      );
    });

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[100] overflow-hidden flex font-sans text-[#333]">
      {/* --- Sidebar (Left 25%) --- */}
      <div className="w-[28%] bg-gradient-to-b from-[#eef2f5] to-white relative flex flex-col border-r-4 border-white shadow-xl z-10">
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: `url('/bg.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="relative z-10 p-8 flex flex-col h-full items-center text-center">
          <img
            src="/logo.png"
            alt="logo"
            className="w-32 h-auto mb-6 drop-shadow-md"
          />

          <h1 className="text-[#005691] font-bold text-3xl leading-tight">
            โรงพยาบาลนครพิงค์
          </h1>
          <p className="text-[#005691] text-lg font-light mb-12">
            Nakornping Hospital
          </p>

          <div className="w-full bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border-2 border-white">
            <h2 className="text-4xl font-bold text-[#044C72] mb-2">
              {departmentInfo.name}
            </h2>
            <p className="text-xl text-gray-500 font-medium uppercase tracking-wide">
              {departmentInfo.label}
            </p>
          </div>

          <div className="mt-auto mb-4 opacity-50 text-xs">
            <div className="flex gap-4 justify-center hover:opacity-100 transition-opacity">
              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-1 hover:text-blue-600"
              >
                {isFullscreen ? (
                  <Minimize2 size={16} />
                ) : (
                  <Maximize2 size={16} />
                )}
                {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </button>
              <button
                onClick={onExit}
                className="flex items-center gap-1 hover:text-red-600"
              >
                Quit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content (Right 75%) --- */}
      <div className="flex-1 bg-[#dbe4eb] flex flex-col relative">
        {/* Header Bar */}
        <div className="bg-[#0e4b75] text-white p-4 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-4 px-4">
            <Clock className="w-8 h-8 text-[#87E74B]" />
            <div className="text-2xl font-bold">
              {time.toLocaleDateString("th-TH", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
          <div className="text-3xl font-bold font-mono px-4 tracking-wider">
            {time.toLocaleTimeString("th-TH", { hour12: false })}
          </div>
        </div>

        {/* Table Header */}
        <div className="flex text-white text-3xl font-bold text-center uppercase tracking-wide">
          <div className="flex-1 bg-[#2b6cb0] py-4 border-r border-white/20">
            คิว (Ticket)
          </div>
          <div className="w-1/3 bg-[#2b6cb0] py-4">ช่อง (Counter)</div>
        </div>

        {/* Queue List */}
        <div className="flex-1 p-4 space-y-4 overflow-hidden flex flex-col">
          {activeQueues.length === 0 ? (
            <div className="flex-1 flex items-center justify-center flex-col text-gray-400">
              <Monitor className="w-32 h-32 mb-4 opacity-20" />
              <p className="text-2xl">ยังไม่มีคิวที่เรียกในขณะนี้</p>
            </div>
          ) : (
            activeQueues.slice(0, 5).map((q, index) => {
              const isFirst = index === 0;
              return (
                <div
                  key={q.queueId}
                  className={`
                                flex items-stretch rounded-2xl shadow-lg overflow-hidden border-2 border-white transform transition-all duration-500
                                ${
                                  isFirst
                                    ? "bg-[#48c774] scale-[1.02] z-10 animate-in fade-in slide-in-from-bottom-4"
                                    : "bg-[#4299e1] opacity-90"
                                }
                            `}
                  style={{ height: "calc(20% - 1rem)" }}
                >
                  <div className="flex-1 flex items-center px-8 gap-8">
                    <div className="bg-white/20 rounded-full p-4 backdrop-blur-sm">
                      <img
                        src={isFirst ? "/staff.icon.svg" : "/patient.icon.svg"}
                        className="w-16 h-16 invert brightness-0"
                        alt="icon"
                      />
                    </div>
                    <div className="text-white">
                      <span className="text-8xl font-bold tracking-tighter drop-shadow-md">
                        {q.queueNumber}
                      </span>
                    </div>
                  </div>

                  <div className="w-1/3 border-l border-white/20 bg-black/5 flex items-center justify-center">
                    <span className="text-8xl font-bold text-white drop-shadow-md">
                      {(q.queueId % 10) + 1}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Marquee Footer */}
        <div className="bg-white py-2 overflow-hidden border-t border-gray-200">
          <div className="whitespace-nowrap animate-marquee text-xl text-[#044C72]">
            ยินดีต้อนรับสู่โรงพยาบาลนครพิงค์ •
            กรุณาเตรียมบัตรประชาชนเพื่อความสะดวกรวดเร็ว • หากเรียกข้ามคิว
            กรุณาติดต่อเจ้าหน้าที่ช่อง 1
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
        }
        .animate-marquee {
            display: inline-block;
            animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
