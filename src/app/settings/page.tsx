'use client';

import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import { Save, Check, Printer, Store } from 'lucide-react';
import { PermissionGuard } from '@/components/layout/PermissionGuard';

export default function SettingsPage() {
  const { settings, updateSettings, hasPermission } = usePOS();
  const canEdit = hasPermission('settings', 'canEdit');

  const [restaurantName, setRestaurantName] = useState(settings.restaurantName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [taxNumber, setTaxNumber] = useState(settings.taxNumber);
  const [taxPercentage, setTaxPercentage] = useState(settings.taxPercentage);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      restaurantName,
      tagline,
      address,
      phone,
      taxNumber,
      taxPercentage,
      currencySymbol,
      receiptFooter,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <PermissionGuard module="settings">
      <div className="flex-1 flex flex-col h-full bg-[#FAF5EC] overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-[#D9C4A5] px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-brand font-bold text-[#2B180F]">System & Receipt Settings</h1>
          <p className="text-xs text-[#725B49]">
            Configure Zaad brand profile, thermal print invoice template, and applicable sales tax
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved Successfully!</span>
          </div>
        )}
      </div>

      {/* Main Settings Form */}
      <div className="flex-1 overflow-y-auto p-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Restaurant Profile Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#D9C4A5] shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#FAF5EC]">
              <Store className="w-5 h-5 text-[#8B572F]" />
              <h3 className="font-brand font-bold text-[#2B180F] text-base">Brand & Restaurant Profile</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-[#3B1F12] block mb-1">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  required
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                />
              </div>

              <div>
                <label className="font-bold text-[#3B1F12] block mb-1">
                  Tagline / Motto
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                />
              </div>

              <div>
                <label className="font-bold text-[#3B1F12] block mb-1">
                  Contact Phone Numbers
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                />
              </div>

              <div>
                <label className="font-bold text-[#3B1F12] block mb-1">
                  NTN / STRN Tax Registration #
                </label>
                <input
                  type="text"
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                />
              </div>

              <div className="col-span-2">
                <label className="font-bold text-[#3B1F12] block mb-1">
                  Full Physical Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                />
              </div>
            </div>
          </div>

          {/* POS & Receipt Configuration */}
          <div className="bg-white p-6 rounded-2xl border border-[#D9C4A5] shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#FAF5EC]">
              <Printer className="w-5 h-5 text-[#8B572F]" />
              <h3 className="font-brand font-bold text-[#2B180F] text-base">Billing & Thermal Receipt Print</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-[#3B1F12] block mb-1">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447] font-black"
                />
              </div>

              <div>
                <label className="font-bold text-[#3B1F12] block mb-1">
                  Sales Tax Percentage (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={taxPercentage}
                  onChange={(e) => setTaxPercentage(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447] font-black"
                />
              </div>

              <div className="col-span-2">
                <label className="font-bold text-[#3B1F12] block mb-1">
                  Thermal Receipt Bottom Footer Note
                </label>
                <textarea
                  rows={3}
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            {canEdit ? (
              <button
                type="submit"
                className="btn-wood btn-wood-primary px-6 py-3 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4 text-[#F1D18A]" />
                <span>Save System Settings</span>
              </button>
            ) : (
              <span className="text-xs text-[#8B572F] italic bg-[#FAF5EC] px-4 py-2 rounded-xl border border-[#D9C4A5]">
                View Only: You do not have permission to modify settings.
              </span>
            )}
          </div>
        </form>
      </div>
      </div>
    </PermissionGuard>
  );
}
