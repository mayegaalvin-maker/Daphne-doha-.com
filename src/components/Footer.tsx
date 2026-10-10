import React from 'react';
import { 
  MapPin, 
  Phone, 
  MessageCircle, 
  Clock, 
  Truck, 
  Instagram, 
  Heart,
  Crown,
  UserCheck
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface FooterProps {
  onOpenStoreInfo: () => void;
  onOpenRoleModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenStoreInfo, onOpenRoleModal }) => {
  const { storeConfig } = useStore();

  return (
    <footer className="bg-emerald-950 border-t border-emerald-900 text-emerald-100/80 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold text-white tracking-tight">
                Daphine Doha
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-900 text-emerald-200 border border-emerald-700">
                Thrift &amp; Fashion
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 leading-relaxed">
              Curated women's fashion and Grade A second-hand clothing boutique in the heart of Kampala. Daily bale drops, unique 1-of-1 pieces, and tops from UGX 10,000 to UGX 30,000.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a 
                href={storeConfig.instagram}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 hover:text-white border border-emerald-800 transition-colors"
                title="Instagram @daphinedohastore"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href={storeConfig.tiktok}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-2 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 hover:text-white border border-emerald-800 transition-colors text-xs font-bold"
                title="TikTok: Daphine Doha Store (@daphinedohastore)"
              >
                TikTok: Daphine Doha Store
              </a>
              <a 
                href={`https://wa.me/${storeConfig.primaryWhatsApp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs"
                title="WhatsApp Hotline"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Physical Store Location */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Pioneer Mall Store</span>
            </h4>
            <p className="text-xs text-emerald-100">
              <strong>{storeConfig.shopNumber}</strong>, Pioneer Mall<br />
              Burton &amp; Johnston Streets<br />
              Kampala, Uganda
            </p>
            <button
              onClick={onOpenStoreInfo}
              className="text-emerald-300 hover:text-white text-xs font-semibold underline underline-offset-4 cursor-pointer block"
            >
              Directions &amp; Walk-in Fitting Guide
            </button>
            <p className="text-[11px] text-emerald-300/70">
              Fitting rooms available in shop!
            </p>
          </div>

          {/* Direct WhatsApp Ordering */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Hotlines</span>
            </h4>
            <div className="space-y-1.5 text-xs">
              <div>
                <span className="text-emerald-400/80">Primary Order Line:</span>
                <a 
                  href={`https://wa.me/${storeConfig.primaryWhatsApp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-white hover:underline font-semibold"
                >
                  {storeConfig.primaryWhatsApp}
                </a>
              </div>
              <div>
                <span className="text-emerald-400/80">Delivery &amp; Customer Care:</span>
                <a 
                  href={`https://wa.me/${storeConfig.secondaryWhatsApp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-emerald-200 hover:underline font-semibold"
                >
                  {storeConfig.secondaryWhatsApp}
                </a>
              </div>
            </div>
          </div>

          {/* Delivery & Hours */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Hours &amp; Delivery</span>
            </h4>
            <p className="text-xs text-emerald-100">
              {storeConfig.workingHours}
            </p>
            <div className="text-[11px] text-emerald-200/80 space-y-1">
              <p>🛵 <strong>Kampala:</strong> Same-day Boda courier</p>
              <p>📦 <strong>Upcountry:</strong> Regional bus courier</p>
            </div>
          </div>
        </div>

        {/* Bottom bar with Role switcher and copyright */}
        <div className="pt-6 border-t border-emerald-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-emerald-300/60">
          <div>
            © {new Date().getFullYear()} Daphine Doha Store. All rights reserved. Pioneer Mall Shop PF 32/37, Kampala.
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenRoleModal}
              className="text-emerald-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 text-emerald-400" />
              <span>Owner &amp; Staff Login</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
