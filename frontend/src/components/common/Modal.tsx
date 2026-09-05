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
  icon = 'gavel',
  children,
  footer,
  maxWidth = 'max-w-lg',
  authorityBadge = 'NIC SECURE GATEWAY',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`bg-white rounded-lg ${maxWidth} w-full shadow-2xl border border-slate-300 overflow-hidden`}>
        {/* Institutional Header */}
        <div className="bg-[#0B192C] text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[22px] text-slate-300">{icon}</span>
            <div>
              <h3 className="text-[16px] font-bold font-display tracking-tight text-white">{title}</h3>
              <div className="text-[10px] font-data text-slate-400 uppercase tracking-widest">{authorityBadge}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-800"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 text-[13px] text-slate-800 space-y-3">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
