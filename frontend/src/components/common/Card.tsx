import React from 'react';

export interface CardProps {
  title?: string;
  subtitle?: string;
  value?: string | number;
  icon?: string;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  valueClassName?: string;
  badge?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  value,
  icon,
  footer,
  children,
  className = '',
  titleClassName = 'text-slate-500',
  valueClassName = 'text-slate-900',
  badge,
}) => {
  return (
    <div className={`bg-white border border-slate-300 p-4 rounded-lg flex flex-col justify-between shadow-xs ${className}`}>
      <div>
        {(title || icon) && (
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              {title && (
                <div className={`text-[11px] uppercase tracking-wider font-semibold font-sans ${titleClassName}`}>
                  {title}
                </div>
              )}
              {value !== undefined && (
                <div className={`text-[28px] font-bold font-data tracking-tight ${valueClassName}`}>
                  {value}
                </div>
              )}
              {subtitle && (
                <div className="text-[12px] text-slate-600 mt-0.5">{subtitle}</div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              {icon && (
                <span className={`material-symbols-outlined text-[24px] ${titleClassName}`}>
                  {icon}
                </span>
              )}
              {badge}
            </div>
          </div>
        )}
        {children}
      </div>

      {footer && (
        <div className="font-data text-[11px] pt-2 mt-2 border-t border-slate-200 flex items-center gap-1 text-slate-600">
          {footer}
        </div>
      )}
    </div>
  );
};
