-- Migration: Create generated_apps table for dynamic multi-app PWA generation platform

CREATE TABLE IF NOT EXISTS public.generated_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id TEXT UNIQUE NOT NULL,
  app_name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  target_url TEXT,
  apk_url TEXT,
  apk_filename TEXT DEFAULT 'app-release.apk',
  apk_size_bytes BIGINT,
  icon_url TEXT NOT NULL,
  icon_192_url TEXT,
  icon_512_url TEXT,
  apple_touch_icon_url TEXT,
  favicon_url TEXT,
  theme_color TEXT DEFAULT '#01875f',
  background_color TEXT DEFAULT '#ffffff',
  description TEXT,
  short_description TEXT,
  category TEXT DEFAULT 'Entertainment & Utilities',
  rating NUMERIC(2,1) DEFAULT 4.8,
  review_count TEXT DEFAULT '10K+ reviews',
  download_count TEXT DEFAULT '500K+ downloads',
  version TEXT DEFAULT '1.0.0',
  display_mode TEXT DEFAULT 'standalone',
  embed_mode TEXT DEFAULT 'iframe_seamless',
  button_text TEXT DEFAULT 'Install',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by app_id
CREATE INDEX IF NOT EXISTS idx_generated_apps_app_id ON public.generated_apps(app_id);

-- Enable RLS
ALTER TABLE public.generated_apps ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read generated_apps" ON public.generated_apps FOR SELECT USING (true);
CREATE POLICY "Anon full generated_apps" ON public.generated_apps FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Admin full generated_apps" ON public.generated_apps FOR ALL TO authenticated USING (true) WITH CHECK (true);
