import React, { useState } from 'react';
import { Timer } from './components/Timer';
import { Dashboard } from './components/Dashboard';
import { History } from './components/History';
import { Settings } from './components/Settings';
import { Achievements } from './components/Achievements';
import { Auth } from './components/Auth';
import { FirebaseSync } from './components/FirebaseSync';
import { CalendarSync } from './components/CalendarSync';
import { Clock, BarChart2, History as HistoryIcon, Settings as SettingsIcon, Trophy, Calendar } from 'lucide-react';
import { cn } from './lib/utils';
import { useTranslation } from './lib/i18n';

type Tab = 'timer' | 'calendar' | 'dashboard' | 'history' | 'achievements' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('timer');
  const { t } = useTranslation();

  const renderTab = () => {
    switch (activeTab) {
      case 'timer': return <Timer />;
      case 'calendar': return <CalendarSync />;
      case 'dashboard': return <Dashboard />;
      case 'history': return <History />;
      case 'achievements': return <Achievements />;
      case 'settings': return <Settings />;
      default: return <Timer />;
    }
  };

  return (
    <FirebaseSync>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        {/* Chrome Extension Popup Container Simulation */}
        <div className="w-full max-w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col relative border border-gray-200 font-sans">
          
          {/* Header */}
          <header className="bg-[#1a73e8] text-white p-3 flex items-center justify-between flex-shrink-0 z-10 shadow-sm">
            <div className="flex items-center space-x-2">
              <Clock size={18} />
              <h1 className="font-semibold text-sm tracking-wide">{t('focusTime')}</h1>
            </div>
            <Auth />
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-hidden relative bg-gray-50/50">
            {renderTab()}
          </main>

          {/* Bottom Navigation */}
          <nav className="absolute bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center p-1.5 pb-3 z-10 overflow-x-auto hide-scrollbar">
            <NavItem 
              icon={<Clock size={18} />} 
              label={t('timer')} 
              isActive={activeTab === 'timer'} 
              onClick={() => setActiveTab('timer')} 
            />
            <NavItem 
              icon={<Calendar size={18} />} 
              label={t('calendar')} 
              isActive={activeTab === 'calendar'} 
              onClick={() => setActiveTab('calendar')} 
            />
            <NavItem 
              icon={<BarChart2 size={18} />} 
              label={t('stats')} 
              isActive={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
            />
            <NavItem 
              icon={<HistoryIcon size={18} />} 
              label={t('history')} 
              isActive={activeTab === 'history'} 
              onClick={() => setActiveTab('history')} 
            />
            <NavItem 
              icon={<SettingsIcon size={18} />} 
              label={t('settings')} 
              isActive={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')} 
            />
          </nav>
        </div>
        
        {/* Usage Instructions Overlay for the Web Preview */}
        <div className="absolute top-4 right-4 max-w-sm bg-white p-4 rounded-xl shadow-lg border border-gray-200 text-sm hidden md:block">
          <h3 className="font-bold text-gray-800 mb-2">Chrome Extension Ready</h3>
          <p className="text-gray-600 mb-2">This app is designed as a Chrome Extension popup (400x600).</p>
          <p className="text-gray-600">To install as a real extension:</p>
          <ol className="list-decimal list-inside text-gray-600 mt-1 space-y-1">
            <li>Run <code className="bg-gray-100 px-1 rounded">npm run build</code></li>
            <li>Open Chrome and go to <code className="bg-gray-100 px-1 rounded">chrome://extensions</code></li>
            <li>Enable "Developer mode"</li>
            <li>Click "Load unpacked" and select the <code className="bg-gray-100 px-1 rounded">dist</code> folder</li>
          </ol>
        </div>
      </div>
    </FirebaseSync>
  );
}

function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all",
        isActive ? "text-[#1a73e8] bg-blue-50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      )}
    >
      {icon}
      <span className="text-[9px] font-medium mt-1">{label}</span>
    </button>
  );
}
