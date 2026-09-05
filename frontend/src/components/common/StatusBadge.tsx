import React from 'react';

export interface StatusBadgeProps {
  status: 'verified' | 'warning' | 'error' | 'expired' | 'success' | 'notice' | 'critical' | 'low' | 'medium' | 'pending' | 'compliant' | 'non-compliant' | string;
  label?: string;
  icon?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, icon, className = '' }) => {
  const normalized = status.toLowerCase();

  const getBadgeStyle = () => {
    switch (normalized) {
      case 'verified':
      case 'success':
      case 'compliant':
      case 'low':
      case 'passed':
        return 'bg-[#ECFDF5] border-[#A7F3D0] text-[#059669] font-semibold';
      case 'warning':
      case 'medium':
      case 'notice':
      case 'pending':
        return 'bg-[#FFFBEB] border-[#FDE68A] text-[#D97706] font-semibold';
      case 'error':
      case 'critical':
      case 'expired':
      case 'failed':
      case 'non-compliant':
        return 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626] font-bold';
      default:
        return 'bg-[#F1EFF7] border-[#E5E2EC] text-[#5E35B1] font-medium';
    }
  };

  const getDefaultIcon = () => {
    switch (normalized) {
      case 'verified':
      case 'success':
      case 'compliant':
      case 'low':
      case 'passed':
        return 'check_circle';
      case 'warning':
      case 'medium':
      case 'notice':
      case 'pending':
        return 'schedule';
      case 'error':
      case 'critical':
      case 'expired':
      case 'failed':
      case 'non-compliant':
        return 'cancel';
      default:
        return 'info';
    }
  };

  const activeIcon = icon !== undefined ? icon : getDefaultIcon();
  const displayLabel = label || status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[11px] tracking-wide uppercase ${getBadgeStyle()} ${className}`}
    >
      {activeIcon && <span className="material-symbols-outlined text-[13px] shrink-0">{activeIcon}</span>}
      <span>{displayLabel}</span>
    </span>
  );
};
