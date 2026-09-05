import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import type { UserRole } from '../types';

export const MainLayout: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('officer');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'officer') {
      navigate('/dashboard');
      showToast('Switched to Officer Enclave');
    } else if (role === 'bidder') {
      navigate('/checklist');
      showToast('Switched to Bidder / Vendor Enclave');
    } else {
      navigate('/ledger');
      showToast('Switched to Auditor Enclave');
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F8F9FC] text-[#17152B] overflow-hidden font-sans">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:flex shrink-0 h-full">
        <Sidebar currentPath={window.location.pathname} />
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#17152B]/40 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 h-full shadow-2xl">
            <Sidebar
              currentPath={window.location.pathname}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        <Header
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        <main className="flex-1 overflow-y-auto bg-[#F8F9FC]">
          <Outlet context={{ showToast }} />
        </main>
      </div>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-[#17152B] text-white px-4 py-3 rounded-lg shadow-lg border border-[#4527A0] flex items-center gap-2.5 text-[13px]">
            <span className="material-symbols-outlined text-[#6A3FC7] text-[18px]">verified_user</span>
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
