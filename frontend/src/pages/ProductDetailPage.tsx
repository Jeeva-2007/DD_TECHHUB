import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, ShoppingCart, Zap, ShieldCheck, Truck, Cpu, HardDrive, Monitor, Layers, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Product } from '../types';
import { productService } from '../services/api';
import { useCart } from '../context/CartContext';

export const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [addedToast, setAddedToast] = useState<boolean>(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        const res = await productService.get(productId);
        setProduct(res.data);
      } catch (err) {
        console.error('Failed to load product detail', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (product) {
      await addToCart(product);
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 3000);
    }
  };

  const handleOrderNow = async () => {
    if (product) {
      await addToCart(product);
      navigate('/checkout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400 font-semibold">
          Loading technical specifications...
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
          <Link to="/products" className="text-xs font-bold text-blue-600 mt-2 inline-block">Back to Products</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Breadcrumb / Back button */}
        <Link to="/products" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </Link>

        {addedToast && (
          <div className="mb-6 p-4 rounded-2xl bg-blue-600 text-white text-xs font-bold flex items-center justify-between shadow-xl shadow-blue-500/20">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Added {product.name} to your cart successfully!</span>
            </div>
            <Link to="/cart" className="underline hover:text-blue-100">View Cart</Link>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-100 p-6 lg:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Product Image */}
          <div className="space-y-4">
            <div className="aspect-[4/3] rounded-2xl bg-slate-50 overflow-hidden border border-slate-100">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <Truck className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <span className="block text-[10px] font-bold text-slate-800">Fast Shipping</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <ShieldCheck className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <span className="block text-[10px] font-bold text-slate-800">Brand Warranty</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <Zap className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <span className="block text-[10px] font-bold text-slate-800">Easy Returns</span>
              </div>
            </div>
          </div>

          {/* Right Specifications & Details */}
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {product.rating} / 5.0
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 mt-3">{product.name}</h1>
            
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-slate-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                Inclusive of all taxes
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-4 leading-relaxed">
              {product.description}
            </p>

            {/* Technical Specifications Grid */}
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Technical Specifications</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {product.processor && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Processor</span>
                    <span className="font-semibold text-slate-800">{product.processor}</span>
                  </div>
                )}
                {product.ram && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">RAM Memory</span>
                    <span className="font-semibold text-slate-800">{product.ram}</span>
                  </div>
                )}
                {product.storage && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Storage</span>
                    <span className="font-semibold text-slate-800">{product.storage}</span>
                  </div>
                )}
                {product.display && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Display</span>
                    <span className="font-semibold text-slate-800">{product.display}</span>
                  </div>
                )}
                {product.graphics && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Graphics</span>
                    <span className="font-semibold text-slate-800">{product.graphics}</span>
                  </div>
                )}
                {product.os && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Operating System</span>
                    <span className="font-semibold text-slate-800">{product.os}</span>
                  </div>
                )}
                {product.warranty && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Warranty</span>
                    <span className="font-semibold text-slate-800">{product.warranty}</span>
                  </div>
                )}
                {product.delivery && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Delivery</span>
                    <span className="font-semibold text-slate-800">{product.delivery}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons: ADD TO CART and ORDER NOW */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-4 px-6 rounded-2xl bg-white hover:bg-slate-100 border-2 border-blue-600 text-blue-600 font-extrabold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                ADD TO CART
              </button>

              <button
                onClick={handleOrderNow}
                className="flex-1 py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25 active:scale-95 transition-all"
              >
                ORDER NOW
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
