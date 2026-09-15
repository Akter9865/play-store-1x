import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Download,
  Share2,
  Check,
  CheckCircle2,
  ExternalLink,
  RotateCw,
  ArrowLeft,
  Smartphone,
  ShieldCheck,
  PlusSquare,
  X,
  Loader2,
  Info,
} from 'lucide-react';
import { GeneratedApp, AppSettings, InstallSettings } from '../../types';
import { getGeneratedApp, logAnalyticsEvent } from '../../services/dataService';
import { useDynamicPwa } from '../../hooks/useDynamicPwa';
import { detectDevice, DeviceInfo } from '../../utils/deviceDetector';
import { IosAppStoreView } from '../../components/public/IosAppStoreView';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const GeneratedAppPage: React.FC = () => {
  const { appId } = useParams<{ appId: string }>();
  const [app, setApp] = useState<GeneratedApp | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [device, setDevice] = useState<DeviceInfo>(() => detectDevice());
  const [platform, setPlatform] = useState<'android' | 'ios'>(() => {
    if (typeof window === 'undefined') return 'android';
    const params = new URLSearchParams(window.location.search);
    const p = params.get('platform');
    if (p === 'ios' || p === 'apple') return 'ios';
    if (p === 'android' || p === 'play') return 'android';
    const dev = detectDevice();
    return dev.isIOS ? 'ios' : 'android';
  });
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  // Display & Navigation States
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInAppViewer, setShowInAppViewer] = useState(false);
  const [buttonState, setButtonState] = useState<'idle' | 'initializing' | 'downloading' | 'open'>('idle');
  const [isIframeBlocked, setIsIframeBlocked] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  // Modals
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [showApkNotice, setShowApkNotice] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync PWA manifest dynamically for this specific app route (/app/{appId}/)
  useDynamicPwa(app, appId);

  useEffect(() => {
    setDevice(detectDevice());

    // Check standalone display mode
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      new URLSearchParams(window.location.search).get('source') === 'pwa';

    setIsStandalone(standaloneMode);
    if (standaloneMode) {
      setShowInAppViewer(true);
      setButtonState('open');
    }

    const globalPrompt = (window as unknown as { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt;
    if (globalPrompt) {
      deferredPromptRef.current = globalPrompt;
    }
  }, []);

  // Fetch app data
  useEffect(() => {
    async function load() {
      if (!appId) return;
      setIsLoading(true);
      try {
        const data = await getGeneratedApp(appId);
        setApp(data);
      } catch (err) {
        console.error('Error loading generated app:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [appId]);

  // Listen for native beforeinstallprompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      deferredPromptRef.current = promptEvent;
    };

    const promptAvailableHandler = (e: Event) => {
      const customEvent = e as CustomEvent<BeforeInstallPromptEvent>;
      const prompt = customEvent.detail || (window as unknown as { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt;
      if (prompt) {
        deferredPromptRef.current = prompt;
      }
    };

    const installHandler = () => {
      setButtonState('open');
      deferredPromptRef.current = null;
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

  // Install CTA Action
  const handleInstallClick = useCallback(async () => {
    if (!app) return;

    // If already in 'open' state, launch the target website experience
    if (buttonState === 'open') {
      if ((device.isIOS || platform === 'ios') && app.ios_url) {
        window.open(app.ios_url, '_blank');
      } else if (app.target_url) {
        setShowInAppViewer(true);
      } else if (app.apk_url && device.isAndroid) {
        triggerApkDownload(app.apk_url, app.apk_filename);
      }
      return;
    }

    if (buttonState === 'initializing' || buttonState === 'downloading') {
      return;
    }

    setButtonState('initializing');
    logAnalyticsEvent('install_button_click', device.deviceType, device.browserName);

    // Brief transition (350ms) matching Google Play / store UX
    setTimeout(async () => {
      // 1. iOS visitor flow: Redirect directly to the website
      if (device.isIOS || platform === 'ios') {
        setButtonState('idle');
        const targetUrl = (app.target_url && !app.target_url.includes('1xbetfair.co'))
          ? app.target_url
          : ((app.ios_url && !app.ios_url.includes('1xbetfair.co')) ? app.ios_url : 'https://1xbetfair.me');
        window.location.href = targetUrl;
        return;
      }

      // 2. If APK is provided and on Android (without PWA prompt)
      if (app.apk_url && device.isAndroid && !deferredPromptRef.current) {
        triggerApkDownload(app.apk_url, app.apk_filename);
        return;
      }

      // 3. Native PWA prompt on Android / Chromium / Desktop
      const promptEvent = deferredPromptRef.current || (window as unknown as { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt;
      if (promptEvent) {
        try {
          await promptEvent.prompt();
          const choice = await promptEvent.userChoice;
          if (choice.outcome === 'accepted') {
            setButtonState('open');
            logAnalyticsEvent('pwa_install_success', device.deviceType);
            const targetUrl = (app.target_url && !app.target_url.includes('1xbetfair.co'))
              ? app.target_url
              : ((app.ios_url && !app.ios_url.includes('1xbetfair.co')) ? app.ios_url : 'https://1xbetfair.me');
            setTimeout(() => {
              window.location.href = targetUrl;
            }, 600);
          } else {
            setButtonState('idle');
          }
        } catch {
          setButtonState('idle');
        }
        return;
      }

      // 4. Fallback if promptEvent is not ready yet:
      // Show Android PWA installation guide with steps
      setButtonState('idle');
      setShowAndroidGuide(true);
    }, 350);
  }, [app, buttonState, device, platform]);

  const triggerApkDownload = (url: string, filename: string = 'app-release.apk') => {
    setButtonState('downloading');
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowApkNotice(true);
    setTimeout(() => {
      setButtonState('open');
    }, 2000);
  };

  const handleShare = async () => {
    if (navigator.share && app) {
      try {
        await navigator.share({
          title: app.app_name,
          text: app.short_description || app.description,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-3">
        <div className="w-10 h-10 border-3 border-play-green border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-gray-500 font-medium">Loading app environment...</p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-play-green flex items-center justify-center mb-4 shadow-sm border border-emerald-100">
          <Smartphone className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">App Not Found</h1>
        <p className="text-sm text-gray-500 mt-2 max-w-md">
          The requested app <code className="text-play-green font-mono">/app/{appId}/</code> has not been generated or does not exist.
        </p>
        <Link
          to="/"
          className="mt-6 px-6 py-2.5 bg-play-green text-white font-medium text-sm rounded-xl hover:bg-play-green-hover transition-colors shadow-sm"
        >
          Return to Store
        </Link>
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE A: IN-APP TARGET WEBSITE EXPERIENCE (Standalone / Launched)
  // =========================================================================
  if (showInAppViewer && app.target_url) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none">
        {/* Sleek in-app toolbar */}
        <header className="h-11 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {!isStandalone && (
              <button
                onClick={() => setShowInAppViewer(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Back to App Details"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <img
              src={app.icon_url || '/icon-192.png'}
              alt={app.app_name}
              className="w-6 h-6 rounded-lg object-cover flex-shrink-0 border border-slate-700"
            />
            <span className="font-semibold text-xs sm:text-sm text-gray-100 truncate">
              {app.app_name}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const iframe = document.getElementById('target-app-iframe') as HTMLIFrameElement;
                if (iframe) {
                  setIsIframeLoading(true);
                  iframe.src = iframe.src;
                }
              }}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Reload App"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <a
              href={app.target_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
              title="Open Target in Full Browser"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        {/* Iframe container with loader & X-Frame-Options fallback */}
        <div className="relative flex-1 w-full h-full bg-white overflow-hidden">
          {isIframeLoading && !isIframeBlocked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 gap-3">
              <div
                className="w-9 h-9 border-3 rounded-full animate-spin"
                style={{ borderColor: `${app.theme_color || '#01875f'} transparent transparent transparent` }}
              ></div>
              <p className="text-xs text-gray-500 font-medium">Connecting to {app.app_name}...</p>
            </div>
          )}

          {isIframeBlocked ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gray-50 text-gray-900 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-play-green flex items-center justify-center mb-3 shadow-xs border border-emerald-100">
                <ExternalLink className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold">Launch {app.app_name}</h2>
              <p className="text-xs text-gray-500 max-w-sm mt-1 mb-5">
                The target website requests a dedicated full window session.
              </p>
              <a
                href={app.target_url}
                className="px-6 py-2.5 bg-play-green hover:bg-play-green-hover text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
              >
                Launch App Window
              </a>
            </div>
          ) : (
            <iframe
              id="target-app-iframe"
              src={app.target_url}
              title={app.app_name}
              className="w-full h-full border-0"
              onLoad={() => setIsIframeLoading(false)}
              onError={() => {
                setIsIframeLoading(false);
                setIsIframeBlocked(true);
              }}
              allow="accelerometer; autoplay; camera; clipboard-read; clipboard-write; encrypted-media; fullscreen; geolocation; gyroscope; microphone; midi; payment"
              sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
            />
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE B: APPLE iOS APP STORE PRESENTATION (For iOS Devices & Testing)
  // =========================================================================
  if (platform === 'ios') {
    const generatedAppSettings: AppSettings = {
      id: app.id,
      app_name: app.app_name,
      developer_name: 'Verified App Publisher',
      short_description: app.short_description || '',
      description: app.description || app.short_description || '',
      features: [],
      category: app.category || 'Entertainment',
      rating: app.rating || 4.8,
      review_count: app.review_count || '10K+ reviews',
      download_count: app.download_count || '100K+ downloads',
      age_rating: '18+',
      version: app.version || '1.0.0',
      last_updated: 'Updated recently',
      icon_url: app.icon_url || '/icon-512.png',
      apple_touch_icon_url: app.apple_touch_icon_url || app.icon_url || '/apple-touch-icon.png',
      verified: true,
      editors_choice: false,
    };

    const generatedInstallSettings: InstallSettings = {
      id: app.id,
      mode: 'SMART',
      apk_url: app.apk_url,
      apk_filename: app.apk_filename,
      apk_size_bytes: app.apk_size_bytes,
      external_url: app.target_url,
      ios_store_url: app.ios_url,
      ios_button_text: app.ios_button_text || 'GET',
      open_new_tab: true,
      confirmation_enabled: false,
      button_text: app.button_text || 'Install',
      success_message: 'Download started.',
      android_message: 'Android download',
      ios_message: 'iOS Add to Home Screen',
      desktop_message: 'Desktop installation',
    };

    return (
      <div className="animate-fade-in">
        <IosAppStoreView
          appSettings={generatedAppSettings}
          installSettings={generatedInstallSettings}
          onGetClick={handleInstallClick}
          buttonState={buttonState}
          activePlatform={platform}
          onPlatformToggle={setPlatform}
          showPlatformSwitcher={true}
        />

        {/* iOS Safari Add to Home Screen Modal */}
        {showIosGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowIosGuide(false);
            }}
          >
            <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 animate-slide-down">
              <button
                onClick={() => setShowIosGuide(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-center mb-3">
                <img
                  src={app.apple_touch_icon_url || app.icon_url || '/icon-192.png'}
                  alt={app.app_name}
                  className="w-16 h-16 rounded-[22%] object-cover shadow-sm border border-gray-100"
                />
              </div>

              <h3 className="text-lg font-bold text-gray-900 text-center">
                Add {app.app_name} to Home Screen
              </h3>
              <p className="text-xs text-gray-500 text-center mt-1">
                Install this app on your iPhone or iPad for full screen standalone performance.
              </p>

              <div className="mt-5 space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs text-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    1
                  </div>
                  <div>Tap the <strong>Share</strong> button in Safari's bottom toolbar.</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    2
                  </div>
                  <div className="flex items-center gap-1.5">
                    Scroll down and tap <PlusSquare className="w-4 h-4 text-blue-600 inline" /> <strong>Add to Home Screen</strong>.
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    3
                  </div>
                  <div>Tap <strong>Add</strong> in the top-right corner to finish.</div>
                </div>
              </div>

              <button
                onClick={() => setShowIosGuide(false)}
                className="mt-6 w-full py-2.5 bg-[#0071e3] text-white font-medium text-xs rounded-xl hover:bg-blue-600 shadow-sm"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE C: GOOGLE PLAY STORE PRESENTATION (For Android Devices & Default)
  // =========================================================================
  return (
    <div className="min-h-screen bg-white text-play-text-primary antialiased selection:bg-play-green selection:text-white">
      {/* Top Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-play-green text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <span className="text-xs">▶</span>
            </div>
            <span className="font-semibold text-gray-800 text-sm tracking-tight group-hover:text-play-green transition-colors">
              Google Play
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Platform Switcher Toggle */}
            <div className="hidden sm:flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200/80 text-xs">
              <button
                type="button"
                onClick={() => setPlatform('android')}
                className="px-2.5 py-1 rounded-lg font-medium transition-all bg-play-green text-white shadow-xs font-semibold"
                title="Google Play Store View"
              >
                🤖 Android Play
              </button>
              <button
                type="button"
                onClick={() => setPlatform('ios')}
                className="px-2.5 py-1 rounded-lg font-medium transition-all text-gray-500 hover:text-gray-900"
                title="Apple App Store View"
              >
                🍎 iOS Store
              </button>
            </div>

            <button
              onClick={handleShare}
              className="p-2 text-gray-500 hover:text-play-green hover:bg-gray-50 rounded-full transition-colors"
              title="Share"
            >
              {copiedLink ? <Check className="w-4 h-4 text-play-green" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* App Hero Section */}
        <section className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-8 pb-8 border-b border-gray-100">
          {/* App Icon */}
          <div className="flex-shrink-0 self-start">
            <img
              src={app.icon_url || '/icon-512.png'}
              alt={`${app.app_name} Icon`}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover shadow-md border border-gray-100 bg-gray-50"
            />
          </div>

          {/* Title & Metadata */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-950">
              {app.app_name}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-play-green font-medium">
              <span>Verified Application</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500 text-xs">Contains ads · In-app purchases</span>
            </div>

            {/* Metrics row */}
            <div className="mt-5 flex items-center gap-4 sm:gap-6 text-center divide-x divide-gray-200 overflow-x-auto py-1">
              <div className="pr-4 sm:pr-6 flex-shrink-0">
                <div className="flex items-center justify-center gap-1 font-bold text-gray-900 text-sm sm:text-base">
                  <span>{(app.rating || 4.8).toFixed(1)}</span>
                  <Star className="w-3.5 h-3.5 text-gray-900 fill-gray-900" />
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{app.review_count || '10K+ reviews'}</div>
              </div>

              <div className="px-4 sm:px-6 flex-shrink-0">
                <div className="font-bold text-gray-900 text-sm sm:text-base">
                  {app.download_count || '100K+ downloads'}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Downloads</div>
              </div>

              <div className="px-4 sm:px-6 flex-shrink-0">
                <div className="flex items-center justify-center gap-1">
                  <span className="border border-gray-400 text-gray-800 font-bold px-1 py-0.2 text-[11px] rounded leading-none">
                    18+
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Rated for 18+</div>
              </div>
            </div>

            {/* Primary CTA Area */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                id="main-install-btn"
                onClick={handleInstallClick}
                disabled={buttonState === 'initializing' || buttonState === 'downloading'}
                className="w-full sm:w-auto min-w-[220px] px-8 py-3.5 bg-play-green hover:bg-play-green-hover active:scale-[0.98] text-white font-medium text-sm sm:text-base rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-90"
              >
                {buttonState === 'initializing' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Initializing...</span>
                  </>
                ) : buttonState === 'downloading' ? (
                  <>
                    <Download className="w-4 h-4 animate-bounce text-white" />
                    <span>Downloading...</span>
                  </>
                ) : buttonState === 'open' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Open</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>{app.button_text || 'Install'}</span>
                  </>
                )}
              </button>

              {/* Direct Web Experience Launcher */}
              {app.target_url && (
                <button
                  onClick={() => setShowInAppViewer(true)}
                  className="px-5 py-3 text-xs sm:text-sm font-semibold text-play-green hover:bg-emerald-50 rounded-xl transition-colors border border-emerald-200/80 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Open Web App</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <Smartphone className="w-4 h-4 text-gray-400" />
              <span>This app is available for all of your devices (Android, iOS & Desktop)</span>
            </div>
          </div>
        </section>

        {/* About this app Section */}
        <section className="py-8 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-3">About this app</h2>
          <p className="text-sm text-gray-600 leading-relaxed max-w-3xl whitespace-pre-line">
            {app.description || app.short_description}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
              {app.category || 'Entertainment'}
            </span>
            <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
              PWA Standalone
            </span>
            <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
              Verified Developer
            </span>
          </div>
        </section>

        {/* Data Safety Notice */}
        <section className="py-8">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Data safety</h2>
          <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
            Safety starts with understanding how developers collect and share your data. Data privacy and security practices may vary based on your use, region, and age.
          </p>

          <div className="mt-4 p-4 rounded-2xl border border-gray-200/80 bg-gray-50/50 flex items-start gap-3 max-w-2xl">
            <ShieldCheck className="w-5 h-5 text-play-green flex-shrink-0 mt-0.5" />
            <div className="text-xs text-gray-700 space-y-1">
              <p className="font-semibold text-gray-900">Encrypted in transit</p>
              <p className="text-gray-500">Your data is transferred over a secure, encrypted HTTPS connection.</p>
            </div>
          </div>
        </section>
      </main>

      {/* iOS Safari Add to Home Screen Modal */}
      {showIosGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowIosGuide(false);
          }}
        >
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 animate-slide-down">
            <button
              onClick={() => setShowIosGuide(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center mb-3">
              <img
                src={app.icon_url || '/icon-192.png'}
                alt={app.app_name}
                className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-gray-100"
              />
            </div>

            <h3 className="text-lg font-bold text-gray-900 text-center">
              Add {app.app_name} to Home Screen
            </h3>
            <p className="text-xs text-gray-500 text-center mt-1">
              Install this app on your iPhone or iPad for full screen standalone performance.
            </p>

            <div className="mt-5 space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs text-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  1
                </div>
                <div>Tap the <strong>Share</strong> button in Safari's bottom toolbar.</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  2
                </div>
                <div className="flex items-center gap-1.5">
                  Scroll down and tap <PlusSquare className="w-4 h-4 text-blue-600 inline" /> <strong>Add to Home Screen</strong>.
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  3
                </div>
                <div>Tap <strong>Add</strong> in the top-right corner to finish.</div>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="mt-6 w-full py-2.5 bg-play-green text-white font-medium text-xs rounded-xl hover:bg-play-green-hover shadow-sm"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Android Chrome Add to Home Screen Modal */}
      {showAndroidGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAndroidGuide(false);
          }}
        >
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 animate-slide-down">
            <button
              onClick={() => setShowAndroidGuide(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center mb-3">
              <img
                src={app.icon_url || '/1xbetfair-icon.png'}
                alt={app.app_name}
                className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-gray-100"
              />
            </div>

            <h3 className="text-lg font-bold text-gray-900 text-center">
              Install {app.app_name}
            </h3>
            <p className="text-xs text-gray-500 text-center mt-1">
              Add {app.app_name} directly to your Android device for instant home-screen access.
            </p>

            <div className="mt-5 space-y-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 text-xs text-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-play-green text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  1
                </div>
                <div>Tap the <strong>three dots (⋮)</strong> menu in the top-right of your browser.</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-play-green text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  2
                </div>
                <div>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-play-green text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  3
                </div>
                <div>Tap <strong>Install</strong> to add {app.app_name} to your home screen!</div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={async () => {
                  const promptEvent = deferredPromptRef.current || (window as unknown as { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt;
                  if (promptEvent) {
                    try {
                      await promptEvent.prompt();
                      const choice = await promptEvent.userChoice;
                      if (choice.outcome === 'accepted') {
                        setButtonState('open');
                        setShowAndroidGuide(false);
                      }
                    } catch {
                      // ignore
                    }
                  } else {
                    setShowAndroidGuide(false);
                  }
                }}
                className="w-full py-2.5 bg-play-green text-white font-medium text-xs rounded-xl hover:bg-play-green-hover shadow-sm transition-all"
              >
                Try Install Now
              </button>
              <button
                onClick={() => setShowAndroidGuide(false)}
                className="w-full py-2.5 bg-gray-100 text-gray-700 font-medium text-xs rounded-xl hover:bg-gray-200 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APK Download Notification Modal */}
      {showApkNotice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowApkNotice(false);
          }}
        >
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 animate-slide-down">
            <button
              onClick={() => setShowApkNotice(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center text-emerald-500 mb-2">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">
              APK Download Started
            </h3>
            <p className="text-xs text-gray-600 text-center mt-1">
              Your verified package for {app.app_name} is downloading.
            </p>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 space-y-1">
              <p className="font-semibold flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>Android Tip:</span>
              </p>
              <p>
                If prompted, allow <em>"Install unknown apps"</em> in Settings to complete the setup.
              </p>
            </div>

            <button
              onClick={() => setShowApkNotice(false)}
              className="mt-6 w-full py-2.5 bg-play-green text-white font-medium text-xs rounded-xl hover:bg-play-green-hover"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
