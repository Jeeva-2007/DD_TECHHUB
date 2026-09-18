import React from 'react';
import { Server, CreditCard, Database, Cpu, ShieldCheck } from 'lucide-react';

export interface HealthService {
  name: string;
  category: string;
  status: 'healthy' | 'warning' | 'critical';
  latency: string;
  icon: React.ElementType;
  details: string;
}

export const SystemHealthCard: React.FC = () => {
  const services: HealthService[] = [
    {
      name: 'API Services',
      category: 'FastAPI Gateway',
      status: 'healthy',
      latency: '18ms',
      icon: Server,
      details: 'All REST router endpoints operational with zero response degradation.'
    },
    {
      name: 'Payment Service',
      category: 'Telegram AMT Gateway',
      status: 'warning',
      latency: '240ms',
      icon: CreditCard,
      details: 'DB lock timeout detected during high payment concurrency.'
    },
    {
      name: 'Database',
      category: 'SQLite Storage Engine',
      status: 'healthy',
      latency: '4ms',
      icon: Database,
      details: 'WAL journal mode enabled. Operational tables indexed.'
    },
    {
      name: 'Infrastructure',
      category: 'AI Microservice Loop',
      status: 'healthy',
      latency: '32ms',
      icon: Cpu,
      details: 'LangGraph runner connected to NVIDIA LLM inference endpoint.'
    }
  ];

  const getStatusBadge = (status: HealthService['status']) => {
    switch (status) {
      case 'healthy':
        return {
          label: 'Healthy',
          dotColor: 'bg-emerald-500',
          textColor: 'text-emerald-700',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200'
        };
      case 'warning':
        return {
          label: 'Warning',
          dotColor: 'bg-amber-500',
          textColor: 'text-amber-700',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200'
        };
      case 'critical':
        return {
          label: 'Critical',
          dotColor: 'bg-red-500',
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            System Health Overview
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </h3>
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">
            Real-time status of connected backend microservices
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          99.9% Uptime
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((service, idx) => {
          const Icon = service.icon;
          const badge = getStatusBadge(service.status);
          return (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-xs transition-all duration-200 group relative"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center group-hover:border-blue-300 group-hover:text-blue-600 transition-colors">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">{service.name}</span>
                </div>

                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${badge.bgColor} ${badge.textColor} border ${badge.borderColor} text-[10px] font-extrabold`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                  {badge.label}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-200/60">
                <span className="text-slate-400 font-medium">{service.category}</span>
                <span className="font-extrabold text-slate-800">{service.latency}</span>
              </div>

              {/* Hover Details Tooltip */}
              <div className="absolute left-0 right-0 bottom-full mb-2 p-2.5 rounded-xl bg-slate-900 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-lg">
                {service.details}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
