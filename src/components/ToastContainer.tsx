import React from 'react';
import { 
  Sparkles, 
  ShoppingBag, 
  CheckCircle2, 
  Flame, 
  AlertCircle, 
  X, 
  Bell, 
  ArrowRight 
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ToastItem } from '../types/store';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed bottom-4 left-4 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => {
        const isCart = toast.type === 'cart';
        const isDrop = toast.type === 'drop';
        const isWarning = toast.type === 'warning';
        const isSuccess = toast.type === 'success';

        let borderColor = 'border-emerald-200';
        let bgIconColor = 'bg-emerald-100 text-emerald-800';
        let IconComponent = Sparkles;

        if (isCart) {
          borderColor = 'border-emerald-400';
          bgIconColor = 'bg-emerald-700 text-white';
          IconComponent = ShoppingBag;
        } else if (isDrop) {
          borderColor = 'border-amber-300';
          bgIconColor = 'bg-amber-100 text-amber-800';
          IconComponent = Flame;
        } else if (isWarning) {
          borderColor = 'border-rose-300';
          bgIconColor = 'bg-rose-100 text-rose-800';
          IconComponent = AlertCircle;
        } else if (isSuccess) {
          borderColor = 'border-emerald-300';
          bgIconColor = 'bg-emerald-100 text-emerald-700';
          IconComponent = CheckCircle2;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-emerald-950/10 border ${borderColor} p-3.5 flex items-start gap-3 transition-all transform animate-in slide-in-from-bottom-5 duration-300`}
            role="status"
          >
            <div className={`p-2 rounded-xl shrink-0 ${bgIconColor}`}>
              <IconComponent className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <h4 className="text-xs font-bold text-stone-900 leading-tight truncate">
                  {toast.title}
                </h4>
              </div>
              <p className="text-[11px] text-stone-600 leading-snug line-clamp-2">
                {toast.message}
              </p>

              {toast.actionLabel && toast.onAction && (
                <button
                  onClick={() => {
                    toast.onAction?.();
                    removeToast(toast.id);
                  }}
                  className="mt-2 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>{toast.actionLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors shrink-0 cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
