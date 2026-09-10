'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/stores/cartStore';
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps';
import { PaymentForm } from '@/components/checkout/PaymentForm';
import { CartSummary } from '@/components/cart/CartSummary';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function CheckoutPage() {
  const { user } = useAuth({ required: true });
  const { items, clearCart, getTotal } = useCartStore();
  const router = useRouter();
  const total = typeof getTotal === 'function' ? (getTotal() || 0) : 0;
  
  const [step, setStep] = useState(1);
  const [shippingInfo, setShippingInfo] = useState({ name: '', street: '', city: '', state: '', zip: '', country: '' });
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const handleShippingChange = (e) => setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });

  const handleCompletePayment = async (paymentDetails) => {
    try {
      const res = await api.post('/orders', {
        items,
        shippingInfo,
        shippingMethod,
        paymentDetails
      });
      setOrderNumber(res.data?.orderNumber || `ORD-${Math.floor(Math.random() * 100000)}`);
      setIsSuccess(true);
      clearCart();
    } catch (err) {
      toast.error('Payment failed. Please try again.');
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass rounded-3xl p-12 text-center max-w-lg w-full">
          <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Order Confirmed!</h1>
          <p className="text-surface-300 mb-6">Thank you for your purchase. Your order number is <span className="text-primary-400 font-mono font-bold">{orderNumber}</span>.</p>
          <Link href="/products">
            <Button className="w-full">Continue Shopping</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <section className="container mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <CheckoutSteps currentStep={step} />
          
          <div className="glass rounded-2xl p-8 mt-8">
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-xl font-bold text-white">Shipping Information</h2>
                <Input label="Full Name" name="name" value={shippingInfo.name} onChange={handleShippingChange} required />
                <Input label="Street Address" name="street" value={shippingInfo.street} onChange={handleShippingChange} required />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City" name="city" value={shippingInfo.city} onChange={handleShippingChange} required />
                  <Input label="State/Province" name="state" value={shippingInfo.state} onChange={handleShippingChange} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="ZIP/Postal Code" name="zip" value={shippingInfo.zip} onChange={handleShippingChange} required />
                  <Input label="Country" name="country" value={shippingInfo.country} onChange={handleShippingChange} required />
                </div>
                <Button className="w-full mt-4" onClick={() => setStep(2)}>Continue to Delivery</Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-4">Delivery Method</h2>
                <div className="space-y-4">
                  {[
                    { id: 'standard', name: 'Standard Shipping', price: '$9.99', time: '3-5 business days' },
                    { id: 'express', name: 'Express Shipping', price: '$19.99', time: '1-2 business days' }
                  ].map(method => (
                    <div 
                      key={method.id} 
                      onClick={() => setShippingMethod(method.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${shippingMethod === method.id ? 'border-primary-500 bg-primary-500/10' : 'border-surface-700 hover:border-surface-600'}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-white">{method.name}</span>
                        <span className="text-primary-400 font-bold">{method.price}</span>
                      </div>
                      <p className="text-sm text-surface-400">Estimated delivery: {method.time}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="w-1/3">Back</Button>
                  <Button onClick={() => setStep(3)} className="w-2/3">Continue to Payment</Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-4">Payment</h2>
                <PaymentForm total={total} onPaymentComplete={handleCompletePayment} onSubmit={handleCompletePayment} />
                <Button variant="outline" onClick={() => setStep(2)} className="w-full mt-4">Back to Delivery</Button>
              </motion.div>
            )}
          </div>
        </div>

        <div>
          <div className="sticky top-24">
            <CartSummary />
          </div>
        </div>
      </div>
    </section>
  );
}
