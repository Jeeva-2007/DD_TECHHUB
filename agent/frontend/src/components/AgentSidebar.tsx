import React from 'react';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Settings, 
  Network, 
  Radio
} from 'lucide-react';

export type AgentTab = 'dashboard' | 'incidents' | 'investigation' | 'approvals' | 'audit' | 'settings';

interface AgentSidebarProps {
  activeTab: AgentTab;
  setActiveTab: (tab: AgentTab) => void;
  pendingApprovalsCount?: number;
}

export const AgentSidebar: React.FC<AgentSidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingApprovalsCount = 1
}) => {
  const navItems = [
    { id: 'dashboard' as AgentTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'incidents' as AgentTab, label: 'Incidents', icon: AlertTriangle, badge: '3' },
    { id: 'investigation' as AgentTab, label: 'Investigations', icon: Sparkles },
    { id: 'approvals' as AgentTab, label: 'Approvals', icon: ShieldCheck, badge: pendingApprovalsCount > 0 ? String(pendingApprovalsCount) : undefined, badgeColor: 'bg-amber-500' },
    { id: 'audit' as AgentTab, label: 'Audit Trail', icon: Clock },
    { id: 'settings' as AgentTab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-blue-100 flex flex-col justify-between h-screen sticky top-0 z-30 select-none shadow-sm">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {/* AI Connected Nodes Logo */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 relative overflow-hidden group">
              <Network className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-slate-900 tracking-tight">DD TECHHUB</span>
              </div>
              <span className="text-[11px] font-bold text-blue-600 tracking-wider uppercase block -mt-0.5">
                AI INCIDENT AGENT
              </span>
            </div>
          </div>
          <p className="text-[10px] font-medium text-slate-400 mt-2 tracking-wide uppercase">
            Autonomous Incident Resolution
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200/80'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full shadow-sm" />
                )}
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'
                  }`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white shadow-xs ${
                    item.badgeColor || 'bg-blue-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer AI Online Indicator */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="relative flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-extrabold text-slate-800">AI Agent Online</span>
            </div>
            <span className="text-[10px] font-medium text-slate-400 block">
              Autonomous Loop Active
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
