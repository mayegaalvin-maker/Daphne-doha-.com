import React from 'react';
import { 
  X, 
  Crown, 
  UserCheck, 
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Check
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { userSession, employees, switchRole, authenticateAdmin } = useStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-emerald-200 rounded-2xl shadow-2xl p-6 text-stone-800 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-emerald-950 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            Daphine Doha Store Portal Switcher
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-emerald-950">
            Switch Portal Experience
          </h2>
          <p className="text-xs text-stone-600 max-w-sm mx-auto">
            Test and operate the three core roles of the boutique platform:
          </p>
        </div>

        <div className="space-y-3">
          {/* 1. Customer Mode */}
          <div
            onClick={() => {
              switchRole('customer');
              onClose();
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
              userSession.role === 'customer'
                ? 'bg-emerald-100/70 border-emerald-500 shadow-sm'
                : 'bg-stone-50 border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/30'
            }`}
          >
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-stone-900">1. Customer Shopping Portal</h4>
                {userSession.role === 'customer' && (
                  <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Active
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                Browse daily thrift drops, filter tops (UGX 10k-30k), view Pioneer Mall directions, and order directly on WhatsApp.
              </p>
            </div>
          </div>

          {/* 2. Employee Mode */}
          <div
            onClick={() => {
              switchRole('employee');
              onClose();
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
              userSession.role === 'employee'
                ? 'bg-emerald-100/70 border-emerald-500 shadow-sm'
                : 'bg-stone-50 border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/30'
            }`}
          >
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-stone-900">2. Registered Employee Mode</h4>
                {userSession.role === 'employee' && (
                  <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Active
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                Floor staff tools: Snap photos of fresh daily arrivals, auto-assign SKU, and toggle live stock status (available, reserved, sold).
              </p>
            </div>
          </div>

          {/* 3. Shop Owner Controller */}
          <div
            onClick={() => {
              switchRole('owner');
              onClose();
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
              userSession.role === 'owner'
                ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                : 'bg-stone-50 border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/30'
            }`}
          >
            <div className={`p-2.5 rounded-lg shrink-0 ${userSession.role === 'owner' ? 'bg-emerald-900 text-emerald-200' : 'bg-emerald-100 text-emerald-800'}`}>
              <Crown className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className={`text-sm font-bold ${userSession.role === 'owner' ? 'text-white' : 'text-stone-900'}`}>
                  3. Daphine's Owner Admin Controller
                </h4>
                {userSession.role === 'owner' && (
                  <span className="text-[10px] font-bold text-emerald-200 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Active
                  </span>
                )}
              </div>
              <p className={`text-xs mt-0.5 leading-relaxed ${userSession.role === 'owner' ? 'text-emerald-100' : 'text-stone-600'}`}>
                Full administrative control: Edit/delete any listing, manage registered staff permissions, view revenue KPIs, and configure WhatsApp lines.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Portal Switcher */}
        <div className="pt-3 border-t border-emerald-100 space-y-2">
          <span className="text-[11px] font-semibold text-stone-500 block">
            Select Active Portal:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                switchRole('customer');
                onClose();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              🛍️ Customer Boutique
            </button>
            <button
              onClick={() => {
                switchRole('employee');
                onClose();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              👩‍💼 Staff Upload Mode
            </button>
            <button
              onClick={() => {
                switchRole('owner');
                onClose();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              👑 Owner Admin Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
