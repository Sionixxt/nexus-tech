'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminDashboard() {
  const { user } = useAuth({ required: true, role: 'ADMIN' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-surface-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h1>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {[
                { label: 'Total Revenue', value: `$${data?.revenue || '0.00'}`, color: 'text-green-400' },
                { label: 'Total Orders', value: data?.ordersCount || 0, color: 'text-blue-400' },
                { label: 'Total Products', value: data?.productsCount || 0, color: 'text-purple-400' },
                { label: 'Total Customers', value: data?.customersCount || 0, color: 'text-orange-400' }
              ].map((stat, i) => (
                <div key={i} className="glass rounded-2xl p-6">
                  <p className="text-surface-400 text-sm font-medium mb-2">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Recent Orders</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-surface-800 text-surface-400 text-sm">
                        <th className="pb-3 font-medium">Order #</th>
                        <th className="pb-3 font-medium">Customer</th>
                        <th className="pb-3 font-medium">Items</th>
                        <th className="pb-3 font-medium">Total</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {(data?.recentOrders || []).map((order) => (
                        <tr key={order.id} className="border-b border-surface-800/50 hover:bg-surface-800/20 transition-colors">
                          <td className="py-4 text-white font-mono">{order.id}</td>
                          <td className="py-4 text-surface-300">{order.customerName}</td>
                          <td className="py-4 text-white font-medium">${(Number(order.total || order.totalAmount) || 0).toFixed(2)}</td>
                          <td className="py-4"><Badge>{order.status}</Badge></td>
                          <td className="py-4 text-surface-400">{order.date || order.createdAt ? new Date(order.date || order.createdAt).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Monthly Revenue</h2>
                <div className="flex items-end h-64 gap-2 pt-4">
                  {(data?.monthlyRevenue || [10, 20, 30, 25, 40, 60, 50]).map((val, i) => (
                    <div key={i} className="flex-1 bg-primary-500/20 hover:bg-primary-500/40 rounded-t-md transition-colors relative group" style={{ height: `${val}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-surface-800 text-xs px-2 py-1 rounded text-white transition-opacity">
                        ${val}k
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
