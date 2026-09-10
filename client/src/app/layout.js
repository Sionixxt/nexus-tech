import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'NexusTech — Premium Tech Store',
    template: '%s | NexusTech',
  },
  description: 'Discover cutting-edge technology products. Premium laptops, smartphones, audio, wearables and accessories from the world\'s leading brands.',
  keywords: ['tech', 'electronics', 'premium', 'laptops', 'smartphones', 'audio', 'wearables'],
  openGraph: {
    title: 'NexusTech — Premium Tech Store',
    description: 'Discover cutting-edge technology products.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(15, 15, 35, 0.9)',
              backdropFilter: 'blur(20px)',
              color: '#f4f4f5',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#06b6d4', secondary: '#0f0f23' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#0f0f23' },
            },
          }}
        />
      </body>
    </html>
  );
}
