'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

export default function ReviewForm({ productId, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await api.post(`/reviews/products/${productId}`, {
        rating,
        title,
        comment
      });
      
      setSuccess(true);
      setRating(0);
      setTitle('');
      setComment('');
      if (onSubmit) onSubmit();
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      if (err.response?.status === 409) {
        setError('You have already reviewed this product');
      } else if (err.response?.status === 401) {
        setError('Please log in to submit a review');
      } else {
        setError(err.response?.data?.message || 'Failed to submit review');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Write a Review</h3>
      
      {success && (
        <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          Your review has been submitted successfully!
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm text-white/70 mb-2">Rating</label>
          <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                className={`text-2xl transition-colors ${
                  star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-white/10'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-white/70 mb-2">Title (Optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            className="w-full bg-surface-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-white/70 mb-2">Review</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you like or dislike?"
            rows={4}
            required
            className="w-full bg-surface-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || rating === 0}
          className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
        >
          {loading ? (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : (
            'Submit Review'
          )}
        </button>
      </form>
    </div>
  );
}
