
-- Aptitude tests table
CREATE TABLE public.aptitude_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  recruiter_id UUID NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  answers JSONB DEFAULT '[]'::jsonb,
  score INTEGER DEFAULT NULL,
  total_questions INTEGER NOT NULL DEFAULT 40,
  status TEXT NOT NULL DEFAULT 'pending',
  time_limit_minutes INTEGER NOT NULL DEFAULT 60,
  violations JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.aptitude_tests ENABLE ROW LEVEL SECURITY;

-- Students can view their own tests
CREATE POLICY "Students can view own tests" ON public.aptitude_tests
  FOR SELECT USING (auth.uid() = student_id);

-- Students can update their own tests (submit answers)
CREATE POLICY "Students can update own tests" ON public.aptitude_tests
  FOR UPDATE USING (auth.uid() = student_id);

-- Recruiters can view tests they created
CREATE POLICY "Recruiters can view own tests" ON public.aptitude_tests
  FOR SELECT USING (auth.uid() = recruiter_id);

-- Recruiters can insert tests
CREATE POLICY "Recruiters can insert tests" ON public.aptitude_tests
  FOR INSERT WITH CHECK (auth.uid() = recruiter_id);

-- Recruiters can update tests they created
CREATE POLICY "Recruiters can update own tests" ON public.aptitude_tests
  FOR UPDATE USING (auth.uid() = recruiter_id);

-- College admins can view all tests
CREATE POLICY "College admins can view tests" ON public.aptitude_tests
  FOR SELECT USING (has_role(auth.uid(), 'college'::app_role));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.aptitude_tests;

-- Fix notification insert: allow authenticated users to insert for any user (notifications are not sensitive to create)
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
CREATE POLICY "Authenticated can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
