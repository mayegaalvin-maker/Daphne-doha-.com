import React, { useState } from 'react';
import { 
  X, 
  MessageCircle, 
  Tag, 
  DollarSign, 
  Sparkles, 
  MapPin, 
  ArrowRight,
  TrendingDown,
  Smile,
  ShieldCheck
} from 'lucide-react';
import { ThriftItem } from '../types/store';
import { useStore } from '../context/StoreContext';

interface BargainModalProps {
  isOpen: boolean;
  item: ThriftItem | null;
  onClose: () => void;
  onOpenStoreInfo: () => void;
}

export const BargainModal: React.FC<BargainModalProps> = ({
  isOpen,
  item,
  onClose,
  onOpenStoreInfo,
}) => {
  const { storeConfig, addToast, addNotification } = useStore();

  const [offerPrice, setOfferPrice] = useState<number>(() => {
    return item ? Math.round(item.price * 0.85) : 15000;
  });
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'boda_kampala' | 'upcountry'>('pickup');
  const [bargainNote, setBargainNote] = useState('');

  // General budget state if no specific item
  const [generalBudget, setGeneralBudget] = useState<number>(20000);
  const [preferredStyle, setPreferredStyle] = useState('Tops under 25k');

  if (!isOpen) return null;

  const targetItem = item;

  // Quick discount calculation if item exists
  const discountAmount = targetItem ? targetItem.price - offerPrice : 0;
  const discountPercent = targetItem && targetItem.price > 0 ? Math.round((discountAmount / targetItem.price) * 100) : 0;

  const handleSendBargainWhatsApp = () => {
    let message = '';

    if (targetItem) {
      message = `*DAPHINE DOHA STORE - BARGAIN / PRICE OFFER* 🤝\n`;
      message += `📍 Store: Pioneer Mall, Shop PF 32/37, Kampala\n`;
      message += `───────────────────────\n`;
      message += `👗 *Item:* ${targetItem.title} (${targetItem.code})\n`;
      message += `🏷️ *Listed Price:* UGX ${targetItem.price.toLocaleString()}\n`;
      message += `💰 *HOW MUCH I HAVE (MY OFFER):* UGX ${offerPrice.toLocaleString()}\n`;
      
      if (discountAmount > 0) {
        message += `📉 *Discount Requested:* -UGX ${discountAmount.toLocaleString()} (${discountPercent}% off)\n`;
      }
      
      message += `📏 *Size:* ${targetItem.size} · Color: ${targetItem.color}\n`;
      message += `───────────────────────\n`;
      
      let deliveryLabel = deliveryOption === 'pickup' 
        ? '🛍️ In-Store Pickup at Pioneer Mall (Shop PF 32/37)'
        : deliveryOption === 'boda_kampala'
        ? '🛵 Same-Day Boda Delivery in Kampala'
        : '📦 Regional Courier / Upcountry Bus';

      message += `🚚 *Fulfillment Preference:* ${deliveryLabel}\n`;
      
      if (customerName) message += `👤 *My Name:* ${customerName}\n`;
      if (customerPhone) message += `📞 *Phone:* ${customerPhone}\n`;
      if (bargainNote) message += `📝 *Note:* ${bargainNote}\n`;

      message += `\nHello Daphine! 👋 Can you accept my offer of UGX ${offerPrice.toLocaleString()} for this piece? What is your best last price? I am ready to close! 🙏`;
    } else {
      // General budget inquiry
      message = `*DAPHINE DOHA STORE - BUDGET SHOPPING INQUIRY* 💰\n`;
      message += `📍 Pioneer Mall, Shop PF 32/37, Kampala\n`;
      message += `───────────────────────\n`;
      message += `💵 *MY TOTAL BUDGET:* UGX ${generalBudget.toLocaleString()}\n`;
      message += `👗 *Looking For:* ${preferredStyle}\n`;
      if (customerName) message += `👤 *Customer Name:* ${customerName}\n`;
      message += `───────────────────────\n`;
      message += `Hello Daphine! 👋 I have UGX ${generalBudget.toLocaleString()} to spend today. What beautiful thrift pieces do you have right now at Pioneer Mall Shop PF 32/37 in this budget? Please send me photos! 🙏`;
    }

    const cleanPhone = storeConfig.primaryWhatsApp.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    addToast({
      type: 'success',
      title: 'Bargain Offer Sent! 🤝',
      message: 'Redirecting to Daphine on WhatsApp with your proposed budget.',
      durationMs: 4000,
    });
    addNotification({
      type: 'deal',
      title: `Bargain Sent: ${targetItem ? targetItem.title : 'Budget Inquiry'}`,
      message: `Offer of UGX ${targetItem ? offerPrice.toLocaleString() : generalBudget.toLocaleString()} sent to Daphine on WhatsApp.`,
      showToast: false,
    });

    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-emerald-200 rounded-3xl shadow-2xl p-5 sm:p-6 text-stone-800 max-h-[92vh] overflow-y-auto space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-500 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Kampala Thrift Bargain Hotline</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-emerald-950 tracking-tight">
            {targetItem ? 'Make a Price Offer' : 'Text the Shop Your Budget'}
          </h2>
          <p className="text-xs text-stone-600">
            Tell Daphine how much money you have. In Kampala second-hand fashion, we love a friendly negotiation!
          </p>
        </div>

        {targetItem ? (
          /* BARGAIN ON SPECIFIC ITEM */
          <div className="space-y-4">
            {/* Item Mini Card */}
            <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex items-center gap-3">
              <img
                src={targetItem.images[0]}
                alt={targetItem.title}
                className="w-16 h-16 rounded-xl object-cover shrink-0 bg-stone-100"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-800 font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                    {targetItem.code}
                  </span>
                  <span className="text-[11px] text-stone-500">Size {targetItem.size}</span>
                </div>
                <h4 className="text-xs font-semibold text-stone-900 truncate mt-0.5">
                  {targetItem.title}
                </h4>
                <div className="text-xs font-bold text-stone-600 mt-0.5">
                  Listed Price: <span className="text-emerald-700 font-extrabold">UGX {targetItem.price.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Price offer input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-emerald-900 block">
                How much money do you have for this piece? (UGX)
              </label>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                  UGX
                </span>
                <input
                  type="number"
                  min={5000}
                  step={1000}
                  value={offerPrice}
                  onChange={e => setOfferPrice(Number(e.target.value))}
                  className="w-full pl-14 pr-4 py-3 rounded-xl bg-white border-2 border-emerald-600 text-emerald-950 font-extrabold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
                />
              </div>

              {/* Quick Offer Presets based on Listed Price */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] text-stone-500 font-medium block">
                  Quick bargain suggestions:
                </span>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  {[
                    Math.round(targetItem.price * 0.9 / 1000) * 1000,
                    Math.round(targetItem.price * 0.85 / 1000) * 1000,
                    Math.round(targetItem.price * 0.8 / 1000) * 1000,
                    Math.round(targetItem.price * 0.75 / 1000) * 1000,
                  ].map((preset, idx) => {
                    const discount = Math.round((1 - preset / targetItem.price) * 100);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setOfferPrice(preset)}
                        className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                          offerPrice === preset
                            ? 'bg-emerald-700 text-white font-bold border-emerald-700 shadow-2xs'
                            : 'bg-emerald-50/60 border-emerald-200 text-emerald-950 hover:bg-emerald-100'
                        }`}
                      >
                        <div className="text-[11px] font-bold">{(preset / 1000).toFixed(0)}k</div>
                        <div className="text-[9px] opacity-80">-{discount}%</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Savings preview */}
              {discountAmount > 0 && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Your Proposed Savings:</span>
                  </span>
                  <span className="font-extrabold text-emerald-700">
                    UGX {discountAmount.toLocaleString()} ({discountPercent}% discount)
                  </span>
                </div>
              )}
            </div>

            {/* Delivery / Pickup preference */}
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-stone-700 block">
                Where will you receive this piece?
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setDeliveryOption('pickup')}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${deliveryOption === 'pickup' ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold' : 'bg-stone-50 border-stone-200 text-stone-600'}`}
                >
                  🏢 In Store
                  <span className="block text-[10px] text-stone-500 font-normal">Pioneer Mall</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryOption('boda_kampala')}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${deliveryOption === 'boda_kampala' ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold' : 'bg-stone-50 border-stone-200 text-stone-600'}`}
                >
                  🛵 Boda Rider
                  <span className="block text-[10px] text-stone-500 font-normal">In Kampala</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryOption('upcountry')}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${deliveryOption === 'upcountry' ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold' : 'bg-stone-50 border-stone-200 text-stone-600'}`}
                >
                  📦 Upcountry
                  <span className="block text-[10px] text-stone-500 font-normal">Regional Bus</span>
                </button>
              </div>
            </div>

            {/* Optional Customer info & message */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                placeholder="Your Name (e.g. Sharon)"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-emerald-600"
              />
              <input
                type="text"
                placeholder="Message (e.g. Ready to pay cash now!)"
                value={bargainNote}
                onChange={e => setBargainNote(e.target.value)}
                className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-emerald-600"
              />
            </div>
          </div>
        ) : (
          /* GENERAL BUDGET SHOPPING INQUIRY */
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-emerald-900 block">
                How much total money do you have to spend today? (UGX)
              </label>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                  UGX
                </span>
                <input
                  type="number"
                  min={5000}
                  step={5000}
                  value={generalBudget}
                  onChange={e => setGeneralBudget(Number(e.target.value))}
                  className="w-full pl-14 pr-4 py-3 rounded-xl bg-white border-2 border-emerald-600 text-emerald-950 font-extrabold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Quick Budget Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {[10000, 15000, 20000, 25000, 30000, 50000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setGeneralBudget(amt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      generalBudget === amt 
                        ? 'bg-emerald-700 text-white font-bold' 
                        : 'bg-emerald-50/60 border border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                    }`}
                  >
                    UGX {(amt / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-stone-700 block">
                What clothing items are you looking for?
              </label>
              <select
                value={preferredStyle}
                onChange={e => setPreferredStyle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:bg-white focus:border-emerald-600"
              >
                <option value="Tops under 20k">Tops under 20k UGX</option>
                <option value="Tops under 30k">Tops under 30k UGX</option>
                <option value="Casual dresses">Casual dresses</option>
                <option value="Dinner / Evening dress">Dinner / Evening dress</option>
                <option value="Vintage mom jeans / denim">Vintage mom jeans / denim</option>
                <option value="2-piece sets">2-piece sets</option>
                <option value="Any fresh arrivals in my budget">Any fresh arrivals in my budget</option>
              </select>
            </div>

            <div className="text-xs">
              <input
                type="text"
                placeholder="Your Name (optional)"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-emerald-600"
              />
            </div>
          </div>
        )}

        {/* WhatsApp Direct Action Button */}
        <div className="pt-2 space-y-3">
          <button
            onClick={handleSendBargainWhatsApp}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-950/20 transition-all cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>Send Bargain Offer to Daphine's WhatsApp</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <div className="flex items-center justify-between text-[11px] text-stone-500">
            <span>Direct to: {storeConfig.primaryWhatsApp}</span>
            <button
              onClick={() => {
                onClose();
                onOpenStoreInfo();
              }}
              className="text-emerald-700 hover:underline cursor-pointer font-medium"
            >
              Shop PF 32/37 Pioneer Mall
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
