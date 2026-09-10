'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  useEffect(() => {
    api.get('/admin/orders')
      .then(res => setOrders(res.data.orders || []))
      .catch(console.error);
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
      toast.success('Order status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500';
      case 'processing': return 'bg-blue-500/10 text-blue-500';
      case 'shipped': return 'bg-purple-500/10 text-purple-500';
      case 'delivered': return 'bg-green-500/10 text-green-500';
      case 'cancelled': return 'bg-red-500/10 text-red-500';
      default: return 'bg-surface-700 text-surface-300';
    }
  };

  return (
    <div className="flex min-h-screen bg-surface-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Orders Management</h1>

        <div className="glass rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <input type="text" placeholder="Search order number..." className="bg-surface-900 border border-surface-700 text-white rounded-lg px-4 py-2 w-64 focus:outline-none focus:border-primary-500" />
            <select className="bg-surface-900 border border-surface-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

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
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-surface-800/50 hover:bg-surface-800/20 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                    <td className="py-4 text-white font-mono">{order.id}</td>
                    <td className="py-4">
                      <div className="text-white font-medium">{order.customerName}</div>
                      <div className="text-surface-400 text-xs">{order.customerEmail}</div>
                    </td>
                    <td className="py-4 text-white font-medium">${(Number(order.total || order.totalAmount) || 0).toFixed(2)}</td>
                    <td className="py-4">
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    </td>
                    <td className="py-4 text-surface-400">{order.date || order.createdAt ? new Date(order.date || order.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td className="py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <select 
                        value={order.status} 
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="bg-surface-900 border border-surface-700 text-white rounded px-2 py-1 text-xs focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order Details: ${selectedOrder?.id}`}>
        {selectedOrder && (
          <div className="py-4 space-y-6 text-surface-300">
            <div className="flex justify-between border-b border-surface-800 pb-4">
              <div>
                <h4 className="text-white font-bold mb-1">Customer</h4>
                <p>{selectedOrder.customerName}</p>
                <p className="text-sm">{selectedOrder.customerEmail}</p>
              </div>
              <div className="text-right">
                <h4 className="text-white font-bold mb-1">Status</h4>
                <Badge className={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Badge>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3">Items</h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.qty || item.quantity || 1}x {item.name || item.productName}</span>
                    <span className="text-white">${((Number(item.price || item.unitPrice) || 0) * (Number(item.qty || item.quantity) || 1)).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 pt-4 border-t border-surface-800 font-bold text-white text-lg">
                <span>Total</span>
                <span>${(Number(selectedOrder.total || selectedOrder.totalAmount) || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
