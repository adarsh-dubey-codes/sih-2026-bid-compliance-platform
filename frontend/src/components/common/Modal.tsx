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
  icon = 'verified_user',
  children,
  footer,
  maxWidth = 'max-w-lg',
  authorityBadge = 'BID VISHWAS SECURE GATEWAY',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#17152B]/40 flex items-center justify-center p-4">
      <div className={`bg-white rounded-xl ${maxWidth} w-full border border-[#E5E2EC] shadow-lg overflow-hidden`}>
        {/* Header */}
        <div className="bg-[#4527A0] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-white">{icon}</span>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-white tracking-tight leading-tight">{title}</h3>
              <div className="text-[10px] text-white/70 uppercase tracking-wider mt-0.5">{authorityBadge}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-[13px] text-[#17152B] space-y-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-3.5 bg-[#F8F9FC] border-t border-[#E5E2EC] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
