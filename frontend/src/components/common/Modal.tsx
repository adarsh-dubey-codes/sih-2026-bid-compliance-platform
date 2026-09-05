import React from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  authorityBadge?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  icon = 'shield',
  children,
  footer,
  maxWidth = 'max-w-lg',
  authorityBadge = 'BID VISHWAS SECURE GATEWAY',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#17152B]/50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-[12px] ${maxWidth} w-full shadow-lg border border-[#E5E2EC] overflow-hidden`}>
        {/* Deep Purple Header */}
        <div className="bg-[#4527A0] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
            </div>
            <div>
              <h3 className="text-[16px] font-bold tracking-tight text-white">{title}</h3>
              <div className="text-[10px] text-white/80 font-medium tracking-wider uppercase">{authorityBadge}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-[14px] text-[#17152B] space-y-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-[#F8F9FC] border-t border-[#E5E2EC] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

