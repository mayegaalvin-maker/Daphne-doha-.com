import React, { useState } from 'react';
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Sparkles, 
  Heart, 
  UserCheck, 
  Crown, 
  ChevronDown,
  Menu,
  X,
  ExternalLink,
  Bell
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface NavbarProps {
  onOpenCart: () => void;
  onOpenStoreInfo: () => void;
  onOpenRoleModal: () => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCart,
  onOpenStoreInfo,
  onOpenRoleModal,
  onOpenNotifications,
}) => {
  const { storeConfig, userSession, cart, favorites, switchRole, unreadNotificationsCount } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md text-stone-900 border-b border-emerald-100 shadow-xs">
      {/* Top micro-bar for Kampala location & Direct WhatsApp */}
      <div className="bg-emerald-950 px-4 py-1.5 text-xs text-emerald-200 border-b border-emerald-900">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <button 
              onClick={onOpenStoreInfo}
              className="flex items-center gap-1.5 text-emerald-300 hover:text-white transition-colors font-medium cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{storeConfig.location} · {storeConfig.shopNumber}</span>
            </button>
            <span className="hidden sm:inline text-emerald-800">|</span>
            <span className="hidden md:inline text-emerald-300/80">{storeConfig.workingHours}</span>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href={`https://wa.me/${storeConfig.primaryWhatsApp.replace(/[^0-9]/g, '')}`} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1.5 text-emerald-300 hover:text-white transition-colors font-medium"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp: {storeConfig.primaryWhatsApp}</span>
            </a>
            <span className="text-emerald-800">·</span>
            <a 
              href={`tel:${storeConfig.phoneCall}`}
              className="flex items-center gap-1 text-emerald-300 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span className="hidden sm:inline">Call Shop</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-emerald-950">
                Daphine Doha
              </span>
              <span className="text-[10px] tracking-widest font-semibold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Thrift &amp; Vintage
              </span>
            </div>
            <p className="text-[11px] text-emerald-800/70 font-normal hidden sm:block">
              Curated Grade A Second-Hand Drops · Kampala, Uganda
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Mode indicator & switcher button */}
          <button
            onClick={onOpenRoleModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border cursor-pointer bg-emerald-50/70 hover:bg-emerald-100/70 border-emerald-200 text-emerald-950 shadow-2xs"
            title="Switch between Customer, Employee, and Owner modes"
          >
            {userSession.role === 'owner' ? (
              <>
                <Crown className="w-3.5 h-3.5 text-emerald-700" />
                <span className="font-semibold text-emerald-900">
                  {userSession.isAuthenticatedStaff ? "Daphine (Admin Active)" : "Admin Portal Login"}
                </span>
              </>
            ) : userSession.role === 'employee' ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold text-emerald-800">
                  {userSession.isAuthenticatedStaff ? (userSession.staffName || "Staff Active") : "Staff Login"}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-900 font-medium">Customer View</span>
              </>
            )}
            <ChevronDown className="w-3 h-3 text-emerald-700 ml-0.5" />
          </button>

          {/* Quick WhatsApp chat */}
          <a
            href={`https://wa.me/${storeConfig.primaryWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Hello Daphine Doha Store! I am viewing your online thrift catalog and have an inquiry.")}`}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>Chat on WhatsApp</span>
          </a>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-stone-700 hover:text-emerald-950 hover:bg-emerald-50 transition-colors border border-emerald-200/80 cursor-pointer shadow-2xs"
            aria-label="View notifications"
            title="Store Notifications & Drop Alerts"
          >
            <Bell className="w-4 h-4 text-emerald-800" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs animate-pulse ring-2 ring-white">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Bag / Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            aria-label="Open Shopping Bag"
          >
            <ShoppingBag className="w-4 h-4 text-white" />
            <span className="hidden xs:inline">WhatsApp Bag</span>
            {cart.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-emerald-900 text-[11px] font-extrabold flex items-center justify-center ml-0.5 shadow-2xs">
                {cart.length}
              </span>
            )}
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-stone-600 hover:text-emerald-900 rounded-lg focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-t border-emerald-100 px-4 py-3 space-y-3 shadow-md">
          <div className="flex items-center justify-between text-xs text-stone-600 pb-2 border-b border-emerald-100">
            <span>Pioneer Mall, Shop PF 32/37</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenNotifications();
                }}
                className="text-emerald-800 font-bold flex items-center gap-1"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Alerts ({unreadNotificationsCount})</span>
              </button>
              <span>·</span>
              <button 
                onClick={() => { setMobileMenuOpen(false); onOpenStoreInfo(); }}
                className="text-emerald-700 font-semibold"
              >
                Map
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                switchRole('customer');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-left font-medium border ${userSession.role === 'customer' ? 'bg-emerald-100/70 border-emerald-400 text-emerald-950 font-bold' : 'bg-stone-50 border-stone-200 text-stone-700'}`}
            >
              👗 Customer Catalog
            </button>
            <button
              onClick={() => {
                switchRole('employee');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-left font-medium border ${userSession.role === 'employee' ? 'bg-emerald-100/70 border-emerald-400 text-emerald-950 font-bold' : 'bg-stone-50 border-stone-200 text-stone-700'}`}
            >
              📲 Staff Upload Mode
            </button>
            <button
              onClick={() => {
                switchRole('owner');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-left font-medium border col-span-2 ${userSession.role === 'owner' ? 'bg-emerald-800 text-white border-emerald-900 font-bold' : 'bg-stone-50 border-stone-200 text-stone-700'}`}
            >
              👑 Daphine's Owner Admin Controller
            </button>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <a
              href={`https://wa.me/${storeConfig.primaryWhatsApp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600 text-white font-medium text-xs shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp ({storeConfig.primaryWhatsApp})
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
