import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Coffee, Brain, AlertCircle } from 'lucide-react';
import { useStore, TaskMode, TaskPriority } from '../store';
import { cn } from '../lib/utils';
import { useTranslation } from '../lib/i18n';

type TimerState = 'idle' | 'running' | 'paused';
type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak';

const workerScript = `
  let timerId = null;
  self.onmessage = function(e) {
    if (e.data === 'start') {
      if (!timerId) {
        timerId = setInterval(() => self.postMessage('tick'), 1000);
      }
    } else if (e.data === 'stop') {
      clearInterval(timerId);
      timerId = null;
    }
  };
`;

export function Timer() {
  const { settings, addRecord } = useStore();
  const { t } = useTranslation();
  
  const [taskName, setTaskName] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [mode, setMode] = useState<TaskMode>('pomodoro');
  const [priority, setPriority] = useState<TaskPriority>('None');
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Regular mode state
  const [elapsed, setElapsed] = useState(0);
  
  // Pomodoro mode state
  const [phase, setPhase] = useState<PomodoroPhase>('work');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  
  const [startTime, setStartTime] = useState<number | null>(null);
  
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    workerRef.current = new Worker(URL.createObjectURL(blob));
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Reset timer when settings change and idle
  useEffect(() => {
    if (timerState === 'idle' && mode === 'pomodoro') {
      setTimeLeft(settings.workDuration * 60);
    }
  }, [settings.workDuration, timerState, mode]);

  const playSound = () => {
    if (!settings.soundEnabled) return;
    let url = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'; // bell
    if (settings.soundType === 'ding') {
      url = 'https://assets.mixkit.co/active_storage/sfx/2866/2866-preview.mp3';
    } else if (settings.soundType === 'pop') {
      url = 'https://assets.mixkit.co/active_storage/sfx/2688/2688-preview.mp3';
    }
    const audio = new Audio(url);
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
    setIsTransitioning(true);
    playSound();
    
    setTimeout(() => {
      let nextPhase: PomodoroPhase = 'work';
      let nextTime = settings.workDuration * 60;
      let autoStart = settings.autoStartPomodoros;

      if (phase === 'work') {
        const newCompleted = pomodorosCompleted + 1;
        setPomodorosCompleted(newCompleted);
        autoStart = settings.autoStartBreaks;
        
        if (newCompleted % settings.longBreakInterval === 0) {
          nextPhase = 'longBreak';
          nextTime = settings.longBreakDuration * 60;
          showNotification('Work Complete!', 'Time for a long break.');
        } else {
          nextPhase = 'shortBreak';
          nextTime = settings.shortBreakDuration * 60;
          showNotification('Work Complete!', 'Time for a short break.');
        }
      } else {
        showNotification('Break Over!', 'Time to get back to work.');
      }

      setPhase(nextPhase);
      setTimeLeft(nextTime);
      
      if (!autoStart) {
        setTimerState('paused');
      }
      setIsTransitioning(false);
    }, 2500); // 2.5s delay
  };

  useEffect(() => {
    if (!workerRef.current) return;

    workerRef.current.onmessage = () => {
      if (mode === 'regular') {
        setElapsed(prev => prev + 1);
      } else {
        setTimeLeft(prev => {
          if (prev <= 0) return 0;
          if (prev === 1) {
            setTimeout(() => handlePomodoroComplete(), 0);
            return 0;
          }
          return prev - 1;
        });
      }
    };

    if (timerState === 'running' && !isTransitioning) {
      workerRef.current.postMessage('start');
    } else {
      workerRef.current.postMessage('stop');
    }

    return () => {
      workerRef.current?.postMessage('stop');
    };
  }, [timerState, mode, phase, pomodorosCompleted, settings, isTransitioning]);

  const toggleTimer = () => {
    if (isTransitioning) return;
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
    setIsTransitioning(false);
    
    const duration = mode === 'regular' ? elapsed : (settings.workDuration * 60 - timeLeft) + (pomodorosCompleted * settings.workDuration * 60);
    
    if (duration > 0) {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      addRecord({
        name: taskName.trim() || 'Untitled Task',
        mode,
        duration,
        startTime: startTime || Date.now() - (duration * 1000),
        endTime: Date.now(),
        pomodorosCompleted: mode === 'pomodoro' ? pomodorosCompleted : undefined,
        priority,
        tags: tags.length > 0 ? tags : undefined
      });
    }
    
    // Reset
    setElapsed(0);
    setPhase('work');
    setTimeLeft(settings.workDuration * 60);
    setPomodorosCompleted(0);
    setStartTime(null);
    setTaskName('');
    setTagsInput('');
    setPriority('None');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const displayTime = mode === 'regular' ? formatTime(elapsed) : formatTime(timeLeft);

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      <div className="w-full max-w-sm space-y-2">
        <input
          type="text"
          placeholder={t('whatAreYouWorkingOn')}
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          disabled={timerState !== 'idle'}
          className="w-full px-3 py-2 text-center text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a73e8] disabled:opacity-50 transition-all"
        />
        
        <input
          type="text"
          placeholder={t('tags')}
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          disabled={timerState !== 'idle'}
          className="w-full px-3 py-1.5 text-center text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a73e8] disabled:opacity-50 transition-all"
        />
        
        <div className="flex justify-center space-x-2">
          {(['High', 'Medium', 'Low', 'None'] as TaskPriority[]).map(p => (
            <button
              key={p}
              onClick={() => { if (timerState === 'idle') setPriority(p) }}
              disabled={timerState !== 'idle'}
              className={cn(
                "px-2.5 py-1 text-[10px] font-medium rounded-full border transition-colors",
                priority === p 
                  ? p === 'High' ? "bg-red-100 text-red-700 border-red-200" 
                  : p === 'Medium' ? "bg-amber-100 text-amber-700 border-amber-200"
                  : p === 'Low' ? "bg-blue-100 text-blue-700 border-blue-200"
                  : "bg-gray-200 text-gray-700 border-gray-300"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50",
                timerState !== 'idle' && "opacity-50 cursor-not-allowed"
              )}
            >
              {p === 'None' ? t('noPriority') : p === 'High' ? t('high') : p === 'Medium' ? t('medium') : t('low')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => { if (timerState === 'idle') setMode('pomodoro') }}
          className={cn(
            "px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5",
            mode === 'pomodoro' ? "bg-white text-[#1a73e8] shadow-sm" : "text-gray-500 hover:text-gray-700",
            timerState !== 'idle' && "opacity-50 cursor-not-allowed"
          )}
        >
          <Coffee size={14} />
          <span>{t('pomodoro')}</span>
        </button>
        <button
          onClick={() => { if (timerState === 'idle') setMode('regular') }}
          className={cn(
            "px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5",
            mode === 'regular' ? "bg-white text-[#1a73e8] shadow-sm" : "text-gray-500 hover:text-gray-700",
            timerState !== 'idle' && "opacity-50 cursor-not-allowed"
          )}
        >
          <Brain size={14} />
          <span>{t('focus')}</span>
        </button>
      </div>

      <div className="relative flex flex-col items-center justify-center w-48 h-48 rounded-full border-[6px] border-blue-50 bg-white shadow-inner">
        {mode === 'pomodoro' && (
          <div className="absolute top-6 text-xs font-medium text-blue-400 uppercase tracking-widest">
            {phase === 'work' ? t('focus') : phase === 'shortBreak' ? t('shortBreak') : t('longBreak')}
          </div>
        )}
        <div className="text-5xl font-bold text-gray-800 tracking-tight font-mono">
          {displayTime}
        </div>
        {mode === 'pomodoro' && (
          <div className="absolute bottom-6 text-xs text-gray-400 font-medium">
            {t('pomodoros')}: {pomodorosCompleted}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTimer}
          className={cn(
            "flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg transition-transform hover:scale-105 active:scale-95",
            timerState === 'running' ? "bg-amber-500 hover:bg-amber-600" : "bg-[#1a73e8] hover:bg-blue-700"
          )}
        >
          {timerState === 'running' ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>
        
        {timerState !== 'idle' && (
          <button
            onClick={stopTimer}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-transform hover:scale-105 active:scale-95"
          >
            <Square size={20} fill="currentColor" />
          </button>
        )}
      </div>
    </div>
  );
}
