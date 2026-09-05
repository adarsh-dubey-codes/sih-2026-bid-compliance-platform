import React from 'react';

export interface StatusBadgeProps {
  status: 'verified' | 'warning' | 'error' | 'expired' | 'success' | 'notice' | 'critical' | 'low' | 'medium';
  label: string;
  icon?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, icon, className = '' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'verified':
      case 'success':
      case 'low':
        return 'bg-emerald-950/10 border-emerald-700/40 text-emerald-800 font-semibold';
      case 'warning':
      case 'medium':
      case 'notice':
        return 'bg-amber-950/10 border-amber-600/40 text-amber-900 font-semibold';
      case 'error':
      case 'critical':
      case 'expired':
        return 'bg-red-950/10 border-red-700/40 text-red-900 font-bold';
      default:
        return 'bg-slate-100 border-slate-300 text-slate-700 font-medium';
    }
  };

  const getDefaultIcon = () => {
    switch (status) {
      case 'verified':
      case 'success':
      case 'low':
        return 'verified';
      case 'warning':
      case 'medium':
        return 'warning';
      case 'error':
      case 'critical':
        return 'gavel';
      case 'expired':
        return 'history';
      default:
        return 'info';
    }
  };

  const activeIcon = icon || getDefaultIcon();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] uppercase tracking-wider ${getBadgeStyle()} ${className}`}
    >
      {activeIcon && <span className="material-symbols-outlined text-[13px] shrink-0">{activeIcon}</span>}
      <span>{label}</span>
    </span>
  );
};
