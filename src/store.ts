import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth, db } from './firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

export type TaskMode = 'regular' | 'pomodoro';
export type TaskPriority = 'High' | 'Medium' | 'Low' | 'None';

export interface TaskRecord {
  id: string;
  name: string;
  mode: TaskMode;
  duration: number; // in seconds
  startTime: number;
  endTime: number;
  pomodorosCompleted?: number;
  priority: TaskPriority;
  tags?: string[];
}

export interface Settings {
  workDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  language: 'en' | 'zh';
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundType: 'bell' | 'ding' | 'pop';
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
  { id: 'tag_master', title: 'Categorizer', description: 'Use 3 different tags', icon: '🏷️' },
  { id: 'century', title: 'Century Club', description: 'Focus for 100 hours total', icon: '💯' },
];

interface AppState {
  settings: Settings;
  records: TaskRecord[];
  unlockedAchievements: string[];
  user: any | null;
  accessToken: string | null;
  setUser: (user: any | null) => void;
  setAccessToken: (token: string | null) => void;
  setRecords: (records: TaskRecord[]) => void;
  setSettings: (settings: Settings) => void;
  setUnlockedAchievements: (achievements: string[]) => void;
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
  language: 'zh',
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundType: 'bell',
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      records: [],
      unlockedAchievements: [],
      user: null,
      accessToken: null,
      
      setUser: (user) => set({ user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setRecords: (records) => set({ records }),
      setSettings: (settings) => set({ settings }),
      setUnlockedAchievements: (unlockedAchievements) => set({ unlockedAchievements }),
      
      updateSettings: (newSettings) => {
        set((state) => {
          const updatedSettings = { ...state.settings, ...newSettings };
          if (auth.currentUser) {
            setDoc(doc(db, 'users', auth.currentUser.uid), {
              settings: updatedSettings,
              updatedAt: Date.now()
            }, { merge: true }).catch(console.error);
          }
          return { settings: updatedSettings };
        });
      },
        
      addRecord: (record) => {
        const newRecord = { ...record, id: crypto.randomUUID() };
        set((state) => ({ records: [...state.records, newRecord] }));
        
        if (auth.currentUser) {
          setDoc(doc(db, 'records', newRecord.id), {
            ...newRecord,
            uid: auth.currentUser.uid,
            createdAt: Date.now()
          }).catch(console.error);
        }
        
        get().checkAchievements();
      },
      
      deleteRecord: (id) => {
        set((state) => ({ records: state.records.filter(r => r.id !== id) }));
        if (auth.currentUser) {
          deleteDoc(doc(db, 'records', id)).catch(console.error);
        }
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

        const totalDuration = records.reduce((acc, r) => acc + r.duration, 0);
        if (totalDuration >= 100 * 3600) newUnlocked.add('century');

        const uniqueTags = new Set(records.flatMap(r => r.tags || []));
        if (uniqueTags.size >= 3) newUnlocked.add('tag_master');
        
        if (newUnlocked.size > unlockedAchievements.length) {
          const updatedAchievements = Array.from(newUnlocked);
          set({ unlockedAchievements: updatedAchievements });
          
          if (auth.currentUser) {
            setDoc(doc(db, 'users', auth.currentUser.uid), {
              unlockedAchievements: updatedAchievements,
              updatedAt: Date.now()
            }, { merge: true }).catch(console.error);
          }
        }
      }
    }),
    {
      name: 'focus-time-storage',
    }
  )
);
