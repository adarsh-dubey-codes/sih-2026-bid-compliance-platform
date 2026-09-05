import React, { useState, useEffect } from 'react';
import type { UserRole } from '../types';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  onSearch?: (query: string) => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole = 'officer',
  onRoleChange,
  onSearch,
  onToggleMobileMenu,
}) => {
  const { user: authUser, profile, signOut } = useAuth();
  const [timeString, setTimeString] = useState<string>('14:30:00');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const displayName = profile?.full_name || authUser?.email?.split('@')[0] || 'Rajeshwar Rao, IAS';
  const displayTitle = profile?.role ? profile.role : 'Procurement Officer';

  return (
    <header className="h-16 bg-white border-b border-[#E5E2EC] px-4 lg:px-8 flex items-center justify-between z-30 select-none">
      {/* Left: Mobile Toggle & Page Context */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-[#66627A] hover:text-[#17152B] hover:bg-[#F1EFF7] transition-colors"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>
        )}

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[12px] text-[#66627A]">
            <span className="font-medium text-[#17152B]">Tender Ref:</span>
            <span className="font-data font-semibold text-[#4527A0] bg-[#F1EFF7] px-2 py-0.5 rounded border border-[#E5E2EC]">
              MoPNG/GAIL/2026/TND-001
            </span>
          </div>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#66627A] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search Bids, GSTIN, Clause, or SHA-256..."
            className="w-full h-9 pl-9 pr-3 text-[13px] bg-[#F8F9FC] border border-[#E5E2EC] rounded-lg text-[#17152B] placeholder-[#66627A] focus:bg-white focus:border-[#4527A0] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Right: Actions, Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* Live IST Clock */}
        <div className="hidden xl:flex items-center gap-1.5 text-[11px] font-data text-[#66627A] bg-[#F8F9FC] border border-[#E5E2EC] px-2.5 py-1 rounded-md">
          <span className="material-symbols-outlined text-[14px] text-[#4527A0]">schedule</span>
          <span>IST: {timeString}</span>
        </div>

        {/* Role Switcher */}
        {onRoleChange && (
          <div className="hidden sm:flex items-center bg-[#F8F9FC] border border-[#E5E2EC] rounded-lg px-2 py-1">
            <span className="material-symbols-outlined text-[16px] text-[#66627A] mr-1">badge</span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-[12px] font-medium text-[#17152B] focus:outline-none cursor-pointer pr-1"
            >
              <option value="officer">Role: Officer (MoPNG)</option>
              <option value="bidder">Role: Vendor (Bidder)</option>
              <option value="auditor">Role: Auditor (CVC)</option>
            </select>
          </div>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-[#E5E2EC] text-[#66627A] hover:text-[#17152B] hover:bg-[#F8F9FC] transition-colors"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#DC2626]"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E5E2EC] rounded-xl shadow-lg z-50 p-3 space-y-2 text-left">
              <div className="flex items-center justify-between border-b border-[#E5E2EC] pb-2">
                <span className="font-semibold text-[13px] text-[#17152B]">Compliance Alerts</span>
                <span className="text-[10px] bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] px-1.5 py-0.5 rounded font-bold">
                  2 Pending
                </span>
              </div>
              <div className="space-y-2 text-[12px]">
                <div className="p-2.5 rounded-lg bg-[#F8F9FC] border border-[#E5E2EC]">
                  <div className="font-semibold text-[#17152B]">Discrepancy: Clause 4.1</div>
                  <div className="text-[#66627A] text-[11px] mt-0.5">Entity name mismatch requires resolution.</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA]">
                  <div className="font-semibold text-[#DC2626]">Missing Form 8-B</div>
                  <div className="text-[#66627A] text-[11px] mt-0.5">OEM Authorization document required.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Info */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-[#E5E2EC]">
          <div className="text-right hidden md:block">
            <div className="text-[13px] font-semibold text-[#17152B] leading-tight">{displayName}</div>
            <div className="text-[11px] text-[#66627A] leading-tight">{displayTitle}</div>
          </div>
          <button
            onClick={() => signOut()}
            title="Sign Out"
            className="w-8 h-8 rounded-lg bg-[#F1EFF7] text-[#4527A0] flex items-center justify-center font-bold text-xs hover:bg-[#E5E2EC] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
          </button>
        </div>
      </div>
    </header>
  );
};
