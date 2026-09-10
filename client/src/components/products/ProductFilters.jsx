'use client';

import { useState } from 'react';
import { useProductStore } from '@/stores/productStore';

export default function ProductFilters({ categories = [], onFilterChange }) {
  const { filters, setFilters, clearFilters } = useProductStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryChange = (slug) => {
    const newCategory = filters.category === slug ? null : slug;
    setFilters({ category: newCategory });
    if (onFilterChange) onFilterChange();
  };

  const handlePriceChange = (type, value) => {
    setFilters({ [type]: value ? Number(value) : null });
    if (onFilterChange) onFilterChange();
  };

  const handleInStockChange = () => {
    setFilters({ inStockOnly: !filters.inStockOnly });
    if (onFilterChange) onFilterChange();
  };

  const handleSortChange = (e) => {
    setFilters({ sortBy: e.target.value });
    if (onFilterChange) onFilterChange();
  };

  const handleClear = () => {
    clearFilters();
    if (onFilterChange) onFilterChange();
  };

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6 md:hidden">
        <h2 className="text-xl font-bold text-white">Filters</h2>
        <button onClick={() => setIsOpen(!isOpen)} className="text-white/60 hover:text-white">
          {isOpen ? 'Close' : 'Open'}
        </button>
      </div>

      <div className={`space-y-8 ${isOpen ? 'block' : 'hidden md:block'}`}>
        {/* Categories */}
        <section>
          <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Categories</h3>
          <div className="space-y-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex justify-between items-center ${
                  filters.category === cat.slug 
                    ? 'bg-primary-500/10 text-primary-400 font-medium' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{cat.name}</span>
                {cat._count && <span className="text-xs text-white/30">{cat._count}</span>}
              </button>
            ))}
          </div>
        </section>

        {/* Price Range */}
        <section>
          <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Price Range</h3>
          <div className="flex items-center gap-3">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ''}
              onChange={(e) => handlePriceChange('minPrice', e.target.value)}
              className="w-full bg-surface-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
            />
            <span className="text-white/30">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ''}
              onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
              className="w-full bg-surface-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
            />
          </div>
        </section>

        {/* Availability */}
        <section>
          <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Availability</h3>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-10 h-5 rounded-full relative transition-colors ${filters.inStockOnly ? 'bg-primary-500' : 'bg-surface-900 border border-white/10'}`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${filters.inStockOnly ? 'translate-x-5' : ''}`} />
            </div>
            <span className="text-white/70 group-hover:text-white transition-colors">In Stock Only</span>
          </label>
        </section>

        {/* Sort By */}
        <section>
          <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Sort By</h3>
          <select
            value={filters.sortBy || 'newest'}
            onChange={handleSortChange}
            className="w-full bg-surface-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500 appearance-none"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
          </select>
        </section>

        {/* Clear Filters */}
        <button
          onClick={handleClear}
          className="w-full py-2 border border-white/10 hover:bg-white/5 rounded-xl text-white/70 hover:text-white transition-colors text-sm"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
}
