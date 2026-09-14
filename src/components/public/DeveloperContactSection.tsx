import React, { useState } from 'react';
import {
  Globe,
  Mail,
  MapPin,
  Shield,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DeveloperSettings } from '../../types';

interface DeveloperContactSectionProps {
  developerSettings: DeveloperSettings;
}

export const DeveloperContactSection: React.FC<DeveloperContactSectionProps> = ({
  developerSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section id="developer-contact" className="py-6 sm:py-8 border-b border-gray-100 scroll-mt-20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between group text-left py-1"
        aria-expanded={isOpen}
      >
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-play-green transition-colors">
          Developer contact
        </h2>
        <div className="p-1 rounded-full group-hover:bg-gray-100 text-gray-500">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Accordion Content */}
      <div className={`mt-4 space-y-3.5 text-xs sm:text-sm ${isOpen ? 'block animate-fade-in' : 'hidden'}`}>
        {/* Website */}
        {developerSettings.website && (
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div>
              <span className="text-gray-500 block text-[11px]">Website</span>
              <a
                href={developerSettings.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-play-green hover:underline inline-flex items-center gap-1"
              >
                <span>{developerSettings.website.replace(/^https?:\/\//, '')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Email */}
        {developerSettings.email && (
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div>
              <span className="text-gray-500 block text-[11px]">Email</span>
              <a
                href={`mailto:${developerSettings.email}`}
                className="font-medium text-gray-900 hover:text-play-green"
              >
                {developerSettings.email}
              </a>
            </div>
          </div>
        )}

        {/* Address */}
        {developerSettings.address && (
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-gray-500 block text-[11px]">Address</span>
              <span className="text-gray-700 leading-tight block">{developerSettings.address}</span>
            </div>
          </div>
        )}

        {/* Privacy Policy link */}
        <div className="flex items-center gap-3 pt-1">
          <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div>
            <span className="text-gray-500 block text-[11px]">Privacy Policy</span>
            <a href="/privacy" className="font-medium text-play-green hover:underline">
              Read Developer Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
