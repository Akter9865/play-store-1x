import React from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  Monitor,
  ShieldCheck,
  Download,
  Share,
  PlusSquare,
  ArrowLeft,
} from 'lucide-react';
import { AppSettings } from '../../types';

interface InstallGuidePageProps {
  appSettings: AppSettings;
}

export const InstallGuidePage: React.FC<InstallGuidePageProps> = ({ appSettings }) => {
  return (
    <div className="py-8 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-play-green hover:underline mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to {appSettings.app_name}</span>
      </Link>

      <div className="border-b border-gray-200 pb-6 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Installation Guide for All Devices
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Learn how to install and run {appSettings.app_name} on Android, iPhone/iPad, and Desktop computers.
        </p>
      </div>

      <div className="space-y-10">
        {/* Section 1: Android APK */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-play-green">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Android: Direct APK Installation
              </h2>
              <span className="text-xs text-gray-500 font-medium">Compatible with Android 8.0 and newer</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Direct APK installation allows you to download and update the latest verified build without delay.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-7 h-7 rounded-full bg-play-green text-white font-bold flex items-center justify-center text-xs mb-3">
                1
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Download the APK</h3>
              <p className="text-gray-600">
                Click <strong>Install</strong> on the home page to start downloading the official APK package.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-7 h-7 rounded-full bg-play-green text-white font-bold flex items-center justify-center text-xs mb-3">
                2
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Allow Unknown Sources</h3>
              <p className="text-gray-600">
                When prompted by Android, tap <strong>Settings</strong> and switch on <em>"Allow from this source"</em> for your browser.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-7 h-7 rounded-full bg-play-green text-white font-bold flex items-center justify-center text-xs mb-3">
                3
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Install & Open</h3>
              <p className="text-gray-600">
                Tap <strong>Install</strong>. Once completed, tap <strong>Open</strong> to start using {appSettings.app_name}.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-play-green flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-emerald-950">Safe & Verified Package</span>
              <span>
                Our APK builds are cryptographically signed and scanned for vulnerabilities before release.
              </span>
            </div>
          </div>
        </section>

        {/* Section 2: iOS / iPhone / iPad */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                iOS (iPhone / iPad): Add to Home Screen
              </h2>
              <span className="text-xs text-gray-500 font-medium">Safari browser recommended</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            iOS does not run APK files. Instead, you can add {appSettings.app_name} directly to your iOS Home Screen for a dedicated app experience.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs mb-3">
                1
              </div>
              <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-1">
                Tap Share <Share className="w-3.5 h-3.5 text-blue-600 inline" />
              </h3>
              <p className="text-gray-600">
                Open this website in Safari and tap the <strong>Share</strong> button at the bottom navigation bar.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs mb-3">
                2
              </div>
              <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-1">
                Add to Home Screen <PlusSquare className="w-3.5 h-3.5 text-blue-600 inline" />
              </h3>
              <p className="text-gray-600">
                Scroll through the share sheet options and select <strong>"Add to Home Screen"</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs mb-3">
                3
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Confirm & Launch</h3>
              <p className="text-gray-600">
                Tap <strong>Add</strong> in the top-right corner. The app icon will now appear on your Home Screen.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Desktop Computer (Mac, Windows, ChromeOS) */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Desktop Computer: Progressive Web App
              </h2>
              <span className="text-xs text-gray-500 font-medium">Works on Chrome, Edge, and modern browsers</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            Install {appSettings.app_name} as a standalone desktop app with dedicated window controls, taskbar pinning, and offline capabilities.
          </p>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs sm:text-sm space-y-2">
            <p className="font-semibold text-gray-900">Steps for Desktop Chrome / Edge:</p>
            <ol className="list-decimal pl-4 space-y-1.5 text-gray-600">
              <li>Look for the install icon in your browser's address bar (URL bar).</li>
              <li>Click <strong>Install {appSettings.app_name}</strong> in the dropdown prompt.</li>
              <li>The app will immediately launch in its own clean borderless window.</li>
            </ol>
          </div>
        </section>
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-play-green text-white font-medium text-sm rounded-xl hover:bg-play-green-hover transition-all shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Get {appSettings.app_name} Now</span>
        </Link>
      </div>
    </div>
  );
};
