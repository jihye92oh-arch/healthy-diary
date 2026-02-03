import { WeatherInfo } from '../types';

// OpenWeatherMap API 키 (환경 변수로 관리 권장)
// 무료 API 키는 https://openweathermap.org/api 에서 발급
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * 현재 날씨 정보 조회
 *
 * @param city 도시 이름 (기본값: Seoul)
 * @returns 날씨 정보
 */
export async function getCurrentWeather(city: string = 'Seoul'): Promise<WeatherInfo> {
  // API 키가 없거나 demo인 경우 mock 데이터 반환
  if (API_KEY === 'demo' || !API_KEY) {
    return getMockWeather();
  }

  try {
    const response = await fetch(
      `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric&lang=kr`
    );

    if (!response.ok) {
      console.warn('Weather API error, using mock data');
      return getMockWeather();
    }

    const data = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      condition: mapWeatherCondition(data.weather[0].main),
      description: data.weather[0].description,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return getMockWeather();
  }
}

/**
 * 위치 기반 날씨 정보 조회
 *
 * @param lat 위도
 * @param lon 경도
 */
export async function getWeatherByLocation(
  lat: number,
  lon: number
): Promise<WeatherInfo> {
  if (API_KEY === 'demo' || !API_KEY) {
    return getMockWeather();
  }

  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`
    );

    if (!response.ok) {
      return getMockWeather();
    }

    const data = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      condition: mapWeatherCondition(data.weather[0].main),
      description: data.weather[0].description,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return getMockWeather();
  }
}

/**
 * 사용자 위치 가져오기
 */
export function getUserLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
}

/**
 * OpenWeatherMap 날씨 상태를 내부 타입으로 변환
 */
function mapWeatherCondition(condition: string): WeatherInfo['condition'] {
  const lowerCondition = condition.toLowerCase();

  if (lowerCondition.includes('clear')) return 'sunny';
  if (lowerCondition.includes('cloud')) return 'cloudy';
  if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle'))
    return 'rainy';
  if (lowerCondition.includes('snow')) return 'snowy';

  return 'cloudy'; // 기본값
}

/**
 * Mock 날씨 데이터 (API 키 없을 때 사용)
 */
function getMockWeather(): WeatherInfo {
  // 계절에 맞는 mock 데이터 생성
  const month = new Date().getMonth() + 1;
  let temperature: number;
  let condition: WeatherInfo['condition'];
  let description: string;

  if (month >= 3 && month <= 5) {
    // 봄
    temperature = 15;
    condition = 'sunny';
    description = '맑음';
  } else if (month >= 6 && month <= 8) {
    // 여름
    temperature = 28;
    condition = 'cloudy';
    description = '흐림';
  } else if (month >= 9 && month <= 11) {
    // 가을
    temperature = 18;
    condition = 'sunny';
    description = '맑음';
  } else {
    // 겨울
    temperature = 3;
    condition = 'cloudy';
    description = '흐림';
  }

  return { temperature, condition, description };
}

/**
 * 날씨 기반 운동 추천 판단
 *
 * @param weather 날씨 정보
 * @returns 실외 운동 추천 여부 및 이유
 */
export function shouldRecommendOutdoorExercise(weather: WeatherInfo): {
  recommend: boolean;
  reason: string;
} {
  const { temperature, condition } = weather;

  // 비나 눈이 올 때
  if (condition === 'rainy' || condition === 'snowy') {
    return {
      recommend: false,
      reason: `${condition === 'rainy' ? '비' : '눈'}가 오고 있습니다. 실내 운동을 추천합니다.`,
    };
  }

  // 너무 추울 때 (0도 이하)
  if (temperature < 0) {
    return {
      recommend: false,
      reason: `날씨가 너무 춥습니다 (${temperature}°C). 실내 운동을 추천합니다.`,
    };
  }

  // 너무 더울 때 (32도 이상)
  if (temperature > 32) {
    return {
      recommend: false,
      reason: `날씨가 너무 덥습니다 (${temperature}°C). 실내 운동을 추천합니다.`,
    };
  }

  // 적정 온도 (5~28도)
  if (temperature >= 5 && temperature <= 28) {
    return {
      recommend: true,
      reason: `날씨가 좋습니다 (${temperature}°C). 실외 운동하기 좋은 날씨입니다!`,
    };
  }

  // 약간 추운 날씨 (0~5도)
  if (temperature >= 0 && temperature < 5) {
    return {
      recommend: true,
      reason: `약간 쌀쌀합니다 (${temperature}°C). 따뜻하게 입고 가벼운 산책을 추천합니다.`,
    };
  }

  // 약간 더운 날씨 (28~32도)
  if (temperature > 28 && temperature <= 32) {
    return {
      recommend: true,
      reason: `날씨가 덥습니다 (${temperature}°C). 아침이나 저녁에 운동하세요.`,
    };
  }

  return {
    recommend: true,
    reason: `실외 운동 가능한 날씨입니다.`,
  };
}

/**
 * 날씨 이모지 가져오기
 */
export function getWeatherEmoji(condition: WeatherInfo['condition']): string {
  const emojis = {
    sunny: '☀️',
    cloudy: '☁️',
    rainy: '🌧️',
    snowy: '❄️',
  };
  return emojis[condition] || '🌤️';
}
