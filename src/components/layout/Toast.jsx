import React from 'react';
import { CheckCircle2, AlertCircle, Info, X, RotateCcw } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl bg-white shadow-popover border border-[#E2E8F0] transition-all transform animate-in slide-in-from-bottom-2 duration-200"
          >
            <div className="flex items-center gap-3">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#76C893] flex-shrink-0" />}
              {isError && <AlertCircle className="w-5 h-5 text-[#B91C1C] flex-shrink-0" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-[#168AAD] flex-shrink-0" />}
              <span className="text-sm font-medium text-[#184E77] leading-tight">{toast.message}</span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {toast.undoAction && (
                <button
                  type="button"
                  onClick={() => {
                    toast.undoAction();
                    onDismiss(toast.id);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#E0F2FE] text-[#168AAD] hover:bg-[#BAE6FD] transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Desfazer
                </button>
              )}
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="p-1 text-[#94A3B8] hover:text-[#475569] rounded-md transition-colors"
                aria-label="Fechar notificação"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
