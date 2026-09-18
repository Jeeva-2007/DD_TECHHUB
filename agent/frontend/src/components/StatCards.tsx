import React, { useEffect, useState } from 'react';
import { AlertCircle, AlertOctagon, Activity, CheckCircle2 } from 'lucide-react';

interface StatItem {
  id: string;
  label: string;
  value: number;
  icon: React.ElementType;
  badge: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface StatCardsProps {
  activeCount?: number;
  criticalCount?: number;
  investigatingCount?: number;
  resolvedCount?: number;
  onCardClick?: (statId: string) => void;
}

const AnimatedCounter: React.FC<{ target: number }> = ({ target }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 900;
    const stepTime = 30;
    const steps = duration / stepTime;
    const increment = (target - start) / steps;

    const timer = setInterval(() => {
      start += increment;
      if ((increment > 0 && start >= target) || (increment <= 0 && start <= target)) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target]);

  return <span>{count}</span>;
};

export const StatCards: React.FC<StatCardsProps> = ({
  activeCount = 12,
  criticalCount = 3,
  investigatingCount = 5,
  resolvedCount = 28,
  onCardClick
}) => {
  const stats: StatItem[] = [
    {
      id: 'active',
      label: 'Active Incidents',
      value: activeCount,
      icon: AlertCircle,
      badge: '+2 last hour',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50/70',
      borderColor: 'border-blue-100'
    },
    {
      id: 'critical',
      label: 'Critical Incidents',
      value: criticalCount,
      icon: AlertOctagon,
      badge: 'High Priority',
      color: 'text-red-600',
      bgColor: 'bg-red-50/70',
      borderColor: 'border-red-100'
    },
    {
      id: 'investigating',
      label: 'Investigating',
      value: investigatingCount,
      icon: Activity,
      badge: 'AI Active',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50/70',
      borderColor: 'border-amber-100'
    },
    {
      id: 'resolved',
      label: 'Resolved Today',
      value: resolvedCount,
      icon: CheckCircle2,
      badge: '98.4% Success',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50/70',
      borderColor: 'border-emerald-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            onClick={() => onCardClick && onCardClick(item.id)}
            className={`bg-white rounded-2xl border ${item.borderColor} p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                {item.label}
              </span>
              <div className={`w-9 h-9 rounded-xl ${item.bgColor} ${item.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                <AnimatedCounter target={item.value} />
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${item.bgColor} ${item.color}`}>
                {item.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
