import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { otpService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const OtpPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, pendingUser, confirmOtpSuccess } = useAuth();
  const activeUser = pendingUser || user || { user_id: 'USR-101', mobile: '+91 9876543210' };

  // Empty initial state - NO prefilled placeholders
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '']);
  const [timer, setTimer] = useState<number>(45);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [info, setInfo] = useState<string>('OTP code sent to your Telegram Bot.');
  const [loading, setLoading] = useState<boolean>(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: any = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = val.slice(-1);
    setOtpDigits(newDigits);

    if (val && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join('');
    setError('');

    if (fullOtp.length < 4) {
      setError('Please enter complete 4-digit OTP.');
      return;
    }

    try {
      setLoading(true);
      const res = await otpService.verify(activeUser.user_id, fullOtp);
      if (res.data.success) {
        confirmOtpSuccess();
        navigate('/home');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Invalid OTP code. Please check your Telegram message.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setError('');
    setInfo('New Telegram Bot OTP code sent to your mobile.');
    setTimer(45);
    setCanResend(false);
    try {
      await otpService.resend(activeUser.user_id, activeUser.mobile || '+91 9876543210');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 text-center">
        
        <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4 shadow-sm">
          <Send className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Telegram Bot OTP</h2>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Sent 4-digit verification code to <br />
          <span className="font-bold text-slate-800">{activeUser.mobile || '+91 9876543210'}</span>
        </p>

        {info && (
          <div className="mt-3 p-2.5 rounded-xl bg-sky-50 border border-sky-100 text-sky-700 text-[11px] font-medium flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-sky-600" />
            <span>{info}</span>
          </div>
        )}

        {error && (
          <div className="mt-3 p-2.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-[11px] font-medium flex items-center justify-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
            <span>{String(error)}</span>
          </div>
        )}

        {/* 4 Empty OTP Input Boxes */}
        <form onSubmit={handleVerify} className="mt-6 space-y-5">
          <div className="flex justify-center items-center gap-3">
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                placeholder=""
                className="w-12 h-14 text-center text-2xl font-extrabold bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white text-xs font-extrabold rounded-xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? 'Verifying...' : 'VERIFY TELEGRAM OTP'}
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Countdown Timer & Resend */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-500">
            {timer > 0 ? (
              <>Resend in <span className="font-bold text-sky-600">{timer}s</span></>
            ) : (
              'Didn\'t receive code?'
            )}
          </span>

          <button
            onClick={handleResend}
            disabled={!canResend}
            className={`flex items-center gap-1 font-bold transition-colors ${
              canResend ? 'text-sky-600 hover:text-sky-700' : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3 h-3" />
            Resend
          </button>
        </div>
      </div>
    </div>
  );
};
