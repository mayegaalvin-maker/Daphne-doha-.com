import React, { useState } from 'react';
import { 
  Crown, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  MapPin, 
  ShoppingBag,
  HelpCircle,
  X,
  MessageCircle,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface AdminLoginProps {
  onSuccess?: () => void;
  onBackToCustomer: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBackToCustomer }) => {
  const { authenticateAdmin, storeConfig } = useStore();

  // Hidden real-time credentials by default (empty inputs)
  const [username, setUsername] = useState(() => {
    try {
      return localStorage.getItem('dds_saved_admin_username') || '';
    } catch {
      return '';
    }
  });
  const [pin, setPin] = useState('');
  const [rememberUser, setRememberUser] = useState(() => {
    try {
      return Boolean(localStorage.getItem('dds_saved_admin_username'));
    } catch {
      return false;
    }
  });
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !pin.trim()) {
      setErrorMsg('Please enter both your Admin username and security PIN.');
      return;
    }

    setLoading(true);

    try {
      const res = await authenticateAdmin(username.trim(), pin.trim());
      if (res.success) {
        if (rememberUser) {
          try {
            localStorage.setItem('dds_saved_admin_username', username.trim());
          } catch {
            // ignore
          }
        } else {
          try {
            localStorage.removeItem('dds_saved_admin_username');
          } catch {
            // ignore
          }
        }
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.message || 'Incorrect credentials. Please verify your username and PIN.');
      }
    } catch {
      setErrorMsg('Login failed. Please check network connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-stone-800">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badge */}
        <div className="flex flex-col items-center text-center space-y-3 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-700 p-0.5 shadow-xl shadow-emerald-950/20 flex items-center justify-center">
            <div className="w-full h-full bg-emerald-800 rounded-2xl flex items-center justify-center">
              <Crown className="w-8 h-8 text-emerald-100" />
            </div>
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Real-Time Business Portal</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-emerald-950 mt-2">
              Daphine Doha Store
            </h2>
            <p className="text-xs text-stone-500 mt-1 flex items-center justify-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>Pioneer Mall, Shop PF 32/37, Kampala</span>
            </p>
          </div>
        </div>

        {/* Real-time Business Security Note */}
        <div className="my-5 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-[11px] text-stone-600 text-center leading-relaxed">
          Authorized owner access for <strong>Daphine Doha Store</strong>. Manage daily thrift arrivals, catalog pricing, and staff admission numbers.
        </div>

        {/* Error notification without credential leakage */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Secure Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 flex items-center justify-between">
              <span>Admin Username / TikTok Business Handle</span>
              <span className="text-[10px] text-stone-400">Owner Access</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="Enter username or business handle"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-emerald-600 font-medium"
              />
              <Crown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 flex items-center justify-between">
              <span>Master Security PIN</span>
              <span className="text-[10px] text-stone-400">Encrypted PIN</span>
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                required
                maxLength={8}
                autoComplete="current-password"
                placeholder="••••"
                value={pin}
                onChange={e => setPin(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-emerald-600 font-mono tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer transition-colors"
                title={showPin ? "Hide PIN" : "Show PIN"}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Username Checkbox & Security Assistance */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-stone-600 select-none">
              <input
                type="checkbox"
                checked={rememberUser}
                onChange={e => setRememberUser(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-500 rounded-xs accent-emerald-700"
              />
              <span>Remember username</span>
            </label>

            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="text-[11px] text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-medium cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Forgot PIN?</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-950/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Verifying Store Credentials...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Sign In to Admin Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Back to customer catalog link */}
        <div className="mt-6 pt-5 border-t border-emerald-100 flex items-center justify-center text-xs">
          <button
            onClick={onBackToCustomer}
            className="text-stone-500 hover:text-emerald-800 flex items-center gap-1.5 transition-colors cursor-pointer font-medium"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
            <span>Return to Customer Catalog</span>
          </button>
        </div>
      </div>

      {/* Real-time Business Security & Access Recovery Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white border border-emerald-200 rounded-3xl shadow-2xl p-6 text-stone-800 space-y-5">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-emerald-950 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="font-serif text-xl font-bold text-emerald-950">
                Real-Time Credential Security
              </h3>
              <p className="text-xs text-stone-600">
                Daphine Doha Store · Pioneer Mall PF 32/37
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs text-stone-700 space-y-2.5 leading-relaxed">
              <p className="font-semibold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Protected Business Storefront</span>
              </p>
              <p>
                To safeguard the boutique in real time against unauthorized customer access, administrator credentials and PINs are private and hidden from public display.
              </p>
              <p>
                If you are Daphine Doha and need to verify or reset your administrative credentials, you can contact the registered store owner hotline directly via WhatsApp:
              </p>
            </div>

            <div className="space-y-2.5">
              <a
                href={`https://wa.me/${storeConfig.primaryWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Hello Daphine Doha Store, I am requesting owner portal PIN verification for the Pioneer Mall store.")}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Verify via WhatsApp ({storeConfig.primaryWhatsApp})</span>
              </a>

              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close &amp; Return to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
