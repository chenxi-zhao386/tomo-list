import React from 'react';
import { useStore, ACHIEVEMENTS } from '../store';
import { cn } from '../lib/utils';
import { Trophy } from 'lucide-react';

export function Achievements() {
  const { unlockedAchievements } = useStore();

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto pb-20">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
          <Trophy size={20} />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Achievements</h2>
      </div>

      <div className="space-y-3">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlockedAchievements.includes(achievement.id);
          
          return (
            <div 
              key={achievement.id}
              className={cn(
                "flex items-center p-4 rounded-xl border transition-all",
                isUnlocked 
                  ? "bg-white border-amber-200 shadow-sm" 
                  : "bg-gray-50 border-gray-100 opacity-60 grayscale"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full text-2xl mr-4 flex-shrink-0",
                isUnlocked ? "bg-amber-50" : "bg-gray-200"
              )}>
                {achievement.icon}
              </div>
              <div>
                <h4 className={cn(
                  "font-bold",
                  isUnlocked ? "text-gray-800" : "text-gray-500"
                )}>
                  {achievement.title}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {achievement.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
