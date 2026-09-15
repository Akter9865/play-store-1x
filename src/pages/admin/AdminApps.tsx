import React, { useState, useEffect } from 'react';
import {
  Plus,
  Globe,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Edit2,
  Sparkles,
  Upload,
  Layers,
  Search,
} from 'lucide-react';
import { GeneratedApp } from '../../types';
import {
  getGeneratedApps,
  saveGeneratedApp,
  deleteGeneratedApp,
  uploadFile,
} from '../../services/dataService';

export const AdminApps: React.FC = () => {
  const [apps, setApps] = useState<GeneratedApp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingIcon, setUploadingIcon] = useState(false);

  // Form State
  const [currentApp, setCurrentApp] = useState<Partial<GeneratedApp>>({
    app_id: '',
    app_name: '',
    short_name: '',
    target_url: '',
    apk_url: '',
    ios_url: '',
    ios_button_text: 'GET',
    icon_url: '/icon-512.png',
    theme_color: '#01875f',
    background_color: '#ffffff',
    category: 'Entertainment',
    rating: 4.8,
    review_count: '10K+ reviews',
    download_count: '100K+ downloads',
    short_description: 'Fast, secure, and always ready.',
    description: 'Modern standalone mobile and desktop app experience.',
    display_mode: 'standalone',
  });

  const loadApps = async () => {
    setIsLoading(true);
    try {
      const data = await getGeneratedApps();
      setApps(data);
    } catch (err) {
      console.error('Error fetching generated apps:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, []);

  const handleStartCreate = () => {
    setCurrentApp({
      app_id: '',
      app_name: '',
      short_name: '',
      target_url: '',
      apk_url: '',
      ios_url: '',
      ios_button_text: 'GET',
      icon_url: '/icon-512.png',
      theme_color: '#01875f',
      background_color: '#ffffff',
      category: 'Entertainment',
      rating: 4.8,
      review_count: '10K+ reviews',
      download_count: '100K+ downloads',
      short_description: 'Fast, secure, and always ready.',
      description: 'Modern standalone mobile and desktop app experience.',
      display_mode: 'standalone',
    });
    setIsEditing(true);
  };

  const handleStartEdit = (app: GeneratedApp) => {
    setCurrentApp(app);
    setIsEditing(true);
  };

  const handleAppNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/^-+|-+$/g, '');

    setCurrentApp((prev) => ({
      ...prev,
      app_name: name,
      short_name: prev.short_name || name.slice(0, 12),
      app_id: prev.id ? prev.app_id : slug,
    }));
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploadingIcon(true);
    try {
      const res = await uploadFile('app-assets', file);
      setCurrentApp((prev) => ({
        ...prev,
        icon_url: res.url,
        icon_192_url: res.url,
        icon_512_url: res.url,
      }));
    } catch {
      alert('Failed to upload icon.');
    } finally {
      setUploadingIcon(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentApp.app_name || !currentApp.app_id) {
      alert('App Name and App ID/Slug are required.');
      return;
    }

    setSaveStatus('saving');
    try {
      await saveGeneratedApp(currentApp);
      await loadApps();
      setSaveStatus('success');
      setTimeout(() => {
        setSaveStatus('idle');
        setIsEditing(false);
      }, 1000);
    } catch {
      alert('Failed to save app configuration.');
      setSaveStatus('idle');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    await deleteGeneratedApp(id);
    await loadApps();
  };

  const copyAppUrl = (appId: string) => {
    const fullUrl = `${window.location.origin}/app/${appId}/`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(appId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredApps = apps.filter(
    (a) =>
      a.app_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.app_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.target_url && a.target_url.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950 flex items-center gap-2">
            <span>App Generator & Multi-App Manager</span>
            <span className="text-xs bg-emerald-100 text-play-green px-2.5 py-0.5 rounded-full font-bold">
              PWA Platform
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Generate installable desktop & mobile apps from any Website URL or APK package with individual identities & routes (/app/&#123;appId&#125;/)
          </p>
        </div>

        <button
          onClick={handleStartCreate}
          className="px-4 py-2.5 bg-play-green hover:bg-play-green-hover text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New App</span>
        </button>
      </div>

      {/* Editor Modal / Inline Form */}
      {isEditing && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-md animate-slide-down space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-play-green" />
              <h2 className="text-base font-bold text-gray-900">
                {currentApp.id ? `Edit App: ${currentApp.app_name}` : 'Generate New Web / APK App'}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs font-semibold text-gray-400 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* App Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  App Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={currentApp.app_name || ''}
                  onChange={(e) => handleAppNameChange(e.target.value)}
                  placeholder="e.g. Crore Bet"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
                />
              </div>

              {/* Short Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Short Name (Mobile Home Screen) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  value={currentApp.short_name || ''}
                  onChange={(e) => setCurrentApp({ ...currentApp, short_name: e.target.value })}
                  placeholder="e.g. CroreBet"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
                />
              </div>

              {/* URL Slug / appId */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  App ID / Route Slug *
                </label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden px-3 focus-within:border-play-green">
                  <span className="text-xs text-gray-400 font-mono">/app/</span>
                  <input
                    type="text"
                    required
                    value={currentApp.app_id || ''}
                    onChange={(e) =>
                      setCurrentApp({
                        ...currentApp,
                        app_id: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9_-]/g, '-'),
                      })
                    }
                    placeholder="crore-bet"
                    className="w-full py-2.5 pl-1 bg-transparent text-sm font-mono text-gray-900 outline-none"
                  />
                  <span className="text-xs text-gray-400 font-mono">/</span>
                </div>
              </div>

              {/* Target Website URL */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Target Website URL (for Web App / PWA)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={currentApp.target_url || ''}
                    onChange={(e) => setCurrentApp({ ...currentApp, target_url: e.target.value })}
                    placeholder="https://crore-games.com or https://yourdomain.com"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green font-mono"
                  />
                  <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  When installed as a PWA, this target site opens inside the standalone app window.
                </p>
              </div>

              {/* APK Package URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Android APK URL (Optional Android download)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={currentApp.apk_url || ''}
                    onChange={(e) => setCurrentApp({ ...currentApp, apk_url: e.target.value })}
                    placeholder="https://.../app-release.apk"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
                  />
                  <Smartphone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* iOS App Store / Destination URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Apple iOS Store / Redirect URL (Optional iOS link)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={currentApp.ios_url || ''}
                    onChange={(e) => setCurrentApp({ ...currentApp, ios_url: e.target.value })}
                    placeholder="https://apps.apple.com/app/... or web link"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-blue-500"
                  />
                  <Globe className="w-4 h-4 text-blue-500 absolute left-3 top-3" />
                </div>
              </div>

              {/* App Icon Upload & URL */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  App & PWA Icon (192x192 / 512x512)
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={currentApp.icon_url || '/icon-512.png'}
                    alt="App Icon"
                    className="w-12 h-12 rounded-2xl object-cover border border-gray-200 shadow-2xs bg-gray-50 flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={currentApp.icon_url || ''}
                    onChange={(e) =>
                      setCurrentApp({
                        ...currentApp,
                        icon_url: e.target.value,
                        icon_192_url: e.target.value,
                        icon_512_url: e.target.value,
                      })
                    }
                    placeholder="Icon URL or upload below"
                    className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-play-green"
                  />
                  <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-xl flex items-center gap-1.5 cursor-pointer flex-shrink-0 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingIcon ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIconUpload}
                      disabled={uploadingIcon}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Theme Color */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Theme Color (Titlebar & Splash)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentApp.theme_color || '#01875f'}
                    onChange={(e) => setCurrentApp({ ...currentApp, theme_color: e.target.value })}
                    className="w-9 h-9 p-0 border border-gray-200 rounded-xl cursor-pointer"
                  />
                  <input
                    type="text"
                    value={currentApp.theme_color || '#01875f'}
                    onChange={(e) => setCurrentApp({ ...currentApp, theme_color: e.target.value })}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 outline-none focus:border-play-green"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={currentApp.description || ''}
                  onChange={(e) => setCurrentApp({ ...currentApp, description: e.target.value })}
                  placeholder="App description shown on the install shell..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-play-green"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveStatus === 'saving'}
                className="px-6 py-2.5 bg-play-green hover:bg-play-green-hover text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-70"
              >
                <Check className="w-4 h-4" />
                <span>{saveStatus === 'saving' ? 'Generating App...' : 'Save & Publish App'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Apps List Header & Search */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-play-green" />
            <h2 className="text-base font-bold text-gray-900">
              Generated Apps ({apps.length})
            </h2>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-play-green"
            />
          </div>
        </div>

        {/* Apps Grid */}
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-3 border-play-green border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            No generated apps found. Click "Generate New App" above to create your first installable app.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredApps.map((app) => (
              <div
                key={app.id || app.app_id}
                className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={app.icon_url || '/icon-512.png'}
                    alt={app.app_name}
                    className="w-14 h-14 rounded-2xl object-cover border border-gray-200 shadow-xs bg-white flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-950 text-sm truncate">{app.app_name}</h3>
                      {app.target_url && (
                        <span className="text-[10px] bg-emerald-50 text-play-green px-2 py-0.5 rounded-md font-semibold flex-shrink-0">
                          PWA Website
                        </span>
                      )}
                      {app.apk_url && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-semibold flex-shrink-0">
                          APK
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 font-mono mt-0.5 truncate">
                      /app/{app.app_id}/
                    </p>
                    {app.target_url && (
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">
                        Target: {app.target_url}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions Row */}
                <div className="pt-3 border-t border-gray-200/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => copyAppUrl(app.app_id)}
                      className="px-2.5 py-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Copy Public App Link"
                    >
                      {copiedId === app.app_id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-play-green" />
                          <span className="text-play-green font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`/app/${app.app_id}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-play-green text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                      title="Preview PWA Install Page"
                    >
                      <span>Preview</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(app)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit App"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(app.id, app.app_name)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete App"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
