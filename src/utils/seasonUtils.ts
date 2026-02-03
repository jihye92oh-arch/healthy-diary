import { Season } from '../types';

/**
 * 현재 계절 감지
 * 한국 기준: 3-5월(봄), 6-8월(여름), 9-11월(가을), 12-2월(겨울)
 */
export function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1; // 1-12

  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
}

/**
 * 계절별 한글 이름
 */
export function getSeasonName(season: Season): string {
  const names: Record<Season, string> = {
    spring: '봄',
    summer: '여름',
    fall: '가을',
    winter: '겨울',
    all: '사계절',
  };
  return names[season];
}

/**
 * 계절별 제철 식재료
 */
export function getSeasonalIngredients(season: Season): string[] {
  const ingredients: Record<Season, string[]> = {
    spring: [
      '냉이', '달래', '쑥', '두릅', '죽순', '아스파라거스',
      '딸기', '봄동', '씀바귀', '미나리', '냉이', '취나물'
    ],
    summer: [
      '토마토', '오이', '가지', '호박', '옥수수', '수박',
      '참외', '복숭아', '자두', '열무', '상추', '깻잎'
    ],
    fall: [
      '고구마', '밤', '대추', '배', '사과', '감',
      '버섯', '우엉', '연근', '무', '배추', '시금치'
    ],
    winter: [
      '배추', '무', '시금치', '콩나물', '굴', '과메기',
      '귤', '한라봉', '유자', '딸기', '브로콜리', '뿌리채소'
    ],
    all: ['계란', '두부', '닭고기', '쇠고기', '돼지고기', '현미', '귀리'],
  };
  return ingredients[season] || [];
}

/**
 * 계절별 추천 운동 타입
 */
export function getSeasonalExerciseTypes(season: Season): {
  indoor: string[];
  outdoor: string[];
} {
  const exercises = {
    spring: {
      indoor: ['요가', '필라테스', '실내 자전거', '스트레칭'],
      outdoor: ['조깅', '산책', '등산', '자전거', '골프'],
    },
    summer: {
      indoor: ['수영', '헬스', '실내 클라이밍', '에어로빅', '스피닝'],
      outdoor: ['수영', '서핑', '카약', '새벽 조깅'],
    },
    fall: {
      indoor: ['크로스핏', '필라테스', '요가', '댄스'],
      outdoor: ['등산', '트레킹', '조깅', '자전거', '골프'],
    },
    winter: {
      indoor: ['홈트레이닝', '실내 자전거', '헬스', '요가', '필라테스', '스쿼트'],
      outdoor: ['가벼운 산책', '겨울 등산', '스키', '스노보드'],
    },
    all: {
      indoor: ['요가', '필라테스', '웨이트 트레이닝', '스트레칭'],
      outdoor: ['걷기', '조깅', '자전거'],
    },
  };
  return exercises[season] || exercises.all;
}

/**
 * 계절별 식단 특징 및 팁
 */
export function getSeasonalDietTips(season: Season): string[] {
  const tips: Record<Season, string[]> = {
    spring: [
      '봄나물로 비타민과 미네랄을 보충하세요',
      '따뜻한 차와 함께 가볍게 식사하세요',
      '제철 딸기로 비타민 C 섭취를 늘리세요',
    ],
    summer: [
      '수분 섭취를 충분히 하세요',
      '시원한 샐러드와 냉국으로 더위를 이겨내세요',
      '수박, 참외 등 수분 많은 과일을 섭취하세요',
    ],
    fall: [
      '면역력을 높이는 버섯 요리를 추천합니다',
      '고구마, 밤 등 식이섬유가 풍부한 음식을 섭취하세요',
      '환절기 건강을 위해 영양가 높은 제철 과일을 드세요',
    ],
    winter: [
      '따뜻한 국물 요리로 체온을 유지하세요',
      '뿌리채소로 몸을 따뜻하게 하세요',
      '비타민 C가 풍부한 귤, 한라봉을 섭취하세요',
      '굴, 과메기 등 겨울 제철 음식으로 영양을 보충하세요',
    ],
    all: [
      '균형 잡힌 식단을 유지하세요',
      '하루 2L의 물을 마시세요',
    ],
  };
  return tips[season] || tips.all;
}

/**
 * 계절별 운동 팁
 */
export function getSeasonalExerciseTips(season: Season): string[] {
  const tips: Record<Season, string[]> = {
    spring: [
      '날씨가 좋은 날은 야외 활동을 늘리세요',
      '황사가 심한 날은 실내 운동을 추천합니다',
      '꽃가루 알레르기가 있다면 마스크를 착용하세요',
    ],
    summer: [
      '햇볕이 강한 시간대(11-15시)는 피하세요',
      '충분한 수분 섭취와 함께 운동하세요',
      '실내 운동을 적극 활용하세요',
    ],
    fall: [
      '등산, 트레킹에 최적의 계절입니다',
      '일교차가 크니 준비운동을 충분히 하세요',
      '야외 활동을 즐기기 좋은 시기입니다',
    ],
    winter: [
      '추운 날씨에는 홈트레이닝을 추천합니다',
      '외출 시 따뜻하게 옷을 입으세요',
      '준비운동을 더 길게 하여 부상을 예방하세요',
      '날씨가 좋은 날에만 야외 운동을 하세요',
    ],
    all: [
      '규칙적인 운동 습관을 유지하세요',
      '자신의 체력에 맞는 강도로 운동하세요',
    ],
  };
  return tips[season] || tips.all;
}
