'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Button } from '@/components/ui/Button';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function LandingPage() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/products/featured').then(res => setFeatured(res.data.products || [])).catch(console.error);
    api.get('/products/categories').then(res => setCategories(res.data.categories || [])).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-surface-950 via-surface-900/50 to-surface-950">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>
        <motion.div 
          className="relative z-10 text-center px-4"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
        >
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6">
            <span className="text-white">The Future of </span>
            <span className="gradient-text">Technology</span>
          </h1>
          <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Discover premium tech gear curated for professionals and enthusiasts. Elevate your setup with cutting-edge innovations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/products">
              <Button size="lg" className="w-full sm:w-auto glow-sm">Shop Now</Button>
            </Link>
            <Link href="/products?sort=new">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">Explore</Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="section container mx-auto px-4 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn}>
          <h2 className="text-3xl font-bold mb-10 text-white">Featured Products</h2>
          <ProductGrid products={featured} />
        </motion.div>
      </section>

      <section className="section container mx-auto px-4 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn}>
          <h2 className="text-3xl font-bold mb-10 text-white">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/products?category=${cat.slug}`}>
                <div className="glass-hover rounded-2xl p-6 h-64 flex items-end relative overflow-hidden group">
                  <div className="absolute inset-0 bg-surface-900/80 z-10 transition-opacity group-hover:bg-surface-900/60"></div>
                  {cat.image && (
                    <Image src={cat.image} alt={cat.name} fill className="object-cover z-0" />
                  )}
                  <h3 className="relative z-20 text-2xl font-bold text-white group-hover:gradient-text transition-colors">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
