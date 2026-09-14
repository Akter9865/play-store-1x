import { Calendar, Tag } from 'lucide-react';
import { ReleaseNote } from '../../types';

interface WhatsNewSectionProps {
  releaseNotes: ReleaseNote[];
}

export const WhatsNewSection: React.FC<WhatsNewSectionProps> = ({ releaseNotes }) => {
  const publishedNotes = releaseNotes.filter((n) => n.published);
  if (publishedNotes.length === 0) return null;

  const latest = publishedNotes[0];

  return (
    <section className="py-6 sm:py-8 border-b border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">What's new</h2>
      </div>

      <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-play-green text-white">
              <Tag className="w-3 h-3" />
              v{latest.version}
            </span>
            <h3 className="text-sm font-bold text-gray-900">{latest.title}</h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>{latest.release_date}</span>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-gray-700 whitespace-pre-line leading-relaxed pl-1">
          {latest.content}
        </div>
      </div>
    </section>
  );
};
