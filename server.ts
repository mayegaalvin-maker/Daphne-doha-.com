import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;
const DATA_FILE = path.resolve(process.cwd(), 'data', 'store-data.json');

// Enable 50MB payload for high-res mobile phone camera uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

interface StoreData {
  items: any[];
  employees: any[];
  config: any;
  activityLogs: any[];
  notifications: any[];
}

const DEFAULT_SERVER_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'drop',
    title: '🔥 Fresh Bale Unboxed Today!',
    message: 'Grade A UK Thrift tops, linen blouses, and vintage sets just unpacked at Shop PF 32/37. Over 30 new one-of-a-kind items on the rack!',
    timestamp: '15 mins ago',
    read: false,
    urgent: true,
    linkAction: 'tops',
    actionLabel: 'Browse Tops (10k-30k)',
    authorName: 'Daphine Doha'
  },
  {
    id: 'notif-2',
    type: 'deal',
    title: '🤝 Kampala Bargain Hotline Active',
    message: 'Found an item you adore? Name your budget on WhatsApp or propose a fast combo deal directly to Daphine.',
    timestamp: '1 hour ago',
    read: false,
    urgent: false,
    linkAction: 'bargain',
    actionLabel: 'Name Your Budget',
    authorName: 'Store Management'
  },
  {
    id: 'notif-3',
    type: 'announcement',
    title: '📍 Same-Day SafeBoda Kampala Delivery',
    message: 'Fast dispatch within 45 minutes anywhere in Kampala (Nakawa, Kololo, Kamwokya, Ntinda, Bugolobi, Entebbe). Upcountry via coach couriers.',
    timestamp: 'Today, 9:00 AM',
    read: false,
    urgent: false,
    linkAction: 'store_info',
    actionLabel: 'View Delivery & Shop Map',
    authorName: 'Daphine Doha Store'
  },
  {
    id: 'notif-4',
    type: 'announcement',
    title: '📱 Follow Us on TikTok @daphinedohastore',
    message: 'Watch our real-time video unboxings and outfit pairing styling tips on TikTok. Live streams every Thursday & Saturday!',
    timestamp: 'Yesterday',
    read: true,
    urgent: false,
    linkAction: 'tiktok',
    actionLabel: 'Visit TikTok Store',
    authorName: 'Daphine Doha Store'
  }
];

function loadData(): StoreData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (!parsed.notifications || !Array.isArray(parsed.notifications)) {
        parsed.notifications = DEFAULT_SERVER_NOTIFICATIONS;
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error reading store data:', err);
  }
  return {
    items: [],
    employees: [],
    config: {},
    activityLogs: [],
    notifications: DEFAULT_SERVER_NOTIFICATIONS,
  };
}

function saveData(data: StoreData) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store data:', err);
  }
}

// Helper to log activities
function logActivity(data: StoreData, staffName: string, staffCode: string, action: string, details: string, itemCode: string) {
  const newLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    staffName: staffName || 'Staff',
    staffCode: staffCode || 'STAFF',
    action,
    details,
    itemCode,
  };
  data.activityLogs.unshift(newLog);
  if (data.activityLogs.length > 60) {
    data.activityLogs = data.activityLogs.slice(0, 60);
  }
}

// ----------------- API ROUTES ----------------- //

// GET store snapshot (used for real-time multi-device sync)
app.get('/api/store-sync', (req: Request, res: Response) => {
  const data = loadData();
  res.json({
    items: data.items,
    employees: data.employees,
    config: data.config,
    activityLogs: data.activityLogs,
    notifications: data.notifications || [],
    serverTime: new Date().toISOString(),
  });
});

// GET all notifications
app.get('/api/notifications', (req: Request, res: Response) => {
  const data = loadData();
  res.json(data.notifications || []);
});

// BROADCAST a store notification (from Daphine/Admin or Staff)
app.post('/api/notifications', (req: Request, res: Response) => {
  const data = loadData();
  const { title, message, type = 'announcement', urgent = false, actionLabel, linkAction, authorName = 'Daphine Doha Store' } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required' });
  }

  const newNotif = {
    id: `notif-${Date.now()}`,
    type,
    title,
    message,
    timestamp: 'Just now',
    read: false,
    urgent: Boolean(urgent),
    actionLabel: actionLabel || undefined,
    linkAction: linkAction || undefined,
    authorName,
  };

  if (!Array.isArray(data.notifications)) {
    data.notifications = [];
  }

  data.notifications.unshift(newNotif);
  if (data.notifications.length > 50) {
    data.notifications = data.notifications.slice(0, 50);
  }

  saveData(data);
  res.status(201).json(newNotif);
});

// MARK notification as read
app.put('/api/notifications/:id/read', (req: Request, res: Response) => {
  const data = loadData();
  const notif = (data.notifications || []).find(n => n.id === req.params.id);
  if (notif) {
    notif.read = true;
    saveData(data);
  }
  res.json({ success: true });
});

// MARK ALL notifications as read
app.put('/api/notifications/mark-all-read', (req: Request, res: Response) => {
  const data = loadData();
  if (Array.isArray(data.notifications)) {
    data.notifications.forEach(n => { n.read = true; });
    saveData(data);
  }
  res.json({ success: true });
});

// DELETE single notification
app.delete('/api/notifications/:id', (req: Request, res: Response) => {
  const data = loadData();
  data.notifications = (data.notifications || []).filter(n => n.id !== req.params.id);
  saveData(data);
  res.json({ success: true });
});

// CLEAR all notifications
app.delete('/api/notifications', (req: Request, res: Response) => {
  const data = loadData();
  data.notifications = [];
  saveData(data);
  res.json({ success: true });
});

// GET all items
app.get('/api/items', (req: Request, res: Response) => {
  const data = loadData();
  res.json(data.items);
});

// CREATE a new item (Real photos uploaded from Daphine or staff)
app.post('/api/items', (req: Request, res: Response) => {
  const data = loadData();
  const nextNum = data.items.length + 101;
  const code = `DDS-${nextNum}`;

  const newItem = {
    ...req.body,
    id: `dds-${Date.now()}`,
    code: req.body.code || code,
    uploadedAt: 'Just now',
    viewsCount: 1,
    status: req.body.status || 'available',
  };

  data.items.unshift(newItem);

  // Update staff upload count
  const uploaderName = req.body.uploadedBy || 'Floor Staff';
  const staffMember = data.employees.find(e => e.fullName.toLowerCase() === uploaderName.toLowerCase());
  if (staffMember) {
    staffMember.totalUploads = (staffMember.totalUploads || 0) + 1;
  }

  // Prepend new drop notification
  if (!Array.isArray(data.notifications)) {
    data.notifications = [];
  }
  data.notifications.unshift({
    id: `notif-${Date.now()}`,
    type: 'drop',
    title: `🔥 New Drop: ${newItem.title}`,
    message: `Fresh arrival on rack! ${newItem.category.toUpperCase()} (${newItem.size}) for UGX ${Number(newItem.price).toLocaleString()} at Shop PF 32/37.`,
    timestamp: 'Just now',
    read: false,
    urgent: false,
    linkAction: newItem.category === 'tops' ? 'tops' : 'catalog',
    actionLabel: 'View in Catalog',
    authorName: uploaderName
  });
  if (data.notifications.length > 50) {
    data.notifications = data.notifications.slice(0, 50);
  }

  logActivity(
    data,
    uploaderName,
    staffMember ? staffMember.staffCode : 'STAFF',
    'upload',
    `Uploaded real piece "${newItem.title}" (${newItem.category}, Size ${newItem.size}) for UGX ${Number(newItem.price).toLocaleString()}`,
    newItem.code
  );

  saveData(data);
  res.status(201).json(newItem);
});

// UPDATE an item (descriptions, prices, photos)
app.put('/api/items/:id', (req: Request, res: Response) => {
  const data = loadData();
  const { id } = req.params;
  const idx = data.items.findIndex(i => i.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const existing = data.items[idx];
  const updated = { ...existing, ...req.body };
  data.items[idx] = updated;

  logActivity(
    data,
    req.body.staffName || 'Staff',
    req.body.staffCode || 'STAFF',
    'edit_details',
    `Updated details for piece "${updated.title}" (${updated.code})`,
    updated.code
  );

  saveData(data);
  res.json(updated);
});

// UPDATE stock status (Available, Reserved, Sold)
app.post('/api/items/:id/status', (req: Request, res: Response) => {
  const data = loadData();
  const { id } = req.params;
  const { status, reservedBy, staffName, staffCode } = req.body;

  const item = data.items.find(i => i.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  item.status = status;
  if (status === 'reserved') {
    item.reservedBy = reservedBy || `Held by ${staffName || 'Staff'}`;
    item.reservedAt = 'Just now';
  } else {
    item.reservedBy = undefined;
    item.reservedAt = undefined;
  }

  const statusLabel = status === 'available' ? 'Available on Racks' : status === 'reserved' ? `Reserved (${item.reservedBy})` : 'Sold Out';
  logActivity(
    data,
    staffName || 'Staff',
    staffCode || 'STAFF',
    'status_change',
    `Changed status of ${item.code} to "${statusLabel}"`,
    item.code
  );

  saveData(data);
  res.json(item);
});

// DELETE an item
app.delete('/api/items/:id', (req: Request, res: Response) => {
  const data = loadData();
  const { id } = req.params;
  const target = data.items.find(i => i.id === id);

  if (target) {
    data.items = data.items.filter(i => i.id !== id);
    logActivity(
      data,
      (req.query.staffName as string) || 'Admin',
      'ADMIN',
      'edit_details',
      `Removed item "${target.title}" (${target.code}) from inventory`,
      target.code
    );
    saveData(data);
  }

  res.json({ success: true });
});

// CLEAR ALL STOCK (Makes inventory completely empty for Daphine)
app.post('/api/items/clear-all', (req: Request, res: Response) => {
  const data = loadData();
  const count = data.items.length;
  data.items = [];

  logActivity(
    data,
    'Daphine Doha',
    'DD-001',
    'edit_details',
    `Emptied catalog (${count} pieces removed). Ready for real stock intake.`,
    'ALL'
  );

  saveData(data);
  res.json({ success: true, message: 'Inventory is now completely clean and empty.' });
});

// SEED DEMO ITEMS (Optional for testing)
app.post('/api/items/seed-demo', (req: Request, res: Response) => {
  const data = loadData();
  const demoItems = req.body.items || [];
  data.items = demoItems;

  logActivity(
    data,
    'System',
    'SYS',
    'upload',
    `Loaded ${demoItems.length} sample preview items for demonstration.`,
    'DEMO'
  );

  saveData(data);
  res.json({ success: true, items: data.items });
});

// GET employees
app.get('/api/employees', (req: Request, res: Response) => {
  const data = loadData();
  res.json(data.employees);
});

// REGISTER employee with automated Username and Admission Number generation
app.post('/api/employees', (req: Request, res: Response) => {
  const data = loadData();
  const { fullName, phone, role } = req.body;

  if (!fullName || !phone) {
    return res.status(400).json({ error: 'Full name and phone number are required.' });
  }

  // Generate unique username: e.g. "brenda.namatovu"
  const baseUsername = fullName.toLowerCase().trim().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.');
  let username = req.body.username || baseUsername;
  let usernameCounter = 1;
  while (data.employees.some(e => e.username?.toLowerCase() === username.toLowerCase())) {
    username = `${baseUsername}${usernameCounter}`;
    usernameCounter++;
  }

  // Generate unique Admission Number: e.g. "DDS/EMP/2026/005"
  const year = new Date().getFullYear();
  const nextNum = String(data.employees.length + 1).padStart(3, '0');
  const admissionNumber = req.body.admissionNumber || `DDS/EMP/${year}/${nextNum}`;

  // Generate Staff Badge Code: e.g. "STAFF-105"
  const staffCode = (req.body.staffCode || `STAFF-${100 + data.employees.length + 1}`).toUpperCase();

  // Generate 4-digit PIN: e.g. "4821"
  const pin = req.body.pin || String(Math.floor(1000 + Math.random() * 9000));

  const exists = data.employees.some(
    e => e.phone === phone || e.staffCode.toUpperCase() === staffCode.toUpperCase()
  );

  if (exists) {
    return res.status(400).json({ error: 'Employee with this phone or badge code already exists' });
  }

  const newEmp = {
    id: `emp-${Date.now()}`,
    fullName: fullName.trim(),
    phone: phone.trim(),
    username,
    admissionNumber,
    staffCode,
    pin,
    role: role || 'floor_assistant',
    status: 'active',
    registeredAt: new Date().toISOString().split('T')[0],
    totalUploads: 0,
    lastLogin: 'Never',
  };

  data.employees.push(newEmp);

  logActivity(
    data,
    req.body.administeredBy || 'Daphine Doha',
    'DD-001',
    'edit_details',
    `Registered new staff member ${newEmp.fullName} (${newEmp.admissionNumber}, User: ${newEmp.username})`,
    newEmp.staffCode
  );

  saveData(data);
  res.status(201).json(newEmp);
});

// AUTHENTICATE staff (supports Username, Badge Code, or Admission Number)
app.post('/api/employees/login', (req: Request, res: Response) => {
  const data = loadData();
  const { staffCode, username, pin } = req.body;
  const identifier = (staffCode || username || '').trim().toLowerCase();

  const emp = data.employees.find(e => 
    e.staffCode.toLowerCase() === identifier ||
    e.username?.toLowerCase() === identifier ||
    e.admissionNumber?.toLowerCase() === identifier
  );

  if (!emp) {
    return res.status(401).json({ error: 'Staff account not found. Please verify your username, badge code, or admission number.' });
  }

  if (emp.status === 'suspended') {
    return res.status(403).json({ error: 'This staff badge has been suspended. Please contact Daphine.' });
  }

  if (emp.status === 'pending') {
    return res.status(403).json({ error: 'Staff registration pending approval by Daphine Doha.' });
  }

  if (emp.pin && emp.pin !== (pin || '').trim()) {
    return res.status(401).json({ error: 'Incorrect 4-digit security PIN.' });
  }

  emp.lastLogin = `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  saveData(data);

  res.json({ success: true, employee: emp });
});

// UPDATE employee (role, status, pin, username, admissionNumber)
app.put('/api/employees/:id', (req: Request, res: Response) => {
  const data = loadData();
  const { id } = req.params;
  const idx = data.employees.findIndex(e => e.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  const existing = data.employees[idx];
  const updated = { ...existing, ...req.body };
  data.employees[idx] = updated;

  logActivity(
    data,
    'Daphine Doha',
    'DD-001',
    'edit_details',
    `Updated staff records for ${updated.fullName} (${updated.admissionNumber || updated.staffCode})`,
    updated.staffCode
  );

  saveData(data);
  res.json(updated);
});

// DELETE employee
app.delete('/api/employees/:id', (req: Request, res: Response) => {
  const data = loadData();
  const { id } = req.params;
  const target = data.employees.find(e => e.id === id);

  if (target) {
    data.employees = data.employees.filter(e => e.id !== id);
    logActivity(
      data,
      'Daphine Doha',
      'DD-001',
      'edit_details',
      `Removed employee ${target.fullName} (${target.admissionNumber || target.staffCode}) from system`,
      target.staffCode
    );
    saveData(data);
  }

  res.json({ success: true });
});

// AUTHENTICATE OWNER (Daphine Administrative Portal)
app.post('/api/admin/login', (req: Request, res: Response) => {
  const data = loadData();
  const { username, pin } = req.body;
  const user = (username || '').trim().toLowerCase().replace('@', '');
  const cleanPin = (pin || '').trim();

  // Find owner account
  const owner = data.employees.find(e => 
    e.role === 'owner' || 
    e.staffCode === 'DD-001' || 
    e.username === 'daphine.doha'
  );

  const isMatchingUser = 
    user === 'daphine' || 
    user === 'daphinedohastore' ||
    user === 'daphine doha store' ||
    user === 'daphinedoha' ||
    user === 'daphine.doha' || 
    user === 'dd-001' || 
    user === 'dds/adm/2026/001' ||
    user === '+256787355533' ||
    user === '0787355533' ||
    user === '256787355533' ||
    user === (owner?.username || '').toLowerCase() ||
    user === (owner?.staffCode || '').toLowerCase() ||
    user === (owner?.admissionNumber || '').toLowerCase() ||
    user === (owner?.phone || '').toLowerCase().replace(/[^0-9]/g, '');

  if (!isMatchingUser) {
    return res.status(401).json({ error: 'Invalid Administrator Username. Please verify your business credentials.' });
  }

  const expectedPin = owner?.pin || '2026';
  if (cleanPin !== expectedPin) {
    return res.status(401).json({ error: 'Incorrect Master Security PIN. Access denied.' });
  }

  if (owner) {
    owner.lastLogin = `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    saveData(data);
  }

  res.json({ 
    success: true, 
    message: 'Welcome Daphine Doha! Master Administrative Control authorized.',
    owner: owner || {
      id: 'emp-1',
      fullName: 'Daphine Doha',
      username: 'daphine.doha',
      admissionNumber: 'DDS/ADM/2026/001',
      staffCode: 'DD-001',
      role: 'owner',
    }
  });
});

// UPDATE store configuration
app.put('/api/config', (req: Request, res: Response) => {
  const data = loadData();
  data.config = { ...data.config, ...req.body };
  saveData(data);
  res.json(data.config);
});

// ----------------- START SERVER WITH VITE ----------------- //
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Daphine Doha Store Server running on port ${PORT}`);
  });
}

startServer();
