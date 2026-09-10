'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductStore } from '@/stores/productStore';
import { useDebounce } from '@/hooks/useDebounce';

export default function SearchBar() {
  const { setFilters } = useProductStore();
  const [localSearch, setLocalSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const debouncedSearch = useDebounce(localSearch, 500);

  useEffect(() => {
    setFilters({ search: debouncedSearch });
  }, [debouncedSearch, setFilters]);

  return (
    <div className="relative w-full">
      <motion.div
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
        animate={{ rotate: isFocused ? 90 : 0, scale: isFocused ? 1.1 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </motion.div>

      <input
        type="text"
        placeholder="Search premium tech..."
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full pl-11 pr-10 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary-500 transition-colors glass"
      />

      <AnimatePresence>
        {localSearch && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setLocalSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
