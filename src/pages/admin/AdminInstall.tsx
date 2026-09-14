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
} from 'lucide-react';
import { InstallSettings, InstallMode } from '../../types';
import { getInstallSettings, updateInstallSettings, uploadFile } from '../../services/dataService';

export const AdminInstall: React.FC = () => {
  const [settings, setSettings] = useState<InstallSettings | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isUploadingApk, setIsUploadingApk] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getInstallSettings();
      setSettings(data);
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
    } catch (err) {
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
      const updated = await updateInstallSettings(settings);
      setSettings(updated);
      setSaveStatus('success');
      setStatusMessage('Install settings saved successfully!');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('error');
      setStatusMessage('Failed to save settings.');
    }
  };

  if (!settings) {
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
      desc: 'Intelligently directs Android to APK, iOS to Add to Home Screen, and Desktop to PWA or Web.',
    },
    {
      id: 'APK',
      label: 'APK Download',
      desc: 'Triggers direct Android APK file package download. Protects iOS users with web alternative.',
    },
    {
      id: 'URL',
      label: 'External URL',
      desc: 'Redirects users to an external HTTPS destination with optional confirmation dialog.',
    },
    {
      id: 'PWA',
      label: 'Progressive Web App (PWA)',
      desc: 'Invokes browser install prompt or shows Safari iOS Add to Home Screen step-by-step modal.',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">Install Settings</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure how the primary "Install" CTA behaves across Android, iOS, and Desktop
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
        {/* Mode Selector */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
            Primary Install Mode
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {modes.map((m) => (
              <div
                key={m.id}
                onClick={() => handleModeChange(m.id)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  settings.mode === m.id
                    ? 'border-play-green bg-emerald-50/50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-gray-900">{m.label}</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      settings.mode === m.id
                        ? 'border-play-green bg-play-green text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    {settings.mode === m.id && <Check className="w-2.5 h-2.5" />}
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* APK Configuration Card */}
        {(settings.mode === 'APK' || settings.mode === 'SMART') && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Smartphone className="w-5 h-5 text-play-green" />
              <h3 className="text-base font-bold text-gray-900">APK Package Management</h3>
            </div>

            {settings.apk_url ? (
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 text-play-green rounded-xl">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-gray-900 block truncate max-w-sm">
                      {settings.apk_filename || 'app-release.apk'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {settings.apk_size_bytes
                        ? `${(settings.apk_size_bytes / (1024 * 1024)).toFixed(1)} MB`
                        : 'Ready for download'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors">
                    <span>Replace APK</span>
                    <input
                      type="file"
                      accept=".apk"
                      onChange={handleApkUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleRemoveApk}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                    title="Remove APK"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-gray-800">Upload Android APK Package</p>
                <p className="text-[11px] text-gray-400 mt-0.5 mb-3">
                  Upload .apk file to Supabase Storage
                </p>
                <label className="px-4 py-2 bg-play-green hover:bg-play-green-hover text-white text-xs font-semibold rounded-xl cursor-pointer shadow-sm transition-colors">
                  <span>{isUploadingApk ? 'Uploading APK...' : 'Choose .apk File'}</span>
                  <input
                    type="file"
                    accept=".apk"
                    onChange={handleApkUpload}
                    disabled={isUploadingApk}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Direct External APK URL (Optional override)
              </label>
              <input
                type="url"
                value={settings.apk_url || ''}
                onChange={(e) => setSettings({ ...settings, apk_url: e.target.value })}
                placeholder="https://your-domain.com/downloads/app.apk"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 outline-none focus:border-play-green font-mono"
              />
            </div>
          </div>
        )}

        {/* External URL Configuration Card */}
        {(settings.mode === 'URL' || settings.mode === 'SMART') && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Link2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-gray-900">External HTTPS URL Destination</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Destination HTTPS URL
              </label>
              <input
                type="url"
                required={settings.mode === 'URL'}
                value={settings.external_url || ''}
                onChange={(e) => {
                  setSettings({ ...settings, external_url: e.target.value });
                  validateUrl(e.target.value);
                }}
                placeholder="https://example.com/app"
                className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs sm:text-sm text-gray-900 outline-none font-mono ${
                  urlError ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-play-green'
                }`}
              />
              {urlError && <p className="text-xs text-red-500 mt-1">{urlError}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={settings.open_new_tab}
                  onChange={(e) => setSettings({ ...settings, open_new_tab: e.target.checked })}
                  className="w-4 h-4 text-play-green rounded border-gray-300 focus:ring-play-green"
                />
                <span>Open URL in a new tab</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={settings.confirmation_enabled}
                  onChange={(e) => setSettings({ ...settings, confirmation_enabled: e.target.checked })}
                  className="w-4 h-4 text-play-green rounded border-gray-300 focus:ring-play-green"
                />
                <span>Show "Continue to App" Confirmation Modal</span>
              </label>
            </div>
          </div>
        )}

        {/* CTA Button Text & Platform Messages */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
            Button Label & Platform Dialog Texts
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Primary Button Label
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
                Success Notice (Post Download)
              </label>
              <input
                type="text"
                value={settings.success_message}
                onChange={(e) => setSettings({ ...settings, success_message: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
              />
            </div>

            <div className="sm:col-span-2">
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

            <div className="sm:col-span-2">
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

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saveStatus === 'saving'}
            className="px-6 py-3 bg-play-green hover:bg-play-green-hover text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            <span>{saveStatus === 'saving' ? 'Saving Settings...' : 'Save Install Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
