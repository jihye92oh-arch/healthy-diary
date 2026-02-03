// 운동 데이터베이스 - 체중 기반 칼로리 계산용
// MET (Metabolic Equivalent of Task) 값 기준
// 칼로리 계산: MET × 체중(kg) × 시간(hour)

export interface ExerciseData {
  id: string;
  name: string;
  met: number; // MET 값
  category: '유산소' | '근력' | '스포츠' | '기타';
  difficulty: '쉬움' | '보통' | '어려움';
  description: string;
}

export const exerciseDatabase: ExerciseData[] = [
  // 유산소 운동
  { id: '1', name: '걷기 (느린 속도)', met: 3.5, category: '유산소', difficulty: '쉬움', description: '3-4km/h 속도' },
  { id: '2', name: '걷기 (빠른 속도)', met: 5.0, category: '유산소', difficulty: '보통', description: '5-6km/h 속도' },
  { id: '3', name: '조깅', met: 7.0, category: '유산소', difficulty: '보통', description: '8km/h 속도' },
  { id: '4', name: '달리기', met: 10.0, category: '유산소', difficulty: '어려움', description: '10km/h 이상' },
  { id: '5', name: '자전거 (느린 속도)', met: 4.0, category: '유산소', difficulty: '쉬움', description: '16km/h 미만' },
  { id: '6', name: '자전거 (빠른 속도)', met: 8.0, category: '유산소', difficulty: '보통', description: '20km/h 이상' },
  { id: '7', name: '수영 (천천히)', met: 6.0, category: '유산소', difficulty: '보통', description: '자유형, 느린 속도' },
  { id: '8', name: '수영 (빠르게)', met: 10.0, category: '유산소', difficulty: '어려움', description: '자유형, 빠른 속도' },
  { id: '9', name: '등산', met: 7.5, category: '유산소', difficulty: '보통', description: '배낭 없이' },
  { id: '10', name: '계단 오르기', met: 8.0, category: '유산소', difficulty: '보통', description: '일반 속도' },

  // 근력 운동
  { id: '11', name: '웨이트 트레이닝 (가벼움)', met: 3.5, category: '근력', difficulty: '쉬움', description: '가벼운 중량' },
  { id: '12', name: '웨이트 트레이닝 (보통)', met: 5.0, category: '근력', difficulty: '보통', description: '중간 중량' },
  { id: '13', name: '웨이트 트레이닝 (격렬)', met: 6.0, category: '근력', difficulty: '어려움', description: '고중량' },
  { id: '14', name: '팔굽혀펴기', met: 3.8, category: '근력', difficulty: '보통', description: '자중 운동' },
  { id: '15', name: '윗몸일으키기', met: 3.8, category: '근력', difficulty: '보통', description: '복근 운동' },
  { id: '16', name: '플랭크', met: 4.0, category: '근력', difficulty: '보통', description: '코어 운동' },
  { id: '17', name: '스쿼트', met: 5.0, category: '근력', difficulty: '보통', description: '하체 운동' },
  { id: '18', name: '런지', met: 4.0, category: '근력', difficulty: '보통', description: '하체 운동' },

  // 스포츠
  { id: '19', name: '농구', met: 6.5, category: '스포츠', difficulty: '보통', description: '일반 게임' },
  { id: '20', name: '축구', met: 7.0, category: '스포츠', difficulty: '보통', description: '일반 게임' },
  { id: '21', name: '배드민턴', met: 5.5, category: '스포츠', difficulty: '보통', description: '레크리에이션' },
  { id: '22', name: '테니스', met: 7.3, category: '스포츠', difficulty: '보통', description: '단식' },
  { id: '23', name: '탁구', met: 4.0, category: '스포츠', difficulty: '쉬움', description: '레크리에이션' },
  { id: '24', name: '배구', met: 4.0, category: '스포츠', difficulty: '보통', description: '레크리에이션' },
  { id: '25', name: '골프', met: 4.8, category: '스포츠', difficulty: '쉬움', description: '걸으며 플레이' },

  // 기타 활동
  { id: '26', name: '요가', met: 2.5, category: '기타', difficulty: '쉬움', description: '하타 요가' },
  { id: '27', name: '필라테스', met: 3.0, category: '기타', difficulty: '보통', description: '일반 강도' },
  { id: '28', name: '줄넘기', met: 11.0, category: '유산소', difficulty: '어려움', description: '빠른 속도' },
  { id: '29', name: '에어로빅', met: 6.5, category: '유산소', difficulty: '보통', description: '고강도' },
  { id: '30', name: '댄스', met: 4.5, category: '기타', difficulty: '보통', description: '일반 댄스' },
];

/**
 * 체중 기반 칼로리 소모량 계산
 * @param met MET 값
 * @param weightKg 체중 (kg)
 * @param durationMinutes 운동 시간 (분)
 * @returns 소모 칼로리 (kcal)
 */
export function calculateCaloriesByWeight(
  met: number,
  weightKg: number,
  durationMinutes: number
): number {
  const hours = durationMinutes / 60;
  const calories = met * weightKg * hours;
  return Math.round(calories);
}

/**
 * 운동 ID로 운동 정보 가져오기
 */
export function getExerciseById(id: string): ExerciseData | undefined {
  return exerciseDatabase.find(ex => ex.id === id);
}

/**
 * 운동 이름으로 검색
 */
export function searchExercisesByName(query: string): ExerciseData[] {
  const lowerQuery = query.toLowerCase();
  return exerciseDatabase.filter(ex =>
    ex.name.toLowerCase().includes(lowerQuery) ||
    ex.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * 카테고리별 운동 가져오기
 */
export function getExercisesByCategory(category: '유산소' | '근력' | '스포츠' | '기타'): ExerciseData[] {
  return exerciseDatabase.filter(ex => ex.category === category);
}
