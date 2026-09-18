import React from 'react';
import { Laptop, ShieldCheck, Truck, Clock, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      
      {/* Value Proposition Badges */}
      <div className="border-b border-slate-100 py-8 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Express Delivery</h4>
              <p className="text-[11px] text-slate-500">Free delivery across India</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">100% Genuine Tech</h4>
              <p className="text-[11px] text-slate-500">Direct brand warranty</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Instant OTP Auth</h4>
              <p className="text-[11px] text-slate-500">Zero latency login</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">24/7 Tech Support</h4>
              <p className="text-[11px] text-slate-500">Dedicated assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Main Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Laptop className="w-5 h-5" />
            </div>
            <span className="text-lg font-extrabold text-slate-900">DD TECHHUB</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            Smart Tech. Simple Choice. Premium enterprise application environment for next-generation technology shopping.
          </p>
          <p className="text-[11px] text-slate-400">© 2026 DD TECHHUB Inc. All rights reserved.</p>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Product Categories</h4>
          <ul className="space-y-2 text-xs text-slate-600">
            <li><Link to="/products?category=Laptops" className="hover:text-blue-600">Laptops & Ultrabooks</Link></li>
            <li><Link to="/products?category=Accessories" className="hover:text-blue-600">Gaming & Accessories</Link></li>
            <li><Link to="/products?category=Accessories" className="hover:text-blue-600">Chargers & Power Banks</Link></li>
            <li><Link to="/products?category=Accessories" className="hover:text-blue-600">Cooling Pads & Stands</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Development Environment</h4>
          <ul className="space-y-2 text-xs text-slate-600">
            <li><Link to="/admin/simulator" className="text-blue-600 font-semibold hover:underline">Operational Failure Simulator</Link></li>
            <li><a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:text-blue-600">FastAPI Swagger Docs</a></li>
            <li><a href="http://localhost:8000/api/health" target="_blank" rel="noreferrer" className="hover:text-blue-600">Backend Health Endpoint</a></li>
            <li><a href="http://localhost:8000/api/events" target="_blank" rel="noreferrer" className="hover:text-blue-600">Operational Events Log</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Architecture Info</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Generates real operational event streams (OTP dispatches, payment authorizations, DB timeouts) stored in SQLite for AI investigation.
          </p>
        </div>
      </div>
    </footer>
  );
};
