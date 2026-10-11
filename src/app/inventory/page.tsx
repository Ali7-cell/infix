'use client';

import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import { Plus, Search, AlertTriangle, X } from 'lucide-react';
import { PermissionGuard } from '@/components/layout/PermissionGuard';

export default function InventoryPage() {
  const { inventory, updateStock, addInventoryItem, settings, hasPermission } = usePOS();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const canAdd = hasPermission('inventory', 'canAdd');
  const canEdit = hasPermission('inventory', 'canEdit');

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Meat');
  const [unit, setUnit] = useState('kg');
  const [currentStock, setCurrentStock] = useState(10);
  const [minStockWarn, setMinStockWarn] = useState(5);
  const [unitCost, setUnitCost] = useState(500);

  const filtered = inventory.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !canAdd) return;
    addInventoryItem({
      name,
      category,
      unit,
      currentStock,
      minStockWarn,
      unitCost,
    });
    setShowAddModal(false);
    setName('');
  };

  return (
    <PermissionGuard module="inventory">
      <div className="flex-1 flex flex-col h-full bg-[#FAF5EC] overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-[#D9C4A5] px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-brand font-bold text-[#2B180F]">Inventory & Raw Materials</h1>
            <p className="text-xs text-[#725B49]">
              Track kitchen ingredients, unit purchase costs, and real-time low stock warnings
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B572F]" />
              <input
                type="text"
                placeholder="Search ingredient or item..."
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
                <span>Add Stock Item</span>
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
                <th className="py-3.5 px-4">Item Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Threshold Alert</th>
                <th className="py-3.5 px-4">Estimated Value</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF5EC]">
              {filtered.map((item) => {
                const isLow = item.currentStock <= item.minStockWarn;
                const value = item.currentStock * item.unitCost;

                return (
                  <tr key={item.id} className="hover:bg-[#FAF5EC]/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#2B180F]">
                      {item.name}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#FAF5EC] border border-[#D9C4A5] text-[#5A2E19] text-[11px] font-semibold">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-black text-[#3B1F12]">
                      {item.currentStock} {item.unit}
                    </td>

                    <td className="py-3.5 px-4 text-[#725B49]">
                      Min {item.minStockWarn} {item.unit}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-[#5A2E19]">
                      {settings.currencySymbol} {value.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Low Stock</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                          Sufficient
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {canEdit ? (
                        <>
                          <button
                            onClick={() => updateStock(item.id, -1)}
                            className="btn-wood-secondary px-2.5 py-1 text-xs font-bold rounded-lg"
                            title="Deduct 1"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => updateStock(item.id, 5)}
                            className="btn-wood px-2.5 py-1 text-xs font-bold rounded-lg shadow-xs"
                            title="Add 5"
                          >
                            +5 {item.unit}
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-[#725B49] italic">Read-Only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#1D0C05]/65 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 border border-[#D9C4A5]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#D9C4A5]">
              <h3 className="font-brand font-bold text-[#2B180F] text-base">Add Stock Item</h3>
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
                <label className="font-bold text-[#3B1F12] block mb-1">Item / Ingredient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cheese Block"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                />
              </div>

              <div>
                <label className="font-bold text-[#3B1F12] block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                >
                  <option value="Meat">Meat & Poultry</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Grocery">Grocery</option>
                  <option value="Beverages">Beverages</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#3B1F12] block mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    placeholder="kg, pcs, litre"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#3B1F12] block mb-1">Current Stock</label>
                  <input
                    type="number"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value))}
                    className="w-full p-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#3B1F12] block mb-1">Low Stock Warning</label>
                  <input
                    type="number"
                    value={minStockWarn}
                    onChange={(e) => setMinStockWarn(Number(e.target.value))}
                    className="w-full p-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#3B1F12] block mb-1">Cost / Unit (Rs.)</label>
                  <input
                    type="number"
                    value={unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value))}
                    className="w-full p-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                  />
                </div>
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
                Save Item
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  </PermissionGuard>
);
}
