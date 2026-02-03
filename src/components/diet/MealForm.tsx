import { useState } from 'react';
import { MealType, FoodItem, DietRecord } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { calculateTotalCalories } from '../../services/calorieService';
import Modal from '../common/Modal';

interface MealFormProps {
  isOpen: boolean;
  onClose: () => void;
  date?: Date;
}

export default function MealForm({ isOpen, onClose, date = new Date() }: MealFormProps) {
  const { user, addDietRecord } = useApp();
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [currentFood, setCurrentFood] = useState({
    name: '',
    amount: 0,
    unit: 'g' as 'g' | 'ml' | 'ea',
    calories: 0,
  });

  const handleAddFood = () => {
    if (currentFood.name && currentFood.amount > 0 && currentFood.calories > 0) {
      setFoods([...foods, { ...currentFood, id: Date.now().toString() }]);
      setCurrentFood({ name: '', amount: 0, unit: 'g', calories: 0 });
    }
  };

  const handleRemoveFood = (id: string) => {
    setFoods(foods.filter((f) => f.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (foods.length === 0) {
      alert('음식을 추가해주세요.');
      return;
    }

    if (!user) {
      alert('사용자 정보를 먼저 설정해주세요.');
      return;
    }

    const totalCalories = calculateTotalCalories(foods);

    const newRecord: DietRecord = {
      id: Date.now().toString(),
      userId: user.id,
      date: date,
      mealType,
      foods,
      totalCalories,
      createdAt: new Date(),
    };

    addDietRecord(newRecord);

    // Reset form
    setFoods([]);
    setMealType('breakfast');
    onClose();
    alert(`${totalCalories}kcal 식사가 기록되었습니다!`);
  };

  const totalCalories = calculateTotalCalories(foods);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="식사 추가">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 식사 유형 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            식사 유형
          </label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="breakfast">아침</option>
            <option value="lunch">점심</option>
            <option value="dinner">저녁</option>
            <option value="snack">간식</option>
          </select>
        </div>

        {/* 음식 추가 */}
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">음식 추가</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <input
                type="text"
                placeholder="음식 이름"
                value={currentFood.name}
                onChange={(e) => setCurrentFood({ ...currentFood, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="양"
                value={currentFood.amount || ''}
                onChange={(e) => setCurrentFood({ ...currentFood, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <select
                value={currentFood.unit}
                onChange={(e) => setCurrentFood({ ...currentFood, unit: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="ea">개</option>
              </select>
            </div>
            <div className="col-span-2">
              <input
                type="number"
                placeholder="칼로리 (kcal)"
                value={currentFood.calories || ''}
                onChange={(e) => setCurrentFood({ ...currentFood, calories: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddFood}
            className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition"
          >
            + 음식 추가
          </button>
        </div>

        {/* 추가된 음식 목록 */}
        {foods.length > 0 && (
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">추가된 음식</h4>
            <div className="space-y-2">
              {foods.map((food) => (
                <div
                  key={food.id}
                  className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded"
                >
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {food.name} ({food.amount}{food.unit})
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">{food.calories} kcal</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFood(food.id!)}
                    className="text-red-500 hover:text-red-700"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
              <p className="font-bold text-gray-900 dark:text-gray-100">
                총 칼로리: {totalCalories} kcal
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
