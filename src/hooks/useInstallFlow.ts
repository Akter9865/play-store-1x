import { useState, useEffect, useCallback } from 'react';
import { InstallSettings } from '../types';
import { detectDevice, DeviceInfo } from '../utils/deviceDetector';
import { logAnalyticsEvent } from '../services/dataService';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export type ModalFlowType = 
  | 'install_confirm' // Desktop/Android general install
  | 'ios_pwa_guide'   // iOS Add to Home Screen step-by-step
  | 'ios_apk_warning' // Warning that APK is Android-only
  | 'url_redirect_confirm' // External URL redirect confirmation
  | 'apk_download_started'; // Notification that download started

export function useInstallFlow(installSettings: InstallSettings | null) {
  const [device, setDevice] = useState<DeviceInfo>(() => detectDevice());
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalFlowType>('install_confirm');
  const [isDownloading, setIsDownloading] = useState(false);

  // Detect device once mounted
  useEffect(() => {
    setDevice(detectDevice());
  }, []);

  // Listen for native PWA beforeinstallprompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Trigger download helper
  const triggerApkDownload = useCallback((apkUrl: string, filename: string = 'app-release.apk') => {
    setIsDownloading(true);
    logAnalyticsEvent('apk_download_click', device.deviceType, device.browserName);

    const link = document.createElement('a');
    link.href = apkUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setModalType('apk_download_started');
    setIsModalOpen(true);
    setTimeout(() => setIsDownloading(false), 2000);
  }, [device]);

  // Trigger external URL redirect helper
  const triggerExternalUrl = useCallback((url: string, newTab: boolean) => {
    logAnalyticsEvent('external_redirect', device.deviceType, device.browserName);
    if (newTab) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url;
    }
  }, [device]);

  // Main CTA Click Action
  const handleInstallClick = useCallback(() => {
    if (!installSettings) return;

    logAnalyticsEvent('install_button_click', device.deviceType, device.browserName);
    const mode = installSettings.mode;

    // SMART AUTO MODE
    if (mode === 'SMART') {
      if (device.isAndroid) {
        if (installSettings.apk_url) {
          triggerApkDownload(installSettings.apk_url, installSettings.apk_filename);
        } else if (deferredPrompt) {
          deferredPrompt.prompt();
          logAnalyticsEvent('pwa_install_prompt', device.deviceType);
        } else if (installSettings.external_url) {
          if (installSettings.confirmation_enabled) {
            setModalType('url_redirect_confirm');
            setIsModalOpen(true);
          } else {
            triggerExternalUrl(installSettings.external_url, installSettings.open_new_tab);
          }
        }
        return;
      }

      if (device.isIOS) {
        // iOS: Never APK
        setModalType('ios_pwa_guide');
        setIsModalOpen(true);
        return;
      }

      // Desktop
      if (deferredPrompt) {
        deferredPrompt.prompt();
        logAnalyticsEvent('pwa_install_prompt', device.deviceType);
      } else if (installSettings.confirmation_enabled) {
        setModalType('install_confirm');
        setIsModalOpen(true);
      } else if (installSettings.external_url) {
        triggerExternalUrl(installSettings.external_url, installSettings.open_new_tab);
      } else {
        setModalType('install_confirm');
        setIsModalOpen(true);
      }
      return;
    }

    // MODE 1: APK DOWNLOAD
    if (mode === 'APK') {
      if (device.isIOS) {
        setModalType('ios_apk_warning');
        setIsModalOpen(true);
        return;
      }

      if (installSettings.apk_url) {
        triggerApkDownload(installSettings.apk_url, installSettings.apk_filename);
      } else {
        alert('APK download is being prepared by the administrator.');
      }
      return;
    }

    // MODE 2: EXTERNAL URL
    if (mode === 'URL') {
      if (!installSettings.external_url) {
        alert('Destination URL is not configured yet.');
        return;
      }
      if (installSettings.confirmation_enabled) {
        setModalType('url_redirect_confirm');
        setIsModalOpen(true);
      } else {
        triggerExternalUrl(installSettings.external_url, installSettings.open_new_tab);
      }
      return;
    }

    // MODE 3: PWA INSTALL
    if (mode === 'PWA') {
      if (device.isIOS) {
        setModalType('ios_pwa_guide');
        setIsModalOpen(true);
        return;
      }

      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choice) => {
          if (choice.outcome === 'accepted') {
            logAnalyticsEvent('pwa_install_success', device.deviceType);
          }
        });
        logAnalyticsEvent('pwa_install_prompt', device.deviceType);
      } else {
        // Fallback install confirmation modal
        setModalType('install_confirm');
        setIsModalOpen(true);
      }
      return;
    }
  }, [installSettings, device, deferredPrompt, triggerApkDownload, triggerExternalUrl]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return {
    device,
    isModalOpen,
    modalType,
    isDownloading,
    handleInstallClick,
    closeModal,
    triggerExternalUrl,
    triggerApkDownload,
    hasNativePwaPrompt: Boolean(deferredPrompt),
  };
}
