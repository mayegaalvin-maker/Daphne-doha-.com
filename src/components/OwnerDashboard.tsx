import React, { useState, useMemo } from 'react';
import { 
  Crown, 
  Settings, 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Edit3, 
  Trash2, 
  PlusCircle, 
  CheckCircle, 
  XCircle, 
  Flame, 
  Search, 
  Download, 
  RotateCcw, 
  Save, 
  Phone, 
  MessageCircle, 
  MapPin, 
  ShieldAlert,
  ShieldCheck,
  Layers,
  Sparkles,
  UserCheck,
  UserX,
  Camera,
  LogOut,
  UserPlus,
  Copy,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  FileText,
  Lock,
  Printer,
  ExternalLink,
  Share2,
  Bell,
  Megaphone,
  Send,
  Radio,
  Upload,
  X
} from 'lucide-react';
import { ThriftItem, Employee, ItemCategory, ItemCondition, ItemStatus, NotificationType, StoreNotification } from '../types/store';
import { useStore } from '../context/StoreContext';
import { AdminLogin } from './AdminLogin';
import { StaffCredentialGenerator } from './StaffCredentialGenerator';
import { EditEmployeeModal } from './EditEmployeeModal';
import { AddClothingModal } from './AddClothingModal';
import { compressImage } from '../utils/imageCompressor';
import credentialCertificateImg from '../assets/images/daphine_store_credentials_1791560650929.jpg';

export const OwnerDashboard: React.FC = () => {
  const { 
    items, 
    employees, 
    storeConfig, 
    userSession,
    notifications,
    broadcastNotification,
    deleteNotification,
    updateItem, 
    deleteItem, 
    setItemStatus, 
    toggleDailyDrop, 
    clearAllStock,
    loadDemoPreset,
    updateEmployeeStatus, 
    updateEmployee,
    deleteEmployee, 
    updateConfig, 
    resetAllData,
    switchRole,
    logoutAdmin
  } = useStore();

  const isOwnerAuthenticated = 
    userSession.role === 'owner' && 
    userSession.isAuthenticatedStaff === true && 
    userSession.staffRole === 'owner';

  // State
  const [activeTab, setActiveTab] = useState<'inventory' | 'employees' | 'notifications' | 'settings'>('inventory');

  // Broadcast Notification Form State
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    type: 'drop' as NotificationType,
    urgent: false,
    linkAction: 'tops' as StoreNotification['linkAction'],
    actionLabel: 'Browse Tops (10k-30k)',
  });
  const [broadcastNotice, setBroadcastNotice] = useState(false);

  // Search & filter for inventory table
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState<ItemCategory>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | ItemStatus>('all');

  // Add Clothing Modal & Inline Price Edit state
  const [showAddClothingModal, setShowAddClothingModal] = useState(false);
  const [editingPriceItemId, setEditingPriceItemId] = useState<string | null>(null);
  const [inlinePriceValue, setInlinePriceValue] = useState<number>(0);

  // Edit item modal state
  const [editingItem, setEditingItem] = useState<ThriftItem | null>(null);
  const [editPhotoCompressing, setEditPhotoCompressing] = useState(false);
  const [editCustomPhotoUrl, setEditCustomPhotoUrl] = useState('');

  // Employee management state
  const [showStaffGenerator, setShowStaffGenerator] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [revealedPins, setRevealedPins] = useState<{ [id: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCredentialCardModal, setShowCredentialCardModal] = useState(false);
  const [copiedAllCredentials, setCopiedAllCredentials] = useState(false);

  // Settings form state
  const [configForm, setConfigForm] = useState(storeConfig);
  const [configSavedNotice, setConfigSavedNotice] = useState(false);
  const [newMasterPin, setNewMasterPin] = useState('');
  const [masterPinNotice, setMasterPinNotice] = useState('');

  // Financial & inventory analytics
  const stats = useMemo(() => {
    const totalCount = items.length;
    const availableCount = items.filter(i => i.status === 'available').length;
    const reservedCount = items.filter(i => i.status === 'reserved').length;
    const soldCount = items.filter(i => i.status === 'sold').length;
    const dailyDropCount = items.filter(i => i.isDailyDrop).length;
    
    const totalInventoryValue = items.reduce((acc, it) => acc + (it.status === 'available' ? it.price : 0), 0);
    const totalSoldValue = items.reduce((acc, it) => acc + (it.status === 'sold' ? it.price : 0), 0);

    const topsUnder30k = items.filter(i => i.category === 'tops' && i.price <= 30000).length;

    return {
      totalCount,
      availableCount,
      reservedCount,
      soldCount,
      dailyDropCount,
      totalInventoryValue,
      totalSoldValue,
      topsUnder30k,
    };
  }, [items]);

  // Filtered inventory rows
  const filteredRows = useMemo(() => {
    return items.filter(item => {
      if (filterCat !== 'all' && item.category !== filterCat) return false;
      if (filterStatus !== 'all' && item.status !== filterStatus) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return item.code.toLowerCase().includes(q) || item.title.toLowerCase().includes(q) || item.size.toLowerCase().includes(q);
      }
      return true;
    });
  }, [items, filterCat, filterStatus, searchTerm]);

  // If not authenticated as Admin, show AdminLogin gate
  if (!isOwnerAuthenticated) {
    return <AdminLogin onBackToCustomer={() => switchRole('customer')} />;
  }

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePinReveal = (id: string) => {
    setRevealedPins(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShareCredentialsWhatsApp = (emp: Employee) => {
    const cleanPhone = emp.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `✨ *DAPHINE DOHA STORE - OFFICIAL EMPLOYEE ADMISSION CREDENTIALS* ✨\n` +
      `📍 Pioneer Mall, Shop PF 32/37, Kampala, Uganda\n` +
      `───────────────────────────────\n` +
      `Staff Member: *${emp.fullName}*\n\n` +
      `📋 *Admission Number:* ${emp.admissionNumber || 'DDS/EMP/2026/001'}\n` +
      `👤 *System Username:* ${emp.username || 'staff'}\n` +
      `🏷️ *Badge Code:* ${emp.staffCode}\n` +
      `🔑 *Security PIN:* ${emp.pin}\n` +
      `👔 *Role:* ${emp.role.replace('_', ' ')}\n` +
      `───────────────────────────────\n` +
      `Use these credentials to log in to the staff daily arrivals uploader at Pioneer Mall.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleSaveInlinePrice = (itemId: string) => {
    if (inlinePriceValue > 0) {
      updateItem(itemId, { price: inlinePriceValue });
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

  const handleEditAddCustomPhoto = () => {
    if (!editingItem || !editCustomPhotoUrl.trim()) return;
    setEditingItem({
      ...editingItem,
      images: [editCustomPhotoUrl.trim(), ...editingItem.images].slice(0, 5)
    });
    setEditCustomPhotoUrl('');
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

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateItem(editingItem.id, editingItem);
    setEditingItem(null);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(configForm);
    setConfigSavedNotice(true);
    setTimeout(() => setConfigSavedNotice(false), 3000);
  };

  const handleUpdateMasterPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMasterPin.trim() || newMasterPin.trim().length < 4) {
      setMasterPinNotice('PIN must be at least 4 digits');
      return;
    }
    const owner = employees.find(e => e.role === 'owner');
    if (owner) {
      await updateEmployee(owner.id, { pin: newMasterPin.trim() });
      setMasterPinNotice('Master Security PIN updated successfully!');
      setNewMasterPin('');
      setTimeout(() => setMasterPinNotice(''), 4000);
    } else {
      setMasterPinNotice('Owner account updated.');
    }
  };

  const handleCopyAllCredentials = () => {
    const text = `✨ DAPHINE DOHA STORE - OFFICIAL CREDENTIAL HANDOVER ✨
📍 Pioneer Mall, Shop PF 32/37, Kampala, Uganda
📱 TikTok: @daphinedohastore (Daphine Doha Store)
💬 WhatsApp Hotline: +256 787 355 533

👑 OWNER MASTER PORTAL
• Accepted Usernames: daphinedohastore / daphine.doha / DDS/ADM/2026/001 / +256787355533
• Master Security PIN: 2026
• Role: Store Owner & Administrator

👩‍💼 AUTHORIZED STAFF ACCESS ROSTER
1. Sarah Nakato (Inventory Lead)
   • Username: sarah.nakato
   • Admission No: DDS/EMP/2026/002
   • Badge Code: STAFF-102
   • Security PIN: 1234
   • Phone: +256 785 891 762

2. Prossy Namubiru (Floor Assistant)
   • Username: prossy.namubiru
   • Admission No: DDS/EMP/2026/003
   • Badge Code: STAFF-103
   • Security PIN: 5678
   • Phone: +256 701 449 811

3. Amina Kembabazi (Floor Assistant)
   • Username: amina.kembabazi
   • Admission No: DDS/EMP/2026/004
   • Badge Code: STAFF-104
   • Security PIN: 9900
   • Phone: +256 752 988 341`;

    navigator.clipboard.writeText(text);
    setCopiedAllCredentials(true);
    setTimeout(() => setCopiedAllCredentials(false), 2500);
  };

  const exportInventoryJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `daphine-doha-inventory-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-stone-800">
      {/* Executive Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 border border-emerald-800 text-white rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-800/80 text-emerald-200 border border-emerald-700/80 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-emerald-300" />
              <span>Daphine's Master Controller</span>
            </span>
            <span className="text-xs text-emerald-200/70">Pioneer Mall PF 32/37 Kampala</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-900/80 text-emerald-200 border border-emerald-800">
              Admission: DDS/ADM/2026/001
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-emerald-100 border border-white/20">
              TikTok: Daphine Doha Store
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
            Administrative Control Center
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
            Complete management over catalog listings, employee permissions, pricing, and live inventory.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddClothingModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 text-xs font-extrabold border border-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-102"
            title="Snap photos and add new clothing arrival with price"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-950" />
            <span>➕ Add Clothing &amp; Set Price</span>
          </button>
          <button
            onClick={() => setShowCredentialCardModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 text-xs font-bold border border-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="View official credential handover certificate"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>📜 Handover Credentials Card</span>
          </button>
          <button
            onClick={() => switchRole('customer')}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors cursor-pointer"
          >
            👗 View as Customer
          </button>
          <button
            onClick={() => switchRole('employee')}
            className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold border border-emerald-600 transition-colors cursor-pointer"
          >
            📲 Staff Upload Mode
          </button>
          <button
            onClick={logoutAdmin}
            className="px-3.5 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-900/90 text-rose-100 text-xs font-bold border border-rose-700/80 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Lock administrative portal"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-200" />
            <span>Lock / Log Out Admin</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-white border border-emerald-100 shadow-xs">
          <div className="text-[11px] text-stone-500 font-medium">Active Stock</div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">
            {stats.availableCount}
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">Pieces on racks</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-emerald-100 shadow-xs">
          <div className="text-[11px] text-stone-500 font-medium">Held / Reserved</div>
          <div className="text-xl sm:text-2xl font-bold text-amber-600 mt-1">
            {stats.reservedCount}
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">On hold via WhatsApp</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-emerald-100 shadow-xs">
          <div className="text-[11px] text-stone-500 font-medium">Sold Out</div>
          <div className="text-xl sm:text-2xl font-bold text-rose-600 mt-1">
            {stats.soldCount}
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">Completed orders</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-emerald-100 shadow-xs">
          <div className="text-[11px] text-stone-500 font-medium">Tops (10k-30k)</div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-800 mt-1">
            {stats.topsUnder30k}
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">Core price range</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-emerald-100 shadow-xs">
          <div className="text-[11px] text-stone-500 font-medium">Rack Value (UGX)</div>
          <div className="text-lg sm:text-xl font-bold text-stone-900 mt-1">
            {(stats.totalInventoryValue / 1000).toFixed(0)}k
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">UGX {stats.totalInventoryValue.toLocaleString()}</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-emerald-100 shadow-xs">
          <div className="text-[11px] text-stone-500 font-medium">Sold Revenue (UGX)</div>
          <div className="text-lg sm:text-xl font-bold text-emerald-700 mt-1">
            {(stats.totalSoldValue / 1000).toFixed(0)}k
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">UGX {stats.totalSoldValue.toLocaleString()}</div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-emerald-100 pb-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-emerald-700 text-white font-bold shadow-xs'
              : 'bg-white hover:bg-emerald-50 text-stone-700 border border-emerald-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Master Catalog Listings ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'employees'
              ? 'bg-emerald-700 text-white font-bold shadow-xs'
              : 'bg-white hover:bg-emerald-50 text-stone-700 border border-emerald-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff &amp; Employees ({employees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-emerald-700 text-white font-bold shadow-xs'
              : 'bg-white hover:bg-emerald-50 text-stone-700 border border-emerald-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Live Alerts &amp; Notifications ({notifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-emerald-700 text-white font-bold shadow-xs'
              : 'bg-white hover:bg-emerald-50 text-stone-700 border border-emerald-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Store Settings &amp; WhatsApp Lines</span>
        </button>
      </div>

      {/* TAB 1: MASTER INVENTORY TABLE */}
      {activeTab === 'inventory' && (
        <div className="bg-white border border-emerald-200 rounded-2xl p-5 space-y-4 shadow-xs">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search SKU code, title, or size..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-emerald-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              <select
                value={filterCat}
                onChange={e => setFilterCat(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:bg-white focus:border-emerald-600 cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="tops">Tops</option>
                <option value="dresses">Dresses</option>
                <option value="trousers">Trousers &amp; Jeans</option>
                <option value="skirts">Skirts</option>
                <option value="two-piece">2-Piece Sets</option>
                <option value="outerwear">Outerwear</option>
              </select>

              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:bg-white focus:border-emerald-600 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available Only</option>
                <option value="reserved">Reserved Only</option>
                <option value="sold">Sold Only</option>
              </select>

              <button
                onClick={() => setShowAddClothingModal(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/20 transition-all cursor-pointer"
                title="Add new clothing piece, take photos, and set price"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>➕ Add Clothing &amp; Set Price</span>
              </button>

              <button
                onClick={exportInventoryJson}
                className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 border border-stone-200 transition-colors cursor-pointer"
                title="Export catalog data as JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>

              {items.length > 0 ? (
                <button
                  onClick={() => {
                    if (confirm('Clear all items and make inventory completely empty for fresh real stock intake?')) {
                      clearAllStock();
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 border border-rose-200 transition-colors cursor-pointer"
                  title="Make catalog empty for real stock intake"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All to Empty</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    loadDemoPreset();
                  }}
                  className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 border border-emerald-200 transition-colors cursor-pointer"
                  title="Load 12 sample preview thrift items"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Load Sample Demo Items</span>
                </button>
              )}
            </div>
          </div>

          {/* Table or Empty State */}
          {items.length === 0 ? (
            <div className="text-center py-14 px-4 rounded-xl bg-stone-50 border border-emerald-100 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
                <Package className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-lg font-bold text-stone-900">Catalog is Completely Clean &amp; Empty</h4>
                <p className="text-xs text-stone-500">
                  Ready for Daphine and employees to upload real photos of clothes and set prices for Pioneer Mall Shop PF 32/37.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowAddClothingModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-emerald-950/20"
                >
                  <Camera className="w-4 h-4" />
                  <span>➕ Add Clothing Arrival &amp; Set Price</span>
                </button>
                <button
                  onClick={() => loadDemoPreset()}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium border border-stone-200 cursor-pointer"
                >
                  Load 12 Demo Items (For Testing)
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-emerald-100">
              <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-emerald-50/70 text-emerald-950 font-semibold uppercase tracking-wider text-[10px] border-b border-emerald-100">
                <tr>
                  <th className="p-3">Item &amp; Photos</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price (UGX)</th>
                  <th className="p-3">Size / Condition</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Today's Drop</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50 bg-white">
                {filteredRows.map(item => (
                  <tr key={item.id} className="hover:bg-emerald-50/40 transition-colors">
                    {/* Item Image & Code */}
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="relative group/thumb cursor-pointer shrink-0" 
                          onClick={() => setEditingItem(item)} 
                          title="Click to view/change garment photos"
                        >
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-12 h-12 rounded-lg object-cover bg-stone-100 border border-stone-200 group-hover/thumb:ring-2 group-hover/thumb:ring-emerald-600 transition-all"
                          />
                          {item.images.length > 1 && (
                            <span className="absolute bottom-0 right-0 bg-stone-900/80 text-white text-[9px] font-bold px-1 rounded-tl">
                              +{item.images.length - 1}
                            </span>
                          )}
                          <div className="absolute inset-0 bg-stone-900/40 rounded-lg opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <Camera className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-mono">
                            {item.code}
                          </span>
                          <div className="font-semibold text-stone-900 truncate max-w-[200px] mt-0.5">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-stone-500">
                            By {item.uploadedBy}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-3 capitalize text-stone-700">
                      {item.category}
                    </td>

                    {/* Price with inline quick editor */}
                    <td className="p-3">
                      {editingPriceItemId === item.id ? (
                        <div className="flex flex-col gap-1.5 p-2 bg-emerald-50 rounded-xl border border-emerald-300 shadow-xs min-w-[170px]">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-stone-500">UGX</span>
                            <input
                              type="number"
                              step={1000}
                              value={inlinePriceValue}
                              onChange={e => setInlinePriceValue(Number(e.target.value))}
                              className="w-full px-2 py-1 rounded bg-white border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:border-emerald-600 font-mono"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveInlinePrice(item.id)}
                              className="p-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer"
                              title="Save new price"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingPriceItemId(null)}
                              className="p-1 rounded bg-stone-200 hover:bg-stone-300 text-stone-700 cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-1 flex-wrap">
                            {[10000, 15000, 18000, 20000, 25000, 30000].map(pVal => (
                              <button
                                key={pVal}
                                type="button"
                                onClick={() => setInlinePriceValue(pVal)}
                                className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-900 cursor-pointer"
                              >
                                {pVal / 1000}k
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="group/price flex items-center gap-1.5">
                          <div>
                            <div className="font-bold text-emerald-800 text-xs">
                              UGX {item.price.toLocaleString()}
                            </div>
                            {item.originalPrice && (
                              <div className="text-[10px] text-stone-400 line-through">
                                UGX {item.originalPrice.toLocaleString()}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setEditingPriceItemId(item.id);
                              setInlinePriceValue(item.price);
                            }}
                            className="p-1 rounded-md bg-stone-100 hover:bg-emerald-100 text-stone-500 hover:text-emerald-800 opacity-60 group-hover/price:opacity-100 transition-opacity cursor-pointer"
                            title="Edit price in 1 click"
                          >
                            <DollarSign className="w-3 h-3 text-emerald-700" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Size & Condition */}
                    <td className="p-3">
                      <div className="font-medium text-stone-900">{item.size}</div>
                      <div className="text-[10px] text-stone-500">{item.condition}</div>
                    </td>

                    {/* Status Toggler */}
                    <td className="p-3">
                      <select
                        value={item.status}
                        onChange={e => setItemStatus(item.id, e.target.value as any)}
                        className={`text-[11px] font-semibold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          item.status === 'available'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : item.status === 'reserved'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        <option value="available">Available</option>
                        <option value="reserved">Reserved (Hold)</option>
                        <option value="sold">Sold Out</option>
                      </select>
                    </td>

                    {/* Daily Drop feature toggle */}
                    <td className="p-3">
                      <button
                        onClick={() => toggleDailyDrop(item.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          item.isDailyDrop
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-stone-50 text-stone-500 hover:text-stone-800 border border-stone-200'
                        }`}
                      >
                        <Flame className={`w-3 h-3 ${item.isDailyDrop ? 'text-rose-500' : 'text-stone-400'}`} />
                        <span>{item.isDailyDrop ? 'Featured' : 'Regular'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 transition-colors border border-stone-200 cursor-pointer"
                          title="Edit item listing"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete listing ${item.code} (${item.title})?`)) {
                              deleteItem(item.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-rose-50 text-stone-500 hover:text-rose-600 transition-colors border border-stone-200 cursor-pointer"
                          title="Delete item permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* TAB 2: STAFF & EMPLOYEES ROSTER & ADMISSIONS */}
      {activeTab === 'employees' && (
        <div className="space-y-6">
          {/* Top Banner & Trigger */}
          <div className="bg-white border border-emerald-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Staff Permissions &amp; Admissions</span>
                </span>
                <span className="text-xs text-stone-500">Pioneer Mall Store PF 32/37</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-emerald-950 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>Employee Admission Roster &amp; Credentials</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Generate official admission numbers, unique usernames, floor badge codes, and 4-digit PINs for boutique staff.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs text-stone-500 hidden sm:inline">
                Total Staff: <strong className="text-stone-900">{employees.length}</strong>
              </span>
              <button
                onClick={() => setShowStaffGenerator(!showStaffGenerator)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                  showStaffGenerator
                    ? 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-950/20'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>{showStaffGenerator ? 'Close Generator Panel' : '➕ Enroll Staff & Generate Credentials'}</span>
              </button>
            </div>
          </div>

          {/* Generator Component when triggered */}
          {showStaffGenerator && (
            <StaffCredentialGenerator 
              onCancel={() => setShowStaffGenerator(false)}
            />
          )}

          {/* Registered Team Roster Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {employees.map(emp => (
              <div 
                key={emp.id}
                className="p-5 rounded-2xl bg-white border border-emerald-200 space-y-4 shadow-xs hover:border-emerald-300 transition-all"
              >
                {/* Header: Name, Role, Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-emerald-950 text-base font-serif">{emp.fullName}</h4>
                      {emp.role === 'owner' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Shop Owner 👑
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700 capitalize border border-stone-200">
                          {emp.role.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-1 flex items-center gap-2">
                      <span>Phone: <strong className="text-stone-800 font-mono">{emp.phone}</strong></span>
                      <span>·</span>
                      <span>Joined: {emp.registeredAt}</span>
                    </p>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    emp.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : emp.status === 'pending'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {emp.status}
                  </span>
                </div>

                {/* Official Credentials Grid */}
                <div className="grid grid-cols-2 gap-2.5 text-xs pt-1">
                  {/* Admission Number */}
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-emerald-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-500 block uppercase font-medium">Admission No</span>
                      <span className="font-mono font-bold text-emerald-800 text-xs">
                        {emp.admissionNumber || 'DDS/EMP/2026/001'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyText(emp.admissionNumber || 'DDS/EMP/2026/001', `adm-${emp.id}`)}
                      className="p-1 rounded bg-white hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors border border-stone-200 cursor-pointer"
                      title="Copy Admission Number"
                    >
                      {copiedId === `adm-${emp.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* System Username */}
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-emerald-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-500 block uppercase font-medium">Username</span>
                      <span className="font-mono font-bold text-emerald-950 text-xs">
                        @{emp.username || emp.fullName.toLowerCase().replace(/\s+/g, '.')}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyText(emp.username || emp.fullName.toLowerCase().replace(/\s+/g, '.'), `user-${emp.id}`)}
                      className="p-1 rounded bg-white hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors border border-stone-200 cursor-pointer"
                      title="Copy Username"
                    >
                      {copiedId === `user-${emp.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Staff Badge Code */}
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-emerald-100">
                    <span className="text-[10px] text-stone-500 block uppercase font-medium">Badge Code</span>
                    <span className="font-mono font-bold text-stone-800 text-xs">
                      {emp.staffCode}
                    </span>
                  </div>

                  {/* Access PIN */}
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-emerald-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-500 block uppercase font-medium">Security PIN</span>
                      <span className="font-mono font-bold text-emerald-700 text-xs tracking-widest">
                        {revealedPins[emp.id] ? emp.pin : '••••'}
                      </span>
                    </div>
                    <button
                      onClick={() => togglePinReveal(emp.id)}
                      className="p-1 rounded bg-white hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors border border-stone-200 cursor-pointer"
                      title={revealedPins[emp.id] ? "Hide PIN" : "Reveal PIN"}
                    >
                      {revealedPins[emp.id] ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Footer Metrics & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-emerald-100 text-xs">
                  <div className="text-[11px] text-stone-500 flex items-center gap-3">
                    <span>Uploads: <strong className="text-emerald-800">{emp.totalUploads} pieces</strong></span>
                    <span>·</span>
                    <span>Last Active: <strong className="text-stone-700">{emp.lastLogin || 'Recent'}</strong></span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => handleShareCredentialsWhatsApp(emp)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold border border-emerald-200 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Send Credentials Slip via WhatsApp"
                    >
                      <MessageCircle className="w-3 h-3 text-emerald-600" />
                      <span>WhatsApp Slip</span>
                    </button>

                    <button
                      onClick={() => setEditingEmployee(emp)}
                      className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer border border-stone-200 transition-colors"
                      title="Edit Credentials & PIN"
                    >
                      <Edit3 className="w-3 h-3 text-stone-500" />
                      <span>Edit</span>
                    </button>

                    {emp.role !== 'owner' && (
                      <>
                        {emp.status === 'pending' && (
                          <button
                            onClick={() => updateEmployeeStatus(emp.id, 'active')}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                        )}

                        {emp.status === 'active' && (
                          <button
                            onClick={() => updateEmployeeStatus(emp.id, 'suspended')}
                            className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-amber-50 text-stone-600 hover:text-amber-800 border border-stone-200 text-[11px] cursor-pointer"
                            title="Suspend Staff Access"
                          >
                            Suspend
                          </button>
                        )}

                        {emp.status === 'suspended' && (
                          <button
                            onClick={() => updateEmployeeStatus(emp.id, 'active')}
                            className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-emerald-50 text-stone-600 hover:text-emerald-800 border border-stone-200 text-[11px] cursor-pointer"
                            title="Reactivate Staff Access"
                          >
                            Reactivate
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (confirm(`Remove employee ${emp.fullName} (${emp.admissionNumber || emp.staffCode}) from store system?`)) {
                              deleteEmployee(emp.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-rose-50 text-stone-500 hover:text-rose-600 border border-stone-200 text-[11px] cursor-pointer"
                          title="Remove Employee"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: LIVE BROADCASTS & STORE NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          {/* Dispatcher Card */}
          <div className="bg-white border border-emerald-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
            <div className="pb-3 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-emerald-700" />
                  <span>Website Notification Dispatcher &amp; Live Alerts</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Broadcast instant drop alerts, flash sales, and WhatsApp announcements to all visitors on the store.
                </p>
              </div>

              <span className="self-start sm:self-auto px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>Live Website Broadcast</span>
              </span>
            </div>

            {broadcastNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Notification successfully broadcast! All online shoppers and mobile viewers now see this alert.</span>
              </div>
            )}

            {/* Quick Presets */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-stone-700 block">
                ⚡ Quick 1-Click Broadcast Presets:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setBroadcastForm({
                    title: '🔥 Fresh Bale Unboxed Today!',
                    message: 'Over 30 Grade A UK vintage tops and linen blouses just unpacked at Shop PF 32/37 Pioneer Mall. Come pick yours!',
                    type: 'drop',
                    urgent: true,
                    linkAction: 'tops',
                    actionLabel: 'Browse Tops (10k-30k)',
                  })}
                  className="p-2.5 text-left rounded-xl bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200 text-xs transition-colors cursor-pointer"
                >
                  <span className="font-bold text-amber-900 block">🔥 Fresh Bale Drop</span>
                  <span className="text-[11px] text-amber-800/80 line-clamp-1">30+ UK Tops at Pioneer Mall</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBroadcastForm({
                    title: '⚡ Flash Sale: UGX 5,000 Off Today',
                    message: 'Take UGX 5,000 off any 2 pieces ordered together on WhatsApp today! Valid until 7:00 PM.',
                    type: 'deal',
                    urgent: false,
                    linkAction: 'bargain',
                    actionLabel: 'Name Your Budget',
                  })}
                  className="p-2.5 text-left rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200 text-xs transition-colors cursor-pointer"
                >
                  <span className="font-bold text-emerald-900 block">⚡ Flash Promo</span>
                  <span className="text-[11px] text-emerald-800/80 line-clamp-1">Combo deal discount offer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBroadcastForm({
                    title: '🛵 SafeBoda Kampala Delivery Active',
                    message: 'Boda riders standing by at Pioneer Mall for 45-minute delivery anywhere in Kampala. Order fast!',
                    type: 'announcement',
                    urgent: false,
                    linkAction: 'store_info',
                    actionLabel: 'View Delivery Info',
                  })}
                  className="p-2.5 text-left rounded-xl bg-sky-50/70 hover:bg-sky-100/70 border border-sky-200 text-xs transition-colors cursor-pointer"
                >
                  <span className="font-bold text-sky-900 block">🛵 SafeBoda Active</span>
                  <span className="text-[11px] text-sky-800/80 line-clamp-1">Same-day delivery across city</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBroadcastForm({
                    title: '📱 TikTok Live Stream Started!',
                    message: 'Daphine is live right now showing new arrivals and answering styling questions on @daphinedohastore!',
                    type: 'announcement',
                    urgent: true,
                    linkAction: 'tiktok',
                    actionLabel: 'Watch TikTok Live',
                  })}
                  className="p-2.5 text-left rounded-xl bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200 text-xs transition-colors cursor-pointer"
                >
                  <span className="font-bold text-rose-900 block">📱 TikTok Live Haul</span>
                  <span className="text-[11px] text-rose-800/80 line-clamp-1">Stream live on @daphinedohastore</span>
                </button>
              </div>
            </div>

            {/* Broadcast Form */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) return;
              await broadcastNotification({
                title: broadcastForm.title,
                message: broadcastForm.message,
                type: broadcastForm.type,
                urgent: broadcastForm.urgent,
                linkAction: broadcastForm.linkAction,
                actionLabel: broadcastForm.actionLabel,
              });
              setBroadcastNotice(true);
              setTimeout(() => setBroadcastNotice(false), 3500);
              setBroadcastForm({
                title: '',
                message: '',
                type: 'drop',
                urgent: false,
                linkAction: 'tops',
                actionLabel: 'Browse Tops (10k-30k)',
              });
            }} className="space-y-4 pt-2 border-t border-stone-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">
                    Alert Category
                  </label>
                  <select
                    value={broadcastForm.type}
                    onChange={e => setBroadcastForm({ ...broadcastForm, type: e.target.value as NotificationType })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                  >
                    <option value="drop">🔥 Fresh Thrift Drop Alert</option>
                    <option value="announcement">📢 Store Announcement</option>
                    <option value="deal">🤝 Flash Deal / Bargain</option>
                    <option value="system">ℹ️ System Notice</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-stone-700">
                    Alert Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 🔥 Fresh Bale Unboxed Today!"
                    value={broadcastForm.title}
                    onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">
                  Notification Message
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Grade A tops just unpacked at Pioneer Mall Shop PF 32/37. Limited pieces available, order on WhatsApp now!"
                  value={broadcastForm.message}
                  onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">
                    Action Button Link
                  </label>
                  <select
                    value={broadcastForm.linkAction || 'tops'}
                    onChange={e => setBroadcastForm({ ...broadcastForm, linkAction: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                  >
                    <option value="tops">👗 Browse Tops Filter</option>
                    <option value="catalog">🛍️ View All Catalog</option>
                    <option value="cart">🛒 Open WhatsApp Bag</option>
                    <option value="bargain">🤝 Open Bargain Hotline</option>
                    <option value="store_info">📍 Pioneer Mall Directions &amp; Delivery</option>
                    <option value="whatsapp">💬 Direct WhatsApp Chat</option>
                    <option value="tiktok">📱 TikTok Store Profile</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">
                    Button Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Browse Tops (10k-30k)"
                    value={broadcastForm.actionLabel || ''}
                    onChange={e => setBroadcastForm({ ...broadcastForm, actionLabel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={broadcastForm.urgent}
                    onChange={e => setBroadcastForm({ ...broadcastForm, urgent: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Mark as Priority / Urgent Alert</span>
                </label>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-950/20 cursor-pointer transition-all hover:scale-102"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast Alert to Website Now</span>
                </button>
              </div>
            </form>
          </div>

          {/* Active Notifications Management */}
          <div className="bg-white border border-emerald-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <div>
                <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-700" />
                  <span>Active Live Notifications on Store ({notifications.length})</span>
                </h4>
                <p className="text-xs text-stone-500">
                  These notifications appear in the customer notification center and drop ticker.
                </p>
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-500">
                No active notifications right now. Use the form above to dispatch an alert.
              </div>
            ) : (
              <div className="divide-y divide-stone-100 space-y-3">
                {notifications.map((notif) => (
                  <div key={notif.id} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          notif.type === 'drop' ? 'bg-amber-100 text-amber-800' :
                          notif.type === 'deal' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-stone-100 text-stone-700'
                        }`}>
                          {notif.type.toUpperCase()}
                        </span>
                        <span className="text-[11px] text-stone-400 font-medium">
                          {notif.timestamp}
                        </span>
                        {notif.authorName && (
                          <span className="text-[11px] text-emerald-800/80 font-medium">
                            · By {notif.authorName}
                          </span>
                        )}
                      </div>
                      <h5 className="text-xs font-bold text-stone-900">{notif.title}</h5>
                      <p className="text-xs text-stone-600 mt-0.5">{notif.message}</p>
                      {notif.actionLabel && (
                        <span className="inline-block mt-1 text-[11px] text-emerald-700 font-semibold">
                          Action: {notif.actionLabel}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteNotification(notif.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
                      title="Remove notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: STORE SETTINGS & WHATSAPP CHANNELS */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-emerald-200 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs">
          <div className="pb-3 border-b border-emerald-100">
            <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-700" />
              <span>Store Information &amp; WhatsApp Lines Configuration</span>
            </h3>
            <p className="text-xs text-stone-500">
              Update phone lines, Pioneer Mall address, and notice banners.
            </p>
          </div>

          {configSavedNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Settings successfully updated across customer and staff interfaces!</span>
            </div>
          )}

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Primary WhatsApp Line (Order Receiver)</span>
                </label>
                <input
                  type="text"
                  required
                  value={configForm.primaryWhatsApp}
                  onChange={e => setConfigForm({ ...configForm, primaryWhatsApp: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Secondary WhatsApp / Floor Contact</span>
                </label>
                <input
                  type="text"
                  required
                  value={configForm.secondaryWhatsApp}
                  onChange={e => setConfigForm({ ...configForm, secondaryWhatsApp: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Physical Location Description</span>
                </label>
                <input
                  type="text"
                  value={configForm.location}
                  onChange={e => setConfigForm({ ...configForm, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">
                  Shop Number Inside Mall
                </label>
                <input
                  type="text"
                  value={configForm.shopNumber}
                  onChange={e => setConfigForm({ ...configForm, shopNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-emerald-700" />
                <span>Daily Bale Announcement Banner (Top of Website)</span>
              </label>
              <textarea
                rows={2}
                value={configForm.announcement}
                onChange={e => setConfigForm({ ...configForm, announcement: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">
                  Kampala Boda Delivery Note
                </label>
                <input
                  type="text"
                  value={configForm.deliveryNotesKampala}
                  onChange={e => setConfigForm({ ...configForm, deliveryNotesKampala: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">
                  Store Working Hours
                </label>
                <input
                  type="text"
                  value={configForm.workingHours}
                  onChange={e => setConfigForm({ ...configForm, workingHours: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">
                  TikTok Business Account Link (@daphinedohastore)
                </label>
                <input
                  type="text"
                  value={configForm.tiktok}
                  onChange={e => setConfigForm({ ...configForm, tiktok: e.target.value })}
                  placeholder="https://www.tiktok.com/@daphinedohastore"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
                <span className="text-[10px] text-emerald-800 font-medium">Business username on TikTok: Daphine Doha Store</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">
                  Instagram Link
                </label>
                <input
                  type="text"
                  value={configForm.instagram}
                  onChange={e => setConfigForm({ ...configForm, instagram: e.target.value })}
                  placeholder="https://instagram.com/daphinedohastore"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-emerald-950/20"
              >
                <Save className="w-4 h-4" />
                <span>Save Store Configuration</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset store items and employee rosters back to factory initial demo data?')) {
                    resetAllData();
                    window.location.reload();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-700 border border-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Factory Defaults</span>
              </button>
            </div>
          </form>

          {/* Real-time Business Security & Master PIN Management */}
          <div className="pt-6 border-t border-emerald-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Real-Time Business Master Security PIN</span>
                </h4>
                <p className="text-xs text-stone-500">
                  Manage your private administrative credentials for Daphine Doha Store.
                </p>
              </div>
            </div>

            {masterPinNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{masterPinNotice}</span>
              </div>
            )}

            <form onSubmit={handleUpdateMasterPin} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-64">
                <input
                  type="password"
                  maxLength={8}
                  placeholder="Enter new 4-digit PIN"
                  value={newMasterPin}
                  onChange={e => setNewMasterPin(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600 font-mono tracking-widest"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Update Master PIN</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ITEM MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white border border-emerald-200 rounded-2xl p-6 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl text-stone-800">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-700" />
                <span>Edit Listing: {editingItem.code}</span>
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
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
                      value={editCustomPhotoUrl}
                      onChange={e => setEditCustomPhotoUrl(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={handleEditAddCustomPhoto}
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

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Title</label>
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
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-900 font-bold focus:outline-none focus:border-emerald-600 font-mono"
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
                    <option value="two-piece">Two-piece</option>
                    <option value="outerwear">Outerwear</option>
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
                  <label className="font-semibold text-stone-700">Status</label>
                  <select
                    value={editingItem.status}
                    onChange={e => setEditingItem({ ...editingItem, status: e.target.value as any })}
                    className="w-full px-2 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Condition Notes</label>
                <input
                  type="text"
                  value={editingItem.conditionNotes}
                  onChange={e => setEditingItem({ ...editingItem, conditionNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="editDailyDrop"
                  checked={editingItem.isDailyDrop}
                  onChange={e => setEditingItem({ ...editingItem, isDailyDrop: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="editDailyDrop" className="text-stone-700 font-medium cursor-pointer">
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

      {/* Edit Employee Credentials Modal */}
      {editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
        />
      )}

      {/* Official Handover Credential Sheet Modal */}
      {showCredentialCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white border border-emerald-200 rounded-3xl shadow-2xl p-5 sm:p-7 max-h-[95vh] overflow-y-auto space-y-5 text-stone-800">
            <button
              onClick={() => setShowCredentialCardModal(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-emerald-950 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Daphine Doha Store · Commercial Handover
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-emerald-950">
                  Official Handover Credential Card
                </h3>
              </div>
            </div>

            {/* Certificate Image Display */}
            <div className="rounded-2xl border-2 border-emerald-200 overflow-hidden shadow-lg bg-emerald-950 flex items-center justify-center">
              <img
                src={credentialCertificateImg}
                alt="Daphine Doha Store Official Credentials Certificate"
                className="w-full max-h-[500px] object-contain rounded-xl"
              />
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <button
                onClick={handleCopyAllCredentials}
                className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                {copiedAllCredentials ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedAllCredentials ? 'Copied to Clipboard!' : 'Copy All Logins'}</span>
              </button>

              <a
                href={credentialCertificateImg}
                download="daphine_doha_store_credentials.jpg"
                className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
              >
                <Download className="w-4 h-4 text-emerald-700" />
                <span>Download Image</span>
              </a>

              <button
                onClick={() => window.print()}
                className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-stone-600" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Clothing Piece & Set Price Modal */}
      <AddClothingModal
        isOpen={showAddClothingModal}
        onClose={() => setShowAddClothingModal(false)}
        uploaderName="Daphine (Owner)"
      />
    </div>
  );
};
