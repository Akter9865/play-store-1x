import { useState, useEffect, useCallback, useRef } from 'react';
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
  | 'install_confirm'       // Desktop/Android general install
  | 'ios_pwa_guide'         // iOS Add to Home Screen step-by-step
  | 'ios_apk_warning'       // Warning that APK is Android-only
  | 'url_redirect_confirm'  // External URL redirect confirmation
  | 'apk_download_started'; // Notification that download started

export type ButtonFlowState = 'idle' | 'initializing' | 'downloading' | 'installing' | 'open';

export function useInstallFlow(installSettings: InstallSettings | null) {
  const [device, setDevice] = useState<DeviceInfo>(() => detectDevice());
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalFlowType>('install_confirm');
  const [buttonState, setButtonState] = useState<ButtonFlowState>('idle');
  const [isInstalled, setIsInstalled] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  // Keep ref in sync
  useEffect(() => {
    deferredPromptRef.current = deferredPrompt;
  }, [deferredPrompt]);

  // Detect device once mounted
  useEffect(() => {
    setDevice(detectDevice());

    // Check if already in standalone display mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      setButtonState('open');
    }
  }, []);

  // Listen for native PWA beforeinstallprompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      deferredPromptRef.current = promptEvent;
    };

    const installHandler = () => {
      setIsInstalled(true);
      setButtonState('open');
      setDeferredPrompt(null);
      deferredPromptRef.current = null;
      logAnalyticsEvent('pwa_install_success', detectDevice().deviceType);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installHandler);
    };
  }, []);

  // Trigger download helper
  const triggerApkDownload = useCallback((apkUrl: string, filename: string = 'app-release.apk') => {
    setButtonState('downloading');
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

    setTimeout(() => {
      setButtonState('open');
    }, 2000);
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

    // If already in 'open' state, launch external URL or app
    if (buttonState === 'open') {
      if (installSettings.external_url) {
        triggerExternalUrl(installSettings.external_url, installSettings.open_new_tab);
      } else if (installSettings.apk_url && device.isAndroid) {
        triggerApkDownload(installSettings.apk_url, installSettings.apk_filename);
      } else {
        window.location.href = '/';
      }
      return;
    }

    if (buttonState === 'initializing' || buttonState === 'downloading') {
      return;
    }

    // Immediately show Initializing... state
    setButtonState('initializing');
    logAnalyticsEvent('install_button_click', device.deviceType, device.browserName);

    const mode = installSettings.mode;
    const promptEvent = deferredPromptRef.current;

    // Realistic brief transition (400ms) matching Google Play / crore-games UX
    setTimeout(async () => {
      // SMART AUTO MODE
      if (mode === 'SMART') {
        if (device.isAndroid) {
          if (installSettings.apk_url) {
            triggerApkDownload(installSettings.apk_url, installSettings.apk_filename);
          } else if (promptEvent) {
            try {
              await promptEvent.prompt();
              const choice = await promptEvent.userChoice;
              if (choice.outcome === 'accepted') {
                setButtonState('open');
                logAnalyticsEvent('pwa_install_success', device.deviceType);
              } else {
                setButtonState('idle');
              }
            } catch (err) {
              setButtonState('idle');
            }
            logAnalyticsEvent('pwa_install_prompt', device.deviceType);
          } else if (installSettings.external_url) {
            setButtonState('idle');
            if (installSettings.confirmation_enabled) {
              setModalType('url_redirect_confirm');
              setIsModalOpen(true);
            } else {
              triggerExternalUrl(installSettings.external_url, installSettings.open_new_tab);
            }
          } else {
            setButtonState('idle');
            setModalType('install_confirm');
            setIsModalOpen(true);
          }
          return;
        }

        if (device.isIOS) {
          // iOS Safari: Never download APK directly; show iOS Add to Home Screen step-by-step
          setButtonState('idle');
          setModalType('ios_pwa_guide');
          setIsModalOpen(true);
          return;
        }

        // Desktop (Chrome/Edge/Safari on Mac/PC)
        if (promptEvent) {
          try {
            await promptEvent.prompt();
            const choice = await promptEvent.userChoice;
            if (choice.outcome === 'accepted') {
              setButtonState('open');
              logAnalyticsEvent('pwa_install_success', device.deviceType);
            } else {
              setButtonState('idle');
            }
          } catch (err) {
            setButtonState('idle');
          }
          logAnalyticsEvent('pwa_install_prompt', device.deviceType);
        } else if (installSettings.external_url) {
          setButtonState('idle');
          if (installSettings.confirmation_enabled) {
            setModalType('url_redirect_confirm');
            setIsModalOpen(true);
          } else {
            triggerExternalUrl(installSettings.external_url, installSettings.open_new_tab);
          }
        } else if (installSettings.apk_url) {
          triggerApkDownload(installSettings.apk_url, installSettings.apk_filename);
        } else {
          setButtonState('idle');
          setModalType('install_confirm');
          setIsModalOpen(true);
        }
        return;
      }

      // MODE 1: APK DOWNLOAD
      if (mode === 'APK') {
        if (device.isIOS) {
          setButtonState('idle');
          setModalType('ios_apk_warning');
          setIsModalOpen(true);
          return;
        }

        if (installSettings.apk_url) {
          triggerApkDownload(installSettings.apk_url, installSettings.apk_filename);
        } else {
          setButtonState('idle');
          alert('APK download URL is not configured yet in the admin settings.');
        }
        return;
      }

      // MODE 2: EXTERNAL URL
      if (mode === 'URL') {
        setButtonState('idle');
        if (!installSettings.external_url) {
          alert('Destination URL is not configured yet in the admin settings.');
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
          setButtonState('idle');
          setModalType('ios_pwa_guide');
          setIsModalOpen(true);
          return;
        }

        if (promptEvent) {
          try {
            await promptEvent.prompt();
            const choice = await promptEvent.userChoice;
            if (choice.outcome === 'accepted') {
              setButtonState('open');
              logAnalyticsEvent('pwa_install_success', device.deviceType);
            } else {
              setButtonState('idle');
            }
          } catch (err) {
            setButtonState('idle');
          }
          logAnalyticsEvent('pwa_install_prompt', device.deviceType);
        } else {
          setButtonState('idle');
          // If promptEvent not available, fallback to install confirmation
          setModalType('install_confirm');
          setIsModalOpen(true);
        }
        return;
      }
    }, 400);
  }, [installSettings, device, buttonState, triggerApkDownload, triggerExternalUrl]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return {
    device,
    isModalOpen,
    modalType,
    buttonState,
    isInstalled,
    isDownloading: buttonState === 'downloading',
    handleInstallClick,
    closeModal,
    triggerExternalUrl,
    triggerApkDownload,
    hasNativePwaPrompt: Boolean(deferredPrompt),
  };
}
