import { useStore } from '../store';

const translations = {
  en: {
    timer: 'Timer',
    calendar: 'Calendar',
    stats: 'Stats',
    history: 'History',
    badges: 'Badges',
    settings: 'Settings',
    focusTime: 'Focus Time',
    whatAreYouWorkingOn: 'What are you working on?',
    pomodoro: 'Pomodoro',
    focus: 'Focus',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
    noPriority: 'No Priority',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    pomodoros: 'Pomodoros',
    workDuration: 'Work Duration (min)',
    shortBreakDuration: 'Short Break (min)',
    longBreakDuration: 'Long Break (min)',
    longBreakInterval: 'Long Break Interval',
    soundAlerts: 'Sound Alerts',
    notifications: 'Notifications',
    language: 'Language',
    alerts: 'Alerts',
    pomodoroTimer: 'Pomodoro Timer',
    autoStartBreaks: 'Auto-start Breaks',
    autoStartPomodoros: 'Auto-start Pomodoros',
    soundType: 'Sound Type',
    bell: 'Bell',
    ding: 'Ding',
    pop: 'Pop',
    tags: 'Tags (comma separated)',
  },
  zh: {
    timer: '计时器',
    calendar: '日历',
    stats: '统计',
    history: '历史',
    badges: '成就',
    settings: '设置',
    focusTime: '专注时间',
    whatAreYouWorkingOn: '你正在专注做什么？',
    pomodoro: '番茄钟',
    focus: '正念专注',
    shortBreak: '短休息',
    longBreak: '长休息',
    noPriority: '无优先级',
    high: '高',
    medium: '中',
    low: '低',
    pomodoros: '番茄数',
    workDuration: '专注时长 (分钟)',
    shortBreakDuration: '短休息 (分钟)',
    longBreakDuration: '长休息 (分钟)',
    longBreakInterval: '长休息间隔',
    soundAlerts: '声音提示',
    notifications: '桌面通知',
    language: '语言 (Language)',
    alerts: '提醒设置',
    pomodoroTimer: '番茄钟设置',
    autoStartBreaks: '自动开始休息',
    autoStartPomodoros: '自动开始下一个番茄钟',
    soundType: '提示音类型',
    bell: '铃声',
    ding: '叮',
    pop: '啵',
    tags: '标签 (用逗号分隔)',
  }
};

export function useTranslation() {
  const { settings } = useStore();
  const lang = settings.language || 'en';
  
  return {
    t: (key: keyof typeof translations.en) => translations[lang][key] || translations.en[key],
    lang
  };
}
