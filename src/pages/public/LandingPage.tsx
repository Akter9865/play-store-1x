import React, { useState, useEffect } from 'react';
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
  getMediaItems,
  getReviews,
  getReleaseNotes,
  getDeveloperSettings,
  getPrivacySettings,
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

interface LandingPageProps {
  appSettings: AppSettings;
}

export const LandingPage: React.FC<LandingPageProps> = ({ appSettings }) => {
  const [installSettings, setInstallSettings] = useState<InstallSettings | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [releaseNotes, setReleaseNotes] = useState<ReleaseNote[]>([]);
  const [developerSettings, setDeveloperSettings] = useState<DeveloperSettings | null>(null);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const {
    device,
    isModalOpen,
    modalType,
    buttonState,
    isDownloading,
    handleInstallClick,
    closeModal,
    triggerExternalUrl,
    triggerApkDownload,
  } = useInstallFlow(installSettings);

  // Sync PWA manifest and icons dynamically from appSettings
  useDynamicPwa(appSettings);

  if (isLoading || !installSettings) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-play-green border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-gray-500 font-medium">Loading app listing...</p>
      </div>
    );
  }

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
