'use client';

import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import { Plus, Search, X } from 'lucide-react';
import { Expense } from '@/types/pos';
import { PermissionGuard } from '@/components/layout/PermissionGuard';

export default function ExpensesPage() {
  const { expenses, addExpense, settings, hasPermission } = usePOS();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const canAdd = hasPermission('expenses', 'canAdd');

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Expense['category']>('Groceries');
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const filtered = expenses.filter((e) => {
    const matchCat = selectedCat === 'ALL' || e.category === selectedCat;
    const matchSearch =
      search === '' ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.notes?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amount <= 0 || !canAdd) return;
    addExpense({
      title,
      category,
      amount,
      recordedBy: 'Admin',
      notes,
    });
    setShowAddModal(false);
    setTitle('');
    setAmount(0);
    setNotes('');
  };

  return (
    <PermissionGuard module="expenses">
      <div className="flex-1 flex flex-col h-full bg-[#FAF5EC] overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-[#D9C4A5] px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-brand font-bold text-[#2B180F]">Expense Management</h1>
            <p className="text-xs text-[#725B49]">
              Track daily restaurant operational overheads, bills, and petty cash
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl text-xs font-bold text-[#5A2E19]">
              Total Overhead: {settings.currencySymbol} {totalExpenseAmount.toLocaleString()}
            </div>

            {canAdd && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-wood btn-wood-primary px-4 py-2 text-xs font-bold rounded-xl shadow-md"
              >
                <Plus className="w-4 h-4 text-[#F1D18A]" />
                <span>Add Expense</span>
              </button>
            )}
          </div>
        </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="bg-white rounded-2xl border border-[#D9C4A5] shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF5EC] border-b border-[#D9C4A5] text-[#5A2E19] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Expense Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Recorded By</th>
                <th className="py-3.5 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF5EC]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF5EC]/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#2B180F]">
                    {item.title}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-md bg-[#FAF5EC] text-[#5A2E19] border border-[#D9C4A5] font-bold text-[11px]">
                      {item.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-black text-rose-700 text-sm">
                    {settings.currencySymbol} {item.amount.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 text-[#725B49]">{item.date}</td>

                  <td className="py-3.5 px-4 text-[#2B180F] font-semibold">{item.recordedBy}</td>

                  <td className="py-3.5 px-4 text-[#725B49] max-w-xs truncate">
                    {item.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#1D0C05]/65 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 border border-[#D9C4A5]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#D9C4A5]">
              <h3 className="font-brand font-bold text-[#2B180F] text-base">Record New Expense</h3>
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
                <label className="font-bold text-[#3B1F12] block mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daily vegetable market"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                />
              </div>

              <div>
                <label className="font-bold text-[#3B1F12] block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Expense['category'])}
                  className="w-full p-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                >
                  <option value="Groceries">Groceries & Raw Food</option>
                  <option value="Utilities">Utilities (Gas, Electric, Water)</option>
                  <option value="Staff Salary">Staff Wages / Advance</option>
                  <option value="Maintenance">Maintenance & Repairs</option>
                  <option value="Petty Cash">Petty Cash Supplies</option>
                  <option value="Other">Other Expenses</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#3B1F12] block mb-1">Amount (Rs.) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                />
              </div>

              <div>
                <label className="font-bold text-[#3B1F12] block mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  placeholder="Vendor name or details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                Save Expense
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  </PermissionGuard>
);
}
