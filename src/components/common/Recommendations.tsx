import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Recommendation, WeatherInfo } from '../../types';
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

export default function Recommendations() {
  const { user, goal } = useApp();
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
                <button className="flex-1 text-sm bg-green-500 hover:bg-green-600 text-white py-2 rounded transition">
                  레시피 보기
                </button>
                <button className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition">
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
                <button className="flex-1 text-sm bg-purple-500 hover:bg-purple-600 text-white py-2 rounded transition">
                  상세 보기
                </button>
                <button className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition">
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
    </div>
  );
}
