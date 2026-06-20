
-- Lock down webhook_logs inserts (service role bypasses RLS, so no policy needed for it)
DROP POLICY IF EXISTS "Service can insert webhook logs" ON public.webhook_logs;

-- Lock down whatsapp_messages inserts
DROP POLICY IF EXISTS "Service can insert whatsapp messages" ON public.whatsapp_messages;

-- Remove broad public SELECT on storage.objects for chat-files (prevents listing).
-- Public bucket URLs still resolve without an RLS check.
DROP POLICY IF EXISTS "Anyone can read chat files" ON storage.objects;

-- Replace upload policy with path-ownership enforcement
DROP POLICY IF EXISTS "Authenticated users can upload chat files" ON storage.objects;
CREATE POLICY "Authenticated users can upload own chat files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-files'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
