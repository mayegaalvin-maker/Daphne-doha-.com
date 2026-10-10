import React, { useState } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  DollarSign, 
  Sparkles, 
  CheckCircle2, 
  Tag, 
  Layers, 
  Flame, 
  Bell, 
  AlertCircle,
  Plus,
  Trash2,
  Star,
  Info
} from 'lucide-react';
import { ThriftItem, ItemCategory, ItemCondition } from '../types/store';
import { useStore } from '../context/StoreContext';
import { compressImage } from '../utils/imageCompressor';

interface AddClothingModalProps {
  isOpen: boolean;
  onClose: () => void;
  uploaderName?: string;
  defaultCategory?: ItemCategory;
}

const PRESET_PHOTO_OPTIONS = [
  { label: 'Ribbed Top (Beige)', url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80' },
  { label: 'Satin Blouse (Emerald)', url: 'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=800&q=80' },
  { label: 'Floral Sundress', url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80' },
  { label: 'Denim Mom Jean', url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80' },
  { label: 'Corset Top (Black)', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80' },
  { label: 'Boyfriend Blazer', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80' },
  { label: 'Pleated Midi Skirt', url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80' },
  { label: 'Linen Co-ord Set', url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80' },
];

const POPULAR_PRICES = [10000, 15000, 18000, 20000, 25000, 30000, 35000, 45000, 55000];
const QUICK_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'Free Size', 'UK 8', 'UK 10', 'UK 12', 'UK 14'];
const QUICK_COLORS = ['Emerald Green', 'Warm Beige', 'Black', 'White / Ivory', 'Ruby Red', 'Soft Pink', 'Floral Print', 'Denim Blue'];

export const AddClothingModal: React.FC<AddClothingModalProps> = ({
  isOpen,
  onClose,
  uploaderName,
  defaultCategory = 'tops'
}) => {
  const { items, addItem, userSession, broadcastNotification } = useStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Exclude<ItemCategory, 'all'>>(
    defaultCategory === 'all' ? 'tops' : (defaultCategory as any)
  );
  const [price, setPrice] = useState<number>(18000);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(25000);
  const [size, setSize] = useState('M / UK 10');
  const [color, setColor] = useState('Warm Olive');
  const [condition, setCondition] = useState<ItemCondition>('Grade A (Like New)');
  const [conditionNotes, setConditionNotes] = useState('Fresh bale opening. Immaculate condition, ready to wear.');
  const [material, setMaterial] = useState('Cotton Blend');
  const [isDailyDrop, setIsDailyDrop] = useState(true);
  const [broadcastAlert, setBroadcastAlert] = useState(true);

  // Photos state
  const [images, setImages] = useState<string[]>([PRESET_PHOTO_OPTIONS[0].url]);
  const [customUrl, setCustomUrl] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Image handlers
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    setErrorMessage('');
    try {
      const compressedList: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const compressed = await compressImage(files[i], 1200, 0.85);
        compressedList.push(compressed);
      }
      setImages(prev => [...compressedList, ...prev].slice(0, 5));
    } catch (err) {
      console.error('Failed to compress image:', err);
      setErrorMessage('Could not process photo file. Please try another image.');
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const handleAddUrl = () => {
    if (!customUrl.trim()) return;
    setImages(prev => [customUrl.trim(), ...prev].slice(0, 5));
    setCustomUrl('');
  };

  const handleRemovePhoto = (idx: number) => {
    if (images.length <= 1) {
      setErrorMessage('Each piece must have at least one photo.');
      return;
    }
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleMakeCoverPhoto = (idx: number) => {
    if (idx === 0) return;
    const selected = images[idx];
    const rest = images.filter((_, i) => i !== idx);
    setImages([selected, ...rest]);
  };

  const handleSelectPreset = (url: string) => {
    setImages(prev => [url, ...prev.filter(u => u !== url)].slice(0, 5));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Please enter a clothing title.');
      return;
    }
    if (!price || price <= 0) {
      setErrorMessage('Please set a valid price in UGX.');
      return;
    }
    if (images.length === 0) {
      setErrorMessage('Please attach at least one photo of the clothing piece.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const author = uploaderName || (
        userSession.role === 'owner' 
          ? 'Daphine (Owner)' 
          : (userSession.staffName || 'Floor Staff')
      );

      const newItem = await addItem({
        title: title.trim(),
        category,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        size: size.trim(),
        color: color.trim(),
        condition,
        conditionNotes: conditionNotes.trim(),
        material: material.trim(),
        images,
        status: 'available',
        isDailyDrop,
        uploadedBy: author
      });

      // Optionally broadcast instant alert if checked
      if (broadcastAlert) {
        broadcastNotification({
          type: 'drop',
          title: `🔥 New Arrival: ${newItem.title}!`,
          message: `Grade A ${newItem.category} just added by ${author} for UGX ${newItem.price.toLocaleString()}! Size: ${newItem.size}. Available at Pioneer Mall.`,
          urgent: isDailyDrop,
          actionLabel: 'View in Catalog',
          linkAction: newItem.category === 'tops' ? 'tops' : 'catalog'
        });
      }

      onClose();
    } catch (err: any) {
      console.error('Error adding clothing:', err);
      setErrorMessage('Failed to save clothing piece. Please check details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const discountPercent = originalPrice && originalPrice > price 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-emerald-200 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 px-6 py-4 text-white flex items-center justify-between shrink-0 border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-800/80 border border-emerald-700 flex items-center justify-center text-emerald-300">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-serif">
                  Add Clothing Piece &amp; Set Price
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-800 text-emerald-200 border border-emerald-700">
                  SKU DDS-{items.length + 101}
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                Logged by <strong className="text-white">{uploaderName || (userSession.role === 'owner' ? 'Daphine (Owner)' : 'Staff Member')}</strong> · Published live to customer catalog
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-stone-800 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SECTION 1: PICTURES OF CLOTHES */}
          <div className="bg-stone-50/80 border border-emerald-100 rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-700" />
                  <span>1. Garment Photos (Camera &amp; Uploads)</span>
                </h3>
                <p className="text-[11px] text-stone-500">
                  Take photos with phone camera or upload files. The first photo is the main storefront cover.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                {images.length} Photo{images.length !== 1 ? 's' : ''} Attached
              </span>
            </div>

            {/* Photo Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Take Photo with Phone Camera */}
              <label className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-xs">
                <Camera className="w-4 h-4" />
                <span>{isCompressing ? 'Compressing Photo...' : 'Camera (Take Photo)'}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={isCompressing}
                />
              </label>

              {/* Choose Files from Gallery/Device */}
              <label className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 font-semibold text-xs border border-stone-300 flex items-center gap-2 cursor-pointer transition-colors shadow-2xs">
                <Upload className="w-4 h-4 text-emerald-700" />
                <span>Upload File(s)</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={isCompressing}
                />
              </label>

              {/* Paste URL */}
              <div className="flex items-center gap-1.5 flex-1 min-w-[220px]">
                <input
                  type="url"
                  placeholder="Or paste image web link..."
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="px-3 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 font-bold text-stone-800 cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Thumbnails Reel */}
            <div className="space-y-1.5 pt-1">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {images.map((url, idx) => (
                  <div
                    key={idx}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-stone-100 shadow-2xs group ${
                      idx === 0 ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-stone-200'
                    }`}
                  >
                    <img src={url} alt={`Clothing item view ${idx + 1}`} className="w-full h-full object-cover" />
                    
                    {/* Badge for cover photo */}
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-emerald-700 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-current" /> Cover Photo
                      </span>
                    )}

                    {/* Quick actions hover overlay */}
                    <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5 text-white">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="p-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleMakeCoverPhoto(idx)}
                          className="w-full py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-[10px] font-bold text-center transition-colors cursor-pointer"
                        >
                          Set as Cover
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-stone-400">
                Tip: Click "Set as Cover" on any photo thumbnail to make it the primary thumbnail seen by shoppers.
              </p>
            </div>

            {/* Quick Thrift Photo Presets */}
            <div className="pt-2 border-t border-emerald-100/60">
              <span className="text-[11px] font-medium text-stone-600 block mb-1.5">
                Or pick a quick sample thrift photo:
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                {PRESET_PHOTO_OPTIONS.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    className="relative aspect-square rounded-lg overflow-hidden border border-stone-200 hover:border-emerald-600 transition-all opacity-80 hover:opacity-100 cursor-pointer group"
                    title={preset.label}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-stone-900/80 text-[8px] text-stone-200 truncate px-0.5 text-center">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: PRICE SETTING (UGX) */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-700" />
                  <span>2. Set Price in UGX (Ugandan Shillings)</span>
                </h3>
                <p className="text-[11px] text-stone-500">
                  Select a 1-click popular thrift price or type custom amount.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
                <span className="text-stone-500 text-[11px]">Selling Price:</span>
                <span className="text-base font-extrabold text-emerald-800 font-mono">
                  UGX {price.toLocaleString()}
                </span>
                {discountPercent && discountPercent > 0 && (
                  <span className="bg-rose-100 text-rose-800 font-extrabold text-[10px] px-1.5 py-0.5 rounded">
                    -{discountPercent}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* 1-Click Price Buttons */}
            <div>
              <span className="text-[11px] font-semibold text-stone-600 block mb-1.5">
                1-Click Fast Popular Prices:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {POPULAR_PRICES.map(pVal => {
                  const isSelected = price === pVal;
                  const isTopsUnder30k = pVal <= 30000;
                  return (
                    <button
                      key={pVal}
                      type="button"
                      onClick={() => {
                        setPrice(pVal);
                        setOriginalPrice(Math.round(pVal * 1.35));
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-emerald-700 text-white shadow-xs scale-105 ring-2 ring-emerald-500/30'
                          : 'bg-white hover:bg-emerald-100/60 text-stone-700 border border-emerald-200'
                      }`}
                    >
                      <span>UGX {pVal / 1000}k</span>
                      {isTopsUnder30k && <span className="text-[9px] opacity-80">🔥</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Precise Price & Original Price Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">
                  Exact Selling Price (UGX) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">
                    UGX
                  </span>
                  <input
                    type="number"
                    required
                    min={2000}
                    step={1000}
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-full pl-12 pr-3 py-2.5 rounded-xl bg-white border border-stone-200 text-sm font-bold text-stone-900 focus:outline-none focus:border-emerald-600 font-mono"
                    placeholder="e.g. 18000"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">
                  Original / Strikethrough Price (Optional for Discount tag)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">
                    UGX
                  </span>
                  <input
                    type="number"
                    value={originalPrice || ''}
                    onChange={e => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full pl-12 pr-3 py-2.5 rounded-xl bg-white border border-stone-200 text-sm text-stone-900 focus:outline-none focus:border-emerald-600 font-mono"
                    placeholder="e.g. 28000"
                  />
                </div>
              </div>
            </div>

            {category === 'tops' && price <= 30000 && (
              <div className="p-2.5 bg-emerald-100/70 border border-emerald-300 rounded-xl text-emerald-900 text-[11px] font-semibold flex items-center gap-2">
                <Flame className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  Qualifies for the signature <strong>"Tops UGX 10k-30k"</strong> boutique spotlight!
                </span>
              </div>
            )}
          </div>

          {/* SECTION 3: CLOTHING SPECIFICATIONS */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-700" />
              <span>3. Clothing Details &amp; Specifications</span>
            </h3>

            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">
                  Product Title &amp; Style Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vintage Satin Floral Blouse"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:bg-white focus:border-emerald-600 font-medium"
                >
                  <option value="tops">Tops (UGX 10,000 - 30,000)</option>
                  <option value="dresses">Dresses</option>
                  <option value="trousers">Trousers &amp; Denim</option>
                  <option value="skirts">Skirts</option>
                  <option value="two-piece">2-Piece Co-ord Sets</option>
                  <option value="outerwear">Outerwear &amp; Blazers</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>
            </div>

            {/* Size & Quick Pills */}
            <div className="space-y-1.5">
              <label className="font-semibold text-stone-700 block">
                Size Tag
              </label>
              <div className="flex flex-wrap items-center gap-1 mb-1.5">
                {QUICK_SIZES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                      size === s ? 'bg-emerald-700 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={size}
                onChange={e => setSize(e.target.value)}
                placeholder="e.g. M / UK 10"
                className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Color & Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">
                  Color / Shade
                </label>
                <div className="flex flex-wrap items-center gap-1 mb-1">
                  {QUICK_COLORS.slice(0, 4).map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                        color === c ? 'bg-emerald-700 text-white font-bold' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  placeholder="e.g. Sage Olive"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">
                  Condition Grade
                </label>
                <select
                  value={condition}
                  onChange={e => setCondition(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600 mt-5 sm:mt-6"
                >
                  <option value="Grade A (Like New)">Grade A (Like New)</option>
                  <option value="Pristine Pre-loved">Pristine Pre-loved</option>
                  <option value="Vintage Gem">Vintage Gem</option>
                  <option value="Deadstock Tagged">Deadstock Tagged</option>
                </select>
              </div>
            </div>

            {/* Material & Inspection Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">
                  Fabric / Material
                </label>
                <input
                  type="text"
                  value={material}
                  onChange={e => setMaterial(e.target.value)}
                  placeholder="e.g. Silk Blend, 100% Cotton"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">
                  Inspection Notes &amp; Features
                </label>
                <input
                  type="text"
                  value={conditionNotes}
                  onChange={e => setConditionNotes(e.target.value)}
                  placeholder="e.g. Immaculate condition, freshly steamed, ready to wear."
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Toggles: Daily Drop & Broadcast Notification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-emerald-100 cursor-pointer hover:bg-emerald-50/50 transition-colors">
                <input
                  type="checkbox"
                  checked={isDailyDrop}
                  onChange={e => setIsDailyDrop(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
                <div>
                  <span className="font-bold text-stone-900 block text-xs">
                    🔥 Feature in Daily Drop
                  </span>
                  <span className="text-[10px] text-stone-500">
                    Highlighted on customer homepage ribbon
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 cursor-pointer hover:bg-emerald-100/50 transition-colors">
                <input
                  type="checkbox"
                  checked={broadcastAlert}
                  onChange={e => setBroadcastAlert(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
                <div>
                  <span className="font-bold text-emerald-950 block text-xs flex items-center gap-1.5">
                    <Bell className="w-3 h-3 text-emerald-700" />
                    <span>Broadcast Store Drop Alert</span>
                  </span>
                  <span className="text-[10px] text-emerald-800/80">
                    Pushes live notification to all online shoppers
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs border border-stone-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || isCompressing}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 transition-all cursor-pointer hover:scale-102 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {submitting ? 'Publishing to Store...' : `Publish Piece at UGX ${price.toLocaleString()}`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
