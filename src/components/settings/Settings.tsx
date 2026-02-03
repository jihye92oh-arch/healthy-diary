import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useTheme } from '../../contexts/ThemeContext';
import { exportAllData, importAllData, clearAllData } from '../../services/storageService';
import {
  requestNotificationPermission,
  hasNotificationPermission,
  showNotification,
  loadNotificationSettings,
  saveNotificationSettings,
  notificationScheduler,
  NotificationSettings,
} from '../../services/notificationService';

export default function Settings() {
  const { user } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(
    loadNotificationSettings()
  );

  useEffect(() => {
    setNotificationEnabled(hasNotificationPermission());

    // 알림 스케줄 시작
    if (hasNotificationPermission()) {
      notificationScheduler.startAll(notificationSettings);
    }

    return () => {
      notificationScheduler.stopAll();
    };
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationEnabled(granted);

    if (granted) {
      showNotification('✅ 알림 설정 완료', {
        body: '이제 식사, 물, 운동 알림을 받을 수 있습니다!',
      });
      notificationScheduler.startAll(notificationSettings);
    }
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: any) => {
    const updated = { ...notificationSettings, [key]: value };
    setNotificationSettings(updated);
    saveNotificationSettings(updated);

    if (notificationEnabled) {
      notificationScheduler.startAll(updated);
    }
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `healthy-diary-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          const success = importAllData(event.target.result);
          if (success) {
            alert('데이터를 성공적으로 가져왔습니다. 페이지를 새로고침합니다.');
            window.location.reload();
          } else {
            alert('데이터 가져오기에 실패했습니다.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearAll = () => {
    if (window.confirm('정말로 모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      if (window.confirm('한 번 더 확인합니다. 모든 기록이 삭제됩니다.')) {
        clearAllData();
        alert('모든 데이터가 초기화되었습니다. 페이지를 새로고침합니다.');
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 개인 정보 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">개인 정보</h2>
        {user ? (
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="text-gray-600 dark:text-gray-400">이름:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{user.name}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="text-gray-600 dark:text-gray-400">성별:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {user.gender === 'male' ? '남성' : user.gender === 'female' ? '여성' : '기타'}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="text-gray-600 dark:text-gray-400">키:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{user.height}cm</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="text-gray-600 dark:text-gray-400">체중:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{user.currentWeight}kg</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="text-gray-600 dark:text-gray-400">활동 수준:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {user.activityLevel === 'sedentary' && '거의 운동 안함'}
                {user.activityLevel === 'light' && '가벼운 운동'}
                {user.activityLevel === 'moderate' && '보통 운동'}
                {user.activityLevel === 'active' && '적극적 운동'}
                {user.activityLevel === 'very_active' && '매우 적극적'}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">목표 탭에서 개인 정보를 설정해주세요.</p>
        )}
      </div>

      {/* 알림 설정 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">알림 설정</h2>

        {!notificationEnabled ? (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
              알림을 받으려면 브라우저 권한이 필요합니다.
            </p>
            <button
              onClick={handleEnableNotifications}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition"
            >
              🔔 알림 권한 허용하기
            </button>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✅ 알림이 활성화되었습니다
            </p>
          </div>
        )}

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
            <span className="text-gray-700 dark:text-gray-300">식사 시간 알림 (8시, 12시, 18시)</span>
            <input
              type="checkbox"
              checked={notificationSettings.mealTimes}
              onChange={(e) => handleSettingChange('mealTimes', e.target.checked)}
              disabled={!notificationEnabled}
              className="w-5 h-5"
            />
          </label>
          <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
            <span className="text-gray-700 dark:text-gray-300">물 마시기 알림 (2시간마다)</span>
            <input
              type="checkbox"
              checked={notificationSettings.waterReminder}
              onChange={(e) => handleSettingChange('waterReminder', e.target.checked)}
              disabled={!notificationEnabled}
              className="w-5 h-5"
            />
          </label>
          <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
            <span className="text-gray-700 dark:text-gray-300">운동 알림 (매일 19시)</span>
            <input
              type="checkbox"
              checked={notificationSettings.exerciseReminder}
              onChange={(e) => handleSettingChange('exerciseReminder', e.target.checked)}
              disabled={!notificationEnabled}
              className="w-5 h-5"
            />
          </label>
          <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
            <span className="text-gray-700 dark:text-gray-300">일일 리포트 (22시)</span>
            <input
              type="checkbox"
              checked={notificationSettings.dailyReport}
              onChange={(e) => handleSettingChange('dailyReport', e.target.checked)}
              disabled={!notificationEnabled}
              className="w-5 h-5"
            />
          </label>
        </div>
      </div>

      {/* 데이터 관리 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">데이터 관리</h2>
        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="w-full p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium rounded-lg transition flex items-center justify-between"
          >
            <span>📤 데이터 내보내기</span>
            <span className="text-sm">JSON 파일로 저장</span>
          </button>
          <button
            onClick={handleImport}
            className="w-full p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400 font-medium rounded-lg transition flex items-center justify-between"
          >
            <span>📥 데이터 가져오기</span>
            <span className="text-sm">백업 파일 불러오기</span>
          </button>
          <button
            onClick={handleClearAll}
            className="w-full p-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 font-medium rounded-lg transition flex items-center justify-between"
          >
            <span>🗑️ 모든 데이터 초기화</span>
            <span className="text-sm">⚠️ 주의: 되돌릴 수 없음</span>
          </button>
        </div>
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>💡 팁:</strong> 정기적으로 데이터를 백업하여 안전하게 보관하세요.
            다른 기기에서도 백업 파일을 가져와 사용할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 기타 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">기타</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <span className="text-gray-600 dark:text-gray-300">테마:</span>
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
            >
              <span>{theme === 'light' ? '🌙' : '☀️'}</span>
              <span>{theme === 'light' ? '다크 모드' : '라이트 모드'}</span>
            </button>
          </div>
          <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <span className="text-gray-600 dark:text-gray-400">언어:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">한국어</span>
          </div>
          <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <span className="text-gray-600 dark:text-gray-400">버전:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">1.0.0</span>
          </div>
        </div>
      </div>

      {/* 정보 */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg shadow-md p-6">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">📋 Healthy Diary</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
          건강한 다이어트 습관 형성을 돕는 개인 맞춤형 건강 관리 플랫폼
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          React 18 + TypeScript + Tailwind CSS + Recharts
        </p>
      </div>
    </div>
  );
}
