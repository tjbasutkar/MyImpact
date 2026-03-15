'use client';

import { Achievement, Goal } from '../lib/types';
import { AchievementCard } from './AchievementCard';

interface TimelineProps {
  achievements: Achievement[];
  goals: Goal[];
  onDeleteAchievement?: (id: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ achievements, goals, onDeleteAchievement }) => {
  const sortedAchievements = [...achievements].sort((a, b) => b.date.getTime() - a.date.getTime());

  if (sortedAchievements.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No achievements yet. Start by adding your first achievement!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedAchievements.map(achievement => (
        <AchievementCard
          key={achievement.id}
          achievement={achievement}
          goals={goals}
          onDelete={onDeleteAchievement}
        />
      ))}
    </div>
  );
};