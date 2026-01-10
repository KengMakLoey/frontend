import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  QrCode, CheckCircle, Bell, Clock, AlertCircle, Volume2, VolumeX
} from 'lucide-react';
import type { QueueData } from './shared/types';
import { API } from './shared/api';
import { useQueueWebSocket } from './shared/useWebSocket';
import { playBeepSound } from './shared/soundUtils';

interface PatientViewProps {
  onBack: () => void;
}

export default function PatientView({ onBack }: PatientViewProps) {
  const [vn, setVn] = useState('');
  const [queueData, setQueueData] = useState<QueueData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const hasPlayedSound = useRef(false);
  const notificationTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleQueueUpdate = useCallback((updatedData: QueueData) => {
    const oldStatus = queueData?.status;
    setQueueData(updatedData);

    if (updatedData.status === 'called' && oldStatus !== 'called' && !hasPlayedSound.current) {
      setNotification('🔔 ถึงคิวของคุณแล้ว! กรุณาเข้ารับบริการ');
      
      if (soundEnabled) {
        playBeepSound();
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

  const { isConnected: wsConnected } = useQueueWebSocket(queueData?.vn, handleQueueUpdate);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    if (queueData && !wsConnected) {
      const updateQueue = async () => {
        if (!isMounted) return;
        try {
          const updated = await API.getQueueByVN(queueData.vn);
          if (isMounted && updated) {
            if (updated.status === 'called' && queueData.status !== 'called' && !hasPlayedSound.current) {
              setNotification('🔔 ถึงคิวของคุณแล้ว! กรุณาเข้ารับบริการ');
              
              if (soundEnabled) {
                playBeepSound();
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
  }, [queueData, wsConnected, soundEnabled]);

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let inputVN = vn.trim();
    
    if (!inputVN) {
      setError('กรุณากรอกเลข VN');
      return;
    }

    // Auto-format VN: รองรับหลายรูปแบบ
    const today = new Date();
    const yy = String(today.getFullYear()).slice(-2);
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const datePrefix = `VN${yy}${mm}${dd}-`;

    // กรอกแค่ตัวเลข เช่น "0001" หรือ "1"
    if (/^\d+$/.test(inputVN)) {
      inputVN = `${datePrefix}${inputVN.padStart(4, '0')}`;
    }
    // กรอก "VN0001" หรือ "VN1" (ไม่มีวันที่)
    else if (/^VN\d+$/.test(inputVN)) {
      const num = inputVN.replace('VN', '');
      inputVN = `${datePrefix}${num.padStart(4, '0')}`;
    }
    // กรอกเต็ม "VN260108-0001" (ตรวจสอบรูปแบบ)
    else if (!/^VN\d{6}-\d{4}$/.test(inputVN)) {
      setError('รูปแบบ VN ไม่ถูกต้อง (กรอกได้: 0001, VN0001, หรือ VN260108-0001)');
      return;
    }

    setLoading(true);
    setError('');
    hasPlayedSound.current = false;

    try {
      const data = await API.getQueueByVN(inputVN);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => {
            onBack();
            setVn('');
            setQueueData(null);
            setError('');
            setNotification('');
          }}
          className="text-blue-600 hover:text-blue-700 mb-6 flex items-center"
        >
          ← กลับหน้าหลัก
        </button>

        {queueData && (
          <div className="max-w-2xl mx-auto mb-4">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                soundEnabled 
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
          </div>
        )}

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
                    placeholder="ตัวอย่าง: VN0001"
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