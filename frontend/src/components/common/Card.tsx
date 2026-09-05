import React from 'react';

export interface CardProps {
  title?: string;
  subtitle?: string;
  value?: string | number;
  icon?: string;
  iconColor?: string;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  valueClassName?: string;
  badge?: React.ReactNode;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  value,
  icon,
  iconColor = 'text-[#4527A0]',
  footer,
  children,
  className = '',
  titleClassName = 'text-[#66627A]',
  valueClassName = 'text-[#17152B]',
  badge,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-[#E5E2EC] p-5 rounded-xl flex flex-col justify-between transition-colors ${
        onClick ? 'cursor-pointer hover:border-[#4527A0]' : ''
      } ${className}`}
    >
      <div>
        {(title || icon || value !== undefined) && (
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              {title && (
                <div className={`text-[12px] font-medium tracking-wide uppercase ${titleClassName}`}>
                  {title}
                </div>
              )}
              {value !== undefined && (
                <div className={`text-[26px] font-bold leading-tight tracking-tight ${valueClassName}`}>
                  {value}
                </div>
              )}
              {subtitle && (
                <div className="text-[13px] text-[#66627A] font-normal leading-normal">{subtitle}</div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              {icon && (
                <div className={`w-9 h-9 rounded-lg bg-[#F1EFF7] flex items-center justify-center ${iconColor}`}>
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                </div>
              )}
              {badge}
            </div>
          </div>
        )}
        {children}
      </div>

      {footer && (
        <div className="text-[12px] pt-3 mt-3 border-t border-[#E5E2EC] flex items-center justify-between text-[#66627A]">
          {footer}
        </div>
      )}
    </div>
  );
};
