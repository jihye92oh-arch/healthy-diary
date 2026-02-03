import { useState, useEffect } from 'react';
import { MealType, WaterLog } from '../../types';
import { useApp } from '../../contexts/AppContext';
import MealForm from './MealForm';
import ExerciseForm from '../exercise/ExerciseForm';

export default function DietLog() {
  const { user, dietRecords, exerciseLogs, waterLogs, addWaterLog, removeWaterLog } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [isMealFormOpen, setIsMealFormOpen] = useState(false);
  const [isExerciseFormOpen, setIsExerciseFormOpen] = useState(false);

  // 날짜별 데이터 필터링
  useEffect(() => {
    const dateStr = formatDate(selectedDate);
    const todayWaterLogs = waterLogs.filter(
      (log) => formatDate(new Date(log.date)) === dateStr
    );
    const totalWater = todayWaterLogs.reduce((sum, log) => sum + log.amountMl, 0);
    setWaterGlasses(Math.floor(totalWater / 250)); // 250ml = 1잔
  }, [waterLogs, selectedDate]);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const getTodayRecords = () => {
    const dateStr = formatDate(selectedDate);
    return dietRecords.filter((record) => formatDate(new Date(record.date)) === dateStr);
  };

  const getTodayExercises = () => {
    const dateStr = formatDate(selectedDate);
    return exerciseLogs.filter((log) => formatDate(new Date(log.date)) === dateStr);
  };

  const getMealRecords = (mealType: MealType) => {
    return getTodayRecords().filter((record) => record.mealType === mealType);
  };

  const getTotalCalories = (mealType: MealType) => {
    const records = getMealRecords(mealType);
    return records.reduce((sum, record) => sum + record.totalCalories, 0);
  };

  const handleAddWater = () => {
    if (!user) {
      alert('사용자 정보를 먼저 설정해주세요.');
      return;
    }

    const newLog: WaterLog = {
      id: Date.now().toString(),
      userId: user.id,
      date: selectedDate,
      amountMl: 250,
      createdAt: new Date(),
    };

    addWaterLog(newLog);
  };

  const handleRemoveWater = () => {
    if (waterGlasses > 0) {
      removeWaterLog(selectedDate);
    }
  };

  const mealTypes: { type: MealType; label: string }[] = [
    { type: 'breakfast', label: '아침' },
    { type: 'lunch', label: '점심' },
    { type: 'dinner', label: '저녁' },
    { type: 'snack', label: '간식' },
  ];

  return (
    <div className="space-y-6">
      <MealForm
        isOpen={isMealFormOpen}
        onClose={() => setIsMealFormOpen(false)}
        date={selectedDate}
      />
      <ExerciseForm
        isOpen={isExerciseFormOpen}
        onClose={() => setIsExerciseFormOpen(false)}
        date={selectedDate}
      />
      {/* 날짜 선택 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <span className="text-2xl">◀</span>
          </button>
          <div className="text-center">
            <p className="text-sm text-gray-600">날짜 선택</p>
            <p className="text-xl font-bold text-gray-800">{formatDate(selectedDate)}</p>
          </div>
          <button
            onClick={() => changeDate(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <span className="text-2xl">▶</span>
          </button>
        </div>
      </div>

      {/* 식단 기록 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🍽️</span>
          식단 기록
        </h2>
        <div className="space-y-4">
          {mealTypes.map(({ type, label }) => {
            const records = getMealRecords(type);
            const totalCal = getTotalCalories(type);

            return (
              <div key={type} className="border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                    {label} ({totalCal} kcal)
                  </h3>
                </div>
                <div className="space-y-2 mb-3">
                  {records.map((record) => (
                    <div key={record.id} className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      {record.foods.map((food, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-gray-700 dark:text-gray-300">
                            ├─ {food.name} ({food.amount}{food.unit})
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {food.calories} kcal
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setIsMealFormOpen(true)}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                >
                  + 식사 추가
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 운동 기록 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">💪</span>
          운동 기록
        </h2>
        <div className="space-y-3">
          {getTodayExercises().map((log) => (
            <div key={log.id} className="border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">
                    {log.exerciseName} {log.durationMinutes}분 ({log.caloriesBurned} kcal)
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    강도: {log.intensity}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {getTodayExercises().length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              오늘 기록된 운동이 없습니다
            </p>
          )}
          <button
            onClick={() => setIsExerciseFormOpen(true)}
            className="w-full text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 transition"
          >
            + 운동 추가
          </button>
        </div>
      </div>

      {/* 수분 섭취 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
          <span className="mr-2">💧</span>
          수분 섭취
        </h2>

        {/* 물컵 표시 */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`w-10 h-10 rounded-full text-2xl flex items-center justify-center transition ${
                i < waterGlasses ? 'opacity-100 scale-110' : 'opacity-30'
              }`}
            >
              💧
            </div>
          ))}
        </div>

        {/* +/- 버튼 */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          <button
            onClick={handleRemoveWater}
            disabled={waterGlasses === 0}
            className="flex items-center justify-center w-12 h-12 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-full text-2xl font-bold transition shadow-md hover:shadow-lg"
            title="물 제거 (250ml)"
          >
            −
          </button>

          <div className="text-center px-6">
            <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
              {waterGlasses}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">잔</p>
          </div>

          <button
            onClick={handleAddWater}
            disabled={waterGlasses >= 8}
            className="flex items-center justify-center w-12 h-12 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-full text-2xl font-bold transition shadow-md hover:shadow-lg"
            title="물 추가 (250ml)"
          >
            +
          </button>
        </div>

        {/* 정보 표시 */}
        <div className="text-center mb-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {waterGlasses}잔 / 8잔
            <span className="mx-2">•</span>
            {(waterGlasses * 250)}ml / 2,000ml
          </p>
        </div>

        {/* 진행률 바 */}
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-4 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
            style={{ width: `${Math.min(100, (waterGlasses / 8) * 100)}%` }}
          >
            {waterGlasses > 0 && (
              <span className="text-xs text-white font-bold">
                {Math.round((waterGlasses / 8) * 100)}%
              </span>
            )}
          </div>
        </div>

        {/* 도움말 */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-300">
            💡 <strong>팁:</strong> 하루 8잔(2리터)의 물을 마시면 건강에 좋습니다.
            한 잔은 약 250ml입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
