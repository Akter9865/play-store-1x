import React, { useState, useEffect } from 'react';
import {
  Star,
  Plus,
  Trash2,
  Edit2,
  CornerDownRight,
  Eye,
  EyeOff,
  Award,
  X,
} from 'lucide-react';
import { Review } from '../../types';
import {
  getReviews,
  saveReview,
  deleteReview,
} from '../../services/dataService';

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Reply modal
  const [replyingReview, setReplyingReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');

  // Form states for creating/editing review
  const [formName, setFormName] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formText, setFormText] = useState('');
  const [formHelpful, setFormHelpful] = useState(0);
  const [formPublished, setFormPublished] = useState(true);
  const [formFeatured, setFormFeatured] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const data = await getReviews(false);
      setReviews(data);
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingReview(null);
    setFormName('');
    setFormRating(5);
    setFormText('');
    setFormHelpful(0);
    setFormPublished(true);
    setFormFeatured(false);
    setIsModalOpen(true);
  };

  const openEditModal = (review: Review) => {
    setEditingReview(review);
    setFormName(review.reviewer_name);
    setFormRating(review.rating);
    setFormText(review.review_text);
    setFormHelpful(review.helpful_count);
    setFormPublished(review.published);
    setFormFeatured(review.featured);
    setIsModalOpen(true);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveReview({
        id: editingReview?.id,
        reviewer_name: formName,
        rating: formRating,
        review_text: formText,
        helpful_count: formHelpful,
        published: formPublished,
        featured: formFeatured,
        developer_response: editingReview?.developer_response,
        developer_response_date: editingReview?.developer_response_date,
      });
      setIsModalOpen(false);
      await loadReviews();
    } catch (err) {
      alert('Failed to save review.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    await deleteReview(id);
    await loadReviews();
  };

  const handleTogglePublish = async (review: Review) => {
    await saveReview({ ...review, published: !review.published });
    await loadReviews();
  };

  const handleToggleFeatured = async (review: Review) => {
    await saveReview({ ...review, featured: !review.featured });
    await loadReviews();
  };

  const openReplyModal = (review: Review) => {
    setReplyingReview(review);
    setReplyText(review.developer_response || '');
  };

  const handleSaveReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview) return;

    try {
      await saveReview({
        ...replyingReview,
        developer_response: replyText.trim() || undefined,
        developer_response_date: replyText.trim()
          ? new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
          : undefined,
      });
      setReplyingReview(null);
      setReplyText('');
      await loadReviews();
    } catch (err) {
      alert('Failed to save developer reply.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-play-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">Reviews & Developer Responses</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Moderate testimonials, craft official developer replies, and curate featured reviews
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-play-green hover:bg-play-green-hover text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Review</span>
        </button>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-base">
            All Reviews ({reviews.length})
          </h3>
          <span className="text-xs text-gray-500">
            {reviews.filter((r) => r.published).length} published on public landing page
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {reviews.map((review) => (
            <div key={review.id} className="p-6 hover:bg-gray-50/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-play-green font-bold text-xs flex items-center justify-center">
                    {review.reviewer_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">{review.reviewer_name}</span>
                      {review.featured && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-bold flex items-center gap-1">
                          <Award className="w-3 h-3" /> Featured
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= review.rating ? 'text-play-green fill-play-green' : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">• {review.review_date}</span>
                      <span className="text-xs text-gray-400">• {review.helpful_count} helpful</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-start">
                  <button
                    onClick={() => openReplyModal(review)}
                    className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-emerald-50 hover:text-play-green text-xs font-semibold text-gray-700 flex items-center gap-1 transition-colors"
                  >
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>{review.developer_response ? 'Edit Reply' : 'Reply'}</span>
                  </button>

                  <button
                    onClick={() => handleToggleFeatured(review)}
                    className={`p-1.5 rounded-xl border transition-colors ${
                      review.featured
                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                        : 'text-gray-400 border-gray-200 hover:bg-gray-50'
                    }`}
                    title="Toggle Featured"
                  >
                    <Award className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleTogglePublish(review)}
                    className={`p-1.5 rounded-xl border transition-colors ${
                      review.published
                        ? 'bg-emerald-50 text-play-green border-emerald-200'
                        : 'bg-gray-100 text-gray-400 border-gray-200'
                    }`}
                    title={review.published ? 'Published (Click to hide)' : 'Hidden (Click to publish)'}
                  >
                    {review.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => openEditModal(review)}
                    className="p-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    title="Edit Review"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(review.id)}
                    className="p-1.5 rounded-xl border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Review Text */}
              <p className="mt-3 text-xs sm:text-sm text-gray-700 leading-relaxed pl-12">
                {review.review_text}
              </p>

              {/* Developer Response Display */}
              {review.developer_response && (
                <div className="mt-3.5 ml-12 p-3.5 bg-gray-50 border-l-4 border-play-green rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-gray-900">
                    <span className="flex items-center gap-1.5 text-play-green">
                      <CornerDownRight className="w-3.5 h-3.5" />
                      Official Developer Response
                    </span>
                    <span className="text-gray-400 font-normal">{review.developer_response_date}</span>
                  </div>
                  <p className="text-gray-600 pl-5">{review.developer_response}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Review Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-play-modal overflow-hidden p-6 border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-bold text-gray-900 text-base">
                {editingReview ? 'Edit Review' : 'Create New Review'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Reviewer Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Rating (1 - 5)</label>
                  <select
                    value={formRating}
                    onChange={(e) => setFormRating(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none"
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★☆</option>
                    <option value={3}>3 Stars ★★★☆☆</option>
                    <option value={2}>2 Stars ★★☆☆☆</option>
                    <option value={1}>1 Star ★☆☆☆☆</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Helpful Count</label>
                  <input
                    type="number"
                    min="0"
                    value={formHelpful}
                    onChange={(e) => setFormHelpful(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Review Content</label>
                <textarea
                  rows={4}
                  required
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="Review feedback..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={formPublished}
                    onChange={(e) => setFormPublished(e.target.checked)}
                    className="w-4 h-4 text-play-green rounded border-gray-300"
                  />
                  <span>Published on Store Listing</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="w-4 h-4 text-play-green rounded border-gray-300"
                  />
                  <span>Feature on Top</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-play-green hover:bg-play-green-hover text-white text-xs font-semibold rounded-xl"
                >
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Developer Reply Modal */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-play-modal overflow-hidden p-6 border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-bold text-gray-900 text-base">Developer Response</h3>
              <button
                onClick={() => setReplyingReview(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600 mb-4 border border-gray-200">
              <span className="font-bold text-gray-900 block mb-1">Replying to {replyingReview.reviewer_name}:</span>
              <p className="italic line-clamp-2">"{replyingReview.review_text}"</p>
            </div>

            <form onSubmit={handleSaveReply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Official Reply Message
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank the user or answer their question..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-play-green"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReplyingReview(null)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-play-green hover:bg-play-green-hover text-white text-xs font-semibold rounded-xl"
                >
                  Publish Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
