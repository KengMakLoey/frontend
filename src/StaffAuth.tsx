import React, { useState } from 'react';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

interface StaffAuthProps {
  onLogin: (username: string, password: string) => void;
  onBack: () => void;
  loading: boolean;
  error: string;
}

export default function StaffAuth({ onLogin, onBack, loading, error }: StaffAuthProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = () => {
    if (authMode === 'login') {
      if (!username || !password) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
      }
      onLogin(username, password);
    } else {
      // Register mode - for future implementation
      if (!username || !password || !confirmPassword) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
      }
      if (password !== confirmPassword) {
        alert('รหัสผ่านไม่ตรงกัน');
        return;
      }
      // TODO: Call register API
      alert('ฟีเจอร์สมัครสมาชิกยังไม่เปิดใช้งาน');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      {/* Background image */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url('/bg.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      ></div>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/80"></div>
      
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 text-white hover:text-gray-300 text-lg z-10"
      >
        ← กลับหน้าหลัก
      </button>

      {/* Auth Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div 
              className="inline-block text-white px-16 py-3 rounded-full mb-6" 
              style={{ backgroundColor: '#044C72' }}
            >
              <h1 className="text-xl font-bold">
                {authMode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
              </h1>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Auth Form */}
          <div className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                ชื่อผู้ใช้งาน
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="ชื่อผู้ใช้งาน"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#044C72] focus:border-transparent"
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {authMode === 'register' ? 'ตั้งรหัสผ่าน' : 'รหัสผ่าน'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="รหัสผ่าน"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#044C72] focus:border-transparent pr-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Register Mode Fields */}
            {authMode === 'register' && (
              <>
                {/* Confirm Password Field */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    ยืนยันรหัสผ่าน
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="ยืนยันรหัสผ่าน"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#044C72] focus:border-transparent pr-12"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Department Field */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    แผนก
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#044C72] focus:border-transparent appearance-none bg-white"
                    disabled={loading}
                    defaultValue=""
                  >
                    <option value="" disabled>เลือกแผนก</option>
                    <option value="1">อายุรกรรม</option>
                    <option value="2">ศัลยกรรม</option>
                    <option value="3">กุมารเวชกรรม</option>
                    <option value="4">สูติ-นรีเวชกรรม</option>
                    <option value="5">ทันตกรรม</option>
                    <option value="6">ตรวจสุขภาพ</option>
                  </select>
                </div>

                {/* Role Field */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    บทบาท
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#044C72] focus:border-transparent appearance-none bg-white"
                    disabled={loading}
                    defaultValue=""
                  >
                    <option value="" disabled>เลือกบทบาท</option>
                    <option value="doctor">แพทย์</option>
                    <option value="nurse">พยาบาล</option>
                    <option value="staff">เจ้าหน้าที่</option>
                  </select>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ backgroundColor: '#044C72' }}
              className="w-full hover:opacity-90 text-white font-bold py-3 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
            >
              {loading ? (
                'กำลังดำเนินการ...'
              ) : authMode === 'login' ? (
                'เข้าสู่ระบบ'
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  สมัครสมาชิก
                </>
              )}
            </button>
          </div>

          {/* Toggle Auth Mode */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              {authMode === 'login' ? (
                <>
                  ยังไม่มีบัญชี?{' '}
                  <span 
                    onClick={() => {
                      setAuthMode('register');
                      setUsername('');
                      setPassword('');
                      setConfirmPassword('');
                    }}
                    className="text-red-500 hover:text-red-600 font-bold cursor-pointer"
                  >
                    สมัครที่นี่
                  </span>
                </>
              ) : (
                <>
                  มีบัญชีอยู่แล้ว?{' '}
                  <span 
                    onClick={() => {
                      setAuthMode('login');
                      setUsername('');
                      setPassword('');
                      setConfirmPassword('');
                    }}
                    className="text-red-500 hover:text-red-600 font-bold cursor-pointer"
                  >
                    เข้าสู่ระบบ
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}