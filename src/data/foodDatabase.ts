// 식단 데이터베이스 - 100가지 다양한 메뉴

export interface FoodMenu {
  id: string;
  name: string;
  category: '한식' | '양식' | '중식' | '일식' | '샐러드' | '스무디' | '간식' | '디저트';
  calories: number;
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  ingredients: string[];
  cookingTime: number; // 분
  difficulty: '쉬움' | '보통' | '어려움';
  season: '봄' | '여름' | '가을' | '겨울' | '사계절';
  cookingSteps?: string[]; // 조리 방법
  description?: string; // 메뉴 설명
}

export const foodMenuDatabase: FoodMenu[] = [
  // 한식 (30개)
  {
    id: '1', name: '현미밥과 된장찌개', category: '한식', calories: 450, protein: 18, carbs: 65, fat: 12,
    ingredients: ['현미', '두부', '된장', '애호박', '양파'],
    cookingTime: 30, difficulty: '쉬움', season: '사계절',
    description: '구수한 된장찌개와 건강한 현미밥의 조합',
    cookingSteps: [
      '현미를 씻어 30분 불린 후 밥솥에 넣고 취사합니다',
      '냄비에 물을 붓고 된장을 풀어줍니다',
      '두부와 애호박, 양파를 한입 크기로 썰어 넣습니다',
      '중불에서 10분간 끓인 후 대파를 넣고 마무리합니다'
    ]
  },
  {
    id: '2', name: '비빔밥', category: '한식', calories: 520, protein: 22, carbs: 75, fat: 15,
    ingredients: ['밥', '시금치', '콩나물', '당근', '고사리', '계란'],
    cookingTime: 40, difficulty: '보통', season: '사계절',
    description: '다양한 나물과 고추장이 어우러진 영양 만점 한식',
    cookingSteps: [
      '각각의 나물을 데쳐서 참기름과 소금으로 무칩니다',
      '당근은 채 썰어 살짝 볶아줍니다',
      '계란 후라이를 만듭니다',
      '따뜻한 밥 위에 나물들을 예쁘게 담고 계란을 얹습니다',
      '고추장과 참기름을 곁들여 비벼 먹습니다'
    ]
  },
  {
    id: '3', name: '삼계탕', category: '한식', calories: 600, protein: 45, carbs: 35, fat: 25,
    ingredients: ['닭', '인삼', '대추', '마늘', '찹쌀'],
    cookingTime: 90, difficulty: '보통', season: '여름',
    description: '여름 보양식의 대표 메뉴, 인삼과 닭고기의 영양이 가득',
    cookingSteps: [
      '영계를 깨끗이 씻고 내장을 제거합니다',
      '찹쌀, 대추, 마늘, 인삼을 닭 뱃속에 넣습니다',
      '냄비에 닭을 넣고 물을 자작하게 부어줍니다',
      '센 불로 끓이다가 끓어오르면 중불로 줄여 60분간 푹 끓입니다',
      '소금과 후추로 간을 맞춰 완성합니다'
    ]
  },
  {
    id: '4', name: '김치찌개', category: '한식', calories: 380, protein: 20, carbs: 28, fat: 18,
    ingredients: ['김치', '두부', '돼지고기', '대파'],
    cookingTime: 30, difficulty: '쉬움', season: '사계절',
    description: '묵은 김치로 끓인 얼큰하고 시원한 국물 요리',
    cookingSteps: [
      '김치와 돼지고기를 적당한 크기로 썰어줍니다',
      '냄비에 식용유를 두르고 돼지고기를 먼저 볶습니다',
      '김치를 넣고 함께 볶다가 물을 부어줍니다',
      '끓어오르면 두부를 넣고 15분간 더 끓입니다',
      '대파와 고춧가루를 넣어 마무리합니다'
    ]
  },
  {
    id: '5', name: '닭가슴살 샐러드', category: '한식', calories: 280, protein: 35, carbs: 15, fat: 8,
    ingredients: ['닭가슴살', '양상추', '토마토', '오이', '참깨드레싱'],
    cookingTime: 20, difficulty: '쉬움', season: '사계절',
    description: '고단백 저칼로리 다이어트 식단의 정석',
    cookingSteps: [
      '닭가슴살을 끓는 물에 삶아 익힙니다',
      '양상추, 토마토, 오이를 깨끗이 씻어 먹기 좋게 썰어줍니다',
      '삶은 닭가슴살을 손으로 찢거나 얇게 썰어줍니다',
      '그릇에 채소를 담고 닭가슴살을 올립니다',
      '참깨드레싱을 뿌려 완성합니다'
    ]
  },
  { id: '6', name: '두부김치', category: '한식', calories: 320, protein: 18, carbs: 25, fat: 16, ingredients: ['두부', '김치', '돼지고기', '대파'], cookingTime: 25, difficulty: '쉬움', season: '사계절' },
  { id: '7', name: '콩나물국밥', category: '한식', calories: 420, protein: 20, carbs: 60, fat: 10, ingredients: ['콩나물', '밥', '달걀', '새우젓'], cookingTime: 30, difficulty: '쉬움', season: '사계절' },
  { id: '8', name: '불고기', category: '한식', calories: 480, protein: 38, carbs: 35, fat: 20, ingredients: ['소고기', '양파', '당근', '대파', '간장'], cookingTime: 40, difficulty: '보통', season: '사계절' },
  { id: '9', name: '된장국과 생선구이', category: '한식', calories: 350, protein: 32, carbs: 28, fat: 12, ingredients: ['고등어', '된장', '두부', '애호박'], cookingTime: 35, difficulty: '보통', season: '사계절' },
  { id: '10', name: '냉면', category: '한식', calories: 480, protein: 18, carbs: 75, fat: 12, ingredients: ['메밀면', '오이', '배', '달걀', '육수'], cookingTime: 30, difficulty: '보통', season: '여름' },
  { id: '11', name: '잡채', category: '한식', calories: 420, protein: 15, carbs: 55, fat: 16, ingredients: ['당면', '시금치', '당근', '목이버섯', '소고기'], cookingTime: 45, difficulty: '보통', season: '사계절' },
  { id: '12', name: '미역국', category: '한식', calories: 180, protein: 12, carbs: 15, fat: 8, ingredients: ['미역', '소고기', '마늘', '참기름'], cookingTime: 30, difficulty: '쉬움', season: '사계절' },
  { id: '13', name: '계란말이', category: '한식', calories: 220, protein: 18, carbs: 8, fat: 14, ingredients: ['계란', '당근', '파', '소금'], cookingTime: 15, difficulty: '쉬움', season: '사계절' },
  { id: '14', name: '순두부찌개', category: '한식', calories: 280, protein: 16, carbs: 20, fat: 15, ingredients: ['순두부', '조개', '고춧가루', '대파'], cookingTime: 25, difficulty: '쉬움', season: '사계절' },
  { id: '15', name: '김밥', category: '한식', calories: 380, protein: 14, carbs: 58, fat: 12, ingredients: ['김', '밥', '단무지', '시금치', '당근', '햄'], cookingTime: 35, difficulty: '보통', season: '사계절' },
  { id: '16', name: '떡국', category: '한식', calories: 420, protein: 18, carbs: 62, fat: 12, ingredients: ['떡', '소고기', '달걀', '김'], cookingTime: 40, difficulty: '보통', season: '겨울' },
  { id: '17', name: '제육볶음', category: '한식', calories: 520, protein: 32, carbs: 38, fat: 25, ingredients: ['돼지고기', '양파', '고추장', '대파'], cookingTime: 30, difficulty: '보통', season: '사계절' },
  { id: '18', name: '북어국', category: '한식', calories: 180, protein: 22, carbs: 12, fat: 6, ingredients: ['북어', '두부', '달걀', '대파'], cookingTime: 35, difficulty: '쉬움', season: '겨울' },
  { id: '19', name: '갈비찜', category: '한식', calories: 650, protein: 42, carbs: 48, fat: 32, ingredients: ['소갈비', '당근', '밤', '대추', '간장'], cookingTime: 90, difficulty: '어려움', season: '사계절' },
  { id: '20', name: '나물 비빔밥', category: '한식', calories: 450, protein: 16, carbs: 68, fat: 12, ingredients: ['밥', '시금치', '도라지', '고사리', '고추장'], cookingTime: 45, difficulty: '보통', season: '봄' },
  { id: '21', name: '해물파전', category: '한식', calories: 480, protein: 24, carbs: 52, fat: 18, ingredients: ['밀가루', '오징어', '새우', '파', '달걀'], cookingTime: 30, difficulty: '보통', season: '사계절' },
  { id: '22', name: '참치김치찌개', category: '한식', calories: 320, protein: 28, carbs: 22, fat: 14, ingredients: ['참치', '김치', '두부', '대파'], cookingTime: 25, difficulty: '쉬움', season: '사계절' },
  { id: '23', name: '오징어볶음', category: '한식', calories: 380, protein: 32, carbs: 28, fat: 16, ingredients: ['오징어', '양파', '고추장', '당근'], cookingTime: 25, difficulty: '보통', season: '사계절' },
  { id: '24', name: '청국장찌개', category: '한식', calories: 350, protein: 22, carbs: 32, fat: 15, ingredients: ['청국장', '두부', '김치', '대파'], cookingTime: 30, difficulty: '쉬움', season: '겨울' },
  { id: '25', name: '쌈밥', category: '한식', calories: 420, protein: 18, carbs: 55, fat: 14, ingredients: ['밥', '상추', '쌈장', '고추', '마늘'], cookingTime: 20, difficulty: '쉬움', season: '봄' },
  { id: '26', name: '육개장', category: '한식', calories: 480, protein: 35, carbs: 38, fat: 20, ingredients: ['소고기', '고사리', '대파', '고춧가루'], cookingTime: 60, difficulty: '보통', season: '여름' },
  { id: '27', name: '동태찌개', category: '한식', calories: 320, protein: 28, carbs: 22, fat: 12, ingredients: ['동태', '두부', '무', '고춧가루'], cookingTime: 35, difficulty: '쉬움', season: '겨울' },
  { id: '28', name: '계란찜', category: '한식', calories: 180, protein: 14, carbs: 6, fat: 12, ingredients: ['계란', '새우젓', '대파'], cookingTime: 15, difficulty: '쉬움', season: '사계절' },
  { id: '29', name: '호박전', category: '한식', calories: 280, protein: 10, carbs: 38, fat: 10, ingredients: ['애호박', '밀가루', '달걀', '소금'], cookingTime: 25, difficulty: '쉬움', season: '여름' },
  { id: '30', name: '닭볶음탕', category: '한식', calories: 580, protein: 42, carbs: 45, fat: 24, ingredients: ['닭', '감자', '당근', '고추장', '대파'], cookingTime: 50, difficulty: '보통', season: '사계절' },

  // 양식 (20개)
  {
    id: '31', name: '그릴드 치킨 샐러드', category: '양식', calories: 420, protein: 45, carbs: 25, fat: 16,
    ingredients: ['닭가슴살', '로메인', '토마토', '파마산치즈', '시저드레싱'],
    cookingTime: 30, difficulty: '쉬움', season: '사계절',
    description: '구운 닭가슴살과 신선한 채소의 완벽한 조화',
    cookingSteps: [
      '닭가슴살에 소금, 후추로 밑간을 합니다',
      '그릴 팬을 달궈 닭가슴살을 앞뒤로 7분씩 굽습니다',
      '로메인과 토마토를 깨끗이 씻어 물기를 뺍니다',
      '구운 닭가슴살을 먹기 좋게 슬라이스합니다',
      '접시에 채소를 담고 닭가슴살을 올린 후 시저드레싱과 파마산치즈를 뿌립니다'
    ]
  },
  {
    id: '32', name: '연어 스테이크', category: '양식', calories: 520, protein: 48, carbs: 32, fat: 22,
    ingredients: ['연어', '아스파라거스', '레몬', '올리브오일'],
    cookingTime: 25, difficulty: '보통', season: '사계절',
    description: '오메가-3가 풍부한 연어와 신선한 채소',
    cookingSteps: [
      '연어에 소금, 후추로 간을 합니다',
      '팬에 올리브오일을 두르고 연어를 껍질 면부터 굽습니다',
      '껍질이 바삭해지면 뒤집어 3분 더 굽습니다',
      '아스파라거스를 같은 팬에 소금, 올리브오일과 함께 볶습니다',
      '접시에 담고 레몬을 곁들여 완성합니다'
    ]
  },
  {
    id: '33', name: '치킨 브레스트 구이', category: '양식', calories: 380, protein: 52, carbs: 18, fat: 12,
    ingredients: ['닭가슴살', '브로콜리', '마늘', '허브'],
    cookingTime: 35, difficulty: '쉬움', season: '사계절',
    description: '허브 향이 가득한 건강한 닭가슴살 요리',
    cookingSteps: [
      '닭가슴살을 두드려 두께를 고르게 만듭니다',
      '소금, 후추, 다진 마늘, 허브로 마리네이드합니다',
      '예열한 오븐 팬에 닭가슴살을 올립니다',
      '180도 오븐에서 25분간 굽습니다',
      '브로콜리를 데쳐서 함께 곁들입니다'
    ]
  },
  { id: '34', name: '퀴노아 볼', category: '양식', calories: 450, protein: 20, carbs: 62, fat: 14, ingredients: ['퀴노아', '아보카도', '방울토마토', '병아리콩'], cookingTime: 30, difficulty: '쉬움', season: '사계절' },
  { id: '35', name: '그릭 요거트 파르페', category: '양식', calories: 280, protein: 18, carbs: 38, fat: 8, ingredients: ['그릭요거트', '그래놀라', '베리', '꿀'], cookingTime: 10, difficulty: '쉬움', season: '사계절' },
  { id: '36', name: '터키 샌드위치', category: '양식', calories: 420, protein: 32, carbs: 45, fat: 14, ingredients: ['칠면조', '통밀빵', '양상추', '토마토', '머스타드'], cookingTime: 15, difficulty: '쉬움', season: '사계절' },
  { id: '37', name: '새우 파스타', category: '양식', calories: 580, protein: 28, carbs: 72, fat: 20, ingredients: ['새우', '파스타', '마늘', '올리브오일', '파슬리'], cookingTime: 30, difficulty: '보통', season: '사계절' },
  { id: '38', name: '미네스트로네 수프', category: '양식', calories: 220, protein: 12, carbs: 35, fat: 6, ingredients: ['토마토', '콩', '파스타', '채소'], cookingTime: 40, difficulty: '보통', season: '겨울' },
  { id: '39', name: '구운 야채 샐러드', category: '양식', calories: 280, protein: 8, carbs: 38, fat: 12, ingredients: ['호박', '파프리카', '가지', '발사믹'], cookingTime: 35, difficulty: '쉬움', season: '사계절' },
  { id: '40', name: '오믈렛', category: '양식', calories: 320, protein: 24, carbs: 12, fat: 20, ingredients: ['계란', '버섯', '치즈', '시금치'], cookingTime: 15, difficulty: '쉬움', season: '사계절' },
  { id: '41', name: '터키 칠리', category: '양식', calories: 480, protein: 38, carbs: 48, fat: 16, ingredients: ['칠면조 간 고기', '검은콩', '토마토', '고추'], cookingTime: 45, difficulty: '보통', season: '사계절' },
  { id: '42', name: '참치 샐러드', category: '양식', calories: 340, protein: 32, carbs: 22, fat: 14, ingredients: ['참치', '믹스그린', '올리브', '레몬드레싱'], cookingTime: 15, difficulty: '쉬움', season: '사계절' },
  { id: '43', name: '스테이크와 구운 감자', category: '양식', calories: 650, protein: 48, carbs: 52, fat: 28, ingredients: ['소고기', '감자', '로즈마리', '마늘'], cookingTime: 45, difficulty: '보통', season: '사계절' },
  { id: '44', name: '새우 아보카도 샐러드', category: '양식', calories: 380, protein: 28, carbs: 24, fat: 20, ingredients: ['새우', '아보카도', '양상추', '라임'], cookingTime: 20, difficulty: '쉬움', season: '사계절' },
  { id: '45', name: '토마토 바질 파스타', category: '양식', calories: 520, protein: 18, carbs: 78, fat: 16, ingredients: ['파스타', '토마토', '바질', '마늘', '올리브오일'], cookingTime: 25, difficulty: '쉬움', season: '여름' },
  { id: '46', name: '렌틸콩 수프', category: '양식', calories: 320, protein: 20, carbs: 48, fat: 6, ingredients: ['렌틸콩', '당근', '셀러리', '양파'], cookingTime: 50, difficulty: '쉬움', season: '겨울' },
  { id: '47', name: '구운 닭다리', category: '양식', calories: 480, protein: 42, carbs: 28, fat: 22, ingredients: ['닭다리', '감자', '당근', '허브'], cookingTime: 60, difficulty: '보통', season: '사계절' },
  { id: '48', name: '에그 베네딕트', category: '양식', calories: 520, protein: 28, carbs: 42, fat: 26, ingredients: ['잉글리시머핀', '계란', '베이컨', '홀랜다이즈소스'], cookingTime: 25, difficulty: '어려움', season: '사계절' },
  { id: '49', name: '시저 샐러드', category: '양식', calories: 380, protein: 22, carbs: 28, fat: 20, ingredients: ['로메인', '크루통', '파마산', '시저드레싱', '닭가슴살'], cookingTime: 20, difficulty: '쉬움', season: '사계절' },
  { id: '50', name: '브로콜리 수프', category: '양식', calories: 220, protein: 12, carbs: 28, fat: 8, ingredients: ['브로콜리', '양파', '우유', '치즈'], cookingTime: 30, difficulty: '쉬움', season: '겨울' },

  // 중식 (15개)
  {
    id: '51', name: '닭가슴살 야채볶음', category: '중식', calories: 420, protein: 38, carbs: 35, fat: 16,
    ingredients: ['닭가슴살', '브로콜리', '파프리카', '간장'],
    cookingTime: 25, difficulty: '쉬움', season: '사계절',
    description: '고단백 저지방의 건강한 중식 볶음 요리',
    cookingSteps: [
      '닭가슴살을 한입 크기로 썰어 간장, 전분으로 밑간합니다',
      '브로콜리와 파프리카를 먹기 좋게 썰어줍니다',
      '센 불에 기름을 두르고 닭가슴살을 먼저 볶습니다',
      '닭고기가 익으면 야채를 넣고 빠르게 볶아줍니다',
      '굴소스와 간장으로 간을 맞춰 완성합니다'
    ]
  },
  {
    id: '52', name: '두부 마파두부', category: '중식', calories: 380, protein: 22, carbs: 28, fat: 20,
    ingredients: ['두부', '돼지고기', '고추', '두반장'],
    cookingTime: 30, difficulty: '보통', season: '사계절',
    description: '얼큰하고 매콤한 사천식 두부 요리',
    cookingSteps: [
      '두부를 깍둑썰기하고 소금물에 데칩니다',
      '다진 돼지고기를 기름에 볶다가 두반장을 넣습니다',
      '고춧가루와 마늘을 넣고 향을 냅니다',
      '물과 간장을 넣고 끓이다가 두부를 넣습니다',
      '전분물로 농도를 맞추고 파를 뿌려 마무리합니다'
    ]
  },
  {
    id: '53', name: '새우 볶음밥', category: '중식', calories: 520, protein: 24, carbs: 68, fat: 18,
    ingredients: ['새우', '밥', '계란', '완두콩', '당근'],
    cookingTime: 20, difficulty: '쉬움', season: '사계절',
    description: '간단하지만 맛있는 중식 볶음밥의 기본',
    cookingSteps: [
      '새우는 손질하여 준비하고, 야채는 잘게 다집니다',
      '센 불에 기름을 두르고 계란을 스크램블합니다',
      '새우와 야채를 넣고 빠르게 볶습니다',
      '찬 밥을 넣고 주걱으로 으깨며 볶아줍니다',
      '간장과 소금으로 간을 맞춰 완성합니다'
    ]
  },
  { id: '54', name: '짬뽕', category: '중식', calories: 580, protein: 28, carbs: 72, fat: 20, ingredients: ['면', '해물', '양배추', '고춧가루'], cookingTime: 35, difficulty: '보통', season: '사계절' },
  { id: '55', name: '팔보채', category: '중식', calories: 480, protein: 32, carbs: 42, fat: 20, ingredients: ['해산물', '야채', '전분', '간장'], cookingTime: 30, difficulty: '보통', season: '사계절' },
  { id: '56', name: '깐풍기', category: '중식', calories: 520, protein: 35, carbs: 48, fat: 22, ingredients: ['닭고기', '고추', '마늘', '간장', '설탕'], cookingTime: 35, difficulty: '보통', season: '사계절' },
  { id: '57', name: '탕수육', category: '중식', calories: 620, protein: 32, carbs: 68, fat: 26, ingredients: ['돼지고기', '전분', '파인애플', '소스'], cookingTime: 40, difficulty: '보통', season: '사계절' },
  { id: '58', name: '볶음우동', category: '중식', calories: 520, protein: 22, carbs: 72, fat: 16, ingredients: ['우동면', '야채', '간장', '굴소스'], cookingTime: 20, difficulty: '쉬움', season: '사계절' },
  { id: '59', name: '고추잡채', category: '중식', calories: 420, protein: 18, carbs: 55, fat: 14, ingredients: ['당면', '고추', '돼지고기', '간장'], cookingTime: 30, difficulty: '보통', season: '사계절' },
  { id: '60', name: '양장피', category: '중식', calories: 380, protein: 24, carbs: 42, fat: 14, ingredients: ['해파리', '오이', '당면', '겨자소스'], cookingTime: 35, difficulty: '보통', season: '여름' },
  { id: '61', name: '유산슬', category: '중식', calories: 420, protein: 28, carbs: 38, fat: 18, ingredients: ['해산물', '야채', '전분', '굴소스'], cookingTime: 30, difficulty: '보통', season: '사계절' },
  { id: '62', name: '동파육', category: '중식', calories: 680, protein: 38, carbs: 42, fat: 38, ingredients: ['돼지고기', '간장', '설탕', '팔각'], cookingTime: 120, difficulty: '어려움', season: '겨울' },
  { id: '63', name: '중국식 만두', category: '중식', calories: 480, protein: 22, carbs: 58, fat: 18, ingredients: ['밀가루', '돼지고기', '부추', '간장'], cookingTime: 45, difficulty: '보통', season: '사계절' },
  { id: '64', name: '라조기', category: '중식', calories: 520, protein: 36, carbs: 45, fat: 22, ingredients: ['닭고기', '고추', '땅콩', '간장'], cookingTime: 30, difficulty: '보통', season: '사계절' },
  { id: '65', name: '양꼬치', category: '중식', calories: 580, protein: 42, carbs: 28, fat: 32, ingredients: ['양고기', '양파', '향신료'], cookingTime: 40, difficulty: '보통', season: '사계절' },

  // 일식 (15개)
  {
    id: '66', name: '연어 사시미', category: '일식', calories: 320, protein: 38, carbs: 12, fat: 14,
    ingredients: ['연어', '와사비', '간장', '무'],
    cookingTime: 15, difficulty: '쉬움', season: '사계절',
    description: '신선한 연어의 풍미를 그대로 느낄 수 있는 일식',
    cookingSteps: [
      '신선한 연어를 준비하고 껍질과 뼈를 제거합니다',
      '연어를 사시미 칼로 얇게 슬라이스합니다',
      '무를 가늘게 채 썰어 접시에 깔아줍니다',
      '연어 사시미를 예쁘게 담습니다',
      '와사비와 간장을 곁들여 냅니다'
    ]
  },
  {
    id: '67', name: '초밥', category: '일식', calories: 420, protein: 24, carbs: 68, fat: 8,
    ingredients: ['밥', '생선', '김', '와사비'],
    cookingTime: 40, difficulty: '어려움', season: '사계절',
    description: '일본 전통 요리의 정수를 담은 스시',
    cookingSteps: [
      '밥에 초밥 식초를 섞어 초밥용 밥을 만듭니다',
      '생선을 얇게 슬라이스합니다',
      '손에 식초물을 묻히고 밥을 적당량 쥡니다',
      '와사비를 살짝 바르고 생선을 올립니다',
      '모양을 잡아 초밥을 완성하고 간장과 함께 냅니다'
    ]
  },
  { id: '68', name: '돈까스', category: '일식', calories: 620, protein: 38, carbs: 58, fat: 28, ingredients: ['돼지고기', '빵가루', '양배추', '소스'], cookingTime: 35, difficulty: '보통', season: '사계절' },
  { id: '69', name: '우동', category: '일식', calories: 380, protein: 16, carbs: 68, fat: 6, ingredients: ['우동면', '육수', '파', '유부'], cookingTime: 25, difficulty: '쉬움', season: '사계절' },
  { id: '70', name: '덮밥 (규동)', category: '일식', calories: 580, protein: 32, carbs: 75, fat: 18, ingredients: ['소고기', '밥', '양파', '간장'], cookingTime: 30, difficulty: '쉬움', season: '사계절' },
  { id: '71', name: '라멘', category: '일식', calories: 620, protein: 28, carbs: 78, fat: 22, ingredients: ['면', '돼지고기', '계란', '파', '육수'], cookingTime: 45, difficulty: '보통', season: '사계절' },
  { id: '72', name: '테리야키 치킨', category: '일식', calories: 480, protein: 42, carbs: 38, fat: 16, ingredients: ['닭고기', '간장', '미림', '설탕'], cookingTime: 35, difficulty: '쉬움', season: '사계절' },
  { id: '73', name: '미소 된장국', category: '일식', calories: 80, protein: 6, carbs: 10, fat: 2, ingredients: ['된장', '두부', '미역', '파'], cookingTime: 15, difficulty: '쉬움', season: '사계절' },
  { id: '74', name: '장어덮밥', category: '일식', calories: 680, protein: 38, carbs: 82, fat: 22, ingredients: ['장어', '밥', '소스', '김'], cookingTime: 40, difficulty: '보통', season: '여름' },
  { id: '75', name: '오코노미야키', category: '일식', calories: 520, protein: 22, carbs: 62, fat: 20, ingredients: ['밀가루', '양배추', '돼지고기', '계란', '소스'], cookingTime: 30, difficulty: '보통', season: '사계절' },
  { id: '76', name: '모둠튀김', category: '일식', calories: 580, protein: 24, carbs: 58, fat: 28, ingredients: ['새우', '야채', '튀김가루', '소스'], cookingTime: 35, difficulty: '보통', season: '사계절' },
  { id: '77', name: '가츠동', category: '일식', calories: 720, protein: 42, carbs: 78, fat: 28, ingredients: ['돈까스', '밥', '계란', '양파'], cookingTime: 40, difficulty: '보통', season: '사계절' },
  { id: '78', name: '차완무시', category: '일식', calories: 180, protein: 14, carbs: 12, fat: 8, ingredients: ['계란', '새우', '버섯', '육수'], cookingTime: 25, difficulty: '보통', season: '사계절' },
  { id: '79', name: '야키소바', category: '일식', calories: 520, protein: 20, carbs: 72, fat: 16, ingredients: ['중화면', '양배추', '돼지고기', '소스'], cookingTime: 25, difficulty: '쉬움', season: '사계절' },
  { id: '80', name: '연어 구이', category: '일식', calories: 420, protein: 42, carbs: 18, fat: 20, ingredients: ['연어', '레몬', '소금', '후추'], cookingTime: 20, difficulty: '쉬움', season: '사계절' },

  // 샐러드 (10개)
  { id: '81', name: '코브 샐러드', category: '샐러드', calories: 480, protein: 38, carbs: 22, fat: 28, ingredients: ['닭가슴살', '베이컨', '아보카도', '달걀', '블루치즈'], cookingTime: 25, difficulty: '쉬움', season: '사계절' },
  { id: '82', name: '카프레제 샐러드', category: '샐러드', calories: 320, protein: 18, carbs: 12, fat: 22, ingredients: ['토마토', '모짜렐라', '바질', '발사믹'], cookingTime: 10, difficulty: '쉬움', season: '여름' },
  { id: '83', name: '니코이즈 샐러드', category: '샐러드', calories: 420, protein: 32, carbs: 28, fat: 20, ingredients: ['참치', '감자', '올리브', '계란', '그린빈'], cookingTime: 30, difficulty: '보통', season: '사계절' },
  { id: '84', name: '퀴노아 샐러드', category: '샐러드', calories: 380, protein: 16, carbs: 48, fat: 14, ingredients: ['퀴노아', '오이', '토마토', '페타치즈', '레몬'], cookingTime: 30, difficulty: '쉬움', season: '사계절' },
  { id: '85', name: '칠리 라임 새우 샐러드', category: '샐러드', calories: 340, protein: 32, carbs: 22, fat: 16, ingredients: ['새우', '믹스그린', '망고', '라임', '칠리'], cookingTime: 20, difficulty: '쉬움', season: '여름' },
  { id: '86', name: '그릭 샐러드', category: '샐러드', calories: 320, protein: 12, carbs: 18, fat: 22, ingredients: ['오이', '토마토', '올리브', '페타치즈', '양파'], cookingTime: 15, difficulty: '쉬움', season: '사계절' },
  { id: '87', name: '케일 샐러드', category: '샐러드', calories: 280, protein: 14, carbs: 28, fat: 14, ingredients: ['케일', '크랜베리', '호두', '파마산', '레몬드레싱'], cookingTime: 15, difficulty: '쉬움', season: '사계절' },
  { id: '88', name: '발사믹 닭가슴살 샐러드', category: '샐러드', calories: 380, protein: 42, carbs: 24, fat: 14, ingredients: ['닭가슴살', '믹스그린', '방울토마토', '발사믹'], cookingTime: 25, difficulty: '쉬움', season: '사계절' },
  { id: '89', name: '훈제연어 샐러드', category: '샐러드', calories: 420, protein: 28, carbs: 22, fat: 24, ingredients: ['훈제연어', '루꼴라', '케이퍼', '크림치즈'], cookingTime: 15, difficulty: '쉬움', season: '사계절' },
  { id: '90', name: '두부 샐러드', category: '샐러드', calories: 280, protein: 18, carbs: 22, fat: 14, ingredients: ['두부', '양상추', '토마토', '참깨드레싱'], cookingTime: 20, difficulty: '쉬움', season: '사계절' },

  // 스무디/간식/디저트 (10개)
  { id: '91', name: '베리 스무디', category: '스무디', calories: 220, protein: 8, carbs: 42, fat: 4, ingredients: ['블루베리', '딸기', '바나나', '그릭요거트'], cookingTime: 10, difficulty: '쉬움', season: '사계절' },
  { id: '92', name: '그린 스무디', category: '스무디', calories: 180, protein: 6, carbs: 35, fat: 3, ingredients: ['시금치', '바나나', '사과', '아몬드우유'], cookingTime: 10, difficulty: '쉬움', season: '사계절' },
  { id: '93', name: '단백질 쉐이크', category: '스무디', calories: 280, protein: 32, carbs: 28, fat: 6, ingredients: ['단백질파우더', '바나나', '아몬드우유', '땅콩버터'], cookingTime: 5, difficulty: '쉬움', season: '사계절' },
  { id: '94', name: '아보카도 토스트', category: '간식', calories: 320, protein: 12, carbs: 38, fat: 16, ingredients: ['통밀빵', '아보카도', '계란', '토마토'], cookingTime: 15, difficulty: '쉬움', season: '사계절' },
  { id: '95', name: '그래놀라 볼', category: '간식', calories: 380, protein: 16, carbs: 52, fat: 12, ingredients: ['그래놀라', '그릭요거트', '베리', '꿀'], cookingTime: 10, difficulty: '쉬움', season: '사계절' },
  { id: '96', name: '땅콩버터 바나나 토스트', category: '간식', calories: 340, protein: 14, carbs: 45, fat: 14, ingredients: ['통밀빵', '땅콩버터', '바나나'], cookingTime: 10, difficulty: '쉬움', season: '사계절' },
  { id: '97', name: '후무스와 야채 스틱', category: '간식', calories: 220, protein: 10, carbs: 28, fat: 8, ingredients: ['병아리콩', '타히니', '당근', '셀러리'], cookingTime: 15, difficulty: '쉬움', season: '사계절' },
  { id: '98', name: '과일 샐러드', category: '디저트', calories: 180, protein: 2, carbs: 42, fat: 2, ingredients: ['딸기', '키위', '파인애플', '망고', '민트'], cookingTime: 15, difficulty: '쉬움', season: '여름' },
  { id: '99', name: '오트밀 쿠키', category: '디저트', calories: 280, protein: 8, carbs: 42, fat: 10, ingredients: ['오트밀', '바나나', '계란', '건포도'], cookingTime: 30, difficulty: '쉬움', season: '사계절' },
  { id: '100', name: '치아씨드 푸딩', category: '디저트', calories: 240, protein: 10, carbs: 32, fat: 10, ingredients: ['치아씨드', '아몬드우유', '꿀', '베리'], cookingTime: 120, difficulty: '쉬움', season: '사계절' },
];

/**
 * 카테고리별 메뉴 가져오기
 */
export function getMenusByCategory(category: string): FoodMenu[] {
  return foodMenuDatabase.filter(menu => menu.category === category);
}

/**
 * 칼로리 범위로 메뉴 필터링
 */
export function getMenusByCalories(minCal: number, maxCal: number): FoodMenu[] {
  return foodMenuDatabase.filter(menu => menu.calories >= minCal && menu.calories <= maxCal);
}

/**
 * 계절별 메뉴 가져오기
 */
export function getMenusBySeason(season: string): FoodMenu[] {
  return foodMenuDatabase.filter(menu => menu.season === season || menu.season === '사계절');
}

/**
 * 랜덤 메뉴 가져오기
 */
export function getRandomMenus(count: number, category?: string): FoodMenu[] {
  let pool = category ? getMenusByCategory(category) : foodMenuDatabase;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
