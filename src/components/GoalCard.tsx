'use client';

import { Goal } from '../lib/types';
import { useGoalTrack } from '../context/GoalTrackContext';

interface GoalCardProps {
  goal: Goal;
  achievementCount: number;
  onDelete?: (id: string) => void;
  showAssignment?: boolean;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, achievementCount, onDelete, showAssignment = false }) => {
  const { user } = useGoalTrack();
  return (
    <div className="h-full min-h-[140px] bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border">
      <div className="flex h-full justify-between items-start">
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">{goal.title}</h3>
          <p
            className="mt-1 flex-1 text-sm sm:text-base text-gray-600 dark:text-gray-300"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {goal.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
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
            {showAssignment && goal.assignedTo && goal.assignedTo.length > 0 && (
              <span className="text-blue-600 dark:text-blue-400 text-xs">
                Assigned to {goal.assignedTo.length} user{goal.assignedTo.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        {onDelete && (user?.role === 'admin' || user?.role === 'manager' || user?.id === goal.createdBy) && (
          <button
            onClick={() => onDelete(goal.id)}
            className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};