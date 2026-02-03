import { ReactNode, useState } from 'react';

export type TabType = 'home' | 'log' | 'analytics' | 'goal' | 'recommendation' | 'chatbot' | 'settings';

interface TabItem {
  id: TabType;
  label: string;
  icon: string;
}

const tabs: TabItem[] = [
  { id: 'home', label: '홈', icon: '🏠' },
  { id: 'log', label: '기록', icon: '📝' },
  { id: 'analytics', label: '분석', icon: '📊' },
  { id: 'goal', label: '목표', icon: '🎯' },
  { id: 'recommendation', label: '추천', icon: '💡' },
  { id: 'chatbot', label: 'AI 챗봇', icon: '🤖' },
  { id: 'settings', label: '설정', icon: '⚙️' },
];

interface LayoutProps {
  children: (activeTab: TabType) => ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      {/* 상단 헤더 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Healthy Diary 건강 다이어리
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            건강한 다이어트 습관 형성을 돕는 개인 맞춤형 건강 관리 플랫폼
          </p>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-6 py-3 font-medium text-sm
                  transition-all duration-200 border-b-2
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-700'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 메인 컨텐츠 영역 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children(activeTab)}
      </main>
    </div>
  );
}
