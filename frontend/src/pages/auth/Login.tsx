import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Login: React.FC = () => {
  const { signIn, resendVerificationEmail, startDemoSession } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
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
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage('Please enter a valid official email address');
      return;
    }

    setIsSubmitting(true);
    const { error } = await signIn(email, password);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || 'Invalid email or password');
    } else {
      navigate('/checklist');
    }
  };

  const handleResend = async () => {
    if (!email) {
      setErrorMessage('Please enter your email address to resend confirmation.');
      return;
    }
    if (cooldown > 0) return;

    setErrorMessage('');
    setSuccessMessage('');
    setIsResending(true);
    const { error } = await resendVerificationEmail(email);
    setIsResending(false);

    if (error) {
      setErrorMessage(error.message || 'Failed to resend confirmation email');
      if (error.isRateLimited) {
        startCooldownTimer(60);
      }
    } else {
      setSuccessMessage('Verification email sent! Check your inbox.');
      startCooldownTimer(60);
    }
  };

  const handleDemoAccess = () => {
    startDemoSession('PROCUREMENT_OFFICER', 'Dr. S. K. Sharma (GAIL Official)', email || 'officer@mopng.gov.in');
    navigate('/checklist');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-300 rounded-lg shadow-md overflow-hidden">
        {/* Institutional Header */}
        <div className="bg-[#0B192C] text-white p-6 text-center space-y-2 border-b border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-700 rounded-full font-data text-[10px] uppercase font-bold text-amber-400">
            <span className="material-symbols-outlined text-[14px]">shield</span>
            <span>MoPNG / GAIL Sovereign Portal</span>
          </div>
          <h1 className="text-[22px] font-display font-bold tracking-tight text-white">
            Bid Vishwas Authentication
          </h1>
          <p className="text-[12px] text-slate-300 font-sans">
            Statutory E-Procurement Compliance & Verification Enclave
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-[12px] text-emerald-900 font-bold font-data flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-300 rounded text-[12px] text-red-900 font-bold font-data space-y-2">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
                <span>{errorMessage}</span>
              </div>
              <div className="flex gap-2 pt-1 border-t border-red-200">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || cooldown > 0}
                  className="px-2 py-1 bg-white border border-red-300 rounded text-[11px] font-bold text-red-900 hover:bg-red-100 disabled:opacity-50"
                >
                  {isResending
                    ? 'Resending...'
                    : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : 'Resend Verification Email'}
                </button>
                <button
                  type="button"
                  onClick={handleDemoAccess}
                  className="px-2 py-1 bg-[#0B192C] text-amber-400 rounded text-[11px] font-bold hover:bg-slate-800"
                >
                  Demo Quick Access
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-data font-bold uppercase text-slate-700">
              Official Email Address
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

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-data font-bold uppercase text-slate-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-[#0B192C] hover:underline font-bold font-data"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 pl-3 pr-10 text-[13px] font-data bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-900"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Remember Session Checkbox */}
          <div className="flex items-center justify-between font-sans text-[12px]">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={rememberSession}
                onChange={(e) => setRememberSession(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0B192C] focus:ring-[#0B192C]"
              />
              <span>Remember session on this device</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 bg-[#0B192C] text-white font-data text-[12px] font-bold uppercase tracking-wider rounded hover:bg-[#1E3A5F] transition-colors flex items-center justify-center gap-2 shadow-xs disabled:bg-slate-400"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">key</span>
                <span>Authenticate Session</span>
              </>
            )}
          </button>

          {/* SIH Demo Mode Banner / Bypass Button */}
          <div className="p-3 bg-amber-50 border border-amber-300 rounded text-center space-y-1.5">
            <div className="text-[11px] font-data font-bold text-amber-900 uppercase tracking-wide flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              <span>Localhost & SIH Demo Quick Access</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Bypass external SMTP rate limits and launch instantly into local workspace:
            </p>
            <button
              type="button"
              onClick={handleDemoAccess}
              className="w-full py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-data text-[11px] font-bold uppercase tracking-wider rounded transition-colors"
            >
              Launch Local Demo Session (GAIL Officer)
            </button>
          </div>

          <div className="pt-2 text-center text-[12px] text-slate-600 border-t border-slate-200">
            Need an account?{' '}
            <Link to="/signup" className="font-bold text-[#0B192C] hover:underline font-data">
              Register New Entity
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
