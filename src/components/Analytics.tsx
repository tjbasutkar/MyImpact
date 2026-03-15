'use client';

import { Achievement, Goal } from '../lib/types';

interface AnalyticsProps {
  achievements: Achievement[];
  goals: Goal[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ achievements, goals }) => {
  // Calculate achievements per month
  const achievementsByMonth = achievements.reduce((acc, achievement) => {
    const month = achievement.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate achievements per goal
  const achievementsByGoal = goals.map(goal => ({
    goal: goal.title,
    count: achievements.filter(a => a.goalId === goal.id).length,
  }));

  const totalAchievements = achievements.length;
  const totalGoals = goals.length;
  const linkedAchievements = achievements.filter(a => a.goalId).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Total Achievements</h3>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{totalAchievements}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Total Goals</h3>
          <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{totalGoals}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Linked Achievements</h3>
          <p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">{linkedAchievements}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border">
        <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Achievements by Month</h3>
        {Object.keys(achievementsByMonth).length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(achievementsByMonth).map(([month, count]) => (
              <div key={month} className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300 min-w-0 flex-shrink-0">{month}</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 min-w-0">
                  <div
                    className="bg-blue-600 h-4 rounded-full min-w-1"
                    style={{ width: `${(count / Math.max(...Object.values(achievementsByMonth))) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300 flex-shrink-0 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border">
        <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Achievements by Goal</h3>
        {achievementsByGoal.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No goals with achievements</p>
        ) : (
          <div className="space-y-2">
            {achievementsByGoal.map(({ goal, count }) => (
              <div key={goal} className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300 min-w-0 flex-shrink-0">{goal}</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 min-w-0">
                  <div
                    className="bg-green-600 h-4 rounded-full min-w-1"
                    style={{ width: `${totalAchievements > 0 ? (count / totalAchievements) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300 flex-shrink-0 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};