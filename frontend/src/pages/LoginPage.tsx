import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Laptop, Phone, Send, AlertCircle } from 'lucide-react';
import { authService, otpService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setPendingAuth } = useAuth();
  
  const [mobile, setMobile] = useState('+91 9876543210');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatErrorMessage = (err: any, fallback: string): string => {
    const detail = err.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      return detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
    }
    if (detail && typeof detail === 'object') {
      return JSON.stringify(detail);
    }
    return fallback;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanMobile = mobile.trim();
    if (!cleanMobile || cleanMobile.length < 5) {
      setError('Please enter a valid mobile number.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.login({ mobile: cleanMobile });
      if (res.data.success) {
        const user = res.data.user;
        const token = res.data.token;
        setPendingAuth(user, token);
        
        // Dispatch Telegram OTP
        await otpService.send(user.user_id, user.mobile);
        navigate('/otp');
      }
    } catch (err: any) {
      console.error(err);
      setError(formatErrorMessage(err, 'Failed to send Telegram OTP. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-4">
            <Laptop className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Login with Mobile</h2>
          <p className="text-xs font-semibold text-blue-600 mt-1 uppercase">DD TECHHUB</p>
        </div>

        {/* Telegram Notice Banner */}
        <div className="mb-6 p-3.5 rounded-2xl bg-sky-50 border border-sky-100 text-sky-800 text-xs font-medium flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <span className="block font-bold">Telegram OTP Authentication</span>
            <span className="text-[11px] text-sky-600">Verification code will be sent to your Telegram Bot</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-xs font-medium flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{String(error)}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Mobile Number</label>
            <div className="relative">
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-4 bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white text-xs font-extrabold rounded-xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all mt-6"
          >
            {loading ? 'Sending Telegram OTP...' : 'GET OTP VIA TELEGRAM'}
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-8">
          New to DD TECHHUB?{' '}
          <Link to="/signup" className="text-blue-600 font-bold hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};
