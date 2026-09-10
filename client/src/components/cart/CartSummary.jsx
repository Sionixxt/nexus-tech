'use client';

import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';

export default function CartSummary() {
  const { items, subtotal } = useCartStore();

  const taxRate = 0.08;
  const tax = subtotal * taxRate;
  
  const isFreeShipping = subtotal >= 500;
  const shipping = isFreeShipping ? 0 : 25;
  
  const total = subtotal + tax + shipping;
  const amountForFreeShipping = 500 - subtotal;
  const isCartEmpty = items.length === 0;

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-6">Order Summary</h2>
      
      <div className="space-y-4 text-sm">
        <div className="flex justify-between text-white/70">
          <span>Subtotal</span>
          <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-white/70">
          <span>Tax (8%)</span>
          <span className="text-white font-medium">${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-white/70">
          <span>Shipping</span>
          {isFreeShipping ? (
            <span className="text-accent font-medium">FREE</span>
          ) : (
            <span className="text-white font-medium">${shipping.toFixed(2)}</span>
          )}
        </div>
        
        <div className="border-t border-white/10 pt-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-white font-medium text-base">Total</span>
            <span className="text-2xl font-bold gradient-text">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {!isFreeShipping && !isCartEmpty && (
        <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/20 text-accent text-sm text-center">
          Add <span className="font-bold">${amountForFreeShipping.toFixed(2)}</span> more for free shipping!
        </div>
      )}

      <Link 
        href={isCartEmpty ? '#' : '/checkout'} 
        className={`mt-6 block w-full py-3 rounded-xl font-semibold text-center transition-all ${
          isCartEmpty 
            ? 'bg-white/5 text-white/30 cursor-not-allowed pointer-events-none' 
            : 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20'
        }`}
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}

export { CartSummary };
