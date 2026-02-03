import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { sendChatMessage, ChatMessage } from '../../services/chatbotService';

export default function Chatbot() {
  const { user, goal, dietRecords, exerciseLogs } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '안녕하세요! 건강 관리 AI 어시스턴트입니다. 식단, 운동, 목표 등에 대해 무엇이든 물어보세요! 🤖',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 추천 질문
  const suggestedQuestions = [
    '오늘 점심으로 뭐 먹는게 좋을까요?',
    '체중 감량에 효과적인 운동을 추천해주세요',
    '현재 제 칼로리 섭취량이 적절한가요?',
    '목표 달성까지 얼마나 걸릴까요?',
    '단백질 섭취를 늘리려면 어떻게 해야 하나요?',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(input, {
        user,
        goal,
        dietRecords,
        exerciseLogs,
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  const clearChat = () => {
    if (window.confirm('대화 내용을 모두 삭제하시겠습니까?')) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: '안녕하세요! 건강 관리 AI 어시스턴트입니다. 식단, 운동, 목표 등에 대해 무엇이든 물어보세요! 🤖',
          timestamp: new Date(),
        },
      ]);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* 헤더 */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
            <span className="mr-2">🤖</span>
            AI 건강 어시스턴트
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            식단, 운동, 목표에 대해 물어보세요
          </p>
        </div>
        <button
          onClick={clearChat}
          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition"
        >
          🗑️ 대화 삭제
        </button>
      </div>

      {/* 추천 질문 (메시지가 1개일 때만 표시) */}
      {messages.length === 1 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
            💡 이런 질문을 해보세요:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestedQuestion(question)}
                className="px-3 py-1 text-sm bg-white dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full transition"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              <div className="flex items-start space-x-2">
                <span className="text-lg">
                  {message.role === 'user' ? '👤' : '🤖'}
                </span>
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.role === 'user'
                        ? 'text-blue-100'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* 로딩 표시 */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🤖</span>
                <div className="flex space-x-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '전송 중...' : '전송'}
          </button>
        </form>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          AI가 생성한 정보는 참고용이며, 전문가의 조언을 대체할 수 없습니다.
        </p>
      </div>
    </div>
  );
}
