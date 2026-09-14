import React from 'react';
import {
  X,
  Download,
  Share,
  PlusSquare,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { AppSettings, InstallSettings } from '../../types';
import { DeviceInfo } from '../../utils/deviceDetector';
import { ModalFlowType } from '../../hooks/useInstallFlow';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  appSettings: AppSettings;
  installSettings: InstallSettings;
  device: DeviceInfo;
  modalType: ModalFlowType;
  onProceedExternalUrl?: () => void;
  onDownloadApk?: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  appSettings,
  installSettings,
  device,
  modalType,
  onProceedExternalUrl,
  onDownloadApk,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-6 sm:pt-12 md:pt-14 p-4 bg-black/45 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-slide-down mb-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors z-10"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Graphic Illustration (Inspired by screenshot 5) */}
        <div className="pt-8 pb-4 px-6 flex justify-center bg-gradient-to-b from-gray-50 to-white">
          <div className="relative w-48 h-28 flex items-center justify-center">
            {/* Monitor / Laptop Illustration */}
            <div className="w-40 h-24 rounded-t-xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-50/60 to-white shadow-sm flex flex-col items-center justify-center p-2 relative">
              <div className="w-8 h-1 bg-gray-200 rounded-full mb-2"></div>
              {/* Green Download Icon Graphic */}
              <div className="w-10 h-10 rounded-full bg-play-green text-white flex items-center justify-center shadow-md animate-bounce">
                <Download className="w-5 h-5" />
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full mt-3 flex items-center px-1">
                <div className="w-1/2 h-1 bg-play-green rounded-full"></div>
              </div>
            </div>
            <div className="absolute bottom-0 w-48 h-1.5 bg-gray-300 rounded-b-md"></div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 pb-6 pt-2">
          {/* FLOW: iOS ADD TO HOME SCREEN */}
          {modalType === 'ios_pwa_guide' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 text-center">
                Add to Home Screen
              </h2>
              <p className="mt-1.5 text-xs text-gray-500 text-center">
                Install {appSettings.app_name} on your iPhone or iPad for the full experience.
              </p>

              {/* Step by step iOS Safari guide */}
              <div className="mt-5 space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    1
                  </div>
                  <div className="text-xs text-gray-700 flex items-center gap-1.5">
                    Tap the <Share className="w-4 h-4 text-blue-600 inline" /> <strong>Share</strong> button in Safari's toolbar.
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    2
                  </div>
                  <div className="text-xs text-gray-700 flex items-center gap-1.5">
                    Scroll down and tap <PlusSquare className="w-4 h-4 text-blue-600 inline" /> <strong>Add to Home Screen</strong>.
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    3
                  </div>
                  <div className="text-xs text-gray-700">
                    Tap <strong>Add</strong> in the top-right corner to finish.
                  </div>
                </div>
              </div>

              {/* App row */}
              <div className="mt-4 flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200/80">
                <img src={appSettings.icon_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-gray-900 truncate">{appSettings.app_name}</div>
                  <div className="text-xs text-gray-500 truncate">{window.location.hostname}</div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-5 bg-play-green text-white font-medium text-sm rounded-xl hover:bg-play-green-hover"
                >
                  Got it
                </button>
              </div>
            </div>
          )}

          {/* FLOW: iOS APK WARNING */}
          {modalType === 'ios_apk_warning' && (
            <div>
              <div className="flex items-center justify-center text-amber-500 mb-2">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center">
                Android Only File (.APK)
              </h2>
              <p className="mt-2 text-xs text-gray-600 text-center leading-relaxed">
                APK installation packages are built exclusively for Android devices. Apple iOS devices cannot open or execute APK files.
              </p>

              <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200/70 rounded-xl text-xs text-amber-900 space-y-1">
                <p className="font-semibold">Recommended for iPhone & iPad:</p>
                <p>Use Safari and choose <strong>Add to Home Screen</strong> to run the full responsive web app without downloading APKs.</p>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => {
                    if (onProceedExternalUrl) onProceedExternalUrl();
                    else onClose();
                  }}
                  className="flex-1 py-2.5 bg-play-green text-white font-medium text-sm rounded-xl hover:bg-play-green-hover"
                >
                  Use Web App
                </button>
              </div>
            </div>
          )}

          {/* FLOW: EXTERNAL URL REDIRECT CONFIRMATION */}
          {modalType === 'url_redirect_confirm' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 text-center">
                Continue to App
              </h2>
              <p className="mt-1.5 text-xs text-gray-500 text-center">
                You are about to launch the official web application.
              </p>

              <div className="mt-4 p-3 bg-gray-50 border border-gray-200/80 rounded-xl flex items-center gap-3">
                <img src={appSettings.icon_url} alt="" className="w-11 h-11 rounded-xl object-cover shadow-sm" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-gray-900 truncate">{appSettings.app_name}</div>
                  <div className="text-xs text-play-green truncate font-mono">
                    {installSettings.external_url || 'https://example.com/app'}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onClose();
                    if (onProceedExternalUrl) onProceedExternalUrl();
                  }}
                  className="flex-1 py-2.5 bg-play-green text-white font-medium text-sm rounded-xl hover:bg-play-green-hover shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>Continue</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* FLOW: APK DOWNLOAD STARTED NOTIFICATION */}
          {modalType === 'apk_download_started' && (
            <div>
              <div className="flex items-center justify-center text-emerald-500 mb-2">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center">
                Download Started
              </h2>
              <p className="mt-1.5 text-xs text-gray-600 text-center leading-relaxed">
                {installSettings.success_message || 'Your APK download has started. Check your browser download bar.'}
              </p>

              <div className="mt-4 p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-blue-950">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Android Installation Tip:</span>
                </div>
                <p>
                  Android may prompt you with <em>"File might be harmful"</em> or ask to enable <strong>"Install unknown apps"</strong> in Settings. This is standard for direct APK downloads outside Google Play.
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-play-green text-white font-medium text-sm rounded-xl hover:bg-play-green-hover"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* FLOW: DESKTOP / GENERAL INSTALL CONFIRM */}
          {modalType === 'install_confirm' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 text-center">
                Install app
              </h2>
              <p className="mt-1.5 text-xs text-gray-500 text-center">
                {device.isDesktop
                  ? installSettings.desktop_message || 'Access this site in a dedicated window on your computer'
                  : installSettings.android_message || 'Download and install app on your device'}
              </p>

              {/* App mini-preview row (Matching screenshot 5) */}
              <div className="mt-5 flex items-center gap-3 p-3 bg-gray-50/80 rounded-2xl border border-gray-100">
                <img src={appSettings.icon_url} alt="" className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-gray-900 truncate">{appSettings.app_name}</div>
                  <div className="text-xs text-gray-500 truncate">{window.location.hostname}</div>
                </div>
              </div>

              {/* Action buttons (Screenshot 5: Learn More on left, Cancel and Next/Install on right) */}
              <div className="mt-6 flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                <a
                  href="/install"
                  className="text-xs font-semibold text-play-green hover:underline py-2 px-1"
                >
                  Learn More
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="py-2 px-4 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      if (onDownloadApk) onDownloadApk();
                      else if (onProceedExternalUrl) onProceedExternalUrl();
                    }}
                    className="py-2 px-5 bg-play-green text-white font-medium text-xs sm:text-sm rounded-xl hover:bg-play-green-hover shadow-sm transition-all"
                  >
                    {installSettings.button_text || 'Install'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
