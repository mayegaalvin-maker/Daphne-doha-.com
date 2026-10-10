import React, { useState, useMemo } from 'react';
import { 
  Camera, 
  Upload, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  Tag, 
  UserCheck, 
  Layers, 
  Search, 
  AlertCircle, 
  Flame, 
  ShieldCheck, 
  UserPlus, 
  Lock, 
  KeyRound, 
  LogOut, 
  Edit3, 
  DollarSign, 
  Eye, 
  Trash2, 
  X, 
  Save, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Activity,
  Check,
  RotateCcw
} from 'lucide-react';
import { ThriftItem, ItemCategory, ItemCondition, ItemStatus, Employee } from '../types/store';
import { useStore } from '../context/StoreContext';
import { compressImage } from '../utils/imageCompressor';
import { AddClothingModal } from './AddClothingModal';

interface EmployeePortalProps {
  onOpenStoreInfo: () => void;
  onOpenOwnerPortal: () => void;
}

const PRESET_PHOTO_OPTIONS = [
  { label: 'Ribbed Top (Beige)', url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80' },
  { label: 'Satin Blouse (Emerald)', url: 'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=800&q=80' },
  { label: 'Floral Sundress', url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80' },
  { label: 'Denim Mom Jean', url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80' },
  { label: 'Corset Top (Black)', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80' },
  { label: 'Boyfriend Blazer', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80' },
];

export const EmployeePortal: React.FC<EmployeePortalProps> = ({ onOpenStoreInfo, onOpenOwnerPortal }) => {
  const { 
    items, 
    employees, 
    userSession, 
    activityLogs,
    authenticateStaff,
    logoutStaff,
    addItem, 
    updateItem,
    setItemStatus, 
    toggleDailyDrop,
    registerEmployee, 
    switchRole 
  } = useStore();

  // Authentication State (hidden/empty for real-time business security)
  const [loginStaffCode, setLoginStaffCode] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPin, setShowPin] = useState(false);

  // Tabs: 'dashboard' | 'upload' | 'register'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'upload' | 'register'>('dashboard');

  // New arrival upload form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Exclude<ItemCategory, 'all'>>('tops');
  const [price, setPrice] = useState<number>(18000);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(25000);
  const [size, setSize] = useState('M / UK 10');
  const [color, setColor] = useState('Warm Olive');
  const [condition, setCondition] = useState<ItemCondition>('Grade A (Like New)');
  const [conditionNotes, setConditionNotes] = useState('Fresh bale opening. Immaculate condition, ready to wear.');
  const [material, setMaterial] = useState('Cotton Blend');
  const [isDailyDrop, setIsDailyDrop] = useState(true);
  const [imageUrls, setImageUrls] = useState<string[]>([PRESET_PHOTO_OPTIONS[0].url]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  // Dashboard Filters & Search
  const [stockSearch, setStockSearch] = useState('');
  const [stockFilterCategory, setStockFilterCategory] = useState<string>('all');
  const [stockFilterStatus, setStockFilterStatus] = useState<string>('all');

  // Quick Inline Price Editing
  const [editingPriceItemId, setEditingPriceItemId] = useState<string | null>(null);
  const [tempPriceValue, setTempPriceValue] = useState<number>(0);

  // Product Description & Full Details Edit Modal
  const [editingItem, setEditingItem] = useState<ThriftItem | null>(null);
  const [editPhotoCompressing, setEditPhotoCompressing] = useState(false);
  const [editCustomUrl, setEditCustomUrl] = useState('');
  const [showAddClothingModal, setShowAddClothingModal] = useState(false);

  // Hold / Reservation Note Modal
  const [reserveModalItem, setReserveModalItem] = useState<ThriftItem | null>(null);
  const [holdCustomerNote, setHoldCustomerNote] = useState('');

  // Staff Registration Form
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffCode, setNewStaffCode] = useState('');
  const [newStaffPin, setNewStaffPin] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'inventory_lead' | 'floor_assistant'>('floor_assistant');
  const [staffRegMessage, setStaffRegMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Verify authorization
  const isAuthorized = userSession.isAuthenticatedStaff && (userSession.role === 'employee' || userSession.role === 'owner');
  const currentStaff = employees.find(e => e.id === userSession.staffId) || employees.find(e => e.staffCode === userSession.staffCode) || employees[1];

  // Real-time stock counts
  const stockMetrics = useMemo(() => {
    const total = items.length;
    const available = items.filter(i => i.status === 'available').length;
    const reserved = items.filter(i => i.status === 'reserved').length;
    const sold = items.filter(i => i.status === 'sold').length;
    const myUploads = items.filter(i => i.uploadedBy.toLowerCase().includes((currentStaff?.fullName || '').toLowerCase())).length;
    const tops10k30k = items.filter(i => i.category === 'tops' && i.price <= 30000).length;

    return { total, available, reserved, sold, myUploads, tops10k30k };
  }, [items, currentStaff]);

  // Filtered Stock Table
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (stockFilterCategory !== 'all' && item.category !== stockFilterCategory) return false;
      if (stockFilterStatus !== 'all' && item.status !== stockFilterStatus) return false;
      if (stockSearch.trim()) {
        const q = stockSearch.toLowerCase();
        return item.code.toLowerCase().includes(q) || item.title.toLowerCase().includes(q) || item.size.toLowerCase().includes(q) || item.color.toLowerCase().includes(q);
      }
      return true;
    });
  }, [items, stockFilterCategory, stockFilterStatus, stockSearch]);

  const [isCompressing, setIsCompressing] = useState(false);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = await authenticateStaff(loginStaffCode, loginPin);
    if (!res.success) {
      setLoginError(res.message);
    }
  };

  const handleQuickLoginPreset = async (code: string, pin: string) => {
    setLoginStaffCode(code);
    setLoginPin(pin);
    const res = await authenticateStaff(code, pin);
    if (!res.success) {
      setLoginError(res.message);
    }
  };

  // Handle Photo File Upload with client-side compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        const compressedDataUrl = await compressImage(file, 1200, 0.82);
        setImageUrls(prev => [compressedDataUrl, ...prev.slice(0, 2)]);
      } catch (err) {
        console.error('Error compressing camera photo:', err);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleAddCustomUrl = () => {
    if (customImageUrl.trim()) {
      setImageUrls(prev => [customImageUrl.trim(), ...prev.slice(0, 3)]);
      setCustomImageUrl('');
    }
  };

  const removePhoto = (index: number) => {
    if (imageUrls.length <= 1) return;
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Submit New Arrival
  const handleUploadArrival = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price || imageUrls.length === 0) {
      alert('Please fill in title, price, and at least one photo.');
      return;
    }

    const created = await addItem({
      title: title.trim(),
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      size: size.trim(),
      color: color.trim(),
      condition,
      conditionNotes: conditionNotes.trim(),
      material: material.trim(),
      images: imageUrls,
      status: 'available',
      isDailyDrop,
      uploadedBy: currentStaff ? currentStaff.fullName : 'Floor Staff',
    });

    setUploadSuccessMsg(`✓ Successfully cataloged ${created.code} (${created.title})! Now live on customer website.`);
    setTitle('');
    setActiveTab('dashboard');
    setTimeout(() => setUploadSuccessMsg(''), 5000);
  };

  // Save Inline Price
  const handleSaveInlinePrice = (itemId: string) => {
    if (tempPriceValue > 0) {
      updateItem(itemId, { price: tempPriceValue });
    }
    setEditingPriceItemId(null);
  };

  const handleEditPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingItem) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setEditPhotoCompressing(true);
    try {
      const compressedList: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const compressed = await compressImage(files[i], 1200, 0.85);
        compressedList.push(compressed);
      }
      setEditingItem({
        ...editingItem,
        images: [...compressedList, ...editingItem.images].slice(0, 5)
      });
    } catch (err) {
      console.error('Error adding photo to item:', err);
    } finally {
      setEditPhotoCompressing(false);
      e.target.value = '';
    }
  };

  const handleEditAddCustomUrl = () => {
    if (!editingItem || !editCustomUrl.trim()) return;
    setEditingItem({
      ...editingItem,
      images: [editCustomUrl.trim(), ...editingItem.images].slice(0, 5)
    });
    setEditCustomUrl('');
  };

  const handleEditRemovePhoto = (idx: number) => {
    if (!editingItem || editingItem.images.length <= 1) return;
    setEditingItem({
      ...editingItem,
      images: editingItem.images.filter((_, i) => i !== idx)
    });
  };

  const handleEditSetCoverPhoto = (idx: number) => {
    if (!editingItem || idx === 0) return;
    const selected = editingItem.images[idx];
    const rest = editingItem.images.filter((_, i) => i !== idx);
    setEditingItem({
      ...editingItem,
      images: [selected, ...rest]
    });
  };

  // Save Full Product Details Edit
  const handleSaveFullEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateItem(editingItem.id, editingItem);
    setEditingItem(null);
  };

  // Save Reservation with Customer Note
  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reserveModalItem) return;
    setItemStatus(reserveModalItem.id, 'reserved', holdCustomerNote.trim() || `Held by ${currentStaff?.fullName}`);
    setReserveModalItem(null);
    setHoldCustomerNote('');
  };

  // Register New Employee
  const handleRegisterStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffPhone.trim() || !newStaffCode.trim() || !newStaffPin.trim()) {
      setStaffRegMessage({ type: 'error', text: 'Please fill in all fields including 4-digit PIN.' });
      return;
    }

    const res = await registerEmployee({
      fullName: newStaffName.trim(),
      phone: newStaffPhone.trim(),
      staffCode: newStaffCode.trim(),
      pin: newStaffPin.trim(),
      role: newStaffRole,
    });

    if (res.success) {
      setStaffRegMessage({ type: 'success', text: res.message });
      setNewStaffName('');
      setNewStaffPhone('');
      setNewStaffCode('');
      setNewStaffPin('');
    } else {
      setStaffRegMessage({ type: 'error', text: res.message });
    }
  };

  // 1. IF NOT AUTHENTICATED: SHOW SECURE LOGIN BARRIER
  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto my-12 px-4 animate-in fade-in duration-200">
        <div className="bg-white border border-emerald-200 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-stone-800">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-950/20">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-emerald-950 tracking-tight">
              Staff Portal Access
            </h2>
            <p className="text-xs text-stone-500">
              Daphine Doha Store · Pioneer Mall, Shop PF 32/37 Kampala
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Username, Badge, or Admission No.</span>
                </span>
                <span className="text-[10px] text-stone-400">Staff Access</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter staff username, badge or admission number"
                value={loginStaffCode}
                onChange={e => setLoginStaffCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-emerald-600 text-sm font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                  <span>4-Digit Security PIN</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-[11px] text-stone-500 hover:text-stone-800 cursor-pointer font-medium"
                >
                  {showPin ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPin ? 'text' : 'password'}
                required
                maxLength={6}
                placeholder="••••"
                value={loginPin}
                onChange={e => setLoginPin(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-emerald-600 text-sm font-mono tracking-widest text-center"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-950/20 transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Verify &amp; Unlock Staff Dashboard</span>
            </button>
          </form>

          {/* Real-time Business Staff Security Notice */}
          <div className="pt-4 border-t border-emerald-100 text-center space-y-1.5">
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Official employee admission numbers and security PINs are issued directly by Daphine Doha.
            </p>
            <p className="text-[10px] text-emerald-800 font-medium">
              Pioneer Mall, Shop PF 32/37 · Kampala, Uganda
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED STAFF PORTAL
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-stone-800">
      {/* Authorized Staff Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 border border-emerald-800 text-white rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-800/80 text-emerald-200 border border-emerald-700/80 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Authorized Staff Session</span>
            </span>
            <span className="text-xs text-emerald-200/70">· Pioneer Mall PF 32/37, Kampala</span>
            <span className="text-[11px] text-emerald-200/60">· {userSession.loginTime}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
            Real-Time Boutique Stock Controller
          </h1>

          <div className="flex items-center gap-2 text-xs text-emerald-100/90 pt-0.5">
            <span>Staff Member: <strong className="text-white">{currentStaff?.fullName}</strong></span>
            <span>·</span>
            <span className="font-mono text-emerald-200">Badge: {currentStaff?.staffCode}</span>
            <span>·</span>
            <span className="capitalize text-emerald-200/80">Role: {currentStaff?.role?.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddClothingModal(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-emerald-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs hover:scale-102"
            title="Snap photos and upload new clothing piece"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-950" />
            <span>➕ Fast Snap &amp; Price</span>
          </button>

          <button
            onClick={() => switchRole('customer')}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors cursor-pointer"
          >
            👗 Customer Catalog
          </button>

          <button
            onClick={onOpenOwnerPortal}
            className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold border border-emerald-600 transition-colors cursor-pointer"
          >
            Owner Controller 👑
          </button>

          <button
            onClick={logoutStaff}
            className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-white text-xs font-semibold border border-rose-700/80 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Log out and secure portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock &amp; Exit</span>
          </button>
        </div>
      </div>

      {/* Real-time KPI Ribbon visible to employees */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-emerald-100 shadow-xs">
          <div className="text-[11px] text-stone-500 font-medium">Available on Racks</div>
          <div className="text-xl font-bold text-emerald-700 mt-1">
            {stockMetrics.available}
          </div>
          <div className="text-[10px] text-stone-400">Live for customers</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-emerald-100 shadow-xs">
          <div className="text-[11px] text-stone-500 font-medium">Currently Reserved</div>
          <div className="text-xl font-bold text-amber-600 mt-1">
            {stockMetrics.reserved}
          </div>
          <div className="text-[10px] text-stone-400">Holds / Inquiries</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-emerald-100 shadow-xs">
          <div className="text-[11px] text-stone-500 font-medium">Sold Out</div>
          <div className="text-xl font-bold text-rose-600 mt-1">
            {stockMetrics.sold}
          </div>
          <div className="text-[10px] text-stone-400">Off racks</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-emerald-100 shadow-xs">
          <div className="text-[11px] text-stone-500 font-medium">Tops (10k-30k)</div>
          <div className="text-xl font-bold text-emerald-800 mt-1">
            {stockMetrics.tops10k30k}
          </div>
          <div className="text-[10px] text-stone-400">Affordable inventory</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-emerald-100 shadow-xs">
          <div className="text-[11px] text-stone-500 font-medium">Total Listings</div>
          <div className="text-xl font-bold text-stone-900 mt-1">
            {stockMetrics.total}
          </div>
          <div className="text-[10px] text-stone-400">Cataloged pieces</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-emerald-100 shadow-xs">
          <div className="text-[11px] text-stone-500 font-medium">My Uploads</div>
          <div className="text-xl font-bold text-emerald-700 mt-1">
            {stockMetrics.myUploads}
          </div>
          <div className="text-[10px] text-stone-400">Logged to your badge</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-emerald-100 pb-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-emerald-700 text-white font-bold shadow-xs'
              : 'bg-white hover:bg-emerald-50 text-stone-700 border border-emerald-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Real-Time Stock Dashboard ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-emerald-700 text-white font-bold shadow-xs'
              : 'bg-white hover:bg-emerald-50 text-stone-700 border border-emerald-100'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Upload New Clothing Arrival</span>
        </button>

        <button
          onClick={() => setActiveTab('register')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'register'
              ? 'bg-emerald-700 text-white font-bold shadow-xs'
              : 'bg-white hover:bg-emerald-50 text-stone-700 border border-emerald-100'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Register Staff ({employees.length})</span>
        </button>
      </div>

      {uploadSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{uploadSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: REAL-TIME STOCK MANAGEMENT DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="bg-white border border-emerald-200 rounded-2xl p-5 space-y-4 shadow-xs">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Quick search SKU (e.g. DDS-101), size, title..."
                  value={stockSearch}
                  onChange={e => setStockSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                <select
                  value={stockFilterCategory}
                  onChange={e => setStockFilterCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:bg-white focus:border-emerald-600 cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="tops">Tops (UGX 10k-30k)</option>
                  <option value="dresses">Dresses</option>
                  <option value="trousers">Trousers &amp; Denim</option>
                  <option value="skirts">Skirts</option>
                  <option value="two-piece">2-Piece Sets</option>
                  <option value="outerwear">Outerwear &amp; Blazers</option>
                </select>

                <select
                  value={stockFilterStatus}
                  onChange={e => setStockFilterStatus(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:bg-white focus:border-emerald-600 cursor-pointer"
                >
                  <option value="all">All Stock Statuses</option>
                  <option value="available">Available on Racks</option>
                  <option value="reserved">Held / Reserved</option>
                  <option value="sold">Sold Out</option>
                </select>

                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/20 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>New Arrival</span>
                </button>
              </div>
            </div>

            {/* Real-time Inventory Table */}
            {items.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl bg-stone-50 border border-emerald-100 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-stone-900">Your Stock Catalog is Clean &amp; Empty</h4>
                  <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                    Ready for Daphine and floor staff to upload real clothing arrivals. Photos taken on your phone camera will appear immediately on the customer storefront.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 mx-auto cursor-pointer transition-all shadow-md shadow-emerald-950/20"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Uploading Real Arrivals Now</span>
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-xl bg-stone-50 border border-emerald-100 text-stone-500 text-xs">
                No items match your filter. Try changing category or search terms.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-emerald-100">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-emerald-50/70 text-emerald-950 font-semibold uppercase tracking-wider text-[10px] border-b border-emerald-100">
                    <tr>
                      <th className="p-3">Piece Details</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price (UGX)</th>
                      <th className="p-3">Size &amp; Condition</th>
                      <th className="p-3">Real-Time Stock Status</th>
                      <th className="p-3 text-right">Edit Listing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-50 bg-white">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-emerald-50/40 transition-colors">
                      {/* Piece info */}
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-12 h-12 rounded-lg object-cover bg-stone-100 border border-stone-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                {item.code}
                              </span>
                              {item.isDailyDrop && (
                                <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1 py-0.5 rounded flex items-center gap-0.5 border border-rose-200">
                                  <Flame className="w-2.5 h-2.5 text-rose-500" /> Drop
                                </span>
                              )}
                            </div>
                            <div className="font-semibold text-stone-900 truncate max-w-[200px] mt-0.5">
                              {item.title}
                            </div>
                            <div className="text-[10px] text-stone-500">
                              By {item.uploadedBy}
                              {item.reservedBy && <span className="text-amber-700 ml-1">({item.reservedBy})</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3 capitalize text-stone-700">
                        {item.category}
                      </td>

                      {/* Price with Inline Quick Editor */}
                      <td className="p-3">
                        {editingPriceItemId === item.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={5000}
                              step={1000}
                              value={tempPriceValue}
                              onChange={e => setTempPriceValue(Number(e.target.value))}
                              className="w-24 px-2 py-1 rounded bg-stone-50 border border-emerald-600 text-xs text-stone-900 focus:outline-none"
                            />
                            <button
                              onClick={() => handleSaveInlinePrice(item.id)}
                              className="p-1 rounded bg-emerald-700 text-white cursor-pointer"
                              title="Save price"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingPriceItemId(null)}
                              className="p-1 rounded bg-stone-100 text-stone-500 hover:text-stone-800 border border-stone-200 cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => {
                              setEditingPriceItemId(item.id);
                              setTempPriceValue(item.price);
                            }}
                            className="group cursor-pointer flex items-center gap-1.5"
                            title="Click to quickly edit price"
                          >
                            <span className="font-bold text-emerald-700 text-sm">
                              UGX {item.price.toLocaleString()}
                            </span>
                            <Edit3 className="w-3 h-3 text-stone-400 group-hover:text-emerald-700 transition-colors" />
                          </div>
                        )}
                        {item.originalPrice && (
                          <div className="text-[10px] text-stone-400 line-through">
                            UGX {item.originalPrice.toLocaleString()}
                          </div>
                        )}
                      </td>

                      {/* Size & Condition */}
                      <td className="p-3">
                        <div className="font-medium text-stone-900">{item.size}</div>
                        <div className="text-[10px] text-stone-500">{item.condition}</div>
                      </td>

                      {/* Real-Time Stock Status Switcher */}
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setItemStatus(item.id, 'available')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                              item.status === 'available'
                                ? 'bg-emerald-700 text-white font-bold shadow-xs'
                                : 'bg-stone-50 text-stone-600 hover:text-stone-900 border border-stone-200'
                            }`}
                          >
                            Available
                          </button>

                          <button
                            onClick={() => {
                              setReserveModalItem(item);
                              setHoldCustomerNote(item.reservedBy || `Held by ${currentStaff?.fullName}`);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                              item.status === 'reserved'
                                ? 'bg-amber-600 text-white font-bold shadow-xs'
                                : 'bg-stone-50 text-stone-600 hover:text-stone-900 border border-stone-200'
                            }`}
                          >
                            Hold / Reserve
                          </button>

                          <button
                            onClick={() => setItemStatus(item.id, 'sold', 'Sold in Shop PF 32/37')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                              item.status === 'sold'
                                ? 'bg-rose-700 text-white font-bold shadow-xs'
                                : 'bg-stone-50 text-stone-600 hover:text-stone-900 border border-stone-200'
                            }`}
                          >
                            Sold
                          </button>
                        </div>
                      </td>

                      {/* Edit full details */}
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 text-xs font-semibold flex items-center gap-1.5 ml-auto transition-colors cursor-pointer border border-stone-200"
                          title="Edit product descriptions, photos and prices"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                          <span>Edit Details</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

          {/* Real-Time Live Shop Activity Feed */}
          <div className="bg-white border border-emerald-200 rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
              <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-700" />
                <span>Live Shop Floor Activity &amp; Audit Log</span>
              </h3>
              <span className="text-[11px] text-stone-500">
                Real-time updates by store personnel
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {activityLogs.slice(0, 8).map(log => (
                <div key={log.id} className="p-2.5 rounded-xl bg-stone-50 border border-emerald-100 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">{log.staffName}</span>
                      <span className="text-[10px] text-emerald-700 font-mono">({log.staffCode})</span>
                      <span className="text-stone-300">·</span>
                      <span className="text-[10px] text-stone-500">{log.timestamp}</span>
                    </div>
                    <p className="text-stone-700 text-[11px] mt-0.5">
                      {log.details}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                    {log.itemCode}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: UPLOAD NEW CLOTHING ARRIVALS */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Intake Form: 7 cols */}
          <div className="lg:col-span-7 bg-white border border-emerald-200 rounded-2xl p-5 sm:p-6 space-y-5 text-stone-800 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <div>
                <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-700" />
                  <span>Daily Arrivals Photo &amp; Inventory Intake</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Snap thrift pieces on the floor and publish instantly to the customer website.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                Auto-assigned DDS-{items.length + 101}
              </span>
            </div>

            <form onSubmit={handleUploadArrival} className="space-y-4">
              {/* Photo Upload System */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-700 block">
                  1. Capture / Upload Clothing Photo(s)
                </label>

                {/* Upload button & file input */}
                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold border border-stone-200 flex items-center gap-2 cursor-pointer transition-colors">
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <span>{isCompressing ? 'Optimizing photo...' : 'Camera / Take Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isCompressing}
                    />
                  </label>

                  <label className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold border border-stone-200 flex items-center gap-2 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-emerald-700" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isCompressing}
                    />
                  </label>

                  <div className="flex items-center gap-1 flex-1 min-w-[200px]">
                    <input
                      type="url"
                      placeholder="Or paste image URL..."
                      value={customImageUrl}
                      onChange={e => setCustomImageUrl(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomUrl}
                      className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs text-stone-700 font-semibold border border-stone-200 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {isCompressing && (
                  <div className="text-[11px] text-emerald-700 flex items-center gap-1.5 animate-pulse">
                    <span>⚡ Optimizing photo for high-speed mobile loading in Uganda...</span>
                  </div>
                )}

                {/* Selected Photo Thumbnails */}
                <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-emerald-200 shrink-0 group">
                      <img src={url} alt="Uploaded thumbnail" className="w-full h-full object-cover" />
                      {imageUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-0.5 right-0.5 p-1 bg-stone-900/80 rounded-full text-rose-300 opacity-80 group-hover:opacity-100 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Quick Presets for fast testing */}
                <div className="pt-1">
                  <span className="text-[11px] text-stone-500 font-medium block mb-1.5">
                    Or click sample curated boutique photo:
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {PRESET_PHOTO_OPTIONS.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setImageUrls([opt.url])}
                        className={`group relative aspect-square rounded-lg overflow-hidden border-2 text-left cursor-pointer transition-all ${imageUrls[0] === opt.url ? 'border-emerald-600 ring-2 ring-emerald-500/30 scale-102' : 'border-stone-200 opacity-70 hover:opacity-100'}`}
                        title={opt.label}
                      >
                        <img src={opt.url} alt={opt.label} className="w-full h-full object-cover" />
                        <span className="absolute inset-x-0 bottom-0 bg-stone-900/80 text-[9px] text-stone-100 px-1 py-0.5 truncate text-center">
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">
                    Product Title &amp; Style Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vintage Floral Silk Blouse"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:bg-white focus:border-emerald-600"
                  >
                    <option value="tops">Tops (UGX 10,000 - 30,000)</option>
                    <option value="dresses">Dresses</option>
                    <option value="trousers">Trousers &amp; Denim</option>
                    <option value="skirts">Skirts</option>
                    <option value="two-piece">2-Piece Sets</option>
                    <option value="outerwear">Outerwear &amp; Blazers</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
              </div>

              {/* UGX Pricing with 1-click popular buttons */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700">
                    Selling Price in UGX (Ugandan Shillings)
                  </label>
                  <span className="text-[11px] text-emerald-700 font-bold">
                    UGX {price.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {[10000, 15000, 18000, 20000, 25000, 30000, 35000, 45000].map(pVal => (
                    <button
                      key={pVal}
                      type="button"
                      onClick={() => {
                        setPrice(pVal);
                        setOriginalPrice(Math.round(pVal * 1.3));
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${price === pVal ? 'bg-emerald-700 text-white font-bold' : 'bg-stone-50 text-stone-700 hover:bg-emerald-50 border border-stone-200'}`}
                    >
                      {pVal / 1000}k
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <input
                    type="number"
                    required
                    min={5000}
                    step={1000}
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:bg-white focus:border-emerald-600"
                    placeholder="Price in UGX"
                  />
                  <input
                    type="number"
                    value={originalPrice || ''}
                    onChange={e => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:bg-white focus:border-emerald-600"
                    placeholder="Original / Struck price (optional)"
                  />
                </div>
              </div>

              {/* Size, Color, Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">
                    Size Tag
                  </label>
                  <input
                    type="text"
                    value={size}
                    onChange={e => setSize(e.target.value)}
                    placeholder="e.g. M / UK 10"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">
                    Color
                  </label>
                  <input
                    type="text"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    placeholder="e.g. Sage Olive"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">
                    Condition Grade
                  </label>
                  <select
                    value={condition}
                    onChange={e => setCondition(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:bg-white focus:border-emerald-600"
                  >
                    <option value="Grade A (Like New)">Grade A (Like New)</option>
                    <option value="Pristine Pre-loved">Pristine Pre-loved</option>
                    <option value="Vintage Gem">Vintage Gem</option>
                    <option value="Deadstock Tagged">Deadstock Tagged</option>
                  </select>
                </div>
              </div>

              {/* Description & Flaw Inspection Notes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">
                  Product Description &amp; Flaw Inspection Notes
                </label>
                <textarea
                  rows={2}
                  value={conditionNotes}
                  onChange={e => setConditionNotes(e.target.value)}
                  placeholder="e.g. Zero flaws, immaculate hems, pure cotton feel, comfortable stretch"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              {/* Feature in Today's Drop */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-emerald-700" />
                  <div>
                    <div className="text-xs font-semibold text-stone-900">Feature in Today’s Daily Drop</div>
                    <div className="text-[11px] text-stone-500">Highlights this piece on public store front</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isDailyDrop}
                  onChange={e => setIsDailyDrop(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-700 focus:ring-0 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-950/20 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publish Item to Live Catalog</span>
              </button>
            </form>
          </div>

          {/* Right: Live Preview Box (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-emerald-200 rounded-2xl p-5 space-y-3 shadow-xs text-stone-800">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                  Live Customer Preview
                </span>
                <span className="text-[11px] text-stone-500">
                  What customers see
                </span>
              </div>

              <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden shadow-sm">
                <div className="relative aspect-4/5 bg-stone-100">
                  <img
                    src={imageUrls[0]}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-white border border-emerald-800">
                      DDS-{items.length + 101}
                    </span>
                  </div>
                  {isDailyDrop && (
                    <div className="absolute top-2.5 right-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-700 text-white flex items-center gap-1 shadow-xs">
                        <Flame className="w-3 h-3 text-white" />
                        <span>Today's Drop</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                    <span className="text-emerald-800 font-medium">{condition}</span>
                    <span>·</span>
                    <span>Size {size || 'M'}</span>
                    <span>·</span>
                    <span>{color}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-stone-900 truncate">
                    {title || 'Item Title Preview'}
                  </h4>

                  <p className="text-[11px] text-stone-500 line-clamp-1">
                    {conditionNotes}
                  </p>

                  <div className="pt-2 border-t border-emerald-100 flex items-baseline justify-between">
                    <span className="text-base font-extrabold text-emerald-700">
                      UGX {price.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      1 of 1 thrift
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REGISTER NEW STAFF */}
      {activeTab === 'register' && (
        <div className="max-w-2xl mx-auto bg-white border border-emerald-200 rounded-2xl p-6 space-y-5 text-stone-800 shadow-xs">
          <div className="pb-3 border-b border-emerald-100">
            <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-700" />
              <span>Register New Shop Employee</span>
            </h3>
            <p className="text-xs text-stone-500">
              Create an authorized staff profile with a 4-digit security PIN for floor access.
            </p>
          </div>

          {staffRegMessage && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              staffRegMessage.type === 'success' 
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' 
                : 'bg-rose-50 border border-rose-200 text-rose-700'
            }`}>
              {staffRegMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
              <span>{staffRegMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleRegisterStaff} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Brenda Namatovu"
                value={newStaffName}
                onChange={e => setNewStaffName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:bg-white focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">
                  Phone (Uganda format)
                </label>
                <input
                  type="text"
                  required
                  placeholder="+256 701 123456"
                  value={newStaffPhone}
                  onChange={e => setNewStaffPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:bg-white focus:border-emerald-600 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">
                  Staff Badge Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STAFF-105"
                  value={newStaffCode}
                  onChange={e => setNewStaffCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:bg-white focus:border-emerald-600 uppercase font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">
                  4-Digit Security PIN
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 7788"
                  value={newStaffPin}
                  onChange={e => setNewStaffPin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:bg-white focus:border-emerald-600 font-mono text-center tracking-widest"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">
                Staff Role
              </label>
              <select
                value={newStaffRole}
                onChange={e => setNewStaffRole(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:bg-white focus:border-emerald-600"
              >
                <option value="floor_assistant">Floor Assistant (Arrivals &amp; Stock Toggler)</option>
                <option value="inventory_lead">Inventory Lead (Catalog &amp; Price Manager)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-950/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>Complete Staff Registration</span>
            </button>
          </form>

          {/* Registered Team Roster */}
          <div className="pt-4 border-t border-emerald-100 space-y-2">
            <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Currently Registered Staff ({employees.length})
            </h4>
            <div className="divide-y divide-emerald-50 bg-white rounded-xl border border-emerald-100">
              {employees.map(emp => (
                <div key={emp.id} className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-stone-900 flex items-center gap-2">
                      <span>{emp.fullName}</span>
                      <span className="text-[10px] text-emerald-800 font-mono font-bold">({emp.staffCode})</span>
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {emp.role.replace('_', ' ')} · {emp.phone} · PIN: <span className="font-mono text-stone-700">{emp.pin}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${emp.status === 'active' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                      {emp.status}
                    </span>
                    <div className="text-[10px] text-stone-400 mt-0.5">
                      {emp.totalUploads} uploads
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FULL PRODUCT DETAILS EDIT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white border border-emerald-200 rounded-2xl p-6 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl text-stone-800">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <div>
                <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-700" />
                  <span>Edit Product Description &amp; Price: {editingItem.code}</span>
                </h3>
                <p className="text-[11px] text-stone-500">
                  Update clothing details, adjust prices in UGX, or toggle availability.
                </p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFullEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Product Title</label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Price with UGX presets */}
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-stone-700">Price in UGX</label>
                  <span className="font-mono font-bold text-emerald-800 text-xs">
                    UGX {editingItem.price.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  {[10000, 15000, 18000, 20000, 25000, 30000, 35000, 45000].map(pVal => (
                    <button
                      key={pVal}
                      type="button"
                      onClick={() => setEditingItem({
                        ...editingItem,
                        price: pVal,
                        originalPrice: Math.round(pVal * 1.35)
                      })}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                        editingItem.price === pVal
                          ? 'bg-emerald-700 text-white'
                          : 'bg-white hover:bg-emerald-100 text-stone-700 border border-emerald-200'
                      }`}
                    >
                      {pVal / 1000}k
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-stone-500 font-medium">Selling Price (UGX)</span>
                    <input
                      type="number"
                      required
                      min={2000}
                      step={1000}
                      value={editingItem.price}
                      onChange={e => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-emerald-800 font-bold focus:outline-none focus:border-emerald-600 font-mono"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-stone-500 font-medium">Original / Struck Price</span>
                    <input
                      type="number"
                      value={editingItem.originalPrice || ''}
                      onChange={e => setEditingItem({ ...editingItem, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-900 focus:outline-none focus:border-emerald-600 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={e => setEditingItem({ ...editingItem, category: e.target.value as any })}
                    className="w-full px-2 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                  >
                    <option value="tops">Tops</option>
                    <option value="dresses">Dresses</option>
                    <option value="trousers">Trousers</option>
                    <option value="skirts">Skirts</option>
                    <option value="two-piece">2-Piece Sets</option>
                    <option value="outerwear">Outerwear</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Size</label>
                  <input
                    type="text"
                    value={editingItem.size}
                    onChange={e => setEditingItem({ ...editingItem, size: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Stock Status</label>
                  <select
                    value={editingItem.status}
                    onChange={e => setEditingItem({ ...editingItem, status: e.target.value as any })}
                    className="w-full px-2 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 font-semibold focus:bg-white focus:outline-none focus:border-emerald-600"
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved (Hold)</option>
                    <option value="sold">Sold Out</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Description &amp; Condition Notes</label>
                <textarea
                  rows={2}
                  value={editingItem.conditionNotes}
                  onChange={e => setEditingItem({ ...editingItem, conditionNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Photo Management Section */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-emerald-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <span>Garment Photos ({editingItem.images.length})</span>
                  </label>
                  <span className="text-[10px] text-stone-500">First photo is storefront cover</span>
                </div>

                {/* Photo Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{editPhotoCompressing ? 'Compressing...' : 'Take Photo (Camera)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleEditPhotoUpload}
                      className="hidden"
                      disabled={editPhotoCompressing}
                    />
                  </label>

                  <label className="px-3 py-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 font-semibold text-xs border border-stone-300 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleEditPhotoUpload}
                      className="hidden"
                      disabled={editPhotoCompressing}
                    />
                  </label>

                  <div className="flex items-center gap-1 flex-1 min-w-[180px]">
                    <input
                      type="url"
                      placeholder="Or paste photo URL..."
                      value={editCustomUrl}
                      onChange={e => setEditCustomUrl(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={handleEditAddCustomUrl}
                      className="px-2.5 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 font-semibold text-stone-800 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Photo Thumbnails */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                  {editingItem.images.map((url, idx) => (
                    <div
                      key={idx}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 bg-stone-100 group ${
                        idx === 0 ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-stone-200'
                      }`}
                    >
                      <img src={url} alt={`Garment view ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-0.5 left-0.5 bg-emerald-700 text-white text-[8px] font-extrabold px-1 rounded">
                          Cover
                        </span>
                      )}
                      <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleEditRemovePhoto(idx)}
                            className="p-1 rounded-full bg-rose-600 text-white cursor-pointer"
                            title="Remove photo"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleEditSetCoverPhoto(idx)}
                            className="w-full py-0.5 rounded bg-emerald-600 text-white text-[8px] font-bold text-center cursor-pointer"
                          >
                            Cover
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editItemDrop"
                  checked={editingItem.isDailyDrop}
                  onChange={e => setEditingItem({ ...editingItem, isDailyDrop: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
                <label htmlFor="editItemDrop" className="text-stone-700 font-medium cursor-pointer">
                  Feature in Today's Daily Drop stream
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-emerald-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer shadow-md shadow-emerald-950/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HOLD / RESERVATION PROMPT MODAL */}
      {reserveModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border border-emerald-200 rounded-2xl p-6 space-y-4 shadow-2xl text-stone-800">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
              <h3 className="text-sm font-bold text-amber-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Reserve Item: {reserveModalItem.code}</span>
              </h3>
              <button
                onClick={() => setReserveModalItem(null)}
                className="p-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Holding <strong>{reserveModalItem.title}</strong> (UGX {reserveModalItem.price.toLocaleString()}) prevents online buyers from claiming it.
            </p>

            <form onSubmit={handleConfirmReservation} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">
                  Customer / Hold Note (e.g. WhatsApp name or duration)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Held for Juliet on WhatsApp until 4:00 PM"
                  value={holdCustomerNote}
                  onChange={e => setHoldCustomerNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReserveModalItem(null)}
                  className="px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer shadow-md shadow-amber-950/20"
                >
                  Confirm Hold
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Snap & Price Modal */}
      <AddClothingModal
        isOpen={showAddClothingModal}
        onClose={() => setShowAddClothingModal(false)}
        uploaderName={currentStaff ? currentStaff.fullName : 'Floor Staff'}
      />
    </div>
  );
};
