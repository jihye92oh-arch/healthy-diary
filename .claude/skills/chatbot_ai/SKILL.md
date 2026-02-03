# AI 챗봇 기능 구현 가이드 (Healthy Diary)

## 📋 개요

Healthy Diary 앱에 통합될 AI 건강 어시스턴트 챗봇의 구현 가이드입니다. 사용자의 식단, 운동, 건강 관련 질문에 답하고 개인화된 조언을 제공합니다.

---

## 🎯 챗봇 핵심 기능

### 1. 대화형 건강 상담
- 식단 관련 질문 응답
- 운동 추천 및 조언
- 칼로리 계산 도움
- 영양소 정보 제공
- 건강 관련 일반 상담

### 2. 데이터 기반 개인화
- 사용자의 기록 데이터 분석
- 목표 대비 진행 상황 파악
- 맞춤형 조언 생성
- 패턴 분석 및 피드백

### 3. 빠른 작업 수행
- 음성/텍스트 명령으로 기록 추가
- 정보 조회 및 검색
- 리마인더 설정
- 리포트 요청

---

## 🏗️ 아키텍처 설계

### 시스템 구조
```
┌─────────────────────────────────────────────────┐
│              사용자 인터페이스 (GUI)              │
│                 채팅 윈도우                       │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│            챗봇 매니저 (Chatbot Manager)         │
│  - 입력 전처리                                   │
│  - 의도 분류 (Intent Classification)            │
│  - 컨텍스트 관리                                 │
└─────────┬───────────────────┬───────────────────┘
          │                   │
┌─────────▼─────────┐ ┌──────▼──────────────────┐
│   AI 엔진         │ │  데이터 커넥터           │
│  - LLM API        │ │  - 사용자 DB            │
│  - 로컬 모델      │ │  - 식품 DB              │
│  - 규칙 기반      │ │  - 운동 DB              │
└───────────────────┘ └─────────────────────────┘
          │
┌─────────▼───────────────────────────────────────┐
│              응답 생성 & 액션 실행                │
│  - 텍스트 응답                                   │
│  - UI 액션 (기록 추가, 차트 표시 등)             │
└─────────────────────────────────────────────────┘
```

---

## 💬 GUI 통합 설계

### 챗봇 탭 레이아웃
```
┌──────────────────────────────────────────────────┐
│  🏠 홈 │ 📝 기록 │ 📊 분석 │ 🎯 목표 │ 💡 추천 │ 🤖 AI │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  채팅 히스토리                              │ │
│  │                                             │ │
│  │  🤖: 안녕하세요! 건강 관리를 도와드릴      │ │
│  │      AI 어시스턴트입니다.                  │ │
│  │                                             │ │
│  │  👤: 오늘 점심으로 뭐 먹으면 좋을까?       │ │
│  │                                             │ │
│  │  🤖: 현재 섭취 칼로리가 800kcal이므로      │ │
│  │      점심은 600kcal 정도 추천드립니다.     │ │
│  │      계절 메뉴로 봄나물 비빔밥 어떠세요?   │ │
│  │      [레시피 보기] [식단에 추가]           │ │
│  │                                             │ │
│  │  👤: 좋아, 추가해줘                        │ │
│  │                                             │ │
│  │  🤖: ✅ 점심 식단에 봄나물 비빔밥(550kcal) │ │
│  │      추가했습니다!                         │ │
│  │                                             │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  💬 메시지 입력...             [🎤] [📎]  │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  빠른 질문:                                      │
│  [오늘 뭐 먹을까?] [운동 추천해줘]              │
│  [목표 진행률은?] [물 마시기 알려줘]            │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 플로팅 챗봇 버튼 (모든 탭에서 접근)
```
┌──────────────────────────────────────────┐
│                                          │
│                          ┌─────────────┐ │
│        메인 컨텐츠        │   빠른     │ │
│                          │   💬        │ │
│                          │   [채팅]   │ │
│                          └─────────────┘ │
│                                          │
└──────────────────────────────────────────┘

클릭 시 → 채팅 팝업 또는 챗봇 탭으로 이동
```

---

## 🧠 AI 엔진 선택 가이드

### Option 1: 클라우드 LLM API (추천)

#### 장점
- 강력한 자연어 이해 능력
- 지속적인 모델 업데이트
- 빠른 구현

#### 단점
- API 비용 발생
- 인터넷 연결 필수
- 데이터 프라이버시 고려 필요

#### 추천 서비스
**OpenAI GPT API**
```python
import openai

def get_ai_response(user_message, context):
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message}
        ],
        temperature=0.7,
        max_tokens=500
    )
    return response.choices[0].message.content
```

**Google Gemini API**
```python
import google.generativeai as genai

def get_ai_response(user_message, context):
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(
        f"{SYSTEM_PROMPT}\n\n사용자: {user_message}"
    )
    return response.text
```

**Anthropic Claude API**
```python
import anthropic

def get_ai_response(user_message, context):
    client = anthropic.Anthropic(api_key="your-api-key")
    message = client.messages.create(
        model="claude-3-sonnet-20240229",
        max_tokens=1024,
        messages=[
            {"role": "user", "content": user_message}
        ]
    )
    return message.content[0].text
```

### Option 2: 로컬 LLM (프라이버시 중시)

#### 장점
- 오프라인 작동
- 무료 (API 비용 없음)
- 완전한 데이터 프라이버시

#### 단점
- 높은 컴퓨팅 리소스 필요
- 성능이 클라우드 모델보다 낮을 수 있음
- 초기 설정 복잡

#### 추천 모델
**Ollama (가장 쉬운 설정)**
```python
import requests

def get_ai_response(user_message, context):
    response = requests.post(
        'http://localhost:11434/api/generate',
        json={
            'model': 'llama2',
            'prompt': f"{SYSTEM_PROMPT}\n\n사용자: {user_message}",
            'stream': False
        }
    )
    return response.json()['response']
```

**Hugging Face Transformers**
```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "beomi/llama-2-ko-7b"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

def get_ai_response(user_message, context):
    inputs = tokenizer(user_message, return_tensors="pt")
    outputs = model.generate(**inputs, max_length=200)
    return tokenizer.decode(outputs[0])
```

### Option 3: 하이브리드 방식 (균형)

```python
class HybridChatbot:
    def __init__(self):
        self.use_cloud = self.check_internet_connection()
        
    def get_response(self, user_message, context):
        # 의도 분류
        intent = self.classify_intent(user_message)
        
        # 간단한 의도는 규칙 기반으로 처리
        if intent in ['greeting', 'add_meal', 'add_exercise']:
            return self.rule_based_response(intent, user_message)
        
        # 복잡한 질문은 AI로 처리
        elif self.use_cloud:
            return self.cloud_ai_response(user_message, context)
        else:
            return self.local_ai_response(user_message, context)
```

---

## 📝 시스템 프롬프트 설계

### 기본 시스템 프롬프트

```python
SYSTEM_PROMPT = """
당신은 'Healthy Diary' 앱의 AI 건강 어시스턴트입니다.

## 역할
- 사용자의 식단, 운동, 건강 관리를 돕는 친절한 조력자
- 과학적이고 신뢰할 수 있는 건강 정보 제공
- 사용자의 데이터를 기반으로 개인화된 조언 제공

## 가이드라인
1. 항상 친절하고 격려하는 톤으로 대화하세요
2. 의학적 진단이나 처방은 하지 말고, 전문의 상담을 권유하세요
3. 사용자의 목표와 현재 상태를 고려한 조언을 하세요
4. 구체적이고 실행 가능한 팁을 제공하세요
5. 간결하게 답변하되, 필요시 상세 정보를 제공하세요

## 가능한 작업
- 식단 기록 추가/조회
- 운동 기록 추가/조회
- 칼로리 계산
- 영양소 정보 제공
- 식단/운동 추천
- 목표 진행 상황 확인
- 통계 요약 제공

## 응답 형식
- 일반 대화: 자연스러운 텍스트
- 액션 필요시: JSON 형식으로 액션 정보 포함
  예: {"action": "add_meal", "data": {...}, "message": "..."}

현재 사용자 정보:
- 이름: {user_name}
- 목표: {goal_weight}kg 달성
- 일일 칼로리 목표: {daily_calorie_goal}kcal
- 오늘 섭취: {today_calories_intake}kcal
- 오늘 소모: {today_calories_burned}kcal
"""
```

### 컨텍스트 포함 프롬프트 생성

```python
def create_context_prompt(user_data):
    """사용자 데이터를 기반으로 컨텍스트 프롬프트 생성"""
    
    # 최근 식단 요약
    recent_meals = get_recent_meals(user_data['user_id'], days=3)
    meals_summary = summarize_meals(recent_meals)
    
    # 최근 운동 요약
    recent_exercises = get_recent_exercises(user_data['user_id'], days=3)
    exercise_summary = summarize_exercises(recent_exercises)
    
    # 목표 진행률
    progress = calculate_progress(user_data['user_id'])
    
    context = f"""
## 최근 3일 활동 요약
### 식단
{meals_summary}

### 운동
{exercise_summary}

### 목표 진행률
- 체중: {progress['current_weight']}kg → {progress['target_weight']}kg
- 진행률: {progress['percentage']}%
- 남은 기간: {progress['days_left']}일

### 오늘 현황
- 섭취 칼로리: {user_data['today_intake']}kcal / {user_data['daily_goal']}kcal
- 소모 칼로리: {user_data['today_burned']}kcal
- 남은 칼로리: {user_data['remaining']}kcal
"""
    
    return SYSTEM_PROMPT + context
```

---

## 🎨 의도 분류 (Intent Classification)

### 주요 의도 카테고리

```python
INTENTS = {
    # 인사
    'greeting': ['안녕', '하이', 'hi', 'hello', '안녕하세요'],
    
    # 식단 관련
    'add_meal': ['먹었어', '먹음', '추가', '기록', '입력'],
    'recommend_meal': ['뭐 먹을까', '추천', '메뉴', '식단'],
    'calorie_query': ['칼로리', '영양', '영양소'],
    
    # 운동 관련
    'add_exercise': ['운동했어', '운동함', '달렸어'],
    'recommend_exercise': ['운동 추천', '어떤 운동', '운동 뭐할까'],
    
    # 정보 조회
    'check_progress': ['진행률', '얼마나', '목표', '진척'],
    'today_summary': ['오늘', '현황', '요약'],
    'statistics': ['통계', '분석', '그래프'],
    
    # 도움말
    'help': ['도움', 'help', '뭐 할 수 있어', '기능'],
    
    # 기타
    'water_reminder': ['물', '수분'],
    'motivation': ['힘들어', '포기', '어려워'],
}
```

### 의도 분류 함수

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import re

class IntentClassifier:
    def __init__(self):
        self.vectorizer = TfidfVectorizer()
        self.classifier = MultinomialNB()
        self.trained = False
    
    def train(self, training_data):
        """
        training_data: [
            ("안녕하세요", "greeting"),
            ("오늘 점심 뭐 먹을까?", "recommend_meal"),
            ...
        ]
        """
        texts, labels = zip(*training_data)
        X = self.vectorizer.fit_transform(texts)
        self.classifier.fit(X, labels)
        self.trained = True
    
    def classify(self, text):
        """텍스트의 의도 분류"""
        if not self.trained:
            return self.rule_based_classify(text)
        
        X = self.vectorizer.transform([text])
        intent = self.classifier.predict(X)[0]
        confidence = max(self.classifier.predict_proba(X)[0])
        
        # 신뢰도가 낮으면 규칙 기반으로 재분류
        if confidence < 0.6:
            return self.rule_based_classify(text)
        
        return intent
    
    def rule_based_classify(self, text):
        """규칙 기반 의도 분류 (백업)"""
        text = text.lower()
        
        for intent, keywords in INTENTS.items():
            if any(keyword in text for keyword in keywords):
                return intent
        
        return 'general_question'
    
    def extract_entities(self, text, intent):
        """의도에 따라 엔티티 추출"""
        entities = {}
        
        if intent == 'add_meal':
            # 음식명 추출
            food_match = re.search(r'([가-힣]+)\s*(먹었|먹음|추가)', text)
            if food_match:
                entities['food_name'] = food_match.group(1)
            
            # 칼로리 추출
            calorie_match = re.search(r'(\d+)\s*kcal', text)
            if calorie_match:
                entities['calories'] = int(calorie_match.group(1))
        
        elif intent == 'add_exercise':
            # 운동명 추출
            exercise_match = re.search(r'([가-힣]+)\s*(\d+)분', text)
            if exercise_match:
                entities['exercise_name'] = exercise_match.group(1)
                entities['duration'] = int(exercise_match.group(2))
        
        return entities
```

---

## ⚙️ 챗봇 매니저 구현

### 메인 챗봇 클래스

```python
import json
from datetime import datetime

class HealthChatbot:
    def __init__(self, user_id, ai_engine='gpt-4'):
        self.user_id = user_id
        self.ai_engine = ai_engine
        self.intent_classifier = IntentClassifier()
        self.conversation_history = []
        
        # AI 클라이언트 초기화
        if ai_engine == 'gpt-4':
            import openai
            self.ai_client = openai
        elif ai_engine == 'gemini':
            import google.generativeai as genai
            self.ai_client = genai
    
    def process_message(self, user_message):
        """사용자 메시지 처리 및 응답 생성"""
        
        # 1. 의도 분류
        intent = self.intent_classifier.classify(user_message)
        entities = self.intent_classifier.extract_entities(user_message, intent)
        
        # 2. 의도별 처리
        response = self.handle_intent(intent, user_message, entities)
        
        # 3. 대화 기록 저장
        self.save_conversation(user_message, response)
        
        return response
    
    def handle_intent(self, intent, message, entities):
        """의도별 핸들러"""
        
        handlers = {
            'greeting': self.handle_greeting,
            'add_meal': self.handle_add_meal,
            'add_exercise': self.handle_add_exercise,
            'recommend_meal': self.handle_recommend_meal,
            'recommend_exercise': self.handle_recommend_exercise,
            'check_progress': self.handle_check_progress,
            'today_summary': self.handle_today_summary,
            'help': self.handle_help,
            'water_reminder': self.handle_water_reminder,
            'motivation': self.handle_motivation,
        }
        
        handler = handlers.get(intent, self.handle_general_question)
        return handler(message, entities)
    
    def handle_greeting(self, message, entities):
        """인사 응답"""
        greetings = [
            "안녕하세요! 오늘도 건강한 하루 보내고 계신가요? 😊",
            "반갑습니다! 건강 관리를 도와드릴게요!",
            "안녕하세요! 무엇을 도와드릴까요?"
        ]
        return random.choice(greetings)
    
    def handle_add_meal(self, message, entities):
        """식사 기록 추가"""
        if 'food_name' not in entities:
            return {
                "message": "어떤 음식을 드셨나요? 음식 이름을 알려주세요!",
                "action": None
            }
        
        food_name = entities['food_name']
        
        # 음식 DB에서 칼로리 조회
        food_info = self.get_food_info(food_name)
        
        if not food_info:
            return {
                "message": f"'{food_name}'의 영양 정보를 찾을 수 없어요. 칼로리를 직접 입력해주시겠어요?",
                "action": None
            }
        
        # 식단 기록 추가
        meal_data = {
            "food_name": food_name,
            "calories": food_info['calories'],
            "meal_type": self.get_current_meal_type(),
            "date": datetime.now().strftime("%Y-%m-%d")
        }
        
        self.add_meal_to_db(meal_data)
        
        return {
            "message": f"✅ {food_name} ({food_info['calories']}kcal) 기록했어요!\n"
                      f"오늘 총 섭취: {self.get_today_calories()}kcal",
            "action": "meal_added",
            "data": meal_data
        }
    
    def handle_add_exercise(self, message, entities):
        """운동 기록 추가"""
        if 'exercise_name' not in entities:
            return {
                "message": "어떤 운동을 하셨나요?",
                "action": None
            }
        
        exercise_name = entities['exercise_name']
        duration = entities.get('duration', 30)  # 기본 30분
        
        # 운동 DB에서 칼로리 조회
        exercise_info = self.get_exercise_info(exercise_name)
        calories_burned = exercise_info['calories_per_min'] * duration
        
        # 운동 기록 추가
        exercise_data = {
            "exercise_name": exercise_name,
            "duration": duration,
            "calories_burned": calories_burned,
            "date": datetime.now().strftime("%Y-%m-%d")
        }
        
        self.add_exercise_to_db(exercise_data)
        
        return {
            "message": f"💪 {exercise_name} {duration}분 ({calories_burned}kcal 소모) 기록했어요!\n"
                      f"오늘 열심히 하셨네요! 👏",
            "action": "exercise_added",
            "data": exercise_data
        }
    
    def handle_recommend_meal(self, message, entities):
        """식단 추천"""
        # 현재 섭취 칼로리 확인
        current_intake = self.get_today_calories()
        daily_goal = self.get_daily_calorie_goal()
        remaining = daily_goal - current_intake
        
        # 현재 시간대에 맞는 식사 타입
        meal_type = self.get_current_meal_type()
        
        # AI 기반 추천 생성
        context = f"""
        사용자가 {meal_type} 메뉴를 추천받고 싶어합니다.
        - 남은 칼로리: {remaining}kcal
        - 현재 계절: {self.get_current_season()}
        - 목표: 건강한 다이어트
        
        적절한 메뉴를 추천해주세요.
        """
        
        ai_response = self.get_ai_recommendation(context)
        
        return {
            "message": ai_response,
            "action": "meal_recommended"
        }
    
    def handle_recommend_exercise(self, message, entities):
        """운동 추천"""
        # 날씨 정보 가져오기
        weather = self.get_weather_info()
        
        # 사용자 운동 이력 분석
        exercise_history = self.get_exercise_history(days=7)
        
        # AI 기반 추천
        context = f"""
        사용자에게 운동을 추천해주세요.
        - 날씨: {weather['condition']}, 온도: {weather['temp']}°C
        - 최근 7일 운동: {exercise_history}
        - 목표: 건강한 다이어트
        
        실내/실외 운동을 모두 추천해주세요.
        """
        
        ai_response = self.get_ai_recommendation(context)
        
        return {
            "message": ai_response,
            "action": "exercise_recommended"
        }
    
    def handle_check_progress(self, message, entities):
        """목표 진행 상황 확인"""
        progress = self.get_progress_data()
        
        message = f"""
📊 목표 진행 상황

⚖️ 체중
- 시작: {progress['start_weight']}kg
- 현재: {progress['current_weight']}kg
- 목표: {progress['target_weight']}kg
- 감량: {progress['weight_lost']}kg

📈 진행률: {progress['percentage']}%
📅 남은 기간: {progress['days_left']}일

{self.get_motivational_message(progress['percentage'])}
"""
        
        return {
            "message": message,
            "action": "show_progress",
            "data": progress
        }
    
    def handle_today_summary(self, message, entities):
        """오늘 요약"""
        summary = self.get_today_summary()
        
        message = f"""
📋 오늘의 요약

🍽️ 식단
- 섭취 칼로리: {summary['calories_intake']} / {summary['daily_goal']}kcal
- 남은 칼로리: {summary['remaining']}kcal

💪 운동
- 운동 시간: {summary['exercise_minutes']}분
- 소모 칼로리: {summary['calories_burned']}kcal

💧 수분
- 섭취량: {summary['water_intake']}ml / {summary['water_goal']}ml

{self.get_daily_tip()}
"""
        
        return {
            "message": message,
            "action": "show_summary",
            "data": summary
        }
    
    def handle_help(self, message, entities):
        """도움말"""
        return {
            "message": """
🤖 AI 어시스턴트 도움말

제가 도와드릴 수 있는 것들:

📝 기록
- "점심으로 샐러드 먹었어"
- "러닝 30분 했어"

💡 추천
- "오늘 저녁 뭐 먹을까?"
- "운동 추천해줘"

📊 조회
- "목표 진행률 보여줘"
- "오늘 현황 알려줘"

💧 기타
- "물 마시기 알려줘"
- "칼로리 계산해줘"

무엇이든 편하게 물어보세요! 😊
""",
            "action": None
        }
    
    def handle_general_question(self, message, entities):
        """일반 질문 - AI 응답"""
        # 사용자 컨텍스트 생성
        context_prompt = create_context_prompt(self.get_user_data())
        
        # AI 응답 생성
        full_prompt = f"{context_prompt}\n\n사용자 질문: {message}"
        ai_response = self.get_ai_response(full_prompt)
        
        return {
            "message": ai_response,
            "action": None
        }
    
    # 헬퍼 메서드들
    def get_ai_response(self, prompt):
        """AI 응답 생성"""
        if self.ai_engine == 'gpt-4':
            response = self.ai_client.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            return response.choices[0].message.content
        # 다른 엔진들도 유사하게 구현
    
    def save_conversation(self, user_msg, bot_response):
        """대화 기록 저장"""
        self.conversation_history.append({
            "timestamp": datetime.now(),
            "user": user_msg,
            "bot": bot_response.get('message', bot_response) if isinstance(bot_response, dict) else bot_response
        })
        
        # DB에 저장
        # save_to_db(self.user_id, self.conversation_history[-1])
```

---

## 🎨 GUI 통합 코드

### PyQt5 채팅 위젯

```python
from PyQt5.QtWidgets import *
from PyQt5.QtCore import *
from PyQt5.QtGui import *

class ChatWidget(QWidget):
    def __init__(self, chatbot):
        super().__init__()
        self.chatbot = chatbot
        self.init_ui()
    
    def init_ui(self):
        layout = QVBoxLayout()
        
        # 채팅 히스토리 영역
        self.chat_history = QTextEdit()
        self.chat_history.setReadOnly(True)
        self.chat_history.setStyleSheet("""
            QTextEdit {
                background-color: #f5f5f5;
                border: none;
                padding: 10px;
                font-size: 14px;
            }
        """)
        
        # 입력 영역
        input_layout = QHBoxLayout()
        
        self.message_input = QLineEdit()
        self.message_input.setPlaceholderText("메시지를 입력하세요...")
        self.message_input.returnPressed.connect(self.send_message)
        self.message_input.setStyleSheet("""
            QLineEdit {
                border: 2px solid #ddd;
                border-radius: 20px;
                padding: 10px 15px;
                font-size: 14px;
            }
        """)
        
        self.send_button = QPushButton("전송")
        self.send_button.clicked.connect(self.send_message)
        self.send_button.setStyleSheet("""
            QPushButton {
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 20px;
                padding: 10px 20px;
                font-size: 14px;
            }
            QPushButton:hover {
                background-color: #45a049;
            }
        """)
        
        input_layout.addWidget(self.message_input)
        input_layout.addWidget(self.send_button)
        
        # 빠른 질문 버튼
        quick_questions_layout = QHBoxLayout()
        quick_questions = [
            "오늘 뭐 먹을까?",
            "운동 추천해줘",
            "목표 진행률은?",
            "물 마시기 알려줘"
        ]
        
        for question in quick_questions:
            btn = QPushButton(question)
            btn.clicked.connect(lambda checked, q=question: self.send_quick_question(q))
            btn.setStyleSheet("""
                QPushButton {
                    background-color: #e0e0e0;
                    border: none;
                    border-radius: 15px;
                    padding: 8px 12px;
                    font-size: 12px;
                }
                QPushButton:hover {
                    background-color: #d0d0d0;
                }
            """)
            quick_questions_layout.addWidget(btn)
        
        layout.addWidget(QLabel("💬 AI 어시스턴트"))
        layout.addWidget(self.chat_history)
        layout.addLayout(input_layout)
        layout.addLayout(quick_questions_layout)
        
        self.setLayout(layout)
        
        # 환영 메시지
        self.add_bot_message("안녕하세요! 건강 관리를 도와드릴 AI 어시스턴트입니다. 😊")
    
    def send_message(self):
        """메시지 전송"""
        message = self.message_input.text().strip()
        if not message:
            return
        
        # 사용자 메시지 표시
        self.add_user_message(message)
        self.message_input.clear()
        
        # 로딩 표시
        self.add_bot_message("💭 생각하는 중...")
        
        # AI 응답 생성 (별도 스레드에서)
        self.worker = ResponseWorker(self.chatbot, message)
        self.worker.response_ready.connect(self.handle_response)
        self.worker.start()
    
    def send_quick_question(self, question):
        """빠른 질문 전송"""
        self.message_input.setText(question)
        self.send_message()
    
    def handle_response(self, response):
        """AI 응답 처리"""
        # 로딩 메시지 제거
        cursor = self.chat_history.textCursor()
        cursor.movePosition(QTextCursor.End)
        cursor.movePosition(QTextCursor.StartOfBlock, QTextCursor.KeepAnchor)
        cursor.movePosition(QTextCursor.Up, QTextCursor.KeepAnchor)
        cursor.removeSelectedText()
        
        # 실제 응답 표시
        if isinstance(response, dict):
            self.add_bot_message(response['message'])
            
            # 액션 처리
            if response.get('action'):
                self.handle_action(response['action'], response.get('data'))
        else:
            self.add_bot_message(response)
    
    def add_user_message(self, message):
        """사용자 메시지 추가"""
        self.chat_history.append(f'<div style="text-align: right; margin: 10px;">'
                                 f'<span style="background-color: #4CAF50; color: white; '
                                 f'padding: 8px 12px; border-radius: 15px; display: inline-block;">'
                                 f'{message}</span></div>')
    
    def add_bot_message(self, message):
        """봇 메시지 추가"""
        self.chat_history.append(f'<div style="text-align: left; margin: 10px;">'
                                 f'<span style="background-color: #e0e0e0; color: black; '
                                 f'padding: 8px 12px; border-radius: 15px; display: inline-block;">'
                                 f'🤖 {message}</span></div>')
    
    def handle_action(self, action, data):
        """액션 처리"""
        if action == 'meal_added':
            # 식단 탭으로 전환 또는 업데이트
            pass
        elif action == 'exercise_added':
            # 운동 탭으로 전환 또는 업데이트
            pass
        elif action == 'show_progress':
            # 진행률 차트 표시
            pass


class ResponseWorker(QThread):
    """AI 응답 생성 워커 스레드"""
    response_ready = pyqtSignal(object)
    
    def __init__(self, chatbot, message):
        super().__init__()
        self.chatbot = chatbot
        self.message = message
    
    def run(self):
        """백그라운드에서 AI 응답 생성"""
        response = self.chatbot.process_message(self.message)
        self.response_ready.emit(response)
```

---

## 🚀 고급 기능

### 1. 음성 인식 통합

```python
import speech_recognition as sr

class VoiceChatbot:
    def __init__(self, chatbot):
        self.chatbot = chatbot
        self.recognizer = sr.Recognizer()
    
    def listen(self):
        """음성 입력 듣기"""
        with sr.Microphone() as source:
            print("🎤 듣는 중...")
            audio = self.recognizer.listen(source)
        
        try:
            text = self.recognizer.recognize_google(audio, language='ko-KR')
            print(f"인식된 텍스트: {text}")
            return text
        except sr.UnknownValueError:
            return None
        except sr.RequestError:
            return None
    
    def speak(self, text):
        """텍스트를 음성으로 변환"""
        from gtts import gTTS
        import pygame
        
        tts = gTTS(text=text, lang='ko')
        tts.save("response.mp3")
        
        pygame.mixer.init()
        pygame.mixer.music.load("response.mp3")
        pygame.mixer.music.play()
```

### 2. 컨텍스트 메모리

```python
class ConversationMemory:
    def __init__(self, max_history=10):
        self.history = []
        self.max_history = max_history
        self.context = {}
    
    def add_turn(self, user_msg, bot_response):
        """대화 턴 추가"""
        self.history.append({
            'user': user_msg,
            'bot': bot_response,
            'timestamp': datetime.now()
        })
        
        # 최대 히스토리 유지
        if len(self.history) > self.max_history:
            self.history.pop(0)
    
    def get_context(self):
        """대화 컨텍스트 생성"""
        context = "## 최근 대화 기록\n"
        for turn in self.history[-5:]:  # 최근 5턴
            context += f"사용자: {turn['user']}\n"
            context += f"어시스턴트: {turn['bot']}\n"
        return context
    
    def update_context(self, key, value):
        """컨텍스트 정보 업데이트"""
        self.context[key] = value
```

### 3. 감정 분석

```python
from textblob import TextBlob

def analyze_sentiment(text):
    """사용자 메시지의 감정 분석"""
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    
    if polarity > 0.3:
        return 'positive'
    elif polarity < -0.3:
        return 'negative'
    else:
        return 'neutral'

def adjust_tone(sentiment):
    """감정에 따른 톤 조절"""
    if sentiment == 'negative':
        return "저도 함께 응원하고 있어요! 💪 힘내세요!"
    elif sentiment == 'positive':
        return "정말 잘하고 계시네요! 👏 계속 화이팅!"
    else:
        return ""
```

---

## 📊 성능 모니터링

### 메트릭 수집

```python
import time
from collections import defaultdict

class ChatbotMetrics:
    def __init__(self):
        self.metrics = defaultdict(list)
    
    def log_response_time(self, duration):
        """응답 시간 기록"""
        self.metrics['response_time'].append(duration)
    
    def log_intent_accuracy(self, predicted, actual):
        """의도 분류 정확도 기록"""
        correct = predicted == actual
        self.metrics['intent_accuracy'].append(correct)
    
    def log_user_satisfaction(self, rating):
        """사용자 만족도 기록"""
        self.metrics['satisfaction'].append(rating)
    
    def get_stats(self):
        """통계 조회"""
        return {
            'avg_response_time': sum(self.metrics['response_time']) / len(self.metrics['response_time']),
            'intent_accuracy': sum(self.metrics['intent_accuracy']) / len(self.metrics['intent_accuracy']),
            'avg_satisfaction': sum(self.metrics['satisfaction']) / len(self.metrics['satisfaction'])
        }
```

---

## 🧪 테스트 시나리오

```python
import unittest

class TestChatbot(unittest.TestCase):
    def setUp(self):
        self.chatbot = HealthChatbot(user_id=1)
    
    def test_greeting(self):
        response = self.chatbot.process_message("안녕하세요")
        self.assertIn("안녕", response['message'])
    
    def test_add_meal(self):
        response = self.chatbot.process_message("점심으로 샐러드 먹었어")
        self.assertEqual(response['action'], 'meal_added')
        self.assertIn('샐러드', response['data']['food_name'])
    
    def test_recommend_meal(self):
        response = self.chatbot.process_message("저녁 뭐 먹을까?")
        self.assertIn('추천', response['message'].lower())
    
    def test_check_progress(self):
        response = self.chatbot.process_message("목표 진행률 보여줘")
        self.assertEqual(response['action'], 'show_progress')

if __name__ == '__main__':
    unittest.main()
```

---

## 🔐 보안 및 프라이버시

### 1. 데이터 보호
- API 키는 환경 변수로 관리
- 민감한 건강 정보는 로컬 DB에만 저장
- AI 요청 시 개인 식별 정보 제거

### 2. 입력 검증
```python
def sanitize_input(text):
    """사용자 입력 검증"""
    # SQL 인젝션 방지
    text = text.replace("'", "''")
    
    # XSS 방지
    text = text.replace("<", "&lt;").replace(">", "&gt;")
    
    # 최대 길이 제한
    if len(text) > 500:
        text = text[:500]
    
    return text
```

---

## 📈 개선 로드맵

### Phase 1 (MVP) - 2주
- [x] 기본 의도 분류
- [x] 규칙 기반 응답
- [x] 간단한 GUI 통합

### Phase 2 - 2주
- [ ] AI API 통합 (GPT/Gemini)
- [ ] 컨텍스트 메모리
- [ ] 데이터 기반 추천

### Phase 3 - 2주
- [ ] 음성 인식/TTS
- [ ] 감정 분석
- [ ] 고급 개인화

### Phase 4 - 지속적
- [ ] 모델 파인튜닝
- [ ] A/B 테스팅
- [ ] 사용자 피드백 반영

---

## 💡 베스트 프랙티스

1. **점진적 개선**: 간단한 규칙 기반으로 시작해서 AI를 점진적으로 도입
2. **사용자 피드백**: 응답에 👍/👎 버튼 추가해서 지속적으로 개선
3. **폴백 처리**: AI가 이해 못하면 명확한 안내 메시지 제공
4. **성능 최적화**: 자주 묻는 질문은 캐싱
5. **윤리적 고려**: 의학적 진단/처방은 하지 않고 전문의 상담 권유

