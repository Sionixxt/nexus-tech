'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { Button } from '@/components/ui/Button';

export default function CartPage() {
  const { items, getTotalItems } = useCartStore();

  return (
    <section className="section container mx-auto px-4 py-12 min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">Shopping Cart</h1>
        <p className="text-surface-400">{getTotalItems()} items in your cart</p>
      </div>

      {items.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass rounded-3xl p-16 text-center max-w-2xl mx-auto flex flex-col items-center"
        >
          <div className="w-24 h-24 bg-surface-800 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
          <p className="text-surface-400 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link href="/products">
            <Button size="lg" className="glow-sm">Continue Shopping</Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
          <div className="relative">
            <div className="sticky top-24">
              <CartSummary />
              <Link href="/checkout" className="block mt-6">
                <Button size="lg" className="w-full glow-sm text-lg">Proceed to Checkout</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
