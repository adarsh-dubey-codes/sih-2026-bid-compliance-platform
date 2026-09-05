import React from 'react';
import { NavLink } from 'react-router-dom';
import type { NavigationPath } from '../types';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  currentPath?: NavigationPath | string;
  onNavigate?: (path: NavigationPath) => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { signOut, user } = useAuth();

  const navSections = [
    {
      groupTitle: 'Overview',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: 'dashboard', badge: '12' },
      ]
    },
    {
      groupTitle: 'Compliance & Review',
      items: [
        { path: '/checklist', label: 'Compliance Checklist', icon: 'checklist', badge: '4/6' },
        { path: '/inspector', label: 'Evidence Inspector', icon: 'find_in_page', badge: 'AI' },
        { path: '/ledger', label: 'Verification Ledger', icon: 'verified', badge: 'Audit' },
      ]
    },
    {
      groupTitle: 'System',
      items: [
        { path: '/supabase-test', label: 'Database & Services', icon: 'dns', badge: 'Cloud' },
      ]
    }
  ];

  return (
    <aside className="h-full w-64 bg-[#4527A0] text-white flex flex-col justify-between select-none">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand Header */}
        <div className="px-5 py-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white text-[#4527A0] flex items-center justify-center font-bold shrink-0">
            <span className="material-symbols-outlined text-[22px]">verified_user</span>
          </div>
          <div className="min-w-0">
            <div className="font-bold text-white text-[15px] tracking-tight leading-tight">
              Bid Vishwas
            </div>
            <div className="text-[10px] text-white/70 font-normal leading-tight mt-0.5 truncate">
              AI-Powered Bid Compliance
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="p-3 space-y-4 flex-1">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/50">
                {section.groupTitle}
              </div>
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                      isActive
                        ? 'bg-white text-[#4527A0] font-semibold'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[19px] shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-white/15 text-white"
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Area: User & Logout */}
      <div className="p-3 border-t border-white/10 bg-[#3B208C]">
        <div className="px-2 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center text-[12px] font-bold shrink-0">
              <span className="material-symbols-outlined text-[16px]">person</span>
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-medium text-white truncate leading-tight">
                {user?.email ? user.email.split('@')[0] : 'Officer Enclave'}
              </div>
              <div className="text-[10px] text-white/60 truncate leading-tight">MoPNG / GeM</div>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            title="Sign Out"
            className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
