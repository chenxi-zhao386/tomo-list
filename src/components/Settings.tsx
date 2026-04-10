import React from 'react';
import { useStore } from '../store';
import { Bell, Volume2 } from 'lucide-react';

export function Settings() {
  const { settings, updateSettings } = useStore();

  const handleNotificationToggle = () => {
    if (!settings.notificationsEnabled) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          updateSettings({ notificationsEnabled: true });
        }
      });
    } else {
      updateSettings({ notificationsEnabled: false });
    }
  };

  return (
    <div className="p-6 space-y-8 h-full overflow-y-auto pb-20">
      <h2 className="text-xl font-bold text-gray-800">Settings</h2>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Pomodoro Timer</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <label className="text-sm font-medium text-gray-700">Work Duration (min)</label>
            <input
              type="number"
              min="1"
              max="120"
              value={settings.workDuration}
              onChange={(e) => updateSettings({ workDuration: parseInt(e.target.value) || 25 })}
              className="w-16 px-2 py-1 text-center text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <label className="text-sm font-medium text-gray-700">Short Break (min)</label>
            <input
              type="number"
              min="1"
              max="30"
              value={settings.shortBreakDuration}
              onChange={(e) => updateSettings({ shortBreakDuration: parseInt(e.target.value) || 5 })}
              className="w-16 px-2 py-1 text-center text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <label className="text-sm font-medium text-gray-700">Long Break (min)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={settings.longBreakDuration}
              onChange={(e) => updateSettings({ longBreakDuration: parseInt(e.target.value) || 15 })}
              className="w-16 px-2 py-1 text-center text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <label className="text-sm font-medium text-gray-700">Long Break Interval</label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.longBreakInterval}
              onChange={(e) => updateSettings({ longBreakInterval: parseInt(e.target.value) || 4 })}
              className="w-16 px-2 py-1 text-center text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Alerts</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Volume2 size={18} />
              </div>
              <span className="text-sm font-medium text-gray-700">Sound Alerts</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={settings.soundEnabled}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          
          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Bell size={18} />
              </div>
              <span className="text-sm font-medium text-gray-700">Notifications</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={settings.notificationsEnabled}
                onChange={handleNotificationToggle}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
