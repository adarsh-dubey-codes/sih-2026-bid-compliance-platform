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
    startDemoSession('PROCUREMENT_OFFICER', 'Rajeshwar Rao, IAS', email || 'officer@mopng.gov.in');
    navigate('/checklist');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FC] p-4 font-sans text-[#17152B]">
      <div className="w-full max-w-md bg-white border border-[#E5E2EC] rounded-[12px] overflow-hidden">
        {/* Deep Purple Header */}
        <div className="bg-[#4527A0] text-white p-6 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[11px] font-medium tracking-wide">
            <span className="material-symbols-outlined text-[14px]">shield</span>
            <span>Bid Vishwas Gateway</span>
          </div>
          <h1 className="text-[22px] font-bold tracking-tight text-white">
            Bid Vishwas Authentication
          </h1>
          <p className="text-[13px] text-white/80 font-normal">
            AI-Powered Bid Compliance Verification Enclave
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {successMessage && (
            <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg text-[13px] text-[#047857] font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-[13px] text-[#B91C1C] font-medium space-y-2">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                <span>{errorMessage}</span>
              </div>
              <div className="flex gap-2 pt-2 border-t border-[#FECACA]">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || cooldown > 0}
                  className="px-2.5 py-1 bg-white border border-[#FECACA] rounded text-[11px] font-medium text-[#B91C1C] hover:bg-[#FEF2F2] disabled:opacity-50"
                >
                  {isResending
                    ? 'Resending...'
                    : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : 'Resend Email'}
                </button>
                <button
                  type="button"
                  onClick={handleDemoAccess}
                  className="px-2.5 py-1 bg-[#4527A0] text-white rounded text-[11px] font-medium hover:bg-[#5E35B1]"
                >
                  Demo Quick Access
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[12px] font-medium text-[#17152B]">
              Official Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@mopng.gov.in"
              className="w-full h-10 px-3.5 text-[13px] bg-[#F8F9FC] border border-[#E5E2EC] rounded-lg focus:outline-none focus:border-[#4527A0] text-[#17152B]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[12px] font-medium text-[#17152B]">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[12px] text-[#4527A0] hover:underline font-medium"
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
                className="w-full h-10 pl-3.5 pr-10 text-[13px] bg-[#F8F9FC] border border-[#E5E2EC] rounded-lg focus:outline-none focus:border-[#4527A0] text-[#17152B]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#66627A] hover:text-[#17152B]"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[13px]">
            <label className="flex items-center gap-2 cursor-pointer text-[#66627A]">
              <input
                type="checkbox"
                checked={rememberSession}
                onChange={(e) => setRememberSession(e.target.checked)}
                className="w-4 h-4 rounded border-[#E5E2EC] text-[#4527A0] focus:ring-[#4527A0]"
              />
              <span>Remember session on this device</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 bg-[#4527A0] text-white text-[13px] font-medium rounded-lg hover:bg-[#5E35B1] transition-colors flex items-center justify-center gap-2 disabled:bg-[#E5E2EC] disabled:text-[#66627A]"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">key</span>
                <span>Authenticate Session</span>
              </>
            )}
          </button>

          {/* Quick Demo Mode Card */}
          <div className="p-4 bg-[#F8F9FC] border border-[#E5E2EC] rounded-lg text-center space-y-2">
            <div className="text-[12px] font-medium text-[#17152B] flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#4527A0]">bolt</span>
              <span>Quick Demo Session</span>
            </div>
            <p className="text-[12px] text-[#66627A]">
              Launch instantly into local officer workspace:
            </p>
            <button
              type="button"
              onClick={handleDemoAccess}
              className="w-full py-2 bg-[#4527A0] hover:bg-[#5E35B1] text-white text-[12px] font-medium rounded-lg transition-colors"
            >
              Launch Demo Session
            </button>
          </div>

          <div className="pt-2 text-center text-[13px] text-[#66627A] border-t border-[#E5E2EC]">
            Need an account?{' '}
            <Link to="/signup" className="font-semibold text-[#4527A0] hover:underline">
              Register New Entity
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

