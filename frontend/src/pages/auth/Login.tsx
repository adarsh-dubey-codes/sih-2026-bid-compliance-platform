import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Login: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const { error } = await signIn(email, password);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || 'Invalid credentials');
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
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-300 rounded text-[12px] text-red-900 font-bold font-data flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMessage}</span>
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
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">key</span>
                <span>Authenticate Session</span>
              </>
            )}
          </button>

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
