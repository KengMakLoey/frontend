import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Users, UserCog, Hospital, QrCode, ArrowRight, CheckCircle, 
  Bell, Phone, SkipForward, CheckSquare, Clock, AlertCircle,
} from 'lucide-react';

// ==================== TYPE DEFINITIONS ====================
interface QueueData {
  queueNumber: string;
  vn: string;
  patientName: string;
  department: string;
  departmentLocation: string;
  status: 'waiting' | 'called' | 'in_progress' | 'completed' | 'skipped'; // เพิ่ม 'in_progress'
  currentQueue: string;
  yourPosition: number;
  estimatedTime: string;
  issuedTime: string;
  priorityScore: number;
  isSkipped: boolean;
}

interface StaffData {
  success: boolean;
  staffId: number;
  staffName: string;
  role: string;
  departmentId: number;
  departmentName: string;
}

interface StaffQueue {
  queueId: number;
  queueNumber: string;
  patientName: string;
  vn: string;
  status: 'waiting' | 'called' | 'in_progress' | 'completed' | 'skipped'; // เพิ่ม 'in_progress'
  issuedTime: string;
  isSkipped: boolean;
  priorityScore: number;
}
interface ApiResponse {
  success: boolean;
  message: string;
  queueNumber?: string;
  queueId?: number;
}

// ==================== CONSTANTS ====================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

// ==================== API FUNCTIONS ====================
const API = {
  async getQueueByVN(vn: string): Promise<QueueData | null> {
    const response = await fetch(`${API_URL}/api/queue/${vn}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch queue');
    }
    return response.json();
  },
  
  async staffLogin(username: string, password: string): Promise<StaffData | false> {
    const response = await fetch(`${API_URL}/api/staff/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.success ? data : false;
  },
  
  async getDepartmentQueues(departmentId: number): Promise<StaffQueue[]> {
    const response = await fetch(`${API_URL}/api/staff/queues/${departmentId}`);
    if (!response.ok) throw new Error('Failed to fetch queues');
    return response.json();
  },
  
  async callQueue(queueId: number, staffName: string): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/api/staff/queue/${queueId}/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffName }),
    });
    if (!response.ok) throw new Error('Failed to call queue');
    return response.json();
  },
  
  async skipQueue(queueId: number, staffName: string): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/api/staff/queue/${queueId}/skip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffName }),
    });
    if (!response.ok) throw new Error('Failed to skip queue');
    return response.json();
  },
  
  async completeQueue(queueId: number, staffName: string): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/api/staff/queue/${queueId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffName }),
    });
    if (!response.ok) throw new Error('Failed to complete queue');
    return response.json();
  },
  
  async recallSkippedQueue(queueId: number, staffName: string): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/api/staff/queue/${queueId}/recall`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffName }),
    });
    if (!response.ok) throw new Error('Failed to recall queue');
    return response.json();
  },
  
  async createQueue(vn: string, staffId: number): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/api/staff/queue/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vn, staffId }), // 👈 ส่งไปแค่ 2 ตัวนี้
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create queue');
    }
    return response.json();
  }
};

// ==================== WEBSOCKET HOOK ====================
function useQueueWebSocket(
  vn: string | undefined, 
  onUpdate: (data: QueueData) => void
): { isConnected: boolean } {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!vn) {
      setIsConnected(false);
      return;
    }

    let isMounted = true;

    const connect = () => {
      if (!isMounted) return;

      try {
        ws.current = new WebSocket(WS_URL);

        ws.current.onopen = () => {
          if (!isMounted || !ws.current) return;
          console.log('✅ WebSocket connected');
          setIsConnected(true);
          ws.current.send(JSON.stringify({ type: 'subscribe', vn }));
        };

        ws.current.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'queue_update') {
              onUpdate(message.data);
            } else if (message.type === 'subscribed') {
              console.log('✅ Subscribed to VN:', message.vn);
            }
          } catch (err) {
            console.error('WebSocket message parse error:', err);
          }
        };

        ws.current.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
        };

        ws.current.onclose = () => {
          if (!isMounted) return;
          console.log('🔌 WebSocket disconnected');
          setIsConnected(false);
          
          reconnectTimeout.current = setTimeout(() => {
            if (isMounted) {
              console.log('🔄 Attempting to reconnect...');
              connect();
            }
          }, 3000);
        };
      } catch (err) {
        console.error('WebSocket connection error:', err);
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [vn, onUpdate]);

  return { isConnected };
}

// ==================== LOADING SKELETON COMPONENT ====================
const QueueSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-300 rounded w-1/2 mb-4 mx-auto"></div>
    <div className="h-32 bg-gray-300 rounded mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-300 rounded"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6"></div>
      <div className="h-4 bg-gray-300 rounded w-4/6"></div>
    </div>
  </div>
);

// ==================== MAIN APP COMPONENT ====================
type ViewType = 'landing' | 'patient' | 'staff';

export default function App() {
  // State management
  const [view, setView] = useState<ViewType>('landing');
  const [vn, setVn] = useState('');
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [queueData, setQueueData] = useState<QueueData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [isStaffLoggedIn, setIsStaffLoggedIn] = useState(false);
  const [staffData, setStaffData] = useState<StaffData | null>(null);
  const [staffQueues, setStaffQueues] = useState<StaffQueue[]>([]);
  const [currentCalledQueue, setCurrentCalledQueue] = useState<StaffQueue | null>(null);
  const [showCreateQueue, setShowCreateQueue] = useState(false);
  const [newQueueVN, setNewQueueVN] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const hasPlayedSound = useRef(false);
  const notificationTimeout = useRef<NodeJS.Timeout | null>(null);

  // Memoized callback for WebSocket updates
  const handleQueueUpdate = useCallback((updatedData: QueueData) => {
    const oldStatus = queueData?.status;
    setQueueData(updatedData);

    if (updatedData.status === 'called' && oldStatus !== 'called' && !hasPlayedSound.current) {
      setNotification('🔔 ถึงคิวของคุณแล้ว! กรุณาเข้ารับบริการ');
      
      if (soundEnabled) {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('Audio play failed:', e));
      }
      
      hasPlayedSound.current = true;

      if (notificationTimeout.current) {
        clearTimeout(notificationTimeout.current);
      }
      notificationTimeout.current = setTimeout(() => {
        setNotification('');
      }, 10000);
    }
  }, [queueData?.status, soundEnabled]);

  // WebSocket connection
  const { isConnected: wsConnected } = useQueueWebSocket(queueData?.vn, handleQueueUpdate);

  // Fallback polling for patient
  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    if (queueData && view === 'patient' && !wsConnected) {
      const updateQueue = async () => {
        if (!isMounted) return;
        try {
          const updated = await API.getQueueByVN(queueData.vn);
          if (isMounted && updated) {
            if (updated.status === 'called' && queueData.status !== 'called' && !hasPlayedSound.current) {
              setNotification('🔔 ถึงคิวของคุณแล้ว! กรุณาเข้ารับบริการ');
              
              if (soundEnabled) {
                const audio = new Audio('/notification.mp3');
                audio.play().catch(e => console.log('Audio play failed:', e));
              }
              
              hasPlayedSound.current = true;

              if (notificationTimeout.current) {
                clearTimeout(notificationTimeout.current);
              }
              notificationTimeout.current = setTimeout(() => {
                if (isMounted) setNotification('');
              }, 10000);
            }
            setQueueData(updated);
          }
        } catch (err) {
          console.error('Error updating queue:', err);
        }
      };

      intervalId = setInterval(updateQueue, 5000);
    }

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
      if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
    };
  }, [queueData, view, wsConnected, soundEnabled]);

  // Staff queue polling
  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const loadQueues = async () => {
      if (!staffData?.departmentId) return;
      try {
        const queues = await API.getDepartmentQueues(staffData.departmentId);
        if (isMounted) {
          setStaffQueues(queues);
          const called = queues.find(q => q.status === 'called' || q.status === 'in_progress'); // เพิ่ม in_progress
          if (called) {
            setCurrentCalledQueue(called);
          } else if (currentCalledQueue && !queues.find(q => q.queueId === currentCalledQueue.queueId)) {
            setCurrentCalledQueue(null);
          }
        }
      } catch (err) {
        console.error('Error loading queues:', err);
      }
    };

    if (isStaffLoggedIn && view === 'staff' && staffData) {
      loadQueues();
      intervalId = setInterval(() => {
        if (isMounted) loadQueues();
      }, 10000);
    }

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [isStaffLoggedIn, view, staffData, currentCalledQueue]);

  // Event handlers
  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vn.trim()) {
      setError('กรุณากรอกเลข VN');
      return;
    }

    if (!/^VN\d+$/.test(vn)) {
      setError('รูปแบบ VN ไม่ถูกต้อง (ตัวอย่าง: VN202601080001)');
      return;
    }

    setLoading(true);
    setError('');
    hasPlayedSound.current = false;

    try {
      const data = await API.getQueueByVN(vn);
      if (data) {
        setQueueData(data);
      } else {
        setError('ไม่พบข้อมูลคิว กรุณาตรวจสอบเลข VN อีกครั้ง');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffUsername || !staffPassword) {
      setError('กรุณากรอกข้อมูลให้ครบ');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await API.staffLogin(staffUsername, staffPassword);
      if (result) {
        setIsStaffLoggedIn(true);
        setStaffData(result);
      } else {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const loadStaffQueues = async () => {
    if (!staffData?.departmentId) return;
    try {
      const queues = await API.getDepartmentQueues(staffData.departmentId);
      setStaffQueues(queues);
      const called = queues.find(q => q.status === 'called' || q.status === 'in_progress'); 
      if (called) {
        setCurrentCalledQueue(called);
      } else if (currentCalledQueue && !queues.find(q => q.queueId === currentCalledQueue.queueId)) {
        setCurrentCalledQueue(null);
      }
    } catch (err) {
      console.error('Error loading queues:', err);
    }
  };

  const handleCallQueue = async (queue: StaffQueue) => {
    try {
      await API.callQueue(queue.queueId, staffData?.staffName || 'staff');
      setCurrentCalledQueue(queue);
      await loadStaffQueues();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเรียกคิว');
    }
  };

  const handlePatientArrived = async (queueId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/staff/queue/${queueId}/arrived`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffName: staffData?.staffName || 'staff' }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      await loadStaffQueues();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการอัพเดทสถานะ');
    }
  };

  const handleSkipQueue = async (queueId: number) => {
    if (!confirm('คุณต้องการข้ามคิวนี้ใช่หรือไม่?\n\nคนไข้จะได้รับข้อความให้ไปรายงานตัวกับเจ้าหน้าที่')) return;
    try {
      await API.skipQueue(queueId, staffData?.staffName || 'staff');
      
      // ถ้าคิวที่ข้ามคือคิวปัจจุบัน ให้ clear ทันที
      if (currentCalledQueue?.queueId === queueId) {
        setCurrentCalledQueue(null);
      }
      
      await loadStaffQueues();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการข้ามคิว');
    }
  };

  const handleCompleteQueue = async (queueId: number) => {
    try {
      await API.completeQueue(queueId, staffData?.staffName || 'staff');
      setCurrentCalledQueue(null);
      await loadStaffQueues();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการทำรายการให้เสร็จสิ้น');
    }
  };

  const handleRecallSkipped = async (queueId: number) => {
    if (!confirm('ต้องการให้คนไข้เข้าคิวใหม่ใช่หรือไม่?\n\nคิวจะกลับมารอเป็นคิวถัดไปทันที')) return;
    try {
      await API.recallSkippedQueue(queueId, staffData?.staffName || 'staff');
      await loadStaffQueues();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเรียกคืนคิว');
    }
  };

  const handleCreateQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQueueVN.trim()) {
      alert('กรุณากรอกเลข VN');
      return;
    }

    if (!/^VN\d+$/.test(newQueueVN)) {
      alert('รูปแบบ VN ไม่ถูกต้อง (ตัวอย่าง: VN202601080001)');
      return;
    }

    if (!staffData) return;

    setLoading(true);
    try {
      const result = await API.createQueue(newQueueVN, staffData.staffId);
      alert(`สร้างคิวสำเร็จ: ${result.queueNumber}`);
      setNewQueueVN('');
      setShowCreateQueue(false);
      await loadStaffQueues();
    } catch (err) {
      const error = err as Error;
      alert(error.message || 'เกิดข้อผิดพลาดในการสร้างคิว');
    } finally {
      setLoading(false);
    }
  };

  // ==================== RENDER: LANDING PAGE ====================
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Hospital className="w-16 h-16 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">NakornpingQ</h1>
            <p className="text-gray-600">ระบบจัดการคิวโรงพยาบาลนครพิงค์</p>
          </div>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            <div 
              onClick={() => setView('patient')} 
              className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-400"
            >
              <div className="flex flex-col items-center text-center h-full">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <Users className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">สำหรับผู้ป่วย</h2>
                <p className="text-gray-600 mb-6">ตรวจสอบคิวของคุณด้วยเลข VN</p>
                <div className="mt-auto">
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center">
                    เข้าสู่ระบบผู้ป่วย
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </div>
            </div>
            <div 
              onClick={() => setView('staff')} 
              className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow border-2 border-transparent hover:border-green-400"
            >
              <div className="flex flex-col items-center text-center h-full">
                <div className="bg-green-100 p-4 rounded-full mb-4">
                  <UserCog className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">สำหรับเจ้าหน้าที่</h2>
                <p className="text-gray-600 mb-6">จัดการคิวผู้ป่วยในแผนก</p>
                <div className="mt-auto">
                  <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center">
                    เข้าสู่ระบบเจ้าหน้าที่
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Patient View
  if (view === 'patient') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="container mx-auto px-4 py-8">
          <button 
            onClick={() => {
              setView('landing');
              setVn('');
              setQueueData(null);
              setError('');
              setNotification('');
            }}
            className="text-blue-600 hover:text-blue-700 mb-6 flex items-center"
          >
            ← กลับหน้าหลัก
          </button>

          {notification && (
            <div className="max-w-2xl mx-auto mb-6 bg-green-500 text-white p-4 rounded-lg flex items-center animate-pulse">
              <Bell className="w-6 h-6 mr-3" />
              <span className="font-semibold text-lg">{notification}</span>
            </div>
          )}

          <div className="max-w-2xl mx-auto">
            {!queueData ? (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-center mb-6">
                  <QrCode className="w-16 h-16 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">ตรวจสอบคิวของคุณ</h2>
                <p className="text-center text-gray-600 mb-8">กรุณากรอกเลข VN (Visit Number) ของคุณ</p>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">หมายเลข VN</label>
                    <input
                      type="text"
                      value={vn}
                      onChange={(e) => setVn(e.target.value)}
                      placeholder="ตัวอย่าง: VN202601080001"
                      onKeyDown={(e) => e.key === 'Enter' && handlePatientSubmit(e)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                      disabled={loading}
                    />
                    <p className="text-sm text-gray-500 mt-2">*หมายเลข VN จะอยู่ในใบนัดหมายของคุณ</p>
                  </div>

                  <button
                    onClick={handlePatientSubmit}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg disabled:opacity-50"
                  >
                    {loading ? 'กำลังตรวจสอบ...' : 'ตรวจสอบคิว'}
                  </button>
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>คำแนะนำ:</strong> ถ้าคุณไม่มีหมายเลข VN กรุณาติดต่อเจ้าหน้าที่ที่จุดรับบัตร
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-6">
                  <div className="inline-block bg-blue-100 px-6 py-2 rounded-full mb-4">
                    <span className="text-blue-600 font-semibold">{queueData.department}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">คิวของคุณ</h2>
                  <p className="text-gray-600">VN: {queueData.vn}</p>
                </div>

                <div className={`${
                  queueData.status === 'called' 
                    ? 'bg-gradient-to-br from-green-500 to-green-600 animate-pulse' 
                    : queueData.status === 'in_progress'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                    : queueData.status === 'completed'
                    ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                    : 'bg-gradient-to-br from-blue-500 to-blue-600'
                } rounded-2xl p-8 text-center mb-6`}>
                  <p className="text-white text-lg mb-2">หมายเลขคิวของคุณ</p>
                  <div className="text-8xl font-bold text-white mb-2">{queueData.queueNumber}</div>
                  <p className={`${
                    queueData.status === 'in_progress' || queueData.status === 'completed' 
                      ? 'text-white' 
                      : 'text-blue-100'
                  }`}>{queueData.patientName}</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">สถานที่:</span>
                    <span className="font-semibold text-gray-800">{queueData.departmentLocation}</span>
                  </div>
                  
                  {(queueData.status !== 'called' && queueData.status !== 'completed' && queueData.status !== 'in_progress' && !queueData.isSkipped) && (
                    <>
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">คิวปัจจุบัน:</span>
                        <span className="font-bold text-xl text-blue-600">{queueData.currentQueue}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">อีก:</span>
                        <span className="font-bold text-xl text-orange-600">{queueData.yourPosition} คิว</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">เวลารอโดยประมาณ:</span>
                        <span className="font-bold text-gray-800">{queueData.estimatedTime}</span>
                      </div>
                    </>
                  )}
                  
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">เวลาที่ออกคิว:</span>
                    <span className="font-semibold text-gray-800">{queueData.issuedTime}</span>
                  </div>
                </div>

                {queueData.status === 'completed' ? (
                  <div className="text-center p-6 bg-purple-50 border-2 border-purple-500 rounded-lg mb-4">
                    <CheckCircle className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                    <p className="text-purple-700 font-bold text-xl mb-2">✅ รับบริการเสร็จสิ้น</p>
                    <p className="text-purple-600">ขอบคุณที่ใช้บริการ โรงพยาบาลนครพิงค์</p>
                  </div>
                ) : queueData.status === 'called' ? (
                  <div className="text-center p-6 bg-green-50 border-2 border-green-500 rounded-lg mb-4">
                    <Bell className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <p className="text-green-700 font-bold text-xl mb-2">🔔 ถึงคิวของคุณแล้ว!</p>
                    <p className="text-green-600">กรุณาเข้ารับบริการที่ {queueData.departmentLocation}</p>
                  </div>
                ) : queueData.status === 'in_progress' ? (
                  <div className="text-center p-6 bg-blue-50 border-2 border-blue-500 rounded-lg mb-4">
                    <Clock className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                    <p className="text-blue-700 font-bold text-xl mb-2">⏳ กำลังรับบริการ</p>
                    <p className="text-blue-600">กรุณารอสักครู่ กำลังดำเนินการ</p>
                  </div>
                ) : queueData.isSkipped ? (
                  <div className="text-center p-6 bg-orange-50 border-2 border-orange-500 rounded-lg mb-4">
                    <AlertCircle className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                    <p className="text-orange-700 font-bold text-xl mb-2">⚠️ คิวของคุณถูกข้าม</p>
                    <p className="text-orange-600 mb-3">กรุณาติดต่อเจ้าหน้าที่ที่ {queueData.departmentLocation}</p>
                    <p className="text-sm text-orange-500">เพื่อรายงานตัวและรับบริการ</p>
                  </div>
                ) : (
                  <div className="text-center p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-blue-700 font-semibold">กรุณารอเรียกคิว - ระบบจะแจ้งเตือนเมื่อถึงคิวของคุณ</p>
                  </div>
                )}

                <button
                  onClick={() => {
                    setQueueData(null);
                    setVn('');
                  }}
                  className="w-full mt-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  ตรวจสอบคิวอื่น
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Staff View
  if (view === 'staff') {
    if (!isStaffLoggedIn) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
          <div className="container mx-auto px-4 py-8">
            <button 
              onClick={() => {
                setView('landing');
                setStaffUsername('');
                setStaffPassword('');
                setError('');
              }}
              className="text-green-600 hover:text-green-700 mb-6 flex items-center"
            >
              ← กลับหน้าหลัก
            </button>

            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-center mb-6">
                  <div className="bg-green-100 p-4 rounded-full">
                    <UserCog className="w-12 h-12 text-green-600" />
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">เข้าสู่ระบบเจ้าหน้าที่</h2>
                <p className="text-center text-gray-600 mb-8">กรุณาเข้าสู่ระบบเพื่อจัดการคิว</p>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">ชื่อผู้ใช้</label>
                    <input
                      type="text"
                      value={staffUsername}
                      onChange={(e) => setStaffUsername(e.target.value)}
                      placeholder="Username"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">รหัสผ่าน</label>
                    <input
                      type="password"
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      placeholder="Password"
                      onKeyDown={(e) => e.key === 'Enter' && handleStaffLogin(e)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                      disabled={loading}
                    />
                  </div>

                  <button
                    onClick={handleStaffLogin}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                  </button>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Demo:</strong> Username: <code>staff</code> / Password: <code>staff123</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Staff Dashboard
    const waitingQueues = staffQueues.filter(q => q.status === 'waiting' && !q.isSkipped);
    const skippedQueues = staffQueues.filter(q => q.isSkipped);
    const nextQueue = waitingQueues[0];

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600">แผนก: {staffData?.departmentName || 'แผนก'}</p>
            </div>
            <button 
              onClick={() => {
                setIsStaffLoggedIn(false);
                setStaffData(null);
                setView('landing');
                setStaffUsername('');
                setStaffPassword('');
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              ออกจากระบบ
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">คิวปัจจุบัน</h2>
                
                {currentCalledQueue ? (
                  <div>
                    <div className={`${
                      currentCalledQueue.status === 'in_progress' 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                        : 'bg-gradient-to-br from-green-500 to-green-600'
                    } rounded-xl p-8 text-center mb-6`}>
                      <p className="text-white text-lg mb-2">
                        {currentCalledQueue.status === 'in_progress' ? 'กำลังรับบริการ' : 'เรียกแล้ว - รอคนไข้'}
                      </p>
                      <div className="text-7xl font-bold text-white mb-2">{currentCalledQueue.queueNumber}</div>
                      <p className={`${currentCalledQueue.status === 'in_progress' ? 'text-blue-100' : 'text-green-100'} text-lg`}>
                        {currentCalledQueue.patientName}
                      </p>
                      <p className={`${currentCalledQueue.status === 'in_progress' ? 'text-blue-200' : 'text-green-200'} text-sm mt-2`}>
                        VN: {currentCalledQueue.vn}
                      </p>
                    </div>

                    {currentCalledQueue.status === 'called' ? (
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <button
                          onClick={() => handlePatientArrived(currentCalledQueue.queueId)}
                          className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center"
                        >
                          <CheckSquare className="w-5 h-5 mr-2" />
                          คนไข้มาแล้ว
                        </button>
                        <button
                          onClick={() => handleSkipQueue(currentCalledQueue.queueId)}
                          className="bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 flex items-center justify-center"
                        >
                          <SkipForward className="w-5 h-5 mr-2" />
                          ข้ามคิว
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <button
                          onClick={() => handleCompleteQueue(currentCalledQueue.queueId)}
                          className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 flex items-center justify-center"
                        >
                          <CheckSquare className="w-5 h-5 mr-2" />
                          เสร็จสิ้น
                        </button>
                        {nextQueue && (
                          <button
                            onClick={async () => {
                              await handleCompleteQueue(currentCalledQueue.queueId);
                              setTimeout(() => handleCallQueue(nextQueue), 500);
                            }}
                            className="bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 flex items-center justify-center"
                          >
                            <Bell className="w-5 h-5 mr-2" />
                            เสร็จ & เรียกถัดไป
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-6">ไม่มีคิวที่กำลังรับบริการ</p>
                    {nextQueue && (
                      <button
                        onClick={() => handleCallQueue(nextQueue)}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-semibold flex items-center mx-auto"
                      >
                        <Bell className="w-5 h-5 mr-2" />
                        เรียกคิวถัดไป ({nextQueue.queueNumber})
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">คิวที่รอ ({waitingQueues.length})</h2>
                  <button
                    onClick={() => setShowCreateQueue(!showCreateQueue)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                  >
                    + สร้างคิวใหม่
                  </button>
                </div>

                {showCreateQueue && (
                  <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold mb-2">สร้างคิวใหม่</h3>
                    <form onSubmit={handleCreateQueue} className="flex gap-2">
                      <input
                        type="text"
                        value={newQueueVN}
                        onChange={(e) => setNewQueueVN(e.target.value)}
                        placeholder="กรอกเลข VN"
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                        disabled={loading}
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {loading ? 'กำลังสร้าง...' : 'สร้าง'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateQueue(false);
                          setNewQueueVN('');
                        }}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                      >
                        ยกเลิก
                      </button>
                    </form>
                  </div>
                )}

                {waitingQueues.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">ไม่มีคิวที่รออยู่</div>
                ) : (
                  <div className="space-y-3">
                    {waitingQueues.map((queue, index) => (
                      <div
                        key={queue.queueId}
                        className={`p-4 rounded-lg border-2 ${
                          index === 0 ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-4">
                            <div className={`text-2xl font-bold ${index === 0 ? 'text-green-600' : 'text-gray-700'}`}>
                              {queue.queueNumber}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{queue.patientName}</p>
                              <p className="text-sm text-gray-500">VN: {queue.vn} | ออกคิว: {queue.issuedTime}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {index === 0 && !currentCalledQueue && (
                              <button
                                onClick={() => handleCallQueue(queue)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                              >
                                <Bell className="w-4 h-4 mr-1" />
                                เรียก
                              </button>
                            )}
                            <button
                              onClick={() => handleSkipQueue(queue.queueId)}
                              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                            >
                              ข้าม
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">สถิติวันนี้</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">รอทั้งหมด:</span>
                    <span className="text-2xl font-bold text-blue-600">{waitingQueues.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ข้ามคิว:</span>
                    <span className="text-2xl font-bold text-orange-600">{skippedQueues.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">รับบริการแล้ว:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {staffQueues.filter(q => q.status === 'completed').length}
                    </span>
                  </div>
                </div>
              </div>

              {skippedQueues.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
                    คิวที่ข้าม ({skippedQueues.length})
                  </h3>
                  <div className="space-y-3">
                    {skippedQueues.map((queue) => (
                      <div key={queue.queueId} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-orange-700">{queue.queueNumber}</p>
                            <p className="text-sm text-gray-700">{queue.patientName}</p>
                            <p className="text-xs text-gray-500">{queue.vn}</p>
                          </div>
                        </div>
                       <button
                          onClick={() => handleRecallSkipped(queue.queueId)}
                          className="w-full bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 text-sm flex items-center justify-center"
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          เรียกเป็นคิวถัดไป
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">ดำเนินการ</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => loadStaffQueues()}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    รีเฟรชคิว
                  </button>
                  <button
                    onClick={() => setShowCreateQueue(true)}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                  >
                    สร้างคิวใหม่
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}