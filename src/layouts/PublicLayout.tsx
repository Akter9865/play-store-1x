import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/public/Header';
import { Footer } from '../components/public/Footer';
import { AppSettings } from '../types';

interface PublicLayoutProps {
  appSettings: AppSettings;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ appSettings }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-play-text-primary">
      <Header appSettings={appSettings} />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer appSettings={appSettings} />
    </div>
  );
};
