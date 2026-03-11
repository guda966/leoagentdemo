
-- Fix: restrict notification inserts to authenticated users inserting for themselves, or use service role
DROP POLICY "Service can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
