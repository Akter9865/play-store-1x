import { useEffect } from 'react';
import { AppSettings } from '../types';

/**
 * useDynamicPwa: Dynamically generates and syncs the PWA Web App Manifest,
 * apple-touch-icon, favicon, meta theme-color, and page title in real-time
 * whenever appSettings are updated in the Admin panel.
 */
export function useDynamicPwa(appSettings: AppSettings | null) {
  useEffect(() => {
    if (!appSettings) return;

    let createdManifestUrl: string | null = null;

    try {
      const icon192 = appSettings.icon_192_url || appSettings.icon_url || '/icon-192.png';
      const icon512 = appSettings.icon_512_url || appSettings.icon_url || '/icon-512.png';
      const appleIcon = appSettings.apple_touch_icon_url || appSettings.icon_url || '/apple-touch-icon.png';
      const favicon = appSettings.favicon_url || appSettings.icon_url || '/favicon.png';

      const manifest = {
        id: '/?source=pwa',
        name: appSettings.pwa_name || appSettings.app_name || 'SuperPlay App',
        short_name: appSettings.pwa_short_name || appSettings.app_name || 'SuperPlay',
        description: appSettings.short_description || 'Modern entertainment and utilities application.',
        start_url: '/?source=pwa',
        scope: '/',
        display: 'standalone',
        background_color: appSettings.pwa_background_color || '#ffffff',
        theme_color: appSettings.pwa_theme_color || '#01875f',
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
      if (appleLink) {
        appleLink.href = appleIcon;
      }

      // 3. Update <link rel="icon">
      let favLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (favLink) {
        favLink.href = favicon;
      }

      // 4. Update <meta name="theme-color">
      const themeColor = appSettings.pwa_theme_color || '#01875f';
      const metaTheme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.content = themeColor;
      }

      // 5. Update document title
      if (appSettings.app_name) {
        document.title = `${appSettings.app_name} - Official App`;
      }
    } catch (err) {
      console.warn('Failed to dynamically sync PWA manifest:', err);
    }

    return () => {
      if (createdManifestUrl) {
        URL.revokeObjectURL(createdManifestUrl);
      }
    };
  }, [appSettings]);
}
