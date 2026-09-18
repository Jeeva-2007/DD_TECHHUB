import React, { useState, useEffect } from 'react';
import { Terminal, AlertTriangle, ShieldAlert, Database, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { simulatorService, monitoringService } from '../services/api';
import { OperationalEvent, ApplicationLog } from '../types';

export const AdminSimulatorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CONTROLS' | 'EVENTS' | 'LOGS'>('CONTROLS');
  const [events, setEvents] = useState<OperationalEvent[]>([]);
  const [logs, setLogs] = useState<ApplicationLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<any>(null);

  const fetchOperationalData = async () => {
    try {
      setLoading(true);
      const [eventsRes, logsRes] = await Promise.all([
        monitoringService.getEvents({ limit: 50 }),
        monitoringService.getLogs({ limit: 50 })
      ]);
      setEvents(eventsRes.data);
      setLogs(logsRes.data);
    } catch (err) {
      console.error('Failed to fetch operational data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperationalData();
  }, []);

  const triggerOtpFailure = async (type: string) => {
    setFeedback(null);
    try {
      const res = await simulatorService.triggerOtpFailure(type);
      setFeedback({ type: 'OTP', data: res.data });
      fetchOperationalData();
    } catch (err: any) {
      setFeedback({ type: 'ERROR', message: err.message });
    }
  };

  const triggerPaymentFailure = async (type: string) => {
    setFeedback(null);
    try {
      const res = await simulatorService.triggerPaymentFailure(type);
      setFeedback({ type: 'PAYMENT', data: res.data });
      fetchOperationalData();
    } catch (err: any) {
      setFeedback({ type: 'ERROR', message: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Developer Simulator Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20 mb-2">
              <Terminal className="w-3.5 h-3.5" />
              Development & Demo Environment
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Operational Failure Simulator</h1>
            <p className="text-xs text-slate-400 mt-1">Generate realistic backend service failures & inject structured operational events into SQLite</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('CONTROLS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'CONTROLS' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Failure Controls
            </button>
            <button
              onClick={() => setActiveTab('EVENTS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'EVENTS' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Operational Events ({events.length})
            </button>
            <button
              onClick={() => setActiveTab('LOGS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'LOGS' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              App Logs ({logs.length})
            </button>
            <button
              onClick={fetchOperationalData}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Refresh DB Events"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="mb-8 p-4 rounded-2xl bg-slate-800 border border-blue-500/30 text-xs font-mono text-blue-300 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
              <span>
                Backend generated & logged event <strong className="text-white">{feedback.data?.event_id}</strong> (Request ID: {feedback.data?.request_id})
              </span>
            </div>
            <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 font-bold uppercase text-[10px]">
              {feedback.data?.error_code}
            </span>
          </div>
        )}

        {/* TAB 1: FAILURE CONTROLS */}
        {activeTab === 'CONTROLS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* OTP Failure Controls */}
            <div className="bg-slate-800/80 rounded-3xl border border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">OTP Service Failures</h3>
                  <p className="text-xs text-slate-400">Trigger failure scenarios on otp-service & demo SMS provider</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => triggerOtpFailure('provider-timeout')}
                  className="w-full text-left p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-700 hover:border-amber-500/50 transition-all flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-400">Simulate OTP Provider Timeout</h4>
                    <p className="text-[11px] text-slate-400">Demo SMS provider timed out after 5000ms</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold">MEDIUM</span>
                </button>

                <button
                  onClick={() => triggerOtpFailure('provider-error')}
                  className="w-full text-left p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-700 hover:border-amber-500/50 transition-all flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-400">Simulate OTP Provider Error</h4>
                    <p className="text-[11px] text-slate-400">SMS provider returned HTTP 502 Bad Gateway</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold">MEDIUM</span>
                </button>

                <button
                  onClick={() => triggerOtpFailure('service-down')}
                  className="w-full text-left p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-700 hover:border-rose-500/50 transition-all flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-rose-400">Simulate OTP Service Down</h4>
                    <p className="text-[11px] text-slate-400">OTP microservice container healthcheck failed</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold">HIGH</span>
                </button>

                <button
                  onClick={() => triggerOtpFailure('rate-limit')}
                  className="w-full text-left p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-700 hover:border-blue-500/50 transition-all flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-blue-400">Simulate OTP Rate Limit</h4>
                    <p className="text-[11px] text-slate-400">Too many OTP requests interval for user</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold">LOW</span>
                </button>

                <button
                  onClick={() => triggerOtpFailure('database-error')}
                  className="w-full text-left p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-700 hover:border-rose-500/50 transition-all flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-rose-400">Simulate OTP Database Error</h4>
                    <p className="text-[11px] text-slate-400">Failed to write OTP session state to DB</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold">HIGH</span>
                </button>
              </div>
            </div>

            {/* Payment Failure Controls */}
            <div className="bg-slate-800/80 rounded-3xl border border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Payment Service Failures</h3>
                  <p className="text-xs text-slate-400">Trigger failure scenarios on payment-service & database</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => triggerPaymentFailure('gateway-timeout')}
                  className="w-full text-left p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-700 hover:border-rose-500/50 transition-all flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-rose-400">Simulate Payment Gateway Timeout</h4>
                    <p className="text-[11px] text-slate-400">Gateway client socket timed out after 5000ms</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold">HIGH</span>
                </button>

                <button
                  onClick={() => triggerPaymentFailure('service-down')}
                  className="w-full text-left p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-700 hover:border-rose-500/50 transition-all flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-rose-400">Simulate Payment Service Down</h4>
                    <p className="text-[11px] text-slate-400">Payment worker thread pool exhausted (HTTP 503)</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-red-500/20 text-red-400 text-[10px] font-bold">CRITICAL</span>
                </button>

                <button
                  onClick={() => triggerPaymentFailure('database-error')}
                  className="w-full text-left p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-700 hover:border-rose-500/50 transition-all flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-rose-400">Simulate Payment Database Error</h4>
                    <p className="text-[11px] text-slate-400">Database deadlock on payment authorization table</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold">HIGH</span>
                </button>

                <button
                  onClick={() => triggerPaymentFailure('database-timeout')}
                  className="w-full text-left p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-700 hover:border-rose-500/50 transition-all flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-rose-400">Simulate Payment DB Timeout</h4>
                    <p className="text-[11px] text-slate-400">DB query timed out during payment write lock (3100ms)</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold">HIGH</span>
                </button>

                <button
                  onClick={() => triggerPaymentFailure('rate-limit')}
                  className="w-full text-left p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-700 hover:border-amber-500/50 transition-all flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-400">Simulate Payment Rate Limit</h4>
                    <p className="text-[11px] text-slate-400">Payment attempts frequency limit reached</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold">MEDIUM</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: OPERATIONAL EVENTS LIST */}
        {activeTab === 'EVENTS' && (
          <div className="bg-slate-800/80 rounded-3xl border border-slate-700 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center text-xs font-bold text-slate-300">
              <span>OPERATIONAL EVENTS TABLE (Read by future AI Incident Resolution Engine)</span>
              <span>Total: {events.length} Records</span>
            </div>
            
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] sticky top-0">
                  <tr>
                    <th className="p-3">Event ID</th>
                    <th className="p-3">Request ID</th>
                    <th className="p-3">Service</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Severity</th>
                    <th className="p-3">Latency</th>
                    <th className="p-3">Error Code</th>
                    <th className="p-3">Error Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50 text-slate-300">
                  {events.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-3 font-bold text-blue-400">{evt.event_id}</td>
                      <td className="p-3 text-slate-400">{evt.request_id}</td>
                      <td className="p-3 font-semibold text-slate-200">{evt.service_name}</td>
                      <td className="p-3">{evt.event_type}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          evt.status === 'SUCCESS' ? 'bg-green-500/20 text-green-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {evt.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          evt.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                          evt.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-400' :
                          evt.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/10 text-blue-400'
                        }`}>
                          {evt.severity}
                        </span>
                      </td>
                      <td className="p-3">{evt.response_time_ms}ms</td>
                      <td className="p-3 font-bold text-amber-300">{evt.error_code || '-'}</td>
                      <td className="p-3 text-slate-400 max-w-xs truncate">{evt.error_message || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: APPLICATION LOGS LIST */}
        {activeTab === 'LOGS' && (
          <div className="bg-slate-800/80 rounded-3xl border border-slate-700 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center text-xs font-bold text-slate-300">
              <span>APPLICATION LOGS TABLE (Structured JSON Logs)</span>
              <span>Total: {logs.length} Records</span>
            </div>
            
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] sticky top-0">
                  <tr>
                    <th className="p-3">Log ID</th>
                    <th className="p-3">Level</th>
                    <th className="p-3">Service</th>
                    <th className="p-3">Message</th>
                    <th className="p-3">Request ID</th>
                    <th className="p-3">Error Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50 text-slate-300">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-3 font-bold text-slate-400">{log.log_id}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.level === 'ERROR' || log.level === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' :
                          log.level === 'WARNING' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {log.level}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-200">{log.service_name}</td>
                      <td className="p-3 text-slate-300">{log.message}</td>
                      <td className="p-3 text-slate-400">{log.request_id || '-'}</td>
                      <td className="p-3 font-bold text-amber-300">{log.error_code || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};
