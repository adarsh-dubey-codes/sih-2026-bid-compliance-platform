import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import type { UserRole } from '../types';

export const MainLayout: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('officer');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const location = useLocation();
  const navigate = useNavigate();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getRoleUser = () => {
    switch (currentRole) {
      case 'officer':
        return { name: 'Rajeshwar Rao, IAS', title: 'Procurement Officer' };
      case 'bidder':
        return { name: 'S. K. Nambiar', title: 'Authorized Signatory' };
      case 'auditor':
        return { name: 'V. K. Shrivastava', title: 'Statutory Auditor' };
    }
  };

  const user = getRoleUser();

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'officer') {
      navigate('/dashboard');
      showToast('Switched to Procurement Officer View');
    } else if (role === 'bidder') {
      navigate('/checklist');
      showToast('Switched to Bidder Submission View');
    } else {
      navigate('/ledger');
      showToast('Switched to Statutory Auditor View');
    }
  };

  const triggerJudgeDemoMode = () => {
    navigate('/inspector');
    showToast('⚡ Judge 2-Min Demo Mode Active! Pre-loaded sample tender (MoPNG/GAIL/2026/TND-001) & 2 issues.');
  };

  // Structured Navigation according to Section 3 specifications
  const navSections = [
    {
      group: 'OVERVIEW',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
      ],
    },
    {
      group: 'BIDS',
      items: [
        { label: 'All Bids', path: '/dashboard', icon: 'folder_open' },
      ],
    },
    {
      group: 'COMPLIANCE',
      items: [
        { label: 'Compliance Checklist', path: '/checklist', icon: 'fact_check' },
        { label: 'Evidence & Documents', path: '/inspector', icon: 'find_in_page' },
      ],
    },
    {
      group: 'VERIFICATION',
      items: [
        { label: 'Verification Ledger', path: '/ledger', icon: 'verified' },
        { label: 'Officer Review', path: '/inspector', icon: 'gavel' },
      ],
    },
  ];

  const quickSearchResults = [
    { type: 'Tender Ref', label: 'MoPNG/GAIL/2026/TND-001', path: '/dashboard' },
    { type: 'Bidder Entity', label: 'Apex InfraTech Solutions Pvt Ltd', path: '/checklist' },
    { type: 'GSTIN ID', label: '07AAAAC1234D1Z5 (Verified Active)', path: '/inspector' },
    { type: 'Issue Found', label: 'Clause 4.1 (Entity Name Mismatch)', path: '/inspector' },
    { type: 'Missing Doc', label: 'OEM_Valve_Authorization_Form_8B.pdf', path: '/checklist' },
  ].filter(item =>
    searchQuery.trim() !== '' &&
    (item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
      case '/':
        return 'Dashboard';
      case '/inspector':
        return 'Document Review & Evidence Inspection';
      case '/checklist':
      case '/compliance':
        return 'Compliance Checklist';
      case '/ledger':
      case '/audit':
        return 'Verification Audit Ledger';
      default:
        return 'Bid Compliance Verification';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#17152B] font-sans antialiased flex flex-col">
      {/* Top Header Shell */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E2EC] h-16 flex items-center justify-between px-6">
        {/* Left Branding / Context Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-[#66627A] hover:text-[#4527A0] rounded-md hover:bg-[#F8F9FC]"
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          <div className="flex items-center gap-3">
            <h1 className="text-[18px] font-bold text-[#17152B] tracking-tight">{getPageTitle()}</h1>
            <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-[#E5E2EC]" />
            <span className="hidden md:inline-block text-[12px] text-[#66627A]">
              Tender: <strong className="text-[#17152B]">MoPNG/GAIL/2026/TND-001</strong>
            </span>
          </div>
        </div>

        {/* Center / Right Quick Tools & Actions */}
        <div className="flex items-center gap-4">
          {/* Judge Demo Mode Launcher */}
          <button
            onClick={triggerJudgeDemoMode}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#4527A0] text-white hover:bg-[#5E35B1] text-[12px] font-medium rounded-lg transition-colors"
            title="Click to launch 2-minute instant judge demo"
          >
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>Judge Demo Mode (2-Min)</span>
          </button>

          {/* Quick Search Input */}
          <div className="hidden lg:flex items-center relative">
            <span className="material-symbols-outlined absolute left-3 text-[#66627A] text-[18px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 h-9 pl-9 pr-3 bg-[#F8F9FC] border border-[#E5E2EC] rounded-lg text-[13px] text-[#17152B] placeholder-[#66627A] focus:outline-none focus:border-[#4527A0] transition-colors"
              placeholder="Search Tender ID / GSTIN / Issue..."
            />

            {isSearchFocused && quickSearchResults.length > 0 && (
              <div className="absolute top-11 left-0 w-80 bg-white border border-[#E5E2EC] rounded-lg shadow-lg z-50 p-2 space-y-1 text-[12px]">
                <div className="text-[10px] text-[#66627A] font-semibold uppercase px-2 py-1 border-b border-[#E5E2EC]">
                  Search Results ({quickSearchResults.length})
                </div>
                {quickSearchResults.map((res, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      navigate(res.path);
                      setSearchQuery('');
                      setIsSearchFocused(false);
                    }}
                    className="p-2 hover:bg-[#F8F9FC] rounded cursor-pointer flex items-center justify-between text-[#17152B]"
                  >
                    <span className="truncate">{res.label}</span>
                    <span className="text-[10px] bg-[#F3E8FF] text-[#4527A0] px-1.5 py-0.5 rounded font-semibold shrink-0">
                      {res.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Role Selector */}
          <div className="hidden md:flex items-center gap-1.5 bg-[#F8F9FC] border border-[#E5E2EC] rounded-lg px-3 py-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#4527A0]">badge</span>
            <select
              value={currentRole}
              onChange={(e) => handleRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-[12px] font-medium text-[#17152B] focus:outline-none cursor-pointer"
            >
              <option value="officer">Procurement Officer</option>
              <option value="bidder">Bidder View</option>
              <option value="auditor">Statutory Auditor</option>
            </select>
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-[#E5E2EC] text-[#66627A] hover:text-[#4527A0] hover:bg-[#F8F9FC] transition-colors relative"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B91C1C]" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E5E2EC] rounded-lg shadow-lg z-50 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5E2EC] pb-2">
                  <span className="font-semibold text-[12px] text-[#17152B]">Notifications</span>
                  <span className="text-[11px] bg-[#FEF2F2] text-[#B91C1C] px-2 py-0.5 rounded-full font-medium">
                    2 Pending Issues
                  </span>
                </div>
                <div className="space-y-2 text-[12px]">
                  <div className="p-2.5 rounded-md bg-[#FFFBEB] border border-[#FDE68A]">
                    <div className="font-semibold text-[#B45309]">Clause 4.1 Mismatch</div>
                    <div className="text-[#66627A] text-[11px] mt-0.5">
                      Apex InfraTech vs Apex Pipeline LLC entity discrepancy.
                    </div>
                  </div>
                  <div className="p-2.5 rounded-md bg-[#FEF2F2] border border-[#FECACA]">
                    <div className="font-semibold text-[#B91C1C]">Missing Authorization</div>
                    <div className="text-[#66627A] text-[11px] mt-0.5">
                      OEM Valve Authorization form missing in Envelope B.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Badge */}
          <div className="flex items-center gap-3 pl-3 border-l border-[#E5E2EC]">
            <div className="w-8 h-8 rounded-lg bg-[#4527A0] text-white flex items-center justify-center font-bold text-xs">
              {user.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-[13px] font-semibold text-[#17152B]">{user.name}</div>
              <div className="text-[11px] text-[#66627A]">{user.title}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex flex-1 pt-16">
        {/* Left Vertical Sidebar (Deep Purple #4527A0) */}
        <aside
          className={`fixed left-0 top-16 bottom-0 w-64 bg-[#4527A0] text-white z-40 flex flex-col justify-between p-4 transition-transform duration-200 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="space-y-6">
            {/* Logo & Tagline */}
            <div className="px-2 pt-2 flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined text-[22px]">shield</span>
              </div>
              <div>
                <div className="font-bold text-white text-[16px] tracking-tight leading-none">Bid Vishwas</div>
                <div className="text-[10px] text-white/70 mt-1 font-normal leading-tight">
                  AI-Powered Bid Compliance Verification
                </div>
              </div>
            </div>

            {/* Navigation Groups */}
            <nav className="space-y-5">
              {navSections.map((group, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-white/50">
                    {group.group}
                  </div>
                  {group.items.map((item, itemIdx) => {
                    const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
                    return (
                      <NavLink
                        key={itemIdx}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                          isActive
                            ? 'bg-white text-[#4527A0] font-semibold shadow-xs'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>

          {/* Bottom Active Tender Info & Logout */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="bg-white/10 rounded-lg p-3 space-y-1 text-white text-[11px]">
              <div className="text-[10px] font-semibold text-white/70 uppercase">Active Review</div>
              <div className="font-semibold text-white truncate">Apex InfraTech Solutions</div>
              <div className="text-white/80 text-[10px]">Tender: MoPNG/GAIL/2026/TND-001</div>
            </div>

            <NavLink
              to="/login"
              className="flex items-center gap-2.5 px-3 py-2 text-[#FEF2F2] hover:bg-white/10 rounded-lg text-[13px] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Sign Out</span>
            </NavLink>
          </div>
        </aside>

        {/* Backdrop for Mobile */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-[#17152B]/40 z-30 lg:hidden"
          />
        )}

        {/* Main Content View with Generous Padding */}
        <main className="lg:pl-64 flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet context={{ showToast }} />
        </main>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-[#17152B] text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-[13px] border border-[#4527A0]/40">
            <span className="material-symbols-outlined text-[#6A3FC7] text-[20px]">
              check_circle
            </span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

