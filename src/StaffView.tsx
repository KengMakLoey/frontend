import React, { useState, useEffect } from 'react';
import { 
  Bell, SkipForward, CheckSquare, AlertCircle, Phone
} from 'lucide-react';
import type { StaffData, StaffQueue } from './shared/types';
import { API } from './shared/api';
import StaffAuth from './StaffAuth';

interface StaffViewProps {
  onBack: () => void;
}

export default function StaffView({ onBack }: StaffViewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isStaffLoggedIn, setIsStaffLoggedIn] = useState(false);
  const [staffData, setStaffData] = useState<StaffData | null>(null);
  const [staffQueues, setStaffQueues] = useState<StaffQueue[]>([]);
  const [currentCalledQueue, setCurrentCalledQueue] = useState<StaffQueue | null>(null);
  const [showCreateQueue, setShowCreateQueue] = useState(false);
  const [newQueueVN, setNewQueueVN] = useState('');

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const loadQueues = async () => {
      if (!staffData?.departmentId) return;
      try {
        const queues = await API.getDepartmentQueues(staffData.departmentId);
        if (isMounted) {
          setStaffQueues(queues);
          const called = queues.find(q => q.status === 'called' || q.status === 'in_progress');
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
  }, [isStaffLoggedIn, staffData, currentCalledQueue]);

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
      await API.updatePatientArrived(queueId, staffData?.staffName || 'staff');
      await loadStaffQueues();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการอัพเดทสถานะ');
    }
  };

  const handleSkipQueue = async (queueId: number) => {
    const queue = staffQueues.find(q => q.queueId === queueId);
    if (!queue) return;

    if (!confirm(`คุณต้องการข้ามคิวนี้ใช่หรือไม่?\n\nคนไข้: ${queue.patientName}\nเบอร์โทร: ${queue.phoneNumber}\n\nคนไข้จะได้รับข้อความให้ไปรายงานตัวกับเจ้าหน้าที่`)) return;
    
    try {
      const response = await API.skipQueue(queueId, staffData?.staffName || 'staff');
      
      if (currentCalledQueue?.queueId === queueId) {
        setCurrentCalledQueue(null);
      }
      
      // Show patient contact info
      if (response.patientInfo) {
        alert(`ข้ามคิวแล้ว\n\nข้อมูลติดต่อคนไข้:\nชื่อ: ${response.patientInfo.name}\nเบอร์: ${response.patientInfo.phone}\nคิว: ${response.patientInfo.queueNumber}`);
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

  // If not logged in, show StaffAuth
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
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateQueue(!showCreateQueue)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold"
          >
            + สร้างคิวใหม่
          </button>
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
      </div>

      {showCreateQueue && (
        <div className="mb-6 p-6 bg-white rounded-2xl shadow-lg border-2 border-green-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">สร้างคิวใหม่</h3>
            <button
              onClick={() => {
                setShowCreateQueue(false);
                setNewQueueVN('');
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={newQueueVN}
              onChange={(e) => setNewQueueVN(e.target.value)}
              placeholder="กรอกเลข VN (ตัวอย่าง: VN202601080001)"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              disabled={loading}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateQueue(e)}
            />
            <button
              onClick={handleCreateQueue}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
            >
              {loading ? 'กำลังสร้าง...' : 'สร้างคิว'}
            </button>
            <button
              onClick={() => {
                setShowCreateQueue(false);
                setNewQueueVN('');
              }}
              className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

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
                    <p className={`${currentCalledQueue.status === 'in_progress' ? 'text-blue-100' : 'text-green-100'} text-sm mt-1 flex items-center justify-center`}>
                      <Phone className="w-4 h-4 mr-1" />
                      {currentCalledQueue.phoneNumber}
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
              </div>

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
                            <p className="text-xs text-blue-600 flex items-center mt-1">
                              <Phone className="w-3 h-3 mr-1" />
                              {queue.phoneNumber}
                            </p>
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
                          <p className="text-xs text-blue-600 flex items-center mt-1">
                            <Phone className="w-3 h-3 mr-1" />
                            {queue.phoneNumber}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            const phoneNumber = queue.phoneNumber;
                            const message = `โทรออกไปที่: ${phoneNumber}\n\nคนไข้: ${queue.patientName}\nคิว: ${queue.queueNumber}\nVN: ${queue.vn}`;
                            
                            if (window.confirm(message + '\n\nคุณต้องการโทรออกหรือไม่?')) {
                              window.location.href = `tel:${phoneNumber}`;
                            }
                          }}
                          className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 text-sm flex items-center justify-center"
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          โทรติดต่อ
                        </button>
                        <button
                          onClick={() => handleRecallSkipped(queue.queueId)}
                          className="bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 text-sm flex items-center justify-center"
                        >
                          <Bell className="w-4 h-4 mr-1" />
                          เรียกคิว
                        </button>
                      </div>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}