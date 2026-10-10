import React, { useState } from 'react';
import { 
  X, 
  MessageCircle, 
  ShoppingBag, 
  MapPin, 
  Sparkles, 
  Heart, 
  Share2, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  Layers,
  Tag
} from 'lucide-react';
import { ThriftItem } from '../types/store';
import { useStore } from '../context/StoreContext';

interface ItemDetailModalProps {
  item: ThriftItem | null;
  onClose: () => void;
  onOpenStoreInfo: () => void;
  onOpenCart: () => void;
  onOpenBargain: (item: ThriftItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onOpenStoreInfo,
  onOpenCart,
  onOpenBargain,
}) => {
  const { storeConfig, cart, addToCart, favorites, toggleFavorite, getWhatsAppOrderUrl } = useStore();
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<'pickup' | 'boda_kampala' | 'upcountry'>('pickup');

  if (!item) return null;

  const inCart = cart.some(c => c.id === item.id);
  const isFav = favorites.includes(item.id);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${item.title} - Daphine Doha Store`,
        text: `Check out this thrift piece at Daphine Doha Store (Pioneer Mall PF 32/37) for UGX ${item.price.toLocaleString()}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const whatsAppUrl = getWhatsAppOrderUrl(item, selectedDelivery);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white border border-emerald-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 text-stone-600 hover:text-emerald-950 bg-white/80 hover:bg-white rounded-full transition-colors border border-emerald-100 shadow-2xs cursor-pointer"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Image & Gallery */}
        <div className="md:w-1/2 bg-stone-50 flex flex-col justify-between border-b md:border-b-0 md:border-r border-emerald-100">
          <div className="relative aspect-4/5 sm:aspect-square md:aspect-auto md:h-full min-h-[280px] sm:min-h-[360px] overflow-hidden flex items-center justify-center">
            <img
              src={item.images[selectedImgIdx] || item.images[0]}
              alt={item.title}
              className="w-full h-full object-cover"
            />

            {/* Condition tag over image */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/90 text-emerald-950 border border-emerald-200 backdrop-blur-xs font-mono shadow-2xs">
                {item.code}
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-700 text-white shadow-2xs">
                {item.condition}
              </span>
            </div>

            {/* Status overlay */}
            {item.status !== 'available' && (
              <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center p-4">
                <div className="text-center bg-white border border-stone-200 px-6 py-4 rounded-xl shadow-xl">
                  <span className={`text-sm font-bold uppercase tracking-wider ${item.status === 'sold' ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {item.status === 'sold' ? 'Sold Out' : 'Currently Reserved'}
                  </span>
                  <p className="text-xs text-stone-600 mt-1">
                    {item.reservedBy || 'Customer in store is completing purchase'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Multi-image thumbnail switcher if multiple */}
          {item.images.length > 1 && (
            <div className="p-3 flex items-center gap-2 overflow-x-auto bg-white border-t border-emerald-100">
              {item.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImgIdx(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${selectedImgIdx === idx ? 'border-emerald-600 scale-105 shadow-2xs' : 'border-emerald-100 opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details & Order CTA */}
        <div className="md:w-1/2 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto max-h-[60vh] md:max-h-none text-stone-800">
          <div className="space-y-4">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between gap-2 text-xs text-stone-500 mb-1">
                <span className="capitalize">{item.category}</span>
                <span>·</span>
                <span>Size: <strong className="text-stone-900">{item.size}</strong></span>
                <span>·</span>
                <span className="text-emerald-700 font-medium">{item.color}</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-emerald-950 tracking-tight leading-snug">
                {item.title}
              </h2>
            </div>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 py-2 border-y border-emerald-100">
              <span className="text-3xl font-extrabold text-emerald-700">
                UGX {item.price.toLocaleString()}
              </span>
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="text-sm text-stone-400 line-through">
                  UGX {item.originalPrice.toLocaleString()}
                </span>
              )}
              <span className="text-[11px] font-semibold text-emerald-800 ml-auto bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ⚡ Only 1 piece in stock
              </span>
            </div>

            {/* Second-hand thrift description */}
            <div className="space-y-2 text-xs">
              <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-900 font-semibold">
                  <Tag className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Item Condition &amp; Details</span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  {item.conditionNotes || 'Inspected by Daphine Doha store team. Clean, steamed, ready to wear.'}
                </p>
                {item.material && (
                  <p className="text-stone-500 text-[11px]">
                    <strong>Fabric:</strong> {item.material}
                  </p>
                )}
              </div>
            </div>

            {/* Delivery method choice before ordering */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-700" />
                Select How You Want to Receive This:
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSelectedDelivery('pickup')}
                  className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${selectedDelivery === 'pickup' ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold' : 'bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-900'}`}
                >
                  🏢 Store Pickup
                  <span className="block text-[10px] text-stone-500 font-normal">Pioneer Mall</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDelivery('boda_kampala')}
                  className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${selectedDelivery === 'boda_kampala' ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold' : 'bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-900'}`}
                >
                  🛵 Boda Courier
                  <span className="block text-[10px] text-stone-500 font-normal">In Kampala</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDelivery('upcountry')}
                  className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${selectedDelivery === 'upcountry' ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold' : 'bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-900'}`}
                >
                  📦 Upcountry
                  <span className="block text-[10px] text-stone-500 font-normal">Regional Bus</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-5 space-y-2.5">
            {/* Primary Order directly via WhatsApp */}
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                item.status === 'sold'
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed pointer-events-none'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-950/20'
              }`}
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>
                {item.status === 'sold' 
                  ? 'Sold Out' 
                  : item.status === 'reserved'
                  ? 'Inquire / Reserve Backup on WhatsApp'
                  : 'Order Now via WhatsApp'}
              </span>
            </a>

            {/* Bargain / Name Your Budget Button */}
            <button
              onClick={() => {
                onClose();
                onOpenBargain(item);
              }}
              disabled={item.status === 'sold'}
              className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 shadow-2xs"
            >
              <span>🤝</span>
              <span>Bargain / Text Daphine How Much You Have</span>
            </button>

            {/* Secondary: Add to WhatsApp Bag or Try in store */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  addToCart(item);
                  onOpenCart();
                }}
                disabled={item.status === 'sold'}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-200 disabled:text-stone-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{inCart ? 'View in WhatsApp Bag' : 'Add to Bag (Multi-Order)'}</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-colors cursor-pointer"
                title="Share Item"
                aria-label="Share Item"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {copiedLink && (
              <p className="text-[11px] text-emerald-600 text-center animate-fade-in font-medium">
                ✓ Item link copied to clipboard!
              </p>
            )}

            {/* Store visit notice */}
            <div className="pt-1 flex items-center justify-between text-[11px] text-stone-500 border-t border-emerald-100">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-700" />
                Pioneer Mall, Shop PF 32/37
              </span>
              <button
                onClick={onOpenStoreInfo}
                className="text-emerald-700 hover:underline cursor-pointer font-medium"
              >
                Store Directions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
