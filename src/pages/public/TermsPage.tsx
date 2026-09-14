import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';
import { AppSettings } from '../../types';

interface TermsPageProps {
  appSettings: AppSettings;
}

export const TermsPage: React.FC<TermsPageProps> = ({ appSettings }) => {
  return (
    <div className="py-8 max-w-3xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-play-green hover:underline mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to {appSettings.app_name}</span>
      </Link>

      <div className="border-b border-gray-200 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Terms of Service</h1>
            <p className="text-xs text-gray-500 mt-0.5">Last updated: 14 September 2026</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">1. Agreement to Terms</h2>
          <p>
            By accessing or downloading {appSettings.app_name}, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use or install the application.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">2. Informational Purpose</h2>
          <p>
            This application and its landing page are intended solely for product informational, utility, and entertainment purposes. It does not provide or facilitate real-money gambling, sports betting, financial speculation, or prize transfers.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">3. Intellectual Property</h2>
          <p>
            All interface designs, trademarks, and media assets presented herein are the exclusive property of {appSettings.developer_name}. Unauthorized copying, reverse engineering, or redistribution of proprietary binaries is strictly prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">4. Disclaimers & Limitation of Liability</h2>
          <p>
            {appSettings.app_name} is provided on an "as-is" and "as-available" basis without warranties of any kind, express or implied. In no event will the developer be liable for indirect or consequential damages arising from software installation or use.
          </p>
        </section>
      </div>
    </div>
  );
};
