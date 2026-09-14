import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { AppSettings } from '../../types';

interface PrivacyPolicyPageProps {
  appSettings: AppSettings;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ appSettings }) => {
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
          <div className="p-2 bg-emerald-50 rounded-xl text-play-green">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-xs text-gray-500 mt-0.5">Last updated: 14 September 2026</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">1. Overview</h2>
          <p>
            This Privacy Policy outlines how {appSettings.developer_name} ("we", "us", or "our") collects, uses, and safeguards information when you use {appSettings.app_name} and its associated services. We are dedicated to respecting your privacy and adhering to transparent data protection principles.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">2. Information Collection & Usage</h2>
          <p>
            We adhere to a strict data minimization approach:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-gray-600">
            <li><strong>Technical Diagnostics:</strong> Anonymous crash reports and performance metrics are used solely to fix bugs and improve responsiveness.</li>
            <li><strong>Device Specifications:</strong> General device attributes (such as OS version and display resolution) to deliver appropriately scaled assets.</li>
            <li><strong>No Sensitive Data:</strong> We do NOT collect phone numbers, contacts, financial accounts, or private communications.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">3. Data Sharing with Third Parties</h2>
          <p>
            We do not sell, rent, or trade your personal information to third-party data brokers or advertisers. Data is processed exclusively for core application utility and security integrity.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">4. Data Encryption & Security</h2>
          <p>
            All communications between your device and application infrastructure are secured using industry-standard Transport Layer Security (TLS 1.3) protocols. Stored data is kept behind restricted firewalls.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">5. Data Deletion Rights</h2>
          <p>
            You have the right to request deletion of any diagnostics or profile information associated with your device. To exercise your rights, contact us at <span className="font-semibold text-play-green">support@superplayapp.com</span>.
          </p>
        </section>
      </div>
    </div>
  );
};
