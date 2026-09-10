'use client';

import React, { useState } from 'react';

function clsx(...classes) {
  return classes.filter(Boolean).join(' ');
}

const StarRating = ({ rating, maxStars = 5, interactive = false, onRate, size = 'md' }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleMouseEnter = (index) => {
    if (interactive) setHoverRating(index);
  };

  const handleMouseLeave = () => {
    if (interactive) setHoverRating(0);
  };

  const handleClick = (index) => {
    if (interactive && onRate) onRate(index);
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-2">
      <div className="flex" onMouseLeave={handleMouseLeave}>
        {Array.from({ length: maxStars }).map((_, i) => {
          const index = i + 1;
          const isFilled = index <= displayRating;
          
          return (
            <svg
              key={i}
              className={clsx(
                sizes[size],
                'transition-colors duration-200',
                interactive && 'cursor-pointer',
                isFilled ? 'text-yellow-400' : 'text-white/20'
              )}
              onMouseEnter={() => handleMouseEnter(index)}
              onClick={() => handleClick(index)}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          );
        })}
      </div>
      <span className={clsx("text-white/70 font-medium", size === 'sm' ? 'text-xs' : 'text-sm')}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

export default StarRating;
