import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Laptop, Grid } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ProductCard } from '../components/product/ProductCard';
import { Product } from '../types';
import { productService } from '../services/api';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'All';
  const searchParam = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [searchQuery, setSearchQuery] = useState<string>(searchParam);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await productService.list(
          selectedCategory === 'All' ? undefined : selectedCategory,
          searchQuery || undefined
        );
        setProducts(res.data);
      } catch (err) {
        console.error('Error fetching products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    const newParams: any = {};
    if (cat !== 'All') newParams.category = cat;
    if (searchQuery) newParams.search = searchQuery;
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Catalog Products</h1>
            <p className="text-xs text-slate-500 mt-1">Explore our complete collection of laptops and accessories</p>
          </div>

          {/* Search bar inside products page */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Filter products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {['All', 'Laptops', 'Accessories'].map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-80 bg-slate-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 p-8">
            <Grid className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">No products found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your category filter or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
