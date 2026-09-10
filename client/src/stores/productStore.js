import { create } from 'zustand';

export const useProductStore = create((set) => ({
  search: '',
  category: '',
  minPrice: '',
  maxPrice: '',
  inStock: false,
  featured: false,
  sort: 'newest',

  setSearch: (search) => set({ search }),
  setCategory: (category) => set({ category }),
  setMinPrice: (minPrice) => set({ minPrice }),
  setMaxPrice: (maxPrice) => set({ maxPrice }),
  setInStock: (inStock) => set({ inStock }),
  setFeatured: (featured) => set({ featured }),
  setSort: (sort) => set({ sort }),

  resetFilters: () =>
    set({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      featured: false,
      sort: 'newest',
    }),
}));
