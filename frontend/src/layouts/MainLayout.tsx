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
      showToast('Switched to Vendor Enclave (Apex InfraTech)');
    } else {
      navigate('/ledger');
      showToast('Switched to CVC Statutory Auditor Enclave');
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Officer Review Queue', icon: 'fact_check', badge: '12 Tenders' },
    { path: '/inspector', label: 'Evidence Inspector', icon: 'vertical_split', badge: 'AI Verified' },
    { path: '/checklist', label: 'Bidder Checklist & DSC', icon: 'checklist_rtl', badge: 'Compliant' },
    { path: '/ledger', label: 'Audit Ledger & SHA-256', icon: 'lock_clock', badge: 'Immutable' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased">
      {/* Top Header System */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B192C] text-white shadow-xs">
        {/* Statutory Ministry Top Banner */}
        <div className="bg-[#061426] text-slate-300 px-4 lg:px-6 h-7 flex items-center justify-between text-[11px] font-semibold tracking-wider uppercase border-b border-slate-800">
          <div className="flex items-center gap-2 truncate">
            <span className="text-amber-400 font-bold">GOVERNMENT OF INDIA</span>
            <span className="opacity-30">|</span>
            <span className="hidden sm:inline text-slate-300">MINISTRY OF PETROLEUM & NATURAL GAS</span>
            <span className="opacity-30 hidden sm:inline">|</span>
            <span className="text-slate-400 font-data">GeM STATUTORY PROCUREMENT PORTAL</span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-1.5 font-data text-amber-400 text-[10px]">
              <span className="material-symbols-outlined text-[13px]">schedule</span>
              <span>NIC-NTP IST: {timeString} (+05:30)</span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[10px]">
              <span className="opacity-30">|</span>
              <span className="px-1.5 py-0.5 bg-slate-800 rounded font-data text-slate-300">NIC-EPROC-PROD-01</span>
            </div>
          </div>
        </div>

        {/* Primary Navbar */}
        <div className="h-[58px] px-4 lg:px-6 flex items-center justify-between border-b border-slate-800 bg-[#0B192C]">
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
              <div className="w-8 h-8 bg-slate-900 border border-slate-700 text-amber-400 rounded-md flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[20px]">shield</span>
              </div>
              <div className="leading-tight">
                <div className="font-bold text-white text-[17px] font-display tracking-tight flex items-center gap-2">
                  <span>BID VISHWAS</span>
                  <span className="text-[9px] font-data bg-amber-500/10 border border-amber-500/30 text-amber-400 px-1.5 py-0.2 rounded uppercase font-bold">
                    Sovereign Engine
                  </span>
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
                  className="w-72 xl:w-80 h-8 pl-9 pr-3 bg-slate-900 border border-slate-700 rounded-md text-[12px] font-data text-slate-200 placeholder-slate-500 focus:bg-slate-950 focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="Search Tender Ref / NIT / GSTIN..."
                />
              </div>
            </div>
          </div>

          {/* Right Role Switcher & User Status */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1">
              <span className="material-symbols-outlined text-[15px] text-amber-400">badge</span>
              <select
                value={currentRole}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className="bg-transparent text-[12px] font-medium text-slate-200 focus:outline-none cursor-pointer pr-1"
              >
                <option value="officer" className="bg-slate-900 text-white">Officer Enclave (MoPNG)</option>
                <option value="bidder" className="bg-slate-900 text-white">Bidder Enclave (Vendor)</option>
                <option value="auditor" className="bg-slate-900 text-white">Auditor Enclave (CVC)</option>
              </select>
            </div>

            {/* Notifications Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex items-center justify-center w-8 h-8 rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">notifications</span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-md shadow-lg z-50 p-3 space-y-2 text-left text-white">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-[11px] uppercase text-slate-300 font-data">Statutory Alerts</span>
                    <span className="text-[10px] bg-red-950 border border-red-700 text-red-300 px-1.5 py-0.5 rounded font-bold font-data">2 Flags</span>
                  </div>
                  <div className="space-y-2 text-[12px]">
                    <div className="p-2 rounded bg-slate-800 border border-slate-700">
                      <div className="font-bold text-amber-400">Discrepancy Flagged: NIT GAIL</div>
                      <div className="text-slate-300 text-[11px] mt-0.5 font-data">Clause 4.1 entity mismatch requires officer decision.</div>
                    </div>
                    <div className="p-2 rounded bg-red-950/40 border border-red-900">
                      <div className="font-bold text-red-400">Missing OEM Form 8-B</div>
                      <div className="text-slate-300 text-[11px] mt-0.5 font-data">Mandatory upload missing for Envelope B.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Info */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="text-[12px] font-bold text-white leading-tight">{user.name}</div>
                <div className="text-[10px] text-slate-400 font-data">DSC Class 3 Active</div>
              </div>
              <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-600 text-amber-400 flex items-center justify-center font-bold text-xs">
                <span className="material-symbols-outlined text-[16px]">person</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed left-0 top-[86px] h-[calc(100vh-86px)] w-60 bg-[#061426] text-white border-r border-slate-800 z-40 flex flex-col justify-between overflow-y-auto transition-transform duration-200 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="py-4">
          {/* Active Context Bar */}
          <div className="px-4 pb-3 border-b border-slate-800 mb-3 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-data">
              PROCURING ENTITY
            </div>
            <div className="font-data text-[11px] text-amber-400 font-bold truncate">
              MoPNG/GAIL/2026/TND-001
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="px-2 flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-[13px] font-medium transition-all min-h-[40px] ${
                    isActive
                      ? 'bg-slate-800 text-white font-bold border-l-4 border-amber-500'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-data ${
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

        {/* Footer Status */}
        <div className="p-3 border-t border-slate-800 bg-[#040E1B]">
          <div className="bg-slate-900 border border-slate-800 rounded-md p-2.5 space-y-1 text-[11px]">
            <div className="flex items-center justify-between font-bold text-amber-400 uppercase">
              <span>STATUTORY AUDIT</span>
              <span className="text-[9px] font-data bg-emerald-950 text-emerald-400 px-1 rounded">CVC READY</span>
            </div>
            <div className="font-data text-[10px] text-slate-400 leading-tight">
              GFR 2017 & IT Act Sec 65B
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile drawer */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 z-30 lg:hidden"
        />
      )}

      {/* Main Page Content */}
      <main className="lg:pl-60 pt-[86px] min-h-screen">
        <Outlet context={{ showToast }} />
      </main>

      {/* Global Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50">
          <div className="bg-[#0B192C] text-white px-4 py-2.5 rounded-md shadow-lg flex items-center gap-2.5 text-[12px] border border-amber-500/40 font-data">
            <span className="material-symbols-outlined text-amber-400 text-[18px]">
              verified_user
            </span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
