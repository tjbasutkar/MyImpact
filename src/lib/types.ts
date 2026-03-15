export type UserRole = 'admin' | 'manager' | 'user';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  createdAt?: Date;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'personal' | 'organizational' | 'professional';
  createdAt: Date;
  createdBy: string; // user ID of creator
  assignedTo?: string[]; // user IDs this goal is assigned to
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: Date;
  goalId?: string; // optional link to goal
  createdAt: Date;
  createdBy: string; // user ID of creator
}

export type GoalCategory = Goal['category'];