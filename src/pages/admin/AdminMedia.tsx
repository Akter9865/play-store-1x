import React, { useState, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  Plus,
  X,
} from 'lucide-react';
import { MediaItem } from '../../types';
import {
  getMediaItems,
  saveMediaItem,
  deleteMediaItem,
  reorderMediaItems,
  uploadFile,
} from '../../services/dataService';

export const AdminMedia: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

  // New item modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploadSource, setUploadSource] = useState<'file' | 'url'>('file');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newType, setNewType] = useState<'screenshot' | 'banner' | 'promo'>('screenshot');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      const data = await getMediaItems();
      setMediaItems(data);
    } catch (err) {
      console.error('Error fetching media:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    // File validation: max 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setFilePreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreateMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadSource === 'file' && !selectedFile) return;
    if (uploadSource === 'url' && !newImageUrl.trim()) return;

    setIsUploading(true);
    setStatusMessage(null);

    try {
      let finalUrl = newImageUrl.trim();

      if (uploadSource === 'file' && selectedFile) {
        const bucket = newType === 'banner' ? 'banners' : 'screenshots';
        const uploaded = await uploadFile(bucket, selectedFile);
        finalUrl = uploaded.url;
      }

      await saveMediaItem({
        type: newType,
        url: finalUrl,
        title: newTitle || (selectedFile ? selectedFile.name : 'Screenshot'),
        caption: newCaption,
        enabled: true,
      });

      setShowAddModal(false);
      setSelectedFile(null);
      setFilePreviewUrl(null);
      setNewImageUrl('');
      setNewTitle('');
      setNewCaption('');
      setStatusMessage({ type: 'success', text: 'Media asset uploaded and saved successfully!' });
      await loadMedia();

      setTimeout(() => {
        setStatusMessage(null);
      }, 4000);
    } catch (err: unknown) {
      console.error('Failed to upload media item:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error occurred';
      setStatusMessage({ type: 'error', text: `Failed to save media: ${msg}` });
    } finally {
      setIsUploading(false);
    }
  };


  const handleToggleEnabled = async (item: MediaItem) => {
    await saveMediaItem({ ...item, enabled: !item.enabled });
    await loadMedia();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media item?')) return;
    await deleteMediaItem(id);
    await loadMedia();
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= mediaItems.length) return;

    const reordered = [...mediaItems];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);

    setMediaItems(reordered);
    await reorderMediaItems(reordered);
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
      {/* Status Message */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-medium flex items-center justify-between shadow-xs border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-gray-400 hover:text-gray-600 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">Media & Screenshot Gallery</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage public app gallery screenshots, promotional graphics, and reorder display sequence
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-play-green hover:bg-play-green-hover text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Media Asset</span>
        </button>
      </div>

      {/* Media Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <h3 className="font-bold text-gray-900 text-base">
            Gallery Screenshots ({mediaItems.length})
          </h3>
          <span className="text-xs text-gray-500">
            Use the arrows to control order on the public page
          </span>
        </div>

        {mediaItems.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No media uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediaItems.map((item, idx) => (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all overflow-hidden bg-white flex flex-col ${
                  item.enabled ? 'border-gray-200 shadow-sm hover:border-gray-300' : 'border-gray-200 opacity-60'
                }`}
              >
                {/* Image Aspect Box */}
                <div className="relative aspect-[9/14] bg-gray-100 overflow-hidden group">
                  <img
                    src={item.url}
                    alt={item.title || 'Screenshot'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Top floating chips */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                      #{idx + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] uppercase font-semibold">
                      {item.type}
                    </span>
                  </div>

                  {/* Hover action overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="p-2 rounded-full bg-white text-gray-800 hover:bg-gray-100 shadow-sm"
                      title="Preview Full Size"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-full bg-white text-red-600 hover:bg-red-50 shadow-sm"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card Info & Controls */}
                <div className="p-3.5 flex flex-col justify-between flex-1">
                  <div>
                    <h4 className="font-bold text-xs text-gray-900 truncate">
                      {item.title || 'Untitled Screenshot'}
                    </h4>
                    {item.caption && (
                      <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{item.caption}</p>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                    {/* Enable toggle */}
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-600 font-medium">
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={() => handleToggleEnabled(item)}
                        className="w-3.5 h-3.5 text-play-green rounded"
                      />
                      <span>{item.enabled ? 'Visible' : 'Hidden'}</span>
                    </label>

                    {/* Order Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, 'up')}
                        className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30"
                        title="Move Earlier"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={idx === mediaItems.length - 1}
                        onClick={() => handleMove(idx, 'down')}
                        className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30"
                        title="Move Later"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-play-modal overflow-hidden p-6 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-bold text-gray-900 text-base">Add Media Asset</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab: File Upload vs URL */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setUploadSource('file')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  uploadSource === 'file' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setUploadSource('url')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  uploadSource === 'url' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Image URL
              </button>
            </div>

            <form onSubmit={handleCreateMedia} className="space-y-4">
              {/* File Selector */}
              {uploadSource === 'file' ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Select Image File
                  </label>
                  {filePreviewUrl ? (
                    <div className="relative w-full h-44 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 mb-2">
                      <img src={filePreviewUrl} alt="" className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setFilePreviewUrl(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-play-green bg-gray-50/50">
                      <Upload className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs font-semibold text-gray-700">Choose PNG, JPG, or WebP</span>
                      <span className="text-[11px] text-gray-400">Up to 10MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        required={uploadSource === 'file'}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    required={uploadSource === 'url'}
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://example.com/screenshot.png"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 outline-none focus:border-play-green"
                  />
                  {newImageUrl && (
                    <div className="mt-2 relative w-full h-36 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                      <img src={newImageUrl} alt="Preview" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Asset Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as 'screenshot' | 'banner' | 'promo')}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 outline-none"
                >
                  <option value="screenshot">Screenshot (App Preview)</option>
                  <option value="banner">Banner (Hero / Wide)</option>
                  <option value="promo">Promotional Graphic</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Title / Label</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Next-Gen Dashboard"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 outline-none focus:border-play-green"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Caption / Alt Text</label>
                <textarea
                  rows={2}
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="Short description for accessibility and lightbox"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 outline-none focus:border-play-green"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || (uploadSource === 'file' ? !selectedFile : !newImageUrl.trim())}
                  className="px-5 py-2 bg-play-green hover:bg-play-green-hover text-white text-xs font-semibold rounded-xl disabled:opacity-50 flex items-center gap-2"
                >
                  {isUploading && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>{isUploading ? 'Saving...' : 'Save Media'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Preview */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
          onClick={() => setPreviewItem(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh]">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute -top-10 right-0 p-1 text-white hover:bg-white/20 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewItem.url}
              alt=""
              className="max-h-[80vh] w-auto rounded-2xl shadow-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
