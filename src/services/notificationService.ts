/**
 * 브라우저 알림 서비스
 */

export type NotificationType = 'meal' | 'water' | 'exercise' | 'goal';

export interface NotificationSettings {
  mealTimes: boolean;
  waterReminder: boolean;
  exerciseReminder: boolean;
  dailyReport: boolean;
  mealTimesList: string[]; // ['08:00', '12:00', '18:00']
  waterInterval: number; // 분 단위 (120 = 2시간)
  exerciseTime: string; // '19:00'
  reportTime: string; // '22:00'
}

// 기본 설정
export const defaultNotificationSettings: NotificationSettings = {
  mealTimes: true,
  waterReminder: true,
  exerciseReminder: true,
  dailyReport: true,
  mealTimesList: ['08:00', '12:00', '18:00'],
  waterInterval: 120, // 2시간
  exerciseTime: '19:00',
  reportTime: '22:00',
};

/**
 * 알림 권한 요청
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * 알림 권한 확인
 */
export function hasNotificationPermission(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

/**
 * 알림 표시
 */
export function showNotification(
  title: string,
  options?: NotificationOptions
): void {
  if (!hasNotificationPermission()) {
    console.warn('Notification permission not granted');
    return;
  }

  const defaultOptions: NotificationOptions = {
    icon: '/icon.png',
    badge: '/badge.png',
    vibrate: [200, 100, 200],
    ...options,
  };

  new Notification(title, defaultOptions);
}

/**
 * 식사 시간 알림
 */
export function showMealNotification(mealType: string): void {
  const mealNames: Record<string, string> = {
    breakfast: '아침',
    lunch: '점심',
    dinner: '저녁',
    snack: '간식',
  };

  showNotification('🍽️ 식사 시간 알림', {
    body: `${mealNames[mealType] || mealType} 식사 시간입니다. 건강한 식단을 기록하세요!`,
    tag: 'meal-reminder',
  });
}

/**
 * 물 마시기 알림
 */
export function showWaterNotification(): void {
  showNotification('💧 물 마시기 알림', {
    body: '물 마실 시간입니다! 하루 2L 목표를 달성하세요.',
    tag: 'water-reminder',
  });
}

/**
 * 운동 알림
 */
export function showExerciseNotification(): void {
  showNotification('💪 운동 알림', {
    body: '오늘의 운동 시간입니다. 건강한 몸을 위해 운동하세요!',
    tag: 'exercise-reminder',
  });
}

/**
 * 목표 달성 축하 알림
 */
export function showGoalAchievementNotification(goalType: string): void {
  showNotification('🎉 목표 달성!', {
    body: `축하합니다! ${goalType} 목표를 달성했습니다!`,
    tag: 'goal-achievement',
  });
}

/**
 * 일일 리포트 알림
 */
export function showDailyReportNotification(summary: {
  calories: number;
  exercise: number;
  water: number;
}): void {
  showNotification('📊 오늘의 건강 리포트', {
    body: `칼로리: ${summary.calories}kcal | 운동: ${summary.exercise}분 | 물: ${summary.water}ml`,
    tag: 'daily-report',
  });
}

/**
 * 알림 스케줄 설정
 */
class NotificationScheduler {
  private intervals: number[] = [];

  /**
   * 모든 스케줄 시작
   */
  startAll(settings: NotificationSettings): void {
    this.stopAll();

    // 물 마시기 알림
    if (settings.waterReminder) {
      this.scheduleWaterReminder(settings.waterInterval);
    }

    // 식사 시간 알림
    if (settings.mealTimes) {
      settings.mealTimesList.forEach((time, index) => {
        this.scheduleMealReminder(time, index === 0 ? 'breakfast' : index === 1 ? 'lunch' : 'dinner');
      });
    }

    // 운동 알림
    if (settings.exerciseReminder) {
      this.scheduleExerciseReminder(settings.exerciseTime);
    }

    // 일일 리포트
    if (settings.dailyReport) {
      this.scheduleDailyReport(settings.reportTime);
    }
  }

  /**
   * 모든 스케줄 중지
   */
  stopAll(): void {
    this.intervals.forEach(clearInterval);
    this.intervals = [];
  }

  /**
   * 물 마시기 알림 스케줄
   */
  private scheduleWaterReminder(intervalMinutes: number): void {
    const interval = window.setInterval(() => {
      showWaterNotification();
    }, intervalMinutes * 60 * 1000);

    this.intervals.push(interval);
  }

  /**
   * 식사 시간 알림 스케줄
   */
  private scheduleMealReminder(time: string, mealType: string): void {
    this.scheduleTimeBasedReminder(time, () => {
      showMealNotification(mealType);
    });
  }

  /**
   * 운동 알림 스케줄
   */
  private scheduleExerciseReminder(time: string): void {
    this.scheduleTimeBasedReminder(time, () => {
      showExerciseNotification();
    });
  }

  /**
   * 일일 리포트 스케줄
   */
  private scheduleDailyReport(time: string): void {
    this.scheduleTimeBasedReminder(time, () => {
      // 실제 데이터는 로컬 스토리지에서 가져와야 함
      showDailyReportNotification({
        calories: 1850,
        exercise: 30,
        water: 1500,
      });
    });
  }

  /**
   * 시간 기반 알림 스케줄 (매일 특정 시간에 실행)
   */
  private scheduleTimeBasedReminder(time: string, callback: () => void): void {
    const [hours, minutes] = time.split(':').map(Number);

    const checkTime = () => {
      const now = new Date();
      if (now.getHours() === hours && now.getMinutes() === minutes) {
        callback();
      }
    };

    // 매 분마다 체크 (실제로는 더 효율적인 방법 사용 권장)
    const interval = window.setInterval(checkTime, 60 * 1000);
    this.intervals.push(interval);
  }
}

export const notificationScheduler = new NotificationScheduler();

/**
 * 알림 설정 저장/불러오기
 */
const SETTINGS_KEY = 'healthy_diary_notification_settings';

export function saveNotificationSettings(settings: NotificationSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadNotificationSettings(): NotificationSettings {
  const saved = localStorage.getItem(SETTINGS_KEY);
  return saved ? JSON.parse(saved) : defaultNotificationSettings;
}
