import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';


interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full min-h-screen bg-slate-100 font-sans">
        <div className="flex flex-col items-center space-y-3 bg-white p-8 rounded-lg border border-slate-300 shadow-sm">
          <div className="w-8 h-8 border-4 border-[#0B192C] border-t-amber-400 rounded-full animate-spin"></div>
          <div className="text-[13px] font-bold font-data text-slate-800">
            Authenticating Sovereign Credentials...
          </div>
        </div>
      </div>
    );
  }

  // If Supabase keys are not set, allow dev preview so application stays usable
  if (!isSupabaseConfigured) {
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div className="flex items-center justify-center w-full min-h-screen bg-slate-100 p-6 font-sans">
        <div className="max-w-md w-full bg-white border border-red-300 rounded-lg p-6 space-y-4 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-900 mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">gavel</span>
          </div>
          <h2 className="text-[18px] font-display font-bold text-slate-900">
            403 - Unauthorized Role Access
          </h2>
          <p className="text-[12px] text-slate-600">
            Your role (<strong className="font-data">{role}</strong>) does not have required permissions under GFR Rule 144 to view this enclave.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-[#0B192C] text-white font-data text-[12px] font-bold rounded"
          >
            Return to Authorized Workspace
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
