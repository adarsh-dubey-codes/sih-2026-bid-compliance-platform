import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const ForgotPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const startCooldownTimer = (seconds: number = 60) => {
    setCooldown(seconds);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;

    setMessage('');
    setErrorMessage('');
    setIsSubmitting(true);

    const { error } = await resetPassword(email);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || 'Failed to dispatch reset instructions');
      startCooldownTimer(60);
    } else {
      setMessage('Password reset instructions dispatched to your official email.');
      startCooldownTimer(60);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-300 rounded-lg shadow-md overflow-hidden">
        {/* Institutional Header */}
        <div className="bg-[#0B192C] text-white p-6 text-center space-y-2 border-b border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-700 rounded-full font-data text-[10px] uppercase font-bold text-amber-400">
            <span className="material-symbols-outlined text-[14px]">lock_reset</span>
            <span>Credential Recovery</span>
          </div>
          <h1 className="text-[22px] font-display font-bold tracking-tight text-white">
            Reset Password
          </h1>
          <p className="text-[12px] text-slate-300 font-sans">
            Secure Supabase Auth Recovery Dispatch
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-[12px] text-emerald-900 font-bold font-data flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{message}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-300 rounded text-[12px] text-red-900 font-bold font-data flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-data font-bold uppercase text-slate-700">
              Registered Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@mopng.gov.in"
              className="w-full h-10 px-3 text-[13px] font-data bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || cooldown > 0}
            className="w-full h-10 bg-[#0B192C] text-white font-data text-[12px] font-bold uppercase tracking-wider rounded hover:bg-[#1E3A5F] transition-colors flex items-center justify-center gap-2 shadow-xs disabled:bg-slate-400"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Dispatching Reset Email...</span>
              </>
            ) : cooldown > 0 ? (
              <span>Retry Cooldown ({cooldown}s)</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>Dispatch Reset Link</span>
              </>
            )}
          </button>

          <div className="pt-2 text-center text-[12px] text-slate-600 border-t border-slate-200">
            Remember your credentials?{' '}
            <Link to="/login" className="font-bold text-[#0B192C] hover:underline font-data">
              Return to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
