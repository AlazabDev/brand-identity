INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload chat files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'chat-files');

CREATE POLICY "Anyone can read chat files" ON storage.objects
  FOR SELECT USING (bucket_id = 'chat-files');