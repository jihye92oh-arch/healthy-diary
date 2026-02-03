import { Recommendation, User, Goal, Season } from '../types';
import { getCurrentSeason, getSeasonalIngredients } from '../utils/seasonUtils';
import { getMenusBySeason, getMenusByCalories, getRandomMenus, FoodMenu } from '../data/foodDatabase';
import { exerciseDatabase, calculateCaloriesByWeight, ExerciseData } from '../data/exerciseDatabase';

/**
 * FoodMenu를 Recommendation 형식으로 변환
 */
function convertMenuToRecommendation(menu: FoodMenu): Recommendation {
  return {
    id: menu.id,
    type: 'diet',
    title: menu.name,
    description: menu.description || `${menu.category} 메뉴로 ${menu.calories}kcal`,
    calories: menu.calories,
    ingredients: menu.ingredients,
    difficulty: menu.difficulty === '쉬움' ? 'easy' : menu.difficulty === '어려움' ? 'hard' : 'medium',
    cookingSteps: menu.cookingSteps,
    cookingTime: menu.cookingTime,
    nutrients: {
      protein: menu.protein,
      carbs: menu.carbs,
      fat: menu.fat,
    },
  };
}

/**
 * AI 기반 식단 추천
 *
 * @param user 사용자 정보
 * @param goal 목표 정보
 * @param season 계절 (선택사항, 기본값: 현재 계절)
 */
export async function generateDietRecommendations(
  user: User | null,
  goal: Goal | null,
  season?: Season
): Promise<Recommendation[]> {
  const currentSeason = season || getCurrentSeason();

  // 목표 칼로리 기준
  const targetCalories = goal?.dailyCalorieGoal || 2000;
  const mealCalories = Math.round(targetCalories / 3); // 1끼 기준

  // 계절 맵핑
  const seasonMap: { [key: string]: string } = {
    spring: '봄',
    summer: '여름',
    fall: '가을',
    winter: '겨울',
  };

  // 1. 계절에 맞는 메뉴 가져오기
  const seasonalMenus = getMenusBySeason(seasonMap[currentSeason]);

  // 2. 칼로리 범위에 맞는 메뉴 필터링 (1끼 기준: ±200kcal)
  const calorieFilteredMenus = seasonalMenus.filter(
    menu => menu.calories >= mealCalories - 200 && menu.calories <= mealCalories + 200
  );

  // 3. 메뉴가 충분하지 않으면 전체 메뉴에서 칼로리 기준으로 선택
  const selectedMenus = calorieFilteredMenus.length >= 3
    ? getRandomMenus(3, undefined).filter(
        menu => calorieFilteredMenus.some(cm => cm.id === menu.id)
      )
    : getMenusByCalories(mealCalories - 200, mealCalories + 200).slice(0, 3);

  // 4. 최종적으로 3개 미만이면 랜덤으로 채우기
  const finalMenus = selectedMenus.length >= 3
    ? selectedMenus.slice(0, 3)
    : [...selectedMenus, ...getRandomMenus(3 - selectedMenus.length)];

  // 5. Recommendation 형식으로 변환
  return finalMenus.map(convertMenuToRecommendation);
}

/**
 * ExerciseData를 Recommendation 형식으로 변환
 */
function convertExerciseToRecommendation(
  exercise: ExerciseData,
  user: User | null,
  duration: number
): Recommendation {
  const userWeight = user?.weight || 70; // 기본 70kg
  const calories = calculateCaloriesByWeight(exercise.met, userWeight, duration);

  const difficultyMap: { [key: string]: 'easy' | 'medium' | 'hard' } = {
    '쉬움': 'easy',
    '보통': 'medium',
    '어려움': 'hard',
  };

  return {
    id: exercise.id,
    type: 'exercise',
    title: exercise.name,
    description: exercise.description,
    calories,
    duration,
    difficulty: difficultyMap[exercise.difficulty],
  };
}

/**
 * 배열에서 랜덤하게 N개 선택
 */
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * AI 기반 운동 추천
 *
 * @param user 사용자 정보
 * @param goal 목표 정보
 * @param season 계절
 * @param isIndoor 실내 운동 여부
 */
export async function generateExerciseRecommendations(
  user: User | null,
  goal: Goal | null,
  season?: Season,
  isIndoor: boolean = true
): Promise<Recommendation[]> {
  const currentSeason = season || getCurrentSeason();

  // 사용자 활동 수준에 따른 난이도 조정
  const userDifficulty = user?.activityLevel === 'sedentary' || user?.activityLevel === 'light'
    ? '쉬움'
    : user?.activityLevel === 'very_active'
    ? '어려움'
    : '보통';

  let availableExercises: ExerciseData[];

  if (isIndoor) {
    // 실내 운동: 근력, 요가, 필라테스 등
    availableExercises = exerciseDatabase.filter(ex =>
      ex.category === '근력' ||
      ex.category === '기타' ||
      (ex.category === '유산소' && ['줄넘기', '에어로빅'].includes(ex.name))
    );
  } else {
    // 실외 운동: 유산소, 스포츠 위주
    if (currentSeason === 'winter') {
      // 겨울: 가벼운 유산소 위주 (걷기, 등산 등)
      availableExercises = exerciseDatabase.filter(ex =>
        ['걷기 (느린 속도)', '걷기 (빠른 속도)', '등산', '조깅'].includes(ex.name)
      );
    } else {
      // 다른 계절: 다양한 실외 활동
      availableExercises = exerciseDatabase.filter(ex =>
        ex.category === '유산소' || ex.category === '스포츠'
      );
    }
  }

  // 난이도 필터링 (사용자 난이도와 한 단계 차이까지 허용)
  const difficultyLevels: { [key: string]: number } = {
    '쉬움': 1,
    '보통': 2,
    '어려움': 3,
  };
  const userLevel = difficultyLevels[userDifficulty];

  const filteredExercises = availableExercises.filter(ex => {
    const exLevel = difficultyLevels[ex.difficulty];
    return Math.abs(exLevel - userLevel) <= 1; // ±1 단계 허용
  });

  // 최소 3개 이상 확보
  const finalExercises = filteredExercises.length >= 3
    ? filteredExercises
    : availableExercises;

  // 랜덤하게 3개 선택
  const selectedExercises = getRandomItems(finalExercises, 3);

  // 운동 시간 설정 (난이도에 따라)
  const durations = selectedExercises.map(ex => {
    if (ex.difficulty === '쉬움') return 40;
    if (ex.difficulty === '어려움') return 20;
    return 30;
  });

  // Recommendation 형식으로 변환
  return selectedExercises.map((ex, idx) =>
    convertExerciseToRecommendation(ex, user, durations[idx])
  );
}

/**
 * AI 맞춤 조언 생성
 *
 * @param user 사용자 정보
 * @param goal 목표 정보
 * @param recentCalories 최근 칼로리 섭취량
 * @param recentExercise 최근 운동 빈도
 */
export async function generatePersonalizedAdvice(
  user: User | null,
  goal: Goal | null,
  recentCalories?: number,
  recentExercise?: number
): Promise<string[]> {
  const advice: string[] = [];

  // 칼로리 섭취 분석
  if (recentCalories && goal) {
    const diff = recentCalories - goal.dailyCalorieGoal;
    if (diff > 300) {
      advice.push(
        `최근 목표보다 ${Math.round(diff)}kcal 더 섭취했습니다. 저녁 식사량을 조금 줄여보세요.`
      );
    } else if (diff < -300) {
      advice.push(
        `목표보다 ${Math.abs(Math.round(diff))}kcal 적게 섭취하고 있습니다. 너무 무리한 다이어트는 건강에 해로울 수 있어요.`
      );
    } else {
      advice.push('목표 칼로리를 잘 지키고 있습니다. 계속 이 페이스를 유지하세요!');
    }
  }

  // 운동 빈도 분석
  if (recentExercise !== undefined && goal) {
    if (recentExercise < goal.weeklyExerciseGoal) {
      advice.push(
        `이번 주 운동 ${recentExercise}회로 목표에 조금 부족합니다. ${
          goal.weeklyExerciseGoal - recentExercise
        }회 더 운동하면 목표 달성!`
      );
    } else {
      advice.push('주간 운동 목표를 달성했습니다! 훌륭해요! 💪');
    }
  }

  // 계절별 조언
  const season = getCurrentSeason();
  if (season === 'winter') {
    advice.push('겨울철에는 따뜻한 국물 요리와 뿌리채소로 체온을 유지하세요.');
    advice.push('추운 날씨에는 홈트레이닝으로 꾸준히 운동하는 것이 중요합니다.');
  } else if (season === 'summer') {
    advice.push('더운 여름, 수분 섭취를 충분히 하세요. 하루 2L 이상 물을 마시세요.');
  } else if (season === 'spring') {
    advice.push('봄나물로 비타민을 보충하고, 야외 활동을 늘려보세요.');
  } else {
    advice.push('가을은 운동하기 좋은 계절입니다. 등산이나 트레킹을 추천합니다.');
  }

  return advice;
}
