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
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  value,
  icon,
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
      className={`bg-white border border-[#E5E2EC] p-5 rounded-[12px] flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:border-[#4527A0] transition-colors' : ''
      } ${className}`}
    >
      <div>
        {(title || icon) && (
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              {title && (
                <div className={`text-[12px] font-medium tracking-tight ${titleClassName}`}>
                  {title}
                </div>
              )}
              {value !== undefined && (
                <div className={`text-[28px] font-bold tracking-tight text-[#17152B] ${valueClassName}`}>
                  {value}
                </div>
              )}
              {subtitle && (
                <div className="text-[12px] text-[#66627A]">{subtitle}</div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              {icon && (
                <div className="w-9 h-9 rounded-lg bg-[#F8F9FC] border border-[#E5E2EC] flex items-center justify-center text-[#4527A0]">
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
        <div className="text-[12px] pt-3 mt-3 border-t border-[#E5E2EC] flex items-center gap-1.5 text-[#66627A]">
          {footer}
        </div>
      )}
    </div>
  );
};

