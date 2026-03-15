'use client';

import { useState } from 'react';
import { useGoalTrack } from '../context/GoalTrackContext';
import { AchievementCard } from './AchievementCard';
import { GoalCard } from './GoalCard';
import { AddAchievementForm } from './AddAchievementForm';
import { AddGoalForm } from './AddGoalForm';
import { Timeline } from './Timeline';
import { Analytics } from './Analytics';

type Tab = 'dashboard' | 'achievements' | 'goals' | 'analytics';

export const Dashboard: React.FC = () => {
  const { achievements, goals, deleteAchievement, deleteGoal } = useGoalTrack();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showAddAchievement, setShowAddAchievement] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);

  const recentAchievements = achievements
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const goalsWithCounts = goals.map(goal => ({
    ...goal,
    achievementCount: achievements.filter(a => a.goalId === goal.id).length,
  }));

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowAddAchievement(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-center"
                >
                  Add Achievement
                </button>
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-center"
                >
                  Add Goal
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Achievements</h3>
                {recentAchievements.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No achievements yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentAchievements.map(achievement => (
                      <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        goals={goals}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Your Goals</h3>
                {goalsWithCounts.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No goals set yet.</p>
                ) : (
                  <div className="space-y-3">
                    {goalsWithCounts.map(goal => (
                      <GoalCard
                        key={goal.id}
                        goal={goal}
                        achievementCount={goal.achievementCount}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'achievements':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Achievements Timeline</h2>
              <button
                onClick={() => setShowAddAchievement(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full sm:w-auto text-center"
              >
                Add Achievement
              </button>
            </div>
            <Timeline
              achievements={achievements}
              goals={goals}
              onDeleteAchievement={deleteAchievement}
            />
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Goals</h2>
              <button
                onClick={() => setShowAddGoal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 w-full sm:w-auto text-center"
              >
                Add Goal
              </button>
            </div>
            {goalsWithCounts.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No goals set yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goalsWithCounts.map(goal => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    achievementCount={goal.achievementCount}
                    onDelete={deleteGoal}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
            <Analytics achievements={achievements} goals={goals} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">GoalTrack</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Track your achievements and progress towards your goals</p>
        </header>

        <nav className="mb-8">
          <div className="flex flex-wrap gap-1 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border">
            {[
              { id: 'dashboard' as Tab, label: 'Dashboard' },
              { id: 'achievements' as Tab, label: 'Achievements' },
              { id: 'goals' as Tab, label: 'Goals' },
              { id: 'analytics' as Tab, label: 'Analytics' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex-1 min-w-0 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        <main>{renderContent()}</main>

        {showAddAchievement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="max-w-md w-full max-h-[90vh] overflow-y-auto">
              <AddAchievementForm
                goals={goals}
                onClose={() => setShowAddAchievement(false)}
              />
            </div>
          </div>
        )}

        {showAddGoal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="max-w-md w-full max-h-[90vh] overflow-y-auto">
              <AddGoalForm
                onClose={() => setShowAddGoal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};