import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import type { UserRole } from '../types';

export const MainLayout: React.FC = () => {
  const [timeString, setTimeString] = useState<string>('14:32:08');
  const [currentRole, setCurrentRole] = useState<UserRole>('bidder');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTimeString(now.toTimeString().split(' ')[0]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getRoleUser = () => {
    switch (currentRole) {
      case 'officer':
        return { name: 'Rajeshwar Rao, IAS', title: 'Procurement Director (MoPNG)' };
      case 'bidder':
        return { name: 'S. K. Nambiar', title: 'Apex InfraTech (Authorized Signatory)' };
      case 'auditor':
        return { name: 'V. K. Shrivastava', title: 'CVC Statutory Auditor' };
    }
  };

  const user = getRoleUser();

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'officer') {
      navigate('/dashboard');
      showToast('Switched to Procurement Officer Enclave (MoPNG Triage)');
    } else if (role === 'bidder') {
      navigate('/checklist');
      showToast('Switched to Vendor Enclave (Apex InfraTech & Global)');
    } else {
      navigate('/ledger');
      showToast('Switched to CVC Statutory Auditor Enclave');
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Officer Review Queue', icon: 'fact_check', badge: '12 Tenders' },
    { path: '/inspector', label: 'Evidence Inspector', icon: 'vertical_split', badge: 'AI Split' },
    { path: '/checklist', label: 'Bidder Checklist & DSC', icon: 'checklist_rtl', badge: '4/6 Compliant' },
    { path: '/ledger', label: 'Audit Ledger & SHA-256', icon: 'lock_clock', badge: 'Fabric 2.5' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased">
      {/* Top Header System */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B192C] text-white shadow-md">
        {/* Statutory Ministry Bar */}
        <div className="bg-[#061426] text-slate-300 px-4 lg:px-6 h-7 flex items-center justify-between text-[11px] font-semibold tracking-wider uppercase border-b border-slate-800">
          <div className="flex items-center gap-2 truncate">
            <span className="text-amber-500 font-bold">GOVERNMENT OF INDIA</span>
            <span className="opacity-40">|</span>
            <span className="hidden sm:inline">MINISTRY OF PETROLEUM & NATURAL GAS</span>
            <span className="opacity-40 hidden sm:inline">|</span>
            <span className="text-slate-300 font-data">GeM STATUTORY PROCUREMENT PORTAL</span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-1 font-data text-amber-400 text-[10px]">
              <span className="material-symbols-outlined text-[13px]">schedule</span>
              <span>NIC-NTP IST: {timeString} (+05:30)</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-[10px]">
              <span className="opacity-40">|</span>
              <span className="px-1 bg-slate-800 rounded text-slate-300">NIC-EPROC-PROD-01</span>
              <span className="opacity-40">|</span>
              <span className="cursor-pointer hover:underline text-amber-400">हिन्दी</span>
            </div>
          </div>
        </div>

        {/* Primary Navbar */}
        <div className="h-[60px] px-4 lg:px-6 flex items-center justify-between border-b border-slate-800 bg-[#0B192C]">
          <div className="flex items-center gap-3 lg:gap-6">
            {/* Mobile Hamburger Drawer Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white rounded-md hover:bg-slate-800"
              aria-label="Toggle Navigation Drawer"
            >
              <span className="material-symbols-outlined text-[24px]">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>

            {/* Brand Title */}
            <NavLink to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-800 border border-slate-600 text-amber-400 rounded-md flex items-center justify-center font-bold shadow-xs">
                <span className="material-symbols-outlined text-[22px]">verified_user</span>
              </div>
              <div className="leading-tight">
                <div className="font-bold text-white text-[16px] font-display tracking-tight flex items-center gap-2">
                  <span>BID VISHWAS</span>
                  <span className="text-[9px] font-data bg-amber-500/20 border border-amber-500/40 text-amber-400 px-1.5 py-0.2 rounded font-bold uppercase">
                    NIC AI-v4.2
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider hidden sm:block">
                  National Procurement Integrity & Audit Intelligence System
                </div>
              </div>
            </NavLink>

            {/* Desktop Search Bar */}
            <div className="hidden lg:flex items-center ml-4">
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-72 xl:w-96 h-9 pl-9 pr-3 bg-slate-900 border border-slate-700 rounded-md text-[12px] font-data text-slate-200 placeholder-slate-500 focus:bg-slate-950 focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="Search Tender Ref / NIT / GSTIN / SHA-256 Digest..."
                />
              </div>
            </div>
          </div>

          {/* Right Role Switcher & User Token Status */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1">
              <span className="material-symbols-outlined text-[16px] text-amber-400">badge</span>
              <select
                value={currentRole}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className="bg-transparent text-[12px] font-semibold text-slate-200 focus:outline-none cursor-pointer pr-1"
              >
                <option value="officer" className="bg-slate-900 text-white">Role: Procurement Officer (MoPNG)</option>
                <option value="bidder" className="bg-slate-900 text-white">Role: Bidder Enclave (Vendor)</option>
                <option value="auditor" className="bg-slate-900 text-white">Role: Statutory Auditor & Admin</option>
              </select>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex items-center justify-center min-h-[44px] min-w-[44px] rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 p-3 space-y-2 text-left text-white">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-[12px] uppercase text-slate-300 font-data">Statutory Alerts</span>
                    <span className="text-[10px] bg-red-950 border border-red-700 text-red-300 px-1.5 py-0.5 rounded font-bold">2 Urgencies</span>
                  </div>
                  <div className="space-y-2 text-[12px]">
                    <div className="p-2.5 rounded bg-slate-850 border border-slate-750">
                      <div className="font-bold text-amber-400">Discrepancy Flagged: NIT GAIL</div>
                      <div className="text-slate-300 text-[11px] mt-0.5 font-data">Clause 4.1 entity mismatch requires officer decision.</div>
                    </div>
                    <div className="p-2.5 rounded bg-red-950/40 border border-red-900">
                      <div className="font-bold text-red-400">Missing OEM Form 8-B</div>
                      <div className="text-slate-300 text-[11px] mt-0.5 font-data">Mandatory upload missing for Envelope B.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Info */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="text-[12px] font-bold text-white leading-tight">{user.name}</div>
                <div className="text-[10px] text-amber-400 font-data flex items-center justify-end gap-1">
                  <span className="material-symbols-outlined text-[13px]">key</span>
                  <span>DSC Class 3 Active</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-md bg-slate-800 border border-slate-600 text-amber-400 flex items-center justify-center font-bold text-xs shadow-xs">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Institutional Navigation Sidebar (Desktop & Mobile Slide Drawer) */}
      <aside
        className={`fixed left-0 top-[88px] h-[calc(100vh-88px)] w-64 bg-[#061426] text-white border-r border-slate-800 z-40 flex flex-col justify-between overflow-y-auto transition-transform duration-200 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="py-4">
          {/* Active Context Container */}
          <div className="px-4 pb-3 border-b border-slate-800 mb-3 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-data">
              PROCUREMENT CONTEXT
            </div>
            <div className="font-data text-[11px] text-amber-400 font-bold truncate">
              MoPNG/GAIL/2026/TND-001
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-300 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Step 3/5: Evidence Audit Active</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="px-2.5 flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-md text-[13px] font-medium transition-all min-h-[44px] ${
                    isActive
                      ? 'bg-slate-800 text-white font-bold border-l-4 border-amber-500 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-slate-300">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-data ${
                      isActive ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Institutional System Integrity Status */}
        <div className="p-4 border-t border-slate-800 bg-[#040E1B]">
          <div className="bg-slate-900 border border-slate-800 rounded-md p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">shield</span>
                <span>Statutory Rigor</span>
              </div>
              <span className="text-[9px] font-data bg-emerald-950 text-emerald-400 px-1 rounded">CVC COMPLIANT</span>
            </div>
            <div className="font-data text-[10px] text-slate-300 leading-tight">
              GFR 2017 Rule 144 & Sec 65B IT Act
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-data">
              <span>HSM Node Hash</span>
              <span className="text-emerald-400 font-bold">100% OK</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile drawer */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Main Page Area */}
      <main className="lg:pl-64 pt-[88px] min-h-screen">
        <Outlet context={{ showToast }} />
      </main>

      {/* Global Toast Overlay */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div className="bg-[#0B192C] text-white px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 text-[12px] border border-amber-500/50">
            <span className="material-symbols-outlined text-amber-400 text-[20px]">
              verified_user
            </span>
            <span className="font-medium font-data">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
