import { create } from 'zustand';

export const useProductStore = create((set, get) => ({
  search: '',
  category: '',
  minPrice: '',
  maxPrice: '',
  inStock: false,
  featured: false,
  sort: 'newest',
  page: 1,
  filters: {},

  setSearch: (search) => set({ search }),
  setCategory: (category) => set((s) => ({ category, filters: { ...s.filters, category } })),
  setMinPrice: (minPrice) => set((s) => ({ minPrice, filters: { ...s.filters, minPrice } })),
  setMaxPrice: (maxPrice) => set((s) => ({ maxPrice, filters: { ...s.filters, maxPrice } })),
  setInStock: (inStock) => set((s) => ({ inStock, filters: { ...s.filters, inStock } })),
  setFeatured: (featured) => set((s) => ({ featured, filters: { ...s.filters, featured } })),
  setSort: (sort) => set((s) => ({ sort, filters: { ...s.filters, sort } })),
  setPage: (page) => set({ page }),
  setFilters: (filters) => set({ filters }),

  resetFilters: () =>
    set({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      featured: false,
      sort: 'newest',
      page: 1,
      filters: {},
    }),
}));
