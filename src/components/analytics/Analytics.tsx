import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// 샘플 데이터
const calorieData = [
  { date: '1/9', consumed: 1850, burned: 400, target: 2000 },
  { date: '1/10', consumed: 1920, burned: 350, target: 2000 },
  { date: '1/11', consumed: 1780, burned: 450, target: 2000 },
  { date: '1/12', consumed: 2100, burned: 300, target: 2000 },
  { date: '1/13', consumed: 1850, burned: 500, target: 2000 },
  { date: '1/14', consumed: 1950, burned: 400, target: 2000 },
  { date: '1/15', consumed: 1820, burned: 420, target: 2000 },
];

const weightData = [
  { date: '1/1', weight: 72, targetWeight: 65 },
  { date: '1/4', weight: 71.5, targetWeight: 65 },
  { date: '1/7', weight: 71.2, targetWeight: 65 },
  { date: '1/10', weight: 70.8, targetWeight: 65 },
  { date: '1/13', weight: 70.5, targetWeight: 65 },
  { date: '1/15', weight: 70, targetWeight: 65 },
];

export default function Analytics() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');

  return (
    <div className="space-y-6">
      {/* 기간 선택 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2">
          <span className="text-gray-700 font-medium">기간 선택:</span>
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 rounded-lg transition ${
              period === 'week'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            주간
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-lg transition ${
              period === 'month'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            월간
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`px-4 py-2 rounded-lg transition ${
              period === 'year'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            연간
          </button>
        </div>
      </div>

      {/* 칼로리 추이 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📈</span>
          칼로리 추이
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={calorieData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="consumed" fill="#3b82f6" name="섭취 칼로리" />
            <Bar dataKey="burned" fill="#10b981" name="소모 칼로리" />
            <Bar dataKey="target" fill="#f59e0b" name="목표 칼로리" fillOpacity={0.3} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-600 mt-4 text-center">
          섭취 vs 소모 칼로리 차트 (최근 7일)
        </p>
      </div>

      {/* 체중 변화 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">⚖️</span>
          체중 변화
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weightData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[60, 75]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#3b82f6"
              strokeWidth={3}
              name="현재 체중"
              dot={{ fill: '#3b82f6', r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="targetWeight"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="목표 체중"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-600 mt-4 text-center">
          목표 체중 vs 현재 체중 추이
        </p>
      </div>

      {/* 통계 요약 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📊</span>
          통계 요약
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">평균 일일 섭취</p>
            <p className="text-2xl font-bold text-blue-600">1,850 kcal</p>
            <p className="text-xs text-gray-500 mt-1">최근 7일 평균</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">평균 운동 시간</p>
            <p className="text-2xl font-bold text-green-600">45분</p>
            <p className="text-xs text-gray-500 mt-1">주당 5회</p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">목표 달성률</p>
            <p className="text-2xl font-bold text-purple-600">85%</p>
            <p className="text-xs text-gray-500 mt-1">일일 목표 기준</p>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">체중 감량</p>
            <p className="text-2xl font-bold text-orange-600">-2.5kg</p>
            <p className="text-xs text-gray-500 mt-1">시작일 대비</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
          <h3 className="font-bold text-gray-800 mb-2">📝 인사이트</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>목표 칼로리를 잘 지키고 있습니다. 이 페이스를 유지하세요!</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>주말에 칼로리 섭취가 높은 경향이 있습니다. 주말 식단 관리에 신경 쓰세요.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>운동 빈도가 훌륭합니다. 체중 감량 목표 달성에 큰 도움이 되고 있습니다.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
