'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isHydrated } = useAuth();
  const logout = useAuthStore((s) => s.logout);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const cartCount = isHydrated ? getItemCount() : 0;

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-surface-950/80 border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="flex-shrink-0 cursor-pointer" onClick={() => router.push('/')}>
            <span className="gradient-text font-black tracking-tighter text-2xl">NEXUS</span>
            <span className="text-white/40 font-bold tracking-tighter text-2xl">TECH</span>
          </div>

          {/* Center: Desktop Nav */}
          <div className="hidden md:flex space-x-8">
            <a href="/products" className="text-white/70 hover:text-white transition-colors">Products</a>
            <a href="/categories" className="text-white/70 hover:text-white transition-colors">Categories</a>
          </div>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <button className="text-white/70 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>

            <button className="relative text-white/70 hover:text-white" onClick={() => router.push('/cart')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
            </button>

            {isHydrated && (
              <div className="relative">
                {isAuthenticated ? (
                  <div>
                    <button onClick={toggleUserMenu} className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </button>
                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-48 rounded-xl bg-surface-900 border border-white/[0.06] shadow-xl py-1 overflow-hidden"
                        >
                          <a href="/profile" className="block px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white">Profile</a>
                          <a href="/orders" className="block px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white">My Orders</a>
                          {user?.role === 'admin' && (
                            <a href="/admin" className="block px-4 py-2 text-sm text-primary-400 hover:bg-white/5">Admin Panel</a>
                          )}
                          <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5">Logout</button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <a href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Login</a>
                    <a href="/register" className="text-sm font-medium bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors">Register</a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <button className="relative text-white/70 hover:text-white" onClick={() => router.push('/cart')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={toggleMobileMenu} className="text-white/70 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-surface-950 border-b border-white/[0.06]"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              <a href="/products" className="block px-3 py-2 rounded-md text-base font-medium text-white/70 hover:text-white hover:bg-white/5">Products</a>
              <a href="/categories" className="block px-3 py-2 rounded-md text-base font-medium text-white/70 hover:text-white hover:bg-white/5">Categories</a>
              {isHydrated && !isAuthenticated && (
                <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-col gap-2">
                  <a href="/login" className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-white/70 hover:text-white hover:bg-white/5">Login</a>
                  <a href="/register" className="block w-full text-center px-3 py-2 rounded-md text-base font-medium bg-primary-600 text-white hover:bg-primary-500">Register</a>
                </div>
              )}
              {isHydrated && isAuthenticated && (
                <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-1">
                  <a href="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-white/70 hover:text-white hover:bg-white/5">Profile</a>
                  <a href="/orders" className="block px-3 py-2 rounded-md text-base font-medium text-white/70 hover:text-white hover:bg-white/5">My Orders</a>
                  {user?.role === 'admin' && (
                    <a href="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-primary-400 hover:bg-white/5">Admin Panel</a>
                  )}
                  <button onClick={logout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-white/5">Logout</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
