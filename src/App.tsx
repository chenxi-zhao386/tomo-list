import React, { useState } from 'react';
import { Timer } from './components/Timer';
import { Dashboard } from './components/Dashboard';
import { History } from './components/History';
import { Settings } from './components/Settings';
import { Achievements } from './components/Achievements';
import { Clock, BarChart2, History as HistoryIcon, Settings as SettingsIcon, Trophy } from 'lucide-react';
import { cn } from './lib/utils';

type Tab = 'timer' | 'dashboard' | 'history' | 'achievements' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('timer');

  const renderTab = () => {
    switch (activeTab) {
      case 'timer': return <Timer />;
      case 'dashboard': return <Dashboard />;
      case 'history': return <History />;
      case 'achievements': return <Achievements />;
      case 'settings': return <Settings />;
      default: return <Timer />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Chrome Extension Popup Container Simulation */}
      <div className="w-full max-w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col relative border border-gray-200">
        
        {/* Header */}
        <header className="bg-indigo-600 text-white p-4 flex items-center justify-between flex-shrink-0 z-10 shadow-sm">
          <div className="flex items-center space-x-2">
            <Clock size={20} />
            <h1 className="font-bold tracking-wide">Focus Time</h1>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative bg-gray-50/50">
          {renderTab()}
        </main>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center p-2 pb-4 z-10">
          <NavItem 
            icon={<Clock size={20} />} 
            label="Timer" 
            isActive={activeTab === 'timer'} 
            onClick={() => setActiveTab('timer')} 
          />
          <NavItem 
            icon={<BarChart2 size={20} />} 
            label="Stats" 
            isActive={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<HistoryIcon size={20} />} 
            label="History" 
            isActive={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
          />
          <NavItem 
            icon={<Trophy size={20} />} 
            label="Badges" 
            isActive={activeTab === 'achievements'} 
            onClick={() => setActiveTab('achievements')} 
          />
          <NavItem 
            icon={<SettingsIcon size={20} />} 
            label="Settings" 
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
  );
}

function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all",
        isActive ? "text-indigo-600 bg-indigo-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
      )}
    >
      {icon}
      <span className="text-[10px] font-medium mt-1">{label}</span>
    </button>
  );
}
