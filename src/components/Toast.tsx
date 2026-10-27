import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'error';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const typeConfig = {
    success: {
      bg: 'bg-emerald-900/95 text-white border-emerald-700',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    },
    info: {
      bg: 'bg-slate-900/95 text-white border-slate-700',
      icon: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
    },
    error: {
      bg: 'bg-rose-900/95 text-white border-rose-700',
      icon: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    },
  }[toast.type || 'info'];

  return (
    <div
      className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-center justify-between gap-3 text-xs backdrop-blur-xs animate-in slide-in-from-bottom-2 duration-200 ${typeConfig.bg}`}
    >
      <div className="flex items-center gap-2.5">
        {typeConfig.icon}
        <span className="font-medium leading-snug">{toast.text}</span>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-white/60 hover:text-white p-1 rounded transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
