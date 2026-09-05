import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const ForgotPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setErrorMessage('');
    setIsSubmitting(true);

    const { error } = await resetPassword(email);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || 'Failed to dispatch reset instructions');
    } else {
      setMessage('Password reset instructions dispatched to your email.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FC] p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-[#E5E2EC] rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-[#4527A0] text-white p-6 text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center mx-auto mb-1 font-bold">
            <span className="material-symbols-outlined text-[24px]">lock_reset</span>
          </div>
          <h1 className="text-[20px] font-bold tracking-tight text-white">
            Reset Password
          </h1>
          <p className="text-[12px] text-white/80 font-normal">
            Account Credential Recovery
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message && (
            <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg text-[12px] text-[#059669] font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{message}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-[12px] text-[#DC2626] font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#66627A]">
              Registered Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@mopng.gov.in"
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
                <span>Dispatching Reset Email...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>Send Reset Link</span>
              </>
            )}
          </button>

          <div className="pt-3 text-center text-[12px] text-[#66627A] border-t border-[#E5E2EC]">
            Remember your credentials?{' '}
            <Link to="/login" className="font-semibold text-[#4527A0] hover:underline">
              Return to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
