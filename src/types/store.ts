export type ItemCategory = 
  | 'all'
  | 'tops'
  | 'dresses'
  | 'skirts'
  | 'trousers'
  | 'two-piece'
  | 'outerwear'
  | 'accessories';

export type ItemCondition = 
  | 'Grade A (Like New)'
  | 'Pristine Pre-loved'
  | 'Vintage Gem'
  | 'Deadstock Tagged';

export type ItemStatus = 'available' | 'reserved' | 'sold';

export interface ThriftItem {
  id: string;
  code: string; // e.g. "DDS-204"
  title: string;
  category: Exclude<ItemCategory, 'all'>;
  price: number; // in UGX
  originalPrice?: number; // optional crossed-out price
  size: string; // e.g. "S", "M", "L", "UK 10", "UK 12", "Free Size"
  condition: ItemCondition;
  conditionNotes: string;
  color: string;
  material?: string;
  images: string[];
  status: ItemStatus;
  reservedBy?: string;
  reservedAt?: string;
  isDailyDrop?: boolean;
  uploadedBy: string;
  uploadedAt: string;
  viewsCount?: number;
}

export type StaffRole = 'owner' | 'inventory_lead' | 'floor_assistant';
export type StaffStatus = 'active' | 'pending' | 'suspended';

export interface Employee {
  id: string;
  fullName: string;
  phone: string;
  username: string; // generated system username, e.g. sarah.nakato
  admissionNumber: string; // official employee admission number, e.g. DDS/EMP/2026/002
  staffCode: string; // badge code, e.g. STAFF-102
  role: StaffRole;
  status: StaffStatus;
  registeredAt: string;
  totalUploads: number;
  pin: string; // 4-digit security PIN for portal access
  lastLogin?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  staffName: string;
  staffCode: string;
  action: 'upload' | 'status_change' | 'price_edit' | 'edit_details' | 'daily_drop_toggle';
  details: string;
  itemCode: string;
}

export interface StoreConfig {
  storeName: string;
  tagline: string;
  location: string;
  shopNumber: string;
  primaryWhatsApp: string;
  secondaryWhatsApp: string;
  phoneCall: string;
  instagram: string;
  tiktok: string;
  announcement: string;
  currency: string;
  deliveryNotesKampala: string;
  deliveryNotesUpcountry: string;
  workingHours: string;
}

export interface UserSession {
  role: 'customer' | 'employee' | 'owner';
  staffId?: string;
  staffName?: string;
  staffCode?: string;
  staffRole?: StaffRole;
  username?: string;
  admissionNumber?: string;
  isAuthenticatedStaff?: boolean;
  loginTime?: string;
}

export type NotificationType = 'drop' | 'order' | 'announcement' | 'system' | 'deal';

export interface StoreNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkAction?: 'catalog' | 'tops' | 'cart' | 'store_info' | 'bargain' | 'whatsapp' | 'tiktok';
  actionLabel?: string;
  urgent?: boolean;
  authorName?: string;
}

export interface ToastItem {
  id: string;
  type: 'success' | 'info' | 'drop' | 'warning' | 'cart';
  title: string;
  message: string;
  icon?: string;
  durationMs?: number;
  actionLabel?: string;
  onAction?: () => void;
}
