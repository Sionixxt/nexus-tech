'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';

export default function CartItem({ item }) {
  const { productId, name, price, image, slug, stock, quantity } = item;
  const { updateQuantity, removeItem } = useCartStore();

  const handleDecrease = () => {
    if (quantity > 1) {
      updateQuantity(productId, quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < stock) {
      updateQuantity(productId, quantity + 1);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4 border-b border-white/10 last:border-0">
      <Link href={`/products/${slug}`} className="shrink-0 block bg-surface-900 rounded-lg overflow-hidden w-16 h-16 relative">
        {image ? (
          <Image src={image} alt={name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">No img</div>
        )}
      </Link>

      <div className="flex-grow min-w-0">
        <Link href={`/products/${slug}`} className="text-white font-medium hover:text-primary-400 transition-colors line-clamp-1 block">
          {name}
        </Link>
        <div className="text-primary-400 font-semibold mt-1">
          ${price.toFixed(2)}
        </div>
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
        <div className="flex items-center bg-surface-900 rounded-lg border border-white/10">
          <button 
            onClick={handleDecrease}
            disabled={quantity <= 1}
            className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white disabled:opacity-50 transition-colors"
          >
            -
          </button>
          <span className="w-8 text-center text-sm font-medium text-white">{quantity}</span>
          <button 
            onClick={handleIncrease}
            disabled={quantity >= stock}
            className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white disabled:opacity-50 transition-colors"
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block w-20 font-bold text-white">
            ${(price * quantity).toFixed(2)}
          </div>
          <button 
            onClick={() => removeItem(productId)}
            className="text-white/40 hover:text-red-400 transition-colors p-2"
            title="Remove item"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
