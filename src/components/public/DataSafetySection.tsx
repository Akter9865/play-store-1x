import React, { useState } from 'react';
import { ArrowRight, Share2, Cloud, Lock, Trash2, ShieldCheck, X } from 'lucide-react';
import { PrivacySettings } from '../../types';

interface DataSafetySectionProps {
  privacySettings: PrivacySettings;
}

export const DataSafetySection: React.FC<DataSafetySectionProps> = ({ privacySettings }) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  if (!privacySettings.enabled) return null;

  return (
    <section className="py-6 sm:py-8 border-b border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setShowDetailsModal(true)}
          className="flex items-center gap-2 group text-left"
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-play-green transition-colors">
            Data safety
          </h2>
          <ArrowRight className="w-5 h-5 text-gray-700 group-hover:translate-x-1 group-hover:text-play-green transition-all" />
        </button>
      </div>

      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-3xl mb-4">
        {privacySettings.safety_notes ||
          'Safety starts with understanding how developers collect and share your data. Data privacy and security practices may vary based on your use, region, and age. The developer provided this information and may update it over time.'}
      </p>

      {/* Modern Card matching Screenshot 2 */}
      <div className="rounded-2xl border border-gray-200 p-4 sm:p-5 bg-white space-y-4">
        {/* Data Sharing */}
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-gray-50 text-gray-700 flex-shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
          <div className="text-xs sm:text-sm">
            <div className="font-semibold text-gray-900">
              {privacySettings.data_shared && privacySettings.data_shared.length > 0
                ? privacySettings.data_shared[0]
                : 'No data shared with third parties'}
            </div>
            <p className="text-gray-500 text-xs mt-0.5">
              Learn more about how developers declare sharing
            </p>
          </div>
        </div>

        {/* Data Collection */}
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-gray-50 text-gray-700 flex-shrink-0">
            <Cloud className="w-5 h-5" />
          </div>
          <div className="text-xs sm:text-sm">
            <div className="font-semibold text-gray-900">
              {privacySettings.data_collected && privacySettings.data_collected.length > 0
                ? privacySettings.data_collected[0]
                : 'No sensitive data collected'}
            </div>
            <p className="text-gray-500 text-xs mt-0.5">
              Learn more about how developers declare collection
            </p>
          </div>
        </div>

        {/* Encryption */}
        {privacySettings.encryption && (
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-gray-50 text-gray-700 flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="text-xs sm:text-sm">
              <div className="font-semibold text-gray-900">Data is encrypted in transit</div>
              <p className="text-gray-500 text-xs mt-0.5">
                Your data is transferred over a secure, authenticated connection.
              </p>
            </div>
          </div>
        )}

        {/* Account Deletion */}
        {privacySettings.account_deletion && (
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-gray-50 text-gray-700 flex-shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-xs sm:text-sm">
              <div className="font-semibold text-gray-900">You can request that data be deleted</div>
              <p className="text-gray-500 text-xs mt-0.5">
                The developer provides a way for you to request that your data be removed.
              </p>
            </div>
          </div>
        )}

        {/* See Details link */}
        <div className="pt-2">
          <button
            onClick={() => setShowDetailsModal(true)}
            className="text-xs sm:text-sm font-semibold text-play-green hover:underline cursor-pointer"
          >
            See details
          </button>
        </div>
      </div>

      {/* Full Data Safety Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-play-modal max-h-[85vh] flex flex-col overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-play-green" />
                <h3 className="font-bold text-gray-900 text-base sm:text-lg">Data safety details</h3>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-gray-700">
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Data Shared</h4>
                <ul className="list-disc pl-4 space-y-1 text-gray-600">
                  {privacySettings.data_shared?.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-1">Data Collected</h4>
                <ul className="list-disc pl-4 space-y-1 text-gray-600">
                  {privacySettings.data_collected?.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-1">Security Practices</h4>
                <p className="text-gray-600">
                  Industry-standard TLS/SSL encryption is enforced across all endpoints. No unencrypted transmission is permitted.
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <a
                  href={privacySettings.privacy_policy_url || '/privacy'}
                  className="text-play-green font-semibold hover:underline block"
                >
                  Read full Privacy Policy →
                </a>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-5 py-2 bg-play-green text-white font-medium text-xs sm:text-sm rounded-xl hover:bg-play-green-hover"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
