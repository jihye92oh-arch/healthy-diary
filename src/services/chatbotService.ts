import { User, Goal, DietRecord, ExerciseLog } from '../types';
import { calculateBMR, calculateTDEE } from './calorieService';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UserContext {
  user: User | null;
  goal: Goal | null;
  dietRecords: DietRecord[];
  exerciseLogs: ExerciseLog[];
}

/**
 * AI 챗봇 응답 생성
 * 사용자 데이터를 분석하여 맞춤형 조언 제공
 */
export async function sendChatMessage(
  message: string,
  context: UserContext
): Promise<string> {
  const { user, goal, dietRecords, exerciseLogs } = context;

  // 사용자 데이터 분석
  const analysis = analyzeUserData(context);

  // 질문 유형 분류
  const questionType = classifyQuestion(message);

  // 질문 유형에 따라 응답 생성
  return generateResponse(message, questionType, analysis, context);
}

/**
 * 사용자 데이터 분석
 */
function analyzeUserData(context: UserContext) {
  const { user, goal, dietRecords, exerciseLogs } = context;

  if (!user || !goal) {
    return {
      hasUserData: false,
      todayCalories: 0,
      todayExercise: 0,
      weeklyAverage: 0,
      bmr: 0,
      tdee: 0,
    };
  }

  const today = new Date().toISOString().split('T')[0];
  const todayDiet = dietRecords.filter(
    (r) => new Date(r.date).toISOString().split('T')[0] === today
  );
  const todayExercise = exerciseLogs.filter(
    (l) => new Date(l.date).toISOString().split('T')[0] === today
  );

  const todayCalories = todayDiet.reduce((sum, r) => sum + r.totalCalories, 0);
  const todayExerciseCalories = todayExercise.reduce((sum, l) => sum + l.caloriesBurned, 0);

  // 최근 7일 평균
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyDiet = dietRecords.filter((r) => new Date(r.date) >= weekAgo);
  const weeklyAverage = weeklyDiet.length > 0
    ? weeklyDiet.reduce((sum, r) => sum + r.totalCalories, 0) / 7
    : 0;

  const bmr = calculateBMR(user);
  const tdee = calculateTDEE(user);

  return {
    hasUserData: true,
    todayCalories,
    todayExercise: todayExerciseCalories,
    weeklyAverage: Math.round(weeklyAverage),
    bmr,
    tdee,
    targetCalories: goal.dailyCalorieGoal,
    targetWeight: goal.targetWeight,
    currentWeight: user.currentWeight,
    remainingCalories: goal.dailyCalorieGoal - todayCalories + todayExerciseCalories,
  };
}

/**
 * 질문 유형 분류
 */
function classifyQuestion(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('식단') || lowerMessage.includes('음식') ||
      lowerMessage.includes('먹') || lowerMessage.includes('점심') ||
      lowerMessage.includes('저녁') || lowerMessage.includes('아침')) {
    return 'diet';
  }

  if (lowerMessage.includes('운동') || lowerMessage.includes('달리') ||
      lowerMessage.includes('헬스') || lowerMessage.includes('트레이닝')) {
    return 'exercise';
  }

  if (lowerMessage.includes('칼로리') || lowerMessage.includes('섭취')) {
    return 'calories';
  }

  if (lowerMessage.includes('목표') || lowerMessage.includes('체중') ||
      lowerMessage.includes('감량') || lowerMessage.includes('달성')) {
    return 'goal';
  }

  if (lowerMessage.includes('단백질') || lowerMessage.includes('탄수화물') ||
      lowerMessage.includes('영양소')) {
    return 'nutrition';
  }

  if (lowerMessage.includes('물') || lowerMessage.includes('수분')) {
    return 'water';
  }

  return 'general';
}

/**
 * 응답 생성
 */
function generateResponse(
  message: string,
  type: string,
  analysis: any,
  context: UserContext
): string {
  if (!analysis.hasUserData) {
    return '아직 개인 정보가 설정되지 않았습니다. 먼저 "목표" 탭에서 개인 정보와 목표를 설정해주세요!';
  }

  switch (type) {
    case 'diet':
      return generateDietAdvice(analysis, context);
    case 'exercise':
      return generateExerciseAdvice(analysis, context);
    case 'calories':
      return generateCalorieAdvice(analysis);
    case 'goal':
      return generateGoalAdvice(analysis, context);
    case 'nutrition':
      return generateNutritionAdvice(analysis);
    case 'water':
      return generateWaterAdvice();
    default:
      return generateGeneralAdvice(analysis, context);
  }
}

/**
 * 식단 조언 생성
 */
function generateDietAdvice(analysis: any, context: UserContext): string {
  const { todayCalories, targetCalories, remainingCalories } = analysis;
  const currentSeason = getCurrentSeason();

  let advice = `오늘 현재까지 ${todayCalories}kcal를 섭취하셨네요. 목표는 ${targetCalories}kcal이므로, `;

  if (remainingCalories > 500) {
    advice += `앞으로 약 ${remainingCalories}kcal를 더 섭취하실 수 있습니다.\n\n`;
    advice += `🥗 추천 식단 (${currentSeason} 계절 메뉴):\n`;

    if (currentSeason === '겨울') {
      advice += `• 따뜻한 된장찌개와 현미밥 (약 400kcal)\n`;
      advice += `• 닭가슴살 샐러드 (약 300kcal)\n`;
      advice += `• 고구마 1개 + 삶은 계란 (약 250kcal)`;
    } else if (currentSeason === '여름') {
      advice += `• 냉국수와 채소 (약 400kcal)\n`;
      advice += `• 샐러드 볼 with 연어 (약 350kcal)\n`;
      advice += `• 수박 + 그릭요거트 (약 200kcal)`;
    } else {
      advice += `• 비빔밥 (약 500kcal)\n`;
      advice += `• 토마토 계란 볶음밥 (약 400kcal)\n`;
      advice += `• 닭가슴살 샌드위치 (약 350kcal)`;
    }
  } else if (remainingCalories > 0) {
    advice += `앞으로 약 ${remainingCalories}kcal만 섭취하시면 됩니다.\n\n`;
    advice += `💡 가벼운 간식 추천:\n`;
    advice += `• 바나나 1개 (약 100kcal)\n`;
    advice += `• 아몬드 한 줌 (약 150kcal)\n`;
    advice += `• 저지방 우유 1컵 (약 80kcal)`;
  } else {
    advice += `이미 목표 칼로리를 초과하셨습니다.\n\n`;
    advice += `💪 추천 대응:\n`;
    advice += `• 가벼운 운동으로 칼로리 소모 (산책 30분)\n`;
    advice += `• 내일은 조금 더 조절해보세요\n`;
    advice += `• 물을 충분히 마시세요`;
  }

  return advice;
}

/**
 * 운동 조언 생성
 */
function generateExerciseAdvice(analysis: any, context: UserContext): string {
  const { todayExercise, remainingCalories } = analysis;

  let advice = `오늘 ${todayExercise}kcal를 소모하셨습니다.\n\n`;

  if (remainingCalories < 0) {
    const needToBurn = Math.abs(remainingCalories);
    advice += `목표 칼로리를 ${Math.abs(remainingCalories)}kcal 초과했습니다.\n\n`;
    advice += `💪 추천 운동 (${needToBurn}kcal 소모):\n`;

    if (needToBurn > 300) {
      advice += `• 조깅 40분 (약 ${Math.round(needToBurn * 0.7)}kcal)\n`;
      advice += `• 자전거 50분 (약 ${Math.round(needToBurn * 0.8)}kcal)\n`;
      advice += `• 수영 30분 (약 ${Math.round(needToBurn * 0.9)}kcal)`;
    } else {
      advice += `• 빠르게 걷기 30분 (약 ${Math.round(needToBurn * 0.8)}kcal)\n`;
      advice += `• 계단 오르기 20분 (약 ${Math.round(needToBurn * 0.9)}kcal)\n`;
      advice += `• 줄넘기 15분 (약 ${needToBurn}kcal)`;
    }
  } else {
    advice += `✅ 현재 칼로리 균형이 좋습니다!\n\n`;
    advice += `💡 건강 유지 운동 추천:\n`;
    advice += `• 스트레칭 15분 (유연성 향상)\n`;
    advice += `• 플랭크 + 스쿼트 (근력 강화)\n`;
    advice += `• 요가 20분 (스트레스 해소)`;
  }

  return advice;
}

/**
 * 칼로리 조언 생성
 */
function generateCalorieAdvice(analysis: any): string {
  const { todayCalories, targetCalories, weeklyAverage, bmr, tdee } = analysis;
  const diff = todayCalories - targetCalories;
  const percentOfTarget = Math.round((todayCalories / targetCalories) * 100);

  let advice = `📊 칼로리 분석:\n\n`;
  advice += `• 오늘 섭취: ${todayCalories}kcal\n`;
  advice += `• 목표: ${targetCalories}kcal\n`;
  advice += `• 달성률: ${percentOfTarget}%\n`;
  advice += `• 주간 평균: ${weeklyAverage}kcal\n\n`;

  advice += `🔬 대사량 정보:\n`;
  advice += `• 기초대사량(BMR): ${bmr}kcal\n`;
  advice += `• 일일소비량(TDEE): ${tdee}kcal\n\n`;

  if (Math.abs(diff) < 100) {
    advice += `✅ 완벽합니다! 목표 칼로리를 잘 지키고 계십니다.`;
  } else if (diff > 0) {
    advice += `⚠️ 목표보다 ${diff}kcal 초과했습니다.\n`;
    advice += `운동으로 추가 소모하거나 내일 조절하세요.`;
  } else {
    advice += `💡 목표보다 ${Math.abs(diff)}kcal 부족합니다.\n`;
    advice += `건강한 간식으로 보충하는 것을 추천합니다.`;
  }

  return advice;
}

/**
 * 목표 조언 생성
 */
function generateGoalAdvice(analysis: any, context: UserContext): string {
  const { currentWeight, targetWeight } = analysis;
  const { goal } = context;

  if (!goal) return '목표가 설정되지 않았습니다.';

  const weightDiff = currentWeight - targetWeight;
  const daysToTarget = Math.ceil(
    (new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  let advice = `🎯 목표 분석:\n\n`;
  advice += `• 현재 체중: ${currentWeight}kg\n`;
  advice += `• 목표 체중: ${targetWeight}kg\n`;
  advice += `• 감량 필요: ${weightDiff.toFixed(1)}kg\n`;
  advice += `• 남은 기간: ${daysToTarget}일\n\n`;

  if (daysToTarget > 0) {
    const weeklyRate = (weightDiff / daysToTarget) * 7;
    advice += `📈 권장 진행 속도:\n`;
    advice += `• 주당 ${weeklyRate.toFixed(2)}kg 감량\n\n`;

    if (weeklyRate > 1) {
      advice += `⚠️ 목표가 다소 빠릅니다. 건강을 위해 주당 0.5~1kg 감량을 권장합니다.\n`;
      advice += `목표 날짜를 조정하거나, 운동을 병행하세요.`;
    } else if (weeklyRate < 0.3) {
      advice += `💡 여유롭게 진행하고 계십니다. 꾸준히 실천하면 충분히 달성 가능합니다!`;
    } else {
      advice += `✅ 적절한 속도입니다! 이대로 꾸준히 실천하세요.`;
    }
  } else {
    advice += `⏰ 목표 날짜가 지났습니다. 새로운 목표를 설정해보세요!`;
  }

  return advice;
}

/**
 * 영양소 조언 생성
 */
function generateNutritionAdvice(analysis: any): string {
  return `🥗 영양소 균형 팁:\n\n` +
    `• 단백질: 체중 1kg당 1.2~1.6g 권장\n` +
    `  (닭가슴살, 계란, 두부, 생선)\n\n` +
    `• 탄수화물: 전체 칼로리의 45~60%\n` +
    `  (현미, 고구마, 귀리, 통곡물)\n\n` +
    `• 지방: 전체 칼로리의 20~30%\n` +
    `  (견과류, 아보카도, 올리브유)\n\n` +
    `💡 다양한 색깔의 채소를 섭취하면 비타민과 미네랄을 골고루 얻을 수 있습니다!`;
}

/**
 * 수분 조언 생성
 */
function generateWaterAdvice(): string {
  return `💧 수분 섭취 가이드:\n\n` +
    `• 하루 2~2.5리터 (8잔) 권장\n` +
    `• 운동 전후에는 추가로 1~2잔\n` +
    `• 카페인 음료는 이뇨 작용이 있으니 물로 보충하세요\n` +
    `• 갈증을 느끼기 전에 미리미리 마시세요\n\n` +
    `💡 물을 자주 마시면 포만감이 생겨 과식을 방지할 수 있습니다!`;
}

/**
 * 일반 조언 생성
 */
function generateGeneralAdvice(analysis: any, context: UserContext): string {
  const { todayCalories, targetCalories, todayExercise } = analysis;

  let advice = `안녕하세요! 오늘 하루는 어떠셨나요?\n\n`;
  advice += `📊 오늘의 현황:\n`;
  advice += `• 섭취 칼로리: ${todayCalories}/${targetCalories}kcal\n`;
  advice += `• 운동으로 소모: ${todayExercise}kcal\n\n`;

  advice += `💡 제가 도와드릴 수 있는 것들:\n`;
  advice += `• 식단 추천 및 칼로리 조언\n`;
  advice += `• 운동 프로그램 추천\n`;
  advice += `• 목표 달성 전략\n`;
  advice += `• 영양소 균형 관리\n\n`;

  advice += `무엇이든 물어보세요! 😊`;

  return advice;
}

/**
 * 현재 계절 가져오기
 */
function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return '봄';
  if (month >= 6 && month <= 8) return '여름';
  if (month >= 9 && month <= 11) return '가을';
  return '겨울';
}
