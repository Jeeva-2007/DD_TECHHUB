import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, QrCode, Building, Banknote, AlertTriangle, ShieldCheck, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { paymentService } from '../services/api';

export const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const { user } = useAuth();

  const activeOrderId = sessionStorage.getItem('active_order_id') || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI' | 'NETBANKING' | 'COD'>('CARD');
  const [upiId, setUpiId] = useState('user@upi');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('•••');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Demo Customer');
  const [failureType, setFailureType] = useState<string>('PAYMENT_DB_TIMEOUT');

  const [loading, setLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<any>(null);

  const handleNormalPayNow = async () => {
    setErrorDetails(null);
    try {
      setLoading(true);
      const res = await paymentService.process({
        order_id: activeOrderId,
        user_id: user?.user_id || 'USR-101',
        amount: cart.total,
        payment_method: paymentMethod,
        simulate_failure: false
      });

      if (res.data.success) {
        sessionStorage.setItem('last_payment_id', res.data.payment_id);
        navigate('/order-success');
      }
    } catch (err: any) {
      console.error(err);
      setErrorDetails({
        error_code: 'UNEXPECTED_ERROR',
        error_message: 'An unexpected payment error occurred.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatedFailurePayNow = async () => {
    setErrorDetails(null);
    try {
      setLoading(true);
      const res = await paymentService.process({
        order_id: activeOrderId,
        user_id: user?.user_id || 'USR-101',
        amount: cart.total,
        payment_method: paymentMethod,
        simulate_failure: true,
        failure_type: failureType
      });

      if (!res.data.success) {
        setErrorDetails(res.data);
      }
    } catch (err: any) {
      console.error(err);
      setErrorDetails({
        error_code: 'SYSTEM_FAILURE',
        error_message: 'Simulated backend service execution error.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="max-w-3xl mx-auto">
          
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Select Payment Method</h1>
          <p className="text-xs text-slate-500 mb-8">Order Reference: <span className="font-bold text-slate-800">{activeOrderId}</span></p>

          {/* Backend Failure Display Alert Banner */}
          {errorDetails && (
            <div className="mb-8 p-6 rounded-3xl bg-red-50 border-2 border-red-200 text-red-900 shadow-md animate-shake">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-red-900">Payment Authorization Failed</h3>
                    <span className="px-3 py-1 rounded-full bg-red-200 text-red-800 text-[10px] font-bold tracking-wider uppercase">
                      {errorDetails.error_code}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-red-700 mt-2">
                    {errorDetails.error_message}
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-red-200/80 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono text-red-800">
                    <div>
                      <span className="block text-[9px] text-red-500 font-bold uppercase">Request ID</span>
                      <span>{errorDetails.request_id || 'REQ-SYS-ERR'}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-red-500 font-bold uppercase">Event ID</span>
                      <span>{errorDetails.event_id || 'EVT-PAY-FAIL'}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-red-500 font-bold uppercase">Logged to DB</span>
                      <span className="text-green-700 font-bold">YES (Operational Log)</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-red-600 mt-3 italic">
                    Note: A structured operational event has been created in the database for AI incident investigation.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
            
            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                  paymentMethod === 'CARD'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-600 font-bold shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-6 h-6" />
                <span className="text-xs">Credit / Debit</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                  paymentMethod === 'UPI'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-600 font-bold shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-6 h-6" />
                <span className="text-xs">UPI / GPay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('NETBANKING')}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                  paymentMethod === 'NETBANKING'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-600 font-bold shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building className="w-6 h-6" />
                <span className="text-xs">Net Banking</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                  paymentMethod === 'COD'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-600 font-bold shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-6 h-6" />
                <span className="text-xs">Cash on Delivery</span>
              </button>
            </div>

            {/* Payment Fields (Card / UPI / NetBanking / COD) */}
            {paymentMethod === 'CARD' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-center focus:bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-center font-mono focus:bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'UPI' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">UPI Virtual ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@okicici / mobile@upi"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>
            )}

            {paymentMethod === 'NETBANKING' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Select Bank</label>
                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none">
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>State Bank of India</option>
                  <option>Axis Bank</option>
                </select>
              </div>
            )}

            {paymentMethod === 'COD' && (
              <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
                Pay in cash or via mobile QR code at the time of delivery.
              </p>
            )}

            {/* Total Amount Banner */}
            <div className="my-8 p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Total Payable Amount</span>
              <span className="text-2xl font-extrabold text-blue-700">
                ₹{cart.total.toLocaleString('en-IN')}
              </span>
            </div>

            {/* FAILURE TYPE CONTROL SELECTOR FOR SIMULATED FAILURE BUTTON */}
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <label className="block text-[11px] font-bold text-amber-900 mb-1.5 uppercase">
                Failure Simulation Type (For Demo Failure Button)
              </label>
              <select
                value={failureType}
                onChange={(e) => setFailureType(e.target.value)}
                className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs font-semibold text-slate-800 outline-none"
              >
                <option value="PAYMENT_DB_TIMEOUT">PAYMENT_DB_TIMEOUT (Database request timed out after 3100ms)</option>
                <option value="PAYMENT_GATEWAY_TIMEOUT">PAYMENT_GATEWAY_TIMEOUT (Payment gateway connection timed out)</option>
                <option value="PAYMENT_SERVICE_UNAVAILABLE">PAYMENT_SERVICE_UNAVAILABLE (Payment service unavailable 503)</option>
                <option value="PAYMENT_DATABASE_ERROR">PAYMENT_DATABASE_ERROR (Database transaction deadlocked)</option>
                <option value="PAYMENT_RATE_LIMIT">PAYMENT_RATE_LIMIT (Payment rate limit exceeded)</option>
              </select>
            </div>

            {/* TWO PAYMENT BUTTONS AS SPECIFIED IN REQUIREMENTS */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
              
              {/* BUTTON 1: Normal Pay Now */}
              <button
                type="button"
                onClick={handleNormalPayNow}
                disabled={loading}
                className="flex-1 py-4 px-6 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? 'Processing...' : 'PAY NOW'}
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* BUTTON 2: Simulate Failure Pay Now */}
              <button
                type="button"
                onClick={handleSimulatedFailurePayNow}
                disabled={loading}
                className="flex-1 py-4 px-6 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-rose-500/25 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? 'Simulating...' : 'PAY NOW — SIMULATE FAILURE'}
                <AlertTriangle className="w-4 h-4" />
              </button>

            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
