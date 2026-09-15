import React, { useState } from 'react';
import {
  Star,
  Share,
  Download,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Check,
  Loader2,
} from 'lucide-react';
import {
  AppSettings,
  InstallSettings,
  MediaItem,
  Review,
  ReleaseNote,
  DeveloperSettings,
  PrivacySettings,
} from '../../types';

interface IosAppStoreViewProps {
  appSettings: AppSettings;
  installSettings: InstallSettings;
  mediaItems?: MediaItem[];
  reviews?: Review[];
  releaseNotes?: ReleaseNote[];
  developerSettings?: DeveloperSettings | null;
  privacySettings?: PrivacySettings | null;
  onGetClick: () => void;
  buttonState?: 'idle' | 'initializing' | 'downloading' | 'installing' | 'open';
  onPlatformToggle?: (platform: 'android' | 'ios') => void;
  activePlatform?: 'android' | 'ios';
  showPlatformSwitcher?: boolean;
}

export const IosAppStoreView: React.FC<IosAppStoreViewProps> = ({
  appSettings,
  installSettings,
  mediaItems = [],
  reviews = [],
  releaseNotes = [],
  developerSettings,
  privacySettings,
  onGetClick,
  buttonState = 'idle',
  onPlatformToggle,
  activePlatform = 'ios',
  showPlatformSwitcher = true,
}) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: appSettings.app_name,
          text: appSettings.short_description,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback
      }
    }
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  const screenshots = mediaItems.filter((m) => m.enabled && m.type === 'screenshot');
  const latestRelease = releaseNotes.find((r) => r.published) || releaseNotes[0];
  const activeReviews = reviews.filter((r) => r.published);

  const formattedSize = installSettings.apk_size_bytes
    ? `${(installSettings.apk_size_bytes / (1024 * 1024)).toFixed(1)} MB`
    : '28.4 MB';

  const iosButtonLabel = installSettings.ios_button_text || 'GET';

  return (
    <div className="min-h-screen bg-[#f2f2f7] text-[#1c1c1e] font-sans antialiased selection:bg-[#0071e3] selection:text-white pb-20">
      {/* 1. iOS App Store Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-[#d1d1d6]/60 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          {/* App Store Brand Header */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#0071e3] text-white flex items-center justify-center font-bold shadow-xs">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.94-2.93-.93.04-2.07.63-2.73 1.4-.58.67-1.1 1.76-.96 2.82 1.04.08 2.11-.54 2.75-1.29z" />
              </svg>
            </div>
            <span className="font-semibold text-sm tracking-tight text-gray-900">
              App Store
            </span>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {/* Desktop Device Simulator Toggle */}
            {showPlatformSwitcher && onPlatformToggle && (
              <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200/80 text-xs">
                <button
                  type="button"
                  onClick={() => onPlatformToggle('android')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    activePlatform === 'android'
                      ? 'bg-white text-play-green shadow-xs font-semibold'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                  title="Switch to Google Play Store view"
                >
                  🤖 Android Play
                </button>
                <button
                  type="button"
                  onClick={() => onPlatformToggle('ios')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    activePlatform === 'ios'
                      ? 'bg-[#0071e3] text-white shadow-xs font-semibold'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                  title="Switch to Apple App Store view"
                >
                  🍎 iOS Store
                </button>
              </div>
            )}

            {/* iOS Share Button */}
            <button
              onClick={handleShare}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-[#0071e3] transition-colors"
              title="Share App"
              aria-label="Share"
            >
              {shareCopied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Share className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 space-y-6">
        {/* Device Detection Notice Banner */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#e5e5ea] shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0071e3] flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-xs text-gray-700 min-w-0">
              <span className="font-semibold text-gray-900 block truncate">
                iOS App Store Experience
              </span>
              <span className="text-gray-500 text-[11px] block truncate">
                Optimized for iPhone, iPad & Apple Safari browser.
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-blue-50 text-[#0071e3] text-[11px] font-semibold rounded-full border border-blue-100 flex-shrink-0">
            iOS Verified
          </span>
        </div>

        {/* 2. iOS App Hero Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#e5e5ea] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
            {/* iOS App Squircle Icon */}
            <div className="flex-shrink-0 self-start">
              <img
                src={appSettings.apple_touch_icon_url || appSettings.icon_url || '/icon-512.png'}
                alt={`${appSettings.app_name} Icon`}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-[22%] object-cover shadow-md border border-black/5 bg-gray-50"
              />
            </div>

            {/* Title & Developer Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1c1c1e] leading-snug">
                {appSettings.app_name}
              </h1>

              <p className="text-xs sm:text-sm text-[#0071e3] font-medium mt-0.5 hover:underline cursor-pointer">
                {appSettings.developer_name || 'Verified Developer'}
              </p>

              <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                <span>{appSettings.category || 'Entertainment'}</span>
                <span>•</span>
                <span>Offers In-App Purchases</span>
              </div>

              {/* Primary iOS CTA Button Row */}
              <div className="mt-4 sm:mt-5 flex items-center gap-3">
                <button
                  id="ios-get-btn"
                  onClick={onGetClick}
                  disabled={buttonState === 'initializing' || buttonState === 'downloading'}
                  className="px-7 py-2 bg-[#0071e3] hover:bg-[#0077ed] active:scale-95 text-white font-bold text-xs sm:text-sm rounded-full transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-80 min-w-[110px]"
                >
                  {buttonState === 'initializing' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : buttonState === 'downloading' ? (
                    <>
                      <Download className="w-3.5 h-3.5 animate-bounce" />
                      <span>Installing...</span>
                    </>
                  ) : buttonState === 'open' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>OPEN</span>
                    </>
                  ) : (
                    <span>{iosButtonLabel}</span>
                  )}
                </button>

                <button
                  onClick={handleShare}
                  className="w-8 h-8 rounded-full bg-[#f2f2f7] hover:bg-[#e5e5ea] text-[#0071e3] flex items-center justify-center transition-colors cursor-pointer"
                  title="Share this App"
                >
                  <Share className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-1.5 text-[10px] text-gray-400">
                In-App Purchases
              </div>
            </div>
          </div>

          {/* 3. iOS Stat Strip / Metric Cards */}
          <div className="mt-6 pt-5 border-t border-[#e5e5ea] flex items-center justify-between text-center divide-x divide-[#e5e5ea] overflow-x-auto no-scrollbar py-1">
            {/* Ratings */}
            <div className="px-3 sm:px-5 flex-shrink-0 min-w-[80px]">
              <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                Ratings
              </div>
              <div className="text-base sm:text-lg font-bold text-[#1c1c1e] mt-0.5 flex items-center justify-center gap-1">
                <span>{(appSettings.rating || 4.8).toFixed(1)}</span>
                <Star className="w-3 h-3 text-[#1c1c1e] fill-[#1c1c1e]" />
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">{appSettings.review_count}</div>
            </div>

            {/* Age */}
            <div className="px-3 sm:px-5 flex-shrink-0 min-w-[80px]">
              <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                Age
              </div>
              <div className="text-base sm:text-lg font-bold text-[#1c1c1e] mt-0.5">
                {appSettings.age_rating || '17+'}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">Years Old</div>
            </div>

            {/* Chart Rank */}
            <div className="px-3 sm:px-5 flex-shrink-0 min-w-[80px]">
              <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                Chart
              </div>
              <div className="text-base sm:text-lg font-bold text-[#1c1c1e] mt-0.5">
                #1
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[90px]">
                {appSettings.category || 'Top App'}
              </div>
            </div>

            {/* Developer */}
            <div className="px-3 sm:px-5 flex-shrink-0 min-w-[80px]">
              <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                Developer
              </div>
              <div className="text-base sm:text-lg font-bold text-[#1c1c1e] mt-0.5 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-[#0071e3]" />
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[80px]">
                Verified
              </div>
            </div>

            {/* Language */}
            <div className="px-3 sm:px-5 flex-shrink-0 min-w-[80px]">
              <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                Language
              </div>
              <div className="text-base sm:text-lg font-bold text-[#1c1c1e] mt-0.5">
                EN
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">+14 More</div>
            </div>

            {/* Size */}
            <div className="px-3 sm:px-5 flex-shrink-0 min-w-[80px]">
              <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                Size
              </div>
              <div className="text-base sm:text-lg font-bold text-[#1c1c1e] mt-0.5">
                {formattedSize}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">Package</div>
            </div>
          </div>
        </div>

        {/* 4. What's New Section (iOS Version History) */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#e5e5ea] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">What's New</h2>
            <span className="text-xs text-[#0071e3] font-medium hover:underline cursor-pointer">
              Version History
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
            <span>Version {latestRelease?.version || appSettings.version || '2.4.1'}</span>
            <span>{latestRelease?.release_date || appSettings.last_updated || 'Recent update'}</span>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pt-1">
            {latestRelease?.content ||
              '• Performance optimizations for iOS 17 and later.\n• Faster loading times and fluid interactive transitions.\n• Enhanced data encryption and security safeguards.'}
          </p>
        </div>

        {/* 5. Preview / Screenshots Section (Apple Style Carousel) */}
        {screenshots.length > 0 && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#e5e5ea] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">Preview</h2>
              <span className="text-xs text-gray-400 font-medium">iPhone & iPad</span>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory no-scrollbar">
              {screenshots.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex-shrink-0 w-52 sm:w-60 rounded-2xl overflow-hidden border border-black/5 shadow-md snap-center bg-gray-100"
                >
                  <img
                    src={item.url}
                    alt={item.title || `Screenshot ${idx + 1}`}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                  {item.caption && (
                    <div className="p-2.5 bg-white text-[11px] text-gray-600 border-t border-gray-100">
                      {item.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Description / About Section */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#e5e5ea] shadow-xs space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">Description</h2>
          <div
            className={`text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line ${
              !isDescriptionExpanded ? 'line-clamp-4' : ''
            }`}
          >
            {appSettings.description || appSettings.short_description}
          </div>

          <button
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="text-xs font-semibold text-[#0071e3] hover:underline flex items-center gap-1 pt-1 cursor-pointer"
          >
            <span>{isDescriptionExpanded ? 'Less' : 'more'}</span>
            {isDescriptionExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* 7. Ratings & Reviews Section (Apple App Store Style) */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#e5e5ea] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">Ratings & Reviews</h2>
            <span className="text-xs text-[#0071e3] font-medium hover:underline cursor-pointer">
              See All
            </span>
          </div>

          {/* Rating Breakdown */}
          <div className="flex items-center gap-6 pb-2">
            <div className="flex flex-col items-center">
              <span className="text-4xl sm:text-5xl font-extrabold text-[#1c1c1e] tracking-tight">
                {(appSettings.rating || 4.8).toFixed(1)}
              </span>
              <span className="text-[11px] text-gray-400 font-medium mt-1">out of 5</span>
            </div>

            <div className="flex-1 space-y-1 text-xs">
              {[5, 4, 3, 2, 1].map((stars) => {
                const pct = stars === 5 ? 85 : stars === 4 ? 10 : stars === 3 ? 3 : stars === 2 ? 1 : 1;
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <div className="flex text-gray-400 text-[10px] w-8 justify-end">
                      {'★'.repeat(stars)}
                    </div>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              <div className="text-right text-[10px] text-gray-400 pt-0.5">
                {appSettings.review_count || '8.3K Ratings'}
              </div>
            </div>
          </div>

          {/* Review Cards Carousel */}
          {activeReviews.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x no-scrollbar">
              {activeReviews.slice(0, 5).map((rev) => (
                <div
                  key={rev.id}
                  className="flex-shrink-0 w-72 sm:w-80 bg-[#f2f2f7] p-4 rounded-2xl space-y-2 snap-center text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 truncate max-w-[140px]">
                      {rev.reviewer_name}
                    </span>
                    <span className="text-[10px] text-gray-400">{rev.review_date}</span>
                  </div>

                  <div className="flex text-amber-400 text-xs">
                    {'★'.repeat(Math.round(rev.rating))}
                    {'☆'.repeat(5 - Math.round(rev.rating))}
                  </div>

                  <p className="text-gray-700 leading-relaxed line-clamp-3">
                    {rev.review_text}
                  </p>

                  {rev.developer_response && (
                    <div className="mt-2 p-2 bg-white rounded-xl text-[11px] text-gray-600 border border-gray-200/50">
                      <strong className="text-[#0071e3] block mb-0.5">Developer Response:</strong>
                      {rev.developer_response}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 8. Information Table (iOS Specifications Grid) */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#e5e5ea] shadow-xs space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e] mb-1">Information</h2>

          <div className="divide-y divide-[#e5e5ea] text-xs text-gray-700">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-gray-400">Provider</span>
              <span className="font-medium text-gray-900">
                {developerSettings?.company_name || appSettings.developer_name}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-gray-400">Size</span>
              <span className="font-medium text-gray-900">{formattedSize}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-gray-400">Category</span>
              <span className="font-medium text-[#0071e3] hover:underline cursor-pointer">
                {appSettings.category || 'Entertainment'}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-gray-400">Compatibility</span>
              <span className="font-medium text-gray-900 text-right">
                Works on this iPhone (iOS 15.0 or later)
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-gray-400">Languages</span>
              <span className="font-medium text-gray-900">
                English, Hindi, Spanish, French
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-gray-400">Age Rating</span>
              <span className="font-medium text-gray-900">
                {appSettings.age_rating || '17+'}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-gray-400">In-App Purchases</span>
              <span className="font-medium text-gray-900">Yes</span>
            </div>

            {developerSettings?.website && (
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-gray-400">Developer Website</span>
                <a
                  href={developerSettings.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#0071e3] hover:underline flex items-center gap-1"
                >
                  <span>Visit Website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {privacySettings && (
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-gray-400">Privacy Policy</span>
                <a
                  href="/privacy"
                  className="font-medium text-[#0071e3] hover:underline"
                >
                  View Policy
                </a>
              </div>
            )}

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-gray-400">Copyright</span>
              <span className="font-medium text-gray-900">
                © {new Date().getFullYear()} {developerSettings?.company_name || appSettings.developer_name}
              </span>
            </div>
          </div>
        </div>

        {/* 9. Apple App Store Footer */}
        <footer className="pt-4 pb-8 text-center text-xs text-gray-400 space-y-1.5">
          <p>Designed for Apple iOS, iPadOS and macOS Safari.</p>
          <p className="text-[11px]">
            Copyright © {new Date().getFullYear()} Apple Inc. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
};
