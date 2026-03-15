'use client';

import { createClient } from '../lib/supabase';
import { GoalTrackProvider } from '../context/GoalTrackContext';

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <GoalTrackProvider>{children}</GoalTrackProvider>;
};