-- Enable Row Level Security
ALTER TABLE IF EXISTS auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'user')) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('personal', 'organizational', 'professional')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Goals policies
CREATE POLICY "Users can view goals assigned to them" ON public.goals
  FOR SELECT USING (
    auth.uid() = ANY(assigned_to) OR
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

CREATE POLICY "Managers and admins can create goals" ON public.goals
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

CREATE POLICY "Goal creators and admins can update goals" ON public.goals
  FOR UPDATE USING (
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete goals" ON public.goals
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Achievements policies
CREATE POLICY "Users can view achievements they created or from assigned goals" ON public.achievements
  FOR SELECT USING (
    auth.uid() = created_by OR
    goal_id IN (
      SELECT id FROM public.goals WHERE auth.uid() = ANY(assigned_to) OR auth.uid() = created_by
    ) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

CREATE POLICY "Users can create achievements" ON public.achievements
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own achievements" ON public.achievements
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own achievements" ON public.achievements
  FOR DELETE USING (auth.uid() = created_by);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'), 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();