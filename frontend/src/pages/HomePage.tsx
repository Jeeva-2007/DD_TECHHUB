import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Laptop, ArrowRight, ShieldCheck, Zap, Sparkles, Star, Cpu, HardDrive, Layers } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ProductCard } from '../components/product/ProductCard';
import { Product } from '../types';
import { productService } from '../services/api';
import { useCart } from '../context/CartContext';

export const HomePage: React.FC = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const res = await productService.list();
        setProducts(res.data);
        
        // Locate ASUS Vivobook 15 featured product
        const asus = res.data.find((p: Product) => p.product_id === 'PROD-ASUS-V15');
        if (asus) setFeaturedProduct(asus);
        else if (res.data.length > 0) setFeaturedProduct(res.data[0]);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const laptops = products.filter((p) => p.category === 'Laptops');
  const accessories = products.filter((p) => p.category === 'Accessories');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-slate-50 to-slate-50 py-16 lg:py-24 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Column Text */}
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-6 border border-blue-200 shadow-sm">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Enterprise Technology Selection 2026
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                  Upgrade Your <br />
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
                    Tech Performance.
                  </span>
                </h1>

                <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                  Powerful laptops for work, study, creativity and entertainment. Engineered for reliability, speed, and seamless everyday efficiency.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    to="/products?category=Laptops"
                    className="px-7 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-xl shadow-blue-500/25 flex items-center gap-2.5 active:scale-95 transition-all"
                  >
                    SHOP LAPTOPS
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to="/products"
                    className="px-7 py-4 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-extrabold text-sm shadow-sm transition-all"
                  >
                    EXPLORE DEALS
                  </Link>
                </div>

                {/* Key stats */}
                <div className="mt-12 grid grid-cols-3 gap-6 pt-8 border-t border-slate-200/80">
                  <div>
                    <span className="block text-2xl font-extrabold text-slate-900">100%</span>
                    <span className="text-xs font-medium text-slate-500">Genuine Warranty</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-extrabold text-slate-900">24 Hours</span>
                    <span className="text-xs font-medium text-slate-500">Express Delivery</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-extrabold text-slate-900">4.8★</span>
                    <span className="text-xs font-medium text-slate-500">Customer Rating</span>
                  </div>
                </div>
              </div>

              {/* Right Column Hero Banner Image */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-400/20 to-indigo-300/20 rounded-3xl blur-2xl pointer-events-none" />
                <div className="relative rounded-3xl bg-white p-4 shadow-2xl border border-slate-100 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80"
                    alt="ASUS Vivobook 15 Laptop"
                    className="w-full h-80 sm:h-96 object-cover rounded-2xl"
                  />
                  <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-lg flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Featured Laptop</span>
                      <h3 className="text-base font-bold text-slate-900">ASUS Vivobook 15</h3>
                      <p className="text-xs text-slate-500">Intel Core i5 • 16GB RAM • 512GB SSD</p>
                    </div>
                    <span className="text-lg font-extrabold text-slate-900">₹59,990</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* FEATURED PRODUCT HIGHLIGHT (ASUS VIVOBOOK 15) */}
        {featuredProduct && (
          <section className="py-16 bg-white border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-slate-50 rounded-3xl p-8 lg:p-12 border border-slate-200/80 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div className="relative">
                  <img
                    src={featuredProduct.image_url}
                    alt={featuredProduct.name}
                    className="w-full h-80 object-cover rounded-2xl shadow-md"
                  />
                  <div className="absolute top-4 left-4 bg-amber-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow">
                    ★ {featuredProduct.rating} Rating
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">Flagship Feature</span>
                  <h2 className="text-3xl font-extrabold text-slate-900 mt-2">{featuredProduct.name}</h2>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    {featuredProduct.processor} • {featuredProduct.ram} • {featuredProduct.storage}
                  </p>
                  
                  <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                    {featuredProduct.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                      <span className="block text-slate-400 font-medium">Display</span>
                      <span className="font-bold text-slate-800">{featuredProduct.display}</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                      <span className="block text-slate-400 font-medium">Warranty</span>
                      <span className="font-bold text-slate-800">{featuredProduct.warranty}</span>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <div>
                      <span className="block text-[11px] text-slate-400 uppercase font-semibold">Special Price</span>
                      <span className="text-3xl font-extrabold text-slate-900">
                        ₹{featuredProduct.price.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <Link
                        to={`/products/${featuredProduct.product_id}`}
                        className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                      >
                        VIEW DETAILS
                      </Link>
                      <button
                        onClick={() => addToCart(featuredProduct)}
                        className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-500/20"
                      >
                        ADD TO CART
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* LAPTOPS CATALOG SECTION */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Laptops & Workstations</h2>
                <p className="text-xs text-slate-500 mt-1">Discover high-performance laptops engineered for work & gaming</p>
              </div>
              <Link to="/products?category=Laptops" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-80 bg-slate-200 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {laptops.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ESSENTIAL ACCESSORIES SECTION */}
        <section className="py-16 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Laptop Accessories</h2>
                <p className="text-xs text-slate-500 mt-1">Mice, chargers, keyboards, cooling pads & more</p>
              </div>
              <Link to="/products?category=Accessories" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {accessories.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
