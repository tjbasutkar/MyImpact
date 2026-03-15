export interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'personal' | 'organizational' | 'professional';
  createdAt: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: Date;
  goalId?: string; // optional link to goal
  createdAt: Date;
}

export type GoalCategory = Goal['category'];