import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Upload,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import {
  AppSettings,
  DeveloperSettings,
  PrivacySettings,
  ReleaseNote,
} from '../../types';
import {
  getAppSettings,
  updateAppSettings,
  getDeveloperSettings,
  updateDeveloperSettings,
  getPrivacySettings,
  updatePrivacySettings,
  getReleaseNotes,
  saveReleaseNote,
  deleteReleaseNote,
  uploadFile,
} from '../../services/dataService';

export const AdminContent: React.FC = () => {
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [devSettings, setDevSettings] = useState<DeveloperSettings | null>(null);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [releaseNotes, setReleaseNotes] = useState<ReleaseNote[]>([]);

  const [activeTab, setActiveTab] = useState<'app_info' | 'whats_new' | 'developer' | 'privacy'>('app_info');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // New feature input state
  const [newFeatureText, setNewFeatureText] = useState('');

  // New release note state
  const [newReleaseVersion, setNewReleaseVersion] = useState('');
  const [newReleaseTitle, setNewReleaseTitle] = useState('');
  const [newReleaseContent, setNewReleaseContent] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [app, dev, priv, notes] = await Promise.all([
          getAppSettings(),
          getDeveloperSettings(),
          getPrivacySettings(),
          getReleaseNotes(false),
        ]);
        setAppSettings(app);
        setDevSettings(dev);
        setPrivacySettings(priv);
        setReleaseNotes(notes);
      } catch (err) {
        console.error('Error loading content data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleSaveAppInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appSettings) return;

    setSaveStatus('saving');
    try {
      const updated = await updateAppSettings(appSettings);
      setAppSettings(updated);
      setSaveStatus('success');
      setStatusMessage('App information saved successfully!');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('error');
      setStatusMessage('Failed to save changes.');
    }
  };

  const handleSaveDeveloper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devSettings) return;

    setSaveStatus('saving');
    try {
      const updated = await updateDeveloperSettings(devSettings);
      setDevSettings(updated);
      setSaveStatus('success');
      setStatusMessage('Developer details saved successfully!');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('error');
      setStatusMessage('Failed to save changes.');
    }
  };

  const handleSavePrivacy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privacySettings) return;

    setSaveStatus('saving');
    try {
      const updated = await updatePrivacySettings(privacySettings);
      setPrivacySettings(updated);
      setSaveStatus('success');
      setStatusMessage('Data safety settings saved successfully!');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('error');
      setStatusMessage('Failed to save changes.');
    }
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !appSettings) return;
    const file = e.target.files[0];
    try {
      const res = await uploadFile('app-assets', file);
      setAppSettings({ ...appSettings, icon_url: res.url });
    } catch (err) {
      alert('Upload failed. Please try again.');
    }
  };

  const handleMarketLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !appSettings) return;
    const file = e.target.files[0];
    try {
      const res = await uploadFile('app-assets', file);
      setAppSettings({ ...appSettings, site_logo_url: res.url });
    } catch (err) {
      alert('Marketplace logo upload failed. Please try again.');
    }
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim() || !appSettings) return;
    setAppSettings({
      ...appSettings,
      features: [...(appSettings.features || []), newFeatureText.trim()],
    });
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index: number) => {
    if (!appSettings) return;
    const feats = [...(appSettings.features || [])];
    feats.splice(index, 1);
    setAppSettings({ ...appSettings, features: feats });
  };

  const handleCreateReleaseNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReleaseVersion.trim() || !newReleaseTitle.trim()) return;

    try {
      const created = await saveReleaseNote({
        version: newReleaseVersion.trim(),
        title: newReleaseTitle.trim(),
        content: newReleaseContent.trim(),
        published: true,
      });
      setReleaseNotes([created, ...releaseNotes]);
      setNewReleaseVersion('');
      setNewReleaseTitle('');
      setNewReleaseContent('');
    } catch (err) {
      alert('Failed to create release note.');
    }
  };

  const handleDeleteRelease = async (id: string) => {
    if (!confirm('Are you sure you want to delete this release note?')) return;
    await deleteReleaseNote(id);
    setReleaseNotes(releaseNotes.filter((n) => n.id !== id));
  };

  if (isLoading || !appSettings || !devSettings || !privacySettings) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-play-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">App Information & Content</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Modify text, descriptions, metadata, release notes, and developer contacts
          </p>
        </div>

        {/* Save feedback indicator */}
        {saveStatus === 'success' && (
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 text-play-green border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="px-3.5 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-semibold flex items-center gap-1.5 animate-fade-in">
            <AlertCircle className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('app_info')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'app_info'
              ? 'border-play-green text-play-green'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          App Information & Hero
        </button>
        <button
          onClick={() => setActiveTab('whats_new')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'whats_new'
              ? 'border-play-green text-play-green'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          What's New (Release Notes)
        </button>
        <button
          onClick={() => setActiveTab('developer')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'developer'
              ? 'border-play-green text-play-green'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Developer Contact Info
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'privacy'
              ? 'border-play-green text-play-green'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Data Safety & Privacy
        </button>
      </div>

      {/* TAB 1: APP INFO */}
      {activeTab === 'app_info' && (
        <form onSubmit={handleSaveAppInfo} className="space-y-6">
          {/* Top Marketplace Header Branding */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                Marketplace Header Brand (Logo, Name & Badge)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Customize the top navbar brand logo, marketplace title, and verification badge
              </p>
            </div>

            {/* Marketplace Logo row */}
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
                        onChange={handleMarketLogoUpload}
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
                  <p className="text-[11px] text-gray-400">Recommended: Square PNG, SVG, or WebP with transparent background</p>
                </div>
              </div>
            </div>

            {/* Marketplace Name & Badge row */}
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

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Hero Information & Badges
            </h3>

            {/* App Icon row */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">App Icon</label>
              <div className="flex items-center gap-4">
                <img
                  src={appSettings.icon_url}
                  alt="Icon Preview"
                  className="w-16 h-16 rounded-2xl object-cover border border-gray-200 shadow-sm"
                />
                <div>
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Icon</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIconUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-gray-400 mt-1">PNG, JPG, WebP recommended (min 192x192)</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">App Title</label>
                <input
                  type="text"
                  value={appSettings.app_name}
                  onChange={(e) => setAppSettings({ ...appSettings, app_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Developer / Studio Name</label>
                <input
                  type="text"
                  value={appSettings.developer_name}
                  onChange={(e) => setAppSettings({ ...appSettings, developer_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={appSettings.category}
                  onChange={(e) => setAppSettings({ ...appSettings, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Star Rating (1.0 to 5.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={appSettings.rating}
                  onChange={(e) => setAppSettings({ ...appSettings, rating: parseFloat(e.target.value) || 4.5 })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Reviews Count Text</label>
                <input
                  type="text"
                  value={appSettings.review_count}
                  onChange={(e) => setAppSettings({ ...appSettings, review_count: e.target.value })}
                  placeholder="e.g. 8.3K reviews"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Downloads Count Text</label>
                <input
                  type="text"
                  value={appSettings.download_count}
                  onChange={(e) => setAppSettings({ ...appSettings, download_count: e.target.value })}
                  placeholder="e.g. 100K+ downloads"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Age Rating</label>
                <input
                  type="text"
                  value={appSettings.age_rating}
                  onChange={(e) => setAppSettings({ ...appSettings, age_rating: e.target.value })}
                  placeholder="e.g. 18+ or 12+"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Current Version</label>
                <input
                  type="text"
                  value={appSettings.version}
                  onChange={(e) => setAppSettings({ ...appSettings, version: e.target.value })}
                  placeholder="e.g. 2.4.1"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Last Updated Date Text</label>
                <input
                  type="text"
                  value={appSettings.last_updated}
                  onChange={(e) => setAppSettings({ ...appSettings, last_updated: e.target.value })}
                  placeholder="e.g. 14 September 2026"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
                />
              </div>
            </div>

            {/* Verification & Editors choice toggles */}
            <div className="flex flex-wrap gap-6 pt-2 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={appSettings.verified}
                  onChange={(e) => setAppSettings({ ...appSettings, verified: e.target.checked })}
                  className="w-4 h-4 text-play-green rounded border-gray-300 focus:ring-play-green"
                />
                <span>Show Verified Blue Checkmark Badge</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={appSettings.editors_choice}
                  onChange={(e) => setAppSettings({ ...appSettings, editors_choice: e.target.checked })}
                  className="w-4 h-4 text-play-green rounded border-gray-300 focus:ring-play-green"
                />
                <span>Show Editors' Choice Ribbon Badge</span>
              </label>
            </div>
          </div>

          {/* Descriptions & Features */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Descriptions & Features
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Short Description</label>
              <input
                type="text"
                value={appSettings.short_description}
                onChange={(e) => setAppSettings({ ...appSettings, short_description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Long Description (About this app)</label>
              <textarea
                rows={5}
                value={appSettings.description}
                onChange={(e) => setAppSettings({ ...appSettings, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green font-sans leading-relaxed"
              />
            </div>

            {/* Feature Bullets */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Feature Highlights</label>
              <div className="space-y-2 mb-3">
                {appSettings.features?.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="flex-1 text-xs text-gray-800 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                      {feat}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newFeatureText}
                  onChange={(e) => setNewFeatureText(e.target.value)}
                  placeholder="Add a new feature bullet point..."
                  className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-play-green"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
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
              <span>{saveStatus === 'saving' ? 'Saving Changes...' : 'Save App Information'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: WHATS NEW */}
      {activeTab === 'whats_new' && (
        <div className="space-y-6">
          {/* Add Release Form */}
          <form onSubmit={handleCreateReleaseNote} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-play-green" />
              <span>Publish New Release Note</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Version Number</label>
                <input
                  type="text"
                  required
                  value={newReleaseVersion}
                  onChange={(e) => setNewReleaseVersion(e.target.value)}
                  placeholder="e.g. 2.4.2"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Release Title</label>
                <input
                  type="text"
                  required
                  value={newReleaseTitle}
                  onChange={(e) => setNewReleaseTitle(e.target.value)}
                  placeholder="e.g. Performance Enhancements"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Changelog Details</label>
              <textarea
                rows={3}
                value={newReleaseContent}
                onChange={(e) => setNewReleaseContent(e.target.value)}
                placeholder="• Fixed minor UI glitches&#10;• Improved loading speed by 25%"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green font-mono"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-play-green hover:bg-play-green-hover text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Release Note</span>
              </button>
            </div>
          </form>

          {/* Release Notes List */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Existing Release History
            </h3>

            {releaseNotes.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">No release notes added yet.</p>
            ) : (
              <div className="space-y-3">
                {releaseNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-play-green font-bold text-xs">
                          v{note.version}
                        </span>
                        <span className="font-bold text-gray-900 text-sm">{note.title}</span>
                        <span className="text-xs text-gray-400">• {note.release_date}</span>
                      </div>
                      <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed pl-1">
                        {note.content}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteRelease(note.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                      title="Delete release note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DEVELOPER INFO */}
      {activeTab === 'developer' && (
        <form onSubmit={handleSaveDeveloper} className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Developer & Company Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Developer Display Name</label>
                <input
                  type="text"
                  value={devSettings.developer_name}
                  onChange={(e) => setDevSettings({ ...devSettings, developer_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Company Registered Name</label>
                <input
                  type="text"
                  value={devSettings.company_name}
                  onChange={(e) => setDevSettings({ ...devSettings, company_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Support Email</label>
                <input
                  type="email"
                  value={devSettings.email}
                  onChange={(e) => setDevSettings({ ...devSettings, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Website URL</label>
                <input
                  type="url"
                  value={devSettings.website}
                  onChange={(e) => setDevSettings({ ...devSettings, website: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Support Portal URL</label>
                <input
                  type="url"
                  value={devSettings.support_url}
                  onChange={(e) => setDevSettings({ ...devSettings, support_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Physical / Business Address</label>
                <input
                  type="text"
                  value={devSettings.address || ''}
                  onChange={(e) => setDevSettings({ ...devSettings, address: e.target.value })}
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
              <span>{saveStatus === 'saving' ? 'Saving...' : 'Save Developer Details'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: DATA SAFETY & PRIVACY */}
      {activeTab === 'privacy' && (
        <form onSubmit={handleSavePrivacy} className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Data Safety Cards & Security Declarations
            </h3>

            <div className="flex items-center gap-2 pb-2">
              <input
                type="checkbox"
                id="enable-privacy-sec"
                checked={privacySettings.enabled}
                onChange={(e) => setPrivacySettings({ ...privacySettings, enabled: e.target.checked })}
                className="w-4 h-4 text-play-green rounded border-gray-300 focus:ring-play-green"
              />
              <label htmlFor="enable-privacy-sec" className="text-xs font-semibold text-gray-800">
                Enable Data Safety Section on Public Page
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Introductory Safety Note</label>
              <textarea
                rows={3}
                value={privacySettings.safety_notes}
                onChange={(e) => setPrivacySettings({ ...privacySettings, safety_notes: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <input
                  type="checkbox"
                  checked={privacySettings.encryption}
                  onChange={(e) => setPrivacySettings({ ...privacySettings, encryption: e.target.checked })}
                  className="w-4 h-4 text-play-green rounded"
                />
                <span>Data is encrypted in transit (TLS 1.3)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <input
                  type="checkbox"
                  checked={privacySettings.account_deletion}
                  onChange={(e) => setPrivacySettings({ ...privacySettings, account_deletion: e.target.checked })}
                  className="w-4 h-4 text-play-green rounded"
                />
                <span>Users can request data deletion</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Privacy Policy URL</label>
              <input
                type="text"
                value={privacySettings.privacy_policy_url}
                onChange={(e) => setPrivacySettings({ ...privacySettings, privacy_policy_url: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saveStatus === 'saving'}
              className="px-6 py-3 bg-play-green hover:bg-play-green-hover text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-70"
            >
              <Save className="w-4 h-4" />
              <span>{saveStatus === 'saving' ? 'Saving...' : 'Save Data Safety Settings'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
