import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppSettings } from './types';
import { getAppSettings } from './services/dataService';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { GeneratedAppPage } from './pages/public/GeneratedAppPage';
import { InstallGuidePage } from './pages/public/InstallGuidePage';
import { PrivacyPolicyPage } from './pages/public/PrivacyPolicyPage';
import { TermsPage } from './pages/public/TermsPage';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminApps } from './pages/admin/AdminApps';
import { AdminContent } from './pages/admin/AdminContent';
import { AdminInstall } from './pages/admin/AdminInstall';
import { AdminMedia } from './pages/admin/AdminMedia';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminSettings } from './pages/admin/AdminSettings';

export const App: React.FC = () => {
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAppSettings();
        setAppSettings(data);
      } catch (err) {
        console.error('Failed to load initial settings:', err);
      }
    }
    load();
  }, []);

  if (!appSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-3 border-play-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Dynamic Per-App PWA Routes */}
        <Route path="/app/:appId" element={<GeneratedAppPage />} />
        <Route path="/app/:appId/*" element={<GeneratedAppPage />} />

        {/* Public Store Routes */}
        <Route path="/" element={<PublicLayout appSettings={appSettings} />}>
          <Route index element={<LandingPage appSettings={appSettings} />} />
          <Route path="install" element={<InstallGuidePage appSettings={appSettings} />} />
          <Route path="privacy" element={<PrivacyPolicyPage appSettings={appSettings} />} />
          <Route path="terms" element={<TermsPage appSettings={appSettings} />} />
        </Route>

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="apps" element={<AdminApps />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="install" element={<AdminInstall />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
