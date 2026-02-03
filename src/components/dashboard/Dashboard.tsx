import { useState, useEffect } from 'react';
import { WeatherInfo, WaterLog } from '../../types';
import { getCurrentWeather, getWeatherEmoji } from '../../services/weatherService';
import { useApp } from '../../contexts/AppContext';
import MealForm from '../diet/MealForm';
import ExerciseForm from '../exercise/ExerciseForm';

export default function Dashboard() {
  const { user, goal, dietRecords, exerciseLogs, waterLogs, addWaterLog } = useApp();
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [isMealFormOpen, setIsMealFormOpen] = useState(false);
  const [isExerciseFormOpen, setIsExerciseFormOpen] = useState(false);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    try {
      const weatherData = await getCurrentWeather('Seoul');
      setWeather(weatherData);
    } catch (error) {
      console.error('Error loading weather:', error);
    }
  };

  const handleAddWater = () => {
    if (!user) {
      alert('사용자 정보를 먼저 설정해주세요.');
      return;
    }

    const newLog: WaterLog = {
      id: Date.now().toString(),
      userId: user.id,
      date: new Date(),
      amountMl: 250,
      createdAt: new Date(),
    };

    addWaterLog(newLog);
  };

  // 오늘 데이터 계산
  const getTodayData = () => {
    const today = new Date().toISOString().split('T')[0];

    const todayDiet = dietRecords.filter(
      (r) => new Date(r.date).toISOString().split('T')[0] === today
    );
    const todayExercise = exerciseLogs.filter(
      (l) => new Date(l.date).toISOString().split('T')[0] === today
    );
    const todayWater = waterLogs.filter(
      (l) => new Date(l.date).toISOString().split('T')[0] === today
    );

    const totalCaloriesConsumed = todayDiet.reduce((sum, r) => sum + r.totalCalories, 0);
    const totalCaloriesBurned = todayExercise.reduce((sum, l) => sum + l.caloriesBurned, 0);
    const totalWater = todayWater.reduce((sum, l) => sum + l.amountMl, 0);

    const targetCalories = goal?.dailyCalorieGoal || 2000;
    const targetWater = goal?.dailyWaterGoal || 2000;
    const remainingCalories = targetCalories - totalCaloriesConsumed + totalCaloriesBurned;

    const calorieProgress = Math.round((totalCaloriesConsumed / targetCalories) * 100);
    const waterProgress = Math.round((totalWater / targetWater) * 100);

    return {
      totalCaloriesConsumed,
      totalCaloriesBurned,
      remainingCalories,
      totalWater,
      targetCalories,
      targetWater,
      calorieProgress,
      waterProgress,
    };
  };

  const todayData = getTodayData();

  return (
    <div className="space-y-6">
      <MealForm
        isOpen={isMealFormOpen}
        onClose={() => setIsMealFormOpen(false)}
      />
      <ExerciseForm
        isOpen={isExerciseFormOpen}
        onClose={() => setIsExerciseFormOpen(false)}
      />

      {/* 오늘의 요약 */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">오늘의 요약</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">섭취 칼로리</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {todayData.totalCaloriesConsumed.toLocaleString()} / {todayData.targetCalories.toLocaleString()} kcal
            </p>
            <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, todayData.calorieProgress)}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">소모 칼로리</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {todayData.totalCaloriesBurned.toLocaleString()} kcal
            </p>
          </div>

          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">남은 칼로리</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {todayData.remainingCalories.toLocaleString()} kcal
            </p>
          </div>

          <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">물 섭취량</p>
            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
              {(todayData.totalWater / 1000).toFixed(1)}L / {(todayData.targetWater / 1000)}L
            </p>
            <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-cyan-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, todayData.waterProgress)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* 빠른 기록 */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">빠른 기록</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsMealFormOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition duration-200"
          >
            <span>🍽️</span>
            <span>식사 추가</span>
          </button>
          <button
            onClick={() => setIsExerciseFormOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition duration-200"
          >
            <span>💪</span>
            <span>운동 추가</span>
          </button>
          <button
            onClick={handleAddWater}
            className="flex items-center space-x-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition duration-200"
          >
            <span>💧</span>
            <span>물 마시기</span>
          </button>
        </div>
      </section>

      {/* 오늘의 추천 */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">오늘의 추천</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-3xl">
                  {weather ? getWeatherEmoji(weather.condition) : '🌤️'}
                </span>
                <div>
                  <p className="font-semibold text-gray-700">현재 날씨</p>
                  {weather ? (
                    <>
                      <p className="text-sm text-gray-600">{weather.description}</p>
                      <p className="text-lg font-bold text-blue-700">
                        {weather.temperature}°C
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600">로딩 중...</p>
                  )}
                </div>
              </div>
            </div>
            {weather && (
              <div className="mt-3 p-2 bg-white rounded">
                <p className="text-sm text-gray-700">
                  💡{' '}
                  {weather.temperature >= 5 && weather.temperature <= 28 && weather.condition !== 'rainy'
                    ? '실외 운동 추천: 조깅 30분'
                    : '실내 운동 추천: 홈트레이닝'}
                </p>
              </div>
            )}
          </div>

          <div className="p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">🥗</span>
              <p className="font-semibold text-gray-700">추천 식단</p>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              계절 맞춤 메뉴 (겨울)
            </p>
            <p className="font-bold text-orange-700">따뜻한 국물 요리</p>
            <div className="mt-3 p-2 bg-white rounded">
              <p className="text-sm text-gray-700">
                💡 된장찌개, 뿌리채소 볶음밥
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
