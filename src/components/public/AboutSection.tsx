import React, { useState } from 'react';
import { ArrowRight, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { AppSettings } from '../../types';

interface AboutSectionProps {
  appSettings: AppSettings;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ appSettings }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="py-6 sm:py-8 border-b border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 group text-left"
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-play-green transition-colors">
            About this app
          </h2>
          <ArrowRight className="w-5 h-5 text-gray-700 group-hover:translate-x-1 group-hover:text-play-green transition-all" />
        </button>
      </div>

      {/* Description text with expandable toggle */}
      <div className="text-sm text-gray-700 leading-relaxed space-y-3">
        <p className="font-medium text-gray-800">
          {appSettings.short_description}
        </p>

        <div className={`whitespace-pre-line text-gray-600 ${!isExpanded ? 'line-clamp-3' : ''}`}>
          {appSettings.description}
        </div>

        {/* Feature bullets if available */}
        {appSettings.features && appSettings.features.length > 0 && (
          <div className={`pt-2 space-y-2 ${!isExpanded ? 'hidden' : 'block animate-fade-in'}`}>
            <p className="font-semibold text-gray-900 text-xs uppercase tracking-wider">Features</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
              {appSettings.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-play-green flex-shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 text-sm font-semibold text-play-green hover:underline pt-1 cursor-pointer"
        >
          <span>{isExpanded ? 'Show less' : 'Read more'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* App Metadata row */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-y-4 gap-x-10 text-xs">
        <div>
          <span className="block text-gray-500 font-medium">Updated on</span>
          <span className="block text-gray-900 font-semibold mt-0.5">{appSettings.last_updated}</span>
        </div>

        <div>
          <span className="block text-gray-500 font-medium">Current Version</span>
          <span className="block text-gray-900 font-semibold mt-0.5">v{appSettings.version}</span>
        </div>

        <div>
          <span className="block text-gray-500 font-medium">Compatibility</span>
          <span className="block text-gray-900 font-semibold mt-0.5">Android 8.0+, iOS 14+, Desktop</span>
        </div>

        <div>
          <span className="block text-gray-500 font-medium">Interactive Elements</span>
          <span className="block text-gray-900 font-semibold mt-0.5">In-App Purchases, User Shares</span>
        </div>
      </div>
    </section>
  );
};
