import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { Order } from "../types";
import { Package, Calendar, Tag, CheckCircle } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders").then(setOrders).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20">Loading your orders...</div>;
  if (orders.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
        <Package className="mx-auto text-gray-200 mb-6" size={64} />
        <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">No orders yet</h2>
        <p className="text-gray-500 mb-8">Your order history will appear here once you make a purchase.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-black text-gray-900 mb-12 uppercase tracking-tight">Order History</h1>
      
      <div className="space-y-8">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-100">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Order #{order.id}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 font-bold uppercase tracking-widest">
                    <Calendar size={12} />
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total Paid</span>
                <span className="text-2xl font-black text-indigo-600">₹{order.total_price.toFixed(2)}</span>
              </div>
            </div>

            {/* Items */}
            <div className="p-6">
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                        <Tag size={18} />
                      </div>
                      <span className="font-bold text-gray-900">{item.name}</span>
                    </div>
                    <span className="font-black text-gray-900">₹{item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex items-center gap-2 text-green-600 font-bold text-sm bg-green-50 px-4 py-2 rounded-xl border border-green-100 w-fit">
                <CheckCircle size={16} />
                Delivered & Completed
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
