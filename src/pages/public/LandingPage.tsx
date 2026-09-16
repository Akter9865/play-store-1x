import React, { useState, useEffect } from 'react';
import { RotateCw, ArrowLeft, ExternalLink } from 'lucide-react';
import {
  AppSettings,
  InstallSettings,
  MediaItem,
  Review,
  ReleaseNote,
  DeveloperSettings,
  PrivacySettings,
} from '../../types';
import {
  getInstallSettings,
  getInstallSettingsSync,
  getMediaItems,
  getMediaItemsSync,
  getReviews,
  getReviewsSync,
  getReleaseNotes,
  getReleaseNotesSync,
  getDeveloperSettings,
  getDeveloperSettingsSync,
  getPrivacySettings,
  getPrivacySettingsSync,
} from '../../services/dataService';
import { useInstallFlow } from '../../hooks/useInstallFlow';
import { useDynamicPwa } from '../../hooks/useDynamicPwa';
import { AppHero } from '../../components/public/AppHero';
import { ScreenshotGallery } from '../../components/public/ScreenshotGallery';
import { AboutSection } from '../../components/public/AboutSection';
import { DataSafetySection } from '../../components/public/DataSafetySection';
import { ReviewsSection } from '../../components/public/ReviewsSection';
import { WhatsNewSection } from '../../components/public/WhatsNewSection';
import { DeveloperContactSection } from '../../components/public/DeveloperContactSection';
import { InstallModal } from '../../components/public/InstallModal';
import { useOutletContext } from 'react-router-dom';
import { PublicOutletContext } from '../../layouts/PublicLayout';
import { IosAppStoreView } from '../../components/public/IosAppStoreView';

interface LandingPageProps {
  appSettings: AppSettings;
}

export const LandingPage: React.FC<LandingPageProps> = ({ appSettings }) => {
  const [installSettings, setInstallSettings] = useState<InstallSettings>(() => getInstallSettingsSync());
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => getMediaItemsSync());
  const [reviews, setReviews] = useState<Review[]>(() => getReviewsSync(true));
  const [releaseNotes, setReleaseNotes] = useState<ReleaseNote[]>(() => getReleaseNotesSync(true));
  const [developerSettings, setDeveloperSettings] = useState<DeveloperSettings>(() => getDeveloperSettingsSync());
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(() => getPrivacySettingsSync());

  // Standalone PWA display state
  const [showInAppViewer, setShowInAppViewer] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [isIframeBlocked, setIsIframeBlocked] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [install, media, revs, notes, dev, privacy] = await Promise.all([
          getInstallSettings(),
          getMediaItems(),
          getReviews(true),
          getReleaseNotes(true),
          getDeveloperSettings(),
          getPrivacySettings(),
        ]);

        setInstallSettings(install);
        setMediaItems(media);
        setReviews(revs);
        setReleaseNotes(notes);
        setDeveloperSettings(dev);
        setPrivacySettings(privacy);
      } catch (err) {
        console.error('Error loading landing page data:', err);
      }
    }
    loadData();
  }, []);

  const outletContext = useOutletContext<PublicOutletContext | undefined>();
  const activePlatform = outletContext?.activePlatform;
  const setPlatform = outletContext?.setPlatform;

  const {
    device,
    isModalOpen,
    modalType,
    buttonState,
    isDownloading,
    handleInstallClick,
    triggerNativePrompt,
    closeModal,
    triggerExternalUrl,
    triggerApkDownload,
  } = useInstallFlow(installSettings, activePlatform);

  // Sync PWA manifest and icons dynamically from appSettings
  useDynamicPwa(appSettings);

  useEffect(() => {
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      new URLSearchParams(window.location.search).get('source') === 'pwa';

    setIsStandalone(standaloneMode);
    if (standaloneMode) {
      setShowInAppViewer(true);
    }
  }, []);

  const currentPlatform = activePlatform ?? (device.isIOS ? 'ios' : 'android');

  const isOldExt = !installSettings?.external_url || installSettings.external_url.trim() === '' || installSettings.external_url.includes('1xbetfair.co') || installSettings.external_url.includes('1xbetfair.me');
  const targetAppUrl = !isOldExt
    ? installSettings.external_url
    : 'https://1xbetfair.online/';

  // =========================================================================
  // VIEW MODE: IN-APP TARGET WEBSITE (When launched from PWA Home Screen icon)
  // =========================================================================
  if (showInAppViewer) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none">
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
              src={appSettings.icon_url || '/icon-192.png'}
              alt={appSettings.app_name}
              className="w-6 h-6 rounded-lg object-cover flex-shrink-0 border border-slate-700"
            />
            <span className="font-semibold text-xs sm:text-sm text-gray-100 truncate">
              {appSettings.app_name}
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
              href={targetAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
              title="Open Target in Full Browser"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        <div className="relative flex-1 w-full h-full bg-white overflow-hidden">
          {isIframeLoading && !isIframeBlocked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 gap-3">
              <div
                className="w-9 h-9 border-3 rounded-full animate-spin"
                style={{ borderColor: `${appSettings.pwa_theme_color || '#0088cc'} transparent transparent transparent` }}
              ></div>
              <p className="text-xs text-gray-500 font-medium">Connecting to {appSettings.app_name}...</p>
            </div>
          )}

          {isIframeBlocked ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gray-50 text-gray-900 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shadow-xs border border-blue-100">
                <ExternalLink className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold">Launch {appSettings.app_name}</h2>
              <p className="text-xs text-gray-500 max-w-sm mt-1 mb-5">
                The target website requests a dedicated full window session.
              </p>
              <a
                href={targetAppUrl}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
              >
                Launch App Window
              </a>
            </div>
          ) : (
            <iframe
              id="target-app-iframe"
              src={targetAppUrl}
              title={appSettings.app_name}
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
  // VIEW MODE: APPLE iOS APP STORE (When visited from iOS device or toggle)
  // =========================================================================
  if (currentPlatform === 'ios') {
    return (
      <div className="animate-fade-in -mx-4 sm:-mx-6 lg:-mx-8">
        <IosAppStoreView
          appSettings={appSettings}
          installSettings={installSettings}
          mediaItems={mediaItems}
          reviews={reviews}
          releaseNotes={releaseNotes}
          developerSettings={developerSettings}
          privacySettings={privacySettings}
          onGetClick={handleInstallClick}
          buttonState={buttonState}
          activePlatform={currentPlatform}
          onPlatformToggle={setPlatform}
          showPlatformSwitcher={true}
        />

        {/* Install Modal Popup (Handles iOS Add to Home Screen & Destination URL confirmations) */}
        <InstallModal
          isOpen={isModalOpen}
          onClose={closeModal}
          appSettings={appSettings}
          installSettings={installSettings}
          device={device}
          modalType={modalType}
          onTriggerNativePrompt={triggerNativePrompt}
          onProceedExternalUrl={() => {
            const destUrl = installSettings.ios_store_url || installSettings.external_url;
            if (destUrl) {
              triggerExternalUrl(destUrl, installSettings.open_new_tab);
            }
          }}
          onDownloadApk={() => {
            if (installSettings.apk_url) {
              triggerApkDownload(installSettings.apk_url, installSettings.apk_filename);
            }
          }}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE: GOOGLE PLAY STORE (When visited from Android device or default)
  // =========================================================================
  return (
    <div className="animate-fade-in pb-12">
      {/* 1. App Hero Section */}
      <AppHero
        appSettings={appSettings}
        installSettings={installSettings}
        onInstallClick={handleInstallClick}
        isDownloading={isDownloading}
        buttonState={buttonState}
      />

      {/* 2. Screenshot Gallery */}
      <ScreenshotGallery mediaItems={mediaItems} />

      {/* 3. About this app */}
      <AboutSection appSettings={appSettings} />

      {/* 4. Data Safety */}
      {privacySettings && <DataSafetySection privacySettings={privacySettings} />}

      {/* 5. Ratings and Reviews */}
      <ReviewsSection reviews={reviews} appSettings={appSettings} />

      {/* 6. What's New */}
      <WhatsNewSection releaseNotes={releaseNotes} />

      {/* 7. Developer Contact */}
      {developerSettings && (
        <DeveloperContactSection developerSettings={developerSettings} />
      )}

      {/* Install Modal Popup */}
      <InstallModal
        isOpen={isModalOpen}
        onClose={closeModal}
        appSettings={appSettings}
        installSettings={installSettings}
        device={device}
        modalType={modalType}
        onTriggerNativePrompt={triggerNativePrompt}
        onProceedExternalUrl={() => {
          if (installSettings.external_url) {
            triggerExternalUrl(installSettings.external_url, installSettings.open_new_tab);
          }
        }}
        onDownloadApk={() => {
          if (installSettings.apk_url) {
            triggerApkDownload(installSettings.apk_url, installSettings.apk_filename);
          }
        }}
      />
    </div>
  );
};
