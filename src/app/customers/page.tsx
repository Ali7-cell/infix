'use client';

import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import { Plus, Search, Phone, MapPin, Mail, X } from 'lucide-react';
import { PermissionGuard } from '@/components/layout/PermissionGuard';

export default function CustomersPage() {
  const { customers, addCustomer, hasPermission } = usePOS();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const canAdd = hasPermission('customers', 'canAdd');

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.address?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !canAdd) return;
    addCustomer({ name, phone, email, address });
    setShowAddModal(false);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
  };

  return (
    <PermissionGuard module="customers">
      <div className="flex-1 flex flex-col h-full bg-[#FAF5EC] overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-[#D9C4A5] px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-brand font-bold text-[#2B180F]">Customer Directory</h1>
            <p className="text-xs text-[#725B49]">
              Customer profiles, delivery addresses, and dining order history
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B572F]" />
              <input
                type="text"
                placeholder="Search by phone, name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl text-xs text-[#2B180F] focus:outline-none focus:ring-2 focus:ring-[#D6A447]/30 focus:border-[#D6A447]"
              />
            </div>

            {canAdd && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-wood btn-wood-primary px-4 py-2 text-xs font-bold rounded-xl shadow-md"
              >
                <Plus className="w-4 h-4 text-[#F1D18A]" />
                <span>Add Customer</span>
              </button>
            )}
          </div>
        </div>

      {/* Customer Cards Grid */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((customer) => (
            <div
              key={customer.id}
              className="bg-white rounded-2xl border border-[#D9C4A5] p-5 shadow-sm hover:shadow-md hover:border-[#8B572F] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full btn-wood btn-wood-circle text-[#F1D18A] flex items-center justify-center font-brand font-black text-sm shadow-md">
                    {customer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-brand font-bold text-[#2B180F] text-base">{customer.name}</h3>
                    <p className="text-[11px] text-[#725B49]">Customer since {customer.createdAt}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-[#725B49]">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#8B572F] shrink-0" />
                    <span className="font-bold text-[#2B180F]">{customer.phone}</span>
                  </div>

                  {customer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#8B572F] shrink-0" />
                      <span>{customer.email}</span>
                    </div>
                  )}

                  {customer.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#8B572F] shrink-0 mt-0.5" />
                      <span className="text-[11px] line-clamp-2">{customer.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#FAF5EC] flex items-center justify-between text-xs">
                <span className="text-[#725B49] font-medium">Total Orders:</span>
                <span className="font-bold px-2.5 py-0.5 bg-[#FAF5EC] border border-[#D9C4A5] text-[#5A2E19] rounded-md">
                  {customer.totalOrders} Completed
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#1D0C05]/65 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 border border-[#D9C4A5]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#D9C4A5]">
              <h3 className="font-brand font-bold text-[#2B180F] text-base">Add Customer</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#8B572F] hover:text-[#2B180F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#3B1F12] block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Mehmood"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                />
              </div>

              <div>
                <label className="font-bold text-[#3B1F12] block mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="03001234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                />
              </div>

              <div>
                <label className="font-bold text-[#3B1F12] block mb-1">Email</label>
                <input
                  type="email"
                  placeholder="customer@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                />
              </div>

              <div>
                <label className="font-bold text-[#3B1F12] block mb-1">Delivery Address</label>
                <textarea
                  rows={2}
                  placeholder="Street, House #, Area..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn-wood-secondary flex-1 py-2 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-wood flex-1 py-2 rounded-xl text-xs font-bold"
              >
                Save Customer
              </button>
            </div>
          </form>
        </div>
      )}
      </div>
    </PermissionGuard>
  );
}
