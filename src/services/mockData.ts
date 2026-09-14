import {
  AppSettings,
  InstallSettings,
  MediaItem,
  Review,
  ReleaseNote,
  DeveloperSettings,
  PrivacySettings,
  AnalyticsEvent,
} from '../types';

export const initialAppSettings: AppSettings = {
  id: '00000000-0000-0000-0000-000000000001',
  app_name: 'NexusPlay Pro',
  developer_name: 'NexusPlay Global Limited',
  short_description: 'Next-generation entertainment, fluid utilities, and real-time interactive experiences.',
  description: `Experience the future of digital entertainment and daily utilities in one fast, beautifully crafted app.

Built with an ultra-responsive interface, NexusPlay Pro gives you instant access to interactive media, customizable workspaces, dynamic themes, and lightning-fast syncing across all your devices.

Key Features & Highlights:
• Instant App Launch: Optimized cold-starts with zero stutter or lag.
• Fluid Touch Gestures: Natural swipe carousels and haptic feedback.
• Modern Dark & Light Themes: Designed for battery saving and eye comfort.
• Bank-Grade Data Privacy: Encrypted data channels with granular permission controls.
• Universal Compatibility: Smoothly runs on Android, iOS Safari, and Desktop workstations.
• Weekly Feature Drops: Regularly enhanced with community-requested tools.`,
  features: [
    'Blazing fast performance with zero lag',
    'Intuitive gesture controls and custom themes',
    'Comprehensive safety and privacy controls',
    'Regular weekly updates and feature enhancements',
    'Ultra-low battery and memory consumption',
  ],
  category: 'Entertainment & Utilities',
  rating: 4.7,
  review_count: '8.3K reviews',
  download_count: '100K+ downloads',
  age_rating: '18+',
  version: '2.4.1',
  last_updated: '14 September 2026',
  icon_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=256&auto=format&fit=crop&q=80',
  banner_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
  verified: true,
  editors_choice: true,
  site_name: 'AppMarket',
  site_logo_url: '',
  site_badge_text: 'Verified',
  show_site_badge: true,
  pwa_name: 'SuperPlay App',
  pwa_short_name: 'SuperPlay',
  pwa_theme_color: '#01875f',
  pwa_background_color: '#ffffff',
  icon_192_url: '/icon-192.png',
  icon_512_url: '/icon-512.png',
  apple_touch_icon_url: '/apple-touch-icon.png',
  favicon_url: '/favicon.png',
};

export const initialInstallSettings: InstallSettings = {
  id: '00000000-0000-0000-0000-000000000002',
  mode: 'SMART',
  apk_url: 'https://github.com/nexusplay/downloads/releases/download/v2.4.1/nexusplay-pro-v2.4.1.apk',
  apk_filename: 'nexusplay-pro-v2.4.1.apk',
  apk_size_bytes: 24650000, // ~24.6 MB
  external_url: 'https://example.com/app',
  open_new_tab: true,
  confirmation_enabled: true,
  button_text: 'Install',
  initializing_text: 'Initializing...',
  downloading_text: 'Downloading...',
  installing_text: 'Installing...',
  open_text: 'Open',
  success_message: 'Download initiated. Please check your notification bar or browser downloads.',
  android_message: 'Download the verified Android APK directly to your phone or tablet.',
  ios_message: 'Add this web application directly to your iPhone/iPad Home Screen in 3 easy steps.',
  desktop_message: 'Install this application in a dedicated window on your Mac or PC.',
};

export const initialMediaItems: MediaItem[] = [
  {
    id: 'media-1',
    type: 'screenshot',
    url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=720&auto=format&fit=crop&q=80',
    title: 'Fast & Fluid Navigation',
    caption: 'Clean, minimalist UI engineered for high refresh-rate mobile screens.',
    sort_order: 1,
    enabled: true,
  },
  {
    id: 'media-2',
    type: 'screenshot',
    url: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=720&auto=format&fit=crop&q=80',
    title: 'Cross-Device Cloud Sync',
    caption: 'Keep your preferences, saved items, and settings unified everywhere.',
    sort_order: 2,
    enabled: true,
  },
  {
    id: 'media-3',
    type: 'screenshot',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=720&auto=format&fit=crop&q=80',
    title: 'Immersive Entertainment',
    caption: 'High-definition media playback with low-latency responsiveness.',
    sort_order: 3,
    enabled: true,
  },
  {
    id: 'media-4',
    type: 'screenshot',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=720&auto=format&fit=crop&q=80',
    title: 'Privacy & Security First',
    caption: 'Zero third-party trackers and strict transparent data disclosure.',
    sort_order: 4,
    enabled: true,
  },
];

export const initialReviews: Review[] = [
  {
    id: 'rev-1',
    reviewer_name: 'Maram K.',
    rating: 5,
    review_text: 'The best app in its category. Fluid animations, instant loading, and very clean design without annoying banners. Everything works as advertised!',
    review_date: '12 September 2026',
    helpful_count: 87,
    developer_response: 'Good day Maram! Thank you for your wonderful review. Our team continuously tests to ensure peak 60fps performance on all devices!',
    developer_response_date: '12 September 2026',
    published: true,
    featured: true,
    sort_order: 1,
  },
  {
    id: 'rev-2',
    reviewer_name: 'Neha S.',
    rating: 4,
    review_text: 'Solid app with incredible reliability. The dark mode looks gorgeous on my OLED display. Are there any upcoming widget options for the home screen?',
    review_date: '12 September 2026',
    helpful_count: 30,
    developer_response: 'Good day Neha! Yes, our engineering team has included customizable home screen widgets in the upcoming v2.5 release scheduled for next month!',
    developer_response_date: '11 September 2026',
    published: true,
    featured: true,
    sort_order: 2,
  },
  {
    id: 'rev-3',
    reviewer_name: 'DesiMumbaikar',
    rating: 5,
    review_text: 'Super fast setup. Did not require unnecessary permissions or lengthy signup forms. The APK downloaded and installed without a hitch.',
    review_date: '11 September 2026',
    helpful_count: 54,
    developer_response: 'Thank you for highlighting our privacy-first setup!',
    developer_response_date: '11 September 2026',
    published: true,
    featured: false,
    sort_order: 3,
  },
  {
    id: 'rev-4',
    reviewer_name: 'cool_ankit_123',
    rating: 5,
    review_text: "It's okay and works as expected. Very fast on mobile data.",
    review_date: '25 August 2026',
    helpful_count: 12,
    developer_response: undefined,
    developer_response_date: undefined,
    published: true,
    featured: false,
    sort_order: 4,
  },
  {
    id: 'rev-5',
    reviewer_name: 'VikramSingh',
    rating: 5,
    review_text: "I've started enjoying the utility and smooth media navigation again. Clean transitions and solid stability over long sessions.",
    review_date: '25 August 2026',
    helpful_count: 51,
    developer_response: undefined,
    developer_response_date: undefined,
    published: true,
    featured: false,
    sort_order: 5,
  },
];

export const initialReleaseNotes: ReleaseNote[] = [
  {
    id: 'rel-1',
    version: '2.4.1',
    title: 'Performance Enhancements & Display Tuning',
    content: `• Boosted cold-start launch speed by 35% on mobile devices
• Refined gesture sensitivity for edge-swipe navigation
• Optimized offline cache eviction to save user storage
• Minor UI polish on high-DPI desktop viewports`,
    release_date: '10 September 2026',
    published: true,
  },
  {
    id: 'rel-2',
    version: '2.4.0',
    title: 'Major Feature Update & PWA 2.0',
    content: `• Added standalone PWA support with offline caching
• New high-contrast dark theme mode
• Upgraded data protection and TLS 1.3 encryption
• Streamlined install flow and quick launcher`,
    release_date: '15 August 2026',
    published: true,
  },
];

export const initialDeveloperSettings: DeveloperSettings = {
  id: '00000000-0000-0000-0000-000000000003',
  developer_name: 'NexusPlay Global Limited',
  company_name: 'NexusPlay Studios Inc.',
  email: 'support@nexusplayapp.com',
  website: 'https://nexusplayapp.com',
  support_url: 'https://nexusplayapp.com/support',
  address: '100 Silicon Valley Way, Suite 400, San Jose, CA 95110',
  social_links: {
    twitter: 'https://twitter.com/nexusplay',
    discord: 'https://discord.gg/nexusplay',
    telegram: 'https://t.me/nexusplay',
  },
};

export const initialPrivacySettings: PrivacySettings = {
  id: '00000000-0000-0000-0000-000000000004',
  data_collected: [
    'Crash diagnostics and performance logs to optimize responsiveness',
    'Optional basic device specifications (OS version and display resolution)',
  ],
  data_shared: [
    'No data shared with unverified third parties',
    'No personal contact information, phone numbers, or SMS logs collected',
  ],
  encryption: true,
  account_deletion: true,
  privacy_policy_url: '/privacy',
  safety_notes: 'Safety starts with understanding how developers collect and share your data. Data privacy and security practices may vary based on your use, region, and age. The developer provided this information and may update it over time.',
  enabled: true,
};

export const initialAnalyticsEvents: AnalyticsEvent[] = [
  {
    id: 'evt-1',
    event_type: 'install_button_click',
    device_type: 'android',
    browser: 'Chrome Mobile',
    country: 'IN',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'evt-2',
    event_type: 'apk_download_click',
    device_type: 'android',
    browser: 'Chrome Mobile',
    country: 'IN',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'evt-3',
    event_type: 'install_button_click',
    device_type: 'ios',
    browser: 'Safari Mobile',
    country: 'US',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'evt-4',
    event_type: 'external_redirect',
    device_type: 'desktop',
    browser: 'Chrome',
    country: 'GB',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'evt-5',
    event_type: 'pwa_install_prompt',
    device_type: 'desktop',
    browser: 'Edge',
    country: 'DE',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];
