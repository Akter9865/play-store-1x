import { useEffect } from 'react';
import { AppSettings, GeneratedApp } from '../types';

/**
 * useDynamicPwa: Dynamically generates and syncs the PWA Web App Manifest,
 * apple-touch-icon, favicon, meta theme-color, and page title in real-time
 * for both the root store and generated per-app PWA routes (/app/{appId}/).
 */
export function useDynamicPwa(
  config: AppSettings | GeneratedApp | null,
  appIdOverride?: string
) {
  useEffect(() => {
    if (!config) return;

    let createdManifestUrl: string | null = null;

    try {
      const isGeneratedApp = 'app_id' in config;
      const appId = appIdOverride || (isGeneratedApp ? (config as GeneratedApp).app_id : undefined);

      const appName = isGeneratedApp
        ? (config as GeneratedApp).app_name
        : (config as AppSettings).pwa_name || (config as AppSettings).app_name;

      const shortName = isGeneratedApp
        ? (config as GeneratedApp).short_name
        : (config as AppSettings).pwa_short_name || (config as AppSettings).app_name;

      const description = config.short_description || config.description || 'Modern standalone mobile & desktop application.';

      const iconUrl = config.icon_url || '/icon-512.png';
      const icon192 = config.icon_192_url || iconUrl || '/icon-192.png';
      const icon512 = config.icon_512_url || iconUrl || '/icon-512.png';
      const appleIcon = config.apple_touch_icon_url || iconUrl || '/apple-touch-icon.png';
      const favicon = config.favicon_url || iconUrl || '/favicon.png';

      const themeColor =
        ('theme_color' in config ? (config as GeneratedApp).theme_color : (config as AppSettings).pwa_theme_color) ||
        '#01875f';
      const backgroundColor =
        ('background_color' in config ? (config as GeneratedApp).background_color : (config as AppSettings).pwa_background_color) ||
        '#ffffff';

      // Scoping: If appId is present, scope tightly to `/app/${appId}/`
      const scope = appId ? `/app/${appId}/` : '/';
      const startUrl = appId ? `/app/${appId}/?source=pwa` : '/?source=pwa';
      const manifestId = appId ? `/app/${appId}/?source=pwa` : '/?source=pwa';

      const manifest = {
        id: manifestId,
        name: appName,
        short_name: shortName,
        description: description,
        start_url: startUrl,
        scope: scope,
        display: 'standalone',
        background_color: backgroundColor,
        theme_color: themeColor,
        orientation: 'any',
        categories: ['entertainment', 'games', 'utilities'],
        icons: [
          {
            src: icon192,
            type: 'image/png',
            sizes: '192x192',
            purpose: 'any',
          },
          {
            src: icon192,
            type: 'image/png',
            sizes: '192x192',
            purpose: 'maskable',
          },
          {
            src: icon512,
            type: 'image/png',
            sizes: '512x512',
            purpose: 'any',
          },
          {
            src: icon512,
            type: 'image/png',
            sizes: '512x512',
            purpose: 'maskable',
          },
        ],
      };

      const blob = new Blob([JSON.stringify(manifest, null, 2)], {
        type: 'application/manifest+json',
      });
      createdManifestUrl = URL.createObjectURL(blob);

      // 1. Update <link rel="manifest">
      let manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
      if (!manifestLink) {
        manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        document.head.appendChild(manifestLink);
      }
      manifestLink.href = createdManifestUrl;

      // 2. Update <link rel="apple-touch-icon">
      let appleLink = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
      if (!appleLink) {
        appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        document.head.appendChild(appleLink);
      }
      appleLink.href = appleIcon;

      // 3. Update <link rel="icon">
      let favLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!favLink) {
        favLink = document.createElement('link');
        favLink.rel = 'icon';
        document.head.appendChild(favLink);
      }
      favLink.href = favicon;

      // 4. Update <meta name="theme-color">
      let metaTheme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
      if (!metaTheme) {
        metaTheme = document.createElement('meta');
        metaTheme.name = 'theme-color';
        document.head.appendChild(metaTheme);
      }
      metaTheme.content = themeColor;

      // 5. Update document title
      document.title = `${appName} - Official App`;
    } catch (err) {
      console.warn('Failed to dynamically sync PWA manifest:', err);
    }

    return () => {
      if (createdManifestUrl) {
        URL.revokeObjectURL(createdManifestUrl);
      }
    };
  }, [config, appIdOverride]);
}
