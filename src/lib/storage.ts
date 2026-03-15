import { Achievement, Goal } from './types';

const ACHIEVEMENTS_KEY = 'goaltrack_achievements';
const GOALS_KEY = 'goaltrack_goals';

export const getAchievements = (): Achievement[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(ACHIEVEMENTS_KEY);
  if (!data) return [];
  return JSON.parse(data).map((a: any) => ({
    ...a,
    date: new Date(a.date),
    createdAt: new Date(a.createdAt),
  }));
};

export const saveAchievements = (achievements: Achievement[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
};

export const getGoals = (): Goal[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(GOALS_KEY);
  if (!data) return [];
  return JSON.parse(data).map((g: any) => ({
    ...g,
    createdAt: new Date(g.createdAt),
  }));
};

export const saveGoals = (goals: Goal[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
};