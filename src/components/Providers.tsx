'use client';

import { GoalTrackProvider } from '../context/GoalTrackContext';

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <GoalTrackProvider>{children}</GoalTrackProvider>;
};