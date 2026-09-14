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

// ----------------------------------------------------
// APP SETTINGS
// ----------------------------------------------------
export async function getAppSettings(): Promise<AppSettings> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .limit(1)
      .single();
    if (!error && data) return data as AppSettings;
  }
  return getLocal<AppSettings>(STORAGE_KEYS.APP_SETTINGS, initialAppSettings);
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

  setLocal(STORAGE_KEYS.APP_SETTINGS, updated);
  return updated;
}

// ----------------------------------------------------
// INSTALL SETTINGS
// ----------------------------------------------------
export async function getInstallSettings(): Promise<InstallSettings> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('install_settings')
      .select('*')
      .limit(1)
      .single();
    if (!error && data) return data as InstallSettings;
  }
  return getLocal<InstallSettings>(STORAGE_KEYS.INSTALL_SETTINGS, initialInstallSettings);
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

  setLocal(STORAGE_KEYS.INSTALL_SETTINGS, updated);
  return updated;
}

// ----------------------------------------------------
// MEDIA ITEMS
// ----------------------------------------------------
export async function getMediaItems(): Promise<MediaItem[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data) return data as MediaItem[];
  }
  return getLocal<MediaItem[]>(STORAGE_KEYS.MEDIA, initialMediaItems);
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
      await supabase.from('media').update(result).eq('id', item.id);
    }
  } else {
    // Create
    result = {
      id: 'media-' + Date.now(),
      type: item.type || 'screenshot',
      url: item.url || '',
      title: item.title || '',
      caption: item.caption || '',
      sort_order: items.length + 1,
      enabled: item.enabled ?? true,
      created_at: new Date().toISOString(),
    };
    const newItems = [...items, result];
    setLocal(STORAGE_KEYS.MEDIA, newItems);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('media').insert(result);
    }
  }

  return result;
}

export async function deleteMediaItem(id: string): Promise<void> {
  const items = await getMediaItems();
  const filtered = items.filter((m) => m.id !== id);
  setLocal(STORAGE_KEYS.MEDIA, filtered);

  if (isSupabaseConfigured && supabase) {
    await supabase.from('media').delete().eq('id', id);
  }
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
}

// ----------------------------------------------------
// REVIEWS
// ----------------------------------------------------
export async function getReviews(publishedOnly: boolean = false): Promise<Review[]> {
  if (isSupabaseConfigured && supabase) {
    let query = supabase.from('reviews').select('*').order('sort_order', { ascending: true });
    if (publishedOnly) {
      query = query.eq('published', true);
    }
    const { data, error } = await query;
    if (!error && data) return data as Review[];
  }
  const all = getLocal<Review[]>(STORAGE_KEYS.REVIEWS, initialReviews);
  return publishedOnly ? all.filter((r) => r.published) : all;
}

export async function saveReview(review: Partial<Review>): Promise<Review> {
  const reviews = await getReviews(false);
  let result: Review;

  if (review.id) {
    result = { ...reviews.find((r) => r.id === review.id)!, ...review, updated_at: new Date().toISOString() } as Review;
    const updated = reviews.map((r) => (r.id === review.id ? result : r));
    setLocal(STORAGE_KEYS.REVIEWS, updated);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('reviews').update(result).eq('id', review.id);
    }
  } else {
    result = {
      id: 'rev-' + Date.now(),
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
    const updated = [result, ...reviews];
    setLocal(STORAGE_KEYS.REVIEWS, updated);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('reviews').insert(result);
    }
  }

  return result;
}

export async function deleteReview(id: string): Promise<void> {
  const reviews = await getReviews(false);
  const filtered = reviews.filter((r) => r.id !== id);
  setLocal(STORAGE_KEYS.REVIEWS, filtered);

  if (isSupabaseConfigured && supabase) {
    await supabase.from('reviews').delete().eq('id', id);
  }
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
  return newCount;
}

// ----------------------------------------------------
// RELEASE NOTES (WHAT'S NEW)
// ----------------------------------------------------
export async function getReleaseNotes(publishedOnly: boolean = true): Promise<ReleaseNote[]> {
  if (isSupabaseConfigured && supabase) {
    let query = supabase.from('release_notes').select('*').order('created_at', { ascending: false });
    if (publishedOnly) {
      query = query.eq('published', true);
    }
    const { data, error } = await query;
    if (!error && data) return data as ReleaseNote[];
  }
  const all = getLocal<ReleaseNote[]>(STORAGE_KEYS.RELEASE_NOTES, initialReleaseNotes);
  return publishedOnly ? all.filter((r) => r.published) : all;
}

export async function saveReleaseNote(note: Partial<ReleaseNote>): Promise<ReleaseNote> {
  const notes = await getReleaseNotes(false);
  let result: ReleaseNote;

  if (note.id) {
    result = { ...notes.find((n) => n.id === note.id)!, ...note } as ReleaseNote;
    const updated = notes.map((n) => (n.id === note.id ? result : n));
    setLocal(STORAGE_KEYS.RELEASE_NOTES, updated);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('release_notes').update(result).eq('id', note.id);
    }
  } else {
    result = {
      id: 'rel-' + Date.now(),
      version: note.version || '1.0.0',
      title: note.title || 'Update',
      content: note.content || '',
      release_date: note.release_date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      published: note.published ?? true,
      created_at: new Date().toISOString(),
    };
    const updated = [result, ...notes];
    setLocal(STORAGE_KEYS.RELEASE_NOTES, updated);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('release_notes').insert(result);
    }
  }

  return result;
}

export async function deleteReleaseNote(id: string): Promise<void> {
  const notes = await getReleaseNotes(false);
  const filtered = notes.filter((n) => n.id !== id);
  setLocal(STORAGE_KEYS.RELEASE_NOTES, filtered);

  if (isSupabaseConfigured && supabase) {
    await supabase.from('release_notes').delete().eq('id', id);
  }
}

// ----------------------------------------------------
// DEVELOPER SETTINGS
// ----------------------------------------------------
export async function getDeveloperSettings(): Promise<DeveloperSettings> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('developer_settings')
      .select('*')
      .limit(1)
      .single();
    if (!error && data) return data as DeveloperSettings;
  }
  return getLocal<DeveloperSettings>(STORAGE_KEYS.DEVELOPER_SETTINGS, initialDeveloperSettings);
}

export async function updateDeveloperSettings(settings: Partial<DeveloperSettings>): Promise<DeveloperSettings> {
  const current = await getDeveloperSettings();
  const updated = { ...current, ...settings, updated_at: new Date().toISOString() };

  if (isSupabaseConfigured && supabase) {
    await supabase.from('developer_settings').update(updated).eq('id', updated.id);
  }

  setLocal(STORAGE_KEYS.DEVELOPER_SETTINGS, updated);
  return updated;
}

// ----------------------------------------------------
// PRIVACY SETTINGS
// ----------------------------------------------------
export async function getPrivacySettings(): Promise<PrivacySettings> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('privacy_settings')
      .select('*')
      .limit(1)
      .single();
    if (!error && data) return data as PrivacySettings;
  }
  return getLocal<PrivacySettings>(STORAGE_KEYS.PRIVACY_SETTINGS, initialPrivacySettings);
}

export async function updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<PrivacySettings> {
  const current = await getPrivacySettings();
  const updated = { ...current, ...settings, updated_at: new Date().toISOString() };

  if (isSupabaseConfigured && supabase) {
    await supabase.from('privacy_settings').update(updated).eq('id', updated.id);
  }

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
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.storage.from(bucket).upload(filename, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (!error && data) {
      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filename);
      return {
        url: publicUrlData.publicUrl,
        filename: file.name,
        size: file.size,
      };
    } else {
      console.warn('Supabase storage upload error, falling back to local object:', error);
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
