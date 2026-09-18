import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Truck, Package, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { orderService } from '../services/api';

export const OrderSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const paymentId = sessionStorage.getItem('last_payment_id') || 'PAY-10001';
  const activeOrderId = sessionStorage.getItem('active_order_id') || 'ORD-1001';

  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderService.get(activeOrderId);
        setOrder(res.data);
      } catch (err) {
        console.error('Failed to fetch order details', err);
      }
    };
    fetchOrder();
  }, [activeOrderId]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full text-center">
        
        <div className="w-20 h-20 mx-auto rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-6 shadow-lg shadow-green-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Payment Successful</h1>
        <p className="text-sm font-semibold text-green-600 mt-2">
          Your order has been placed successfully!
        </p>

        {/* Details Card */}
        <div className="mt-8 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm text-left max-w-2xl mx-auto">
          
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Order Reference</span>
              <p className="text-base font-extrabold text-slate-900">{activeOrderId}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Payment Reference</span>
              <p className="text-base font-extrabold text-blue-600">{paymentId}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Amount</span>
              <p className="text-base font-extrabold text-slate-900">
                ₹{order ? order.total_amount.toLocaleString('en-IN') : '59,990'}
              </p>
            </div>
          </div>

          {/* Expected Delivery Alert */}
          <div className="my-6 p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center gap-3">
            <Truck className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <span className="block text-xs font-bold text-slate-900">Expected Express Delivery</span>
              <span className="text-[11px] text-slate-500">By Tomorrow, 8:00 PM via BlueDart Courier</span>
            </div>
          </div>

          {/* Telegram Payment Dispatch Alert */}
          <div className="my-6 p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shrink-0">
              ✈️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="block text-xs font-bold text-slate-900">Telegram Instant Payment Dispatch</span>
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-extrabold">SENT</span>
              </div>
              <span className="text-[11px] text-slate-600">
                Payment receipt with Order Ref <strong className="text-slate-800">{activeOrderId}</strong> &amp; Payment Ref <strong className="text-slate-800">{paymentId}</strong> sent automatically to Telegram (<span className="font-semibold text-sky-700">+91 {sessionStorage.getItem('notified_phone') || '9080189795'}</span>).
              </span>
            </div>
          </div>

          {/* Order Tracker Stepper */}
          <div className="mt-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-6">Live Order Status Tracker</h3>
            
            <div className="relative flex items-center justify-between">
              
              {/* Step 1: Confirmed */}
              <div className="flex flex-col items-center relative z-10">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/30">
                  ✓
                </div>
                <span className="text-xs font-bold text-slate-900 mt-2">Confirmed</span>
                <span className="text-[10px] text-slate-400">Just Now</span>
              </div>

              {/* Step 2: Processing */}
              <div className="flex flex-col items-center relative z-10">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 border-2 border-blue-600 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <span className="text-xs font-bold text-blue-600 mt-2">Processing</span>
                <span className="text-[10px] text-slate-400">In Progress</span>
              </div>

              {/* Step 3: Shipped */}
              <div className="flex flex-col items-center relative z-10">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 border-2 border-slate-200 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <span className="text-xs font-bold text-slate-400 mt-2">Shipped</span>
                <span className="text-[10px] text-slate-400">Pending</span>
              </div>

              {/* Step 4: Delivered */}
              <div className="flex flex-col items-center relative z-10">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 border-2 border-slate-200 flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <span className="text-xs font-bold text-slate-400 mt-2">Delivered</span>
                <span className="text-[10px] text-slate-400">Tomorrow</span>
              </div>

            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100 flex justify-center gap-4">
            <Link
              to="/products"
              className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};
