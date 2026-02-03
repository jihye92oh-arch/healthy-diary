import { User, FoodItem } from '../types';

/**
 * BMR (Basal Metabolic Rate) 계산
 * Mifflin-St Jeor 공식 사용
 *
 * 남성: 10 × 체중(kg) + 6.25 × 키(cm) - 5 × 나이 + 5
 * 여성: 10 × 체중(kg) + 6.25 × 키(cm) - 5 × 나이 - 161
 */
export function calculateBMR(user: User): number {
  const age = new Date().getFullYear() - new Date(user.birthDate).getFullYear();

  let bmr = 10 * user.currentWeight + 6.25 * user.height - 5 * age;

  if (user.gender === 'male') {
    bmr += 5;
  } else if (user.gender === 'female') {
    bmr -= 161;
  } else {
    // 기타 성별은 평균값 사용
    bmr -= 78; // (5 + (-161)) / 2
  }

  // 항상 반올림 사용 (버림 금지)
  return Math.round(bmr);
}

/**
 * TDEE (Total Daily Energy Expenditure) 계산
 * BMR × 활동 계수
 */
export function calculateTDEE(user: User): number {
  const bmr = calculateBMR(user);

  const activityMultipliers = {
    sedentary: 1.2,      // 거의 운동 안함
    light: 1.375,        // 가벼운 운동 (주 1-3회)
    moderate: 1.55,      // 보통 운동 (주 3-5회)
    active: 1.725,       // 적극적 운동 (주 6-7회)
    very_active: 1.9,    // 매우 적극적 (하루 2회 운동)
  };

  const multiplier = activityMultipliers[user.activityLevel] || 1.2;
  const tdee = bmr * multiplier;

  // 항상 반올림 사용
  return Math.round(tdee);
}

/**
 * 음식 아이템의 총 칼로리 계산
 */
export function calculateFoodCalories(food: FoodItem): number {
  // 이미 calories가 있으면 그대로 반환 (반올림)
  if (food.calories) {
    return Math.round(food.calories);
  }

  // calories가 없으면 0 반환 (추후 DB 조회로 대체)
  return 0;
}

/**
 * 음식 목록의 총 칼로리 계산
 */
export function calculateTotalCalories(foods: FoodItem[]): number {
  const total = foods.reduce((sum, food) => sum + calculateFoodCalories(food), 0);

  // 항상 반올림 사용
  return Math.round(total);
}

/**
 * 운동으로 소모된 칼로리 계산
 *
 * @param durationMinutes 운동 시간 (분)
 * @param caloriesPerMinute 분당 소모 칼로리
 */
export function calculateExerciseCalories(
  durationMinutes: number,
  caloriesPerMinute: number
): number {
  const total = durationMinutes * caloriesPerMinute;

  // 항상 반올림 사용
  return Math.round(total);
}

/**
 * 목표 칼로리 계산
 *
 * @param currentWeight 현재 체중 (kg)
 * @param targetWeight 목표 체중 (kg)
 * @param targetDate 목표 날짜
 * @param tdee 일일 총 소비 칼로리
 */
export function calculateTargetCalories(
  currentWeight: number,
  targetWeight: number,
  targetDate: Date,
  tdee: number
): number {
  const weightDiff = currentWeight - targetWeight; // 감량할 체중 (kg)
  const daysToGoal = Math.max(
    1,
    Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  );

  // 1kg 감량 = 약 7700 kcal 적자
  const totalCalorieDeficit = weightDiff * 7700;
  const dailyDeficit = totalCalorieDeficit / daysToGoal;

  // 목표 일일 칼로리 = TDEE - 일일 적자
  const targetCalories = tdee - dailyDeficit;

  // 너무 낮은 칼로리는 건강에 해로우므로 최소값 설정 (1200 kcal)
  const minCalories = 1200;
  const result = Math.max(minCalories, targetCalories);

  // 항상 반올림 사용
  return Math.round(result);
}

/**
 * 일일 진행률 계산 (%)
 */
export function calculateDailyProgress(
  consumedCalories: number,
  targetCalories: number
): number {
  if (targetCalories === 0) return 0;

  const progress = (consumedCalories / targetCalories) * 100;

  // 항상 반올림 사용
  return Math.round(progress);
}
