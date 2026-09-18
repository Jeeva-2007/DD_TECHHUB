import React from 'react';
import { ArrowRight, AlertTriangle } from 'lucide-react';

export interface IncidentRecord {
  id: string;
  title: string;
  service: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';
  status: 'Investigating' | 'Resolved' | 'Action Required' | 'Pending';
  confidence: number;
  time: string;
}

interface IncidentsTableProps {
  incidents?: IncidentRecord[];
  onInvestigate: (incidentId: string) => void;
}

export const IncidentsTable: React.FC<IncidentsTableProps> = ({
  incidents = [
    {
      id: 'INC-001',
      title: 'Payment API Service Timeout',
      service: 'Payment Service',
      severity: 'HIGH',
      status: 'Investigating',
      confidence: 91,
      time: '02:41'
    },
    {
      id: 'INC-002',
      title: 'Database Connection Pool Exhausted',
      service: 'Database',
      severity: 'CRITICAL',
      status: 'Action Required',
      confidence: 95,
      time: '02:35'
    },
    {
      id: 'INC-003',
      title: 'OTP Dispatch High Latency',
      service: 'OTP Microservice',
      severity: 'MEDIUM',
      status: 'Resolved',
      confidence: 88,
      time: '02:30'
    },
    {
      id: 'INC-004',
      title: 'Checkout Cart State Timeout',
      service: 'API Gateway',
      severity: 'LOW',
      status: 'Resolved',
      confidence: 94,
      time: '02:15'
    }
  ],
  onInvestigate
}) => {

  const getSeverityBadge = (sev: IncidentRecord['severity']) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'LOW':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: IncidentRecord['status']) => {
    switch (status) {
      case 'Investigating':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Action Required':
        return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Pending':
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            Recent Incidents
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </h3>
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">
            Operational anomalies detected across DD TECHHUB backend services
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Total: {incidents.length} items</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
              <th className="py-3 px-4 rounded-l-xl">Incident ID</th>
              <th className="py-3 px-4">Incident</th>
              <th className="py-3 px-4">Service</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">AI Confidence</th>
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {incidents.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-blue-50/50 transition-colors group"
              >
                <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                  {row.id}
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-900">
                  {row.title}
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-600">
                  {row.service}
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-extrabold ${getSeverityBadge(row.severity)}`}>
                    {row.severity}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold ${getStatusBadge(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${row.confidence}%` }}
                      />
                    </div>
                    <span className="font-extrabold text-slate-800">{row.confidence}%</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-400">
                  {row.time}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => onInvestigate(row.id)}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-extrabold text-[11px] transition-all flex items-center gap-1.5 ml-auto active:scale-95 shadow-2xs"
                  >
                    <span>{row.status === 'Resolved' ? 'View' : 'Investigate'}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
