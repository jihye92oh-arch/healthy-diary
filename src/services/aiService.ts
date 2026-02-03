import { Recommendation, User, Goal, Season } from '../types';
import { getCurrentSeason, getSeasonalIngredients } from '../utils/seasonUtils';
import { getMenusBySeason, getMenusByCalories, getRandomMenus, FoodMenu } from '../data/foodDatabase';

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
  const difficulty = user?.activityLevel === 'sedentary' || user?.activityLevel === 'light'
    ? 'easy'
    : user?.activityLevel === 'very_active'
    ? 'hard'
    : 'medium';

  // Mock 추천
  const indoorExercises: Recommendation[] = [
    {
      id: '1',
      type: 'exercise',
      title: '홈 트레이닝 (스쿼트, 플랭크, 버피)',
      description: '집에서 쉽게 할 수 있는 전신 운동',
      calories: 250,
      duration: 30,
      difficulty,
    },
    {
      id: '2',
      type: 'exercise',
      title: '요가 (초급)',
      description: '유연성과 근력을 동시에 기르는 요가',
      calories: 180,
      duration: 40,
      difficulty: 'easy',
    },
    {
      id: '3',
      type: 'exercise',
      title: '실내 자전거',
      description: '유산소 운동의 정석, 실내 자전거',
      calories: 300,
      duration: 30,
      difficulty: 'medium',
    },
  ];

  const outdoorExercises: Recommendation[] = currentSeason === 'winter'
    ? [
        {
          id: '4',
          type: 'exercise',
          title: '가벼운 산책',
          description: '날씨가 좋은 날 20분 산책',
          calories: 120,
          duration: 20,
          difficulty: 'easy',
        },
        {
          id: '5',
          type: 'exercise',
          title: '겨울 등산',
          description: '따뜻한 옷을 입고 가까운 산 오르기',
          calories: 400,
          duration: 60,
          difficulty: 'medium',
        },
      ]
    : [
        {
          id: '4',
          type: 'exercise',
          title: '조깅',
          description: '공원이나 운동장에서 30분 조깅',
          calories: 300,
          duration: 30,
          difficulty: 'medium',
        },
        {
          id: '5',
          type: 'exercise',
          title: '등산',
          description: '주말에 가까운 산 등반',
          calories: 450,
          duration: 60,
          difficulty: 'hard',
        },
      ];

  return isIndoor ? indoorExercises : outdoorExercises;
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
