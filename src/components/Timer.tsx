import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Coffee, Brain } from 'lucide-react';
import { useStore, TaskMode } from '../store';
import { cn } from '../lib/utils';

type TimerState = 'idle' | 'running' | 'paused';
type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak';

export function Timer() {
  const { settings, addRecord } = useStore();
  
  const [taskName, setTaskName] = useState('');
  const [mode, setMode] = useState<TaskMode>('pomodoro');
  const [timerState, setTimerState] = useState<TimerState>('idle');
  
  // Regular mode state
  const [elapsed, setElapsed] = useState(0);
  
  // Pomodoro mode state
  const [phase, setPhase] = useState<PomodoroPhase>('work');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  
  const [startTime, setStartTime] = useState<number | null>(null);
  
  const intervalRef = useRef<number | null>(null);

  // Reset timer when settings change and idle
  useEffect(() => {
    if (timerState === 'idle' && mode === 'pomodoro') {
      setTimeLeft(settings.workDuration * 60);
    }
  }, [settings.workDuration, timerState, mode]);

  const playSound = () => {
    if (!settings.soundEnabled) return;
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(() => {});
  };

  const showNotification = (title: string, body: string) => {
    if (!settings.notificationsEnabled) return;
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      });
    }
  };

  const handlePomodoroComplete = () => {
    playSound();
    if (phase === 'work') {
      const newCompleted = pomodorosCompleted + 1;
      setPomodorosCompleted(newCompleted);
      
      if (newCompleted % settings.longBreakInterval === 0) {
        setPhase('longBreak');
        setTimeLeft(settings.longBreakDuration * 60);
        showNotification('Work Complete!', 'Time for a long break.');
      } else {
        setPhase('shortBreak');
        setTimeLeft(settings.shortBreakDuration * 60);
        showNotification('Work Complete!', 'Time for a short break.');
      }
    } else {
      setPhase('work');
      setTimeLeft(settings.workDuration * 60);
      showNotification('Break Over!', 'Time to get back to work.');
    }
  };

  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = window.setInterval(() => {
        if (mode === 'regular') {
          setElapsed(prev => prev + 1);
        } else {
          setTimeLeft(prev => {
            if (prev <= 1) {
              handlePomodoroComplete();
              return 0; // Will be immediately updated by handlePomodoroComplete
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState, mode, phase, pomodorosCompleted, settings]);

  const toggleTimer = () => {
    if (timerState === 'idle') {
      setStartTime(Date.now());
      setTimerState('running');
      if (Notification.permission === 'default' && settings.notificationsEnabled) {
        Notification.requestPermission();
      }
    } else if (timerState === 'running') {
      setTimerState('paused');
    } else {
      setTimerState('running');
    }
  };

  const stopTimer = () => {
    if (timerState === 'idle') return;
    
    setTimerState('idle');
    
    const duration = mode === 'regular' ? elapsed : (settings.workDuration * 60 - timeLeft) + (pomodorosCompleted * settings.workDuration * 60);
    
    if (duration > 0) {
      addRecord({
        name: taskName.trim() || 'Untitled Task',
        mode,
        duration,
        startTime: startTime || Date.now() - (duration * 1000),
        endTime: Date.now(),
        pomodorosCompleted: mode === 'pomodoro' ? pomodorosCompleted : undefined
      });
    }
    
    // Reset
    setElapsed(0);
    setPhase('work');
    setTimeLeft(settings.workDuration * 60);
    setPomodorosCompleted(0);
    setStartTime(null);
    setTaskName('');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const displayTime = mode === 'regular' ? formatTime(elapsed) : formatTime(timeLeft);

  return (
    <div className="flex flex-col items-center p-6 space-y-6">
      <div className="w-full max-w-sm">
        <input
          type="text"
          placeholder="What are you working on?"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          disabled={timerState !== 'idle'}
          className="w-full px-4 py-3 text-center text-lg bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
        />
      </div>

      <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => { if (timerState === 'idle') setMode('pomodoro') }}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2",
            mode === 'pomodoro' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700",
            timerState !== 'idle' && "opacity-50 cursor-not-allowed"
          )}
        >
          <Coffee size={16} />
          <span>Pomodoro</span>
        </button>
        <button
          onClick={() => { if (timerState === 'idle') setMode('regular') }}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2",
            mode === 'regular' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700",
            timerState !== 'idle' && "opacity-50 cursor-not-allowed"
          )}
        >
          <Brain size={16} />
          <span>Focus</span>
        </button>
      </div>

      <div className="relative flex flex-col items-center justify-center w-64 h-64 rounded-full border-8 border-indigo-50 bg-white shadow-inner">
        {mode === 'pomodoro' && (
          <div className="absolute top-8 text-sm font-medium text-indigo-400 uppercase tracking-widest">
            {phase === 'work' ? 'Focus' : phase === 'shortBreak' ? 'Short Break' : 'Long Break'}
          </div>
        )}
        <div className="text-6xl font-bold text-gray-800 tracking-tight font-mono">
          {displayTime}
        </div>
        {mode === 'pomodoro' && (
          <div className="absolute bottom-8 text-sm text-gray-400 font-medium">
            Pomodoros: {pomodorosCompleted}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTimer}
          className={cn(
            "flex items-center justify-center w-16 h-16 rounded-full text-white shadow-lg transition-transform hover:scale-105 active:scale-95",
            timerState === 'running' ? "bg-amber-500 hover:bg-amber-600" : "bg-indigo-600 hover:bg-indigo-700"
          )}
        >
          {timerState === 'running' ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
        </button>
        
        {timerState !== 'idle' && (
          <button
            onClick={stopTimer}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-transform hover:scale-105 active:scale-95"
          >
            <Square size={24} fill="currentColor" />
          </button>
        )}
      </div>
    </div>
  );
}
