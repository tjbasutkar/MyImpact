'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Achievement, Goal } from '../lib/types';
import { getAchievements, saveAchievements, getGoals, saveGoals } from '../lib/storage';

interface GoalTrackContextType {
  achievements: Achievement[];
  goals: Goal[];
  addAchievement: (achievement: Omit<Achievement, 'id' | 'createdAt'>) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  deleteAchievement: (id: string) => void;
  deleteGoal: (id: string) => void;
}

const GoalTrackContext = createContext<GoalTrackContextType | undefined>(undefined);

export const useGoalTrack = () => {
  const context = useContext(GoalTrackContext);
  if (!context) throw new Error('useGoalTrack must be used within GoalTrackProvider');
  return context;
};

export const GoalTrackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    setAchievements(getAchievements());
    setGoals(getGoals());
  }, []);

  const addAchievement = (achievement: Omit<Achievement, 'id' | 'createdAt'>) => {
    const newAchievement: Achievement = {
      ...achievement,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    const updated = [...achievements, newAchievement];
    setAchievements(updated);
    saveAchievements(updated);
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    const updated = [...goals, newGoal];
    setGoals(updated);
    saveGoals(updated);
  };

  const deleteAchievement = (id: string) => {
    const updated = achievements.filter(a => a.id !== id);
    setAchievements(updated);
    saveAchievements(updated);
  };

  const deleteGoal = (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    saveGoals(updated);
  };

  return (
    <GoalTrackContext.Provider value={{
      achievements,
      goals,
      addAchievement,
      addGoal,
      deleteAchievement,
      deleteGoal,
    }}>
      {children}
    </GoalTrackContext.Provider>
  );
};