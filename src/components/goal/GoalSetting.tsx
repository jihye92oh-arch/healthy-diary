import { useState, useEffect } from 'react';
import { User, Goal } from '../../types';
import { calculateBMR, calculateTDEE, calculateTargetCalories } from '../../services/calorieService';
import { useApp } from '../../contexts/AppContext';

export default function GoalSetting() {
  const { user: contextUser, setUser: setContextUser, goal: contextGoal, setGoal: setContextGoal } = useApp();
  const [showUserForm, setShowUserForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);

  // Initialize with default values if not in context
  const [user, setUser] = useState<User>(contextUser || {
    id: '1',
    name: '홍길동',
    gender: 'male',
    birthDate: new Date('1990-01-01'),
    height: 175,
    currentWeight: 70,
    activityLevel: 'moderate',
    createdAt: new Date(),
  });

  const [goal, setGoal] = useState<Goal>(contextGoal || {
    id: '1',
    userId: '1',
    initialWeight: 70,
    targetWeight: 65,
    targetDate: new Date('2024-03-15'),
    dailyCalorieGoal: 2000,
    weeklyExerciseGoal: 5,
    dailyWaterGoal: 2000,
    createdAt: new Date(),
  });

  // Sync with context when available
  useEffect(() => {
    if (contextUser) setUser(contextUser);
  }, [contextUser]);

  useEffect(() => {
    if (contextGoal) setGoal(contextGoal);
  }, [contextGoal]);

  // Save to context when changed
  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    setContextUser(updatedUser);
  };

  const handleGoalUpdate = (updatedGoal: Goal) => {
    // initialWeight가 없으면 현재 체중으로 설정
    if (!updatedGoal.initialWeight) {
      updatedGoal.initialWeight = user.currentWeight;
    }
    setGoal(updatedGoal);
    setContextGoal(updatedGoal);
  };

  // BMI 계산 함수
  const calculateBMI = (weight: number, height: number) => {
    const heightInMeters = height / 100;
    return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
  };

  // BMI 상태 판정
  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { label: '저체중', color: 'text-blue-600' };
    if (bmi < 23) return { label: '정상', color: 'text-green-600' };
    if (bmi < 25) return { label: '과체중', color: 'text-yellow-600' };
    if (bmi < 30) return { label: '비만', color: 'text-orange-600' };
    return { label: '고도비만', color: 'text-red-600' };
  };

  // BMR, TDEE 계산
  const bmr = calculateBMR(user);
  const tdee = calculateTDEE(user);

  // 현재 BMI와 목표 BMI
  const currentBMI = calculateBMI(user.currentWeight, user.height);
  const targetBMI = calculateBMI(goal.targetWeight, user.height);
  const currentBMIStatus = getBMIStatus(currentBMI);
  const targetBMIStatus = getBMIStatus(targetBMI);

  // 목표 진행률 계산
  const initialWeight = goal.initialWeight || user.currentWeight;
  const totalWeightToLose = initialWeight - goal.targetWeight;
  const weightLostSoFar = initialWeight - user.currentWeight;
  const weightProgress = totalWeightToLose > 0
    ? (weightLostSoFar / totalWeightToLose) * 100
    : 0;
  const progressPercentage = Math.min(100, Math.max(0, Math.round(weightProgress)));

  // 남은 날짜 계산
  const targetDate = new Date(goal.targetDate);
  const daysRemaining = Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  // 주간 감량 속도 계산
  const weeksRemaining = daysRemaining / 7;
  const weeklyWeightLoss = weeksRemaining > 0 ? (user.currentWeight - goal.targetWeight) / weeksRemaining : 0;

  // 칼로리 적자 계산 (1kg 감량 = 약 7700kcal)
  const totalCalorieDeficit = (user.currentWeight - goal.targetWeight) * 7700;
  const dailyCalorieDeficit = daysRemaining > 0 ? totalCalorieDeficit / daysRemaining : 0;
  const recommendedDailyCalories = Math.round(tdee - dailyCalorieDeficit);

  // 자동 칼로리 계산
  const handleAutoCalculate = () => {
    const targetCalories = calculateTargetCalories(
      user.currentWeight,
      goal.targetWeight,
      goal.targetDate,
      tdee
    );
    handleGoalUpdate({ ...goal, dailyCalorieGoal: targetCalories });
  };

  return (
    <div className="space-y-6">
      {/* 현재 목표 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">현재 목표</h2>
          <button
            onClick={() => setShowGoalForm(!showGoalForm)}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium"
          >
            {showGoalForm ? '닫기' : '목표 수정'}
          </button>
        </div>

        {showGoalForm ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  목표 체중 (kg)
                </label>
                <input
                  type="number"
                  value={goal.targetWeight}
                  onChange={(e) => handleGoalUpdate({ ...goal, targetWeight: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  목표 날짜
                </label>
                <input
                  type="date"
                  value={targetDate.toISOString().split('T')[0]}
                  onChange={(e) => handleGoalUpdate({ ...goal, targetDate: new Date(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  일일 목표 칼로리 (kcal)
                </label>
                <input
                  type="number"
                  value={goal.dailyCalorieGoal}
                  onChange={(e) => handleGoalUpdate({ ...goal, dailyCalorieGoal: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  권장: {recommendedDailyCalories} kcal (현재 TDEE: {tdee} kcal)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  주간 운동 목표 (회)
                </label>
                <input
                  type="number"
                  value={goal.weeklyExerciseGoal}
                  onChange={(e) => handleGoalUpdate({ ...goal, weeklyExerciseGoal: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  일일 수분 목표 (ml)
                </label>
                <input
                  type="number"
                  value={goal.dailyWaterGoal}
                  onChange={(e) => handleGoalUpdate({ ...goal, dailyWaterGoal: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">목표 체중:</span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {goal.targetWeight}kg <span className="text-sm text-gray-600 dark:text-gray-400">(현재: {user.currentWeight}kg)</span>
                </span>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 dark:text-gray-300">진행률:</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">{progressPercentage}%</span>
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">목표일:</span>
                <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {targetDate.toISOString().split('T')[0]} ({daysRemaining > 0 ? `${daysRemaining}일 남음` : '목표일 도래'})
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BMI 및 체성분 분석 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">BMI 및 체성분 분석</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">현재 BMI</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{currentBMI}</p>
            <p className={`text-sm font-medium ${currentBMIStatus.color} mt-1`}>{currentBMIStatus.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              키: {user.height}cm / 체중: {user.currentWeight}kg
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">목표 BMI</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{targetBMI}</p>
            <p className={`text-sm font-medium ${targetBMIStatus.color} mt-1`}>{targetBMIStatus.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              목표 체중: {goal.targetWeight}kg
            </p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">감량 목표:</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {(user.currentWeight - goal.targetWeight).toFixed(1)}kg
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">주간 감량 속도:</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {weeklyWeightLoss.toFixed(2)}kg/주
              </span>
            </div>
            <div className="flex justify-between col-span-2">
              <span className="text-gray-600 dark:text-gray-400">BMI 변화:</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {currentBMI} → {targetBMI} ({(currentBMI - targetBMI).toFixed(1)})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 칼로리 계획 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">칼로리 계획</h2>
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">기초대사량 (BMR)</span>
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{bmr} kcal</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              휴식 상태에서 소모하는 최소 칼로리
            </p>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">일일 총 소비 칼로리 (TDEE)</span>
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{tdee} kcal</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              활동 수준을 고려한 하루 소비 칼로리
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">목표 섭취 칼로리</span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">{goal.dailyCalorieGoal} kcal</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              하루 권장 섭취량: {recommendedDailyCalories} kcal
            </p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">일일 칼로리 적자</span>
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                -{Math.round(dailyCalorieDeficit)} kcal
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              목표 달성을 위해 필요한 일일 적자량
            </p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            💡 <strong>권장사항:</strong> 건강한 감량을 위해 주당 0.5~1kg 감량을 추천합니다.
            {weeklyWeightLoss > 1 && (
              <span className="text-red-600 dark:text-red-400 block mt-1">
                ⚠️ 현재 계획은 너무 빠른 감량입니다. 목표 날짜를 조정하세요.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* 개인 정보 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">개인 정보</h2>
          <button
            onClick={() => setShowUserForm(!showUserForm)}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium"
          >
            {showUserForm ? '닫기' : '수정'}
          </button>
        </div>

        {showUserForm ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이름</label>
                <input
                  type="text"
                  value={user.name}
                  onChange={(e) => handleUserUpdate({ ...user, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">성별</label>
                <select
                  value={user.gender}
                  onChange={(e) => handleUserUpdate({ ...user, gender: e.target.value as 'male' | 'female' | 'other' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                  <option value="other">기타</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">키 (cm)</label>
                <input
                  type="number"
                  value={user.height}
                  onChange={(e) => handleUserUpdate({ ...user, height: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">현재 체중 (kg)</label>
                <input
                  type="number"
                  value={user.currentWeight}
                  onChange={(e) => handleUserUpdate({ ...user, currentWeight: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">활동 수준</label>
                <select
                  value={user.activityLevel}
                  onChange={(e) => handleUserUpdate({ ...user, activityLevel: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="sedentary">거의 운동 안함</option>
                  <option value="light">가벼운 운동 (주 1-3회)</option>
                  <option value="moderate">보통 운동 (주 3-5회)</option>
                  <option value="active">적극적 운동 (주 6-7회)</option>
                  <option value="very_active">매우 적극적 (하루 2회)</option>
                </select>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>BMR:</strong> {bmr} kcal/day
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>TDEE:</strong> {tdee} kcal/day
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                * BMR: 기초대사량 | TDEE: 일일 총 소비 칼로리
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">이름:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">성별:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {user.gender === 'male' ? '남성' : user.gender === 'female' ? '여성' : '기타'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">키:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{user.height}cm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">체중:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{user.currentWeight}kg</span>
            </div>
            <div className="flex justify-between col-span-2">
              <span className="text-gray-600 dark:text-gray-400">활동 수준:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {user.activityLevel === 'sedentary' ? '거의 운동 안함' :
                 user.activityLevel === 'light' ? '가벼운 운동' :
                 user.activityLevel === 'moderate' ? '보통 운동' :
                 user.activityLevel === 'active' ? '적극적 운동' : '매우 적극적'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 세부 목표 요약 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">세부 목표 요약</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">일일 칼로리 목표</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{goal.dailyCalorieGoal} kcal</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">주간 운동 목표</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{goal.weeklyExerciseGoal}회</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">체중 감량 속도</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{weeklyWeightLoss.toFixed(2)}kg/주</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">일일 수분 목표</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{goal.dailyWaterGoal}ml</p>
          </div>
        </div>
      </div>

      {/* 마일스톤 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">마일스톤</h2>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">1주차: 습관 형성 완료</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">매일 기록 작성</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">2주차: -1kg 달성</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">목표 칼로리 준수</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
            <span className="text-xl">🔄</span>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">4주차: -{(initialWeight - goal.targetWeight) / 2}kg 목표 (진행중)</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">현재 -{weightLostSoFar.toFixed(1)}kg</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 border-l-4 border-gray-300 dark:border-gray-600 rounded">
            <span className="text-xl">⏳</span>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">목표 달성: -{(initialWeight - goal.targetWeight).toFixed(1)}kg</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{targetDate.toISOString().split('T')[0]}까지</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
