import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  ExternalLink,
  Smartphone,
  Star,
  Image,
  TrendingUp,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { AnalyticsSummary } from '../../types';
import { getAnalyticsSummary } from '../../services/dataService';
import { isSupabaseConfigured } from '../../lib/supabase';

export const AdminDashboard: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getAnalyticsSummary();
        setSummary(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  if (isLoading || !summary) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-play-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Install Clicks',
      value: summary.totalInstallClicks,
      icon: Download,
      color: 'bg-emerald-50 text-play-green border-emerald-200',
    },
    {
      title: 'APK Downloads',
      value: summary.apkDownloads,
      icon: Smartphone,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      title: 'External Redirects',
      value: summary.externalRedirects,
      icon: ExternalLink,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      title: 'PWA Prompts',
      value: summary.pwaPrompts,
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      title: 'Published Reviews',
      value: `${summary.publishedReviews} / ${summary.totalReviews}`,
      icon: Star,
      color: 'bg-teal-50 text-teal-600 border-teal-200',
    },
    {
      title: 'Media Assets',
      value: summary.mediaCount,
      icon: Image,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-play-green border border-emerald-200">
              Live CMS Console
            </span>
            {isSupabaseConfigured ? (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                Connected to Supabase
              </span>
            ) : (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                Local Storage Mode
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-950">App Overview & Metrics</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Monitor anonymous download telemetry, install clicks, review moderation, and app content.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-play-green hover:bg-play-green-hover text-white text-xs sm:text-sm font-medium rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span>View Public Store Listing</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center justify-between gap-4 hover:border-gray-300 transition-colors"
          >
            <div>
              <p className="text-xs text-gray-500 font-medium">{stat.title}</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                {stat.value}
              </h3>
            </div>
            <div className={`p-3 rounded-2xl border ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/install"
          className="p-5 bg-white rounded-2xl border border-gray-200 hover:border-play-green transition-all group shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-play-green flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Smartphone className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-gray-900 text-sm group-hover:text-play-green">Install Mode Setup</h4>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Configure APK downloads, External URL redirects, PWA modes, and custom platform messages.
          </p>
        </Link>

        <Link
          to="/admin/content"
          className="p-5 bg-white rounded-2xl border border-gray-200 hover:border-play-green transition-all group shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Star className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-gray-900 text-sm group-hover:text-play-green">App Information</h4>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Edit App Title, Developer name, Star rating, Downloads count, descriptions, and feature bullet lists.
          </p>
        </Link>

        <Link
          to="/admin/media"
          className="p-5 bg-white rounded-2xl border border-gray-200 hover:border-play-green transition-all group shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Image className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-gray-900 text-sm group-hover:text-play-green">Media & Screenshots</h4>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Upload new high-res screenshot previews, reorder gallery items, and update icons and banners.
          </p>
        </Link>
      </div>

      {/* Recent Telemetry Activity Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <h3 className="font-bold text-gray-900 text-base">Recent Telemetry Activity</h3>
          </div>
          <span className="text-xs text-gray-400 font-mono">Realtime logs</span>
        </div>

        {summary.recentEvents.length === 0 ? (
          <p className="text-xs text-gray-500 py-6 text-center">No recent telemetry events recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-700 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Event Type</th>
                  <th className="py-2.5 px-3">Device</th>
                  <th className="py-2.5 px-3">Browser</th>
                  <th className="py-2.5 px-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {summary.recentEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-gray-50">
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full font-semibold text-[11px] bg-emerald-50 text-play-green">
                        {evt.event_type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 capitalize">{evt.device_type}</td>
                    <td className="py-2.5 px-3 truncate max-w-[200px]">{evt.browser || 'Browser'}</td>
                    <td className="py-2.5 px-3 text-gray-400">
                      {new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
