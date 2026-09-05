import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import type { UserRole } from '../types';

export const MainLayout: React.FC = () => {
  const [timeString, setTimeString] = useState<string>('14:32:08');
  const [currentRole, setCurrentRole] = useState<UserRole>('officer');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
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

  // Structured Procurement Review Workflow Items
  const workflowStages = [
    {
      id: 'queue',
      step: '01',
      path: '/dashboard',
      actionLabel: '01 Review Queue',
      desc: 'Triage & Pre-Screening Queue',
      icon: 'fact_check',
      status: 'completed',
      statusSymbol: '✓',
      statusBadge: '12 Active Bids',
      badgeClass: 'bg-emerald-950 text-emerald-400 border-emerald-800'
    },
    {
      id: 'evidence',
      step: '02',
      path: '/inspector',
      actionLabel: '02 Evidence Analysis',
      desc: 'Deep Document OCR & Token Trace',
      icon: 'pageview',
      status: 'active',
      statusSymbol: '●',
      statusBadge: 'AI Split Active',
      badgeClass: 'bg-amber-950 text-amber-400 border-amber-800'
    },
    {
      id: 'compliance',
      step: '03',
      path: '/checklist',
      actionLabel: '03 Compliance Validation',
      desc: 'Deterministic GFR Rule Check',
      icon: 'verified_user',
      status: 'active',
      statusSymbol: '●',
      statusBadge: '4/6 Passed',
      badgeClass: 'bg-slate-800 text-slate-300 border-slate-700'
    },
    {
      id: 'discrepancy',
      step: '04',
      path: '/checklist',
      actionLabel: '04 Resolve Discrepancies',
      desc: 'Entity & OEM Flaw Resolution',
      icon: 'warning',
      status: 'attention',
      statusSymbol: '⚠',
      statusBadge: '2 Flaws Flagged',
      badgeClass: 'bg-red-950 text-red-400 border-red-800'
    },
    {
      id: 'ledger',
      step: '05',
      path: '/ledger',
      actionLabel: '05 Verify Audit Ledger',
      desc: 'SHA-256 Non-Repudiation Trail',
      icon: 'lock_clock',
      status: 'completed',
      statusSymbol: '✓',
      statusBadge: 'SHA-256 Sealed',
      badgeClass: 'bg-emerald-950 text-emerald-400 border-emerald-800'
    },
    {
      id: 'approval',
      step: '06',
      path: '/checklist',
      actionLabel: '06 Execute Final Approval',
      desc: 'Affix Class 3 Hardware DSC Token',
      icon: 'key',
      status: 'pending',
      statusSymbol: '○',
      statusBadge: 'DSC Token Ready',
      badgeClass: 'bg-slate-900 text-slate-400 border-slate-800'
    }
  ];

  // Quick Search Database Items
  const quickSearchResults = [
    { type: 'Tender Ref', label: 'MoPNG/GAIL/2026/TND-001', path: '/dashboard' },
    { type: 'Bidder Entity', label: 'Apex InfraTech Solutions Pvt Ltd', path: '/checklist' },
    { type: 'GSTIN ID', label: '07AAAAC1234D1Z5 (Verified Active)', path: '/inspector' },
    { type: 'Clause Flag', label: 'Clause 4.1 (Entity Name Mismatch)', path: '/inspector' },
    { type: 'Document', label: 'OEM_Valve_Authorization_Form_8B.pdf', path: '/checklist' },
    { type: 'Audit Hash', label: 'SHA256: 2cf24dba5fb0a30e26e83b...', path: '/ledger' },
  ].filter(item =>
    searchQuery.trim() !== '' &&
    (item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getBreadcrumbTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Stage 01: Officer Review Queue';
      case '/inspector':
        return 'Stage 02: Evidence Analysis & OCR Inspection';
      case '/checklist':
      case '/compliance':
        return 'Stage 03: Statutory Compliance Validation';
      case '/ledger':
      case '/audit':
        return 'Stage 05: Cryptographic Audit Ledger';
      default:
        return 'Procurement Review Workflow';
    }
  };

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
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white rounded-md hover:bg-slate-800"
              aria-label="Toggle Workflow Drawer"
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
                    GovTech Engine
                  </span>
                </div>
              </div>
            </NavLink>

            {/* Interactive Global Search */}
            <div className="hidden lg:flex items-center ml-4 relative">
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-72 xl:w-96 h-8 pl-9 pr-3 bg-slate-900 border border-slate-700 rounded-md text-[12px] font-data text-slate-200 placeholder-slate-500 focus:bg-slate-950 focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="Quick Search Tender ID / GSTIN / Clause / Hash..."
                />
              </div>

              {/* Instant Search Dropdown */}
              {isSearchFocused && quickSearchResults.length > 0 && (
                <div className="absolute top-10 left-0 w-96 bg-slate-900 border border-slate-700 rounded-md shadow-2xl z-50 p-2 space-y-1 font-data text-[12px]">
                  <div className="text-[10px] text-slate-400 uppercase font-bold px-2 py-1 border-b border-slate-800">
                    Instant Search Results ({quickSearchResults.length})
                  </div>
                  {quickSearchResults.map((res, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        navigate(res.path);
                        setSearchQuery('');
                        setIsSearchFocused(false);
                      }}
                      className="p-2 hover:bg-slate-800 rounded cursor-pointer flex items-center justify-between text-slate-200"
                    >
                      <span className="truncate">{res.label}</span>
                      <span className="text-[9px] bg-slate-800 text-amber-400 border border-slate-700 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                        {res.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Role Switcher & User Token Status */}
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
                    <span className="font-bold text-[11px] uppercase text-slate-300 font-data">Statutory Flags</span>
                    <span className="text-[10px] bg-red-950 border border-red-700 text-red-300 px-1.5 py-0.5 rounded font-bold font-data">2 Active</span>
                  </div>
                  <div className="space-y-2 text-[12px]">
                    <div className="p-2 rounded bg-slate-800 border border-slate-700">
                      <div className="font-bold text-amber-400">Discrepancy: Clause 4.1</div>
                      <div className="text-slate-300 text-[11px] mt-0.5 font-data">Apex InfraTech vs Apex Pipeline LLC entity mismatch.</div>
                    </div>
                    <div className="p-2 rounded bg-red-950/40 border border-red-900">
                      <div className="font-bold text-red-400">Missing Form 8-B</div>
                      <div className="text-slate-300 text-[11px] mt-0.5 font-data">OEM Valve Authorization missing for Envelope B.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="text-[12px] font-bold text-white leading-tight">{user.name}</div>
                <div className="text-[10px] text-slate-400 font-data">{user.title}</div>
              </div>
              <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-600 text-amber-400 flex items-center justify-center font-bold text-xs">
                <span className="material-symbols-outlined text-[16px]">person</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Workflow-Based Sidebar Navigation */}
      <aside
        className={`fixed left-0 top-[86px] h-[calc(100vh-86px)] w-64 bg-[#061426] text-white border-r border-slate-800 z-40 flex flex-col justify-between overflow-y-auto transition-transform duration-200 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="py-3">
          {/* Active Context Panel */}
          <div className="px-3.5 pb-3 border-b border-slate-800 mb-3 space-y-1.5 bg-[#040E1B] p-3 rounded-md mx-2 border">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-data flex items-center justify-between">
              <span>ACTIVE CONTEXT</span>
              <span className="text-amber-400 bg-amber-950/60 border border-amber-800 px-1 rounded">STAGE 03</span>
            </div>
            <div className="font-data text-[11px] text-white font-bold truncate">
              MoPNG/GAIL/2026/TND-001
            </div>
            <div className="text-[10px] text-slate-300 font-sans truncate">
              Apex InfraTech Solutions
            </div>
            <div className="flex items-center justify-between text-[10px] font-data pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">Risk Score:</span>
              <span className="text-red-400 font-bold">HIGH (60/100)</span>
            </div>
          </div>

          {/* Workflow Stage Menu */}
          <div className="px-3 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-data">
            Procurement Review Workflow
          </div>
          <nav className="px-2 flex flex-col gap-1">
            {workflowStages.map((stage) => {
              const isActive = location.pathname === stage.path || (stage.path === '/dashboard' && location.pathname === '/');
              return (
                <NavLink
                  key={stage.id}
                  to={stage.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full flex flex-col px-3 py-2.5 rounded-md transition-all border ${
                    isActive
                      ? 'bg-slate-800 text-white font-bold border-l-4 border-l-amber-500 border-slate-700 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-data text-[11px] font-bold text-amber-400">{stage.statusSymbol}</span>
                      <span className="text-[12px] font-semibold">{stage.actionLabel}</span>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-data border ${stage.badgeClass}`}>
                      {stage.statusBadge}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal pl-4 mt-0.5 truncate">
                    {stage.desc}
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Integrity Token */}
        <div className="p-3 border-t border-slate-800 bg-[#040E1B]">
          <div className="bg-slate-900 border border-slate-800 rounded-md p-2.5 space-y-1 text-[11px]">
            <div className="flex items-center justify-between font-bold text-amber-400 uppercase font-data">
              <span>STATUTORY ENGINE</span>
              <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1 rounded border border-emerald-800">CVC VERIFIED</span>
            </div>
            <div className="font-data text-[10px] text-slate-400 leading-tight">
              GFR Rule 144(xi) • Sec 65B IT Act
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

      {/* Main Content Area */}
      <main className="lg:pl-64 pt-[86px] min-h-screen">
        {/* Enterprise Breadcrumb Header */}
        <div className="bg-white border-b border-slate-300 px-4 lg:px-8 py-2.5 flex items-center justify-between font-data text-[11px] text-slate-600 shadow-2xs">
          <div className="flex items-center gap-2 flex-wrap">
            <NavLink to="/dashboard" className="text-slate-800 hover:underline font-bold">
              Home
            </NavLink>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-bold">Procurement Review</span>
            <span className="text-slate-400">/</span>
            <span className="text-amber-700 font-bold">Tender MoPNG/GAIL/2026/TND-001</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 font-bold uppercase">{getBreadcrumbTitle()}</span>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <span className="text-slate-500">Active Entity: <strong className="text-slate-900 font-sans">Apex InfraTech Solutions</strong></span>
            <span className="px-2 py-0.5 bg-red-100 text-red-900 rounded font-bold border border-red-200">
              Risk: HIGH (60/100)
            </span>
          </div>
        </div>

        <Outlet context={{ showToast }} />
      </main>

      {/* Global Toast Notification Overlay */}
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
