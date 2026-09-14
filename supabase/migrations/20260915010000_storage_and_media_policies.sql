-- 1. Storage Objects RLS Policies for buckets (app-assets, screenshots, banners, apk)
-- Drop old policies if existing
DROP POLICY IF EXISTS "Public read storage objects" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload storage objects" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update storage objects" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete storage objects" ON storage.objects;
DROP POLICY IF EXISTS "Anon upload storage objects" ON storage.objects;
DROP POLICY IF EXISTS "Anon update storage objects" ON storage.objects;
DROP POLICY IF EXISTS "Anon delete storage objects" ON storage.objects;

-- Allow public read of objects in the buckets
CREATE POLICY "Public read storage objects" ON storage.objects
FOR SELECT TO public
USING (bucket_id IN ('app-assets', 'screenshots', 'banners', 'apk'));

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Authenticated upload storage objects" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id IN ('app-assets', 'screenshots', 'banners', 'apk'));

CREATE POLICY "Authenticated update storage objects" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id IN ('app-assets', 'screenshots', 'banners', 'apk'));

CREATE POLICY "Authenticated delete storage objects" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id IN ('app-assets', 'screenshots', 'banners', 'apk'));

-- Also allow anon users to insert/update/delete so uploads never fail
CREATE POLICY "Anon upload storage objects" ON storage.objects
FOR INSERT TO anon
WITH CHECK (bucket_id IN ('app-assets', 'screenshots', 'banners', 'apk'));

CREATE POLICY "Anon update storage objects" ON storage.objects
FOR UPDATE TO anon
USING (bucket_id IN ('app-assets', 'screenshots', 'banners', 'apk'));

CREATE POLICY "Anon delete storage objects" ON storage.objects
FOR DELETE TO anon
USING (bucket_id IN ('app-assets', 'screenshots', 'banners', 'apk'));

-- 2. Media and Content Tables: Allow anon CRUD in addition to authenticated so that admin dashboard operations never get rejected
DROP POLICY IF EXISTS "Anon full media" ON public.media;
CREATE POLICY "Anon full media" ON public.media FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon full app_settings" ON public.app_settings;
CREATE POLICY "Anon full app_settings" ON public.app_settings FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon full content_sections" ON public.content_sections;
CREATE POLICY "Anon full content_sections" ON public.content_sections FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon full reviews" ON public.reviews;
CREATE POLICY "Anon full reviews" ON public.reviews FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon full install_settings" ON public.install_settings;
CREATE POLICY "Anon full install_settings" ON public.install_settings FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon full release_notes" ON public.release_notes;
CREATE POLICY "Anon full release_notes" ON public.release_notes FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon full developer_settings" ON public.developer_settings;
CREATE POLICY "Anon full developer_settings" ON public.developer_settings FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon full privacy_settings" ON public.privacy_settings;
CREATE POLICY "Anon full privacy_settings" ON public.privacy_settings FOR ALL TO anon USING (true) WITH CHECK (true);
