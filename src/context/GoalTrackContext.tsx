'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '../lib/supabase';
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

export const GoalTrackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserData(session.user.id);
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserData(session.user.id);
      } else {
        setUser(null);
        setAchievements([]);
        setGoals([]);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      // Load user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      setUser({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        createdAt: new Date(profile.created_at),
      });

      // Load goals and achievements based on user role
      if (profile.role === 'admin' || profile.role === 'manager') {
        // Load all goals and achievements
        const [goalsRes, achievementsRes] = await Promise.all([
          supabase.from('goals').select('*').order('created_at', { ascending: false }),
          supabase.from('achievements').select('*').order('created_at', { ascending: false }),
        ]);

        if (goalsRes.error) throw goalsRes.error;
        if (achievementsRes.error) throw achievementsRes.error;

        setGoals(goalsRes.data.map(g => ({
          id: g.id,
          title: g.title,
          description: g.description,
          category: g.category,
          createdAt: new Date(g.created_at),
          createdBy: g.created_by,
          assignedTo: g.assigned_to || [],
        })));

        setAchievements(achievementsRes.data.map(a => ({
          id: a.id,
          title: a.title,
          description: a.description,
          date: new Date(a.date),
          goalId: a.goal_id,
          createdAt: new Date(a.created_at),
          createdBy: a.created_by,
        })));
      } else {
        // Load goals assigned to this user and their achievements
        const [goalsRes, achievementsRes] = await Promise.all([
          supabase.from('goals').select('*').contains('assigned_to', [userId]),
          supabase.from('achievements').select('*').eq('created_by', userId),
        ]);

        if (goalsRes.error) throw goalsRes.error;
        if (achievementsRes.error) throw achievementsRes.error;

        setGoals(goalsRes.data.map(g => ({
          id: g.id,
          title: g.title,
          description: g.description,
          category: g.category,
          createdAt: new Date(g.created_at),
          createdBy: g.created_by,
          assignedTo: g.assigned_to || [],
        })));

        setAchievements(achievementsRes.data.map(a => ({
          id: a.id,
          title: a.title,
          description: a.description,
          date: new Date(a.date),
          goalId: a.goal_id,
          createdAt: new Date(a.created_at),
          createdBy: a.created_by,
        })));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name: string, role: User['role']) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user) {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email,
          name,
          role,
        });

      if (profileError) throw profileError;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
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
      .select()
      .single();

    if (error) throw error;

    const newAchievement: Achievement = {
      id: data.id,
      title: data.title,
      description: data.description,
      date: new Date(data.date),
      goalId: data.goal_id,
      createdAt: new Date(data.created_at),
      createdBy: data.created_by,
    };

    setAchievements(prev => [newAchievement, ...prev]);
  };

  const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('goals')
      .insert({
        title: goal.title,
        description: goal.description,
        category: goal.category,
        created_by: user.id,
        assigned_to: goal.assignedTo || [],
      })
      .select()
      .single();

    if (error) throw error;

    const newGoal: Goal = {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      createdAt: new Date(data.created_at),
      createdBy: data.created_by,
      assignedTo: data.assigned_to || [],
    };

    setGoals(prev => [newGoal, ...prev]);
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
    const { error } = await supabase
      .from('goals')
      .update({ assigned_to: userIds })
      .eq('id', goalId);

    if (error) throw error;

    setGoals(prev => prev.map(g =>
      g.id === goalId ? { ...g, assignedTo: userIds } : g
    ));
  };

  return (
    <GoalTrackContext.Provider value={{
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
    }}>
      {children}
    </GoalTrackContext.Provider>
  );
};