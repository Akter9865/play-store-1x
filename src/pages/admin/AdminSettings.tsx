import React, { useState, useEffect } from 'react';
import {
  Globe,
  Database,
  CheckCircle2,
  AlertCircle,
  Save,
  Copy,
  Check,
  Upload,
  Sparkles,
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { AppSettings } from '../../types';
import { getAppSettings, updateAppSettings, uploadFile } from '../../services/dataService';

export const AdminSettings: React.FC = () => {
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [metaTitle, setMetaTitle] = useState('SuperPlay App - Modern Entertainment & Utilities');
  const [metaDesc, setMetaDesc] = useState('Experience next-generation utility and entertainment in one seamless app.');
  const [ogImageUrl, setOgImageUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80');
  const [headerVisible, setHeaderVisible] = useState(true);
  const [copiedSql, setCopiedSql] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  useEffect(() => {
    async function load() {
      const data = await getAppSettings();
      setAppSettings(data);
    }
    load();
  }, []);

  const handleSaveSeoAndBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    document.title = metaTitle;

    if (appSettings) {
      setSaveStatus('saving');
      await updateAppSettings(appSettings);
    }

    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !appSettings) return;
    const file = e.target.files[0];
    try {
      const res = await uploadFile('app-assets', file);
      setAppSettings({ ...appSettings, site_logo_url: res.url });
    } catch {
      alert('Logo upload failed.');
    }
  };

  const copySqlLocation = () => {
    navigator.clipboard.writeText('supabase/schema.sql');
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">Settings & Appearance</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure marketplace header branding, SEO metadata, and view database connection status
          </p>
        </div>

        {saveStatus === 'success' && (
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 text-play-green border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSeoAndBrand} className="space-y-6">
        {/* Marketplace Header Branding (Logo, Name & Badge) */}
        {appSettings && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-play-green" />
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Marketplace Header Branding (Logo, Name & Badge)
                </h3>
                <p className="text-xs text-gray-500">
                  Controls the top-left navigation logo, brand name, and verification badge
                </p>
              </div>
            </div>

            {/* Logo row */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Marketplace Brand Logo</label>
              <div className="flex items-center gap-4">
                {appSettings.site_logo_url ? (
                  <img
                    src={appSettings.site_logo_url}
                    alt="Marketplace Logo"
                    className="w-14 h-14 rounded-xl object-contain border border-gray-200 bg-white p-1 shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-play-green to-emerald-400 flex items-center justify-center shadow-sm">
                    <svg className="w-7 h-7 text-white fill-current ml-0.5" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Custom Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>

                    {appSettings.site_logo_url && (
                      <button
                        type="button"
                        onClick={() => setAppSettings({ ...appSettings, site_logo_url: '' })}
                        className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl border border-gray-200 transition-colors"
                      >
                        Reset to Default Icon
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400">Square PNG, SVG, or WebP with transparent background</p>
                </div>
              </div>
            </div>

            {/* Brand Name & Badge row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Marketplace Brand Name</label>
                <input
                  type="text"
                  value={appSettings.site_name || ''}
                  onChange={(e) => setAppSettings({ ...appSettings, site_name: e.target.value })}
                  placeholder="e.g. AppMarket"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Badge Text</label>
                <input
                  type="text"
                  value={appSettings.site_badge_text || ''}
                  onChange={(e) => setAppSettings({ ...appSettings, site_badge_text: e.target.value })}
                  placeholder="e.g. Verified"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={appSettings.show_site_badge !== false}
                  onChange={(e) => setAppSettings({ ...appSettings, show_site_badge: e.target.checked })}
                  className="w-4 h-4 text-play-green rounded border-gray-300 focus:ring-play-green"
                />
                <span>Show Verified badge next to marketplace brand name</span>
              </label>
            </div>
          </div>
        )}

        {/* SEO & Meta Tags */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Globe className="w-5 h-5 text-play-green" />
            <h3 className="text-base font-bold text-gray-900">SEO & Social Meta Tags</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Page Title (Browser Tab & Google Search)
            </label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Meta Description (Search Snippets)
            </label>
            <textarea
              rows={2}
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Social Share Image (Open Graph / Twitter Card URL)
            </label>
            <input
              type="url"
              value={ogImageUrl}
              onChange={(e) => setOgImageUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
            />
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={headerVisible}
                onChange={(e) => setHeaderVisible(e.target.checked)}
                className="w-4 h-4 text-play-green rounded border-gray-300 focus:ring-play-green"
              />
              <span>Show Top Marketplace Navigation Header</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saveStatus === 'saving'}
            className="px-6 py-3 bg-play-green hover:bg-play-green-hover text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            <span>{saveStatus === 'saving' ? 'Saving Settings...' : 'Save Settings & Appearance'}</span>
          </button>
        </div>
      </form>

      {/* Supabase Connection Status & Configuration Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Database className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-gray-900">Supabase Backend & Storage Status</h3>
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-start gap-3">
          {isSupabaseConfigured ? (
            <CheckCircle2 className="w-5 h-5 text-play-green flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <span className="font-bold text-gray-900 block text-sm">
              {isSupabaseConfigured
                ? 'Supabase Cloud Backend: Active'
                : 'Operating in Local Storage Fallback Mode'}
            </span>
            <p className="text-gray-600 mt-1 leading-relaxed">
              {isSupabaseConfigured
                ? 'The application is securely communicating with your live Supabase PostgreSQL database, Storage buckets, and Authentication engine.'
                : 'Your app is fully functional with instant browser storage persistence. To connect to live Supabase, configure your environment variables in .env.'}
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-2 text-xs">
          <p className="font-bold text-gray-800">Environment Variables (.env):</p>
          <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1">
            <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
            <div>VITE_SUPABASE_ANON_KEY=eyJhbGciOi...</div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            PostgreSQL schema and seeds are located in <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800 font-mono">supabase/schema.sql</code>
          </span>
          <button
            onClick={copySqlLocation}
            className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5 text-play-green" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSql ? 'Copied Path' : 'Copy File Path'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
