'use client';

import { Achievement, Goal } from '../lib/types';

interface AchievementCardProps {
  achievement: Achievement;
  goals: Goal[];
  onDelete?: (id: string) => void;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, goals, onDelete }) => {
  const linkedGoal = goals.find(g => g.id === achievement.goalId);

  return (
    <div className="h-full min-h-[140px] bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border">
      <div className="flex h-full justify-between items-start">
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">{achievement.title}</h3>
          <p
            className="mt-1 flex-1 text-sm sm:text-base text-gray-600 dark:text-gray-300"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {achievement.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{achievement.date.toLocaleDateString()}</span>
            {linkedGoal && (
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                {linkedGoal.title}
              </span>
            )}
          </div>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(achievement.id)}
            className="ml-2 flex-shrink-0 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};