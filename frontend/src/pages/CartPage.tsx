import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useCart } from '../context/CartContext';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart } = useCart();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Shopping Cart</h1>

        {cart.items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Your cart is empty</h2>
            <p className="text-xs text-slate-500 mt-2">Explore our laptops and tech accessories to get started.</p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-500/20"
            >
              Shop Catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div key={item.item_id} className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex items-center gap-4 shadow-sm">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl bg-slate-50 shrink-0"
                  />
                  
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">₹{item.price.toLocaleString('en-IN')}</p>
                    
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.item_id, item.quantity - 1)}
                          className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.item_id, item.quantity + 1)}
                          className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.item_id)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Summary Card */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm sticky top-24">
              <h3 className="text-base font-bold text-slate-900 pb-4 border-b border-slate-100">Order Summary</h3>
              
              <div className="space-y-3 py-4 border-b border-slate-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{cart.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge</span>
                  <span className="font-semibold text-slate-900">
                    {cart.delivery_charge === 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹${cart.delivery_charge}`}
                  </span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-bold">-₹{cart.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-baseline py-4">
                <span className="text-sm font-bold text-slate-900">Total Amount</span>
                <span className="text-2xl font-extrabold text-blue-600">
                  ₹{cart.total.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all mt-2"
              >
                PROCEED TO CHECKOUT
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Secure 256-bit encrypted enterprise checkout</span>
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
