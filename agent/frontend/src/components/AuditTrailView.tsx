import React, { useEffect, useState } from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { monitoringService } from '../services/api';

export interface AuditEvent {
  id: string;
  time: string;
  event: string;
  service: string;
  action: string;
  tool: string;
  result: string;
  status: 'RESOLVED' | 'FAILED' | 'PENDING';
}

export const AuditTrailView: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>([
    {
      id: 'EVT-01',
      time: '02:41:14',
      event: 'Resolution Verified',
      service: 'payment-service',
      action: 'Verified HTTP 200 health check response',
      tool: 'health_check_verifier',
      result: 'DB capacity released (Latency 18ms)',
      status: 'RESOLVED'
    },
    {
      id: 'EVT-02',
      time: '02:41:11',
      event: 'Remediation Executed',
      service: 'database',
      action: 'Restarted database connection pool',
      tool: 'restart_db_connections',
      result: 'Lock contention cleared',
      status: 'RESOLVED'
    },
    {
      id: 'EVT-03',
      time: '02:41:08',
      event: 'Root Cause Identified',
      service: 'payment-service',
      action: 'Correlated 14 PAYMENT_DB_TIMEOUT events',
      tool: 'langgraph_analyzer',
      result: 'Root cause identified with 91% confidence',
      status: 'RESOLVED'
    },
    {
      id: 'EVT-04',
      time: '02:41:05',
      event: 'Related Alerts Correlated',
      service: 'api-gateway',
      action: 'Grouped checkout timeout events',
      tool: 'event_correlator',
      result: '1,247 checkout transactions grouped',
      status: 'RESOLVED'
    },
    {
      id: 'EVT-05',
      time: '02:41:03',
      event: 'Alert Received',
      service: 'payment-service',
      action: 'Ingested PAYMENT_GATEWAY_TIMEOUT payload',
      tool: 'webhook_receiver',
      result: 'Incident INC-001 created',
      status: 'RESOLVED'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const fetchLiveAuditEvents = async () => {
    try {
      setLoading(true);
      const res = await monitoringService.getEvents({ limit: 20 });
      if (res.data && Array.isArray(res.data)) {
        const live: AuditEvent[] = res.data.map((evt: any, i: number) => ({
          id: evt.event_id || `EVT-${i + 10}`,
          time: new Date(evt.timestamp || Date.now()).toLocaleTimeString(),
          event: evt.event_type || 'Operational Event',
          service: evt.service_name || 'backend-service',
          action: evt.error_message || 'Agent operation execution',
          tool: evt.dependency || 'agent-tool',
          result: evt.status || 'PROCESSED',
          status: evt.status === 'RESOLVED' || evt.status === 'SUCCESS' ? 'RESOLVED' : 'FAILED'
        }));
        if (live.length > 0) setEvents(live);
      }
    } catch (err) {
      console.log('Using default mock audit stream', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveAuditEvents();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-xs space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            Audit Trail &amp; Timeline
            <Clock className="w-4 h-4 text-blue-600" />
          </h3>
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">
            Complete chronological event stream &amp; AI tool execution record
          </p>
        </div>

        <button
          onClick={fetchLiveAuditEvents}
          disabled={loading}
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh Live Trail</span>
        </button>
      </div>

      {/* Timeline List */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-blue-100">
        {events.map((evt) => (
          <div key={evt.id} className="relative group">
            {/* Timeline dot */}
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] ring-4 ring-white shadow-xs">
              ✓
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-xs transition-all duration-200">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-slate-400">{evt.time}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-extrabold text-slate-900">{evt.event}</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-mono font-bold">
                    {evt.service}
                  </span>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                  {evt.status}
                </span>
              </div>

              <p className="text-xs font-bold text-slate-800 mb-1.5">{evt.action}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                <span>Executed Tool: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-blue-700 font-mono font-bold">{evt.tool}</code></span>
                <span>Result: <strong className="text-slate-800">{evt.result}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
