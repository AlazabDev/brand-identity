
-- Create job_applications table for career page submissions
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT NOT NULL,
  experience_years TEXT,
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an application
CREATE POLICY "Anyone can submit application"
ON public.job_applications
FOR INSERT
TO public
WITH CHECK (length(full_name) > 0);

-- Only admins can view applications
CREATE POLICY "Admins can view applications"
ON public.job_applications
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update applications
CREATE POLICY "Admins can update applications"
ON public.job_applications
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete applications
CREATE POLICY "Admins can delete applications"
ON public.job_applications
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
