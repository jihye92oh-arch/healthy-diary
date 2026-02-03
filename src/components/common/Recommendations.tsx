import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Recommendation, WeatherInfo, DietRecord, ExerciseLog, FoodItem } from '../../types';
import {
  generateDietRecommendations,
  generateExerciseRecommendations,
  generatePersonalizedAdvice,
} from '../../services/aiService';
import {
  getCurrentSeason,
  getSeasonName,
  getSeasonalDietTips,
  getSeasonalExerciseTips,
} from '../../utils/seasonUtils';
import {
  getCurrentWeather,
  shouldRecommendOutdoorExercise,
  getWeatherEmoji,
} from '../../services/weatherService';
import Modal from './Modal';

/**
 * 운동별 상세 정보 제공
 */
function getExerciseDetails(exerciseName: string): {
  method: string[];
  benefits: string[];
  tips: string[];
} {
  const name = exerciseName.toLowerCase();

  // 걷기
  if (name.includes('걷기') || name.includes('산책')) {
    return {
      method: [
        '등을 곧게 펴고 시선은 전방 15m 앞을 바라봅니다',
        '팔을 자연스럽게 앞뒤로 흔들며 걷습니다',
        '발뒤꿈치부터 착지하여 발가락으로 지면을 밀어냅니다',
        '일정한 속도로 리듬감 있게 걷습니다',
      ],
      benefits: [
        '심혈관 건강 개선 및 혈압 조절',
        '관절에 부담이 적어 부상 위험 낮음',
        '스트레스 해소 및 우울증 예방 (세로토닌 분비)',
        '체지방 감소 및 체중 관리',
      ],
      tips: [
        '쿠션이 좋은 운동화 착용',
        '식후 30분 후 걷기가 혈당 조절에 효과적',
        '하루 30분, 주 5회 이상 권장',
      ],
    };
  }

  // 조깅/달리기
  if (name.includes('조깅') || name.includes('달리기') || name.includes('running')) {
    return {
      method: [
        '5-10분 가볍게 걷기로 워밍업을 시작합니다',
        '상체는 이완하고 팔을 90도로 구부려 자연스럽게 흔듭니다',
        '발 중앙 또는 앞꿈치로 착지하여 충격을 분산시킵니다',
        '호흡은 코로 들이마시고 입으로 내쉬며 리듬을 유지합니다',
        '마지막 5분은 천천히 걷기로 쿨다운합니다',
      ],
      benefits: [
        '심폐지구력 향상 (VO2 max 증가)',
        '칼로리 소모가 높아 체중 감량 효과적',
        '뼈 밀도 증가로 골다공증 예방',
        '엔돌핀 분비로 기분 개선',
      ],
      tips: [
        '러닝화는 6개월마다 교체 권장',
        '경사로나 인터벌 트레이닝으로 효과 증대',
        '부상 예방을 위해 무릎과 발목 스트레칭 필수',
      ],
    };
  }

  // 자전거
  if (name.includes('자전거') || name.includes('사이클')) {
    return {
      method: [
        '안장 높이를 조절하여 페달을 가장 낮춘 상태에서 무릎이 약간 구부러지도록 합니다',
        '핸들을 가볍게 잡고 팔꿈치를 약간 구부립니다',
        '페달은 발 앞부분으로 밟으며 원을 그리듯 돌립니다',
        '처음 5분은 가볍게, 중간은 강도 높게, 마지막 5분은 천천히',
      ],
      benefits: [
        '하체 근력 강화 (대퇴사두근, 햄스트링)',
        '무릎 관절에 부담이 적은 유산소 운동',
        '심폐 기능 향상 및 지구력 증진',
        '하체 순환 개선으로 부종 예방',
      ],
      tips: [
        '실내 자전거는 환기가 잘 되는 곳에서',
        'RPM 60-90 유지가 효과적',
        '30분 이상 지속 시 지방 연소 효과 극대화',
      ],
    };
  }

  // 스쿼트
  if (name.includes('스쿼트')) {
    return {
      method: [
        '발을 어깨 너비로 벌리고 발끝은 약간 바깥쪽을 향합니다',
        '가슴을 펴고 시선은 정면을 유지합니다',
        '무릎이 발끝을 넘지 않도록 주의하며 엉덩이를 뒤로 빼며 앉습니다',
        '허벅지가 바닥과 평행이 될 때까지 내려갑니다',
        '발뒤꿈치로 지면을 밀며 일어납니다',
      ],
      benefits: [
        '하체 근력 강화 (대퇴사두근, 둔근, 햄스트링)',
        '기초 대사량 증가로 다이어트 효과',
        '코어 근육 강화 및 균형감 향상',
        '일상 생활 동작 능력 개선',
      ],
      tips: [
        '초보자는 의자를 뒤에 두고 연습',
        '15회 × 3세트가 기본',
        '무릎이 아프면 깊이를 줄이고 천천히',
      ],
    };
  }

  // 플랭크
  if (name.includes('플랭크')) {
    return {
      method: [
        '엎드린 자세에서 팔꿈치를 어깨 아래에 위치시킵니다',
        '발끝으로 몸을 들어올려 머리부터 발끝까지 일직선을 만듭니다',
        '복부에 힘을 주고 엉덩이가 처지거나 올라가지 않도록 합니다',
        '자연스럽게 호흡하며 자세를 유지합니다',
        '30초부터 시작하여 점차 시간을 늘립니다',
      ],
      benefits: [
        '코어 근육 강화 (복직근, 복사근)',
        '자세 교정 및 허리 통증 예방',
        '전신 근지구력 향상',
        '운동 능력 향상의 기초',
      ],
      tips: [
        '호흡을 멈추지 말고 계속 유지',
        '거울을 보며 자세 확인',
        '무리하지 말고 정확한 자세 우선',
      ],
    };
  }

  // 요가
  if (name.includes('요가')) {
    return {
      method: [
        '편안한 복장과 요가 매트를 준비합니다',
        '호흡에 집중하며 천천히 동작을 시작합니다',
        '각 자세를 30초~1분 유지하며 깊은 호흡',
        '무리하게 자세를 완성하려 하지 말고 자신의 유연성에 맞게',
        '마지막은 시바사나(시체 자세)로 이완',
      ],
      benefits: [
        '유연성과 근력 동시 향상',
        '스트레스 감소 및 정신 건강 개선',
        '균형감과 집중력 향상',
        '혈액 순환 개선 및 통증 완화',
      ],
      tips: [
        '식후 2-3시간 후 실시',
        '초보자는 온라인 강의나 앱 활용',
        '매일 15-20분이 꾸준한 것이 효과적',
      ],
    };
  }

  // 수영
  if (name.includes('수영')) {
    return {
      method: [
        '수영장 입수 전 준비 운동으로 관절을 풀어줍니다',
        '자유형: 팔을 번갈아 저으며 다리는 위아래로 차기',
        '호흡은 머리를 옆으로 돌려 한쪽씩 번갈아 가며',
        '일정한 페이스를 유지하며 25m씩 왕복',
        '피로하면 쉬었다가 계속, 무리하지 않기',
      ],
      benefits: [
        '전신 근육 사용으로 균형잡힌 발달',
        '관절 부담 없는 최고의 유산소 운동',
        '칼로리 소모가 매우 높음',
        '허리와 척추 건강에 도움',
      ],
      tips: [
        '수영 모자와 물안경 착용',
        '30분 이상 지속 시 효과 극대화',
        '수영 후 샤워와 스트레칭 필수',
      ],
    };
  }

  // 등산
  if (name.includes('등산')) {
    return {
      method: [
        '등산화와 등산 스틱을 준비합니다',
        '처음 15분은 천천히 걸으며 몸을 적응시킵니다',
        '오르막: 보폭을 작게, 발바닥 전체로 디디기',
        '내리막: 무릎에 충격이 가지 않도록 천천히, 등산 스틱 활용',
        '중간중간 휴식하며 수분 보충',
      ],
      benefits: [
        '심폐 기능과 하체 근력 동시 향상',
        '자연 속에서 스트레스 해소',
        '비타민 D 합성 (햇빛)',
        '칼로리 소모가 높고 지방 연소 효과적',
      ],
      tips: [
        '날씨 확인 필수, 준비물 체크리스트 작성',
        '초보자는 낮은 산부터 시작',
        '하산이 더 위험하므로 주의',
      ],
    };
  }

  // 기타 운동
  return {
    method: [
      '충분히 스트레칭으로 몸을 풀어줍니다',
      '올바른 자세를 유지하며 운동합니다',
      '호흡을 조절하며 일정한 페이스를 유지합니다',
      '운동 강도는 점진적으로 높입니다',
      '운동 후 쿨다운과 스트레칭을 잊지 마세요',
    ],
    benefits: [
      '체력 증진 및 건강 개선',
      '칼로리 소모를 통한 체중 관리',
      '스트레스 해소 및 기분 전환',
      '규칙적인 운동으로 생활 습관 개선',
    ],
    tips: [
      '무리하지 않고 본인의 체력에 맞게 조절',
      '주 3-5회 규칙적으로 실천',
      '통증이 있다면 즉시 중단하고 전문가 상담',
    ],
  };
}

export default function Recommendations() {
  const { user, goal, addDietRecord, addExerciseLog } = useApp();
  const [dietRecs, setDietRecs] = useState<Recommendation[]>([]);
  const [exerciseRecs, setExerciseRecs] = useState<Recommendation[]>([]);
  const [aiAdvice, setAiAdvice] = useState<string[]>([]);
  const [isIndoor, setIsIndoor] = useState(true);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [weatherRecommendation, setWeatherRecommendation] = useState<{
    recommend: boolean;
    reason: string;
  } | null>(null);

  // 모달 상태
  const [selectedRecipe, setSelectedRecipe] = useState<Recommendation | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Recommendation | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);

  const currentSeason = getCurrentSeason();
  const seasonName = getSeasonName(currentSeason);

  useEffect(() => {
    loadWeather();
  }, []);

  useEffect(() => {
    loadRecommendations();
  }, [user, goal, isIndoor]);

  const loadWeather = async () => {
    try {
      const weatherData = await getCurrentWeather('Seoul');
      setWeather(weatherData);
      const recommendation = shouldRecommendOutdoorExercise(weatherData);
      setWeatherRecommendation(recommendation);

      // 날씨가 나쁘면 자동으로 실내 운동 추천
      if (!recommendation.recommend) {
        setIsIndoor(true);
      }
    } catch (error) {
      console.error('Error loading weather:', error);
    }
  };

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const [diet, exercise, advice] = await Promise.all([
        generateDietRecommendations(user, goal),
        generateExerciseRecommendations(user, goal, currentSeason, isIndoor),
        generatePersonalizedAdvice(user, goal, 1850, 4),
      ]);
      setDietRecs(diet);
      setExerciseRecs(exercise);
      setAiAdvice(advice);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const seasonalDietTips = getSeasonalDietTips(currentSeason);
  const seasonalExerciseTips = getSeasonalExerciseTips(currentSeason);

  // 레시피 보기
  const handleViewRecipe = (recipe: Recommendation) => {
    setSelectedRecipe(recipe);
    setIsRecipeModalOpen(true);
  };

  // 식단에 추가
  const handleAddToDiet = (recipe: Recommendation) => {
    if (!user) {
      alert('사용자 정보를 먼저 설정해주세요.');
      return;
    }

    // 추천 식단을 FoodItem 배열로 변환
    const foods: FoodItem[] = recipe.ingredients
      ? recipe.ingredients.map((ingredient, idx) => ({
          id: `${Date.now()}-${idx}`,
          name: ingredient,
          amount: 100, // 기본값
          unit: 'g' as const,
          calories: Math.round((recipe.calories || 0) / recipe.ingredients!.length),
        }))
      : [
          {
            id: Date.now().toString(),
            name: recipe.title,
            amount: 1,
            unit: 'ea' as const,
            calories: recipe.calories || 0,
          },
        ];

    const newRecord: DietRecord = {
      id: Date.now().toString(),
      userId: user.id,
      date: new Date(),
      mealType: 'lunch', // 기본값: 점심
      foods,
      totalCalories: recipe.calories || 0,
      createdAt: new Date(),
    };

    addDietRecord(newRecord);
    alert(`"${recipe.title}"이(가) 식단에 추가되었습니다! 기록 탭에서 확인하세요.`);
  };

  // 운동 상세 보기
  const handleViewExercise = (exercise: Recommendation) => {
    setSelectedExercise(exercise);
    setIsExerciseModalOpen(true);
  };

  // 운동 시작 (기록에 추가)
  const handleStartExercise = (exercise: Recommendation) => {
    if (!user) {
      alert('사용자 정보를 먼저 설정해주세요.');
      return;
    }

    const newLog: ExerciseLog = {
      id: Date.now().toString(),
      userId: user.id,
      date: new Date(),
      exerciseName: exercise.title,
      durationMinutes: exercise.duration || 30,
      caloriesBurned: exercise.calories || 0,
      intensity: exercise.difficulty === 'easy' ? 'low' : exercise.difficulty === 'hard' ? 'high' : 'medium',
      createdAt: new Date(),
    };

    addExerciseLog(newLog);
    alert(`"${exercise.title}" 운동이 기록되었습니다! 기록 탭에서 확인하세요.`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">AI가 추천을 생성하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 계절 정보 */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center">
          <span className="mr-2">
            {currentSeason === 'spring' && '🌸'}
            {currentSeason === 'summer' && '☀️'}
            {currentSeason === 'fall' && '🍂'}
            {currentSeason === 'winter' && '❄️'}
          </span>
          계절별 추천 (현재: {seasonName})
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {currentSeason === 'winter' && '겨울철 건강 관리, 따뜻한 식사와 실내 운동으로!'}
          {currentSeason === 'spring' && '봄나물로 건강을 챙기고 야외 활동을 즐기세요!'}
          {currentSeason === 'summer' && '더운 여름, 수분 섭취와 시원한 식단으로!'}
          {currentSeason === 'fall' && '가을 제철 식재료로 면역력을 높이세요!'}
        </p>
      </div>

      {/* 식단 추천 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
          <span className="mr-2">🥗</span>
          AI 식단 추천
        </h2>

        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">계절 식단 팁</p>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            {seasonalDietTips.map((tip, i) => (
              <li key={i} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dietRecs.map((rec) => (
            <div key={rec.id} className="border-2 border-green-200 dark:border-green-800 rounded-lg p-4 hover:shadow-lg transition bg-white dark:bg-gray-700">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">{rec.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{rec.description}</p>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  칼로리: {rec.calories} kcal
                </p>
                {rec.ingredients && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">재료:</p>
                    <div className="flex flex-wrap gap-1">
                      {rec.ingredients.map((ing, i) => (
                        <span
                          key={i}
                          className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => handleViewRecipe(rec)}
                  className="flex-1 text-sm bg-green-500 hover:bg-green-600 text-white py-2 rounded transition"
                >
                  레시피 보기
                </button>
                <button
                  onClick={() => handleAddToDiet(rec)}
                  className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition"
                >
                  식단 추가
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 운동 추천 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
            <span className="mr-2">💪</span>
            AI 운동 추천
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsIndoor(true)}
              className={`px-4 py-2 rounded-lg transition ${
                isIndoor
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              🏠 실내
            </button>
            <button
              onClick={() => setIsIndoor(false)}
              className={`px-4 py-2 rounded-lg transition ${
                !isIndoor
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              🌤️ 실외
            </button>
          </div>
        </div>

        {/* 날씨 정보 */}
        {weather && (
          <div
            className={`mb-4 p-4 rounded-lg border-2 ${
              weatherRecommendation?.recommend
                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800'
                : 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-3xl">{getWeatherEmoji(weather.condition)}</span>
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-100">
                    현재 날씨: {weather.description}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">온도: {weather.temperature}°C</p>
                </div>
              </div>
              <button
                onClick={loadWeather}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
              >
                🔄 새로고침
              </button>
            </div>
            {weatherRecommendation && (
              <p
                className={`text-sm font-medium ${
                  weatherRecommendation.recommend
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-orange-700 dark:text-orange-300'
                }`}
              >
                💡 {weatherRecommendation.reason}
              </p>
            )}
          </div>
        )}

        <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <p className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-1">계절 운동 팁</p>
          <ul className="text-sm text-purple-800 dark:text-purple-300 space-y-1">
            {seasonalExerciseTips.map((tip, i) => (
              <li key={i} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {exerciseRecs.map((rec) => (
            <div key={rec.id} className="border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4 hover:shadow-lg transition bg-white dark:bg-gray-700">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">{rec.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{rec.description}</p>
              <div className="space-y-1 text-sm">
                <p className="text-purple-600 dark:text-purple-400 font-semibold">
                  소모 칼로리: {rec.calories} kcal ({rec.duration}분)
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  난이도:{' '}
                  {rec.difficulty === 'easy' && '⭐'}
                  {rec.difficulty === 'medium' && '⭐⭐'}
                  {rec.difficulty === 'hard' && '⭐⭐⭐'}
                </p>
              </div>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => handleViewExercise(rec)}
                  className="flex-1 text-sm bg-purple-500 hover:bg-purple-600 text-white py-2 rounded transition"
                >
                  상세 보기
                </button>
                <button
                  onClick={() => handleStartExercise(rec)}
                  className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition"
                >
                  운동 시작
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI 맞춤 조언 */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
          <span className="mr-2">🤖</span>
          AI 맞춤 조언
        </h2>
        <div className="space-y-3">
          {aiAdvice.map((advice, i) => (
            <div key={i} className="flex items-start p-3 bg-white dark:bg-gray-700 rounded-lg">
              <span className="text-2xl mr-3">💡</span>
              <p className="text-gray-700 dark:text-gray-300 flex-1">{advice}</p>
            </div>
          ))}
        </div>
        <button
          onClick={loadRecommendations}
          className="mt-4 w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 rounded-lg transition"
        >
          🔄 새로운 추천 받기
        </button>
      </div>

      {/* 레시피 상세 모달 */}
      {selectedRecipe && (
        <Modal
          isOpen={isRecipeModalOpen}
          onClose={() => setIsRecipeModalOpen(false)}
          title={`🥗 ${selectedRecipe.title}`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                {selectedRecipe.description}
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">칼로리:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {selectedRecipe.calories} kcal
                  </span>
                </div>
                {selectedRecipe.cookingTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">조리 시간:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {selectedRecipe.cookingTime}분
                    </span>
                  </div>
                )}
                {selectedRecipe.difficulty && (
                  <div className="flex justify-between col-span-2">
                    <span className="text-gray-600 dark:text-gray-400">난이도:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {selectedRecipe.difficulty === 'easy' && '⭐ 쉬움'}
                      {selectedRecipe.difficulty === 'medium' && '⭐⭐ 보통'}
                      {selectedRecipe.difficulty === 'hard' && '⭐⭐⭐ 어려움'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {selectedRecipe.nutrients && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">🥗 영양 정보</h4>
                <div className="grid grid-cols-3 gap-2 text-sm text-center">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">단백질</p>
                    <p className="font-bold text-blue-600 dark:text-blue-400">{selectedRecipe.nutrients.protein}g</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">탄수화물</p>
                    <p className="font-bold text-orange-600 dark:text-orange-400">{selectedRecipe.nutrients.carbs}g</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">지방</p>
                    <p className="font-bold text-red-600 dark:text-red-400">{selectedRecipe.nutrients.fat}g</p>
                  </div>
                </div>
              </div>
            )}

            {selectedRecipe.ingredients && (
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">📝 재료</h4>
                <ul className="space-y-1">
                  {selectedRecipe.ingredients.map((ingredient, idx) => (
                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                      <span className="mr-2">•</span>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">👨‍🍳 조리 방법</h4>
              {selectedRecipe.cookingSteps && selectedRecipe.cookingSteps.length > 0 ? (
                <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {selectedRecipe.cookingSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="font-bold mr-2 text-green-600 dark:text-green-400">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>1. 재료를 깨끗이 씻어 준비합니다.</li>
                  <li>2. 각 재료를 적당한 크기로 손질합니다.</li>
                  <li>3. 레시피에 따라 조리합니다.</li>
                  <li>4. 맛있게 드세요!</li>
                </ol>
              )}
            </div>

            <div className="flex space-x-2 pt-4">
              <button
                onClick={() => {
                  handleAddToDiet(selectedRecipe);
                  setIsRecipeModalOpen(false);
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition font-medium"
              >
                식단에 추가
              </button>
              <button
                onClick={() => setIsRecipeModalOpen(false)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 py-3 rounded-lg transition"
              >
                닫기
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 운동 상세 모달 */}
      {selectedExercise && (() => {
        const details = getExerciseDetails(selectedExercise.title);
        return (
          <Modal
            isOpen={isExerciseModalOpen}
            onClose={() => setIsExerciseModalOpen(false)}
            title={`💪 ${selectedExercise.title}`}
          >
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {selectedExercise.description}
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">소모 칼로리:</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {selectedExercise.calories} kcal
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">운동 시간:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {selectedExercise.duration}분
                    </span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span className="text-gray-600 dark:text-gray-400">난이도:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {selectedExercise.difficulty === 'easy' && '⭐ 쉬움'}
                      {selectedExercise.difficulty === 'medium' && '⭐⭐ 보통'}
                      {selectedExercise.difficulty === 'hard' && '⭐⭐⭐ 어려움'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">🎯 운동 방법</h4>
                <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {details.method.map((step, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="font-bold mr-2 text-purple-600 dark:text-purple-400">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">✨ 운동 효과</h4>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  {details.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">💡 실천 팁</h4>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  {details.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>⚠️ 주의사항:</strong> 무리하지 않고 본인의 체력에 맞게 운동하세요.
                  통증이 있다면 즉시 중단하고 전문가와 상담하세요.
                </p>
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  onClick={() => {
                    handleStartExercise(selectedExercise);
                    setIsExerciseModalOpen(false);
                  }}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition font-medium"
                >
                  운동 시작
                </button>
                <button
                  onClick={() => setIsExerciseModalOpen(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 py-3 rounded-lg transition"
                >
                  닫기
                </button>
              </div>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}
