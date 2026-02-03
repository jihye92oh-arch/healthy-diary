import {
  User,
  Goal,
  DietRecord,
  ExerciseLog,
  WeightLog,
  WaterLog,
} from '../types';

const STORAGE_KEYS = {
  USER: 'healthy_diary_user',
  GOAL: 'healthy_diary_goal',
  DIET_RECORDS: 'healthy_diary_diet_records',
  EXERCISE_LOGS: 'healthy_diary_exercise_logs',
  WEIGHT_LOGS: 'healthy_diary_weight_logs',
  WATER_LOGS: 'healthy_diary_water_logs',
};

// Generic storage functions
function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
}

function loadFromStorage<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading from localStorage (${key}):`, error);
    return null;
  }
}

function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
  }
}

// User
export function saveUser(user: User): void {
  saveToStorage(STORAGE_KEYS.USER, user);
}

export function loadUser(): User | null {
  return loadFromStorage<User>(STORAGE_KEYS.USER);
}

// Goal
export function saveGoal(goal: Goal): void {
  saveToStorage(STORAGE_KEYS.GOAL, goal);
}

export function loadGoal(): Goal | null {
  return loadFromStorage<Goal>(STORAGE_KEYS.GOAL);
}

// Diet Records
export function saveDietRecords(records: DietRecord[]): void {
  saveToStorage(STORAGE_KEYS.DIET_RECORDS, records);
}

export function loadDietRecords(): DietRecord[] {
  return loadFromStorage<DietRecord[]>(STORAGE_KEYS.DIET_RECORDS) || [];
}

export function addDietRecord(record: DietRecord): DietRecord[] {
  const records = loadDietRecords();
  records.push(record);
  saveDietRecords(records);
  return records;
}

export function updateDietRecord(id: string, updatedRecord: Partial<DietRecord>): DietRecord[] {
  const records = loadDietRecords();
  const index = records.findIndex(r => r.id === id);
  if (index !== -1) {
    records[index] = { ...records[index], ...updatedRecord };
    saveDietRecords(records);
  }
  return records;
}

export function deleteDietRecord(id: string): DietRecord[] {
  const records = loadDietRecords().filter(r => r.id !== id);
  saveDietRecords(records);
  return records;
}

// Exercise Logs
export function saveExerciseLogs(logs: ExerciseLog[]): void {
  saveToStorage(STORAGE_KEYS.EXERCISE_LOGS, logs);
}

export function loadExerciseLogs(): ExerciseLog[] {
  return loadFromStorage<ExerciseLog[]>(STORAGE_KEYS.EXERCISE_LOGS) || [];
}

export function addExerciseLog(log: ExerciseLog): ExerciseLog[] {
  const logs = loadExerciseLogs();
  logs.push(log);
  saveExerciseLogs(logs);
  return logs;
}

export function deleteExerciseLog(id: string): ExerciseLog[] {
  const logs = loadExerciseLogs().filter(l => l.id !== id);
  saveExerciseLogs(logs);
  return logs;
}

// Weight Logs
export function saveWeightLogs(logs: WeightLog[]): void {
  saveToStorage(STORAGE_KEYS.WEIGHT_LOGS, logs);
}

export function loadWeightLogs(): WeightLog[] {
  return loadFromStorage<WeightLog[]>(STORAGE_KEYS.WEIGHT_LOGS) || [];
}

export function addWeightLog(log: WeightLog): WeightLog[] {
  const logs = loadWeightLogs();
  logs.push(log);
  saveWeightLogs(logs);
  return logs;
}

// Water Logs
export function saveWaterLogs(logs: WaterLog[]): void {
  saveToStorage(STORAGE_KEYS.WATER_LOGS, logs);
}

export function loadWaterLogs(): WaterLog[] {
  return loadFromStorage<WaterLog[]>(STORAGE_KEYS.WATER_LOGS) || [];
}

export function addWaterLog(log: WaterLog): WaterLog[] {
  const logs = loadWaterLogs();
  logs.push(log);
  saveWaterLogs(logs);
  return logs;
}

export function removeWaterLog(date: Date): WaterLog[] {
  const logs = loadWaterLogs();
  const dateStr = date.toISOString().split('T')[0];

  // Find the last water log for this date and remove it
  const dateLogsIndices = logs
    .map((log, index) => ({
      log,
      index,
      logDate: new Date(log.date).toISOString().split('T')[0],
    }))
    .filter((item) => item.logDate === dateStr)
    .map((item) => item.index);

  if (dateLogsIndices.length > 0) {
    // Remove the last one
    const lastIndex = dateLogsIndices[dateLogsIndices.length - 1];
    logs.splice(lastIndex, 1);
    saveWaterLogs(logs);
  }

  return logs;
}

// Clear all data
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeFromStorage(key);
  });
}

// Export data for backup
export function exportAllData(): string {
  const data = {
    user: loadUser(),
    goal: loadGoal(),
    dietRecords: loadDietRecords(),
    exerciseLogs: loadExerciseLogs(),
    weightLogs: loadWeightLogs(),
    waterLogs: loadWaterLogs(),
    exportDate: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

// Import data from backup
export function importAllData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);

    if (data.user) saveUser(data.user);
    if (data.goal) saveGoal(data.goal);
    if (data.dietRecords) saveDietRecords(data.dietRecords);
    if (data.exerciseLogs) saveExerciseLogs(data.exerciseLogs);
    if (data.weightLogs) saveWeightLogs(data.weightLogs);
    if (data.waterLogs) saveWaterLogs(data.waterLogs);

    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}
