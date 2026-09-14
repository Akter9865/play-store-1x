import React, { useState } from 'react';
import {
  Star,
  ArrowRight,
  Info,
  MoreVertical,
  CornerDownRight,
} from 'lucide-react';
import { Review, AppSettings } from '../../types';
import { voteHelpfulReview } from '../../services/dataService';

interface ReviewsSectionProps {
  reviews: Review[];
  appSettings: AppSettings;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, appSettings }) => {
  const [votedMap, setVotedMap] = useState<Record<string, 'yes' | 'no' | null>>({});
  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>({});
  const [showAll, setShowAll] = useState(false);

  const activeReviews = reviews.filter((r) => r.published);
  const displayedReviews = showAll ? activeReviews : activeReviews.slice(0, 3);

  const handleVote = async (reviewId: string, type: 'yes' | 'no') => {
    const currentVote = votedMap[reviewId];
    if (currentVote === type) return; // already voted this

    const isIncrement = type === 'yes';
    setVotedMap((prev) => ({ ...prev, [reviewId]: type }));

    // Optimistic helpful count update
    const currentCount = helpfulCounts[reviewId] ?? activeReviews.find((r) => r.id === reviewId)?.helpful_count ?? 0;
    const updatedCount = isIncrement ? currentCount + 1 : Math.max(0, currentCount - 1);
    setHelpfulCounts((prev) => ({ ...prev, [reviewId]: updatedCount }));

    try {
      await voteHelpfulReview(reviewId, isIncrement);
    } catch (err) {
      console.error('Error voting on review:', err);
    }
  };

  // Star ratings breakdown calculations
  const totalCount = activeReviews.length || 1;
  const starCounts = {
    5: activeReviews.filter((r) => r.rating === 5).length,
    4: activeReviews.filter((r) => r.rating === 4).length,
    3: activeReviews.filter((r) => r.rating === 3).length,
    2: activeReviews.filter((r) => r.rating === 2).length,
    1: activeReviews.filter((r) => r.rating === 1).length,
  };

  return (
    <section className="py-6 sm:py-8 border-b border-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2 group">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-play-green transition-colors">
            Ratings and reviews
          </h2>
          <ArrowRight className="w-5 h-5 text-gray-700 group-hover:translate-x-1 group-hover:text-play-green transition-all" />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span>Ratings and reviews are verified</span>
          <Info className="w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>

      {/* Ratings Overview (Big Score + Star Bars) */}
      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-12 mb-8 bg-gray-50/50 p-4 sm:p-6 rounded-2xl border border-gray-100">
        {/* Left: Overall Big Score */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-shrink-0">
          <div className="text-5xl sm:text-6xl font-black text-gray-900 tracking-tighter">
            {appSettings.rating.toFixed(1)}
          </div>
          <div className="flex items-center gap-0.5 mt-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= Math.round(appSettings.rating)
                    ? 'text-play-green fill-play-green'
                    : 'text-gray-300 fill-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-1 font-medium">{appSettings.review_count}</div>
        </div>

        {/* Right: Progress distribution bars */}
        <div className="flex-1 w-full max-w-md space-y-1.5">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = starCounts[stars as keyof typeof starCounts];
            const pct = Math.max(2, Math.round((count / totalCount) * 100));

            return (
              <div key={stars} className="flex items-center gap-3 text-xs text-gray-600 font-medium">
                <span className="w-2.5 text-right">{stars}</span>
                <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-play-green rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual Review Cards */}
      <div className="space-y-6">
        {displayedReviews.map((review) => {
          const helpful = helpfulCounts[review.id] ?? review.helpful_count;
          const userVote = votedMap[review.id];

          return (
            <article
              key={review.id}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 transition-colors shadow-sm"
            >
              {/* Reviewer Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {review.avatar_url ? (
                    <img
                      src={review.avatar_url}
                      alt={review.reviewer_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {review.reviewer_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-gray-900">{review.reviewer_name}</span>
                </div>

                <button
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
                  aria-label="Review options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Stars and Date */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= review.rating
                          ? 'text-play-green fill-play-green'
                          : 'text-gray-200 fill-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">{review.review_date}</span>
              </div>

              {/* Review Text */}
              <p className="text-sm text-gray-700 leading-relaxed">{review.review_text}</p>

              {/* Helpful question and buttons */}
              <div className="mt-3.5 pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                <span>{helpful} people found this review helpful</span>

                <div className="flex items-center gap-2">
                  <span>Did you find this helpful?</span>
                  <button
                    onClick={() => handleVote(review.id, 'yes')}
                    className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${
                      userVote === 'yes'
                        ? 'bg-play-green text-white border-play-green'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleVote(review.id, 'no')}
                    className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${
                      userVote === 'no'
                        ? 'bg-gray-800 text-white border-gray-800'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Developer Response Box (Matching screenshot 3) */}
              {review.developer_response && (
                <div className="mt-4 p-4 rounded-xl bg-gray-50 border-l-4 border-play-green space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                      <CornerDownRight className="w-3.5 h-3.5 text-play-green" />
                      <span>{appSettings.developer_name}</span>
                    </div>
                    {review.developer_response_date && (
                      <span className="text-gray-400">{review.developer_response_date}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 pl-5 leading-relaxed">
                    {review.developer_response}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* See all reviews toggle */}
      {activeReviews.length > 3 && (
        <div className="mt-6">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-semibold text-play-green hover:underline"
          >
            {showAll ? 'Show fewer reviews' : 'See all reviews'}
          </button>
        </div>
      )}
    </section>
  );
};
