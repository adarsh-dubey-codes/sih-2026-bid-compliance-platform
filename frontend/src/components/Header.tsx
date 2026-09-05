import React, { useState, useEffect } from 'react';
import type { UserRole } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRole, onRoleChange }) => {
  const [timeString, setTimeString] = useState<string>('14:32:08');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTimeString(now.toTimeString().split(' ')[0]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#ffffff]">
      {/* Top Ministry Banner */}
      <div className="bg-[#3730a3] text-[#ffffff] px-6 h-7 flex items-center justify-between text-[11px] font-semibold tracking-wider uppercase border-b border-[#3a388b]">
        <div className="flex items-center gap-2">
          <span>GOVERNMENT OF INDIA</span>
          <span className="opacity-40">|</span>
          <span>MINISTRY OF PETROLEUM & NATURAL GAS</span>
          <span className="opacity-40">|</span>
          <span className="text-[#a9a7ff]">GeM STATUTORY PROCUREMENT PORTAL</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 font-mono text-[#a9a7ff]">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            <span>NIC-NTP IST: {timeString} (+05:30)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="opacity-40">|</span>
            <button className="px-1 hover:bg-[#3a388b] rounded">A-</button>
            <button className="px-1 hover:bg-[#3a388b] rounded font-bold">A</button>
            <button className="px-1 hover:bg-[#3a388b] rounded">A+</button>
            <span className="opacity-40">|</span>
            <span className="cursor-pointer hover:underline text-[#a9a7ff]">हिन्दी</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="h-[60px] px-6 flex items-center justify-between border-b border-[#c8c4d5] bg-[#ffffff]">
        {/* Brand & Search */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1f108e] text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">
              <span className="material-symbols-outlined text-[22px]">verified_user</span>
            </div>
            <div className="leading-tight">
              <div className="font-bold text-[#1f108e] text-[16px] tracking-tight flex items-center gap-1.5">
                <span>Bid Vishwas</span>
                <span className="text-[10px] bg-[#e6eeff] text-[#1f108e] px-1.5 py-0.2 rounded font-semibold uppercase">v4.2 AI</span>
              </div>
              <div className="text-[10px] text-[#777584] font-medium uppercase tracking-wider">
                Statutory Bid Compliance Verification System
              </div>
            </div>
          </div>

          <div className="hidden xl:flex items-center ml-4">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#777584] text-[18px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 h-9 pl-9 pr-3 bg-[#eff4ff] border border-[#c8c4d5] rounded-lg text-[13px] text-[#0d1c2e] placeholder-[#777584] focus:bg-[#ffffff] focus:border-[#3730a3] focus:outline-none transition-colors"
                placeholder="Search Tender Ref / NIT / GSTIN / SHA-256 Digest..."
              />
            </div>
          </div>
        </div>

        {/* Right Tools & Role Switcher */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1 bg-[#eff4ff] border border-[#c8c4d5] rounded-lg px-2 py-1">
            <span className="material-symbols-outlined text-[16px] text-[#777584]">badge</span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-[12px] font-semibold text-[#0d1c2e] focus:outline-none pr-1 cursor-pointer"
            >
              <option value="officer">Role: Procurement Officer (MoPNG)</option>
              <option value="bidder">Role: Bidder Enclave (Vendor)</option>
              <option value="auditor">Role: Statutory Auditor & Admin</option>
            </select>
          </div>

          {/* Notifications Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex items-center justify-center w-8 h-8 rounded-lg border border-[#c8c4d5] text-[#0d1c2e] hover:bg-[#e6eeff] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#c8c4d5] rounded-xl shadow-xl z-50 p-3 space-y-2 text-left">
                <div className="flex items-center justify-between border-b border-[#c8c4d5] pb-2">
                  <span className="font-bold text-[13px] text-[#0d1c2e]">System Notifications</span>
                  <span className="text-[10px] bg-[#ffdad6] text-[#ba1a1a] px-1.5 py-0.5 rounded font-bold">2 Action Req</span>
                </div>
                <div className="space-y-2 text-[12px]">
                  <div className="p-2 rounded bg-[#eff4ff] border border-[#d5e3fc]">
                    <div className="font-semibold text-[#1f108e]">Discrepancy Latched: NIT MoPNG/GAIL</div>
                    <div className="text-[#464553] text-[11px] mt-0.5">Clause 4.1 entity mismatch requires resolution before deadline.</div>
                  </div>
                  <div className="p-2 rounded bg-[#ffdad6]/40 border border-[#ffdad6]">
                    <div className="font-semibold text-[#ba1a1a]">Missing Mandatory OEM Form 8-B</div>
                    <div className="text-[#464553] text-[11px] mt-0.5">Upload required for Envelope B technical qualification.</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-[#c8c4d5]">
            <div className="text-right hidden sm:block">
              <div className="text-[12px] font-bold text-[#0d1c2e] leading-tight">{user.name}</div>
              <div className="text-[11px] text-[#464553] flex items-center justify-end gap-1">
                <span className="material-symbols-outlined text-[13px] text-[#4b41e1]">verified_user</span>
                <span>DSC Class 3 Active</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#1f108e] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
