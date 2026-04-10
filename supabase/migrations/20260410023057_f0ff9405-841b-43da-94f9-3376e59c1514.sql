
-- 1. user_roles: Add admin-only INSERT/UPDATE/DELETE policies
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. chat-files storage: Replace open upload with authenticated-only
DROP POLICY IF EXISTS "Anyone can upload chat files" ON storage.objects;

CREATE POLICY "Authenticated users can upload chat files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-files');

CREATE POLICY "Authenticated users can delete own chat files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'chat-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 3. Strengthen public form INSERT policies with email/length validation

-- quote_requests
DROP POLICY IF EXISTS "Anyone can submit quote" ON public.quote_requests;
CREATE POLICY "Anyone can submit quote"
ON public.quote_requests
FOR INSERT
TO public
WITH CHECK (
  length(client_name) > 0
  AND length(client_name) <= 200
  AND (email IS NULL OR email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$')
  AND (notes IS NULL OR length(notes) <= 5000)
  AND (phone IS NULL OR length(phone) <= 30)
  AND (shop_name IS NULL OR length(shop_name) <= 200)
  AND read IS NOT TRUE
);

-- contact_messages
DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact"
ON public.contact_messages
FOR INSERT
TO public
WITH CHECK (
  length(name) > 0
  AND length(name) <= 200
  AND (email IS NULL OR email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$')
  AND (message IS NULL OR length(message) <= 5000)
  AND (phone IS NULL OR length(phone) <= 30)
  AND read IS NOT TRUE
);

-- job_applications
DROP POLICY IF EXISTS "Anyone can submit application" ON public.job_applications;
CREATE POLICY "Anyone can submit application"
ON public.job_applications
FOR INSERT
TO public
WITH CHECK (
  length(full_name) > 0
  AND length(full_name) <= 200
  AND (email IS NULL OR email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$')
  AND (message IS NULL OR length(message) <= 5000)
  AND (phone IS NULL OR length(phone) <= 30)
  AND length(position) > 0
  AND length(position) <= 200
  AND read IS NOT TRUE
);
