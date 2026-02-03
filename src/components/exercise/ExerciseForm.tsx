import { useState, useMemo } from 'react';
import { ExerciseLog, ExerciseIntensity } from '../../types';
import { useApp } from '../../contexts/AppContext';
import Modal from '../common/Modal';
import { exerciseDatabase, calculateCaloriesByWeight, ExerciseData } from '../../data/exerciseDatabase';

interface ExerciseFormProps {
  isOpen: boolean;
  onClose: () => void;
  date?: Date;
}

export default function ExerciseForm({ isOpen, onClose, date = new Date() }: ExerciseFormProps) {
  const { user, addExerciseLog } = useApp();
  const [selectedExercise, setSelectedExercise] = useState<ExerciseData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [intensity, setIntensity] = useState<ExerciseIntensity>('medium');

  // 검색 필터링
  const filteredExercises = useMemo(() => {
    if (!searchQuery) return exerciseDatabase;
    const query = searchQuery.toLowerCase();
    return exerciseDatabase.filter(
      ex => ex.name.toLowerCase().includes(query) ||
           ex.description.toLowerCase().includes(query) ||
           ex.category.includes(query)
    );
  }, [searchQuery]);

  // 체중 기반 칼로리 계산
  const estimatedCalories = useMemo(() => {
    if (!selectedExercise || !user) return 0;
    return calculateCaloriesByWeight(
      selectedExercise.met,
      user.currentWeight,
      durationMinutes
    );
  }, [selectedExercise, user, durationMinutes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedExercise) {
      alert('운동을 선택해주세요.');
      return;
    }

    if (!user) {
      alert('사용자 정보를 먼저 설정해주세요.');
      return;
    }

    const newLog: ExerciseLog = {
      id: Date.now().toString(),
      userId: user.id,
      date: date,
      exerciseName: selectedExercise.name,
      durationMinutes,
      caloriesBurned: estimatedCalories,
      intensity,
      createdAt: new Date(),
    };

    addExerciseLog(newLog);

    // Reset form
    setSelectedExercise(null);
    setSearchQuery('');
    setDurationMinutes(30);
    setIntensity('medium');
    onClose();
    alert(`${estimatedCalories}kcal 소모 운동이 기록되었습니다!`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="운동 추가">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 운동 검색 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            운동 검색
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="운동 이름 검색..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 운동 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            운동 선택 {selectedExercise && `(${selectedExercise.category})`}
          </label>
          <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
            {filteredExercises.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                onClick={() => setSelectedExercise(exercise)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                  selectedExercise?.id === exercise.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500'
                    : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {exercise.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {exercise.description} · {exercise.category} · {exercise.difficulty}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    MET: {exercise.met}
                  </span>
                </div>
              </button>
            ))}
          </div>
          {selectedExercise && (
            <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
              ✓ 선택됨: {selectedExercise.name}
            </p>
          )}
        </div>

        {/* 운동 시간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            운동 시간 (분)
          </label>
          <input
            type="number"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            min="1"
            step="5"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 예상 소모 칼로리 */}
        {selectedExercise && user && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">예상 소모 칼로리</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {estimatedCalories} kcal
            </p>
            <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <p>• 체중: {user.currentWeight}kg</p>
              <p>• MET: {selectedExercise.met}</p>
              <p>• 시간: {durationMinutes}분</p>
              <p className="text-gray-500 dark:text-gray-500 mt-2">
                * MET 값과 체중을 기반으로 한 과학적 계산값입니다
              </p>
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            취소
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
          >
            저장
          </button>
        </div>
      </form>
    </Modal>
  );
}
