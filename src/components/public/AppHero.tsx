import React, { useState } from 'react';
import {
  Star,
  CheckCircle2,
  Download,
  Award,
  Share2,
  Bookmark,
  BookmarkCheck,
  Laptop,
  Smartphone,
  Info,
  Check,
  Loader2,
} from 'lucide-react';
import { AppSettings, InstallSettings } from '../../types';
import { logAnalyticsEvent } from '../../services/dataService';
import { ButtonFlowState } from '../../hooks/useInstallFlow';

interface AppHeroProps {
  appSettings: AppSettings;
  installSettings: InstallSettings;
  onInstallClick: () => void;
  isDownloading?: boolean;
  buttonState?: ButtonFlowState;
}

export const AppHero: React.FC<AppHeroProps> = ({
  appSettings,
  installSettings,
  onInstallClick,
  isDownloading = false,
  buttonState = 'idle',
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const handleShare = async () => {
    logAnalyticsEvent('share_click', 'desktop');
    if (navigator.share) {
      try {
        await navigator.share({
          title: appSettings.app_name,
          text: appSettings.short_description,
          url: window.location.href,
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
  };

  return (
    <section className="pt-6 sm:pt-10 pb-6 border-b border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-8">
        {/* App Icon */}
        <div className="flex-shrink-0 self-start">
          <div className="relative group">
            <img
              src={appSettings.icon_url}
              alt={`${appSettings.app_name} Icon`}
              className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl sm:rounded-3xl object-cover shadow-play-elevated border border-gray-100/80 bg-gray-50"
            />
            {appSettings.editors_choice && (
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md border border-gray-100" title="Editors' Choice">
                <Award className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
            )}
          </div>
        </div>

        {/* Title, Developer & Metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900 leading-tight">
              {appSettings.app_name}
            </h1>
            {appSettings.verified && (
              <span title="Verified Developer & App" className="inline-flex items-center">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 fill-blue-500" />
              </span>
            )}
          </div>

          {/* Developer link & Subtitle */}
          <div className="mt-1 flex flex-wrap items-center gap-x-2 text-sm">
            <a
              href="#developer-contact"
              className="font-medium text-play-green hover:underline cursor-pointer"
            >
              {appSettings.developer_name}
            </a>
            <span className="text-gray-300">•</span>
            <span className="text-gray-500">Contains ads · In-app purchases</span>
          </div>

          {/* App Metadata Metrics Row */}
          <div className="mt-5 flex items-center gap-3 sm:gap-6 text-center divide-x divide-gray-200 overflow-x-auto py-1 no-scrollbar">
            {/* Rating */}
            <div className="pr-3 sm:pr-6 flex-shrink-0">
              <div className="flex items-center justify-center gap-1 font-bold text-gray-900 text-sm sm:text-base">
                <span>{appSettings.rating.toFixed(1)}</span>
                <Star className="w-3.5 h-3.5 text-gray-900 fill-gray-900" />
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{appSettings.review_count}</div>
            </div>

            {/* Downloads */}
            <div className="px-3 sm:px-6 flex-shrink-0">
              <div className="font-bold text-gray-900 text-sm sm:text-base">
                {appSettings.download_count}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Downloads</div>
            </div>

            {/* Editors' Choice */}
            {appSettings.editors_choice && (
              <div className="px-3 sm:px-6 flex-shrink-0">
                <div className="flex items-center justify-center gap-1 text-gray-900 font-bold text-sm sm:text-base">
                  <Award className="w-4 h-4 text-gray-800" />
                </div>
                <div className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">Editors' Choice</div>
              </div>
            )}

            {/* Age Rating */}
            <div className="px-3 sm:px-6 flex-shrink-0">
              <div className="flex items-center justify-center gap-1">
                <span className="inline-block border border-gray-400 text-gray-800 font-bold px-1 py-0.2 text-[11px] rounded leading-none">
                  {appSettings.age_rating}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5 flex items-center justify-center gap-0.5">
                <span>Rated for {appSettings.age_rating}</span>
                <Info className="w-2.5 h-2.5 text-gray-400" />
              </div>
            </div>

            {/* Category */}
            <div className="pl-3 sm:pl-6 flex-shrink-0 hidden md:block">
              <div className="font-semibold text-gray-800 text-sm sm:text-base">
                {appSettings.category}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Category</div>
            </div>
          </div>

          {/* CTA & Actions Area */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              id="main-install-btn"
              onClick={onInstallClick}
              disabled={buttonState === 'initializing' || buttonState === 'downloading'}
              className="w-full sm:w-auto min-w-[220px] px-8 py-3 bg-play-green hover:bg-play-green-hover active:scale-[0.98] text-white font-medium text-sm sm:text-base rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-90"
            >
              {buttonState === 'initializing' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{installSettings.initializing_text || 'Initializing...'}</span>
                </>
              ) : buttonState === 'downloading' || isDownloading ? (
                <>
                  <Download className="w-4 h-4 animate-bounce text-white" />
                  <span>{installSettings.downloading_text || 'Downloading...'}</span>
                </>
              ) : buttonState === 'installing' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{installSettings.installing_text || 'Installing...'}</span>
                </>
              ) : buttonState === 'open' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>{installSettings.open_text || 'Open'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{installSettings.button_text || 'Install'}</span>
                </>
              )}
            </button>

            {/* Secondary Actions: Share & Wishlist */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-play-green hover:bg-emerald-50/70 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
              >
                {shareCopied ? <Check className="w-4 h-4 text-play-green" /> : <Share2 className="w-4 h-4" />}
                <span>{shareCopied ? 'Link Copied!' : 'Share'}</span>
              </button>

              <button
                onClick={handleWishlistToggle}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-play-green hover:bg-emerald-50/70 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
              >
                {isWishlisted ? (
                  <BookmarkCheck className="w-4 h-4 text-play-green fill-play-green" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
                <span>{isWishlisted ? 'Added to wishlist' : 'Add to wishlist'}</span>
              </button>
            </div>
          </div>

          {/* Multi-device banner notice */}
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <Laptop className="w-4 h-4 text-gray-400" />
            <Smartphone className="w-4 h-4 text-gray-400 -ml-1" />
            <span>This app is available for all of your devices</span>
          </div>
        </div>
      </div>
    </section>
  );
};
