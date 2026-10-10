import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Sparkles, 
  MessageCircle, 
  ShoppingBag, 
  MapPin, 
  Eye, 
  Flame, 
  ArrowRight, 
  Check, 
  Tag, 
  Layers, 
  SlidersHorizontal,
  RotateCcw,
  Bell,
  ChevronRight
} from 'lucide-react';
import { ThriftItem, ItemCategory } from '../types/store';
import { useStore } from '../context/StoreContext';

interface CustomerCatalogProps {
  onSelectItem: (item: ThriftItem) => void;
  onOpenStoreInfo: () => void;
  onOpenCart: () => void;
  onOpenBargain: (item?: ThriftItem) => void;
  onOpenNotifications?: () => void;
  activeCategoryFilter?: ItemCategory;
  onClearCategoryFilter?: () => void;
}

export const CustomerCatalog: React.FC<CustomerCatalogProps> = ({
  onSelectItem,
  onOpenStoreInfo,
  onOpenCart,
  onOpenBargain,
  onOpenNotifications,
  activeCategoryFilter = 'all',
  onClearCategoryFilter,
}) => {
  const { items, storeConfig, cart, addToCart, getWhatsAppOrderUrl, notifications } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>(activeCategoryFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<'all' | 'under20k' | '20k-30k' | 'above30k'>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [hideSold, setHideSold] = useState(false);
  const [showOnlyDailyDrops, setShowOnlyDailyDrops] = useState(false);

  // Sync external filter if parent updates
  React.useEffect(() => {
    if (activeCategoryFilter) {
      setSelectedCategory(activeCategoryFilter);
    }
  }, [activeCategoryFilter]);

  // Categories list
  const categories: { key: ItemCategory; label: string; count: number }[] = useMemo(() => {
    return [
      { key: 'all', label: 'All Items', count: items.length },
      { key: 'tops', label: 'Tops (UGX 10k-30k)', count: items.filter(i => i.category === 'tops').length },
      { key: 'dresses', label: 'Dresses', count: items.filter(i => i.category === 'dresses').length },
      { key: 'trousers', label: 'Denim & Pants', count: items.filter(i => i.category === 'trousers').length },
      { key: 'skirts', label: 'Skirts', count: items.filter(i => i.category === 'skirts').length },
      { key: 'two-piece', label: '2-Piece Sets', count: items.filter(i => i.category === 'two-piece').length },
      { key: 'outerwear', label: 'Jackets & Blazers', count: items.filter(i => i.category === 'outerwear').length },
    ];
  }, [items]);

  // Filtered catalog
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Category
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

      // Daily Drop
      if (showOnlyDailyDrops && !item.isDailyDrop) return false;

      // Hide sold
      if (hideSold && item.status === 'sold') return false;

      // Price filter
      if (priceRange === 'under20k' && item.price >= 20000) return false;
      if (priceRange === '20k-30k' && (item.price < 20000 || item.price > 30000)) return false;
      if (priceRange === 'above30k' && item.price <= 30000) return false;

      // Size
      if (selectedSize !== 'all' && !item.size.toLowerCase().includes(selectedSize.toLowerCase())) {
        return false;
      }

      // Condition
      if (selectedCondition !== 'all' && !item.condition.toLowerCase().includes(selectedCondition.toLowerCase())) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchCode = item.code.toLowerCase().includes(query);
        const matchNotes = item.conditionNotes.toLowerCase().includes(query);
        const matchColor = item.color.toLowerCase().includes(query);
        if (!matchTitle && !matchCode && !matchNotes && !matchColor) return false;
      }

      return true;
    });
  }, [items, selectedCategory, priceRange, selectedSize, selectedCondition, hideSold, showOnlyDailyDrops, searchQuery]);

  const dailyDrops = useMemo(() => {
    return items.filter(i => i.isDailyDrop && i.status === 'available');
  }, [items]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setPriceRange('all');
    setSelectedSize('all');
    setSelectedCondition('all');
    setHideSold(false);
    setShowOnlyDailyDrops(false);
    if (onClearCategoryFilter) onClearCategoryFilter();
  };

  const hasActiveFilters = selectedCategory !== 'all' || searchQuery !== '' || priceRange !== 'all' || selectedSize !== 'all' || selectedCondition !== 'all' || hideSold || showOnlyDailyDrops;

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Boutique Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-stone-50 border-b border-emerald-100 text-stone-900">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left intro text */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-900 text-xs font-semibold">
                <Flame className="w-3.5 h-3.5 text-emerald-700" />
                <span>Daily Second-Hand &amp; Thrift Drops · Kampala</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-5xl font-bold tracking-tight text-emerald-950 leading-[1.15]">
                Curated Women’s Wear &amp; Thrift Gems in Kampala.
              </h1>

              <p className="text-stone-700 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
                Shop first-grade preloved tops from <strong className="text-emerald-700 font-bold">UGX 10,000 to UGX 30,000</strong>, chic dresses, and statement pieces. Every thrift item is <strong>1-of-1</strong>: reserve yours instantly on WhatsApp before it sells out!
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <a
                  href={`https://wa.me/${storeConfig.primaryWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Hello Daphine Doha Store! I want to inquire about today's fresh arrivals.")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-emerald-950/10 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Order Directly via WhatsApp</span>
                </a>

                <button
                  onClick={onOpenStoreInfo}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-semibold text-xs sm:text-sm flex items-center gap-2 border border-emerald-200 transition-colors cursor-pointer shadow-2xs"
                >
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>Visit Shop PF 32/37 Pioneer Mall</span>
                </button>

                <button
                  onClick={() => onOpenBargain()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-100/90 hover:bg-emerald-200/90 text-emerald-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-emerald-300 transition-all cursor-pointer shadow-2xs"
                >
                  <span>🤝 Name Your Budget / Bargain</span>
                </button>
              </div>

              {/* Micro-guarantees */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-3 text-xs text-stone-600">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Grade A Inspected Thrift
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Same-Day Kampala Boda Delivery
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Shop Fittings Welcome
                </span>
              </div>
            </div>

            {/* Right: Featured Today's Drop Quick Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-xl relative">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Live Store Snapshot
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-500">
                    Pioneer Mall PF 32/37
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center mb-4">
                  <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <div className="text-base sm:text-lg font-bold text-emerald-700">
                      {items.filter(i => i.status === 'available').length}
                    </div>
                    <div className="text-[10px] text-stone-600 uppercase font-medium">Available Now</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <div className="text-base sm:text-lg font-bold text-emerald-700">
                      10k-30k
                    </div>
                    <div className="text-[10px] text-stone-600 uppercase font-medium">Tops UGX</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <div className="text-base sm:text-lg font-bold text-emerald-700">
                      {dailyDrops.length}
                    </div>
                    <div className="text-[10px] text-stone-600 uppercase font-medium">Today's Drops</div>
                  </div>
                </div>

                {dailyDrops[0] && (
                  <div 
                    onClick={() => onSelectItem(dailyDrops[0])}
                    className="group cursor-pointer rounded-xl bg-emerald-50/40 border border-emerald-200 p-2.5 flex items-center gap-3 hover:border-emerald-400 hover:bg-emerald-50 transition-all shadow-2xs"
                  >
                    <img 
                      src={dailyDrops[0].images[0]} 
                      alt={dailyDrops[0].title}
                      className="w-16 h-16 rounded-lg object-cover shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider">
                        ★ Fresh Bale Pick of the Day
                      </div>
                      <div className="text-xs font-bold text-stone-900 truncate group-hover:text-emerald-700">
                        {dailyDrops[0].title}
                      </div>
                      <div className="text-xs text-stone-600 font-medium">
                        UGX {dailyDrops[0].price.toLocaleString()} · Size {dailyDrops[0].size}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-0.5 transition-all" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Drop & Store Alert Banner */}
      {notifications.length > 0 && notifications[0] && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-3 mb-1">
          <div className={`p-3 sm:p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all shadow-2xs ${
            notifications[0].urgent 
              ? 'bg-rose-50/90 border-rose-200 text-rose-950' 
              : notifications[0].type === 'drop'
              ? 'bg-amber-50/90 border-amber-200 text-amber-950'
              : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
          }`}>
            <div className="flex items-center gap-3 min-w-0">
              <span className="p-2 rounded-xl bg-white shadow-2xs shrink-0">
                {notifications[0].type === 'drop' ? (
                  <Flame className="w-4 h-4 text-amber-600" />
                ) : (
                  <Bell className="w-4 h-4 text-emerald-700" />
                )}
              </span>
              <div className="text-xs min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-stone-900">{notifications[0].title}</span>
                  <span className="text-[10px] text-stone-400 font-medium">{notifications[0].timestamp}</span>
                </div>
                <p className="text-stone-600 truncate mt-0.5 max-w-xl">{notifications[0].message}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              {notifications[0].actionLabel && (
                <button
                  onClick={() => {
                    if (notifications[0].linkAction === 'tops') {
                      setSelectedCategory('tops');
                    } else if (notifications[0].linkAction === 'store_info') {
                      onOpenStoreInfo();
                    } else if (notifications[0].linkAction === 'bargain') {
                      onOpenBargain();
                    } else if (notifications[0].linkAction === 'cart') {
                      onOpenCart();
                    } else if (notifications[0].linkAction === 'whatsapp') {
                      window.open(`https://wa.me/${storeConfig.primaryWhatsApp.replace(/[^0-9]/g, '')}`, '_blank');
                    } else if (notifications[0].linkAction === 'tiktok') {
                      window.open(storeConfig.tiktok, '_blank');
                    } else if (onOpenNotifications) {
                      onOpenNotifications();
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer hover:scale-102"
                >
                  {notifications[0].actionLabel}
                </button>
              )}

              {onOpenNotifications && (
                <button
                  onClick={onOpenNotifications}
                  className="text-xs font-semibold text-emerald-900 hover:underline px-2 py-1.5 cursor-pointer flex items-center gap-1"
                >
                  <span>All Updates ({notifications.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Catalog Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Search & Fast Filters */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
          {/* Top row: Search input & Daily Drop quick toggle */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search tops, dresses, size (UK 10), code (#DDS-101)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-emerald-50/20 border border-emerald-200 text-stone-900 text-xs sm:text-sm placeholder-stone-400 focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setShowOnlyDailyDrops(!showOnlyDailyDrops)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${showOnlyDailyDrops ? 'bg-emerald-700 border-emerald-700 text-white' : 'bg-white border-emerald-200 text-emerald-950 hover:bg-emerald-50'}`}
              >
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
                <span>Today's Drops Only</span>
              </button>

              <button
                onClick={() => setHideSold(!hideSold)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${hideSold ? 'bg-emerald-700 border-emerald-700 text-white' : 'bg-white border-emerald-200 text-emerald-950 hover:bg-emerald-50'}`}
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Available Now</span>
              </button>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="px-2.5 py-2 rounded-xl text-xs font-medium text-stone-500 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs (Segmented interactive buttons per guidelines) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat.key
                    ? 'bg-emerald-700 text-white shadow-xs font-bold'
                    : 'bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-200'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`ml-1.5 text-[10px] ${selectedCategory === cat.key ? 'text-emerald-100 font-extrabold' : 'text-stone-400'}`}>
                  ({cat.count})
                </span>
              </button>
            ))}
          </div>

          {/* Secondary filter chips: Price & Size */}
          <div className="pt-2 border-t border-emerald-100 flex flex-wrap items-center gap-3 text-xs text-stone-500">
            {/* Price filters */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-stone-400 font-medium">Price:</span>
              <button
                onClick={() => setPriceRange('all')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${priceRange === 'all' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'text-stone-600 hover:text-emerald-800'}`}
              >
                Any
              </button>
              <button
                onClick={() => setPriceRange('under20k')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${priceRange === 'under20k' ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300' : 'text-stone-600 hover:text-emerald-800'}`}
              >
                &lt; 20k UGX
              </button>
              <button
                onClick={() => setPriceRange('20k-30k')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${priceRange === '20k-30k' ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300' : 'text-stone-600 hover:text-emerald-800'}`}
              >
                20k - 30k UGX
              </button>
              <button
                onClick={() => setPriceRange('above30k')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${priceRange === 'above30k' ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300' : 'text-stone-600 hover:text-emerald-800'}`}
              >
                30k+ UGX
              </button>
            </div>

            <span className="text-emerald-200">|</span>

            {/* Size filters */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-stone-400 font-medium">Size:</span>
              {['all', 'S', 'M', 'L', 'XL', 'Free Size'].map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${selectedSize === s ? 'bg-emerald-100 text-emerald-900 font-bold' : 'text-stone-600 hover:text-emerald-800'}`}
                >
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>

            <span className="text-emerald-200">|</span>

            {/* Condition filters */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-stone-400 font-medium">Thrift Grade:</span>
              {['all', 'Grade A', 'Vintage', 'Deadstock'].map(cond => (
                <button
                  key={cond}
                  onClick={() => setSelectedCondition(cond)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${selectedCondition === cond ? 'bg-emerald-100 text-emerald-900 font-bold' : 'text-stone-600 hover:text-emerald-800'}`}
                >
                  {cond === 'all' ? 'All' : cond}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between text-xs text-stone-500 px-1">
          <div>
            Showing <strong className="text-stone-900">{filteredItems.length}</strong> items
            {selectedCategory !== 'all' && <span> in <span className="capitalize text-emerald-700 font-bold">{selectedCategory}</span></span>}
          </div>
          <div className="text-[11px] text-stone-500">
            ⚡ Second-Hand Guarantee: Each piece is 1-of-1
          </div>
        </div>

        {/* Product Cards Grid */}
        {items.length === 0 ? (
          <div className="bg-white border border-emerald-100 rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-xs">
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-700">
              <Flame className="w-10 h-10 animate-pulse" />
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                Pioneer Mall Shop PF 32/37 · Kampala
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-emerald-950">
                Fresh Bales Being Unpacked &amp; Photographed!
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                The online catalog is clean and ready. Daphine and the floor team are currently photographing and steaming our latest Grade A preloved arrivals. Real pieces will appear live here as soon as they are uploaded from the shop floor.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href={`https://wa.me/${storeConfig.primaryWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Hello Daphine! 👋 Are there new clothes currently available at Pioneer Mall Shop PF 32/37?")}`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-emerald-950/10 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Chat Directly on WhatsApp ({storeConfig.primaryWhatsApp})</span>
              </a>

              <button
                onClick={onOpenStoreInfo}
                className="px-5 py-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-semibold text-xs sm:text-sm flex items-center gap-2 border border-emerald-200 transition-colors cursor-pointer shadow-2xs"
              >
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>Visit In-Store at Pioneer Mall</span>
              </button>
            </div>

            <div className="pt-6 border-t border-emerald-100 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-stone-500">
              <span>Are you Daphine or a registered employee?</span>
              <button
                onClick={() => {
                  const roleBtn = document.querySelector('[title="Switch between Customer, Employee, and Owner modes"]') as HTMLElement;
                  if (roleBtn) roleBtn.click();
                }}
                className="text-emerald-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Log into Staff Portal to Upload Real Stock</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white border border-emerald-100 rounded-2xl p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100">
              <Search className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">No items match your criteria</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Try loosening your filters or check back later today when our team unpacks new bales!
              </p>
            </div>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredItems.map(item => {
              const inCart = cart.some(c => c.id === item.id);
              const whatsAppUrl = getWhatsAppOrderUrl(item, 'pickup');

              return (
                <div
                  key={item.id}
                  className="group bg-white border border-emerald-100 hover:border-emerald-300 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 shadow-xs hover:shadow-lg hover:-translate-y-0.5"
                >
                  {/* Image container */}
                  <div 
                    onClick={() => onSelectItem(item)}
                    className="relative aspect-4/5 overflow-hidden bg-stone-100 cursor-pointer"
                  >
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Code badge */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/90 text-emerald-950 border border-emerald-200/90 backdrop-blur-xs font-mono shadow-2xs">
                        {item.code}
                      </span>
                    </div>

                    {/* Daily drop tag */}
                    {item.isDailyDrop && (
                      <div className="absolute top-2.5 right-2.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-700 text-white shadow-xs flex items-center gap-1">
                          <Flame className="w-3 h-3 text-emerald-300" />
                          <span>Today's Drop</span>
                        </span>
                      </div>
                    )}

                    {/* Stock Status Badge */}
                    {item.status !== 'available' && (
                      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[1px] flex items-center justify-center p-2">
                        <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border ${
                          item.status === 'sold'
                            ? 'bg-rose-900 text-white border-rose-700'
                            : 'bg-emerald-900 text-white border-emerald-700'
                        }`}>
                          {item.status === 'sold' ? 'Sold Out' : 'Reserved'}
                        </span>
                      </div>
                    )}

                    {/* Quick view hover icon on desktop */}
                    <div className="absolute inset-0 bg-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center">
                      <span className="px-3 py-1.5 rounded-lg bg-white/95 text-emerald-950 text-xs font-semibold flex items-center gap-1.5 shadow-md">
                        <Eye className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Quick View</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
                    <div>
                      {/* Unboxed metadata per zero-pill discipline */}
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mb-1">
                        <span className="font-semibold text-emerald-700">{item.condition}</span>
                        <span aria-hidden="true">·</span>
                        <span>Size {item.size}</span>
                      </div>

                      <h3 
                        onClick={() => onSelectItem(item)}
                        className="text-xs sm:text-sm font-semibold text-stone-900 leading-snug line-clamp-1 hover:text-emerald-700 cursor-pointer"
                        title={item.title}
                      >
                        {item.title}
                      </h3>

                      <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                        {item.conditionNotes}
                      </p>
                    </div>

                    {/* Pricing */}
                    <div className="pt-1 border-t border-emerald-100 flex items-baseline justify-between">
                      <div>
                        <span className="text-sm sm:text-base font-extrabold text-emerald-700">
                          UGX {item.price.toLocaleString()}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="ml-1.5 text-[11px] text-stone-400 line-through">
                            {item.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400 uppercase font-medium">
                        1 of 1
                      </span>
                    </div>

                    {/* Order Action Buttons */}
                    <div className="pt-1 space-y-1.5">
                      <a
                        href={whatsAppUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`w-full py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                          item.status === 'sold'
                            ? 'bg-stone-200 text-stone-400 pointer-events-none cursor-not-allowed'
                            : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                        }`}
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                        <span>{item.status === 'sold' ? 'Sold' : 'Order on WhatsApp'}</span>
                      </a>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            addToCart(item);
                            onOpenCart();
                          }}
                          disabled={item.status === 'sold'}
                          className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 disabled:opacity-40 text-emerald-950 font-semibold text-[11px] flex items-center justify-center gap-1 border border-emerald-200 transition-colors cursor-pointer"
                        >
                          <ShoppingBag className="w-3 h-3 text-emerald-700" />
                          <span>{inCart ? 'In Bag' : 'Add to Bag'}</span>
                        </button>

                        <button
                          onClick={() => onOpenBargain(item)}
                          disabled={item.status === 'sold'}
                          className="py-1.5 px-2.5 rounded-xl bg-white hover:bg-emerald-50 disabled:opacity-40 text-emerald-800 font-semibold text-[11px] flex items-center justify-center gap-1 border border-emerald-300 transition-colors cursor-pointer shadow-2xs"
                          title="Bargain / Tell Daphine how much you have"
                        >
                          <span>🤝</span>
                          <span>Bargain</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
