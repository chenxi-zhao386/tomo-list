import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TaskMode = 'regular' | 'pomodoro';

export interface TaskRecord {
  id: string;
  name: string;
  mode: TaskMode;
  duration: number; // in seconds
  startTime: number;
  endTime: number;
  pomodorosCompleted?: number;
}

export interface Settings {
  workDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_focus', title: 'First Step', description: 'Complete your first focus session', icon: '🌱' },
  { id: 'novice', title: 'Focus Novice', description: 'Complete 5 focus sessions', icon: '🌿' },
  { id: 'master', title: 'Focus Master', description: 'Complete 20 focus sessions', icon: '🌳' },
  { id: 'pomodoro_lover', title: 'Tomato Lover', description: 'Complete 10 Pomodoros', icon: '🍅' },
  { id: 'marathon', title: 'Marathon', description: 'Focus for over 60 minutes in one session', icon: '🏃' },
];

interface AppState {
  settings: Settings;
  records: TaskRecord[];
  unlockedAchievements: string[];
  updateSettings: (newSettings: Partial<Settings>) => void;
  addRecord: (record: Omit<TaskRecord, 'id'>) => void;
  deleteRecord: (id: string) => void;
  checkAchievements: () => void;
}

const defaultSettings: Settings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  soundEnabled: true,
  notificationsEnabled: true,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      records: [],
      unlockedAchievements: [],
      
      updateSettings: (newSettings) => 
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),
        
      addRecord: (record) => {
        const newRecord = { ...record, id: crypto.randomUUID() };
        set((state) => ({ records: [...state.records, newRecord] }));
        get().checkAchievements();
      },
      
      deleteRecord: (id) => {
        set((state) => ({ records: state.records.filter(r => r.id !== id) }));
      },
      
      checkAchievements: () => {
        const { records, unlockedAchievements } = get();
        const newUnlocked = new Set(unlockedAchievements);
        
        if (records.length >= 1) newUnlocked.add('first_focus');
        if (records.length >= 5) newUnlocked.add('novice');
        if (records.length >= 20) newUnlocked.add('master');
        
        const totalPomodoros = records.reduce((acc, r) => acc + (r.pomodorosCompleted || 0), 0);
        if (totalPomodoros >= 10) newUnlocked.add('pomodoro_lover');
        
        const hasMarathon = records.some(r => r.duration >= 3600);
        if (hasMarathon) newUnlocked.add('marathon');
        
        if (newUnlocked.size > unlockedAchievements.length) {
          // Play sound or notify if needed
          set({ unlockedAchievements: Array.from(newUnlocked) });
        }
      }
    }),
    {
      name: 'focus-time-storage',
    }
  )
);
