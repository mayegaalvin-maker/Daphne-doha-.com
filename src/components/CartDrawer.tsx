import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  MessageCircle, 
  ShoppingBag, 
  Truck, 
  MapPin, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStoreInfo: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onOpenStoreInfo }) => {
  const { cart, removeFromCart, clearCart, getWhatsAppOrderUrl, storeConfig, addToast, addNotification } = useStore();
  
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'boda_kampala' | 'upcountry'>('pickup');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  if (!isOpen) return null;

  const totalUGX = cart.reduce((sum, it) => sum + it.price, 0);

  const handleCheckoutWhatsApp = () => {
    if (cart.length === 0) return;
    const url = getWhatsAppOrderUrl(cart, deliveryMethod, {
      name: customerName,
      phone: customerPhone,
      location: deliveryLocation,
      notes: orderNotes,
    });

    addToast({
      type: 'success',
      title: 'Order Dispatched to WhatsApp! 🛍️',
      message: 'Opening WhatsApp chat with Daphine Doha Store to confirm items.',
      durationMs: 4000,
    });
    addNotification({
      type: 'order',
      title: `Order Request: ${cart.length} Thrift Pieces`,
      message: `Sent WhatsApp reservation for ${cart.map(i => i.title).join(', ')} totaling UGX ${totalUGX.toLocaleString()}.`,
      showToast: false,
    });

    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border-l border-emerald-200 text-stone-800 flex flex-col h-full shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
            <h2 className="font-serif text-lg font-bold text-emerald-950">Your WhatsApp Bag</h2>
            <span className="text-xs bg-white text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold shadow-2xs">
              {cart.length} {cart.length === 1 ? 'piece' : 'pieces'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-emerald-900 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-50 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {cart.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <p className="text-base font-semibold text-stone-800">Your bag is empty</p>
                <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                  Browse our daily thrift arrivals, find a piece you love, and reserve it instantly on WhatsApp!
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Browse Daily Catalog
              </button>
            </div>
          ) : (
            <>
              {/* Notice regarding 1-of-1 thrift nature */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  <strong>Second-hand Thrift Notice:</strong> Every item is 1-of-1! Items are reserved on a first-come, first-served basis upon sending your WhatsApp message.
                </p>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {cart.map(item => (
                  <div 
                    key={item.id}
                    className="p-3 rounded-xl bg-emerald-50/30 border border-emerald-100 flex items-center gap-3 shadow-2xs"
                  >
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-16 h-16 rounded-lg object-cover shrink-0 bg-stone-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                        <span className="text-emerald-700 font-semibold font-mono">{item.code}</span>
                        <span>·</span>
                        <span>Size {item.size}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-stone-900 truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs font-extrabold text-emerald-700 mt-0.5">
                        UGX {item.price.toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={clearCart}
                  className="text-[11px] text-stone-500 hover:text-rose-600 transition-colors underline cursor-pointer"
                >
                  Clear all items
                </button>
              </div>

              {/* Delivery method choice */}
              <div className="space-y-2 pt-2 border-t border-emerald-100">
                <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Choose Fulfillment Preference</span>
                </label>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <label 
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${deliveryMethod === 'pickup' ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold' : 'bg-stone-50 border-stone-200 text-stone-700'}`}
                  >
                    <div className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="delivery" 
                        checked={deliveryMethod === 'pickup'} 
                        onChange={() => setDeliveryMethod('pickup')}
                        className="text-emerald-600 focus:ring-0" 
                      />
                      <div>
                        <div className="font-semibold text-stone-900">Pick up at Pioneer Mall</div>
                        <div className="text-[11px] text-stone-500">Shop PF 32/37 · Free store pickup &amp; try-on</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700">FREE</span>
                  </label>

                  <label 
                    onClick={() => setDeliveryMethod('boda_kampala')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${deliveryMethod === 'boda_kampala' ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold' : 'bg-stone-50 border-stone-200 text-stone-700'}`}
                  >
                    <div className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="delivery" 
                        checked={deliveryMethod === 'boda_kampala'} 
                        onChange={() => setDeliveryMethod('boda_kampala')}
                        className="text-emerald-600 focus:ring-0" 
                      />
                      <div>
                        <div className="font-semibold text-stone-900">Boda Delivery in Kampala</div>
                        <div className="text-[11px] text-stone-500">Same-day rider to your doorstep</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-stone-600">~UGX 5k-10k</span>
                  </label>

                  <label 
                    onClick={() => setDeliveryMethod('upcountry')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${deliveryMethod === 'upcountry' ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold' : 'bg-stone-50 border-stone-200 text-stone-700'}`}
                  >
                    <div className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="delivery" 
                        checked={deliveryMethod === 'upcountry'} 
                        onChange={() => setDeliveryMethod('upcountry')}
                        className="text-emerald-600 focus:ring-0" 
                      />
                      <div>
                        <div className="font-semibold text-stone-900">Upcountry Regional Bus / Courier</div>
                        <div className="text-[11px] text-stone-500">Mbarara, Jinja, Gulu, Fort Portal, etc.</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-stone-600">~UGX 10k-15k</span>
                  </label>
                </div>
              </div>

              {/* Optional details */}
              <div className="space-y-2.5 pt-2 border-t border-emerald-100 text-xs">
                <span className="font-semibold text-stone-700 block">
                  Optional Details (Pre-fills WhatsApp message)
                </span>
                <input
                  type="text"
                  placeholder="Your Name (e.g., Brenda)"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
                {deliveryMethod !== 'pickup' && (
                  <input
                    type="text"
                    placeholder="Delivery Address / Division (e.g. Ntinda, Makindye, Bugolobi)"
                    value={deliveryLocation}
                    onChange={e => setDeliveryLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                )}
                <input
                  type="text"
                  placeholder="Notes or fitting questions..."
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer with WhatsApp CTA */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 bg-emerald-50/50 border-t border-emerald-100 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-stone-500 font-medium">Items Total:</span>
              <span className="text-xl font-extrabold text-emerald-800">
                UGX {totalUGX.toLocaleString()}
              </span>
            </div>

            <button
              onClick={handleCheckoutWhatsApp}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-950/10 transition-all cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Send Order Directly to WhatsApp</span>
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
                Pioneer Mall Directions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
