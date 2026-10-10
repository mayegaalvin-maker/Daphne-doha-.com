import React, { useState } from 'react';
import { 
  X, 
  Save, 
  KeyRound, 
  ShieldCheck, 
  Sparkles, 
  Phone, 
  Tag, 
  AlertCircle,
  Copy,
  Check,
  MessageCircle
} from 'lucide-react';
import { Employee, StaffRole, StaffStatus } from '../types/store';
import { useStore } from '../context/StoreContext';

interface EditEmployeeModalProps {
  employee: Employee | null;
  onClose: () => void;
}

export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({ employee, onClose }) => {
  const { updateEmployee } = useStore();

  if (!employee) return null;

  const [fullName, setFullName] = useState(employee.fullName);
  const [phone, setPhone] = useState(employee.phone);
  const [username, setUsername] = useState(employee.username || '');
  const [admissionNumber, setAdmissionNumber] = useState(employee.admissionNumber || '');
  const [staffCode, setStaffCode] = useState(employee.staffCode);
  const [pin, setPin] = useState(employee.pin || '1234');
  const [role, setRole] = useState<StaffRole>(employee.role);
  const [status, setStatus] = useState<StaffStatus>(employee.status);
  const [saving, setSaving] = useState(false);
  const [copiedSlip, setCopiedSlip] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateEmployee(employee.id, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        username: username.trim(),
        admissionNumber: admissionNumber.trim(),
        staffCode: staffCode.trim().toUpperCase(),
        pin: pin.trim(),
        role,
        status,
      });
      onClose();
    } catch (err) {
      console.error('Failed to update employee:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleShareWhatsApp = () => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `✨ *DAPHINE DOHA STORE - UPDATED LOGIN CREDENTIALS* ✨\n` +
      `📍 Pioneer Mall, Shop PF 32/37, Kampala\n` +
      `Dear *${fullName}*,\n\n` +
      `Here are your updated employee portal credentials:\n` +
      `📋 *Admission Number:* ${admissionNumber}\n` +
      `👤 *System Username:* ${username}\n` +
      `🏷️ *Badge Code:* ${staffCode}\n` +
      `🔑 *4-Digit PIN:* ${pin}\n` +
      `👔 *Role:* ${role.replace('_', ' ')}\n\n` +
      `You can log in now to continue uploading fresh clothing arrivals.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white border border-emerald-200 rounded-2xl p-6 shadow-2xl space-y-5 text-stone-800">
        <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
          <div>
            <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
              Daphine Doha Store Administration
            </span>
            <h3 className="text-lg font-serif font-bold text-emerald-950 mt-0.5">
              Edit Staff Member: {employee.fullName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 font-mono focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 flex items-center justify-between">
                <span>Admission Number</span>
              </label>
              <input
                type="text"
                required
                value={admissionNumber}
                onChange={e => setAdmissionNumber(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-emerald-800 font-mono font-bold focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 flex items-center justify-between">
                <span>System Username</span>
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase())}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-emerald-950 font-mono font-bold focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Badge Code</label>
              <input
                type="text"
                required
                value={staffCode}
                onChange={e => setStaffCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 font-mono uppercase focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">4-Digit Security PIN</label>
              <input
                type="text"
                required
                maxLength={6}
                value={pin}
                onChange={e => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-emerald-700 font-mono font-bold text-center tracking-widest focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Store Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:bg-white focus:border-emerald-600 focus:outline-none"
              >
                <option value="floor_assistant">Floor Assistant</option>
                <option value="inventory_lead">Inventory Lead</option>
                <option value="owner">Shop Owner</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Staff Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 capitalize focus:bg-white focus:border-emerald-600 focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-emerald-100">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Share via WhatsApp</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer border border-stone-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-950/20"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
