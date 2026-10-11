'use client';

import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import { APP_MODULES } from '@/data/mockData';
import { AppModule, StaffUser, UserRole } from '@/types/pos';
import {
  ShieldCheck,
  UserCheck,
  Plus,
  Trash2,
  Save,
  Check,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export default function StaffAccessControlPage() {
  const { staffUsers, addStaffUser, updateStaffUser, deleteStaffUser, currentUser } = usePOS();

  const [selectedUserId, setSelectedUserId] = useState<string>(
    staffUsers.find((u) => u.role === 'RECEPTIONIST')?.id || staffUsers[0]?.id || ''
  );
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('RECEPTIONIST');
  const [isActive, setIsActive] = useState(true);

  // Matrix Permissions state: Module -> { canView, canAdd, canEdit, canDelete }
  const [permissions, setPermissions] = useState<StaffUser['permissions']>(() => {
    const initial: Partial<StaffUser['permissions']> = {};
    APP_MODULES.forEach((m) => {
      initial[m.id] = { canView: true, canAdd: false, canEdit: false, canDelete: false };
    });
    return initial as StaffUser['permissions'];
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load user data when selection changes
  React.useEffect(() => {
    if (isCreatingNew) {
      setUsername('');
      setPassword('');
      setFullName('');
      setPhone('');
      setRole('RECEPTIONIST');
      setIsActive(true);
      // Default Receptionist permissions
      const initial: Partial<StaffUser['permissions']> = {};
      APP_MODULES.forEach((m) => {
        const isReceptionistFriendly = ['pos', 'orders', 'tables', 'customers', 'kitchen', 'menu'].includes(m.id);
        initial[m.id] = {
          canView: isReceptionistFriendly,
          canAdd: ['pos', 'orders', 'customers'].includes(m.id),
          canEdit: ['pos', 'orders', 'tables', 'customers'].includes(m.id),
          canDelete: false,
        };
      });
      setPermissions(initial as StaffUser['permissions']);
      return;
    }

    const user = staffUsers.find((u) => u.id === selectedUserId);
    if (user) {
      setUsername(user.username);
      setPassword(user.password);
      setFullName(user.fullName);
      setPhone(user.phone || '');
      setRole(user.role);
      setIsActive(user.isActive);
      setPermissions({ ...user.permissions });
    }
  }, [selectedUserId, isCreatingNew, staffUsers]);

  // Permission matrix toggles
  const togglePermission = (
    module: AppModule,
    action: 'canView' | 'canAdd' | 'canEdit' | 'canDelete'
  ) => {
    setPermissions((prev) => {
      const currentMod = prev[module] || { canView: false, canAdd: false, canEdit: false, canDelete: false };
      const updatedMod = { ...currentMod, [action]: !currentMod[action] };

      // If granting Add, Edit, or Delete, ensure View is automatically checked
      if (['canAdd', 'canEdit', 'canDelete'].includes(action) && updatedMod[action]) {
        updatedMod.canView = true;
      }

      // If unchecking View, uncheck all action rights for that module
      if (action === 'canView' && !updatedMod.canView) {
        updatedMod.canAdd = false;
        updatedMod.canEdit = false;
        updatedMod.canDelete = false;
      }

      return { ...prev, [module]: updatedMod };
    });
  };

  // Bulk column toggles
  const toggleColumnAll = (action: 'canView' | 'canAdd' | 'canEdit' | 'canDelete', forceValue?: boolean) => {
    setPermissions((prev) => {
      const allCurrent = APP_MODULES.every((m) => prev[m.id]?.[action]);
      const targetValue = forceValue !== undefined ? forceValue : !allCurrent;

      const updated = { ...prev };
      APP_MODULES.forEach((m) => {
        const currentMod = updated[m.id] || { canView: false, canAdd: false, canEdit: false, canDelete: false };
        const newMod = { ...currentMod, [action]: targetValue };
        if (targetValue && action !== 'canView') {
          newMod.canView = true;
        }
        if (!targetValue && action === 'canView') {
          newMod.canAdd = false;
          newMod.canEdit = false;
          newMod.canDelete = false;
        }
        updated[m.id] = newMod;
      });
      return updated;
    });
  };

  // Row toggle (all actions for a module)
  const toggleRowAll = (module: AppModule) => {
    setPermissions((prev) => {
      const currentMod = prev[module] || { canView: false, canAdd: false, canEdit: false, canDelete: false };
      const allChecked = currentMod.canView && currentMod.canAdd && currentMod.canEdit && currentMod.canDelete;
      return {
        ...prev,
        [module]: {
          canView: !allChecked,
          canAdd: !allChecked,
          canEdit: !allChecked,
          canDelete: !allChecked,
        },
      };
    });
  };

  // Quick Preset Handlers
  const applyPreset = (preset: 'receptionist' | 'full' | 'readonly' | 'clear') => {
    const updated: Partial<StaffUser['permissions']> = {};
    APP_MODULES.forEach((m) => {
      if (preset === 'full') {
        updated[m.id] = { canView: true, canAdd: true, canEdit: true, canDelete: true };
      } else if (preset === 'readonly') {
        updated[m.id] = { canView: true, canAdd: false, canEdit: false, canDelete: false };
      } else if (preset === 'clear') {
        updated[m.id] = { canView: false, canAdd: false, canEdit: false, canDelete: false };
      } else if (preset === 'receptionist') {
        const isReceptionistAllowed = ['pos', 'orders', 'tables', 'customers', 'kitchen', 'menu'].includes(m.id);
        updated[m.id] = {
          canView: isReceptionistAllowed,
          canAdd: ['pos', 'orders', 'customers'].includes(m.id),
          canEdit: ['pos', 'orders', 'tables', 'customers'].includes(m.id),
          canDelete: false,
        };
      }
    });
    setPermissions(updated as StaffUser['permissions']);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      alert('Please enter both username and password.');
      return;
    }

    if (isCreatingNew) {
      addStaffUser({
        username: username.trim(),
        password: password.trim(),
        fullName: fullName.trim() || username.trim(),
        role,
        phone,
        isActive,
        permissions,
      });
      setIsCreatingNew(false);
    } else {
      updateStaffUser(selectedUserId, {
        username: username.trim(),
        password: password.trim(),
        fullName: fullName.trim(),
        role,
        phone,
        isActive,
        permissions,
      });
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Admin access check
  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#FAF5EC] p-8 text-center select-none">
        <div className="w-16 h-16 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center mb-4 text-rose-700 shadow-md">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-brand font-black text-2xl text-[#3B1F12]">Admin Access Required</h2>
        <p className="text-xs text-[#725B49] max-w-md mt-2 leading-relaxed">
          Only the restaurant owner or System Administrator can access the Staff Credentials & Permission Matrix chart.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAF5EC] overflow-hidden select-none">
      {/* Header */}
      <div className="bg-white border-b border-[#D9C4A5] px-8 py-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#D6A447]" />
            <h1 className="text-xl font-brand font-bold text-[#2B180F]">
              Staff & Permission Matrix Control
            </h1>
          </div>
          <p className="text-xs text-[#725B49] mt-0.5">
            Configure receptionist login credentials and define granular page-by-page access rights (View, Add, Edit, Delete).
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold animate-in fade-in shadow-sm">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Staff Access Permissions Updated!</span>
          </div>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Staff Members Selector Tabs */}
        <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-3 rounded-2xl border border-[#D9C4A5] shadow-xs">
          <div className="flex items-center gap-2 overflow-x-auto">
            {staffUsers.map((u) => {
              const isSelected = !isCreatingNew && selectedUserId === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    setSelectedUserId(u.id);
                    setIsCreatingNew(false);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isSelected
                      ? 'btn-wood text-white shadow-md !border-[#D6A447]'
                      : 'bg-[#FAF5EC] text-[#5A2E19] border border-[#D9C4A5] hover:border-[#8B572F]'
                  }`}
                >
                  <UserCheck className={`w-3.5 h-3.5 ${isSelected ? 'text-[#F1D18A]' : 'text-[#8B572F]'}`} />
                  <span>{u.fullName}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                    isSelected ? 'bg-[#1D0C05]/60 text-[#F1D18A]' : 'bg-[#EFE3D0] text-[#725B49]'
                  }`}>
                    {u.role}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsCreatingNew(true)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              isCreatingNew
                ? 'btn-wood text-white !border-[#D6A447]'
                : 'btn-wood-secondary text-[#5A2E19]'
            }`}
          >
            <Plus className="w-4 h-4 text-[#D6A447]" />
            <span>New Staff / Receptionist</span>
          </button>
        </div>

        <form onSubmit={handleSaveStaff} className="space-y-6">
          {/* Section 1: Staff Account Credentials Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#D9C4A5] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#FAF5EC]">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#8B572F]" />
                <h3 className="font-brand font-bold text-[#2B180F] text-base">
                  {isCreatingNew ? 'Create New Staff Account' : `Staff Credentials: ${username}`}
                </h3>
              </div>

              {!isCreatingNew && selectedUserId !== 'user-admin' && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete staff account for "${fullName || username}"?`)) {
                      deleteStaffUser(selectedUserId);
                    }
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Staff</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* Full Name */}
              <div>
                <label className="font-bold text-[#3B1F12] block mb-1">
                  Staff Full Name / نام *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B572F]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sana Malik (Receptionist)"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl text-[#2B180F] font-semibold focus:outline-none focus:border-[#D6A447]"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="font-bold text-[#3B1F12] block mb-1">
                  Login Username / یوزر نیم *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. receptionist"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl text-[#2B180F] font-semibold focus:outline-none focus:border-[#D6A447]"
                />
              </div>

              {/* Password */}
              <div>
                <label className="font-bold text-[#3B1F12] block mb-1">
                  Login Password / پاس ورڈ *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Secret login password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl text-[#2B180F] font-semibold focus:outline-none focus:border-[#D6A447]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B572F]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="font-bold text-[#3B1F12] block mb-1">
                  Assigned Staff Role / عہدہ
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl text-[#2B180F] font-semibold focus:outline-none focus:border-[#D6A447]"
                >
                  <option value="RECEPTIONIST">Receptionist (Front Desk / Order Reception)</option>
                  <option value="CASHIER">Cashier (Billing & Counter POS)</option>
                  <option value="MANAGER">Manager (Operations Supervisor)</option>
                  <option value="KITCHEN">Kitchen Chef (KDS Monitor)</option>
                  <option value="WAITER">Waiter (Order Taker)</option>
                  <option value="ADMIN">System Administrator (Full Rights)</option>
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className="font-bold text-[#3B1F12] block mb-1">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B572F]" />
                  <input
                    type="text"
                    placeholder="0312 9876543"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl text-[#2B180F] font-semibold focus:outline-none focus:border-[#D6A447]"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer p-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#8B572F] accent-[#8B572F]"
                  />
                  <span className="font-bold text-[#3B1F12] text-xs">
                    Account Active (Allowed to Login)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: The Core Permissions Chart Matrix */}
          <div className="bg-white rounded-2xl border border-[#D9C4A5] shadow-sm overflow-hidden space-y-0">
            {/* Matrix Header Bar & Quick Presets */}
            <div className="p-5 border-b border-[#D9C4A5] bg-[#FAF5EC] flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-brand font-bold text-[#2B180F] text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D6A447]" />
                  <span>Access Permission Matrix Chart / اجازت چارٹ</span>
                </h3>
                <p className="text-[11px] text-[#725B49] mt-0.5">
                  Check or uncheck View, Add, Edit, and Delete permissions for each page in Zaad POS.
                </p>
              </div>

              {/* One-click Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-[#8B572F] mr-1">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPreset('receptionist')}
                  className="px-2.5 py-1 bg-white border border-[#D9C4A5] hover:border-[#8B572F] rounded-lg text-[11px] font-bold text-[#5A2E19] shadow-2xs"
                >
                  Receptionist Default
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('full')}
                  className="px-2.5 py-1 bg-white border border-[#D9C4A5] hover:border-[#8B572F] rounded-lg text-[11px] font-bold text-[#5A2E19] shadow-2xs"
                >
                  Full Access
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('readonly')}
                  className="px-2.5 py-1 bg-white border border-[#D9C4A5] hover:border-[#8B572F] rounded-lg text-[11px] font-bold text-[#5A2E19] shadow-2xs"
                >
                  View Only
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('clear')}
                  className="px-2.5 py-1 bg-white border border-[#D9C4A5] hover:border-rose-400 rounded-lg text-[11px] font-bold text-rose-700 shadow-2xs"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF5EC] border-b border-[#D9C4A5] text-[#3B1F12] font-black uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-6 min-w-[200px]">
                      Website Page / Module (صفحہ)
                    </th>

                    {/* View Column Header with Toggle */}
                    <th className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span>View (دیکھیں)</span>
                        <button
                          type="button"
                          onClick={() => toggleColumnAll('canView')}
                          className="text-[10px] text-[#8B572F] hover:underline normal-case font-normal mt-0.5"
                        >
                          Toggle All
                        </button>
                      </div>
                    </th>

                    {/* Add Column Header with Toggle */}
                    <th className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span>Add (شامل کریں)</span>
                        <button
                          type="button"
                          onClick={() => toggleColumnAll('canAdd')}
                          className="text-[10px] text-[#8B572F] hover:underline normal-case font-normal mt-0.5"
                        >
                          Toggle All
                        </button>
                      </div>
                    </th>

                    {/* Edit Column Header with Toggle */}
                    <th className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span>Edit (تبدیل کریں)</span>
                        <button
                          type="button"
                          onClick={() => toggleColumnAll('canEdit')}
                          className="text-[10px] text-[#8B572F] hover:underline normal-case font-normal mt-0.5"
                        >
                          Toggle All
                        </button>
                      </div>
                    </th>

                    {/* Delete Column Header with Toggle */}
                    <th className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span>Delete (حذف کریں)</span>
                        <button
                          type="button"
                          onClick={() => toggleColumnAll('canDelete')}
                          className="text-[10px] text-[#8B572F] hover:underline normal-case font-normal mt-0.5"
                        >
                          Toggle All
                        </button>
                      </div>
                    </th>

                    <th className="py-3.5 px-6 text-right">
                      Row Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#FAF5EC]">
                  {APP_MODULES.map((mod) => {
                    const modPerm = permissions[mod.id] || {
                      canView: false,
                      canAdd: false,
                      canEdit: false,
                      canDelete: false,
                    };

                    const hasAny = modPerm.canView || modPerm.canAdd || modPerm.canEdit || modPerm.canDelete;

                    return (
                      <tr
                        key={mod.id}
                        className={`hover:bg-[#FAF5EC]/70 transition-colors ${
                          hasAny ? 'bg-white' : 'bg-slate-50/40 opacity-75'
                        }`}
                      >
                        {/* Page Module Info */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="font-brand font-bold text-[#2B180F] text-sm">
                              {mod.label}
                            </span>
                            <span className="font-mono text-[10px] text-[#725B49] bg-[#FAF5EC] px-1.5 py-0.5 rounded border border-[#D9C4A5]/60">
                              {mod.path}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#725B49] mt-0.5">
                            {mod.description}
                          </p>
                        </td>

                        {/* View Checkbox */}
                        <td className="py-4 px-4 text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer p-1">
                            <input
                              type="checkbox"
                              checked={modPerm.canView}
                              onChange={() => togglePermission(mod.id, 'canView')}
                              className="w-5 h-5 rounded-md border-2 border-[#D9C4A5] text-[#8B572F] accent-[#8B572F] cursor-pointer"
                            />
                          </label>
                        </td>

                        {/* Add Checkbox */}
                        <td className="py-4 px-4 text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer p-1">
                            <input
                              type="checkbox"
                              checked={modPerm.canAdd}
                              onChange={() => togglePermission(mod.id, 'canAdd')}
                              className="w-5 h-5 rounded-md border-2 border-[#D9C4A5] text-[#8B572F] accent-[#8B572F] cursor-pointer"
                            />
                          </label>
                        </td>

                        {/* Edit Checkbox */}
                        <td className="py-4 px-4 text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer p-1">
                            <input
                              type="checkbox"
                              checked={modPerm.canEdit}
                              onChange={() => togglePermission(mod.id, 'canEdit')}
                              className="w-5 h-5 rounded-md border-2 border-[#D9C4A5] text-[#8B572F] accent-[#8B572F] cursor-pointer"
                            />
                          </label>
                        </td>

                        {/* Delete Checkbox */}
                        <td className="py-4 px-4 text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer p-1">
                            <input
                              type="checkbox"
                              checked={modPerm.canDelete}
                              onChange={() => togglePermission(mod.id, 'canDelete')}
                              className="w-5 h-5 rounded-md border-2 border-[#D9C4A5] text-rose-600 accent-rose-700 cursor-pointer"
                            />
                          </label>
                        </td>

                        {/* Row Quick Action */}
                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => toggleRowAll(mod.id)}
                            className="px-2.5 py-1 rounded-lg border border-[#D9C4A5] hover:bg-[#FAF5EC] text-[11px] font-bold text-[#5A2E19] transition-all"
                          >
                            Toggle Row
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Submit Banner */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#D9C4A5] shadow-xs">
            <div className="text-xs text-[#725B49]">
              Managing permissions for: <strong className="text-[#2B180F] font-bold">{fullName || username || 'New Staff'}</strong>
            </div>

            <button
              type="submit"
              className="btn-wood btn-wood-primary px-7 py-3 text-xs font-bold rounded-xl shadow-lg flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-[#F1D18A]" />
              <span>Save Staff & Permissions Matrix</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
