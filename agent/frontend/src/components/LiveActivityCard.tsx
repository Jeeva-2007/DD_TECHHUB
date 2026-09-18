import React from 'react';
import { Network, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export interface ActivityStep {
  id: string;
  label: string;
  status: 'completed' | 'active' | 'pending';
}

interface LiveActivityCardProps {
  statusText?: string;
  isInvestigating?: boolean;
  steps?: ActivityStep[];
  currentIncidentId?: string;
}

export const LiveActivityCard: React.FC<LiveActivityCardProps> = ({
  statusText = 'AI Agent is active & monitoring event logs...',
  isInvestigating = false,
  steps = [
    { id: '1', label: 'Alert received & event stream ingested', status: 'completed' },
    { id: '2', label: 'Related database timeout alerts correlated', status: 'completed' },
    { id: '3', label: 'Root cause identified: DB lock contention', status: 'completed' },
    { id: '4', label: 'Selecting remediation tool (restart_db_connections)', status: 'active' },
    { id: '5', label: 'Verifying service recovery & notification dispatch', status: 'pending' },
  ],
  currentIncidentId = 'INC-001'
}) => {
  return (
    <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-xs flex flex-col justify-between h-full">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Network className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">AI AGENT LIVE ACTIVITY</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-extrabold">
                  {isInvestigating ? 'INVESTIGATING' : 'ONLINE'}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-blue-600 mt-0.5">
                Target: <span className="font-mono text-slate-800 font-bold">{currentIncidentId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Nemotron 3.5</span>
          </div>
        </div>

        {/* Dynamic Activity Banner */}
        <div className="my-4 p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center gap-3">
          {isInvestigating ? (
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span className="text-xs font-bold text-slate-800 leading-tight">
            {statusText}
          </span>
        </div>

        {/* Live Steps List */}
        <div className="space-y-3 mt-4">
          {steps.map((step) => {
            return (
              <div key={step.id} className="flex items-center gap-3 text-xs font-semibold">
                {step.status === 'completed' && (
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                )}
                {step.status === 'active' && (
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </div>
                )}
                {step.status === 'pending' && (
                  <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 text-[10px]">
                    ○
                  </div>
                )}
                <span className={step.status === 'completed' ? 'text-slate-800' : step.status === 'active' ? 'text-blue-700 font-bold' : 'text-slate-400'}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
        <span>Execution Engine: LangGraph v0.2</span>
        <span className="text-emerald-600 font-extrabold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Auto-healing active
        </span>
      </div>

    </div>
  );
};
