import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Trash2, 
  Flame, 
  ShoppingBag, 
  Megaphone, 
  Handshake, 
  Sparkles, 
  ExternalLink, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  MapPin, 
  ShieldCheck 
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { StoreNotification, NotificationType } from '../types/store';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterTops?: () => void;
  onOpenStoreInfo?: () => void;
  onOpenCart?: () => void;
  onOpenBargain?: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onFilterTops,
  onOpenStoreInfo,
  onOpenCart,
  onOpenBargain,
}) => {
  const { 
    notifications, 
    unreadNotificationsCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    deleteNotification, 
    clearAllNotifications,
    storeConfig,
    pushPermission,
    requestPushPermission,
    switchRole
  } = useStore();

  const [activeTab, setActiveTab] = useState<'all' | 'drops' | 'orders' | 'announcements'>('all');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'drops') return n.type === 'drop';
    if (activeTab === 'orders') return n.type === 'order';
    if (activeTab === 'announcements') return n.type === 'announcement' || n.type === 'deal' || n.type === 'system';
    return true;
  });

  const handleActionClick = (notif: StoreNotification) => {
    markNotificationAsRead(notif.id);

    if (notif.linkAction === 'tops') {
      onFilterTops?.();
      onClose();
    } else if (notif.linkAction === 'cart') {
      onOpenCart?.();
      onClose();
    } else if (notif.linkAction === 'store_info') {
      onOpenStoreInfo?.();
      onClose();
    } else if (notif.linkAction === 'bargain') {
      onOpenBargain?.();
      onClose();
    } else if (notif.linkAction === 'whatsapp') {
      const cleanPhone = storeConfig.primaryWhatsApp.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    } else if (notif.linkAction === 'tiktok') {
      window.open(storeConfig.tiktok, '_blank');
    } else if (notif.linkAction === 'catalog') {
      switchRole('customer');
      onClose();
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'drop':
        return <Flame className="w-4 h-4 text-amber-600" />;
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      case 'deal':
        return <Handshake className="w-4 h-4 text-emerald-700" />;
      case 'announcement':
      default:
        return <Megaphone className="w-4 h-4 text-emerald-800" />;
    }
  };

  const getNotificationBadge = (type: NotificationType) => {
    switch (type) {
      case 'drop':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Fresh Drop 🔥</span>;
      case 'order':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Order &amp; Bag 🛍️</span>;
      case 'deal':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">Bargain Deal 🤝</span>;
      case 'announcement':
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200">Notice 📢</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-emerald-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-labelledby="notification-modal-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-800/80 border border-emerald-700 text-emerald-300 relative">
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-emerald-950">
                  {unreadNotificationsCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="notification-modal-title" className="font-serif text-lg sm:text-xl font-bold tracking-tight">
                  Store Notifications &amp; Alerts
                </h3>
                {unreadNotificationsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white">
                    {unreadNotificationsCount} unread
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-200/80">
                Fresh bale unpackings, drop alerts &amp; Kampala store notices
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800/60 transition-colors cursor-pointer"
            aria-label="Close notifications"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top actions bar: Push notification toggle & bulk actions */}
        <div className="bg-emerald-50/70 border-b border-emerald-100 px-4 sm:px-5 py-3 shrink-0 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Browser Push status */}
          <div className="flex items-center gap-2">
            {pushPermission === 'granted' ? (
              <span className="flex items-center gap-1.5 text-emerald-800 font-medium bg-emerald-100/80 px-2.5 py-1 rounded-xl border border-emerald-200 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Browser alerts active</span>
              </span>
            ) : pushPermission === 'denied' ? (
              <span className="text-stone-500 text-[11px]">
                Browser alerts blocked in browser settings
              </span>
            ) : (
              <button
                onClick={() => requestPushPermission()}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] transition-colors shadow-2xs cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Enable Browser Drop Alerts</span>
              </button>
            )}
          </div>

          {/* Bulk actions */}
          <div className="flex items-center gap-2">
            {unreadNotificationsCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-semibold cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="flex items-center gap-1 text-stone-500 hover:text-rose-700 font-medium ml-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear history</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-4 sm:px-5 pt-3 pb-2 border-b border-stone-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Updates ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('drops')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'drops'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            🔥 Drops &amp; Stock ({notifications.filter(n => n.type === 'drop').length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            🛍️ Bag &amp; Orders ({notifications.filter(n => n.type === 'order').length})
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'announcements'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            📢 Notices &amp; Deals ({notifications.filter(n => n.type === 'announcement' || n.type === 'deal').length})
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 divide-y divide-stone-100">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Bell className="w-7 h-7 stroke-1 text-emerald-500" />
              </div>
              <h4 className="font-serif text-base font-bold text-stone-800">
                You're All Caught Up!
              </h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                No notifications in this category right now. Fresh thrift arrivals and announcements will appear here.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              return (
                <div 
                  key={notif.id}
                  className={`pt-3 first:pt-0 transition-all ${!notif.read ? 'bg-emerald-50/50 -mx-2 px-3 py-3 rounded-2xl border border-emerald-100/80 shadow-2xs' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="p-2 rounded-xl bg-white border border-stone-200 shadow-2xs shrink-0 mt-0.5">
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-2">
                          {getNotificationBadge(notif.type)}
                          <span className="text-[11px] text-stone-400 font-medium">
                            {notif.timestamp}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {!notif.read && (
                            <span 
                              className="w-2 h-2 rounded-full bg-emerald-600" 
                              title="Unread"
                            />
                          )}
                          <button
                            onClick={() => deleteNotification(notif.id)}
                            className="p-1 text-stone-300 hover:text-stone-600 rounded transition-colors cursor-pointer"
                            title="Remove notification"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-stone-900">
                        {notif.title}
                      </h4>

                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Author tag if available */}
                      {notif.authorName && (
                        <div className="mt-1 text-[10px] text-emerald-800/70 font-medium">
                          From: {notif.authorName}
                        </div>
                      )}

                      {/* Action CTA */}
                      {notif.actionLabel && (
                        <div className="mt-2.5 flex items-center gap-2">
                          <button
                            onClick={() => handleActionClick(notif)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer hover:scale-102"
                          >
                            <span>{notif.actionLabel}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                          {!notif.read && (
                            <button
                              onClick={() => markNotificationAsRead(notif.id)}
                              className="text-[11px] text-stone-500 hover:text-stone-800 font-medium px-2 py-1 cursor-pointer"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info banner */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 text-center text-xs text-stone-600 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
            <MapPin className="w-3 h-3 text-emerald-700" />
            <span>Pioneer Mall PF 32/37 · Kampala, Uganda</span>
          </div>

          <a 
            href={`https://wa.me/${storeConfig.primaryWhatsApp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
          >
            <span>Direct WhatsApp: {storeConfig.primaryWhatsApp}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
