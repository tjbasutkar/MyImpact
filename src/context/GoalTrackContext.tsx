'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Achievement, Goal, User } from '../lib/types';
import { supabase } from '../lib/supabase';

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

function mapSupabaseUser(user: any): User {
  const meta = user?.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email,
    name: meta.name,
    role: (meta.role as User['role']) ?? 'user',
  };
}

function mapGoal(row: any): Goal {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    createdAt: new Date(row.created_at),
    createdBy: row.created_by,
    assignedTo: row.assigned_to ?? [],
  };
}

function mapAchievement(row: any): Achievement {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: new Date(row.date),
    goalId: row.goal_id ?? undefined,
    createdAt: new Date(row.created_at),
    createdBy: row.created_by,
  };
}

export const GoalTrackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async (userId?: string) => {
    const currentUserId = userId ?? user?.id;
    if (!currentUserId) return;

    const [goalsRes, achievementsRes] = await Promise.all([
      supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('achievements')
        .select('*')
        .order('created_at', { ascending: false }),
    ]);

    if (goalsRes.error) {
      console.error('Failed to load goals', goalsRes.error);
    } else {
      setGoals((goalsRes.data ?? []).map(mapGoal));
    }

    if (achievementsRes.error) {
      console.error('Failed to load achievements', achievementsRes.error);
    } else {
      setAchievements((achievementsRes.data ?? []).map(mapAchievement));
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Supabase auth session error:', error);
      }

      const session = data?.session;

      if (session?.user) {
        const mappedUser = mapSupabaseUser(session.user);
        setUser(mappedUser);
        await loadData(mappedUser.id);
      }

      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const mappedUser = mapSupabaseUser(session.user);
        setUser(mappedUser);
        await loadData(mappedUser.id);
      } else {
        setUser(null);
        setGoals([]);
        setAchievements([]);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Failed to sign in');

    const mappedUser = mapSupabaseUser(data.user);
    setUser(mappedUser);
    await loadData(mappedUser.id);
  };

  const signUp = async (email: string, password: string, name: string, role: User['role']) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (error) throw error;

    // If email confirmation is enabled in Supabase, signUp may return a user but no session.
    if (!data.session?.user) {
      throw new Error('Account created. Please confirm your email, then sign in.');
    }

    const mappedUser = mapSupabaseUser(data.session.user);
    setUser(mappedUser);
    await loadData(mappedUser.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setGoals([]);
    setAchievements([]);
  };

  const addAchievement = async (achievement: Omit<Achievement, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('achievements')
      .insert({
        title: achievement.title,
        description: achievement.description,
        date: achievement.date.toISOString(),
        goal_id: achievement.goalId,
        created_by: user.id,
      })
      .select('*')
      .single();

    if (error) throw error;

    setAchievements(prev => [mapAchievement(data), ...prev]);
  };

  const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('goals')
      .insert({
        title: goal.title,
        description: goal.description,
        category: goal.category,
        assigned_to: goal.assignedTo || [],
        created_by: user.id,
      })
      .select('*')
      .single();

    if (error) throw error;

    setGoals(prev => [mapGoal(data), ...prev]);
  };

  const deleteAchievement = async (id: string) => {
    const { error } = await supabase.from('achievements').delete().eq('id', id);
    if (error) throw error;
    setAchievements(prev => prev.filter(a => a.id !== id));
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) throw error;
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const assignGoalToUsers = async (goalId: string, userIds: string[]) => {
    const { data, error } = await supabase
      .from('goals')
      .update({ assigned_to: userIds })
      .eq('id', goalId)
      .select('*')
      .single();

    if (error) throw error;

    setGoals(prev => prev.map(g => (g.id === goalId ? mapGoal(data) : g)));
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

