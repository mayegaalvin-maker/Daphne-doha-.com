import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { BannerNotice } from './components/BannerNotice';
import { CustomerCatalog } from './components/CustomerCatalog';
import { EmployeePortal } from './components/EmployeePortal';
import { OwnerDashboard } from './components/OwnerDashboard';
import { ItemDetailModal } from './components/ItemDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { PioneerMallModal } from './components/PioneerMallModal';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';
import { BargainModal } from './components/BargainModal';
import { ToastContainer } from './components/ToastContainer';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { Footer } from './components/Footer';
import { ThriftItem, ItemCategory } from './types/store';
import { MessageCircle, ShoppingBag, Sparkles, MapPin, UserCheck, Crown, Handshake } from 'lucide-react';

const MainApp: React.FC = () => {
  const { userSession, storeConfig, cart, switchRole } = useStore();

  const [selectedItem, setSelectedItem] = useState<ThriftItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [storeInfoOpen, setStoreInfoOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory>('all');
  const [bargainModalOpen, setBargainModalOpen] = useState(false);
  const [bargainTargetItem, setBargainTargetItem] = useState<ThriftItem | null>(null);

  const handleOpenBargain = (item?: ThriftItem) => {
    setBargainTargetItem(item || null);
    setBargainModalOpen(true);
  };

  const handleFilterTops = () => {
    setCategoryFilter('tops');
    if (userSession.role !== 'customer') {
      switchRole('customer');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Top Banner Notice */}
      <BannerNotice 
        onOpenStoreInfo={() => setStoreInfoOpen(true)}
        onFilterTops={handleFilterTops}
      />

      {/* Main Navbar */}
      <Navbar
        onOpenCart={() => setCartOpen(true)}
        onOpenStoreInfo={() => setStoreInfoOpen(true)}
        onOpenRoleModal={() => setRoleModalOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
      />

      {/* Main Content Area based on User Role */}
      <main className="flex-1">
        {userSession.role === 'customer' && (
          <CustomerCatalog
            onSelectItem={item => setSelectedItem(item)}
            onOpenStoreInfo={() => setStoreInfoOpen(true)}
            onOpenCart={() => setCartOpen(true)}
            onOpenBargain={handleOpenBargain}
            onOpenNotifications={() => setNotificationsOpen(true)}
            activeCategoryFilter={categoryFilter}
            onClearCategoryFilter={() => setCategoryFilter('all')}
          />
        )}

        {userSession.role === 'employee' && (
          <EmployeePortal
            onOpenStoreInfo={() => setStoreInfoOpen(true)}
            onOpenOwnerPortal={() => switchRole('owner')}
          />
        )}

        {userSession.role === 'owner' && (
          <OwnerDashboard />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenStoreInfo={() => setStoreInfoOpen(true)}
        onOpenRoleModal={() => setRoleModalOpen(true)}
      />

      {/* Floating Fast Action for Mobile (Order/WhatsApp Hotline + Bargain) */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2.5">
        {/* Floating Bargain Hotline button */}
        <button
          onClick={() => handleOpenBargain()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-xs border border-emerald-300 shadow-xl shadow-emerald-950/10 transition-all cursor-pointer hover:scale-105"
          title="Text Daphine your budget and bargain"
        >
          <span>🤝</span>
          <span>Bargain / Name Your Budget</span>
        </button>

        {/* Floating Shopping Bag pill if items in cart */}
        {cart.length > 0 && (
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xl shadow-emerald-950/20 transition-all cursor-pointer animate-bounce"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Bag ({cart.length}) · Order on WhatsApp</span>
          </button>
        )}

        {/* WhatsApp Floating button */}
        <a
          href={`https://wa.me/${storeConfig.primaryWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Hello Daphine Doha Store! 👋 I am browsing your Kampala boutique catalog and would like to place an order.")}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-950/20 transition-all hover:scale-105 cursor-pointer"
          title="Direct WhatsApp Chat"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span className="hidden sm:inline">WhatsApp Us: {storeConfig.primaryWhatsApp}</span>
          <span className="sm:hidden">WhatsApp</span>
        </a>
      </div>

      {/* Modals and Drawers */}
      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onOpenStoreInfo={() => {
          setSelectedItem(null);
          setStoreInfoOpen(true);
        }}
        onOpenCart={() => {
          setSelectedItem(null);
          setCartOpen(true);
        }}
        onOpenBargain={handleOpenBargain}
      />

      <BargainModal
        isOpen={bargainModalOpen}
        item={bargainTargetItem}
        onClose={() => {
          setBargainModalOpen(false);
          setBargainTargetItem(null);
        }}
        onOpenStoreInfo={() => {
          setBargainModalOpen(false);
          setStoreInfoOpen(true);
        }}
      />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onOpenStoreInfo={() => {
          setCartOpen(false);
          setStoreInfoOpen(true);
        }}
      />

      <PioneerMallModal
        isOpen={storeInfoOpen}
        onClose={() => setStoreInfoOpen(false)}
      />

      <RoleSwitcherModal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
      />

      <NotificationCenterModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onFilterTops={handleFilterTops}
        onOpenStoreInfo={() => setStoreInfoOpen(true)}
        onOpenCart={() => setCartOpen(true)}
        onOpenBargain={handleOpenBargain}
      />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}
