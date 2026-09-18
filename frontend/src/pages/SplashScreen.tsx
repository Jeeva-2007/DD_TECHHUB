import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Laptop, Cpu, ShieldCheck } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 2800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 overflow-hidden">
      
      {/* Background Soft Blue Glow Effect */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0.2, 0.6, 0.3], scale: [1, 1.2, 1.1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"
      />

      {/* Main Animated Tech Logo */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col items-center text-center relative z-10"
      >
        <div className="relative mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-4 rounded-3xl border border-blue-200 border-dashed"
          />
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-2xl shadow-blue-500/30">
            <Laptop className="w-12 h-12" />
          </div>
        </div>

        {/* Brand Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-3xl font-extrabold text-slate-900 tracking-tight"
        >
          DD TECHHUB
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-sm font-semibold text-blue-600 mt-2 tracking-wide uppercase"
        >
          Smart Tech. Simple Choice.
        </motion.p>

        {/* Loading Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mt-10 flex items-center gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
          <span className="text-xs font-medium text-slate-400">Loading Enterprise Environment...</span>
        </motion.div>
      </motion.div>
    </div>
  );
};
