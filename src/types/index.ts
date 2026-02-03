// 사용자 관련 타입
export interface User {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  birthDate: Date;
  height: number; // cm
  currentWeight: number; // kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  createdAt: Date;
}

// 목표 관련 타입
export interface Goal {
  id: string;
  userId: string;
  initialWeight?: number; // kg - 목표 설정 시 시작 체중
  targetWeight: number; // kg
  targetDate: Date;
  dailyCalorieGoal: number; // kcal
  weeklyExerciseGoal: number; // 횟수
  dailyWaterGoal: number; // ml
  createdAt: Date;
}

// 식사 타입
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// 음식 아이템
export interface FoodItem {
  id?: string;
  name: string;
  amount: number;
  unit: 'g' | 'ml' | 'ea';
  calories: number;
  protein?: number; // g
  carbs?: number; // g
  fat?: number; // g
}

// 식단 기록
export interface DietRecord {
  id: string;
  userId: string;
  date: Date;
  mealType: MealType;
  foods: FoodItem[];
  totalCalories: number;
  createdAt: Date;
}

// 운동 강도
export type ExerciseIntensity = 'low' | 'medium' | 'high';

// 운동 기록
export interface ExerciseLog {
  id: string;
  userId: string;
  date: Date;
  exerciseName: string;
  durationMinutes: number;
  caloriesBurned: number;
  intensity: ExerciseIntensity;
  createdAt: Date;
}

// 체중 기록
export interface WeightLog {
  id: string;
  userId: string;
  date: Date;
  weight: number; // kg
  createdAt: Date;
}

// 수분 섭취 기록
export interface WaterLog {
  id: string;
  userId: string;
  date: Date;
  amountMl: number;
  createdAt: Date;
}

// 음식 데이터베이스
export type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'all';

export interface Food {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  category: string;
  season: Season;
}

// 운동 데이터베이스
export type ExerciseCategory = 'cardio' | 'strength' | 'flexibility';

export interface Exercise {
  id: string;
  name: string;
  caloriesPerMinute: number;
  category: ExerciseCategory;
  indoor: boolean;
  outdoor: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

// 대시보드 데이터
export interface DailySummary {
  date: Date;
  totalCaloriesConsumed: number;
  totalCaloriesBurned: number;
  remainingCalories: number;
  waterIntakeMl: number;
  targetCalories: number;
  targetWaterMl: number;
  progressPercentage: number;
}

// 날씨 정보
export interface WeatherInfo {
  temperature: number; // °C
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  description: string;
}

// AI 추천
export interface Recommendation {
  id: string;
  type: 'diet' | 'exercise';
  title: string;
  description: string;
  calories?: number;
  ingredients?: string[];
  duration?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  cookingSteps?: string[]; // 조리 방법
  cookingTime?: number; // 조리 시간 (분)
  nutrients?: {
    protein: number;
    carbs: number;
    fat: number;
  };
}
