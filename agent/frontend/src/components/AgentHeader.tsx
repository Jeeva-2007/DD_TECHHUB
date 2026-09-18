import React from 'react';
import { Search, Bell, RefreshCw, Terminal, ExternalLink } from 'lucide-react';

interface AgentHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AgentHeader: React.FC<AgentHeaderProps> = ({ onRefresh, isRefreshing = false }) => {
  return (
    <header className="bg-white border-b border-blue-100 sticky top-0 z-20 px-8 py-4 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Title and Subtitle */}
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Incident Resolution Center
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-extrabold uppercase tracking-wide">
              Live Ops
            </span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Monitor, investigate and resolve operational incidents with AI.
          </p>
        </div>

        {/* Right Search, Actions & Profile */}
        <div className="flex items-center gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search incidents, logs, services..."
              className="w-64 pl-9 pr-4 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all active:scale-95"
              title="Refresh Stream"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          )}

          {/* Shortcut to Simulator */}
          <a
            href="http://localhost:3000/admin/simulator"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 text-xs font-bold transition-all"
          >
            <Terminal className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Simulator</span>
          </a>

          {/* Storefront Link */}
          <a
            href="http://localhost:3000/home"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-sm transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Storefront</span>
          </a>

          {/* Notification Icon */}
          <button className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
              AI
            </div>
            <div className="hidden lg:block text-left">
              <span className="block text-xs font-extrabold text-slate-900 leading-tight">SRE Ops</span>
              <span className="block text-[10px] font-medium text-slate-400">Agent Engineer</span>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
