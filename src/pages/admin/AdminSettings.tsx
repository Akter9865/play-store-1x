import React, { useState } from 'react';
import {
  Globe,
  Database,
  CheckCircle2,
  AlertCircle,
  Save,
  Copy,
  Check,
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

export const AdminSettings: React.FC = () => {
  const [metaTitle, setMetaTitle] = useState('SuperPlay App - Modern Entertainment & Utilities');
  const [metaDesc, setMetaDesc] = useState('Experience next-generation utility and entertainment in one seamless app.');
  const [ogImageUrl, setOgImageUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80');
  const [headerVisible, setHeaderVisible] = useState(true);
  const [copiedSql, setCopiedSql] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

  const handleSaveSeo = (e: React.FormEvent) => {
    e.preventDefault();
    document.title = metaTitle;
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 3000);
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
            Configure SEO metadata, frontend display options, and view database connection status
          </p>
        </div>

        {saveStatus === 'success' && (
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 text-play-green border border-emerald-200 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings saved!</span>
          </div>
        )}
      </div>

      {/* SEO & Meta Tags */}
      <form onSubmit={handleSaveSeo} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
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

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 bg-play-green hover:bg-play-green-hover text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Update SEO Meta</span>
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
