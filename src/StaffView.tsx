import { useState, useEffect } from 'react';
import { 
 AlertCircle, Phone, ClipboardList, User, Briefcase, Building2, Clock
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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
        <div className="w-32"></div>
        <div className="flex items-center gap-2">
          <svg className="w-8 h-8 text-teal-600" fill="#044C72" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <h1 className="text-3xl font-bold text-gray-800">หน้าหลัก</h1>
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile & Actions */}
            <div className="space-y-6">
              {/* User Profile Card */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden" style={{ borderWidth: '2px', borderColor: '#BEBEBE' }}>
                {/* Header Bar */}
                <div className="py-3 text-center" style={{ backgroundColor: '#39AAAD' }}>
                  <p className="text-white font-bold">ข้อมูลผู้ใช้งาน</p>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-3">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-800">{staffData?.staffName}</h2>
                      <div className="flex items-center text-gray-600 text-sm mt-1">
                        <Briefcase className="w-3 h-3 mr-1" />
                        <span className="font-medium">
                          {staffData?.role === 'doctor' ? 'แพทย์' : 
                          staffData?.role === 'nurse' ? 'พยาบาล' : 
                          staffData?.role === 'staff' ? 'เจ้าหน้าที่' : 'พนักงาน'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Building2 className="w-4 h-4 mr-2" />
                      <span>{staffData?.departmentName}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-xs">
                        เข้าสู่ระบบล่าสุด: {new Date().toLocaleDateString('th-TH', { 
                          day: 'numeric',
                          month: 'short'
                        })} {new Date().toLocaleTimeString('th-TH', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Current Queue Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden" style={{ borderWidth: '2px', borderColor: '#BEBEBE' }}>
                  {/* Header Bar */}
                  <div className="py-3 text-center" style={{ backgroundColor: '#39AAAD' }}>
                    <p className="text-white font-bold">สถานะคิวปัจจุบัน</p>
                  </div>

                  <div className="p-6">
                    {currentQueue ? (
                      <div className="text-center">
                        <p className="text-gray-600 text-sm mb-2">คิวปัจจุบัน</p>
                        <div className="text-6xl font-bold mb-3" style={{ color: '#044C72' }}>{currentQueue.queueNumber}</div>
                        <p className="text-gray-700 mb-1">
                          <span className="font-semibold" style={{ color: '#044C72' }}>สถานะ:</span> <span className="font-medium" style={{ color: '#044C72' }}>{currentQueue.status === 'in_progress' ? 'กำลังรับบริการ' : 'เรียกแล้ว'}</span>
                        </p>
                        
                        <button
                          onClick={() => setCurrentView('queue')}
                          className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white px-6 py-3 rounded-xl hover:from-green-500 hover:to-green-600 font-bold mt-4 flex items-center justify-center"
                        >
                          <ClipboardList className="w-5 h-5 mr-2" />
                          ไปจัดการคิว
                        </button>
                        
                        <div className="flex items-center justify-center text-gray-400 text-xs mt-4">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>อัปเดตข้อมูลล่าสุด: {new Date().toLocaleTimeString('th-TH', { 
                            hour: '2-digit', 
                            minute: '2-digit'
                          })} น.</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 mb-4">ไม่มีคิวปัจจุบัน</p>
                        
                        <button
                          onClick={() => setCurrentView('queue')}
                          className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white px-6 py-3 rounded-xl hover:from-green-500 hover:to-green-600 font-bold flex items-center justify-center"
                        >
                          <ClipboardList className="w-5 h-5 mr-2" />
                          ไปจัดการคิว
                        </button>
                        
                        <div className="flex items-center justify-center text-gray-400 text-xs mt-4">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>อัปเดตข้อมูลล่าสุด: {new Date().toLocaleTimeString('th-TH', { 
                            hour: '2-digit', 
                            minute: '2-digit'
                          })} น.</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <button
                  onClick={loadStaffQueues}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-semibold"
                >
                  รีเฟรชข้อมูล
                </button>
              </div>
            </div>

          {/* Right Column - Stats & Queue List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden" style={{ borderWidth: '2px', borderColor: '#BEBEBE' }}>
              {/* Header Bar */}
              <div className="py-3 text-center" style={{ backgroundColor: '#39AAAD' }}>
                <p className="text-white font-bold">สถิติวันนี้</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-2xl p-6 text-center"style={{ backgroundColor: '#FFAE3C' }}>
                     <p className="text-white text-sm font-medium">คิวรอทั้งหมด</p>
                    <div className="text-5xl font-bold text-white mb-2">{waitingQueues.length}</div>
                  </div>
                  <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: '#87E74B' }}>       
                    <p className="text-white text-sm font-medium">ให้บริการแล้ว</p>
                    <div className="text-5xl font-bold text-white mb-2">{completedQueues.length}</div>
                  </div>
                  <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: '#FF4C4C' }}>
                    <p className="text-white text-sm font-medium">ข้าม</p>
                    <div className="text-5xl font-bold text-white mb-2">{skippedQueues.length}</div>
                  </div>
                </div>
              </div>
            </div>

           {/* Queue List */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden" style={{ borderWidth: '2px', borderColor: '#BEBEBE' }}>
              {/* Header Bar */}
              <div className="py-3 text-center" style={{ backgroundColor: '#39AAAD' }}>
                <p className="text-white font-bold">คิวถัดไป</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  {waitingQueues.slice(0, 4).map((queue) => (
                    <div key={queue.queueId} className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full p-3" style={{ backgroundColor: '#044C72' }}>
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-4xl font-bold text-gray-800" style={{ color: '#044C72' }}>{queue.queueNumber}</div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800 text-lg">{queue.patientName}</p>
                        <p className="text-sm text-gray-500">VN{queue.vn.split('-').pop()}</p>
                      </div>
                    </div>
                  ))}
                  {waitingQueues.length === 0 && (
                    <div className="text-center py-8 text-gray-500">ไม่มีคิวที่รอ</div>
                  )}
                </div>
              </div>
            </div>

           {/* Skipped Queues */}
            {skippedQueues.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden" style={{ borderWidth: '2px', borderColor: '#BEBEBE' }}>
                {/* Header Bar */}
                <div className="py-3 text-center" style={{ backgroundColor: '#FF4C4C' }}>
                 <p className="text-white font-bold flex items-center justify-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  คิวที่ถูกข้าม
                </p>
                </div>
                
                <div className="p-6">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {skippedQueues.slice(0, 4).map((queue) => (
                      <div key={queue.queueId} className="flex items-center justify-between bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
                        <div className="flex items-center gap-4">
                          <div className="rounded-full p-3" style={{ backgroundColor: '#FF4C4C' }}>
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-4xl font-bold text-orange-700">{queue.queueNumber}</div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800 text-lg">{queue.patientName}</p>
                          <p className="text-sm text-gray-500">VN{queue.vn.split('-').pop()}</p>
                          <p className="text-sm flex items-center justify-end mt-1" style={{ color: '#FF4C4C' }}>
                            <Phone className="w-4 h-4 mr-1" />
                            {queue.phoneNumber}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}