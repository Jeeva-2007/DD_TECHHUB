import React, { useState, useEffect } from 'react';
import { AgentSidebar, AgentTab } from '../components/AgentSidebar';
import { AgentHeader } from '../components/AgentHeader';
import { StatCards } from '../components/StatCards';
import { SystemHealthCard } from '../components/SystemHealthCard';
import { LiveActivityCard } from '../components/LiveActivityCard';
import { IncidentsTable, IncidentRecord } from '../components/IncidentsTable';
import { InvestigationView } from '../components/InvestigationView';
import { AuditTrailView } from '../components/AuditTrailView';
import { ShieldCheck, Settings, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { monitoringService } from '../services/api';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'warning' | 'info';
}

export const AgentDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AgentTab>('dashboard');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('INC-001');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Statistic state counts
  const [activeCount, setActiveCount] = useState(12);
  const [criticalCount, setCriticalCount] = useState(3);
  const [investigatingCount, setInvestigatingCount] = useState(5);
  const [resolvedCount, setResolvedCount] = useState(28);

  const [incidents, setIncidents] = useState<IncidentRecord[]>([
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
  ]);

  // Cursor position tracking for radial glow
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'info') => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    showToast('Refreshing live operational logs & AI agent stream...', 'info');
    try {
      await monitoringService.getEvents({ limit: 10 });
    } catch (err) {
      console.log('Stream refresh completed', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const handleInvestigateClick = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setActiveTab('investigation');
    showToast(`Opening AI Investigation for ${incidentId}...`, 'info');
  };

  const handleIncidentResolved = (resolvedId: string) => {
    setIncidents((prev) =>
      prev.map((item) =>
        item.id === resolvedId ? { ...item, status: 'Resolved' } : item
      )
    );
    setResolvedCount((c) => c + 1);
    setInvestigatingCount((c) => Math.max(0, c - 1));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex relative overflow-x-hidden font-sans text-slate-900">
      
      {/* Subtle radial cursor glow following mouse */}
      <div
        className="pointer-events-none fixed w-96 h-96 rounded-full bg-blue-500/10 blur-3xl z-10 transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${mousePos.x - 192}px, ${mousePos.y - 192}px, 0)`
        }}
      />

      {/* Left Sidebar */}
      <AgentSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingApprovalsCount={incidents.filter((i) => i.status === 'Action Required').length}
      />

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <AgentHeader onRefresh={handleRefresh} isRefreshing={isRefreshing} />

        {/* Dynamic Page View */}
        <main className="flex-1 p-8 space-y-8 max-w-7xl w-full mx-auto">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <>
              {/* 4 Stat Cards */}
              <StatCards
                activeCount={activeCount}
                criticalCount={criticalCount}
                investigatingCount={investigatingCount}
                resolvedCount={resolvedCount}
                onCardClick={(id) => {
                  if (id === 'investigating' || id === 'critical') setActiveTab('incidents');
                }}
              />

              {/* System Health */}
              <SystemHealthCard />

              {/* Grid: Live Activity & Incidents Table */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-5">
                  <LiveActivityCard
                    isInvestigating={activeTab === 'investigation'}
                    currentIncidentId={selectedIncidentId}
                  />
                </div>
                <div className="lg:col-span-7">
                  <IncidentsTable
                    incidents={incidents}
                    onInvestigate={handleInvestigateClick}
                  />
                </div>
              </div>

              {/* Audit Trail Section */}
              <AuditTrailView />
            </>
          )}

          {/* INCIDENTS TAB */}
          {activeTab === 'incidents' && (
            <div className="space-y-6">
              <IncidentsTable
                incidents={incidents}
                onInvestigate={handleInvestigateClick}
              />
            </div>
          )}

          {/* INVESTIGATION TAB */}
          {activeTab === 'investigation' && (
            <InvestigationView
              incidentId={selectedIncidentId}
              onBack={() => setActiveTab('dashboard')}
              onResolved={handleIncidentResolved}
              showToast={showToast}
            />
          )}

          {/* APPROVALS TAB */}
          {activeTab === 'approvals' && (
            <div className="bg-white rounded-2xl border border-blue-100 p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    Human-in-the-Loop Approvals
                    <ShieldCheck className="w-5 h-5 text-amber-500" />
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    High-risk remediation actions requiring manual engineer sign-off
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold">
                  1 Pending Request
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-amber-50/70 border-2 border-amber-200 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wide">REQUEST #REQ-APP-994</span>
                    <h3 className="text-sm font-extrabold text-slate-900 mt-1">Rollback Payment Service &amp; Flush Active Cache</h3>
                    <p className="text-xs font-medium text-slate-600 mt-1">
                      Reason: Database deadlock mitigation under high concurrent checkout authorization requests.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 text-xs font-extrabold">
                    HIGH RISK
                  </span>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-amber-200/60">
                  <button
                    onClick={() => {
                      showToast('Action approved! Executing remediation...', 'success');
                      setActiveTab('investigation');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20"
                  >
                    Approve Action ✓
                  </button>
                  <button
                    onClick={() => showToast('Action rejected. Incident remains under investigation.', 'warning')}
                    className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AUDIT TRAIL TAB */}
          {activeTab === 'audit' && (
            <AuditTrailView />
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-blue-100 p-8 shadow-xs space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  Agent Operational Settings
                  <Settings className="w-5 h-5 text-blue-600" />
                </h2>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  Configure NVIDIA model endpoints, LangGraph thresholds, and autonomous loops
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase mb-2">LLM Model Endpoint</label>
                  <input
                    type="text"
                    readOnly
                    value="nvidia/nemotron-3.5-lightning-30b-a3b"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase mb-2">Autonomous Resolution Loop</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800">
                    <option>Auto-Execute Safe Remediation (Enabled)</option>
                    <option>Require Human Approval for All Actions</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-extrabold transition-all duration-300 animate-slide-up ${
              t.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : t.type === 'warning'
                ? 'bg-amber-900 text-white border-amber-700'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {t.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
            <span>{t.text}</span>
          </div>
        ))}
      </div>

    </div>
  );
};
