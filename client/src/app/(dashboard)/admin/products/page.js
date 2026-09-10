'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import api from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    api.get('/admin/products')
      .then(res => setProducts(res.data.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-surface-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Products Management</h1>
          <Button onClick={() => setIsModalOpen(true)} className="glow-sm">+ Add Product</Button>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex gap-4 mb-6">
            <Input placeholder="Search products..." className="max-w-md" />
            <Button variant="outline">Filter</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-800 text-surface-400 text-sm">
                  <th className="pb-3 font-medium">Image</th>
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">SKU</th>
                  <th className="pb-3 font-medium">Price</th>
                  <th className="pb-3 font-medium">Stock</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-surface-800/50 hover:bg-surface-800/20 transition-colors">
                    <td className="py-3">
                      <div className="w-12 h-12 bg-surface-800 rounded-lg relative overflow-hidden">
                        <Image src={product.image || '/placeholder.png'} alt={product.name} fill className="object-cover" />
                      </div>
                    </td>
                    <td className="py-3 text-white font-medium">{product.name}</td>
                    <td className="py-3 text-surface-400 font-mono">{product.sku}</td>
                    <td className="py-3 text-white">${product.price.toFixed(2)}</td>
                    <td className="py-3 text-surface-300">{product.stock}</td>
                    <td className="py-3 text-surface-300">{product.category}</td>
                    <td className="py-3">
                      <Badge className={product.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-surface-700 text-surface-300'}>
                        {product.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <button className="text-primary-400 hover:text-primary-300 mr-3 text-sm font-medium">Edit</button>
                      <button className="text-red-400 hover:text-red-300 text-sm font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Product">
        <div className="space-y-4 py-4">
          <Input label="Product Name" placeholder="Enter product name" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price" type="number" placeholder="0.00" />
            <Input label="Stock" type="number" placeholder="0" />
          </div>
          <Input label="Category" placeholder="e.g. Laptops" />
          <Button className="w-full mt-4">Save Product</Button>
        </div>
      </Modal>
    </div>
  );
}
