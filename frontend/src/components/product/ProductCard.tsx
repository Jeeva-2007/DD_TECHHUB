import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-white/90 backdrop-blur-md text-blue-600 border border-blue-100 shadow-sm">
            {product.category}
          </span>
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full text-[11px] font-bold text-amber-600 flex items-center gap-1 shadow-sm">
          <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
          {product.rating}
        </div>
      </div>

      {/* Product Information */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/products/${product.product_id}`} className="block">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {product.processor && (
            <p className="text-xs font-semibold text-blue-600 mt-1">
              {product.processor} • {product.ram} • {product.storage}
            </p>
          )}

          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">Special Price</span>
            <span className="text-lg font-extrabold text-slate-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex gap-2">
            <Link
              to={`/products/${product.product_id}`}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-xs font-semibold flex items-center justify-center"
              title="View Specs"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => addToCart(product)}
              className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
