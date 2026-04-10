import React from 'react';
import { useStore } from '../store';
import { Bell, Volume2, Globe } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

export function Settings() {
  const { settings, updateSettings } = useStore();
  const { t } = useTranslation();

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
      <h2 className="text-xl font-bold text-gray-800">{t('settings')}</h2>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{t('language')}</h3>
        
        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 text-[#1a73e8] rounded-lg">
              <Globe size={18} />
            </div>
            <span className="text-sm font-medium text-gray-700">Language / 语言</span>
          </div>
          <select
            value={settings.language || 'en'}
            onChange={(e) => updateSettings({ language: e.target.value as 'en' | 'zh' })}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
          >
            <option value="en">English</option>
            <option value="zh">中文</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{t('pomodoroTimer')}</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <label className="text-sm font-medium text-gray-700">{t('workDuration')}</label>
            <input
              type="number"
              min="1"
              max="120"
              value={settings.workDuration}
              onChange={(e) => updateSettings({ workDuration: parseInt(e.target.value) || 25 })}
              className="w-16 px-2 py-1 text-center text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
            />
          </div>
          
          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <label className="text-sm font-medium text-gray-700">{t('shortBreakDuration')}</label>
            <input
              type="number"
              min="1"
              max="30"
              value={settings.shortBreakDuration}
              onChange={(e) => updateSettings({ shortBreakDuration: parseInt(e.target.value) || 5 })}
              className="w-16 px-2 py-1 text-center text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
            />
          </div>
          
          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <label className="text-sm font-medium text-gray-700">{t('longBreakDuration')}</label>
            <input
              type="number"
              min="1"
              max="60"
              value={settings.longBreakDuration}
              onChange={(e) => updateSettings({ longBreakDuration: parseInt(e.target.value) || 15 })}
              className="w-16 px-2 py-1 text-center text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
            />
          </div>
          
          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <label className="text-sm font-medium text-gray-700">{t('longBreakInterval')}</label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.longBreakInterval}
              onChange={(e) => updateSettings({ longBreakInterval: parseInt(e.target.value) || 4 })}
              className="w-16 px-2 py-1 text-center text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
            />
          </div>

          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <label className="text-sm font-medium text-gray-700">{t('autoStartBreaks')}</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={settings.autoStartBreaks}
                onChange={(e) => updateSettings({ autoStartBreaks: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a73e8]"></div>
            </label>
          </div>

          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <label className="text-sm font-medium text-gray-700">{t('autoStartPomodoros')}</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={settings.autoStartPomodoros}
                onChange={(e) => updateSettings({ autoStartPomodoros: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a73e8]"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{t('alerts')}</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 text-[#1a73e8] rounded-lg">
                <Volume2 size={18} />
              </div>
              <span className="text-sm font-medium text-gray-700">{t('soundAlerts')}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={settings.soundEnabled}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a73e8]"></div>
            </label>
          </div>

          {settings.soundEnabled && (
            <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
              <span className="text-sm font-medium text-gray-700 ml-11">{t('soundType')}</span>
              <select
                value={settings.soundType || 'bell'}
                onChange={(e) => updateSettings({ soundType: e.target.value as 'bell' | 'ding' | 'pop' })}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
              >
                <option value="bell">{t('bell')}</option>
                <option value="ding">{t('ding')}</option>
                <option value="pop">{t('pop')}</option>
              </select>
            </div>
          )}
          
          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 text-[#1a73e8] rounded-lg">
                <Bell size={18} />
              </div>
              <span className="text-sm font-medium text-gray-700">{t('notifications')}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={settings.notificationsEnabled}
                onChange={handleNotificationToggle}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a73e8]"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
