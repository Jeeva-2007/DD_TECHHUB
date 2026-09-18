import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, ShieldCheck, User, Phone, Home, Building, Hash } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/api';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.name || 'Demo Customer');
  const [mobile, setMobile] = useState(user?.mobile || '+91 9876543210');
  const [address, setAddress] = useState('Flat 402, Tech Towers, Cyber City');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560100');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !mobile || !address || !city || !state || !pincode) {
      alert('Please complete all delivery address fields.');
      return;
    }

    try {
      setLoading(true);
      const orderPayload = {
        user_id: user?.user_id || 'USR-101',
        total_amount: cart.total,
        items: cart.items.map((it) => ({
          product_id: it.product_id,
          product_name: it.name,
          quantity: it.quantity,
          price: it.price
        })),
        address: { fullName, mobile, address, city, state, pincode }
      };

      const res = await orderService.create(orderPayload);
      if (res.data.success) {
        // Save created order_id for payment step
        sessionStorage.setItem('active_order_id', res.data.order_id);
        navigate('/payment');
      }
    } catch (err) {
      console.error('Order creation failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Checkout & Shipping</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Delivery Address Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 pb-6 mb-6 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Delivery Address</h2>
                <p className="text-xs text-slate-500">Enter location for express shipment delivery</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Mobile Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Street Address</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
                  />
                  <Home className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">City</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
                  />
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">State</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Pincode</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
                  />
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Order Summary */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm sticky top-24">
            <h3 className="text-base font-bold text-slate-900 pb-4 border-b border-slate-100">Order Items</h3>
            
            <div className="divide-y divide-slate-100 py-3 max-h-60 overflow-y-auto">
              {cart.items.map((it) => (
                <div key={it.item_id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="pr-2">
                    <p className="font-bold text-slate-800 line-clamp-1">{it.name}</p>
                    <p className="text-slate-400">Qty: {it.quantity}</p>
                  </div>
                  <span className="font-semibold text-slate-900 shrink-0">
                    ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 py-4 border-t border-b border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">₹{cart.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span className="font-bold text-green-600">FREE</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-bold">-₹{cart.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-baseline py-4">
              <span className="text-sm font-bold text-slate-900">Total Payable</span>
              <span className="text-2xl font-extrabold text-blue-600">
                ₹{cart.total.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {loading ? 'Processing Order...' : 'CONTINUE TO PAYMENT'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>
      </main>

      <Footer />
    </div>
  );
};
