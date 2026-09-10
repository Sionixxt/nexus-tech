'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

// Mock Input component if actual one isn't provided
const Input = ({ label, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm text-white/70 mb-1">{label}</label>}
    <input 
      className="w-full bg-surface-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors"
      {...props} 
    />
  </div>
);

export default function PaymentForm({ total = 0, onPaymentComplete, onSubmit, isProcessing = false }) {
  const [localProcessing, setLocalProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setLocalProcessing(false);
      const paymentId = 'sim_payment_' + Math.random().toString(36).substring(2, 9);
      if (onPaymentComplete) {
        onPaymentComplete(paymentId);
      }
      if (onSubmit) {
        onSubmit(paymentId);
      }
    }, 2000);
  };

  const loading = isProcessing || localProcessing;

  return (
    <div className="glass rounded-2xl p-6 relative overflow-hidden">
      <h3 className="text-xl font-bold text-white mb-6">Payment Details</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Input 
            label="Card Number" 
            name="cardNumber"
            placeholder="0000 0000 0000 0000" 
            value={formData.cardNumber}
            onChange={handleChange}
            required
            maxLength={19}
          />
          <div className="absolute right-3 top-[34px] text-white/40">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 10H22" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Expiry Date" 
            name="expiry"
            placeholder="MM/YY" 
            value={formData.expiry}
            onChange={handleChange}
            required
            maxLength={5}
          />
          <Input 
            label="CVC" 
            name="cvc"
            placeholder="123" 
            value={formData.cvc}
            onChange={handleChange}
            required
            maxLength={4}
            type="password"
          />
        </div>

        <Input 
          label="Cardholder Name" 
          name="name"
          placeholder="John Doe" 
          value={formData.name}
          onChange={handleChange}
          required
        />

        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-6 bg-primary-600 hover:bg-primary-500 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Pay ${(Number(total) || 0).toFixed(2)}
            </>
          )}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-white/40">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          SSL Secured
        </div>
        <div className="w-1 h-1 rounded-full bg-white/20" />
        <div>256-bit encryption</div>
      </div>
    </div>
  );
}

export { PaymentForm };
