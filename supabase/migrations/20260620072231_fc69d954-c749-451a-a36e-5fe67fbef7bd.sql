
-- Chat-files storage policies: drop old, add owner/admin scoped SELECT/UPDATE/DELETE
DROP POLICY IF EXISTS "Authenticated users can view chat files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view chat files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own chat files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own chat files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage chat files" ON storage.objects;

CREATE POLICY "Chat files: owner or admin can read"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'chat-files'
  AND (public.has_role(auth.uid(), 'admin') OR (auth.uid())::text = (storage.foldername(name))[1])
);

CREATE POLICY "Chat files: owner or admin can update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'chat-files'
  AND (public.has_role(auth.uid(), 'admin') OR (auth.uid())::text = (storage.foldername(name))[1])
)
WITH CHECK (
  bucket_id = 'chat-files'
  AND (public.has_role(auth.uid(), 'admin') OR (auth.uid())::text = (storage.foldername(name))[1])
);

CREATE POLICY "Chat files: owner or admin can delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'chat-files'
  AND (public.has_role(auth.uid(), 'admin') OR (auth.uid())::text = (storage.foldername(name))[1])
);

-- Lock down has_role: revoke from public/anon, keep authenticated (needed by RLS policies)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
