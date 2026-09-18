import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Laptop, CheckCircle2, Clock, Bot, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface OrderItem {
  product_id: str;
  product_name: str;
  quantity: number;
  price: number;
}

interface Order {
  order_id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export const MyOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const userId = user?.user_id || sessionStorage.getItem('active_user_id') || 'usr_demo_customer';
      try {
        const res = await axios.get(`http://localhost:8000/api/orders/user/${userId}`);
        if (res.data.orders) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error("Failed to fetch user orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <Package className="w-7 h-7 text-blue-600" /> My Orders
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Track your e-commerce purchases and AI autonomous recoveries</p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-100"
          >
            Browse Products <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-sm font-semibold text-slate-600">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Orders Found Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">You haven't placed any orders yet. Explore our laptops catalog and place an order!</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
            >
              Shop Laptops Now
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isAiRecovered = order.status.includes('AI RECOVERED');
              return (
                <div
                  key={order.order_id}
                  className={`bg-white rounded-3xl border p-6 shadow-sm transition-all ${
                    isAiRecovered ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-black text-slate-900">Order ID:</span>
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                          {order.order_id}
                        </span>

                        {isAiRecovered ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-black">
                            <Bot className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> AI RECOVERED & PLACED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {order.status}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-slate-400 mt-1">
                        Placed on {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Amount</span>
                      <span className="text-lg font-black text-slate-900">₹{order.total_amount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="pt-4 space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shrink-0">
                            <Laptop className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-slate-800">{item.product_name}</span>
                            <span className="text-[11px] font-medium text-slate-500">Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-slate-900">₹{item.price.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  {/* AI Resolution Banner if recovered */}
                  {isAiRecovered && (
                    <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block font-bold">Autonomous Recovery Confirmation</span>
                        <span className="text-[11px] text-emerald-700">
                          This order was detected and auto-placed by the AI Incident Agent after resolving a database connection timeout.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
