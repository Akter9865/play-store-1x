import React from 'react';
import { Link } from 'react-router-dom';
import { AppSettings } from '../../types';

interface FooterProps {
  appSettings: AppSettings;
}

export const Footer: React.FC<FooterProps> = ({ appSettings }) => {
  return (
    <footer className="mt-12 bg-gray-50 border-t border-gray-200/80 pt-12 pb-16 text-xs text-gray-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Footer Link Columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
          {/* Column 1: Marketplace */}
          <div>
            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-3">
              Marketplace
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="hover:text-play-green hover:underline">
                  Featured Apps
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-play-green hover:underline">
                  Entertainment & Games
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-play-green hover:underline">
                  Productivity Tools
                </Link>
              </li>
              <li>
                <Link to="/install" className="hover:text-play-green hover:underline">
                  Device Compatibility
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Resources & Guides */}
          <div>
            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-3">
              Guides & Install
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/install" className="hover:text-play-green hover:underline">
                  Android APK Installation
                </Link>
              </li>
              <li>
                <Link to="/install" className="hover:text-play-green hover:underline">
                  iOS Safari Setup Guide
                </Link>
              </li>
              <li>
                <Link to="/install" className="hover:text-play-green hover:underline">
                  Desktop Chrome / PWA
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-play-green hover:underline">
                  Security Overview
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Safety */}
          <div>
            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-3">
              Trust & Safety
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/privacy" className="hover:text-play-green hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-play-green hover:underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="#developer-contact" className="hover:text-play-green hover:underline">
                  Developer Inquiries
                </a>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-play-green hover:underline">
                  Data Protection
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500">
            <Link to="/terms" className="hover:underline">
              Terms of Service
            </Link>
            <Link to="/privacy" className="hover:underline">
              Privacy
            </Link>
            <Link to="/install" className="hover:underline">
              Install Help
            </Link>
            <span className="text-gray-400">All prices include VAT where applicable.</span>
          </div>

          <div className="text-xs text-gray-400">
            © {new Date().getFullYear()} {appSettings.developer_name}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
