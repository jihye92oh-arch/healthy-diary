import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Goal,
  DietRecord,
  ExerciseLog,
  WeightLog,
  WaterLog,
} from '../types';
import {
  loadUser,
  saveUser,
  loadGoal,
  saveGoal,
  loadDietRecords,
  addDietRecord as addDietRecordToStorage,
  loadExerciseLogs,
  addExerciseLog as addExerciseLogToStorage,
  loadWeightLogs,
  addWeightLog as addWeightLogToStorage,
  loadWaterLogs,
  addWaterLog as addWaterLogToStorage,
  removeWaterLog as removeWaterLogFromStorage,
} from '../services/storageService';

interface AppContextType {
  user: User | null;
  setUser: (user: User) => void;
  goal: Goal | null;
  setGoal: (goal: Goal) => void;
  dietRecords: DietRecord[];
  addDietRecord: (record: DietRecord) => void;
  exerciseLogs: ExerciseLog[];
  addExerciseLog: (log: ExerciseLog) => void;
  weightLogs: WeightLog[];
  addWeightLog: (log: WeightLog) => void;
  waterLogs: WaterLog[];
  addWaterLog: (log: WaterLog) => void;
  removeWaterLog: (date: Date) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [goal, setGoalState] = useState<Goal | null>(null);
  const [dietRecords, setDietRecords] = useState<DietRecord[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadedUser = loadUser();
    const loadedGoal = loadGoal();
    const loadedDietRecords = loadDietRecords();
    const loadedExerciseLogs = loadExerciseLogs();
    const loadedWeightLogs = loadWeightLogs();
    const loadedWaterLogs = loadWaterLogs();

    if (loadedUser) setUserState(loadedUser);
    if (loadedGoal) setGoalState(loadedGoal);
    setDietRecords(loadedDietRecords);
    setExerciseLogs(loadedExerciseLogs);
    setWeightLogs(loadedWeightLogs);
    setWaterLogs(loadedWaterLogs);
  }, []);

  const setUser = (newUser: User) => {
    setUserState(newUser);
    saveUser(newUser);
  };

  const setGoal = (newGoal: Goal) => {
    setGoalState(newGoal);
    saveGoal(newGoal);
  };

  const addDietRecord = (record: DietRecord) => {
    const updated = addDietRecordToStorage(record);
    setDietRecords(updated);
  };

  const addExerciseLog = (log: ExerciseLog) => {
    const updated = addExerciseLogToStorage(log);
    setExerciseLogs(updated);
  };

  const addWeightLog = (log: WeightLog) => {
    const updated = addWeightLogToStorage(log);
    setWeightLogs(updated);
  };

  const addWaterLog = (log: WaterLog) => {
    const updated = addWaterLogToStorage(log);
    setWaterLogs(updated);
  };

  const removeWaterLog = (date: Date) => {
    const updated = removeWaterLogFromStorage(date);
    setWaterLogs(updated);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        goal,
        setGoal,
        dietRecords,
        addDietRecord,
        exerciseLogs,
        addExerciseLog,
        weightLogs,
        addWeightLog,
        waterLogs,
        addWaterLog,
        removeWaterLog,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
