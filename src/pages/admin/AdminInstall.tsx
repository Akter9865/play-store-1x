import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Upload,
  Link2,
  CheckCircle2,
  Save,
  FileCode,
  Check,
  Trash2,
  Globe,
  Sparkles,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { InstallSettings, InstallMode, AppSettings } from '../../types';
import {
  getInstallSettings,
  updateInstallSettings,
  getAppSettings,
  updateAppSettings,
  uploadFile,
} from '../../services/dataService';

export const AdminInstall: React.FC = () => {
  const [settings, setSettings] = useState<InstallSettings | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isUploadingApk, setIsUploadingApk] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [instData, appData] = await Promise.all([
        getInstallSettings(),
        getAppSettings(),
      ]);
      setSettings(instData);
      setAppSettings(appData);
    }
    load();
  }, []);

  const handleModeChange = (mode: InstallMode) => {
    if (!settings) return;
    setSettings({ ...settings, mode });
  };

  const handleApkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !settings) return;
    const file = e.target.files[0];

    setIsUploadingApk(true);
    try {
      const res = await uploadFile('apk', file);
      setSettings({
        ...settings,
        apk_url: res.url,
        apk_filename: res.filename,
        apk_size_bytes: res.size,
      });
      setSaveStatus('success');
      setStatusMessage('APK file attached successfully!');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      alert('Failed to process APK upload.');
    } finally {
      setIsUploadingApk(false);
    }
  };

  const handleRemoveApk = () => {
    if (!settings) return;
    setSettings({
      ...settings,
      apk_url: '',
      apk_filename: '',
      apk_size_bytes: 0,
    });
  };

  const handleIconUpload = async (
    field: 'icon_url' | 'icon_192_url' | 'icon_512_url' | 'apple_touch_icon_url' | 'favicon_url',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || !e.target.files[0] || !appSettings) return;
    const file = e.target.files[0];
    setUploadingField(field);

    try {
      const res = await uploadFile('app-assets', file);
      setAppSettings({
        ...appSettings,
        [field]: res.url,
      });
      setSaveStatus('success');
      setStatusMessage('Icon image uploaded successfully!');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      alert('Failed to upload image. You can also paste an image URL directly.');
    } finally {
      setUploadingField(null);
    }
  };

  const handleSyncAllIconsFromMain = () => {
    if (!appSettings) return;
    const mainIcon = appSettings.icon_url || '/icon-512.png';
    setAppSettings({
      ...appSettings,
      icon_192_url: mainIcon,
      icon_512_url: mainIcon,
      apple_touch_icon_url: mainIcon,
      favicon_url: mainIcon,
    });
    setSaveStatus('success');
    setStatusMessage('All PWA icons synced from Main App Icon! Click Save to apply.');
    setTimeout(() => setSaveStatus('idle'), 3500);
  };

  const validateUrl = (url: string) => {
    if (!url) {
      setUrlError(null);
      return;
    }
    if (!url.startsWith('https://')) {
      setUrlError('External URL must start with https:// for security.');
    } else {
      setUrlError(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    if (settings.mode === 'URL' && settings.external_url && !settings.external_url.startsWith('https://')) {
      setUrlError('External URL must start with https://');
      return;
    }

    setSaveStatus('saving');
    try {
      const promises: Promise<unknown>[] = [updateInstallSettings(settings)];
      if (appSettings) {
        promises.push(updateAppSettings(appSettings));
      }
      const [updatedInst] = await Promise.all(promises);
      setSettings(updatedInst as InstallSettings);
      setSaveStatus('success');
      setStatusMessage('All Install, PWA & Icon settings saved successfully!');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
      setStatusMessage('Failed to save settings.');
    }
  };

  if (!settings || !appSettings) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-play-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const modes: { id: InstallMode; label: string; desc: string }[] = [
    {
      id: 'SMART',
      label: 'Smart Auto Mode (Recommended)',
      desc: 'Directs Android to APK, iOS to Add to Home Screen, and Desktop to Chrome Native PWA or Web.',
    },
    {
      id: 'APK',
      label: 'Direct APK Download',
      desc: 'Triggers direct Android APK file package download. Shows iOS users a clean Safari Add to Home Screen guide.',
    },
    {
      id: 'URL',
      label: 'External Website URL',
      desc: 'Redirects users directly to an external website or affiliate landing destination.',
    },
    {
      id: 'PWA',
      label: 'Progressive Web App (PWA)',
      desc: 'Invokes Chrome / Android native install prompt, and Safari Add to Home Screen modal.',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">Install, PWA & Icon Settings</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure PWA Web Manifest, all App & Home Screen icons, and Install Button behaviors across Android, iOS & Desktop
          </p>
        </div>

        {saveStatus === 'success' && (
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 text-play-green border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: Mode Selector */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">Primary Install Mode</h3>
              <p className="text-xs text-gray-500">Choose how the main CTA behaves on visitor devices</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {modes.map((m) => (
              <div
                key={m.id}
                onClick={() => handleModeChange(m.id)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  settings.mode === m.id
                    ? 'border-play-green bg-emerald-50/50 shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-gray-900">{m.label}</div>
                  {settings.mode === m.id && (
                    <div className="w-5 h-5 rounded-full bg-play-green text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: PWA Manifest & App Identity */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
            <Globe className="w-5 h-5 text-play-green" />
            <div>
              <h3 className="text-base font-bold text-gray-900">PWA Web Manifest & App Identity</h3>
              <p className="text-xs text-gray-500">
                Controls the title and theme shown when installed to Chrome Apps, Windows Taskbar, or Mobile Home Screen
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                PWA Full App Name
              </label>
              <input
                type="text"
                value={appSettings.pwa_name || appSettings.app_name}
                onChange={(e) => setAppSettings({ ...appSettings, pwa_name: e.target.value })}
                placeholder="e.g. Crore Bet or SuperPlay"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
              />
              <p className="text-[11px] text-gray-400 mt-1">Shown in browser install dialog title</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                PWA Short Name (Home Screen Title)
              </label>
              <input
                type="text"
                value={appSettings.pwa_short_name || appSettings.app_name}
                onChange={(e) => setAppSettings({ ...appSettings, pwa_short_name: e.target.value })}
                placeholder="e.g. CroreBet"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
              />
              <p className="text-[11px] text-gray-400 mt-1">Label under the icon on mobile home screens</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Theme Color (Status bar & Titlebar)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={appSettings.pwa_theme_color || '#01875f'}
                  onChange={(e) => setAppSettings({ ...appSettings, pwa_theme_color: e.target.value })}
                  className="w-10 h-10 p-0 border border-gray-200 rounded-xl cursor-pointer"
                />
                <input
                  type="text"
                  value={appSettings.pwa_theme_color || '#01875f'}
                  onChange={(e) => setAppSettings({ ...appSettings, pwa_theme_color: e.target.value })}
                  className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-900 outline-none focus:border-play-green"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Background Color (Splash Screen)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={appSettings.pwa_background_color || '#ffffff'}
                  onChange={(e) => setAppSettings({ ...appSettings, pwa_background_color: e.target.value })}
                  className="w-10 h-10 p-0 border border-gray-200 rounded-xl cursor-pointer"
                />
                <input
                  type="text"
                  value={appSettings.pwa_background_color || '#ffffff'}
                  onChange={(e) => setAppSettings({ ...appSettings, pwa_background_color: e.target.value })}
                  className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-900 outline-none focus:border-play-green"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: All Icon Assets & Home Screen Manager */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-play-green" />
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Icon Assets (192x192, 512x512, Apple Touch, Favicon)
                </h3>
                <p className="text-xs text-gray-500">
                  Manage all app icon resolutions required by Chrome, Android, iOS Safari, and Desktop browsers
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSyncAllIconsFromMain}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-play-green border border-emerald-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Sync from Main Icon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Main Store Icon */}
            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-900">Main Store App Icon</label>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">Store Hero</span>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={appSettings.icon_url || '/icon-512.png'}
                  alt="Main App Icon"
                  className="w-14 h-14 rounded-2xl object-cover border border-gray-200 shadow-xs bg-white flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={appSettings.icon_url}
                    onChange={(e) => setAppSettings({ ...appSettings, icon_url: e.target.value })}
                    placeholder="URL or upload below"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-play-green"
                  />
                  <label className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 hover:border-gray-300 rounded-lg text-xs font-medium text-gray-700 cursor-pointer shadow-2xs">
                    <Upload className="w-3 h-3" />
                    <span>{uploadingField === 'icon_url' ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleIconUpload('icon_url', e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* 2. PWA Icon 192x192 */}
            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-900">PWA Icon (192x192)</label>
                <span className="text-[10px] bg-emerald-50 text-play-green px-2 py-0.5 rounded-full font-medium">Android Home</span>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={appSettings.icon_192_url || appSettings.icon_url || '/icon-192.png'}
                  alt="192x192"
                  className="w-14 h-14 rounded-2xl object-cover border border-gray-200 shadow-xs bg-white flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={appSettings.icon_192_url || '/icon-192.png'}
                    onChange={(e) => setAppSettings({ ...appSettings, icon_192_url: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-play-green"
                  />
                  <label className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 hover:border-gray-300 rounded-lg text-xs font-medium text-gray-700 cursor-pointer shadow-2xs">
                    <Upload className="w-3 h-3" />
                    <span>{uploadingField === 'icon_192_url' ? 'Uploading...' : 'Upload 192px'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleIconUpload('icon_192_url', e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* 3. PWA Icon 512x512 */}
            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-900">PWA Splash Icon (512x512)</label>
                <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">Chrome Desktop & Splash</span>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={appSettings.icon_512_url || appSettings.icon_url || '/icon-512.png'}
                  alt="512x512"
                  className="w-14 h-14 rounded-2xl object-cover border border-gray-200 shadow-xs bg-white flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={appSettings.icon_512_url || '/icon-512.png'}
                    onChange={(e) => setAppSettings({ ...appSettings, icon_512_url: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-play-green"
                  />
                  <label className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 hover:border-gray-300 rounded-lg text-xs font-medium text-gray-700 cursor-pointer shadow-2xs">
                    <Upload className="w-3 h-3" />
                    <span>{uploadingField === 'icon_512_url' ? 'Uploading...' : 'Upload 512px'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleIconUpload('icon_512_url', e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* 4. Apple Touch Icon (iOS Safari) */}
            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-900">Apple Touch Icon (180x180)</label>
                <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">iOS Safari Home</span>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={appSettings.apple_touch_icon_url || appSettings.icon_url || '/apple-touch-icon.png'}
                  alt="Apple Touch Icon"
                  className="w-14 h-14 rounded-2xl object-cover border border-gray-200 shadow-xs bg-white flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={appSettings.apple_touch_icon_url || '/apple-touch-icon.png'}
                    onChange={(e) => setAppSettings({ ...appSettings, apple_touch_icon_url: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-play-green"
                  />
                  <label className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 hover:border-gray-300 rounded-lg text-xs font-medium text-gray-700 cursor-pointer shadow-2xs">
                    <Upload className="w-3 h-3" />
                    <span>{uploadingField === 'apple_touch_icon_url' ? 'Uploading...' : 'Upload iOS Icon'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleIconUpload('apple_touch_icon_url', e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* 5. Favicon (Browser Tab) */}
            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-900">Browser Tab Favicon (64x64)</label>
                <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full font-medium">Tab Icon</span>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={appSettings.favicon_url || appSettings.icon_url || '/favicon.png'}
                  alt="Favicon"
                  className="w-12 h-12 rounded-xl object-cover border border-gray-200 shadow-xs bg-white flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={appSettings.favicon_url || '/favicon.png'}
                    onChange={(e) => setAppSettings({ ...appSettings, favicon_url: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-play-green"
                  />
                  <label className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 hover:border-gray-300 rounded-lg text-xs font-medium text-gray-700 cursor-pointer shadow-2xs">
                    <Upload className="w-3 h-3" />
                    <span>{uploadingField === 'favicon_url' ? 'Uploading...' : 'Upload Favicon'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleIconUpload('favicon_url', e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Button States & Text Labels */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
            <Layers className="w-5 h-5 text-play-green" />
            <div>
              <h3 className="text-base font-bold text-gray-900">Install Button States & Labels</h3>
              <p className="text-xs text-gray-500">
                Customize every text state of the Install button (Initial, Loading spinner, Downloading, and Completed)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                1. Idle / Default Text
              </label>
              <input
                type="text"
                value={settings.button_text}
                onChange={(e) => setSettings({ ...settings, button_text: e.target.value })}
                placeholder="Install"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                2. Initializing Text
              </label>
              <input
                type="text"
                value={settings.initializing_text || 'Initializing...'}
                onChange={(e) => setSettings({ ...settings, initializing_text: e.target.value })}
                placeholder="Initializing..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                3. Downloading Text
              </label>
              <input
                type="text"
                value={settings.downloading_text || 'Downloading...'}
                onChange={(e) => setSettings({ ...settings, downloading_text: e.target.value })}
                placeholder="Downloading..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                4. Open / Launch Text
              </label>
              <input
                type="text"
                value={settings.open_text || 'Open'}
                onChange={(e) => setSettings({ ...settings, open_text: e.target.value })}
                placeholder="Open"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-blue-600 mb-1">
                5. iOS Button Text
              </label>
              <input
                type="text"
                value={settings.ios_button_text || 'GET'}
                onChange={(e) => setSettings({ ...settings, ios_button_text: e.target.value })}
                placeholder="GET"
                className="w-full px-3.5 py-2.5 bg-blue-50/50 border border-blue-200 rounded-xl text-sm font-bold text-blue-600 outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: Mode-Specific Configuration (APK & URL) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
            Package & Target Destination Settings
          </h3>

          {/* Android APK Upload Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-play-green" />
              <label className="text-sm font-semibold text-gray-800">
                Android APK Package (Download URL or Direct Upload)
              </label>
            </div>

            <div className="space-y-3">
              <input
                type="url"
                value={settings.apk_url || ''}
                onChange={(e) => setSettings({ ...settings, apk_url: e.target.value })}
                placeholder="https://yourdomain.com/downloads/app-release.apk"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
              />

              <div className="flex items-center gap-3">
                <label className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-play-green border border-emerald-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingApk ? 'Uploading APK...' : 'Upload New APK File'}</span>
                  <input
                    type="file"
                    accept=".apk,application/vnd.android.package-archive"
                    onChange={handleApkUpload}
                    disabled={isUploadingApk}
                    className="hidden"
                  />
                </label>

                {settings.apk_url && (
                  <button
                    type="button"
                    onClick={handleRemoveApk}
                    className="px-3 py-2 text-rose-600 hover:bg-rose-50 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear APK</span>
                  </button>
                )}
              </div>

              {settings.apk_filename && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center gap-3">
                  <FileCode className="w-5 h-5 text-play-green flex-shrink-0" />
                  <div className="text-xs min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">{settings.apk_filename}</p>
                    <p className="text-gray-500">
                      {settings.apk_size_bytes
                        ? `${(settings.apk_size_bytes / (1024 * 1024)).toFixed(1)} MB`
                        : 'Custom package'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5 space-y-3">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-play-green" />
              <label className="text-sm font-semibold text-gray-800">
                Destination Website / Target URL
              </label>
            </div>

            <div className="space-y-2">
              <input
                type="url"
                value={settings.external_url || ''}
                onChange={(e) => {
                  setSettings({ ...settings, external_url: e.target.value });
                  validateUrl(e.target.value);
                }}
                placeholder="https://crore-games.com or https://yourdomain.com"
                className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-sm text-gray-900 outline-none focus:border-play-green ${
                  urlError ? 'border-rose-300' : 'border-gray-200'
                }`}
              />
              {urlError && <p className="text-xs text-rose-500">{urlError}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.open_new_tab}
                  onChange={(e) => setSettings({ ...settings, open_new_tab: e.target.checked })}
                  className="rounded text-play-green focus:ring-play-green w-4 h-4"
                />
                <span>Open URL in a new browser tab</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.confirmation_enabled}
                  onChange={(e) => setSettings({ ...settings, confirmation_enabled: e.target.checked })}
                  className="rounded text-play-green focus:ring-play-green w-4 h-4"
                />
                <span>Show confirmation dialog before redirecting</span>
              </label>
            </div>
          </div>

          {/* Apple iOS App Store / Destination Section */}
          <div className="border-t border-gray-100 pt-5 space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#0071e3]" />
              <label className="text-sm font-semibold text-gray-800">
                Apple iOS App Store / Target Destination URL
              </label>
            </div>
            <p className="text-xs text-gray-500">
              When an iOS visitor taps the "GET" button, they will be redirected to this URL (e.g. Apple App Store app listing or iOS destination). If left blank, iOS Add to Home Screen step-by-step guide is shown.
            </p>
            <input
              type="url"
              value={settings.ios_store_url || ''}
              onChange={(e) => setSettings({ ...settings, ios_store_url: e.target.value })}
              placeholder="https://apps.apple.com/app/id1234567890 or https://yourdomain.com/ios"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* Store Presentation Mode */}
          <div className="border-t border-gray-100 pt-5 space-y-3">
            <label className="text-sm font-semibold text-gray-800 block">
              Store Presentation Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div
                onClick={() => setSettings({ ...settings, store_theme_mode: 'auto' })}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  (settings.store_theme_mode || 'auto') === 'auto'
                    ? 'border-blue-500 bg-blue-50/40 font-semibold text-blue-900'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span>Smart Auto (Recommended)</span>
                  {(settings.store_theme_mode || 'auto') === 'auto' && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-[11px] text-gray-500 font-normal">
                  Android sees Google Play Store, iOS sees Apple App Store.
                </p>
              </div>

              <div
                onClick={() => setSettings({ ...settings, store_theme_mode: 'android_only' })}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  settings.store_theme_mode === 'android_only'
                    ? 'border-play-green bg-emerald-50/40 font-semibold text-emerald-900'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span>Always Google Play</span>
                  {settings.store_theme_mode === 'android_only' && <Check className="w-4 h-4 text-play-green" />}
                </div>
                <p className="text-[11px] text-gray-500 font-normal">
                  Show Google Play Store UI to all visitors.
                </p>
              </div>

              <div
                onClick={() => setSettings({ ...settings, store_theme_mode: 'ios_only' })}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  settings.store_theme_mode === 'ios_only'
                    ? 'border-blue-500 bg-blue-50/40 font-semibold text-blue-900'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span>Always Apple App Store</span>
                  {settings.store_theme_mode === 'ios_only' && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-[11px] text-gray-500 font-normal">
                  Show Apple App Store UI to all visitors.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 6: Dialog Messages & Notices */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
            Custom Dialog Messages
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Success Notice (Post APK Download)
              </label>
              <input
                type="text"
                value={settings.success_message}
                onChange={(e) => setSettings({ ...settings, success_message: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Android Dialog Message
              </label>
              <input
                type="text"
                value={settings.android_message}
                onChange={(e) => setSettings({ ...settings, android_message: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                iOS Dialog Message
              </label>
              <input
                type="text"
                value={settings.ios_message}
                onChange={(e) => setSettings({ ...settings, ios_message: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Desktop Dialog Message
              </label>
              <input
                type="text"
                value={settings.desktop_message}
                onChange={(e) => setSettings({ ...settings, desktop_message: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saveStatus === 'saving'}
            className="px-8 py-3.5 bg-play-green hover:bg-play-green-hover text-white text-sm font-semibold rounded-2xl flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            <span>{saveStatus === 'saving' ? 'Saving All Settings...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
