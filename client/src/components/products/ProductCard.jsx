'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/stores/cartStore';

export default function ProductCard({ product }) {
  const { id, name, slug, price, compareAt, stock, category, images, avgRating, reviewCount } = product;
  const { addItem } = useCartStore();

  const discount = compareAt && compareAt > price 
    ? Math.round(((compareAt - price) / compareAt) * 100) 
    : 0;

  const isOutOfStock = stock === 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addItem({ ...product, quantity: 1 });
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center text-yellow-400 text-sm">
        {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`}>★</span>)}
        {hasHalfStar && <span>★</span>}
        {[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`} className="text-white/20">★</span>)}
        <span className="ml-2 text-white/50 text-xs">({reviewCount || 0})</span>
      </div>
    );
  };

  return (
    <Link href={`/products/${slug}`}>
      <motion.div 
        className="glass glass-hover rounded-2xl overflow-hidden gradient-border flex flex-col h-full group"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative aspect-[4/3] bg-surface-900 overflow-hidden">
          {images && images.length > 0 ? (
            <Image 
              src={images[0]?.url || (typeof images[0] === 'string' ? images[0] : 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800')} 
              alt={name} 
              fill 
              className="object-cover transition-transform duration-500 group-hover:scale-105" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20">No Image</div>
          )}
          
          {discount > 0 && !isOutOfStock && (
            <div className="absolute top-3 left-3 bg-accent text-surface-950 text-xs font-bold px-2 py-1 rounded-lg">
              {discount}% OFF
            </div>
          )}
          
          {isOutOfStock && (
            <div className="absolute inset-0 bg-surface-950/60 flex items-center justify-center">
              <div className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-lg">
                OUT OF STOCK
              </div>
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-grow">
          {category && (
            <div className="text-xs text-accent uppercase tracking-wider font-semibold mb-2">
              {typeof category === 'object' ? category.name : category}
            </div>
          )}
          
          <h3 className="text-lg font-semibold text-white line-clamp-1 mb-2" title={name}>
            {name}
          </h3>
          
          <div className="mb-4">
            {renderStars(avgRating)}
          </div>
          
          <div className="flex items-end gap-2 mb-4 mt-auto">
            <span className="text-xl font-bold gradient-text">${(Number(price) || 0).toFixed(2)}</span>
            {compareAt && compareAt > price && (
              <span className="text-white/30 line-through text-sm mb-1">${(Number(compareAt) || 0).toFixed(2)}</span>
            )}
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-2.5 rounded-xl font-semibold transition-all duration-200 ${
              isOutOfStock 
                ? 'bg-white/10 text-white/40 cursor-not-allowed' 
                : 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20'
            }`}
          >
            {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>
      </motion.div>
    </Link>
  );
}

export { ProductCard };
