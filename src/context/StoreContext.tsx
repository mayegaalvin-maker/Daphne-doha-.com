import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ThriftItem, Employee, StoreConfig, UserSession, ItemStatus, ActivityLog, StoreNotification, NotificationType, ToastItem } from '../types/store';
import { INITIAL_ITEMS, INITIAL_EMPLOYEES, INITIAL_STORE_CONFIG, DEMO_ITEMS_PRESET, INITIAL_NOTIFICATIONS } from '../data/initialData';

interface StoreContextType {
  items: ThriftItem[];
  employees: Employee[];
  storeConfig: StoreConfig;
  userSession: UserSession;
  cart: ThriftItem[];
  favorites: string[];
  activityLogs: ActivityLog[];
  isSyncing: boolean;
  
  // Notifications & Toasts
  notifications: StoreNotification[];
  unreadNotificationsCount: number;
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notif: Omit<StoreNotification, 'id' | 'timestamp' | 'read'> & { id?: string; timestamp?: string; showToast?: boolean }) => void;
  broadcastNotification: (notif: { title: string; message: string; type: NotificationType; urgent?: boolean; actionLabel?: string; linkAction?: StoreNotification['linkAction'] }) => Promise<void>;
  pushPermission: NotificationPermission | 'unsupported';
  requestPushPermission: () => Promise<boolean>;
  sendBrowserNotification: (title: string, body: string) => void;

  // Authentication & Session
  authenticateStaff: (staffCode: string, pin: string) => Promise<{ success: boolean; message: string; employee?: Employee }>;
  authenticateAdmin: (username: string, pin: string) => Promise<{ success: boolean; message: string; owner?: Employee }>;
  logoutStaff: () => void;
  logoutAdmin: () => void;
  switchRole: (role: 'customer' | 'employee' | 'owner', staffMember?: Employee) => void;

  // Inventory Actions
  addItem: (item: Omit<ThriftItem, 'id' | 'code' | 'uploadedAt' | 'viewsCount'>) => Promise<ThriftItem>;
  updateItem: (id: string, updates: Partial<ThriftItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  setItemStatus: (id: string, status: ItemStatus, reservedNote?: string) => Promise<void>;
  toggleDailyDrop: (id: string) => Promise<void>;
  clearAllStock: () => Promise<void>;
  loadDemoPreset: () => Promise<void>;
  
  // Employee Management
  registerEmployee: (data: { 
    fullName: string; 
    phone: string; 
    role?: 'inventory_lead' | 'floor_assistant' | 'owner';
    username?: string;
    admissionNumber?: string;
    staffCode?: string;
    pin?: string;
  }) => Promise<{ success: boolean; message: string; employee?: Employee }>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
  updateEmployeeStatus: (id: string, status: 'active' | 'pending' | 'suspended') => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  
  // Cart & Wishlist
  addToCart: (item: ThriftItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  toggleFavorite: (id: string) => void;
  
  // Config
  updateConfig: (updates: Partial<StoreConfig>) => Promise<void>;
  resetAllData: () => Promise<void>;
  
  // WhatsApp Helper
  getWhatsAppOrderUrl: (
    items: ThriftItem | ThriftItem[], 
    deliveryMethod: 'pickup' | 'boda_kampala' | 'upcountry',
    customerInfo?: { name?: string; phone?: string; location?: string; notes?: string }
  ) => string;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEYS = {
  ITEMS: 'daphine_doha_items_v4',
  EMPLOYEES: 'daphine_doha_employees_v4',
  CONFIG: 'daphine_doha_config_v4',
  SESSION: 'daphine_doha_session_v4',
  CART: 'daphine_doha_cart_v4',
  FAVORITES: 'daphine_doha_favorites_v4',
  LOGS: 'daphine_doha_logs_v4',
  NOTIFICATIONS: 'daphine_doha_notifications_v4',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Empty by default for Daphine's real stock!
  const [items, setItems] = useState<ThriftItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(INITIAL_STORE_CONFIG);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Notifications & Toasts
  const [notifications, setNotifications] = useState<StoreNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const sendBrowserNotification = useCallback((title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=128&q=80',
        });
      } catch (e) {
        console.warn('Browser notification error:', e);
      }
    }
  }, []);

  const addToast = useCallback((toastData: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastItem = { ...toastData, id };
    setToasts(prev => [...prev.slice(-4), newToast]);

    const duration = toastData.durationMs ?? 4200;
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const requestPushPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const perm = await Notification.requestPermission();
      setPushPermission(perm);
      if (perm === 'granted') {
        sendBrowserNotification(
          'Daphine Doha Store Notifications Activated! 🔔',
          'You will now receive instant drop alerts whenever new Grade A thrift bales arrive!'
        );
        addToast({
          type: 'success',
          title: 'Notifications Enabled! 🔔',
          message: 'You will receive real-time drop alerts for new thrift arrivals in Kampala.',
        });
        return true;
      }
    } catch (e) {
      console.error('Push permission request failed:', e);
    }
    return false;
  };

  const [userSession, setUserSession] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
      return saved ? JSON.parse(saved) : { role: 'customer' };
    } catch {
      return { role: 'customer' };
    }
  });

  const [cart, setCart] = useState<ThriftItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync notifications to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Fetch real-time snapshot from server
  const fetchServerData = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsSyncing(true);
      const res = await fetch('/api/store-sync');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items)) {
          setItems(data.items);
          localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(data.items));
        }
        if (Array.isArray(data.employees) && data.employees.length > 0) {
          setEmployees(data.employees);
          localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(data.employees));
        }
        if (data.config && Object.keys(data.config).length > 0) {
          setStoreConfig(prev => ({ ...prev, ...data.config }));
          localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(data.config));
        }
        if (Array.isArray(data.activityLogs)) {
          setActivityLogs(data.activityLogs);
          localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(data.activityLogs));
        }
        if (Array.isArray(data.notifications) && data.notifications.length > 0) {
          setNotifications(data.notifications);
          localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data.notifications));
        }
      }
    } catch (err) {
      console.warn('Real-time sync error, using local state:', err);
    } finally {
      if (!silent) setIsSyncing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchServerData(false);
  }, [fetchServerData]);

  // Real-time polling every 3.5 seconds across devices
  useEffect(() => {
    const timer = setInterval(() => {
      fetchServerData(true);
    }, 3500);
    return () => clearInterval(timer);
  }, [fetchServerData]);

  // Sync session & cart to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(userSession));
  }, [userSession]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  const authenticateStaff = async (staffCode: string, pin: string) => {
    try {
      const res = await fetch('/api/employees/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffCode, pin }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.error || 'Login failed' };
      }

      const emp: Employee = data.employee;
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setUserSession({
        role: emp.role === 'owner' ? 'owner' : 'employee',
        staffId: emp.id,
        staffName: emp.fullName,
        staffCode: emp.staffCode,
        staffRole: emp.role,
        username: emp.username,
        admissionNumber: emp.admissionNumber,
        isAuthenticatedStaff: true,
        loginTime: `Today, ${nowTime}`,
      });

      fetchServerData(true);
      return { success: true, message: `Welcome back, ${emp.fullName}!`, employee: emp };
    } catch (err) {
      // Fallback local check supporting badge, username, or admission number
      const q = staffCode.toLowerCase().trim();
      const emp = employees.find(e => 
        e.staffCode.toLowerCase() === q ||
        (e.username && e.username.toLowerCase() === q) ||
        (e.admissionNumber && e.admissionNumber.toLowerCase() === q)
      );
      if (!emp) return { success: false, message: 'Invalid Staff Badge Code, Username, or Admission Number' };
      if (emp.pin && emp.pin !== pin.trim()) return { success: false, message: 'Invalid PIN' };

      setUserSession({
        role: emp.role === 'owner' ? 'owner' : 'employee',
        staffId: emp.id,
        staffName: emp.fullName,
        staffCode: emp.staffCode,
        staffRole: emp.role,
        username: emp.username,
        admissionNumber: emp.admissionNumber,
        isAuthenticatedStaff: true,
        loginTime: 'Authorized Session',
      });
      return { success: true, message: `Welcome back, ${emp.fullName}!`, employee: emp };
    }
  };

  const authenticateAdmin = async (username: string, pin: string) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, pin }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.error || 'Admin verification failed' };
      }

      const owner: Employee = data.owner;
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setUserSession({
        role: 'owner',
        staffId: owner.id,
        staffName: owner.fullName,
        staffCode: owner.staffCode,
        staffRole: 'owner',
        username: owner.username || 'daphine.doha',
        admissionNumber: owner.admissionNumber || 'DDS/ADM/2026/001',
        isAuthenticatedStaff: true,
        loginTime: `Admin Session (${nowTime})`,
      });

      fetchServerData(true);
      return { success: true, message: data.message || 'Master Admin access authorized.', owner };
    } catch (err) {
      const cleanUser = (username || '').toLowerCase().trim().replace('@', '');
      const owner = employees.find(e => e.role === 'owner') || employees[0];
      const isOwnerMatch = 
        cleanUser === 'daphine' || 
        cleanUser === 'daphinedohastore' ||
        cleanUser === 'daphine doha store' ||
        cleanUser === 'daphinedoha' ||
        cleanUser === 'daphine.doha' || 
        cleanUser === 'dd-001' ||
        cleanUser === 'dds/adm/2026/001' ||
        cleanUser === '+256787355533' ||
        cleanUser === '0787355533' ||
        cleanUser === '256787355533' ||
        (owner.username && cleanUser === owner.username.toLowerCase()) ||
        (owner.admissionNumber && cleanUser === owner.admissionNumber.toLowerCase()) ||
        (owner.phone && cleanUser === owner.phone.toLowerCase().replace(/[^0-9]/g, ''));

      const validPin = owner?.pin || '2026';
      if (isOwnerMatch && (pin.trim() === validPin || pin.trim() === '2026')) {
        setUserSession({
          role: 'owner',
          staffId: owner.id,
          staffName: owner.fullName,
          staffCode: owner.staffCode,
          staffRole: 'owner',
          username: owner.username || 'daphine.doha',
          admissionNumber: owner.admissionNumber || 'DDS/ADM/2026/001',
          isAuthenticatedStaff: true,
          loginTime: 'Admin Session',
        });
        return { success: true, message: 'Welcome Daphine Doha! Master Administrative Control authorized.', owner };
      }
      return { success: false, message: 'Invalid Admin username or PIN. Please enter authorized store credentials.' };
    }
  };

  const logoutStaff = () => {
    setUserSession({ role: 'customer', isAuthenticatedStaff: false });
  };

  const logoutAdmin = () => {
    setUserSession({ role: 'owner', isAuthenticatedStaff: false });
  };

  const switchRole = (role: 'customer' | 'employee' | 'owner', staffMember?: Employee) => {
    if (role === 'customer') {
      setUserSession({ role: 'customer', isAuthenticatedStaff: false });
    } else if (role === 'owner') {
      // If already logged in as authenticated owner, keep session
      if (userSession.role === 'owner' && userSession.isAuthenticatedStaff && userSession.staffRole === 'owner') {
        // Keep active owner session
      } else {
        // Require Daphine Admin Portal Login!
        setUserSession({
          role: 'owner',
          isAuthenticatedStaff: false,
        });
      }
    } else {
      if (staffMember) {
        setUserSession({
          role: 'employee',
          staffId: staffMember.id,
          staffName: staffMember.fullName,
          staffCode: staffMember.staffCode,
          staffRole: staffMember.role,
          username: staffMember.username,
          admissionNumber: staffMember.admissionNumber,
          isAuthenticatedStaff: true,
          loginTime: 'Authorized Session',
        });
      } else {
        // Keep existing employee session if already logged in, otherwise require staff login
        if (userSession.role === 'employee' && userSession.isAuthenticatedStaff) {
          // Keep active
        } else {
          setUserSession({
            role: 'employee',
            isAuthenticatedStaff: false,
          });
        }
      }
    }
  };

  const addItem = async (data: Omit<ThriftItem, 'id' | 'code' | 'uploadedAt' | 'viewsCount'>): Promise<ThriftItem> => {
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          uploadedBy: userSession.staffName || data.uploadedBy || 'Floor Staff',
        }),
      });
      if (res.ok) {
        const newItem: ThriftItem = await res.json();
        setItems(prev => [newItem, ...prev]);
        fetchServerData(true);
        addToast({
          type: 'drop',
          title: '🔥 New Drop Uploaded!',
          message: `"${newItem.title}" (${newItem.category}) added to rack!`,
          durationMs: 4500,
        });
        sendBrowserNotification(
          '🔥 Fresh Thrift Drop at Daphine Doha Store!',
          `"${newItem.title}" just added to the rack for UGX ${Number(newItem.price).toLocaleString()} at Shop PF 32/37.`
        );
        return newItem;
      }
    } catch (err) {
      console.error('Failed to post item to server:', err);
    }

    // Local fallback
    const nextNum = items.length + 101;
    const newItem: ThriftItem = {
      ...data,
      id: `dds-${Date.now()}`,
      code: `DDS-${nextNum}`,
      uploadedAt: 'Just now',
      viewsCount: 1,
    };
    setItems(prev => [newItem, ...prev]);
    addToast({
      type: 'drop',
      title: '🔥 New Drop Uploaded!',
      message: `"${newItem.title}" (${newItem.category}) added to rack!`,
      durationMs: 4500,
    });
    return newItem;
  };

  const updateItem = async (id: string, updates: Partial<ThriftItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    try {
      await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          staffName: userSession.staffName,
          staffCode: userSession.staffCode,
        }),
      });
      fetchServerData(true);
    } catch (err) {
      console.error('Update item error:', err);
    }
  };

  const deleteItem = async (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setCart(prev => prev.filter(item => item.id !== id));
    setFavorites(prev => prev.filter(favId => favId !== id));

    try {
      await fetch(`/api/items/${id}?staffName=${encodeURIComponent(userSession.staffName || 'Staff')}`, {
        method: 'DELETE',
      });
      fetchServerData(true);
    } catch (err) {
      console.error('Delete item error:', err);
    }
  };

  const setItemStatus = async (id: string, status: ItemStatus, reservedNote?: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      return {
        ...item,
        status,
        reservedBy: status === 'reserved' ? (reservedNote || `Held by ${userSession.staffName || 'Staff'}`) : undefined,
        reservedAt: status === 'reserved' ? 'Just now' : undefined,
      };
    }));

    try {
      await fetch(`/api/items/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reservedBy: reservedNote,
          staffName: userSession.staffName,
          staffCode: userSession.staffCode,
        }),
      });
      fetchServerData(true);
    } catch (err) {
      console.error('Set status error:', err);
    }
  };

  const toggleDailyDrop = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const newVal = !item.isDailyDrop;
    await updateItem(id, { isDailyDrop: newVal });
    if (newVal) {
      addToast({
        type: 'drop',
        title: '⭐ Added to Daily Drops!',
        message: `"${item.title}" is now featured in today's hot picks!`,
      });
      addNotification({
        type: 'drop',
        title: `⭐ Daily Drop Feature: ${item.title}`,
        message: `Featured on today's homepage showcase! Price: UGX ${item.price.toLocaleString()}`,
        linkAction: 'catalog',
        actionLabel: 'View Item',
      });
    }
  };

  const clearAllStock = async () => {
    setItems([]);
    setCart([]);
    setFavorites([]);
    try {
      await fetch('/api/items/clear-all', { method: 'POST' });
      fetchServerData(true);
    } catch (err) {
      console.error('Clear stock error:', err);
    }
  };

  const loadDemoPreset = async () => {
    try {
      await fetch('/api/items/seed-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: DEMO_ITEMS_PRESET }),
      });
      fetchServerData(true);
    } catch (err) {
      setItems(DEMO_ITEMS_PRESET);
    }
  };

  const registerEmployee = async (data: { 
    fullName: string; 
    phone: string; 
    role?: 'inventory_lead' | 'floor_assistant' | 'owner';
    username?: string;
    admissionNumber?: string;
    staffCode?: string;
    pin?: string;
  }) => {
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, message: resData.error || 'Failed to register' };
      }
      setEmployees(prev => [...prev, resData]);
      fetchServerData(true);
      return { 
        success: true, 
        message: `Staff member ${resData.fullName} enrolled! Admission No: ${resData.admissionNumber}, User: ${resData.username}, PIN: ${resData.pin}`,
        employee: resData 
      };
    } catch (err) {
      const baseUser = data.fullName.toLowerCase().trim().replace(/[^a-z0-9]/g, '.');
      const year = new Date().getFullYear();
      const nextNum = String(employees.length + 1).padStart(3, '0');
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        fullName: data.fullName,
        phone: data.phone,
        username: data.username || baseUser,
        admissionNumber: data.admissionNumber || `DDS/EMP/${year}/${nextNum}`,
        staffCode: (data.staffCode || `STAFF-${100 + employees.length + 1}`).toUpperCase(),
        pin: data.pin || String(Math.floor(1000 + Math.random() * 9000)),
        role: data.role || 'floor_assistant',
        status: 'active',
        registeredAt: new Date().toISOString().split('T')[0],
        totalUploads: 0,
        lastLogin: 'Never',
      };
      setEmployees(prev => [...prev, newEmp]);
      return { 
        success: true, 
        message: `Staff member ${newEmp.fullName} enrolled! Admission No: ${newEmp.admissionNumber}, User: ${newEmp.username}, PIN: ${newEmp.pin}`,
        employee: newEmp 
      };
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...updates } : emp));
    try {
      await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      fetchServerData(true);
    } catch (err) {
      console.error('Update employee error:', err);
    }
  };

  const updateEmployeeStatus = async (id: string, status: 'active' | 'pending' | 'suspended') => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, status } : emp));
    try {
      await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchServerData(true);
    } catch (err) {
      console.error('Update employee status error:', err);
    }
  };

  const deleteEmployee = async (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    try {
      await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
      });
      fetchServerData(true);
    } catch (err) {
      console.error('Delete employee error:', err);
    }
  };

  const addToCart = (item: ThriftItem) => {
    setCart(prev => {
      if (prev.some(cartItem => cartItem.id === item.id)) {
        addToast({
          type: 'info',
          title: 'Already in your bag',
          message: `"${item.title}" is already in your WhatsApp order bag.`,
          durationMs: 3000,
        });
        return prev;
      }
      addToast({
        type: 'cart',
        title: 'Added to WhatsApp Bag! 🛍️',
        message: `"${item.title}" (UGX ${item.price.toLocaleString()}) added.`,
        durationMs: 4000,
      });
      addNotification({
        type: 'order',
        title: `Added to Bag: ${item.title}`,
        message: `You added ${item.code} (Size: ${item.size}) for UGX ${item.price.toLocaleString()} to your shopping bag.`,
        linkAction: 'cart',
        actionLabel: 'View Bag',
        showToast: false,
      });
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const removed = prev.find(item => item.id === id);
      if (removed) {
        addToast({
          type: 'info',
          title: 'Item Removed',
          message: `"${removed.title}" removed from your bag.`,
          durationMs: 3000,
        });
      }
      return prev.filter(item => item.id !== id);
    });
  };

  const clearCart = () => {
    setCart([]);
    addToast({
      type: 'info',
      title: 'Bag Cleared',
      message: 'All items removed from your WhatsApp bag.',
      durationMs: 3000,
    });
  };

  const toggleFavorite = (id: string) => {
    const item = items.find(i => i.id === id);
    setFavorites(prev => {
      const isFav = prev.includes(id);
      if (!isFav) {
        addToast({
          type: 'success',
          title: 'Saved to Wishlist ❤️',
          message: item ? `"${item.title}" added to your saved picks.` : 'Item saved.',
          durationMs: 3000,
        });
      } else {
        addToast({
          type: 'info',
          title: 'Removed from Wishlist',
          message: item ? `"${item.title}" removed from saved picks.` : 'Item removed.',
          durationMs: 2500,
        });
      }
      return isFav ? prev.filter(item => item !== id) : [...prev, id];
    });
  };

  const updateConfig = async (updates: Partial<StoreConfig>) => {
    setStoreConfig(prev => ({ ...prev, ...updates }));
    addToast({
      type: 'success',
      title: 'Store Settings Updated',
      message: 'Phone numbers and boutique announcements saved.',
      durationMs: 3500,
    });
    try {
      await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      fetchServerData(true);
    } catch (err) {
      console.error('Update config error:', err);
    }
  };

  const resetAllData = async () => {
    setItems([]);
    setEmployees(INITIAL_EMPLOYEES);
    setStoreConfig(INITIAL_STORE_CONFIG);
    setCart([]);
    setFavorites([]);
    try {
      await fetch('/api/items/clear-all', { method: 'POST' });
      fetchServerData(true);
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  // Notification management methods
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    fetch(`/api/notifications/${id}/read`, { method: 'PUT' }).catch(() => {});
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    fetch('/api/notifications/mark-all-read', { method: 'PUT' }).catch(() => {});
    addToast({
      type: 'info',
      title: 'All Caught Up! ✨',
      message: 'All notifications marked as read.',
      durationMs: 2500,
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    fetch(`/api/notifications/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    fetch('/api/notifications', { method: 'DELETE' }).catch(() => {});
    addToast({
      type: 'info',
      title: 'Notifications Cleared',
      message: 'Notification history has been cleared.',
      durationMs: 2500,
    });
  };

  const addNotification = (notifData: Omit<StoreNotification, 'id' | 'timestamp' | 'read'> & { id?: string; timestamp?: string; showToast?: boolean }) => {
    const newNotif: StoreNotification = {
      id: notifData.id || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: notifData.type,
      title: notifData.title,
      message: notifData.message,
      timestamp: notifData.timestamp || 'Just now',
      read: false,
      urgent: notifData.urgent,
      actionLabel: notifData.actionLabel,
      linkAction: notifData.linkAction,
      authorName: notifData.authorName || 'Daphine Doha Store',
    };

    setNotifications(prev => [newNotif, ...prev]);

    if (notifData.showToast !== false) {
      addToast({
        type: notifData.type === 'drop' ? 'drop' : notifData.type === 'deal' ? 'success' : 'info',
        title: notifData.title,
        message: notifData.message,
      });
    }
  };

  const broadcastNotification = async (notifData: {
    title: string;
    message: string;
    type: NotificationType;
    urgent?: boolean;
    actionLabel?: string;
    linkAction?: StoreNotification['linkAction'];
  }) => {
    const newNotif: StoreNotification = {
      id: `notif-${Date.now()}`,
      type: notifData.type,
      title: notifData.title,
      message: notifData.message,
      timestamp: 'Just now',
      read: false,
      urgent: Boolean(notifData.urgent),
      actionLabel: notifData.actionLabel,
      linkAction: notifData.linkAction,
      authorName: userSession.staffName || 'Daphine Doha Store',
    };

    setNotifications(prev => [newNotif, ...prev]);

    addToast({
      type: notifData.urgent ? 'warning' : 'drop',
      title: notifData.title,
      message: notifData.message,
      durationMs: 6000,
    });

    sendBrowserNotification(notifData.title, notifData.message);

    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotif),
      });
    } catch (err) {
      console.warn('Broadcast notification server error:', err);
    }
  };

  const getWhatsAppOrderUrl = (
    itemsParam: ThriftItem | ThriftItem[], 
    deliveryMethod: 'pickup' | 'boda_kampala' | 'upcountry',
    customerInfo?: { name?: string; phone?: string; location?: string; notes?: string }
  ): string => {
    const list = Array.isArray(itemsParam) ? itemsParam : [itemsParam];
    const totalUGX = list.reduce((sum, it) => sum + it.price, 0);
    
    let deliveryLabel = '';
    if (deliveryMethod === 'pickup') {
      deliveryLabel = '🛍️ In-Store Pickup at Pioneer Mall (Shop PF 32/37)';
    } else if (deliveryMethod === 'boda_kampala') {
      deliveryLabel = '🛵 Same-Day Boda Delivery in Kampala';
    } else {
      deliveryLabel = '📦 Regional Courier / Upcountry Bus';
    }

    let message = `*DAPHINE DOHA STORE ORDER REQUEST*\n`;
    message += `📍 Store: Pioneer Mall, Shop PF 32/37, Kampala\n`;
    message += `───────────────────────\n`;
    
    if (list.length === 1) {
      const it = list[0];
      message += `👗 *Item:* ${it.title} (${it.code})\n`;
      message += `💰 *Price:* UGX ${it.price.toLocaleString()}\n`;
      message += `📏 *Size:* ${it.size}\n`;
      message += `✨ *Condition:* ${it.condition}\n`;
      message += `🎨 *Color:* ${it.color}\n`;
    } else {
      message += `🛍️ *Items (${list.length} thrift pieces):*\n`;
      list.forEach((it, idx) => {
        message += `${idx + 1}. ${it.title} [${it.code}] - Size: ${it.size} - UGX ${it.price.toLocaleString()}\n`;
      });
      message += `\n*TOTAL ITEMS VALUE: UGX ${totalUGX.toLocaleString()}*\n`;
    }
    
    message += `───────────────────────\n`;
    message += `🚚 *Fulfillment Preference:* ${deliveryLabel}\n`;
    
    if (customerInfo?.name) {
      message += `👤 *Customer Name:* ${customerInfo.name}\n`;
    }
    if (customerInfo?.phone) {
      message += `📞 *Phone:* ${customerInfo.phone}\n`;
    }
    if (customerInfo?.location) {
      message += `📍 *Delivery Address / Division:* ${customerInfo.location}\n`;
    }
    if (customerInfo?.notes) {
      message += `📝 *Note:* ${customerInfo.notes}\n`;
    }

    message += `\n*Question:* Is this piece still available? Please confirm and provide payment / pickup details. Thank you!`;

    const cleanPhone = storeConfig.primaryWhatsApp.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <StoreContext.Provider
      value={{
        items,
        employees,
        storeConfig,
        userSession,
        cart,
        favorites,
        activityLogs,
        isSyncing,
        notifications,
        unreadNotificationsCount,
        toasts,
        addToast,
        removeToast,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearAllNotifications,
        addNotification,
        broadcastNotification,
        pushPermission,
        requestPushPermission,
        sendBrowserNotification,
        authenticateStaff,
        authenticateAdmin,
        logoutStaff,
        logoutAdmin,
        switchRole,
        addItem,
        updateItem,
        deleteItem,
        setItemStatus,
        toggleDailyDrop,
        clearAllStock,
        loadDemoPreset,
        registerEmployee,
        updateEmployee,
        updateEmployeeStatus,
        deleteEmployee,
        addToCart,
        removeFromCart,
        clearCart,
        toggleFavorite,
        updateConfig,
        resetAllData,
        getWhatsAppOrderUrl,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
