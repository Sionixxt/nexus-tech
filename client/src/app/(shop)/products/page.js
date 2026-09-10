'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useProductStore } from '@/stores/productStore';
import { useDebounce } from '@/hooks/useDebounce';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductFilters } from '@/components/products/ProductFilters';
import { SearchBar } from '@/components/products/SearchBar';
import { Button } from '@/components/ui/Button';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const { filters, setFilters, search, setSearch, page, setPage } = useProductStore();
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    api.get('/products/categories').then(res => setCategories(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get('/products', {
          params: { ...filters, search: debouncedSearch, page, limit: 12 }
        });
        setProducts(res.data.products || []);
        setTotal(res.data.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters, debouncedSearch, page]);

  const totalPages = Math.ceil(total / 12);

  return (
    <section className="section container mx-auto px-4 py-8 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">All Products</h1>
          <p className="text-surface-400">{total} products found</p>
        </div>
        <div className="w-full md:w-96 flex gap-2">
          <Button variant="outline" className="md:hidden" onClick={() => setShowFilters(!showFilters)}>
            Filters
          </Button>
          <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className={`w-full md:w-64 shrink-0 ${showFilters ? 'block' : 'hidden'} md:block`}>
          <ProductFilters categories={categories} filters={filters} onFilterChange={setFilters} />
        </aside>

        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-80 rounded-2xl"></div>)}
            </div>
          ) : (
            <>
              <ProductGrid products={products} />
              
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <Button 
                    variant="outline" 
                    disabled={page === 1} 
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-surface-400">Page {page} of {totalPages}</span>
                  <Button 
                    variant="outline" 
                    disabled={page === totalPages} 
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </section>
  );
}
