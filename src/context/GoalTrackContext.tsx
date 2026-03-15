'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Achievement, Goal, User } from '../lib/types';

interface GoalTrackContextType {
  user: User | null;
  achievements: Achievement[];
  goals: Goal[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: User['role']) => Promise<void>;
  signOut: () => Promise<void>;
  addAchievement: (achievement: Omit<Achievement, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
  deleteAchievement: (id: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  assignGoalToUsers: (goalId: string, userIds: string[]) => Promise<void>;
}

const GoalTrackContext = createContext<GoalTrackContextType | undefined>(undefined);

export const useGoalTrack = () => {
  const context = useContext(GoalTrackContext);
  if (!context) throw new Error('useGoalTrack must be used within GoalTrackProvider');
  return context;
};

const STORAGE_KEYS = {
  currentUser: 'goaltrack_user',
  users: 'goaltrack_users',
  goals: 'goaltrack_goals',
  achievements: 'goaltrack_achievements',
};

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const stored = localStorage.getItem(key);
  if (!stored) return fallback;
  try {
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const GoalTrackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const storedUser = readStorage<User | null>(STORAGE_KEYS.currentUser, null);
    const storedGoals = readStorage<Goal[]>(STORAGE_KEYS.goals, []);
    const storedAchievements = readStorage<Achievement[]>(STORAGE_KEYS.achievements, []);

    const hydratedGoals: Goal[] = storedGoals.map(goal => ({
      ...goal,
      createdAt: typeof goal.createdAt === 'string' ? new Date(goal.createdAt) : goal.createdAt,
    }));

    const hydratedAchievements: Achievement[] = storedAchievements.map(achievement => ({
      ...achievement,
      createdAt:
        typeof achievement.createdAt === 'string'
          ? new Date(achievement.createdAt)
          : achievement.createdAt,
      date: typeof achievement.date === 'string' ? new Date(achievement.date) : achievement.date,
    }));

    setUser(storedUser);
    setGoals(hydratedGoals);
    setAchievements(hydratedAchievements);
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const users = readStorage<any[]>(STORAGE_KEYS.users, []);
    const matched = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!matched) {
      throw new Error('Invalid credentials');
    }

    const signedInUser: User = {
      id: matched.id,
      email: matched.email,
      name: matched.name,
      role: matched.role,
    };

    setUser(signedInUser);
    writeStorage(STORAGE_KEYS.currentUser, signedInUser);
  };

  const signUp = async (email: string, password: string, name: string, role: User['role']) => {
    const users = readStorage<any[]>(STORAGE_KEYS.users, []);

    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('User already exists');
    }

    const newUser = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      name,
      role,
      password,
      createdAt: new Date().toISOString(),
    };

    const nextUsers = [...users, newUser];
    writeStorage(STORAGE_KEYS.users, nextUsers);

    const userObj: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    };

    setUser(userObj);
    writeStorage(STORAGE_KEYS.currentUser, userObj);
  };

  const signOut = async () => {
    setUser(null);
    writeStorage(STORAGE_KEYS.currentUser, null);
  };

  const addAchievement = async (achievement: Omit<Achievement, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!user) throw new Error('User not authenticated');

    const newAchievement: Achievement = {
      id: crypto.randomUUID(),
      title: achievement.title,
      description: achievement.description,
      date: achievement.date,
      goalId: achievement.goalId,
      createdAt: new Date(),
      createdBy: user.id,
    };

    setAchievements(prev => {
      const next = [newAchievement, ...prev];
      writeStorage(STORAGE_KEYS.achievements, next);
      return next;
    });
  };

  const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!user) throw new Error('User not authenticated');

    const newGoal: Goal = {
      id: crypto.randomUUID(),
      title: goal.title,
      description: goal.description,
      category: goal.category,
      assignedTo: goal.assignedTo || [],
      createdAt: new Date(),
      createdBy: user.id,
    };

    setGoals(prev => {
      const next = [newGoal, ...prev];
      writeStorage(STORAGE_KEYS.goals, next);
      return next;
    });
  };

  const deleteAchievement = async (id: string) => {
    setAchievements(prev => {
      const next = prev.filter(a => a.id !== id);
      writeStorage(STORAGE_KEYS.achievements, next);
      return next;
    });
  };

  const deleteGoal = async (id: string) => {
    setGoals(prev => {
      const next = prev.filter(g => g.id !== id);
      writeStorage(STORAGE_KEYS.goals, next);
      return next;
    });
  };

  const assignGoalToUsers = async (goalId: string, userIds: string[]) => {
    setGoals(prev => {
      const next = prev.map(g => (g.id === goalId ? { ...g, assignedTo: userIds } : g));
      writeStorage(STORAGE_KEYS.goals, next);
      return next;
    });
  };

  return (
    <GoalTrackContext.Provider
      value={{
        user,
        achievements,
        goals,
        loading,
        signIn,
        signUp,
        signOut,
        addAchievement,
        addGoal,
        deleteAchievement,
        deleteGoal,
        assignGoalToUsers,
      }}
    >
      {children}
    </GoalTrackContext.Provider>
  );
};

