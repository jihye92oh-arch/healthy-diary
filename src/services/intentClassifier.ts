/**
 * 의도 분류 및 엔티티 추출 시스템
 * SKILL.md의 Intent Classification을 기반으로 구현
 */

export interface Intent {
  type: string;
  confidence: number;
  entities: Record<string, any>;
}

// 의도별 키워드 정의
const INTENTS = {
  // 인사
  greeting: ['안녕', '하이', 'hi', 'hello', '안녕하세요', '반가'],

  // 식단 관련
  add_meal: ['먹었', '먹음', '섭취', '식사', '아침먹', '점심먹', '저녁먹', '간식먹'],
  recommend_meal: ['뭐 먹', '추천', '메뉴', '식단', '먹을까', '점심으로', '저녁으로'],
  calorie_query: ['칼로리', '영양', '영양소', 'kcal'],

  // 운동 관련
  add_exercise: ['운동했', '운동함', '달렸', '걸었', '했어요'],
  recommend_exercise: ['운동 추천', '어떤 운동', '운동 뭐', '운동할까'],

  // 정보 조회
  check_progress: ['진행률', '얼마나', '목표', '진척', '달성'],
  today_summary: ['오늘', '현황', '요약', '상태'],

  // 도움말
  help: ['도움', 'help', '뭐 할', '기능', '사용법'],

  // 기타
  water_reminder: ['물', '수분', '마시'],
  motivation: ['힘들', '포기', '어려', '지쳐'],
};

/**
 * 의도 분류 함수
 */
export function classifyIntent(message: string): string {
  const lowerMessage = message.toLowerCase().trim();

  // 각 의도별로 키워드 매칭
  for (const [intent, keywords] of Object.entries(INTENTS)) {
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        return intent;
      }
    }
  }

  return 'general_question';
}

/**
 * 엔티티 추출 함수
 */
export function extractEntities(message: string, intent: string): Record<string, any> {
  const entities: Record<string, any> = {};

  if (intent === 'add_meal') {
    // 음식명 추출 - "샐러드 먹었어" -> 샐러드
    const foodPatterns = [
      /([가-힣a-zA-Z]+)\s*(먹었|먹음|섭취)/,
      /(아침|점심|저녁|간식)으로\s*([가-힣a-zA-Z]+)/,
      /([가-힣a-zA-Z]+)\s*\d+kcal/,
    ];

    for (const pattern of foodPatterns) {
      const match = message.match(pattern);
      if (match) {
        entities.foodName = match[match.length - 1] === '먹었' || match[match.length - 1] === '먹음' || match[match.length - 1] === '섭취'
          ? match[1]
          : match[2] || match[1];
        break;
      }
    }

    // 식사 타입 추출
    if (message.includes('아침')) entities.mealType = 'breakfast';
    else if (message.includes('점심')) entities.mealType = 'lunch';
    else if (message.includes('저녁')) entities.mealType = 'dinner';
    else if (message.includes('간식')) entities.mealType = 'snack';

    // 칼로리 추출
    const calorieMatch = message.match(/(\d+)\s*kcal/);
    if (calorieMatch) {
      entities.calories = parseInt(calorieMatch[1]);
    }
  }

  else if (intent === 'add_exercise') {
    // 운동명 추출 - "조깅 30분 했어" -> 조깅, 30
    const exercisePatterns = [
      /([가-힣a-zA-Z]+)\s*(\d+)분/,
      /(\d+)분\s*([가-힣a-zA-Z]+)/,
      /([가-힣a-zA-Z]+)\s*(했어|함)/,
    ];

    for (const pattern of exercisePatterns) {
      const match = message.match(pattern);
      if (match) {
        if (pattern.source.includes('했어|함')) {
          entities.exerciseName = match[1];
        } else {
          entities.exerciseName = match[1];
          if (match[2] && !isNaN(parseInt(match[2]))) {
            entities.duration = parseInt(match[2]);
          }
        }
        break;
      }
    }

    // 시간 추출
    const durationMatch = message.match(/(\d+)\s*분/);
    if (durationMatch && !entities.duration) {
      entities.duration = parseInt(durationMatch[1]);
    }
  }

  else if (intent === 'recommend_meal') {
    // 식사 타입 추출
    if (message.includes('아침')) entities.mealType = 'breakfast';
    else if (message.includes('점심')) entities.mealType = 'lunch';
    else if (message.includes('저녁')) entities.mealType = 'dinner';
    else if (message.includes('간식')) entities.mealType = 'snack';

    // 칼로리 제한 추출
    const calorieMatch = message.match(/(\d+)\s*kcal/);
    if (calorieMatch) {
      entities.maxCalories = parseInt(calorieMatch[1]);
    }
  }

  return entities;
}

/**
 * 의도와 엔티티를 함께 분석
 */
export function analyzeMessage(message: string): Intent {
  const intent = classifyIntent(message);
  const entities = extractEntities(message, intent);

  // 신뢰도 계산 (간단한 버전)
  let confidence = 0.5;

  // 키워드가 정확히 매칭되면 신뢰도 증가
  const keywords = INTENTS[intent as keyof typeof INTENTS] || [];
  const matchCount = keywords.filter(k => message.toLowerCase().includes(k)).length;
  confidence = Math.min(0.5 + (matchCount * 0.2), 1.0);

  // 엔티티가 추출되면 신뢰도 증가
  if (Object.keys(entities).length > 0) {
    confidence = Math.min(confidence + 0.2, 1.0);
  }

  return {
    type: intent,
    confidence,
    entities,
  };
}
