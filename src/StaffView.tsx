import { useState, useEffect } from 'react';
import { 
  Bell, AlertCircle, Phone, ClipboardList, BarChart3, User, Briefcase, Building2, Clock
} from 'lucide-react';
import type { StaffData, StaffQueue } from './shared/types';
import { API } from './shared/api';
import StaffAuth from './StaffAuth';
import QueueManagement from './StaffQueueManagement';

interface StaffViewProps {
  onBack: () => void;
}

export default function StaffView({ onBack }: StaffViewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isStaffLoggedIn, setIsStaffLoggedIn] = useState(false);
  const [staffData, setStaffData] = useState<StaffData | null>(null);
  const [staffQueues, setStaffQueues] = useState<StaffQueue[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'queue'>('dashboard');

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const loadQueues = async () => {
      if (!staffData?.departmentId) return;
      try {
        const queues = await API.getDepartmentQueues(staffData.departmentId);
        if (isMounted) {
          setStaffQueues(queues);
        }
      } catch (err) {
        console.error('Error loading queues:', err);
      }
    };

    if (isStaffLoggedIn && staffData) {
      loadQueues();
      intervalId = setInterval(() => {
        if (isMounted) loadQueues();
      }, 10000);
    }

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [isStaffLoggedIn, staffData]);

  const handleStaffLogin = async (username: string, password: string) => {
    if (!username || !password) {
      setError('กรุณากรอกข้อมูลให้ครบ');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await API.staffLogin(username, password);
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
    } catch (err) {
      console.error('Error loading queues:', err);
    }
  };

  if (!isStaffLoggedIn) {
    return (
      <StaffAuth
        onLogin={handleStaffLogin}
        onBack={onBack}
        loading={loading}
        error={error}
      />
    );
  }

  if (currentView === 'queue') {
    return (
      <QueueManagement
        staffData={staffData}
        staffQueues={staffQueues}
        onBack={() => setCurrentView('dashboard')}
        onRefresh={loadStaffQueues}
      />
    );
  }

  const waitingQueues = staffQueues.filter(q => q.status === 'waiting' && !q.isSkipped);
  const skippedQueues = staffQueues.filter(q => q.isSkipped);
  const completedQueues = staffQueues.filter(q => q.status === 'completed');
  const currentQueue = staffQueues.find(q => q.status === 'called' || q.status === 'in_progress');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        </div>
        <button 
          onClick={() => {
            setIsStaffLoggedIn(false);
            setStaffData(null);
            onBack();
          }}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          ออกจากระบบ
        </button>
      </div>
      {/* User Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{staffData?.staffName}</h2>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end text-gray-600 mb-2">
                <Briefcase className="w-4 h-4 mr-2" />
                <span className="font-semibold">
                  {staffData?.role === 'doctor' ? 'แพทย์' : 
                  staffData?.role === 'nurse' ? 'พยาบาล' : 
                  staffData?.role === 'staff' ? 'เจ้าหน้าที่' : 'พนักงาน'}
                </span>
              </div>
              <div className="flex items-center justify-end text-gray-600 mb-2">
                <Building2 className="w-4 h-4 mr-2" />
                <span>{staffData?.departmentName}</span>
              </div>
              <div className="flex items-center justify-end text-gray-500 text-sm">
                <Clock className="w-4 h-4 mr-2" />
                <span>เข้าสู่ระบบล่าสุด: {new Date().toLocaleDateString('th-TH', { 
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} {new Date().toLocaleTimeString('th-TH', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">คิวที่รอ</h3>
              <Bell className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-4xl font-bold text-blue-600 mb-2">{waitingQueues.length}</div>
            <p className="text-sm text-gray-500">คิวที่รออยู่ในระบบ</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">ข้ามคิว</h3>
              <AlertCircle className="w-6 h-6 text-orange-500" />
            </div>
            <div className="text-4xl font-bold text-orange-600 mb-2">{skippedQueues.length}</div>
            <p className="text-sm text-gray-500">คิวที่ถูกข้ามไป</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">เสร็จสิ้น</h3>
              <BarChart3 className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-4xl font-bold text-green-600 mb-2">{completedQueues.length}</div>
            <p className="text-sm text-gray-500">รับบริการเสร็จแล้ว</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">คิวปัจจุบัน</h2>
              <div className="flex items-center text-gray-500 text-sm">
                <Clock className="w-4 h-4 mr-1" />
                <span>อัปเดตล่าสุด: {new Date().toLocaleTimeString('th-TH', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                })}</span>
              </div>
            </div>
            
            {currentQueue ? (
              <div className={`${
                currentQueue.status === 'in_progress' 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                  : 'bg-gradient-to-br from-green-500 to-green-600'
              } rounded-xl p-8 text-center`}>
                <p className="text-white text-lg mb-2">
                  {currentQueue.status === 'in_progress' ? 'กำลังรับบริการ' : 'เรียกแล้ว - รอคนไข้'}
                </p>
                <div className="text-7xl font-bold text-white mb-2">{currentQueue.queueNumber}</div>
                <p className={`${currentQueue.status === 'in_progress' ? 'text-blue-100' : 'text-green-100'} text-lg`}>
                  {currentQueue.patientName}
                </p>
                <p className={`${currentQueue.status === 'in_progress' ? 'text-blue-200' : 'text-green-200'} text-sm mt-2`}>
                  VN: {currentQueue.vn.split('-').pop()}
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">ไม่มีคิวที่กำลังรับบริการ</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">คิวถัดไป</h3>
              {waitingQueues[0] ? (
                <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">{waitingQueues[0].queueNumber}</div>
                  <p className="font-semibold text-gray-800">{waitingQueues[0].patientName}</p>
                  <p className="text-sm text-gray-500">VN: {waitingQueues[0].vn}</p>
                  <p className="text-xs text-blue-600 flex items-center mt-2">
                    <Phone className="w-3 h-3 mr-1" />
                    {waitingQueues[0].phoneNumber}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">ไม่มีคิวที่รอ</div>
              )}
            </div>

            {skippedQueues.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
                  คิวที่ข้าม ({skippedQueues.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {skippedQueues.slice(0, 3).map((queue) => (
                    <div key={queue.queueId} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="font-bold text-orange-700">{queue.queueNumber}</p>
                      <p className="text-sm text-gray-700">{queue.patientName}</p>
                      <p className="text-xs text-gray-500">{queue.vn}</p>
                    </div>
                  ))}
                  {skippedQueues.length > 3 && (
                    <p className="text-sm text-gray-500 text-center pt-2">
                      และอีก {skippedQueues.length - 3} คิว
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid lg:grid-cols-2 gap-4">
          <button
            onClick={() => setCurrentView('queue')}
            className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 font-semibold text-lg flex items-center justify-center"
          >
            <ClipboardList className="w-6 h-6 mr-2" />
            จัดการคิว
          </button>
          <button
            onClick={loadStaffQueues}
            className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 font-semibold text-lg"
          >
            รีเฟรชข้อมูล
          </button>
        </div>
      </div>
    </div>
  );
}