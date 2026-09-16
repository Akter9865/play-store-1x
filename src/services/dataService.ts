import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  AppSettings,
  InstallSettings,
  MediaItem,
  Review,
  ReleaseNote,
  DeveloperSettings,
  PrivacySettings,
  AnalyticsEvent,
  AnalyticsSummary,
  AnalyticsEventType,
  GeneratedApp,
} from '../types';
import {
  initialAppSettings,
  initialInstallSettings,
  initialMediaItems,
  initialReviews,
  initialReleaseNotes,
  initialDeveloperSettings,
  initialPrivacySettings,
  initialAnalyticsEvents,
  initialGeneratedApps,
} from './mockData';

// Local storage keys for resilient offline/fallback persistence
const STORAGE_KEYS = {
  APP_SETTINGS: 'play_app_settings',
  INSTALL_SETTINGS: 'play_install_settings',
  MEDIA: 'play_media_items',
  REVIEWS: 'play_reviews',
  RELEASE_NOTES: 'play_release_notes',
  DEVELOPER_SETTINGS: 'play_dev_settings',
  PRIVACY_SETTINGS: 'play_privacy_settings',
  ANALYTICS: 'play_analytics_events',
  GENERATED_APPS: 'play_generated_apps',
};

function getLocal<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultVal;
    return JSON.parse(item);
  } catch {
    return defaultVal;
  }
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }
}

// In-memory cache for ultra-fast response times & zero network lag
interface CacheItem<T> {
  data: T;
  timestamp: number;
}
const MEMORY_CACHE = new Map<string, CacheItem<unknown>>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

function getCached<T>(key: string): T | null {
  const item = MEMORY_CACHE.get(key);
  if (item && (Date.now() - item.timestamp < CACHE_TTL_MS)) {
    return item.data as T;
  }
  return null;
}

function setCached<T>(key: string, data: T): void {
  MEMORY_CACHE.set(key, { data, timestamp: Date.now() });
}

export function clearDataCache(): void {
  MEMORY_CACHE.clear();
}

// Synchronous fast getters for instant 0ms initial render
export function getAppSettingsSync(): AppSettings {
  const cached = getCached<AppSettings>('app_settings');
  if (cached) return cached;
  const local = getLocal<AppSettings>(STORAGE_KEYS.APP_SETTINGS, initialAppSettings);
  if (local.app_name === 'NexusPlay Pro' || !local.app_name) {
    setLocal(STORAGE_KEYS.APP_SETTINGS, initialAppSettings);
    return initialAppSettings;
  }
  return local;
}

export function getInstallSettingsSync(): InstallSettings {
  const cached = getCached<InstallSettings>('install_settings');
  if (cached) return cached;
  const local = getLocal<InstallSettings>(STORAGE_KEYS.INSTALL_SETTINGS, initialInstallSettings);
  const isOldExt = !local.external_url || local.external_url.trim() === '' || local.external_url.includes('1xbetfair.co') || local.external_url.includes('1xbetfair.me') || local.external_url.includes('example.com');
  const isOldIos = !local.ios_store_url || local.ios_store_url.includes('1xbetfair.co') || local.ios_store_url.includes('1xbetfair.me');
  const updated: InstallSettings = {
    ...local,
    mode: 'PWA',
    external_url: isOldExt ? 'https://1xbetfair.online/' : local.external_url,
    ios_store_url: isOldIos ? 'https://1xbetfair.online/' : local.ios_store_url,
    android_message: 'Install 1Xbetfair directly on your Android mobile home screen.',
    ios_message: 'Add 1Xbetfair directly to your iPhone/iPad Home Screen for full screen performance.',
  };
  return updated;
}

export function getMediaItemsSync(): MediaItem[] {
  const cached = getCached<MediaItem[]>('media_items');
  if (cached) return cached;
  return getLocal<MediaItem[]>(STORAGE_KEYS.MEDIA, initialMediaItems);
}

export function getReviewsSync(publishedOnly: boolean = false): Review[] {
  const cached = getCached<Review[]>(publishedOnly ? 'reviews_pub' : 'reviews_all');
  if (cached) return cached;
  const all = getLocal<Review[]>(STORAGE_KEYS.REVIEWS, initialReviews);
  return publishedOnly ? all.filter((r) => r.published) : all;
}

export function getReleaseNotesSync(publishedOnly: boolean = true): ReleaseNote[] {
  const cached = getCached<ReleaseNote[]>(publishedOnly ? 'release_pub' : 'release_all');
  if (cached) return cached;
  const all = getLocal<ReleaseNote[]>(STORAGE_KEYS.RELEASE_NOTES, initialReleaseNotes);
  return publishedOnly ? all.filter((r) => r.published) : all;
}

export function getDeveloperSettingsSync(): DeveloperSettings {
  const cached = getCached<DeveloperSettings>('dev_settings');
  if (cached) return cached;
  return getLocal<DeveloperSettings>(STORAGE_KEYS.DEVELOPER_SETTINGS, initialDeveloperSettings);
}

export function getPrivacySettingsSync(): PrivacySettings {
  const cached = getCached<PrivacySettings>('privacy_settings');
  if (cached) return cached;
  return getLocal<PrivacySettings>(STORAGE_KEYS.PRIVACY_SETTINGS, initialPrivacySettings);
}

export function getGeneratedAppSync(appId: string): GeneratedApp | null {
  const cleanId = appId.toLowerCase().trim();
  const cached = getCached<GeneratedApp>(`gen_app_${cleanId}`);
  if (cached) return cached;
  const apps = getLocal<GeneratedApp[]>(STORAGE_KEYS.GENERATED_APPS, initialGeneratedApps);
  return apps.find((a) => a.app_id.toLowerCase() === cleanId || a.id === cleanId) || null;
}

// ----------------------------------------------------
// APP SETTINGS
// ----------------------------------------------------
export async function getAppSettings(): Promise<AppSettings> {
  const cached = getCached<AppSettings>('app_settings');
  if (cached) return cached;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .limit(1)
      .single();
    if (!error && data) {
      setCached('app_settings', data as AppSettings);
      setLocal(STORAGE_KEYS.APP_SETTINGS, data);
      return data as AppSettings;
    }
  }
  const local = getAppSettingsSync();
  setCached('app_settings', local);
  return local;
}

export async function updateAppSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getAppSettings();
  const updated = { ...current, ...settings, updated_at: new Date().toISOString() };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('app_settings')
      .update(updated)
      .eq('id', updated.id);
    if (error) console.error('Error updating app_settings:', error);
  }

  clearDataCache();
  setLocal(STORAGE_KEYS.APP_SETTINGS, updated);
  return updated;
}

// ----------------------------------------------------
// INSTALL SETTINGS
// ----------------------------------------------------
export async function getInstallSettings(): Promise<InstallSettings> {
  const cached = getCached<InstallSettings>('install_settings');
  if (cached) return cached;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('install_settings')
      .select('*')
      .limit(1)
      .single();
    if (!error && data) {
      const isOldExternal = !data.external_url || data.external_url.trim() === '' || data.external_url.includes('1xbetfair.co') || data.external_url.includes('1xbetfair.me') || data.external_url.includes('example.com');
      const isOldIos = !data.ios_store_url || data.ios_store_url.trim() === '' || data.ios_store_url.includes('1xbetfair.co') || data.ios_store_url.includes('1xbetfair.me') || data.ios_store_url.includes('example.com');
      const isOldApk = !data.apk_url || data.apk_url.includes('1xbetfair.co') || data.apk_url.includes('1xbetfair.me');
      const sanitized: InstallSettings = {
        ...(data as InstallSettings),
        external_url: isOldExternal ? 'https://1xbetfair.online/' : data.external_url,
        ios_store_url: isOldIos ? 'https://1xbetfair.online/' : data.ios_store_url,
        apk_url: isOldApk ? 'https://1xbetfair.online/downloads/app-release.apk' : data.apk_url,
        mode: 'PWA',
      };
      setCached('install_settings', sanitized);
      setLocal(STORAGE_KEYS.INSTALL_SETTINGS, sanitized);
      return sanitized;
    }
  }
  const local = getInstallSettingsSync();
  setCached('install_settings', local);
  return local;
}

export async function updateInstallSettings(settings: Partial<InstallSettings>): Promise<InstallSettings> {
  const current = await getInstallSettings();
  const updated = { ...current, ...settings, updated_at: new Date().toISOString() };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('install_settings')
      .update(updated)
      .eq('id', updated.id);
    if (error) console.error('Error updating install_settings:', error);
  }

  clearDataCache();
  setLocal(STORAGE_KEYS.INSTALL_SETTINGS, updated);
  return updated;
}

// ----------------------------------------------------
// MEDIA ITEMS
// ----------------------------------------------------
export async function getMediaItems(): Promise<MediaItem[]> {
  const cached = getCached<MediaItem[]>('media_items');
  if (cached) return cached;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data && data.length > 0) {
      setCached('media_items', data as MediaItem[]);
      setLocal(STORAGE_KEYS.MEDIA, data);
      return data as MediaItem[];
    }
  }
  const local = getMediaItemsSync();
  setCached('media_items', local);
  return local;
}

export async function saveMediaItem(item: Partial<MediaItem>): Promise<MediaItem> {
  const items = await getMediaItems();
  let result: MediaItem;

  if (item.id) {
    // Update
    result = { ...items.find((m) => m.id === item.id)!, ...item } as MediaItem;
    const newItems = items.map((m) => (m.id === item.id ? result : m));
    setLocal(STORAGE_KEYS.MEDIA, newItems);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('media').update({
        type: result.type,
        url: result.url,
        title: result.title,
        caption: result.caption,
        sort_order: result.sort_order,
        enabled: result.enabled,
      }).eq('id', item.id);
    }
  } else {
    // Create
    const generatedId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined;
    result = {
      id: generatedId || ('media-' + Date.now()),
      type: item.type || 'screenshot',
      url: item.url || '',
      title: item.title || '',
      caption: item.caption || '',
      sort_order: items.length + 1,
      enabled: item.enabled ?? true,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const payload: Record<string, any> = {
        type: result.type,
        url: result.url,
        title: result.title,
        caption: result.caption,
        sort_order: result.sort_order,
        enabled: result.enabled,
      };
      if (generatedId) payload.id = generatedId;
      const { data, error } = await supabase.from('media').insert(payload).select().single();
      if (!error && data) {
        result = data as MediaItem;
      } else if (error) {
        console.error('Error inserting media item to Supabase:', error);
      }
    }

    const newItems = [...items, result];
    setLocal(STORAGE_KEYS.MEDIA, newItems);
  }

  clearDataCache();
  return result;
}

export async function deleteMediaItem(id: string): Promise<void> {
  const items = await getMediaItems();
  const filtered = items.filter((m) => m.id !== id);
  setLocal(STORAGE_KEYS.MEDIA, filtered);

  if (isSupabaseConfigured && supabase) {
    await supabase.from('media').delete().eq('id', id);
  }
  clearDataCache();
}

export async function reorderMediaItems(newOrderedItems: MediaItem[]): Promise<void> {
  const updated = newOrderedItems.map((item, index) => ({
    ...item,
    sort_order: index + 1,
  }));
  setLocal(STORAGE_KEYS.MEDIA, updated);

  if (isSupabaseConfigured && supabase) {
    for (const item of updated) {
      await supabase.from('media').update({ sort_order: item.sort_order }).eq('id', item.id);
    }
  }
  clearDataCache();
}

// ----------------------------------------------------
// REVIEWS
// ----------------------------------------------------
export async function getReviews(publishedOnly: boolean = false): Promise<Review[]> {
  const cacheKey = publishedOnly ? 'reviews_pub' : 'reviews_all';
  const cached = getCached<Review[]>(cacheKey);
  if (cached) return cached;

  if (isSupabaseConfigured && supabase) {
    let query = supabase.from('reviews').select('*').order('sort_order', { ascending: true });
    if (publishedOnly) {
      query = query.eq('published', true);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      setCached(cacheKey, data as Review[]);
      setLocal(STORAGE_KEYS.REVIEWS, data);
      return data as Review[];
    }
  }
  const local = getReviewsSync(publishedOnly);
  setCached(cacheKey, local);
  return local;
}

export async function saveReview(review: Partial<Review>): Promise<Review> {
  const reviews = await getReviews(false);
  let result: Review;

  if (review.id) {
    result = { ...reviews.find((r) => r.id === review.id)!, ...review, updated_at: new Date().toISOString() } as Review;
    const updated = reviews.map((r) => (r.id === review.id ? result : r));
    setLocal(STORAGE_KEYS.REVIEWS, updated);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('reviews').update({
        reviewer_name: result.reviewer_name,
        avatar_url: result.avatar_url,
        rating: result.rating,
        review_text: result.review_text,
        helpful_count: result.helpful_count,
        developer_response: result.developer_response,
        published: result.published,
        featured: result.featured,
        sort_order: result.sort_order,
      }).eq('id', review.id);
    }
  } else {
    const generatedId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined;
    result = {
      id: generatedId || ('rev-' + Date.now()),
      reviewer_name: review.reviewer_name || 'Anonymous User',
      rating: review.rating || 5,
      review_text: review.review_text || '',
      review_date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      helpful_count: review.helpful_count || 0,
      developer_response: review.developer_response,
      developer_response_date: review.developer_response ? new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined,
      published: review.published ?? true,
      featured: review.featured ?? false,
      sort_order: reviews.length + 1,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const payload: Record<string, any> = {
        reviewer_name: result.reviewer_name,
        avatar_url: result.avatar_url,
        rating: result.rating,
        review_text: result.review_text,
        review_date: new Date().toISOString().split('T')[0],
        helpful_count: result.helpful_count,
        developer_response: result.developer_response,
        developer_response_date: result.developer_response_date ? new Date().toISOString().split('T')[0] : null,
        published: result.published,
        featured: result.featured,
        sort_order: result.sort_order,
      };
      if (generatedId) payload.id = generatedId;
      const { data, error } = await supabase.from('reviews').insert(payload).select().single();
      if (!error && data) {
        result = data as Review;
      } else if (error) {
        console.error('Error inserting review to Supabase:', error);
      }
    }

    const updated = [result, ...reviews];
    setLocal(STORAGE_KEYS.REVIEWS, updated);
  }

  clearDataCache();
  return result;
}

export async function deleteReview(id: string): Promise<void> {
  const reviews = await getReviews(false);
  const filtered = reviews.filter((r) => r.id !== id);
  setLocal(STORAGE_KEYS.REVIEWS, filtered);

  if (isSupabaseConfigured && supabase) {
    await supabase.from('reviews').delete().eq('id', id);
  }
  clearDataCache();
}

export async function voteHelpfulReview(id: string, increment: boolean = true): Promise<number> {
  const reviews = await getReviews(false);
  const rev = reviews.find((r) => r.id === id);
  if (!rev) return 0;

  const newCount = Math.max(0, rev.helpful_count + (increment ? 1 : -1));
  rev.helpful_count = newCount;
  setLocal(STORAGE_KEYS.REVIEWS, reviews);

  if (isSupabaseConfigured && supabase) {
    await supabase.from('reviews').update({ helpful_count: newCount }).eq('id', id);
  }
  clearDataCache();
  return newCount;
}

// ----------------------------------------------------
// RELEASE NOTES (WHAT'S NEW)
// ----------------------------------------------------
export async function getReleaseNotes(publishedOnly: boolean = true): Promise<ReleaseNote[]> {
  const cacheKey = publishedOnly ? 'release_pub' : 'release_all';
  const cached = getCached<ReleaseNote[]>(cacheKey);
  if (cached) return cached;

  if (isSupabaseConfigured && supabase) {
    let query = supabase.from('release_notes').select('*').order('created_at', { ascending: false });
    if (publishedOnly) {
      query = query.eq('published', true);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      setCached(cacheKey, data as ReleaseNote[]);
      setLocal(STORAGE_KEYS.RELEASE_NOTES, data);
      return data as ReleaseNote[];
    }
  }
  const local = getReleaseNotesSync(publishedOnly);
  setCached(cacheKey, local);
  return local;
}

export async function saveReleaseNote(note: Partial<ReleaseNote>): Promise<ReleaseNote> {
  const notes = await getReleaseNotes(false);
  let result: ReleaseNote;

  if (note.id) {
    result = { ...notes.find((n) => n.id === note.id)!, ...note } as ReleaseNote;
    const updated = notes.map((n) => (n.id === note.id ? result : n));
    setLocal(STORAGE_KEYS.RELEASE_NOTES, updated);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('release_notes').update({
        version: result.version,
        title: result.title,
        content: result.content,
        published: result.published,
      }).eq('id', note.id);
    }
  } else {
    const generatedId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined;
    result = {
      id: generatedId || ('rel-' + Date.now()),
      version: note.version || '1.0.0',
      title: note.title || 'Update',
      content: note.content || '',
      release_date: note.release_date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      published: note.published ?? true,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const payload: Record<string, any> = {
        version: result.version,
        title: result.title,
        content: result.content,
        release_date: new Date().toISOString().split('T')[0],
        published: result.published,
      };
      if (generatedId) payload.id = generatedId;
      const { data, error } = await supabase.from('release_notes').insert(payload).select().single();
      if (!error && data) {
        result = data as ReleaseNote;
      } else if (error) {
        console.error('Error inserting release note to Supabase:', error);
      }
    }

    const updated = [result, ...notes];
    setLocal(STORAGE_KEYS.RELEASE_NOTES, updated);
  }

  clearDataCache();
  return result;
}

export async function deleteReleaseNote(id: string): Promise<void> {
  const notes = await getReleaseNotes(false);
  const filtered = notes.filter((n) => n.id !== id);
  setLocal(STORAGE_KEYS.RELEASE_NOTES, filtered);

  if (isSupabaseConfigured && supabase) {
    await supabase.from('release_notes').delete().eq('id', id);
  }
  clearDataCache();
}

// ----------------------------------------------------
// DEVELOPER SETTINGS
// ----------------------------------------------------
export async function getDeveloperSettings(): Promise<DeveloperSettings> {
  const cached = getCached<DeveloperSettings>('dev_settings');
  if (cached) return cached;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('developer_settings')
      .select('*')
      .limit(1)
      .single();
    if (!error && data) {
      setCached('dev_settings', data as DeveloperSettings);
      setLocal(STORAGE_KEYS.DEVELOPER_SETTINGS, data);
      return data as DeveloperSettings;
    }
  }
  const local = getDeveloperSettingsSync();
  setCached('dev_settings', local);
  return local;
}

export async function updateDeveloperSettings(settings: Partial<DeveloperSettings>): Promise<DeveloperSettings> {
  const current = await getDeveloperSettings();
  const updated = { ...current, ...settings, updated_at: new Date().toISOString() };

  if (isSupabaseConfigured && supabase) {
    await supabase.from('developer_settings').update(updated).eq('id', updated.id);
  }

  clearDataCache();
  setLocal(STORAGE_KEYS.DEVELOPER_SETTINGS, updated);
  return updated;
}

// ----------------------------------------------------
// PRIVACY SETTINGS
// ----------------------------------------------------
export async function getPrivacySettings(): Promise<PrivacySettings> {
  const cached = getCached<PrivacySettings>('privacy_settings');
  if (cached) return cached;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('privacy_settings')
      .select('*')
      .limit(1)
      .single();
    if (!error && data) {
      setCached('privacy_settings', data as PrivacySettings);
      setLocal(STORAGE_KEYS.PRIVACY_SETTINGS, data);
      return data as PrivacySettings;
    }
  }
  const local = getPrivacySettingsSync();
  setCached('privacy_settings', local);
  return local;
}

export async function updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<PrivacySettings> {
  const current = await getPrivacySettings();
  const updated = { ...current, ...settings, updated_at: new Date().toISOString() };

  if (isSupabaseConfigured && supabase) {
    await supabase.from('privacy_settings').update(updated).eq('id', updated.id);
  }

  clearDataCache();
  setLocal(STORAGE_KEYS.PRIVACY_SETTINGS, updated);
  return updated;
}

// ----------------------------------------------------
// ANALYTICS TRACKING
// ----------------------------------------------------
export async function logAnalyticsEvent(
  eventType: AnalyticsEventType,
  deviceType: 'android' | 'ios' | 'desktop',
  browser?: string
): Promise<void> {
  const event: AnalyticsEvent = {
    id: 'evt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    event_type: eventType,
    device_type: deviceType,
    browser: browser || (typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 30) : 'Browser'),
    country: 'US',
    referrer: typeof document !== 'undefined' ? document.referrer : '',
    created_at: new Date().toISOString(),
  };

  const existing = getLocal<AnalyticsEvent[]>(STORAGE_KEYS.ANALYTICS, initialAnalyticsEvents);
  setLocal(STORAGE_KEYS.ANALYTICS, [event, ...existing].slice(0, 200));

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('analytics_events').insert(event);
    } catch (e) {
      console.warn('Analytics insert error:', e);
    }
  }
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  let events = getLocal<AnalyticsEvent[]>(STORAGE_KEYS.ANALYTICS, initialAnalyticsEvents);

  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (data && data.length > 0) {
      events = data as AnalyticsEvent[];
    }
  }

  const reviews = await getReviews(false);
  const media = await getMediaItems();

  const totalInstallClicks = events.filter((e) => e.event_type === 'install_button_click').length;
  const apkDownloads = events.filter((e) => e.event_type === 'apk_download_click').length;
  const externalRedirects = events.filter((e) => e.event_type === 'external_redirect').length;
  const pwaPrompts = events.filter((e) => e.event_type === 'pwa_install_prompt').length;
  const pwaInstalls = events.filter((e) => e.event_type === 'pwa_install_success').length;
  const shareClicks = events.filter((e) => e.event_type === 'share_click').length;

  return {
    totalInstallClicks,
    apkDownloads,
    externalRedirects,
    pwaPrompts,
    pwaInstalls,
    shareClicks,
    totalReviews: reviews.length,
    publishedReviews: reviews.filter((r) => r.published).length,
    mediaCount: media.length,
    recentEvents: events.slice(0, 15),
  };
}

// ----------------------------------------------------
// FILE UPLOAD (SUPABASE STORAGE + LOCAL DATAURL FALLBACK)
// ----------------------------------------------------
export async function uploadFile(
  bucket: 'app-assets' | 'screenshots' | 'banners' | 'apk',
  file: File
): Promise<{ url: string; filename: string; size: number }> {
  const fileExt = file.name.split('.').pop() || 'png';
  const cleanBase = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${Date.now()}_${cleanBase}.${fileExt}`;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.storage.from(bucket).upload(filename, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || undefined,
      });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filename);
        return {
          url: publicUrlData.publicUrl,
          filename: file.name,
          size: file.size,
        };
      } else if (error) {
        console.warn('Supabase storage upload error, falling back to local object:', error);
      }
    } catch (e) {
      console.warn('Supabase storage exception:', e);
    }
  }

  // Local fallback: read file as Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        url: reader.result as string,
        filename: file.name,
        size: file.size,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ----------------------------------------------------
// GENERATED APPS (Multi-App PWA Platform)
// ----------------------------------------------------
export async function getGeneratedApps(): Promise<GeneratedApp[]> {
  const cached = getCached<GeneratedApp[]>('generated_apps');
  if (cached) return cached;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('generated_apps')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      setCached('generated_apps', data as GeneratedApp[]);
      setLocal(STORAGE_KEYS.GENERATED_APPS, data);
      return data as GeneratedApp[];
    }
  }
  const local = getLocal<GeneratedApp[]>(STORAGE_KEYS.GENERATED_APPS, initialGeneratedApps);
  setCached('generated_apps', local);
  return local;
}

export async function getGeneratedApp(appId: string): Promise<GeneratedApp | null> {
  const cleanId = appId.toLowerCase().trim();
  const cached = getCached<GeneratedApp>(`gen_app_${cleanId}`);
  if (cached) return cached;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('generated_apps')
      .select('*')
      .eq('app_id', cleanId)
      .limit(1)
      .single();
    if (!error && data) {
      setCached(`gen_app_${cleanId}`, data as GeneratedApp);
      return data as GeneratedApp;
    }
  }

  const local = getGeneratedAppSync(appId);
  if (local) setCached(`gen_app_${cleanId}`, local);
  return local;
}

export async function saveGeneratedApp(app: Partial<GeneratedApp>): Promise<GeneratedApp> {
  const apps = await getGeneratedApps();
  let result: GeneratedApp;

  const now = new Date().toISOString();
  const appIdClean = (app.app_id || app.app_name || 'app')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/^-+|-+$/g, '');

  if (app.id) {
    // Update existing
    const existing = apps.find((a) => a.id === app.id || a.app_id === app.app_id);
    result = {
      ...existing,
      ...app,
      app_id: appIdClean,
      updated_at: now,
    } as GeneratedApp;

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('generated_apps')
        .update(result)
        .eq('id', result.id);
      if (error) console.error('Error updating generated_app:', error);
    }

    const updatedList = apps.map((a) => (a.id === result.id ? result : a));
    setLocal(STORAGE_KEYS.GENERATED_APPS, updatedList);
  } else {
    // Insert new
    result = {
      id: crypto.randomUUID ? crypto.randomUUID() : `app-${Date.now()}`,
      app_id: appIdClean,
      app_name: app.app_name || 'My Web App',
      short_name: app.short_name || app.app_name || 'WebApp',
      target_url: app.target_url || '',
      apk_url: app.apk_url || '',
      apk_filename: app.apk_filename || 'app-release.apk',
      apk_size_bytes: app.apk_size_bytes || 0,
      icon_url: app.icon_url || '/icon-512.png',
      icon_192_url: app.icon_192_url || app.icon_url || '/icon-192.png',
      icon_512_url: app.icon_512_url || app.icon_url || '/icon-512.png',
      apple_touch_icon_url: app.apple_touch_icon_url || app.icon_url || '/apple-touch-icon.png',
      favicon_url: app.favicon_url || app.icon_url || '/favicon.png',
      theme_color: app.theme_color || '#01875f',
      background_color: app.background_color || '#ffffff',
      description: app.description || 'Modern standalone mobile & desktop application.',
      short_description: app.short_description || 'High performance installable web app.',
      category: app.category || 'Entertainment & Utilities',
      rating: app.rating ?? 4.8,
      review_count: app.review_count || '10K+ reviews',
      download_count: app.download_count || '100K+ downloads',
      version: app.version || '1.0.0',
      display_mode: app.display_mode || 'standalone',
      embed_mode: app.embed_mode || 'iframe_seamless',
      button_text: app.button_text || 'Install',
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('generated_apps')
        .insert(result);
      if (error) console.error('Error inserting generated_app:', error);
    }

    setLocal(STORAGE_KEYS.GENERATED_APPS, [result, ...apps]);
  }

  clearDataCache();
  return result;
}

export async function deleteGeneratedApp(id: string): Promise<boolean> {
  const apps = await getGeneratedApps();
  const filtered = apps.filter((a) => a.id !== id && a.app_id !== id);
  setLocal(STORAGE_KEYS.GENERATED_APPS, filtered);

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('generated_apps')
      .delete()
      .or(`id.eq.${id},app_id.eq.${id}`);
    if (error) {
      console.error('Error deleting generated_app:', error);
      return false;
    }
  }
  clearDataCache();
  return true;
}

