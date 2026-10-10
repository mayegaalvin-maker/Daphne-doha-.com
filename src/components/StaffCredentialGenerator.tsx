import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Sparkles, 
  Copy, 
  Check, 
  Send, 
  RefreshCw, 
  ShieldCheck, 
  KeyRound, 
  Phone, 
  Tag, 
  FileText,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  X
} from 'lucide-react';
import { Employee, StaffRole } from '../types/store';
import { useStore } from '../context/StoreContext';

interface StaffCredentialGeneratorProps {
  onSuccess?: (employee: Employee) => void;
  onCancel?: () => void;
}

export const StaffCredentialGenerator: React.FC<StaffCredentialGeneratorProps> = ({ 
  onSuccess, 
  onCancel 
}) => {
  const { employees, registerEmployee, storeConfig } = useStore();

  // Inputs
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+256 ');
  const [role, setRole] = useState<StaffRole>('floor_assistant');

  // Generated fields (with ability to manually override if needed)
  const [username, setUsername] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [staffCode, setStaffCode] = useState('');
  const [pin, setPin] = useState('');

  const [copiedSlip, setCopiedSlip] = useState(false);
  const [enrolledEmployee, setEnrolledEmployee] = useState<Employee | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Function to compute unique username
  const computeUsername = (name: string) => {
    if (!name.trim()) return '';
    const base = name.toLowerCase().trim().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.').replace(/^\.|\.$/g, '');
    let u = base;
    let counter = 1;
    while (employees.some(e => e.username?.toLowerCase() === u.toLowerCase())) {
      counter++;
      u = `${base}${counter}`;
    }
    return u;
  };

  // Function to compute next Admission Number
  const computeAdmissionNumber = () => {
    const year = new Date().getFullYear();
    const nextSeq = String(employees.length + 1).padStart(3, '0');
    return `DDS/EMP/${year}/${nextSeq}`;
  };

  // Function to compute next Staff Badge Code
  const computeStaffCode = () => {
    return `STAFF-${100 + employees.length + 1}`;
  };

  // Function to generate random 4-digit PIN
  const generateRandomPin = () => {
    return String(Math.floor(1000 + Math.random() * 9000));
  };

  // Re-generate credentials on full name change if not enrolled yet
  useEffect(() => {
    if (!enrolledEmployee) {
      if (fullName.trim()) {
        setUsername(computeUsername(fullName));
      }
      setAdmissionNumber(computeAdmissionNumber());
      setStaffCode(computeStaffCode());
      if (!pin) {
        setPin(generateRandomPin());
      }
    }
  }, [fullName, employees.length, enrolledEmployee]);

  const handleRegenerateCredentials = () => {
    if (fullName.trim()) {
      setUsername(computeUsername(fullName));
    }
    setAdmissionNumber(computeAdmissionNumber());
    setStaffCode(computeStaffCode());
    setPin(generateRandomPin());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || fullName.trim().length < 3) {
      setErrorMsg('Please enter a valid full name for the staff member.');
      return;
    }

    if (!phone.trim() || phone.trim().length < 9) {
      setErrorMsg('Please enter a valid phone number (Uganda format).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await registerEmployee({
        fullName: fullName.trim(),
        phone: phone.trim(),
        role,
        username: username.trim() || computeUsername(fullName),
        admissionNumber: admissionNumber.trim() || computeAdmissionNumber(),
        staffCode: staffCode.trim() || computeStaffCode(),
        pin: pin.trim() || generateRandomPin(),
      });

      if (res.success && res.employee) {
        setEnrolledEmployee(res.employee);
        if (onSuccess) onSuccess(res.employee);
      } else {
        setErrorMsg(res.message || 'Failed to enroll staff member.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with server.');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate formatted WhatsApp message text
  const getWhatsAppCredentialsText = (emp: Employee) => {
    const roleTitle = emp.role === 'inventory_lead' ? 'Inventory Lead & Price Manager' : 'Boutique Floor Assistant';
    return (
      `✨ *DAPHINE DOHA STORE - EMPLOYEE APPOINTMENT & LOGIN CREDENTIALS* ✨\n` +
      `📍 Pioneer Mall, Shop PF 32/37, Kampala, Uganda\n` +
      `───────────────────────────────\n` +
      `Dear *${emp.fullName}*,\n\n` +
      `Welcome to the Daphine Doha Store team! You have been officially enrolled into our real-time stock management and clothing arrivals intake portal.\n\n` +
      `📋 *Official Admission Number:* ${emp.admissionNumber}\n` +
      `👤 *System Username:* ${emp.username}\n` +
      `🏷️ *Staff Badge Code:* ${emp.staffCode}\n` +
      `🔑 *4-Digit Access PIN:* ${emp.pin}\n` +
      `👔 *Role:* ${roleTitle}\n` +
      `───────────────────────────────\n` +
      `📲 *How to log in on your phone:*\n` +
      `1. Open the store website on your browser.\n` +
      `2. Switch to "Staff Upload Mode" or click the Staff Portal link.\n` +
      `3. Enter your Username (*${emp.username}*) or Badge (*${emp.staffCode}*) and your 4-digit PIN (*${emp.pin}*).\n` +
      `4. Snap photos of fresh clothing bales arriving at Pioneer Mall and post them live to our online rack catalog!\n\n` +
      `Need help? Reach out directly to store owner Daphine Doha at Pioneer Mall.`
    );
  };

  const handleCopySlip = (emp: Employee) => {
    const text = getWhatsAppCredentialsText(emp);
    navigator.clipboard.writeText(text);
    setCopiedSlip(true);
    setTimeout(() => setCopiedSlip(false), 2500);
  };

  const handleOpenWhatsApp = (emp: Employee) => {
    const cleanPhone = emp.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(getWhatsAppCredentialsText(emp));
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleResetFormForAnother = () => {
    setEnrolledEmployee(null);
    setFullName('');
    setPhone('+256 ');
    setUsername('');
    setAdmissionNumber(computeAdmissionNumber());
    setStaffCode(computeStaffCode());
    setPin(generateRandomPin());
    setErrorMsg('');
  };

  return (
    <div className="bg-white border border-emerald-200 rounded-2xl p-5 sm:p-6 space-y-6 text-stone-800 shadow-xl">
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Automated Staff Credential Engine</span>
            </span>
            <span className="text-xs text-stone-500">Pioneer Mall Store Controller</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold font-serif text-emerald-950">
            Enroll New Employee &amp; Generate Admission Credentials
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Automatically issues a unique official admission number, system username, staff badge, and 4-digit security PIN for daily photo uploads.
          </p>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="self-start sm:self-center p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Success View: Admission Slip Issued */}
      {enrolledEmployee ? (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-emerald-950">
                Employee Enrolled &amp; Credentials Generated Successfully!
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                <strong>{enrolledEmployee.fullName}</strong> is now registered in the store system. You can copy their official admission slip or send it directly to their WhatsApp number.
              </p>
            </div>
          </div>

          {/* Official Admission Slip Preview Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-stone-50 border border-emerald-200 space-y-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider rounded-bl-xl">
              Official Admission Slip
            </div>

            <div className="border-b border-emerald-100 pb-3">
              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
                Daphine Doha Store · Pioneer Mall PF 32/37 Kampala
              </span>
              <h4 className="text-xl font-serif font-bold text-emerald-950 mt-0.5">
                {enrolledEmployee.fullName}
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                Phone: <span className="text-stone-800 font-mono">{enrolledEmployee.phone}</span> · Status: <span className="text-emerald-700 font-semibold capitalize">{enrolledEmployee.status}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-emerald-100 shadow-xs">
                <span className="text-[10px] text-stone-500 block font-medium">Admission Number</span>
                <span className="text-sm font-bold font-mono text-emerald-800 block mt-0.5">
                  {enrolledEmployee.admissionNumber}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-emerald-100 shadow-xs">
                <span className="text-[10px] text-stone-500 block font-medium">System Username</span>
                <span className="text-sm font-bold font-mono text-emerald-900 block mt-0.5">
                  @{enrolledEmployee.username}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-emerald-100 shadow-xs">
                <span className="text-[10px] text-stone-500 block font-medium">Staff Badge Code</span>
                <span className="text-sm font-bold font-mono text-stone-800 block mt-0.5">
                  {enrolledEmployee.staffCode}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-emerald-100 shadow-xs">
                <span className="text-[10px] text-stone-500 block font-medium">4-Digit Security PIN</span>
                <span className="text-sm font-bold font-mono text-emerald-700 block mt-0.5 tracking-widest">
                  {enrolledEmployee.pin}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-emerald-100 text-[11px] text-stone-600 flex items-center justify-between">
              <span>
                Assigned Role: <strong className="text-emerald-900 capitalize">{enrolledEmployee.role.replace('_', ' ')}</strong>
              </span>
              <span>
                Enrolled On: <strong className="text-stone-700">{enrolledEmployee.registeredAt}</strong>
              </span>
            </div>

            {/* Quick Actions for this employee */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={() => handleOpenWhatsApp(enrolledEmployee)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-950/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send Credentials to {enrolledEmployee.phone} on WhatsApp</span>
              </button>

              <button
                onClick={() => handleCopySlip(enrolledEmployee)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer border border-stone-200"
              >
                {copiedSlip ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSlip ? 'Copied Slip!' : 'Copy Slip Text'}</span>
              </button>

              <button
                onClick={handleResetFormForAnother}
                className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ml-auto border border-emerald-200"
              >
                <UserPlus className="w-4 h-4" />
                <span>Enroll Another Staff Member</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Form View: Enroll & Generate */
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Core Employee Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <span>Employee Full Name</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Brenda Namatovu"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-emerald-600 font-medium"
              />
              <span className="text-[10px] text-stone-400">First &amp; Last name for boutique roster</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>Phone Number (WhatsApp)</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="+256 701 234567"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-emerald-600 font-mono"
              />
              <span className="text-[10px] text-stone-400">Used for WhatsApp credential dispatch</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">
                <span>Store Role &amp; Access Level</span>
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as StaffRole)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:bg-white focus:border-emerald-600"
              >
                <option value="floor_assistant">Floor Assistant (Arrivals Uploader &amp; Stock Toggler)</option>
                <option value="inventory_lead">Inventory Lead (Price &amp; Listing Editor)</option>
              </select>
              <span className="text-[10px] text-stone-400">Defines dashboard capabilities</span>
            </div>
          </div>

          {/* Generated Credentials Preview & Override Panel */}
          <div className="p-4 sm:p-5 rounded-xl bg-emerald-50/40 border border-emerald-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Live Generated Credentials Preview
                </span>
              </div>
              <button
                type="button"
                onClick={handleRegenerateCredentials}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-emerald-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer border border-emerald-200 shadow-xs"
                title="Refresh generated credentials"
              >
                <RefreshCw className="w-3 h-3 text-emerald-600" />
                <span>Regenerate Credentials</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Generated Username */}
              <div className="p-3 rounded-xl bg-white border border-emerald-100 space-y-1 shadow-xs">
                <label className="text-[10px] text-stone-500 font-semibold block uppercase">
                  System Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-xs text-emerald-900 font-mono font-bold focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
                <span className="text-[10px] text-stone-400">Auto-created from staff name</span>
              </div>

              {/* Generated Admission Number */}
              <div className="p-3 rounded-xl bg-white border border-emerald-100 space-y-1 shadow-xs">
                <label className="text-[10px] text-stone-500 font-semibold block uppercase">
                  Admission Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={admissionNumber}
                    onChange={e => setAdmissionNumber(e.target.value.toUpperCase())}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-xs text-emerald-800 font-mono font-bold focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
                <span className="text-[10px] text-stone-400">Official sequential store ID</span>
              </div>

              {/* Generated Staff Badge */}
              <div className="p-3 rounded-xl bg-white border border-emerald-100 space-y-1 shadow-xs">
                <label className="text-[10px] text-stone-500 font-semibold block uppercase">
                  Staff Badge Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={staffCode}
                    onChange={e => setStaffCode(e.target.value.toUpperCase())}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-800 font-mono font-bold focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
                <span className="text-[10px] text-stone-400">Floor badge identifier</span>
              </div>

              {/* Generated 4-Digit Security PIN */}
              <div className="p-3 rounded-xl bg-white border border-emerald-100 space-y-1 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-stone-500 font-semibold uppercase">
                    Security PIN
                  </label>
                  <button
                    type="button"
                    onClick={() => setPin(generateRandomPin())}
                    className="text-[10px] text-emerald-700 hover:underline cursor-pointer font-medium"
                  >
                    🎲 Randomize
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pin}
                    onChange={e => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-xs text-emerald-700 font-mono font-bold tracking-widest text-center focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
                <span className="text-[10px] text-stone-400">4-digit mobile login PIN</span>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer border border-stone-200"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={submitting || !fullName.trim()}
              className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-emerald-950/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{submitting ? 'Registering Staff Member...' : 'Enroll Staff & Issue Admission Number'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
