'use client';

import { Goal } from '../lib/types';

interface GoalCardProps {
  goal: Goal;
  achievementCount: number;
  onDelete?: (id: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, achievementCount, onDelete }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border">
      <div className="flex justify-between items-start">
        <div className="flex-1">
        <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">{goal.title}</h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">{goal.description}</p>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              goal.category === 'personal' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              goal.category === 'organizational' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
              'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
            }`}>
              {goal.category}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {achievementCount} achievement{achievementCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(goal.id)}
            className="text-red-500 hover:text-red-700 ml-2"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};