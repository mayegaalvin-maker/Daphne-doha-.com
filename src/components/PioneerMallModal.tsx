import React from 'react';
import { 
  MapPin, 
  X, 
  Phone, 
  MessageCircle, 
  Clock, 
  Truck, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink,
  Navigation
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface PioneerMallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PioneerMallModal: React.FC<PioneerMallModalProps> = ({ isOpen, onClose }) => {
  const { storeConfig } = useStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-emerald-200 rounded-2xl shadow-2xl overflow-hidden text-stone-800">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 p-6 border-b border-emerald-800 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-emerald-300 hover:text-white rounded-full bg-emerald-900/60 hover:bg-emerald-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Physical Store Location &amp; Directions</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            {storeConfig.storeName}
          </h2>
          <p className="text-emerald-200 text-sm font-medium mt-1">
            {storeConfig.location} · <span className="text-emerald-950 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">{storeConfig.shopNumber}</span>
          </p>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick contact / direct buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={`https://wa.me/${storeConfig.primaryWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Hello Daphine Doha Store! I want to visit Shop PF 32/37 at Pioneer Mall today.")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 p-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-sm transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp Store Line</span>
            </a>
            <a
              href={`tel:${storeConfig.phoneCall}`}
              className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-emerald-50 text-emerald-950 rounded-xl font-semibold text-sm border border-emerald-200 transition-colors shadow-2xs"
            >
              <Phone className="w-4 h-4 text-emerald-700" />
              <span>Call: {storeConfig.primaryWhatsApp}</span>
            </a>
          </div>

          {/* Finding the shop inside Pioneer Mall */}
          <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 space-y-3">
            <h3 className="text-sm font-semibold text-emerald-950 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-700" />
              How to Find Us at Pioneer Mall (Kampala Central)
            </h3>
            <ul className="text-xs text-stone-700 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">•</span>
                <span><strong>Building:</strong> Pioneer Mall is located in central Kampala along Burton &amp; Johnston Streets.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">•</span>
                <span><strong>Shop Location:</strong> Look for <strong>Shop PF 32/37</strong>. Head to the main fashion walkway on the floor. Our sign reads <em>Daphine Doha Store</em>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">•</span>
                <span><strong>Walk-in Fittings:</strong> Customers are warmly welcomed to try on clothes! We have clean mirrors and dedicated fitting spaces in the shop.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">•</span>
                <span><strong>Need Help Finding Shop?</strong> Call or WhatsApp our floor team on <strong>+256 787 355533</strong> or <strong>+256 785 891762</strong> and an assistant will guide you directly from the entrance!</span>
              </li>
            </ul>
          </div>

          {/* Hours & Delivery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 space-y-2">
              <div className="flex items-center gap-2 text-emerald-950 font-semibold text-xs">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>Operating Hours</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {storeConfig.workingHours}
              </p>
              <p className="text-[11px] text-emerald-800 font-medium">
                ★ Daily bale unwrappings happen every morning!
              </p>
            </div>

            <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 space-y-2">
              <div className="flex items-center gap-2 text-emerald-950 font-semibold text-xs">
                <Truck className="w-4 h-4 text-emerald-700" />
                <span>Delivery Options</span>
              </div>
              <p className="text-xs text-stone-600">
                • <strong>Kampala:</strong> {storeConfig.deliveryNotesKampala}
              </p>
              <p className="text-xs text-stone-600">
                • <strong>Upcountry:</strong> {storeConfig.deliveryNotesUpcountry}
              </p>
            </div>
          </div>

          {/* About Thrift second-hand note */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>About Our Second-Hand &amp; Thrift Stock</span>
            </div>
            <p className="leading-relaxed text-stone-700">
              Every clothing item at Daphine Doha Store is hand-curated from first-grade bales. Because these are authentic thrift and vintage items, <strong>each piece is unique (1-of-1)</strong>. Once an item is booked or sold, it cannot be restocked in the exact same piece!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-emerald-50/50 border-t border-emerald-100 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            Pioneer Mall PF 32/37 · Kampala, Uganda
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            Back to Catalog
          </button>
        </div>
      </div>
    </div>
  );
};
