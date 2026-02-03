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
 * 식단 조언 생성 (AI 강화)
 */
function generateDietAdvice(analysis: any, context: UserContext): string {
  const { todayCalories, targetCalories, remainingCalories, bmr, tdee } = analysis;
  const currentSeason = getCurrentSeason();

  let advice = `📊 **식단 분석 결과**\n\n`;
  advice += `오늘 현재까지 ${todayCalories}kcal를 섭취하셨습니다.\n`;
  advice += `• 목표: ${targetCalories}kcal\n`;
  advice += `• 기초대사량(BMR): ${bmr}kcal\n`;
  advice += `• 일일 소비량(TDEE): ${tdee}kcal\n\n`;

  if (remainingCalories > 500) {
    advice += `✅ 앞으로 약 ${remainingCalories}kcal를 더 섭취하실 수 있습니다.\n\n`;
    advice += `🥗 **${currentSeason} 계절 맞춤 식단 추천**\n\n`;

    if (currentSeason === '겨울') {
      advice += `**1. 따뜻한 된장찌개 정식 (약 450kcal)**\n`;
      advice += `   • 영양: 단백질 18g, 탄수화물 65g, 지방 12g\n`;
      advice += `   • 효능: 발효 식품인 된장은 장 건강과 면역력 증진에 도움\n`;
      advice += `   • 추천 이유: 추운 날씨에 체온 유지와 포만감 제공\n\n`;

      advice += `**2. 닭가슴살 샐러드 (약 280kcal)**\n`;
      advice += `   • 영양: 단백질 35g, 탄수화물 15g, 지방 8g\n`;
      advice += `   • 효능: 고단백 저칼로리로 근육 유지에 최적\n`;
      advice += `   • 조리 팁: 레몬즙과 올리브오일 드레싱으로 비타민 흡수율 증가\n\n`;

      advice += `**3. 고구마와 삶은 계란 (약 270kcal)**\n`;
      advice += `   • 영양: 단백질 12g, 탄수화물 45g, 지방 6g\n`;
      advice += `   • 효능: 고구마의 식이섬유가 혈당 상승을 완만하게 조절\n`;
      advice += `   • 간식 타이밍: 운동 1시간 전 섭취 시 에너지 공급 효과적`;
    } else if (currentSeason === '여름') {
      advice += `**1. 냉국수와 채소 (약 380kcal)**\n`;
      advice += `   • 영양: 단백질 12g, 탄수화물 70g, 지방 5g\n`;
      advice += `   • 효능: 시원한 국물이 체온 조절, 메밀의 루틴 성분이 혈관 건강에 도움\n\n`;

      advice += `**2. 연어 샐러드 볼 (약 420kcal)**\n`;
      advice += `   • 영양: 단백질 38g, 탄수화물 25g, 지방 20g\n`;
      advice += `   • 효능: 오메가-3 지방산이 풍부하여 심혈관 건강과 항염 효과\n`;
      advice += `   • 추천 채소: 케일, 아보카도, 방울토마토로 항산화 효과 극대화\n\n`;

      advice += `**3. 수박과 그릭 요거트 (약 180kcal)**\n`;
      advice += `   • 영양: 단백질 10g, 탄수화물 30g, 지방 3g\n`;
      advice += `   • 효능: 수박의 92% 수분 함량으로 수분 보충, 요거트의 유산균이 장 건강 개선`;
    } else {
      advice += `**1. 비빔밥 (약 520kcal)**\n`;
      advice += `   • 영양: 단백질 22g, 탄수화물 75g, 지방 15g\n`;
      advice += `   • 효능: 다양한 나물의 비타민과 미네랄이 균형 잡힌 영양 제공\n`;
      advice += `   • 건강 팁: 고추장은 캡사이신이 신진대사 촉진\n\n`;

      advice += `**2. 토마토 계란 볶음밥 (약 400kcal)**\n`;
      advice += `   • 영양: 단백질 18g, 탄수화물 58g, 지방 12g\n`;
      advice += `   • 효능: 토마토의 라이코펜이 항산화 작용, 계란은 완전 단백질 공급\n\n`;

      advice += `**3. 닭가슴살 샌드위치 (약 380kcal)**\n`;
      advice += `   • 영양: 단백질 32g, 탄수화물 45g, 지방 8g\n`;
      advice += `   • 효능: 통밀빵의 복합 탄수화물로 지속적인 에너지 공급`;
    }
  } else if (remainingCalories > 0) {
    advice += `⚖️ 앞으로 약 ${remainingCalories}kcal만 섭취하시면 목표 달성입니다!\n\n`;
    advice += `💡 **영양학적 간식 가이드**\n\n`;
    advice += `**1. 바나나 (약 105kcal)**\n`;
    advice += `   • 칼륨 함량이 높아 근육 경련 방지\n`;
    advice += `   • 트립토판 성분이 세로토닌 생성 → 기분 개선\n\n`;

    advice += `**2. 아몬드 한 줌/23개 (약 160kcal)**\n`;
    advice += `   • 비타민 E가 풍부하여 세포 노화 방지\n`;
    advice += `   • 불포화지방산이 콜레스테롤 수치 개선\n\n`;

    advice += `**3. 저지방 우유 200ml (약 86kcal)**\n`;
    advice += `   • 칼슘과 비타민 D로 뼈 건강 증진\n`;
    advice += `   • 단백질 8g으로 포만감 유지\n\n`;

    advice += `**4. 그릭 요거트 플레인 (약 100kcal)**\n`;
    advice += `   • 프로바이오틱스가 장내 미생물 균형 조절\n`;
    advice += `   • 일반 요거트 대비 단백질 2배`;
  } else {
    const overCalories = Math.abs(remainingCalories);
    advice += `⚠️ 목표 칼로리를 ${overCalories}kcal 초과하셨습니다.\n\n`;
    advice += `💪 **과잉 칼로리 대처 전략**\n\n`;
    advice += `**즉시 실천:**\n`;
    advice += `• 30분 빠른 걷기 (약 ${Math.round(overCalories * 0.3)}kcal 소모)\n`;
    advice += `• 물 2컵 마시기 (포만감 증진, 대사 활성화)\n`;
    advice += `• 저녁 식사 탄수화물 50% 감소\n\n`;

    advice += `**내일 계획:**\n`;
    advice += `• 아침 식사 거르지 말기 (신진대사 활성화)\n`;
    advice += `• 식사 시간 천천히 20분 이상 (포만감 호르몬 분비)\n`;
    advice += `• 단백질 비율 증가 (열 발생 효과 높음)\n\n`;

    advice += `📌 **과식 예방 과학:**\n`;
    advice += `렙틴(포만 호르몬) 분비는 식사 시작 후 20분 소요되므로,\n`;
    advice += `천천히 먹으면 자연스럽게 섭취량이 15-20% 감소합니다.`;
  }

  return advice;
}

/**
 * 운동 조언 생성 (AI 강화)
 */
function generateExerciseAdvice(analysis: any, context: UserContext): string {
  const { todayExercise, remainingCalories } = analysis;
  const { user } = context;
  const userWeight = user?.currentWeight || 70;

  let advice = `💪 **운동 분석 및 추천**\n\n`;
  advice += `오늘 운동으로 ${todayExercise}kcal를 소모하셨습니다.\n\n`;

  if (remainingCalories < 0) {
    const needToBurn = Math.abs(remainingCalories);
    advice += `⚠️ 목표 칼로리를 ${needToBurn}kcal 초과했습니다.\n\n`;
    advice += `🏃 **칼로리 소모 운동 프로그램** (${needToBurn}kcal 목표)\n\n`;

    if (needToBurn > 300) {
      advice += `**고강도 유산소 운동 (30-40분)**\n\n`;

      advice += `**1. 조깅 (8km/h) - 40분**\n`;
      advice += `   • 예상 소모: ${Math.round(7.0 * userWeight * (40/60))}kcal\n`;
      advice += `   • 효과: 심폐지구력 향상, 체지방 감소\n`;
      advice += `   • 과학: 유산소 운동 20분 후 지방 연소 본격화 (지방 대사 전환)\n`;
      advice += `   • 주의: 운동 전 5분 워밍업, 운동 후 5분 쿨다운 필수\n\n`;

      advice += `**2. 실내 자전거 (빠른 속도) - 35분**\n`;
      advice += `   • 예상 소모: ${Math.round(8.0 * userWeight * (35/60))}kcal\n`;
      advice += `   • 효과: 하체 근력 강화, 관절 부담 적음\n`;
      advice += `   • 과학: 저충격 운동으로 무릎 관절 보호하며 칼로리 소모\n`;
      advice += `   • 인터벌: 2분 빠르게 → 1분 천천히 반복 시 효과 30% 증가\n\n`;

      advice += `**3. 수영 (자유형, 빠르게) - 25분**\n`;
      advice += `   • 예상 소모: ${Math.round(10.0 * userWeight * (25/60))}kcal\n`;
      advice += `   • 효과: 전신 근육 사용, 최고의 칼로리 소모 효율\n`;
      advice += `   • 과학: 물의 저항력이 근육에 지속적 부하 → 근지구력 향상\n`;
      advice += `   • 장점: 체온 조절로 피로감 감소`;
    } else {
      advice += `**중강도 유산소 운동 (20-30분)**\n\n`;

      advice += `**1. 빠르게 걷기 (5-6km/h) - 30분**\n`;
      advice += `   • 예상 소모: ${Math.round(5.0 * userWeight * (30/60))}kcal\n`;
      advice += `   • 효과: 체지방 감소, 심혈관 건강 개선\n`;
      advice += `   • 과학: 최대 심박수의 60-70% 유지 시 지방 연소 최적화\n`;
      advice += `   • 팁: 팔을 크게 흔들면 칼로리 소모 15% 증가\n\n`;

      advice += `**2. 계단 오르기 - 20분**\n`;
      advice += `   • 예상 소모: ${Math.round(8.0 * userWeight * (20/60))}kcal\n`;
      advice += `   • 효과: 하체 근력 강화, 엉덩이 라인 개선\n`;
      advice += `   • 과학: 중력에 대항하는 운동으로 에너지 소비 높음\n`;
      advice += `   • 실천: 사무실/아파트 계단 활용, 엘리베이터 대신 계단\n\n`;

      advice += `**3. 줄넘기 - 15분**\n`;
      advice += `   • 예상 소모: ${Math.round(11.0 * userWeight * (15/60))}kcal\n`;
      advice += `   • 효과: 단시간 고효율 칼로리 소모, 심폐 기능 향상\n`;
      advice += `   • 과학: 15분 줄넘기 = 30분 조깅 효과\n`;
      advice += `   • 주의: 충격 흡수 운동화 착용, 무릎 보호`;
    }

    advice += `\n\n📊 **운동 효과 극대화 팁:**\n`;
    advice += `• 공복 운동: 지방 연소 효율 20% 증가 (단, 저혈당 주의)\n`;
    advice += `• 운동 후 단백질: 30분 내 섭취 시 근육 회복 촉진\n`;
    advice += `• 충분한 수분: 운동 중 체중 감소의 150% 수분 보충\n`;
    advice += `• 일관성: 일주일에 3-5회 규칙적 운동이 1회 고강도보다 효과적`;

  } else {
    advice += `✅ 현재 칼로리 균형이 우수합니다!\n\n`;
    advice += `🧘 **건강 유지 및 체력 증진 프로그램**\n\n`;

    advice += `**1. 전신 스트레칭 - 15분**\n`;
    advice += `   • 효과: 유연성 향상, 부상 예방, 혈액 순환 개선\n`;
    advice += `   • 과학: 규칙적 스트레칭이 관절 가동 범위 30% 증가\n`;
    advice += `   • 루틴: 목 → 어깨 → 등 → 허리 → 다리 순서\n`;
    advice += `   • 호흡: 각 동작 20-30초 유지, 깊은 복식 호흡\n\n`;

    advice += `**2. 코어 강화 (플랭크 + 스쿼트)**\n`;
    advice += `   • 플랭크 3세트 (30초 → 45초 → 60초)\n`;
    advice += `     - 효과: 복부 근력, 자세 교정, 허리 통증 예방\n`;
    advice += `     - 과학: 코어 근육 강화가 일상 동작 효율 20% 향상\n`;
    advice += `   • 스쿼트 3세트 (15회씩)\n`;
    advice += `     - 효과: 하체 근력, 기초 대사량 증가\n`;
    advice += `     - 과학: 대퇴근(신체 최대 근육) 자극으로 성장 호르몬 분비\n\n`;

    advice += `**3. 요가 - 20분**\n`;
    advice += `   • 효과: 스트레스 감소, 균형감 향상, 정신 건강\n`;
    advice += `   • 과학: 요가가 코르티솔(스트레스 호르몬) 수치 28% 감소\n`;
    advice += `   • 추천 자세: 아래를 향한 개, 전사 자세, 나무 자세\n`;
    advice += `   • 호흡법: 4초 들이마시기 → 7초 멈춤 → 8초 내쉬기\n\n`;

    advice += `📈 **장기 운동 효과 (과학적 근거):**\n`;
    advice += `• 3개월: 심폐 기능 15-20% 향상, 체지방 5-8% 감소\n`;
    advice += `• 6개월: 기초 대사량 100-200kcal 증가 (근육량 증가)\n`;
    advice += `• 1년: 심혈관 질환 위험 30% 감소, 골밀도 2-3% 증가\n`;
    advice += `• 연구: JAMA(2019) - 주 150분 중강도 운동 시 사망률 31% 감소`;
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
