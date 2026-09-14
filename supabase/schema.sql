-- ====================================================================
-- SUPABASE SCHEMA & INITIAL SEED FOR APP STORE LANDING PAGE & CMS
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. APP SETTINGS
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_name TEXT NOT NULL DEFAULT 'SuperPlay App',
  developer_name TEXT NOT NULL DEFAULT 'SuperPlay Studios Limited',
  short_description TEXT DEFAULT 'Experience next-generation utility and entertainment in one seamless app.',
  description TEXT DEFAULT 'SuperPlay App is your all-in-one companion for digital entertainment, utilities, and daily productivity. Designed with clean interfaces, blazing speed, and privacy at its core. Download now to discover the curated experience.',
  features TEXT[] DEFAULT ARRAY[
    'Blazing fast performance with zero lag',
    'Intuitive gesture controls and custom themes',
    'Comprehensive safety and privacy controls',
    'Regular weekly updates and feature enhancements',
    'Ultra-low battery and memory consumption'
  ],
  category TEXT DEFAULT 'Entertainment & Utilities',
  rating NUMERIC(2,1) DEFAULT 4.7,
  review_count TEXT DEFAULT '8.3K reviews',
  download_count TEXT DEFAULT '100K+ downloads',
  age_rating TEXT DEFAULT '18+',
  version TEXT DEFAULT '2.4.1',
  last_updated DATE DEFAULT CURRENT_DATE,
  icon_url TEXT DEFAULT 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=256&auto=format&fit=crop&q=80',
  banner_url TEXT DEFAULT 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
  verified BOOLEAN DEFAULT TRUE,
  editors_choice BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CONTENT SECTIONS
CREATE TABLE IF NOT EXISTS public.content_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MEDIA (Screenshots, Banners, Graphics)
CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL DEFAULT 'screenshot', -- screenshot, banner, icon, promo
  url TEXT NOT NULL,
  title TEXT,
  caption TEXT,
  sort_order INT DEFAULT 0,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_name TEXT NOT NULL,
  avatar_url TEXT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  review_date DATE DEFAULT CURRENT_DATE,
  helpful_count INT DEFAULT 0,
  developer_response TEXT,
  developer_response_date DATE,
  published BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INSTALL SETTINGS
CREATE TABLE IF NOT EXISTS public.install_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mode TEXT NOT NULL DEFAULT 'SMART', -- APK, URL, PWA, SMART
  apk_url TEXT,
  apk_filename TEXT DEFAULT 'app-release.apk',
  apk_size_bytes BIGINT DEFAULT 24500000, -- ~24.5 MB
  external_url TEXT DEFAULT 'https://example.com/app',
  open_new_tab BOOLEAN DEFAULT TRUE,
  confirmation_enabled BOOLEAN DEFAULT TRUE,
  button_text TEXT DEFAULT 'Install',
  success_message TEXT DEFAULT 'Download started. Check your notification bar.',
  android_message TEXT DEFAULT 'Download the Android APK directly to your device.',
  ios_message TEXT DEFAULT 'Add this app to your Home Screen for full functionality.',
  desktop_message TEXT DEFAULT 'Access this app in a dedicated window on your computer.',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RELEASE NOTES (What's New)
CREATE TABLE IF NOT EXISTS public.release_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  release_date DATE DEFAULT CURRENT_DATE,
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DEVELOPER SETTINGS
CREATE TABLE IF NOT EXISTS public.developer_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  developer_name TEXT NOT NULL DEFAULT 'SuperPlay Studios Limited',
  company_name TEXT DEFAULT 'SuperPlay Studios Global Inc.',
  email TEXT DEFAULT 'support@superplayapp.com',
  website TEXT DEFAULT 'https://superplayapp.com',
  support_url TEXT DEFAULT 'https://superplayapp.com/help',
  address TEXT DEFAULT '100 Tech Boulevard, Suite 400, Innovation District',
  social_links JSONB DEFAULT '{"twitter": "https://twitter.com/superplay", "discord": "https://discord.gg/superplay", "telegram": "https://t.me/superplay"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PRIVACY & DATA SAFETY SETTINGS
CREATE TABLE IF NOT EXISTS public.privacy_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_collected TEXT[] DEFAULT ARRAY[
    'Crash diagnostics and performance logs to optimize responsiveness',
    'Optional basic device specifications (OS version and screen resolution)'
  ],
  data_shared TEXT[] DEFAULT ARRAY[
    'No data shared with unverified third parties',
    'No personal contact information or SMS/Call logs collected'
  ],
  encryption BOOLEAN DEFAULT TRUE,
  account_deletion BOOLEAN DEFAULT TRUE,
  privacy_policy_url TEXT DEFAULT '/privacy',
  safety_notes TEXT DEFAULT 'Safety starts with understanding how developers collect and share your data. Data privacy and security practices may vary based on your use, region, and age. The developer provided this information and may update it over time.',
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ANALYTICS EVENTS (Anonymous Tracking)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL, -- install_button_click, apk_download_click, external_redirect, pwa_install_prompt, pwa_install_success, share_click
  device_type TEXT, -- android, ios, desktop
  browser TEXT,
  country TEXT DEFAULT 'US',
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.install_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.release_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public read app_settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Public read content_sections" ON public.content_sections FOR SELECT USING (enabled = true);
CREATE POLICY "Public read media" ON public.media FOR SELECT USING (enabled = true);
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (published = true);
CREATE POLICY "Public read install_settings" ON public.install_settings FOR SELECT USING (true);
CREATE POLICY "Public read release_notes" ON public.release_notes FOR SELECT USING (published = true);
CREATE POLICY "Public read developer_settings" ON public.developer_settings FOR SELECT USING (true);
CREATE POLICY "Public read privacy_settings" ON public.privacy_settings FOR SELECT USING (enabled = true);

-- Anonymous Insert for Analytics
CREATE POLICY "Public insert analytics_events" ON public.analytics_events FOR INSERT WITH CHECK (true);

-- Authenticated Admin Full CRUD Policies
CREATE POLICY "Admin full app_settings" ON public.app_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full content_sections" ON public.content_sections FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full media" ON public.media FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full reviews" ON public.reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full install_settings" ON public.install_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full release_notes" ON public.release_notes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full developer_settings" ON public.developer_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full privacy_settings" ON public.privacy_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin read analytics_events" ON public.analytics_events FOR SELECT TO authenticated USING (true);

-- ====================================================================
-- SEED DEFAULT DEMO DATA
-- ====================================================================

-- Insert App Settings
INSERT INTO public.app_settings (id, app_name, developer_name, short_description, description, category, rating, review_count, download_count, age_rating, version, verified, editors_choice)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'SuperPlay App',
  'SuperPlay Studios Limited',
  'Your ultimate high-performance entertainment & utilities companion.',
  'SuperPlay App delivers a fast, fluid, and intuitive digital entertainment and utility experience. Designed from the ground up for modern devices with sleek animations, offline capabilities, and strong privacy defaults. Enjoy seamless media navigation, customizable themes, and daily curated highlights with no intrusive clutter.',
  'Entertainment & Utilities',
  4.7,
  '8.3K reviews',
  '100K+ downloads',
  '18+',
  '2.4.1',
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- Insert Install Settings
INSERT INTO public.install_settings (id, mode, apk_url, apk_filename, external_url, open_new_tab, confirmation_enabled, button_text)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'SMART',
  'https://github.com/superplay/downloads/releases/download/v2.4.1/superplay-app-v2.4.1.apk',
  'superplay-app-v2.4.1.apk',
  'https://example.com/app',
  true,
  true,
  'Install'
) ON CONFLICT (id) DO NOTHING;

-- Insert Developer Settings
INSERT INTO public.developer_settings (id, developer_name, company_name, email, website, support_url, address)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'SuperPlay Studios Limited',
  'SuperPlay Studios Global Inc.',
  'support@superplayapp.com',
  'https://superplayapp.com',
  'https://superplayapp.com/support',
  '100 Tech Center Blvd, Suite 500, California, USA'
) ON CONFLICT (id) DO NOTHING;

-- Insert Privacy Settings
INSERT INTO public.privacy_settings (id, encryption, account_deletion, privacy_policy_url, enabled)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  true,
  true,
  '/privacy',
  true
) ON CONFLICT (id) DO NOTHING;

-- Insert Media (Screenshots)
INSERT INTO public.media (url, title, caption, sort_order, type, enabled) VALUES
('https://images.unsplash.com/photo-1551650975-87deedd944c3?w=720&auto=format&fit=crop&q=80', 'Next-Gen Interface', 'Clean and minimalist UI built for maximum speed', 1, 'screenshot', true),
('https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=720&auto=format&fit=crop&q=80', 'Realtime Sync', 'Instant updates across all of your connected devices', 2, 'screenshot', true),
('https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=720&auto=format&fit=crop&q=80', 'Rich Entertainment', 'Curated collections, high fidelity visuals and fluid navigation', 3, 'screenshot', true),
('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=720&auto=format&fit=crop&q=80', 'Enhanced Security', 'Encrypted data streams and full control over your privacy', 4, 'screenshot', true);

-- Insert Reviews
INSERT INTO public.reviews (reviewer_name, rating, review_text, review_date, helpful_count, developer_response, developer_response_date, published, featured, sort_order) VALUES
('Maram K.', 5, 'Absolutely love the smooth performance and clean layout! Everything opens instantly without unnecessary lag. Highly recommended.', '2026-09-12', 87, 'Thank you so much for the kind words Maram! We are committed to keeping the app lightweight and fast.', '2026-09-12', true, true, 1),
('Neha S.', 4, 'Great app overall with lots of useful features. The dark mode looks stunning on OLED screens. Would love to see more widget options in the next update.', '2026-09-11', 30, 'Good day Neha! Thanks for the suggestion—our engineering team is already working on customizable home widgets for our upcoming release!', '2026-09-12', true, true, 2),
('Vikram Singh', 5, 'Very reliable and easy to set up. Fast loading times and no intrusive ads. The developer support is also very responsive!', '2026-08-25', 51, NULL, NULL, true, false, 3),
('Ankit Sharma', 5, 'Works like a charm on both my phone and tablet. Cleanest interface in this category by far.', '2026-08-20', 19, 'Thanks Ankit! Enjoy the experience!', '2026-08-21', true, false, 4);

-- Insert Release Notes
INSERT INTO public.release_notes (version, title, content, release_date, published) VALUES
('2.4.1', 'Performance Enhancements & Bug Fixes', '- Optimized app launch time by 35%\n- Refined touch responsiveness on high-refresh rate displays\n- Improved memory management during media playback\n- Fixed minor UI alignment on tablet layouts', '2026-09-10', true),
('2.4.0', 'Major Feature Update', '- Brand new streamlined navigation bar\n- Added customizable color themes\n- Integrated offline quick actions\n- Upgraded security protocols', '2026-08-15', true);
