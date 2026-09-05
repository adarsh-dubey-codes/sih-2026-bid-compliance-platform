import React from 'react';
import type { NavigationPath } from '../types';

interface SidebarProps {
  currentPath: NavigationPath;
  onNavigate: (path: NavigationPath) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const navItems = [
    {
      path: 'officer-review-queue' as NavigationPath,
      label: 'Officer Review Queue',
      icon: 'fact_check',
      badge: '12 Tenders'
    },
    {
      path: 'split-screen-evidence-inspector' as NavigationPath,
      label: 'Evidence Inspector',
      icon: 'vertical_split',
      badge: 'AI Split'
    },
    {
      path: 'bidder-submission-portal' as NavigationPath,
      label: 'Bidder Checklist & DSC',
      icon: 'checklist_rtl',
      badge: '4/6 Compliant'
    },
    {
      path: 'cryptographic-audit-ledger' as NavigationPath,
      label: 'Audit Ledger & SHA-256',
      icon: 'lock_clock',
      badge: 'Fabric 2.5'
    }
  ];

  return (
    <aside className="fixed left-0 top-[88px] h-[calc(100vh-88px)] w-64 bg-[#ffffff] border-r border-[#c8c4d5] z-40 flex flex-col justify-between overflow-y-auto">
      <div className="py-4">
        {/* Module Header */}
        <div className="px-4 pb-3 border-b border-[#c8c4d5] mb-3">
          <div className="text-[11px] font-semibold text-[#777584] uppercase tracking-wider">
            Institutional Modules
          </div>
          <div className="font-mono text-[12px] text-[#3730a3] font-bold mt-1">
            MoPNG / E-PROC / 2026
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-2 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-[#3730a3] text-white font-semibold shadow-sm'
                    : 'text-[#464553] hover:bg-[#dce9ff] hover:text-[#0d1c2e]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px]">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive
                      ? 'bg-[#1f108e] text-white'
                      : 'bg-[#eff4ff] text-[#464553]'
                  }`}
                >
                  {item.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Statutory Footer Badge */}
      <div className="p-4 border-t border-[#c8c4d5] bg-[#eff4ff]">
        <div className="bg-[#ffffff] border border-[#c8c4d5] rounded-lg p-3 shadow-xs">
          <div className="flex items-center gap-1.5 text-[#1f108e] text-[11px] font-bold">
            <span className="material-symbols-outlined text-[14px]">gavel</span>
            <span>Statutory Rigor</span>
          </div>
          <div className="font-mono text-[11px] text-[#464553] mt-1 leading-tight">
            CVC Manual 2024 & GFR Rule 144 Compliant
          </div>
          <div className="mt-2 pt-2 border-t border-[#c8c4d5] flex items-center justify-between text-[#777584] text-[11px]">
            <span>Server Integrity</span>
            <span className="text-[#4b41e1] font-bold">100% OK</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
