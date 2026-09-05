import React, { useState, useEffect } from 'react';
import { testSupabaseConnection, isSupabaseConfigured } from '../lib/supabase';
import type { SupabaseConnectionStatus } from '../lib/supabase';
import { Card } from '../components/common/Card';

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
    let mounted = true;
    testSupabaseConnection().then((res) => {
      if (mounted) {
        setStatus(res);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-[#17152B] tracking-tight">
            Database & Service Diagnostics
          </h1>
          <p className="text-[14px] text-[#66627A] mt-1">
            Live validation for PostgreSQL database, Supabase Auth layer, and cloud storage bucket.
          </p>
        </div>

        <button
          onClick={runDiagnostics}
          disabled={isLoading}
          className="px-4 py-2 bg-[#4527A0] text-white font-medium text-[13px] rounded-lg hover:bg-[#5E35B1] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span className={`material-symbols-outlined text-[17px] ${isLoading ? 'animate-spin' : ''}`}>
            refresh
          </span>
          <span>{isLoading ? 'Running Diagnostics...' : 'Re-Run Diagnostics'}</span>
        </button>
      </div>

      {/* Diagnostics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          title="1. Environment Config"
          value={isSupabaseConfigured ? 'Configured' : 'Missing Keys'}
          subtitle={`URL: ${import.meta.env.VITE_SUPABASE_URL ? 'Loaded' : 'Default'}`}
          icon="settings"
          iconColor="text-[#4527A0]"
          titleClassName="text-[#66627A]"
          valueClassName={isSupabaseConfigured ? 'text-[#059669] text-[20px]' : 'text-[#D97706] text-[20px]'}
        />

        <Card
          title="2. PostgreSQL Database"
          value={status?.dbConnected ? 'Connected' : 'Offline'}
          subtitle={status?.details.dbMessage || 'Testing connection...'}
          icon="dns"
          iconColor={status?.dbConnected ? 'text-[#059669]' : 'text-[#DC2626]'}
          titleClassName="text-[#66627A]"
          valueClassName={status?.dbConnected ? 'text-[#059669] text-[20px]' : 'text-[#DC2626] text-[20px]'}
        />

        <Card
          title="3. Auth Layer"
          value={status?.authConnected ? 'Active' : 'Unverified'}
          subtitle={status?.details.authMessage || 'Checking session...'}
          icon="security"
          iconColor={status?.authConnected ? 'text-[#059669]' : 'text-[#DC2626]'}
          titleClassName="text-[#66627A]"
          valueClassName={status?.authConnected ? 'text-[#059669] text-[20px]' : 'text-[#DC2626] text-[20px]'}
        />

        <Card
          title="4. Cloud Storage"
          value={status?.storageConnected ? 'Ready' : 'Pending'}
          subtitle={status?.details.storageMessage || 'Checking bucket access...'}
          icon="cloud"
          iconColor={status?.storageConnected ? 'text-[#059669]' : 'text-[#DC2626]'}
          titleClassName="text-[#66627A]"
          valueClassName={status?.storageConnected ? 'text-[#059669] text-[20px]' : 'text-[#DC2626] text-[20px]'}
        />
      </div>

      {/* Integration Guide Box */}
      <div className="bg-white border border-[#E5E2EC] rounded-xl p-5 space-y-3">
        <h2 className="text-[15px] font-semibold text-[#17152B]">
          Supabase Cloud Integration Guide
        </h2>
        <p className="text-[13px] text-[#66627A]">
          To connect to your live Supabase project, populate your credentials in <code className="bg-[#F8F9FC] text-[#17152B] font-data px-1.5 py-0.5 rounded border border-[#E5E2EC]">frontend/.env</code>:
        </p>
        <pre className="bg-[#17152B] text-white p-4 rounded-lg text-[12px] font-data overflow-x-auto">
{`VITE_API_BASE_URL=http://localhost:8000/api
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
        </pre>
      </div>
    </div>
  );
};
