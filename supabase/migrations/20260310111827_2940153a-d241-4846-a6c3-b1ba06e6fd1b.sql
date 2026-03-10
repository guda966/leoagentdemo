
-- Add created_by column to profiles to track hierarchy
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Add company_name, address, place columns to profiles for colleges/recruiters
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS place text;

-- Owner can view all profiles
CREATE POLICY "Owner can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'owner'));

-- Owner can view all roles
CREATE POLICY "Owner can view all user_roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'owner'));

-- College can view students they created  
CREATE POLICY "College can view students they created"
ON public.profiles FOR SELECT
USING (
  public.has_role(auth.uid(), 'college') 
  AND created_by = auth.uid()
);

-- College can view roles of students they created
CREATE POLICY "College can view student roles"
ON public.user_roles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = user_roles.user_id 
    AND profiles.created_by = auth.uid()
  )
);

-- Update handle_new_user to NOT auto-insert profile/role (owner creates via edge function)
-- We keep it for self-signups (owner/student)
