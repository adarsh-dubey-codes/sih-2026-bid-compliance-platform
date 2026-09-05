import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../context/AuthContext';

export const Signup: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('BIDDER');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage('Please enter a valid official email address');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUp(email, password, fullName, role);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || 'Registration failed');
    } else {
      navigate('/checklist');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-300 rounded-lg shadow-md overflow-hidden">
        {/* Institutional Header */}
        <div className="bg-[#0B192C] text-white p-6 text-center space-y-2 border-b border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-700 rounded-full font-data text-[10px] uppercase font-bold text-amber-400">
            <span className="material-symbols-outlined text-[14px]">person_add</span>
            <span>Entity & Role Onboarding</span>
          </div>
          <h1 className="text-[22px] font-display font-bold tracking-tight text-white">
            Register Sovereign Identity
          </h1>
          <p className="text-[12px] text-slate-300 font-sans">
            Procurement Officer, Bidder Entity, or Auditor Registration
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-300 rounded text-[12px] text-red-900 font-bold font-data flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-data font-bold uppercase text-slate-700">
              Full Name / Authorized Officer
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Dr. S. K. Sharma"
              className="w-full h-10 px-3 text-[13px] font-data bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-data font-bold uppercase text-slate-700">
              Official Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="bids@apexinfra.com"
              className="w-full h-10 px-3 text-[13px] font-data bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-data font-bold uppercase text-slate-700">
              Assigned System Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full h-10 px-3 text-[13px] font-data font-bold bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
            >
              <option value="PROCUREMENT_OFFICER">Procurement Officer (GAIL/MoPNG)</option>
              <option value="BIDDER">Bidder / Submitting Entity</option>
              <option value="AUDITOR">Auditor / Vigilance Official</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-data font-bold uppercase text-slate-700">
              Password (Min 6 Characters)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
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

          <div className="space-y-1">
            <label className="text-[11px] font-data font-bold uppercase text-slate-700">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-10 px-3 text-[13px] font-data bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 bg-[#0B192C] text-white font-data text-[12px] font-bold uppercase tracking-wider rounded hover:bg-[#1E3A5F] transition-colors flex items-center justify-center gap-2 shadow-xs disabled:bg-slate-400"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                <span>Complete Registration</span>
              </>
            )}
          </button>

          <div className="pt-2 text-center text-[12px] text-slate-600 border-t border-slate-200">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-[#0B192C] hover:underline font-data">
              Sign In Here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
