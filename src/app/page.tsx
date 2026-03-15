'use client';

import { useGoalTrack } from '../context/GoalTrackContext';
import { Dashboard } from '../components/Dashboard';
import { Auth } from '../components/Auth';

export default function Home() {
  const { user, loading } = useGoalTrack();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return <Dashboard />;
}
