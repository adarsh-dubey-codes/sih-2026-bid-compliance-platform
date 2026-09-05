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
  const [role, setRole] = useState<UserRole>('BIDDER');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FC] p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-[#E5E2EC] rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-[#4527A0] text-white p-6 text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center mx-auto mb-1 font-bold">
            <span className="material-symbols-outlined text-[24px]">person_add</span>
          </div>
          <h1 className="text-[20px] font-bold tracking-tight text-white">
            Register Entity
          </h1>
          <p className="text-[12px] text-white/80 font-normal">
            Bid Vishwas Platform Onboarding
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-[12px] text-[#DC2626] font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#66627A]">
              Full Name / Authorized Signatory
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Dr. S. K. Sharma"
              className="w-full h-10 px-3 text-[13px] bg-[#F8F9FC] border border-[#E5E2EC] rounded-lg text-[#17152B] focus:bg-white focus:outline-none focus:border-[#4527A0]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#66627A]">
              Official Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="bids@apexinfra.com"
              className="w-full h-10 px-3 text-[13px] bg-[#F8F9FC] border border-[#E5E2EC] rounded-lg text-[#17152B] focus:bg-white focus:outline-none focus:border-[#4527A0]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#66627A]">
              System Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full h-10 px-3 text-[13px] font-medium bg-[#F8F9FC] border border-[#E5E2EC] rounded-lg text-[#17152B] focus:bg-white focus:outline-none focus:border-[#4527A0]"
            >
              <option value="PROCUREMENT_OFFICER">Procurement Officer (GAIL/MoPNG)</option>
              <option value="BIDDER">Bidder / Vendor Entity</option>
              <option value="AUDITOR">Auditor / Vigilance Official</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#66627A]">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-10 px-3 text-[13px] bg-[#F8F9FC] border border-[#E5E2EC] rounded-lg text-[#17152B] focus:bg-white focus:outline-none focus:border-[#4527A0]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 bg-[#4527A0] text-white text-[13px] font-medium rounded-lg hover:bg-[#5E35B1] transition-colors flex items-center justify-center gap-2 disabled:bg-[#C4BFD3]"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Registering...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                <span>Complete Registration</span>
              </>
            )}
          </button>

          <div className="pt-3 text-center text-[12px] text-[#66627A] border-t border-[#E5E2EC]">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-[#4527A0] hover:underline">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
