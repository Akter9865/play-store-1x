import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/public/Header';
import { Footer } from '../components/public/Footer';
import { AppSettings } from '../types';
import { detectDevice } from '../utils/deviceDetector';

export interface PublicOutletContext {
  activePlatform: 'android' | 'ios';
  setPlatform: (platform: 'android' | 'ios') => void;
}

interface PublicLayoutProps {
  appSettings: AppSettings;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ appSettings }) => {
  const location = useLocation();
  const [platform, setPlatform] = useState<'android' | 'ios'>(() => {
    if (typeof window === 'undefined') return 'android';
    const params = new URLSearchParams(window.location.search);
    const p = params.get('platform');
    if (p === 'ios' || p === 'apple') return 'ios';
    if (p === 'android' || p === 'play') return 'android';
    const dev = detectDevice();
    return dev.isIOS ? 'ios' : 'android';
  });

  const isRootLanding = location.pathname === '/';

  // If in iOS mode on the main landing page, let IosAppStoreView render its complete Apple App Store shell
  if (platform === 'ios' && isRootLanding) {
    return (
      <Outlet context={{ activePlatform: platform, setPlatform }} />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-play-text-primary">
      <Header
        appSettings={appSettings}
        activePlatform={platform}
        onPlatformToggle={setPlatform}
        showPlatformSwitcher={true}
      />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Outlet context={{ activePlatform: platform, setPlatform }} />
      </main>
      <Footer appSettings={appSettings} />
    </div>
  );
};
