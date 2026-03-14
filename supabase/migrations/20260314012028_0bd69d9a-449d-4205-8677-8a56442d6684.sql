
-- Replace overly permissive INSERT policies with basic validation
DROP POLICY "Anyone can submit contact" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact" ON public.contact_messages
  FOR INSERT WITH CHECK (length(name) > 0);

DROP POLICY "Anyone can submit quote" ON public.quote_requests;
CREATE POLICY "Anyone can submit quote" ON public.quote_requests
  FOR INSERT WITH CHECK (length(client_name) > 0);
