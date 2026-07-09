
CREATE POLICY "Anyone can upload gallery captures"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'gallery-captures');

CREATE POLICY "Admins can view gallery captures"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'gallery-captures' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete gallery captures"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'gallery-captures' AND public.has_role(auth.uid(), 'admin'));
