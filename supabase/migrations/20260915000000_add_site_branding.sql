-- Add site branding columns to app_settings
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS site_name TEXT DEFAULT 'AppMarket';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS site_logo_url TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS site_badge_text TEXT DEFAULT 'Verified';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS show_site_badge BOOLEAN DEFAULT TRUE;
