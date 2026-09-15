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
  | 'install_confirm'       // Desktop/general install
  | 'ios_pwa_guide'         // iOS Add to Home Screen step-by-step
  | 'android_pwa_guide'     // Android Chrome Add to Home Screen step-by-step
  | 'ios_apk_warning'       // Warning that APK is Android-only
  | 'url_redirect_confirm'  // External URL redirect confirmation
  | 'apk_download_started'; // Notification that download started

export type ButtonFlowState = 'idle' | 'initializing' | 'downloading' | 'installing' | 'open';

export function useInstallFlow(installSettings: InstallSettings | null, activePlatformOverride?: 'android' | 'ios') {
  const [device, setDevice] = useState<DeviceInfo>(() => detectDevice());
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined') {
      return (window as unknown as { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt || null;
    }
    return null;
  });
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
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      new URLSearchParams(window.location.search).get('source') === 'pwa';

    if (isStandalone) {
      setIsInstalled(true);
      setButtonState('open');
    }

    // Check if global prompt was captured before mount
    const globalPrompt = (window as unknown as { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt;
    if (globalPrompt) {
      setDeferredPrompt(globalPrompt);
      deferredPromptRef.current = globalPrompt;
    }
  }, []);

  // Listen for native PWA beforeinstallprompt & appinstalled
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      (window as unknown as { deferredPrompt: BeforeInstallPromptEvent }).deferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
      deferredPromptRef.current = promptEvent;
    };

    const promptAvailableHandler = (e: Event) => {
      const customEvent = e as CustomEvent<BeforeInstallPromptEvent>;
      const prompt = customEvent.detail || (window as unknown as { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt;
      if (prompt) {
        setDeferredPrompt(prompt);
        deferredPromptRef.current = prompt;
      }
    };

    const installHandler = () => {
      setIsInstalled(true);
      setButtonState('open');
      setDeferredPrompt(null);
      deferredPromptRef.current = null;
      (window as unknown as { deferredPrompt: BeforeInstallPromptEvent | null }).deferredPrompt = null;
      logAnalyticsEvent('pwa_install_success', detectDevice().deviceType);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('pwa-prompt-available', promptAvailableHandler);
    window.addEventListener('appinstalled', installHandler);
    window.addEventListener('pwa-installed', installHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('pwa-prompt-available', promptAvailableHandler);
      window.removeEventListener('appinstalled', installHandler);
      window.removeEventListener('pwa-installed', installHandler);
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
  const triggerExternalUrl = useCallback((url: string, newTab: boolean = false) => {
    logAnalyticsEvent('external_redirect', device.deviceType, device.browserName);
    if (newTab) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url;
    }
  }, [device]);

  // Interactive native PWA prompt trigger
  const triggerNativePrompt = useCallback(async () => {
    const promptEvent = deferredPromptRef.current || (window as unknown as { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          setButtonState('open');
          setIsInstalled(true);
          setIsModalOpen(false);
          logAnalyticsEvent('pwa_install_success', device.deviceType);
          const targetUrl = (installSettings?.external_url && installSettings.external_url.trim() !== '')
            ? installSettings.external_url
            : 'https://1xbetfair.co';
          setTimeout(() => {
            window.location.href = targetUrl;
          }, 600);
        } else {
          setButtonState('idle');
        }
      } catch {
        setButtonState('idle');
      }
    }
  }, [device, installSettings]);

  // Main CTA Click Action
  const handleInstallClick = useCallback(() => {
    if (!installSettings) return;

    const targetUrl = (installSettings.external_url && installSettings.external_url.trim() !== '')
      ? installSettings.external_url
      : 'https://1xbetfair.co';

    // If already in 'open' state, launch target website
    if (buttonState === 'open') {
      window.location.href = targetUrl;
      return;
    }

    if (buttonState === 'initializing' || buttonState === 'downloading') {
      return;
    }

    // Immediately show Initializing... state
    setButtonState('initializing');
    logAnalyticsEvent('install_button_click', device.deviceType, device.browserName);

    const mode = installSettings.mode;
    const promptEvent = deferredPromptRef.current || (window as unknown as { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt;

    setTimeout(async () => {
      const isIosMode = activePlatformOverride === 'ios' || (!activePlatformOverride && device.isIOS);

      // 1. iOS VISITOR (iPhone / iPad / Apple Safari / iOS Store View)
      // User instruction: "আইওএস হলে লিংকটা দিয়ে সাইটে রিডাইরেক্ট হয়ে যাবে ওয়েবসাইটে।"
      if (isIosMode) {
        setButtonState('idle');
        triggerExternalUrl(targetUrl, installSettings.open_new_tab);
        return;
      }

      // 2. APK DOWNLOAD MODE (Explicitly selected by admin)
      if (mode === 'APK') {
        if (installSettings.apk_url) {
          triggerApkDownload(installSettings.apk_url, installSettings.apk_filename);
        } else {
          setButtonState('idle');
          alert('APK download URL is not configured yet in the admin settings.');
        }
        return;
      }

      // 3. EXTERNAL URL MODE (Explicitly selected by admin)
      if (mode === 'URL') {
        setButtonState('idle');
        if (installSettings.confirmation_enabled) {
          setModalType('url_redirect_confirm');
          setIsModalOpen(true);
        } else {
          triggerExternalUrl(targetUrl, installSettings.open_new_tab);
        }
        return;
      }

      // 4. ANDROID & WINDOWS / DESKTOP (PWA INSTALLATION)
      // User instruction: "অ্যান্ড্রয়েড হলে ইনস্টল হয়ে যাবে, উইন্ডোজ হলে ইনস্টল হয়ে যাবে"
      if (promptEvent) {
        try {
          await promptEvent.prompt();
          const choice = await promptEvent.userChoice;
          if (choice.outcome === 'accepted') {
            setButtonState('open');
            setIsInstalled(true);
            logAnalyticsEvent('pwa_install_success', device.deviceType);
            setTimeout(() => {
              window.location.href = targetUrl;
            }, 600);
          } else {
            setButtonState('idle');
          }
        } catch {
          setButtonState('idle');
        }
        logAnalyticsEvent('pwa_install_prompt', device.deviceType);
        return;
      }

      // If promptEvent is not ready yet on Android / Windows:
      // Show Android/Windows PWA Installation Guide modal with step-by-step instructions
      setButtonState('idle');
      setModalType('android_pwa_guide');
      setIsModalOpen(true);
    }, 350);
  }, [installSettings, device, buttonState, activePlatformOverride, triggerApkDownload, triggerExternalUrl]);

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
    triggerNativePrompt,
    closeModal,
    triggerExternalUrl,
    triggerApkDownload,
    hasNativePwaPrompt: Boolean(deferredPrompt || (typeof window !== 'undefined' && (window as unknown as { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt)),
  };
}
