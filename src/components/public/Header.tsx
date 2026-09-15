import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X, Smartphone } from 'lucide-react';
import { AppSettings } from '../../types';

interface HeaderProps {
  appSettings: AppSettings;
  activePlatform?: 'android' | 'ios';
  onPlatformToggle?: (platform: 'android' | 'ios') => void;
  showPlatformSwitcher?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  appSettings,
  activePlatform = 'android',
  onPlatformToggle,
  showPlatformSwitcher = true,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: App Marketplace Brand Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            {/* Dynamic Market Logo or Default Play Triangle */}
            {appSettings.site_logo_url ? (
              <img
                src={appSettings.site_logo_url}
                alt={appSettings.site_name || 'AppMarket'}
                className="w-9 h-9 rounded-lg object-contain shadow-sm group-hover:scale-105 transition-transform border border-gray-100 bg-white p-0.5"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-play-green to-emerald-400 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-white fill-current ml-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-gray-900 flex items-center gap-1.5">
                {appSettings.site_name || 'AppMarket'}
                {appSettings.show_site_badge !== false && (
                  <span className="text-xs px-1.5 py-0.5 font-medium rounded bg-emerald-50 text-play-green border border-emerald-200/60">
                    {appSettings.site_badge_text || 'Verified'}
                  </span>
                )}
              </span>
            </div>
          </Link>

          {/* Desktop Categories */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-gray-600">
            <Link
              to="/"
              className="px-3 py-1.5 text-play-green font-semibold border-b-2 border-play-green -mb-[1px]"
            >
              Apps
            </Link>
            <span className="px-3 py-1.5 hover:text-gray-900 cursor-pointer transition-colors">
              Games
            </span>
            <span className="px-3 py-1.5 hover:text-gray-900 cursor-pointer transition-colors">
              Tools
            </span>
            <span className="px-3 py-1.5 hover:text-gray-900 cursor-pointer transition-colors">
              Entertainment
            </span>
          </nav>
        </div>

        {/* Center / Right: Search & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Platform Switcher Toggle */}
          {showPlatformSwitcher && onPlatformToggle && (
            <div className="hidden sm:flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200/80 text-xs">
              <button
                type="button"
                onClick={() => onPlatformToggle('android')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  activePlatform === 'android'
                    ? 'bg-play-green text-white shadow-xs font-semibold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title="View Android Google Play Store presentation"
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
                title="View Apple iOS App Store presentation"
              >
                🍎 iOS Store
              </button>
            </div>
          )}

          <button
            onClick={() => setShowSearchModal(true)}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            title="Search"
            aria-label="Search apps"
          >
            <Search className="w-5 h-5" />
          </button>

          <Link
            to="/install"
            className="hidden sm:flex items-center gap-1 text-xs text-gray-600 hover:text-play-green p-2 rounded-full hover:bg-gray-100"
            title="Install Guide"
          >
            <Smartphone className="w-4 h-4" />
            <span className="font-medium">Guide</span>
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-5 space-y-3 animate-fade-in shadow-lg">
          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
            <img
              src={appSettings.icon_url}
              alt={appSettings.app_name}
              className="w-10 h-10 rounded-xl object-cover shadow-sm border border-gray-200"
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 truncate">{appSettings.app_name}</div>
              <div className="text-xs text-gray-500 truncate">{appSettings.category}</div>
            </div>
          </div>
          {/* Mobile Platform Switcher */}
          {showPlatformSwitcher && onPlatformToggle && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => {
                  onPlatformToggle('android');
                  setMobileMenuOpen(false);
                }}
                className={`py-2 rounded-lg font-medium text-center transition-all ${
                  activePlatform === 'android'
                    ? 'bg-play-green text-white shadow-xs font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🤖 Google Play View
              </button>
              <button
                type="button"
                onClick={() => {
                  onPlatformToggle('ios');
                  setMobileMenuOpen(false);
                }}
                className={`py-2 rounded-lg font-medium text-center transition-all ${
                  activePlatform === 'ios'
                    ? 'bg-[#0071e3] text-white shadow-xs font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🍎 iOS App Store View
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1 text-sm font-medium">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-emerald-50 text-play-green font-semibold"
            >
              App Listing
            </Link>
            <Link
              to="/install"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100"
            >
              Install Guide
            </Link>
            <Link
              to="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-play-modal p-4 border border-gray-100">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search in ${appSettings.app_name}...`}
                className="flex-1 text-sm outline-none text-gray-900 placeholder:text-gray-400"
                autoFocus
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 p-1.5 rounded-lg hover:bg-gray-100"
              >
                ESC
              </button>
            </div>
            <div className="py-4 text-xs text-gray-500 space-y-2">
              <p className="font-semibold text-gray-700 uppercase tracking-wider text-[11px]">Direct Quick Links</p>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/install"
                  onClick={() => setShowSearchModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-emerald-50 hover:text-play-green border border-gray-200/60"
                >
                  Download APK Guide
                </Link>
                <Link
                  to="/privacy"
                  onClick={() => setShowSearchModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-emerald-50 hover:text-play-green border border-gray-200/60"
                >
                  Data Safety & Privacy
                </Link>
                <Link
                  to="/terms"
                  onClick={() => setShowSearchModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-emerald-50 hover:text-play-green border border-gray-200/60"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
