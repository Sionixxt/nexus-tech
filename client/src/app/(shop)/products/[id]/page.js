'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import api from '@/lib/api';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import toast from 'react-hot-toast';

export default function ProductDetailPage({ params }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState('');
  
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${params.id}`);
        setProduct(res.data);
        setMainImage(res.data.images?.[0] || '');
      } catch (err) {
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success('Added to cart');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="skeleton w-32 h-32 rounded-full"></div></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-white text-2xl">Product not found</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-12 min-h-screen"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        <div className="space-y-4">
          <div className="glass rounded-3xl aspect-square relative overflow-hidden flex items-center justify-center p-8">
            <Image src={mainImage || '/placeholder.png'} alt={product.name} fill className="object-contain" />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setMainImage(img)} className={`glass w-24 h-24 shrink-0 rounded-xl relative overflow-hidden ${mainImage === img ? 'ring-2 ring-primary-500' : ''}`}>
                  <Image src={img} alt={`Thumb ${i}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <Badge className="w-fit mb-4">{product.category}</Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{product.name}</h1>
          <div className="flex items-center gap-4 mb-6">
            <StarRating rating={product.rating} />
            <span className="text-surface-400">({product.reviewCount} reviews)</span>
          </div>
          
          <div className="mb-8">
            <span className="text-4xl font-bold gradient-text">${(Number(product.price) || 0).toFixed(2)}</span>
            {product.compareAtPrice && (
              <span className="text-surface-500 line-through ml-4 text-xl">${(Number(product.compareAtPrice) || 0).toFixed(2)}</span>
            )}
          </div>

          <p className="text-surface-300 text-lg mb-8 leading-relaxed">{product.description}</p>

          <div className="glass rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Specifications</h3>
            <div className="space-y-3">
              {Object.entries(product.specs || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-surface-800 pb-2">
                  <span className="text-surface-400 capitalize">{key}</span>
                  <span className="text-white font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-auto">
            <div className="flex items-center glass rounded-xl px-4 h-14">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-white hover:text-primary-400 px-2">-</button>
              <span className="text-white font-bold w-8 text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="text-white hover:text-primary-400 px-2">+</button>
            </div>
            <Button onClick={handleAddToCart} size="lg" className="flex-1 h-14 glow-sm" disabled={product.stock === 0}>
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
          
          <div className="mt-6 flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${product.stock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-surface-300">
              {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Currently out of stock'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <h2 className="text-3xl font-bold text-white mb-10">Customer Reviews</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {product.reviews?.length > 0 ? (
              product.reviews.map(review => <ReviewCard key={review.id} review={review} />)
            ) : (
              <p className="text-surface-400">No reviews yet. Be the first to review this product!</p>
            )}
          </div>
          <div>
            {isAuthenticated ? (
              <div className="glass p-6 rounded-2xl sticky top-24">
                <h3 className="text-xl font-bold text-white mb-4">Write a Review</h3>
                <ReviewForm productId={product.id} />
              </div>
            ) : (
              <div className="glass p-6 rounded-2xl text-center">
                <p className="text-surface-300 mb-4">Please sign in to write a review.</p>
                <Button variant="outline" onClick={() => window.location.href = '/login'}>Sign In</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
