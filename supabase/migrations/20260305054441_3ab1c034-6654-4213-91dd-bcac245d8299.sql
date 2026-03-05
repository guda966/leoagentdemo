
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('student', 'college', 'recruiter');

-- Create user_roles table first
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Security definer function to check roles (before any table uses it)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  college_name TEXT,
  college_id TEXT,
  department TEXT,
  graduation_year INTEGER,
  avatar_url TEXT,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  projects JSONB DEFAULT '[]',
  experience JSONB DEFAULT '[]',
  education JSONB DEFAULT '[]',
  linkedin_url TEXT,
  resume_url TEXT,
  profile_completion INTEGER DEFAULT 0,
  placement_readiness_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "College admins can view all profiles" ON public.profiles FOR SELECT USING (
  public.has_role(auth.uid(), 'college')
);
CREATE POLICY "Recruiters can view all profiles" ON public.profiles FOR SELECT USING (
  public.has_role(auth.uid(), 'recruiter')
);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student'));
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recruiter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT,
  skills_required TEXT[] DEFAULT '{}',
  experience TEXT,
  salary_range TEXT,
  location TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Jobs are viewable by everyone" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Recruiters can insert jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = recruiter_id);
CREATE POLICY "Recruiters can update their jobs" ON public.jobs FOR UPDATE USING (auth.uid() = recruiter_id);
CREATE POLICY "Recruiters can delete their jobs" ON public.jobs FOR DELETE USING (auth.uid() = recruiter_id);

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Applications table
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Applied',
  match_score INTEGER DEFAULT 0,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, job_id)
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view their applications" ON public.applications FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can apply" ON public.applications FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Recruiters can view applications for their jobs" ON public.applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_id AND jobs.recruiter_id = auth.uid())
);
CREATE POLICY "Recruiters can update application status" ON public.applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_id AND jobs.recruiter_id = auth.uid())
);
CREATE POLICY "College admins can view all applications" ON public.applications FOR SELECT USING (
  public.has_role(auth.uid(), 'college')
);

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Mock interviews table
CREATE TABLE public.mock_interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL,
  questions JSONB DEFAULT '[]',
  answers JSONB DEFAULT '[]',
  feedback JSONB DEFAULT '[]',
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.mock_interviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view their interviews" ON public.mock_interviews FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can create interviews" ON public.mock_interviews FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Placement drives table
CREATE TABLE public.placement_drives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  roles TEXT,
  drive_date DATE,
  eligible_count INTEGER DEFAULT 0,
  applied_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Upcoming',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.placement_drives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drives viewable by all authenticated" ON public.placement_drives FOR SELECT USING (true);
CREATE POLICY "College admins can manage drives" ON public.placement_drives FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'college')
);
CREATE POLICY "College admins can update drives" ON public.placement_drives FOR UPDATE USING (
  public.has_role(auth.uid(), 'college')
);

CREATE TRIGGER update_drives_updated_at
  BEFORE UPDATE ON public.placement_drives
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Resume storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);

CREATE POLICY "Users can upload their own resume" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their own resume" ON storage.objects FOR SELECT USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own resume" ON storage.objects FOR UPDATE USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "College and recruiters can view resumes" ON storage.objects FOR SELECT USING (
  bucket_id = 'resumes' AND (public.has_role(auth.uid(), 'college') OR public.has_role(auth.uid(), 'recruiter'))
);
