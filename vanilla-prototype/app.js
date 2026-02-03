// ========================================
// 상수 정의
// ========================================
const STORAGE_KEY = 'healthDiary_state';
const DEFAULT_GOAL = 2000;

// ========================================
// 전역 상태
// ========================================
let state = {
  dailyGoal: DEFAULT_GOAL,
  dietRecords: [],
  exerciseRecords: []
};

// ========================================
// 유틸리티 함수
// ========================================

/**
 * 날짜를 포맷팅합니다
 * @param {number} timestamp - 타임스탬프
 * @returns {string} 포맷된 날짜 문자열
 */
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 현재 날짜와 시간을 표시합니다
 */
function updateDateTime() {
  const now = new Date();
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  };
  const dateString = now.toLocaleDateString('ko-KR', options);
  document.getElementById('currentDate').textContent = dateString;
}

/**
 * 식사 유형을 한글로 변환합니다
 * @param {string} type - 식사 유형 (breakfast, lunch, dinner, snack)
 * @returns {string} 한글 식사 유형
 */
function getMealTypeLabel(type) {
  const labels = {
    breakfast: '아침',
    lunch: '점심',
    dinner: '저녁',
    snack: '간식'
  };
  return labels[type] || type;
}

/**
 * 숫자 유효성을 검증합니다
 * @param {any} value - 검증할 값
 * @returns {boolean} 유효한 숫자인지 여부
 */
function validateNumber(value) {
  const num = Number(value);
  return !isNaN(num) && num > 0;
}

/**
 * 고유 ID를 생성합니다
 * @returns {string} 고유 ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * 알림 메시지를 표시합니다
 * @param {string} message - 메시지 내용
 * @param {string} type - 알림 타입 (success, error, warning)
 */
function showNotification(message, type = 'success') {
  const container = document.getElementById('notificationContainer');
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️'
  };

  notification.innerHTML = `
    <span class="notification-icon">${icons[type] || icons.success}</span>
    <span class="notification-message">${message}</span>
  `;

  container.appendChild(notification);

  // 3초 후 자동 제거
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => {
      container.removeChild(notification);
    }, 300);
  }, 3000);
}

// ========================================
// 로컬 스토리지 관리
// ========================================

/**
 * 로컬 스토리지에서 데이터를 로드합니다
 */
function loadData() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      state = {
        dailyGoal: parsed.dailyGoal || DEFAULT_GOAL,
        dietRecords: parsed.dietRecords || [],
        exerciseRecords: parsed.exerciseRecords || []
      };
    }
  } catch (error) {
    console.error('데이터 로드 실패:', error);
    showNotification('데이터 로드에 실패했습니다.', 'error');
  }
}

/**
 * 현재 상태를 로컬 스토리지에 저장합니다
 */
function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('데이터 저장 실패:', error);
    showNotification('데이터 저장에 실패했습니다.', 'error');
  }
}

// ========================================
// 칼로리 계산 (CLAUDE.md 규칙 준수: 반올림 사용)
// ========================================

/**
 * 총 섭취 칼로리를 계산합니다
 * @returns {number} 총 섭취 칼로리 (반올림)
 */
function calculateTotalConsumed() {
  const total = state.dietRecords.reduce((sum, record) => {
    return sum + Number(record.calories);
  }, 0);
  return Math.round(total);
}

/**
 * 총 소모 칼로리를 계산합니다
 * @returns {number} 총 소모 칼로리 (반올림)
 */
function calculateTotalBurned() {
  const total = state.exerciseRecords.reduce((sum, record) => {
    return sum + Number(record.caloriesBurned);
  }, 0);
  return Math.round(total);
}

/**
 * 남은 칼로리를 계산합니다
 * @returns {number} 남은 칼로리
 */
function calculateRemaining() {
  const consumed = calculateTotalConsumed();
  const burned = calculateTotalBurned();
  const remaining = state.dailyGoal - consumed + burned;
  return Math.round(remaining);
}

/**
 * 목표 대비 진행률을 계산합니다
 * @returns {number} 진행률 (0-100+)
 */
function calculateProgress() {
  const consumed = calculateTotalConsumed();
  const burned = calculateTotalBurned();
  const net = consumed - burned;
  const progress = (net / state.dailyGoal) * 100;
  return Math.round(progress);
}

// ========================================
// 식단 기록 관리
// ========================================

/**
 * 식단 기록을 추가합니다
 * @param {string} mealType - 식사 유형
 * @param {string} foodName - 음식명
 * @param {number} calories - 칼로리
 */
function addDietRecord(mealType, foodName, calories) {
  // 입력값 검증
  if (!mealType || !foodName || !validateNumber(calories)) {
    showNotification('올바른 값을 입력해주세요.', 'error');
    return;
  }

  const record = {
    id: generateId(),
    mealType: mealType,
    foodName: foodName.trim(),
    calories: Math.round(Number(calories)),
    timestamp: Date.now()
  };

  state.dietRecords.push(record);
  saveData();
  renderDietList();
  renderDashboard();
  showNotification(`${foodName}이(가) 추가되었습니다.`, 'success');
}

/**
 * 식단 기록을 삭제합니다
 * @param {string} id - 기록 ID
 */
function deleteDietRecord(id) {
  const record = state.dietRecords.find(r => r.id === id);
  if (!record) return;

  state.dietRecords = state.dietRecords.filter(r => r.id !== id);
  saveData();
  renderDietList();
  renderDashboard();
  showNotification(`${record.foodName}이(가) 삭제되었습니다.`, 'success');
}

// ========================================
// 운동 기록 관리
// ========================================

/**
 * 운동 기록을 추가합니다
 * @param {string} exerciseName - 운동명
 * @param {number} caloriesBurned - 소모 칼로리
 */
function addExerciseRecord(exerciseName, caloriesBurned) {
  // 입력값 검증
  if (!exerciseName || !validateNumber(caloriesBurned)) {
    showNotification('올바른 값을 입력해주세요.', 'error');
    return;
  }

  const record = {
    id: generateId(),
    exerciseName: exerciseName.trim(),
    caloriesBurned: Math.round(Number(caloriesBurned)),
    timestamp: Date.now()
  };

  state.exerciseRecords.push(record);
  saveData();
  renderExerciseList();
  renderDashboard();
  showNotification(`${exerciseName}이(가) 추가되었습니다.`, 'success');
}

/**
 * 운동 기록을 삭제합니다
 * @param {string} id - 기록 ID
 */
function deleteExerciseRecord(id) {
  const record = state.exerciseRecords.find(r => r.id === id);
  if (!record) return;

  state.exerciseRecords = state.exerciseRecords.filter(r => r.id !== id);
  saveData();
  renderExerciseList();
  renderDashboard();
  showNotification(`${record.exerciseName}이(가) 삭제되었습니다.`, 'success');
}

// ========================================
// 목표 관리
// ========================================

/**
 * 일일 목표 칼로리를 설정합니다
 * @param {number} calories - 목표 칼로리
 */
function setDailyGoal(calories) {
  if (!validateNumber(calories)) {
    showNotification('올바른 목표 칼로리를 입력해주세요.', 'error');
    return;
  }

  const goal = Math.round(Number(calories));

  if (goal < 500 || goal > 5000) {
    showNotification('목표 칼로리는 500~5000 사이여야 합니다.', 'error');
    return;
  }

  state.dailyGoal = goal;
  saveData();
  renderDashboard();
  showNotification(`목표가 ${goal} kcal로 설정되었습니다.`, 'success');
}

// ========================================
// UI 렌더링
// ========================================

/**
 * 대시보드를 렌더링합니다
 */
function renderDashboard() {
  const consumed = calculateTotalConsumed();
  const burned = calculateTotalBurned();
  const remaining = calculateRemaining();
  const progress = calculateProgress();

  // 칼로리 수치 업데이트
  document.getElementById('consumedCalories').textContent = consumed;
  document.getElementById('burnedCalories').textContent = burned;
  document.getElementById('remainingCalories').textContent = remaining;

  // 남은 칼로리 색상 변경
  const remainingCard = document.querySelector('.stat-remaining');
  if (remaining < 0) {
    remainingCard.classList.add('over-goal');
  } else {
    remainingCard.classList.remove('over-goal');
  }

  // 진행률 업데이트
  const progressBar = document.getElementById('progressBar');
  const progressPercentage = document.getElementById('progressPercentage');

  const displayProgress = Math.min(progress, 100);
  progressBar.style.width = `${displayProgress}%`;
  progressBar.setAttribute('aria-valuenow', displayProgress);
  progressPercentage.textContent = `${progress}%`;

  // 진행률 바 색상 변경
  progressBar.className = 'progress-bar';
  if (progress >= 100) {
    progressBar.classList.add('danger');
  } else if (progress >= 80) {
    progressBar.classList.add('warning');
  }

  // 목표 입력 필드 업데이트
  document.getElementById('dailyGoalInput').value = state.dailyGoal;
}

/**
 * 식단 목록을 렌더링합니다
 */
function renderDietList() {
  const listContainer = document.getElementById('dietList');
  const countElement = document.getElementById('dietCount');

  countElement.textContent = `${state.dietRecords.length}개`;

  if (state.dietRecords.length === 0) {
    listContainer.innerHTML = '<p class="empty-message">아직 식단 기록이 없습니다.</p>';
    return;
  }

  // 최신 기록이 위로 오도록 정렬
  const sortedRecords = [...state.dietRecords].sort((a, b) => b.timestamp - a.timestamp);

  listContainer.innerHTML = sortedRecords.map(record => `
    <div class="list-item" data-id="${record.id}">
      <div class="item-content">
        <div class="item-header">
          <span class="item-name">${record.foodName}</span>
          <span class="item-calories consumed">${record.calories} kcal</span>
        </div>
        <div class="item-meta">
          <span class="meal-badge">${getMealTypeLabel(record.mealType)}</span>
          <span>${formatDate(record.timestamp)}</span>
        </div>
      </div>
      <button class="btn btn-delete" data-id="${record.id}" data-type="diet">
        삭제
      </button>
    </div>
  `).join('');
}

/**
 * 운동 목록을 렌더링합니다
 */
function renderExerciseList() {
  const listContainer = document.getElementById('exerciseList');
  const countElement = document.getElementById('exerciseCount');

  countElement.textContent = `${state.exerciseRecords.length}개`;

  if (state.exerciseRecords.length === 0) {
    listContainer.innerHTML = '<p class="empty-message">아직 운동 기록이 없습니다.</p>';
    return;
  }

  // 최신 기록이 위로 오도록 정렬
  const sortedRecords = [...state.exerciseRecords].sort((a, b) => b.timestamp - a.timestamp);

  listContainer.innerHTML = sortedRecords.map(record => `
    <div class="list-item" data-id="${record.id}">
      <div class="item-content">
        <div class="item-header">
          <span class="item-name">${record.exerciseName}</span>
          <span class="item-calories burned">-${record.caloriesBurned} kcal</span>
        </div>
        <div class="item-meta">
          <span>${formatDate(record.timestamp)}</span>
        </div>
      </div>
      <button class="btn btn-delete" data-id="${record.id}" data-type="exercise">
        삭제
      </button>
    </div>
  `).join('');
}

// ========================================
// 이벤트 리스너
// ========================================

/**
 * 모든 이벤트 리스너를 초기화합니다
 */
function initializeEventListeners() {
  // 식단 기록 폼 제출
  document.getElementById('dietForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const mealType = document.getElementById('mealType').value;
    const foodName = document.getElementById('foodName').value;
    const calories = document.getElementById('foodCalories').value;

    addDietRecord(mealType, foodName, calories);

    // 폼 초기화
    e.target.reset();
  });

  // 운동 기록 폼 제출
  document.getElementById('exerciseForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const exerciseName = document.getElementById('exerciseName').value;
    const calories = document.getElementById('exerciseCalories').value;

    addExerciseRecord(exerciseName, calories);

    // 폼 초기화
    e.target.reset();
  });

  // 목표 설정 버튼
  document.getElementById('setGoalBtn').addEventListener('click', () => {
    const goalInput = document.getElementById('dailyGoalInput');
    setDailyGoal(goalInput.value);
  });

  // 목표 입력 필드 엔터키 처리
  document.getElementById('dailyGoalInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      setDailyGoal(e.target.value);
    }
  });

  // 삭제 버튼 이벤트 위임
  document.getElementById('dietList').addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-delete')) {
      const id = e.target.dataset.id;
      if (confirm('이 기록을 삭제하시겠습니까?')) {
        deleteDietRecord(id);
      }
    }
  });

  document.getElementById('exerciseList').addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-delete')) {
      const id = e.target.dataset.id;
      if (confirm('이 기록을 삭제하시겠습니까?')) {
        deleteExerciseRecord(id);
      }
    }
  });

  // 초기화 버튼
  document.getElementById('resetBtn').addEventListener('click', () => {
    const confirmMessage = '모든 데이터를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.';
    if (confirm(confirmMessage)) {
      if (confirm('정말로 삭제하시겠습니까?')) {
        localStorage.removeItem(STORAGE_KEY);
        state = {
          dailyGoal: DEFAULT_GOAL,
          dietRecords: [],
          exerciseRecords: []
        };
        renderDashboard();
        renderDietList();
        renderExerciseList();
        showNotification('모든 데이터가 초기화되었습니다.', 'warning');
      }
    }
  });
}

// ========================================
// 앱 초기화
// ========================================

/**
 * 앱을 초기화합니다
 */
function initializeApp() {
  // 데이터 로드
  loadData();

  // 날짜/시간 업데이트
  updateDateTime();
  setInterval(updateDateTime, 60000); // 1분마다 업데이트

  // UI 렌더링
  renderDashboard();
  renderDietList();
  renderExerciseList();

  // 이벤트 리스너 등록
  initializeEventListeners();

  console.log('Healthy Diary 프로토타입이 시작되었습니다.');
}

// DOM 로드 완료 시 앱 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
