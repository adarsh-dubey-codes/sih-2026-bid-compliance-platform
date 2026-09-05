import React, { useState, useEffect } from 'react';
import { testSupabaseConnection, isSupabaseConfigured } from '../lib/supabase';
import type { SupabaseConnectionStatus } from '../lib/supabase';


export const SupabaseTestPage: React.FC = () => {
  const [status, setStatus] = useState<SupabaseConnectionStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const runDiagnostics = async () => {
    setIsLoading(true);
    const res = await testSupabaseConnection();
    setStatus(res);
    setIsLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-100 p-4 lg:p-8 space-y-6 font-sans">
      {/* Top Banner */}
      <div className="bg-white border border-slate-300 rounded-lg p-5 lg:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 font-data">
              <span className="material-symbols-outlined text-[16px] text-[#0B192C]">dns</span>
              <span>SUPABASE INFRASTRUCTURE DIAGNOSTICS</span>
            </div>
            <h1 className="text-[22px] lg:text-[26px] font-display text-slate-900 font-bold mt-1 tracking-tight">
              Supabase Client & Auth Diagnostic Console
            </h1>
            <div className="text-[12px] text-slate-600 font-sans mt-0.5">
              Live validation for PostgreSQL Database, Auth Layer, and Cloud Storage Bucket Access
            </div>
          </div>

          <button
            onClick={runDiagnostics}
            disabled={isLoading}
            className="px-4 h-9 bg-[#0B192C] text-white font-data text-[11px] font-bold rounded hover:bg-[#1E3A5F] flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span className={`material-symbols-outlined text-[16px] ${isLoading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>{isLoading ? 'Running Diagnostics...' : 'Re-Run Diagnostics'}</span>
          </button>
        </div>
      </div>

      {/* Diagnostics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Environment Credentials Card */}
        <div className="bg-white border border-slate-300 rounded-lg p-4 space-y-2 shadow-xs">
          <div className="text-[11px] font-data font-bold uppercase text-slate-500">1. Environment Setup</div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isSupabaseConfigured ? 'bg-emerald-600' : 'bg-amber-500 animate-pulse'}`}></div>
            <span className="font-bold text-slate-900 text-[14px]">
              {isSupabaseConfigured ? 'Keys Configured' : 'Placeholder Keys'}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 font-data">
            VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? 'Loaded' : 'Missing'}
          </p>
        </div>

        {/* Database Card */}
        <div className="bg-white border border-slate-300 rounded-lg p-4 space-y-2 shadow-xs">
          <div className="text-[11px] font-data font-bold uppercase text-slate-500">2. PostgreSQL Database</div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${status?.dbConnected ? 'bg-emerald-600' : 'bg-red-600'}`}></div>
            <span className="font-bold text-slate-900 text-[14px]">
              {status?.dbConnected ? 'Client Active' : 'Disconnected'}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 font-data truncate">
            {status?.details.dbMessage || 'Testing connection...'}
          </p>
        </div>

        {/* Auth Layer Card */}
        <div className="bg-white border border-slate-300 rounded-lg p-4 space-y-2 shadow-xs">
          <div className="text-[11px] font-data font-bold uppercase text-slate-500">3. Authentication Layer</div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${status?.authConnected ? 'bg-emerald-600' : 'bg-red-600'}`}></div>
            <span className="font-bold text-slate-900 text-[14px]">
              {status?.authConnected ? 'Auth Active' : 'Unverified'}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 font-data truncate">
            {status?.details.authMessage || 'Checking auth session...'}
          </p>
        </div>

        {/* Storage Card */}
        <div className="bg-white border border-slate-300 rounded-lg p-4 space-y-2 shadow-xs">
          <div className="text-[11px] font-data font-bold uppercase text-slate-500">4. Supabase Storage</div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${status?.storageConnected ? 'bg-emerald-600' : 'bg-red-600'}`}></div>
            <span className="font-bold text-slate-900 text-[14px]">
              {status?.storageConnected ? 'Storage Ready' : 'Unreachable'}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 font-data truncate">
            {status?.details.storageMessage || 'Checking bucket access...'}
          </p>
        </div>
      </div>

      {/* Connection Instructions Box */}
      <div className="bg-white border border-slate-300 rounded-lg p-5 shadow-xs space-y-3 font-data text-[12px]">
        <div className="font-display text-[15px] font-bold text-slate-900">
          Supabase Integration Setup Guide
        </div>
        <p className="text-slate-700">
          To connect this application to your live Supabase cloud project, update your environment variables in <code className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">frontend/.env</code>:
        </p>
        <pre className="bg-[#0B192C] text-slate-200 p-3.5 rounded border border-slate-800 text-[11px] overflow-x-auto">
{`VITE_API_BASE_URL=http://localhost:8000/api
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
        </pre>
      </div>
    </div>
  );
};
