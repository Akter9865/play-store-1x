export type InstallMode = 'APK' | 'URL' | 'PWA' | 'SMART';

export interface AppSettings {
  id: string;
  app_name: string;
  developer_name: string;
  short_description: string;
  description: string;
  features: string[];
  category: string;
  rating: number;
  review_count: string;
  download_count: string;
  age_rating: string;
  version: string;
  last_updated: string;
  icon_url: string;
  banner_url?: string;
  verified: boolean;
  editors_choice: boolean;
  site_name?: string;
  site_logo_url?: string;
  site_badge_text?: string;
  show_site_badge?: boolean;
  pwa_name?: string;
  pwa_short_name?: string;
  pwa_theme_color?: string;
  pwa_background_color?: string;
  icon_192_url?: string;
  icon_512_url?: string;
  apple_touch_icon_url?: string;
  favicon_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContentSection {
  id: string;
  section_key: string;
  title: string;
  content: string;
  enabled: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface MediaItem {
  id: string;
  type: 'screenshot' | 'banner' | 'icon' | 'promo';
  url: string;
  title?: string;
  caption?: string;
  sort_order: number;
  enabled: boolean;
  created_at?: string;
}

export interface Review {
  id: string;
  reviewer_name: string;
  avatar_url?: string;
  rating: number;
  review_text: string;
  review_date: string;
  helpful_count: number;
  developer_response?: string;
  developer_response_date?: string;
  published: boolean;
  featured: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface InstallSettings {
  id: string;
  mode: InstallMode;
  apk_url?: string;
  apk_filename?: string;
  apk_size_bytes?: number;
  external_url?: string;
  open_new_tab: boolean;
  confirmation_enabled: boolean;
  button_text: string;
  ios_button_text?: string;
  ios_store_url?: string;
  store_theme_mode?: 'auto' | 'android_only' | 'ios_only';
  initializing_text?: string;
  downloading_text?: string;
  installing_text?: string;
  open_text?: string;
  success_message: string;
  android_message: string;
  ios_message: string;
  desktop_message: string;
  created_at?: string;
  updated_at?: string;
}

export interface ReleaseNote {
  id: string;
  version: string;
  title: string;
  content: string;
  release_date: string;
  published: boolean;
  created_at?: string;
}

export interface DeveloperSettings {
  id: string;
  developer_name: string;
  company_name: string;
  email: string;
  website: string;
  support_url: string;
  address?: string;
  social_links?: {
    twitter?: string;
    discord?: string;
    telegram?: string;
    facebook?: string;
    instagram?: string;
    [key: string]: string | undefined;
  };
  created_at?: string;
  updated_at?: string;
}

export interface PrivacySettings {
  id: string;
  data_collected: string[];
  data_shared: string[];
  encryption: boolean;
  account_deletion: boolean;
  privacy_policy_url: string;
  safety_notes: string;
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export type AnalyticsEventType = 
  | 'install_button_click'
  | 'apk_download_click'
  | 'external_redirect'
  | 'pwa_install_prompt'
  | 'pwa_install_success'
  | 'share_click';

export interface AnalyticsEvent {
  id: string;
  event_type: AnalyticsEventType;
  device_type: 'android' | 'ios' | 'desktop';
  browser?: string;
  country?: string;
  referrer?: string;
  created_at: string;
}

export interface AnalyticsSummary {
  totalInstallClicks: number;
  apkDownloads: number;
  externalRedirects: number;
  pwaPrompts: number;
  pwaInstalls: number;
  shareClicks: number;
  totalReviews: number;
  publishedReviews: number;
  mediaCount: number;
  recentEvents: AnalyticsEvent[];
}

export interface GeneratedApp {
  id: string;
  app_id: string;
  app_name: string;
  short_name: string;
  target_url?: string;
  apk_url?: string;
  apk_filename?: string;
  apk_size_bytes?: number;
  icon_url: string;
  icon_192_url?: string;
  icon_512_url?: string;
  apple_touch_icon_url?: string;
  favicon_url?: string;
  theme_color?: string;
  background_color?: string;
  description?: string;
  short_description?: string;
  category?: string;
  rating?: number;
  review_count?: string;
  download_count?: string;
  version?: string;
  display_mode?: 'standalone' | 'fullscreen' | 'minimal-ui';
  embed_mode?: 'iframe_seamless' | 'direct_launch';
  button_text?: string;
  ios_button_text?: string;
  ios_url?: string;
  created_at?: string;
  updated_at?: string;
}

