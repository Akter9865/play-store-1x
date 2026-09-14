-- Migration: Add PWA manifest, icon assets, and dynamic button state columns

-- 1. Add PWA and Icon columns to app_settings
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS pwa_name TEXT DEFAULT 'SuperPlay App';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS pwa_short_name TEXT DEFAULT 'SuperPlay';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS pwa_theme_color TEXT DEFAULT '#01875f';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS pwa_background_color TEXT DEFAULT '#ffffff';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS icon_192_url TEXT DEFAULT '/icon-192.png';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS icon_512_url TEXT DEFAULT '/icon-512.png';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS apple_touch_icon_url TEXT DEFAULT '/apple-touch-icon.png';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS favicon_url TEXT DEFAULT '/favicon.png';

-- 2. Add custom button text state columns to install_settings
ALTER TABLE public.install_settings ADD COLUMN IF NOT EXISTS initializing_text TEXT DEFAULT 'Initializing...';
ALTER TABLE public.install_settings ADD COLUMN IF NOT EXISTS downloading_text TEXT DEFAULT 'Downloading...';
ALTER TABLE public.install_settings ADD COLUMN IF NOT EXISTS installing_text TEXT DEFAULT 'Installing...';
ALTER TABLE public.install_settings ADD COLUMN IF NOT EXISTS open_text TEXT DEFAULT 'Open';
