
CREATE POLICY "anyone uploads chat files" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'chat-files');
CREATE POLICY "uploader reads chat files" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'chat-files');
CREATE POLICY "admins delete chat files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'chat-files' AND public.has_role(auth.uid(), 'admin'));
