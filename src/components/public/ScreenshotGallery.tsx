import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import { MediaItem } from '../../types';

interface ScreenshotGalleryProps {
  mediaItems: MediaItem[];
}

export const ScreenshotGallery: React.FC<ScreenshotGalleryProps> = ({ mediaItems }) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const activeScreenshots = mediaItems
    .filter((m) => m.type === 'screenshot' && m.enabled)
    .sort((a, b) => a.sort_order - b.sort_order);

  // Keyboard navigation inside lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIdx === null) return;
      if (e.key === 'Escape') setSelectedIdx(null);
      if (e.key === 'ArrowRight') {
        setSelectedIdx((prev) => (prev! + 1) % activeScreenshots.length);
      }
      if (e.key === 'ArrowLeft') {
        setSelectedIdx((prev) => (prev! - 1 + activeScreenshots.length) % activeScreenshots.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIdx, activeScreenshots.length]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (activeScreenshots.length === 0) return null;

  return (
    <section className="py-6 sm:py-8 border-b border-gray-100">
      <div className="relative group">
        {/* Desktop Carousel Controls */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-play-elevated border border-gray-200 items-center justify-center text-gray-700 hover:text-play-green hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Previous screenshot"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-play-elevated border border-gray-200 items-center justify-center text-gray-700 hover:text-play-green hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Next screenshot"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {activeScreenshots.map((item, index) => (
            <div
              key={item.id}
              onClick={() => setSelectedIdx(index)}
              className="flex-shrink-0 w-44 sm:w-56 md:w-64 snap-start cursor-pointer group/card relative rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all"
            >
              <div className="aspect-[9/16] bg-gray-100 relative overflow-hidden">
                <img
                  src={item.url}
                  alt={item.title || `App Screenshot ${index + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover/card:scale-[1.03] transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/15 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover/card:opacity-100 transition-opacity bg-black/60 text-white p-2 rounded-full">
                    <Maximize2 className="w-4 h-4" />
                  </span>
                </div>
              </div>
              {item.title && (
                <div className="p-2.5 bg-white">
                  <p className="text-xs font-semibold text-gray-800 truncate">{item.title}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none animate-fade-in"
          onClick={() => setSelectedIdx(null)}
        >
          {/* Top Bar */}
          <div
            className="w-full max-w-5xl flex items-center justify-between text-white pb-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-sm font-medium opacity-90">
              {activeScreenshots[selectedIdx].title || `Screenshot ${selectedIdx + 1} of ${activeScreenshots.length}`}
            </div>
            <button
              onClick={() => setSelectedIdx(null)}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Close viewer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Viewer Stage */}
          <div
            className="relative max-w-4xl max-h-[80vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Button */}
            <button
              onClick={() =>
                setSelectedIdx((prev) => (prev! - 1 + activeScreenshots.length) % activeScreenshots.length)
              }
              className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors z-10"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <img
              src={activeScreenshots[selectedIdx].url}
              alt={activeScreenshots[selectedIdx].title || 'App Screenshot'}
              className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
            />

            {/* Next Button */}
            <button
              onClick={() =>
                setSelectedIdx((prev) => (prev! + 1) % activeScreenshots.length)
              }
              className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors z-10"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {activeScreenshots[selectedIdx].caption && (
            <p
              className="mt-3 text-sm text-gray-300 max-w-xl text-center px-4"
              onClick={(e) => e.stopPropagation()}
            >
              {activeScreenshots[selectedIdx].caption}
            </p>
          )}
        </div>
      )}
    </section>
  );
};
