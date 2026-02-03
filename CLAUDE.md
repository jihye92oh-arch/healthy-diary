# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

건강한 다이어트 습관 형성을 돕는 개인 맞춤형 건강 관리 플랫폼 (Healthy Diary)
- 식단/운동 기록 및 칼로리 자동 계산
- 개인 목표 설정 및 진행률 트래킹
- AI 기반 계절별 맞춤 식단/운동 추천
- 날씨 고려한 실내외 운동 추천

## Technology Stack

**Frontend:** React 18 + TypeScript 5.0 + Tailwind CSS + Recharts + React Hook Form
**Backend:** Node.js 20 + Express + Prisma ORM
**Database:** PostgreSQL 15 + Redis (sessions/caching)
**External APIs:** OpenWeatherMap, Anthropic Claude API, 식품의약품안전처 API

## Development Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run specific test file
npm test -- path/to/test-file.test.ts

# Lint code
npm run lint

# Format code
npm run format
```

## Architecture

### Component Organization

- `components/diet/` - 식단 기록, 칼로리 추적, 계절별 추천 UI
- `components/exercise/` - 운동 기록, 실내외 운동 추천 UI
- `components/goal/` - 목표 설정 및 진행 차트
- `components/dashboard/` - 메인 대시보드 통합 뷰
- `components/common/` - 재사용 가능한 공통 컴포넌트

### Services Layer

Business logic과 외부 API 연동을 담당하는 핵심 레이어:
- `calorieService.ts` - 칼로리 계산 로직 (항상 반올림 사용, 버림 금지)
- `recommendationService.ts` - 추천 알고리즘
- `weatherService.ts` - OpenWeatherMap API 연동
- `aiService.ts` - Claude API를 통한 AI 추천 엔진

### Data Flow Architecture

#### 식단 기록 플로우
```
사용자 입력 → 음식 검색 (자동완성) → 영양 정보 조회 →
칼로리 자동 계산 → 일일 목표 진행률 업데이트 → DB 저장 →
대시보드 실시간 갱신
```

#### AI 운동 추천 플로우
```
사용자 프로필 조회 → 현재 계절/날씨 정보 조회 →
Claude API 호출 (실내/외 운동 추천) →
예상 소모 칼로리 계산 → UI 렌더링
```

#### 계절별 식단 추천 플로우
```
현재 계절 파악 → 제철 식재료 조회 → 목표 칼로리 확인 →
알레르기/선호도 필터링 → AI 식단 조합 생성 →
영양소 균형 검증 → 3가지 옵션 제시
```

### Authentication & Security

- JWT 토큰 (7일 유효)
- Redis 세션 관리
- 모든 API 요청 토큰 검증
- userId 기반 데이터 격리

## Critical Conventions

### 데이터 처리
- **칼로리 계산**: 항상 반올림 사용 (소수점 버림 절대 금지)
- **BMR/TDEE 계산 공식**: 임의 변경 금지
- **음식 데이터베이스**: 직접 수정 금지 (migration 사용)

### 타입 정의
모든 핵심 데이터 구조는 타입 정의 필수:
```typescript
interface DietRecord {
  id: string;
  userId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: FoodItem[];
  totalCalories: number;
  createdAt: Date;
}
```

### 보안
- API 키, 비밀번호 하드코딩 절대 금지
- 사용자 건강 데이터 로그 출력 금지
- 사용자 입력은 프론트/백엔드 양쪽 검증 (Zod 스키마)

### 성능
- React.memo, useMemo, useCallback 적절히 사용
- 이미지 lazy loading
- API 응답 캐싱 (React Query)
- 대용량 데이터는 페이지네이션 필수

### 코드 스타일
- 들여쓰기 2칸, 세미콜론 사용
- 컴포넌트: PascalCase (MealLogger.tsx)
- 함수/변수: camelCase (calculateCalories)
- 상수: UPPER_SNAKE_CASE (MAX_DAILY_CALORIES)
- 500줄 이상 단일 컴포넌트 파일 지양

## API 예시

```typescript
POST /api/diet/log
Request: {
  "mealType": "lunch",
  "foods": [
    { "name": "현미밥", "amount": 150, "unit": "g" },
    { "name": "닭가슴살", "amount": 100, "unit": "g" }
  ]
}

Response: {
  "success": true,
  "data": {
    "totalCalories": 450,
    "nutrients": { "protein": 35, "carbs": 65, "fat": 5 },
    "dailyProgress": 65
  }
}
```

## Current Season Context

현재 계절: 겨울/초봄 (2월)
- 식단 추천: 따뜻한 국물 요리, 뿌리채소, 제철 과일 (딸기, 한라봉)
- 운동 추천: 실내 (홈트레이닝, 요가), 실외 (가벼운 산책, 날씨 좋은 날만)
