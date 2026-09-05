import React from 'react';

export interface StatusBadgeProps {
  status: 'verified' | 'warning' | 'error' | 'expired' | 'success' | 'notice' | 'critical' | 'low' | 'medium' | 'info';
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
        return 'bg-[#ECFDF5] border-[#A7F3D0] text-[#047857] font-semibold';
      case 'warning':
      case 'medium':
      case 'notice':
        return 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309] font-semibold';
      case 'error':
      case 'critical':
      case 'expired':
        return 'bg-[#FEF2F2] border-[#FECACA] text-[#B91C1C] font-semibold';
      case 'info':
      default:
        return 'bg-[#F3E8FF] border-[#E9D5FF] text-[#4527A0] font-semibold';
    }
  };

  const getDefaultIcon = () => {
    switch (status) {
      case 'verified':
      case 'success':
      case 'low':
        return 'check_circle';
      case 'warning':
      case 'medium':
        return 'warning';
      case 'error':
      case 'critical':
        return 'cancel';
      case 'expired':
        return 'history';
      default:
        return 'info';
    }
  };

  const activeIcon = icon || getDefaultIcon();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium tracking-tight ${getBadgeStyle()} ${className}`}
    >
      {activeIcon && <span className="material-symbols-outlined text-[13px] shrink-0">{activeIcon}</span>}
      <span>{label}</span>
    </span>
  );
};

