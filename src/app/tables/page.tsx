'use client';

import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import { RestaurantTable, TableStatus } from '@/types/pos';
import { Plus, Users, Utensils, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PermissionGuard } from '@/components/layout/PermissionGuard';

export default function TablesPage() {
  const { tables, updateTableStatus, setSelectedTable, setOrderType, settings, hasPermission } = usePOS();
  const router = useRouter();

  const canAdd = hasPermission('tables', 'canAdd');

  const [activeFloor, setActiveFloor] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTableNo, setNewTableNo] = useState<string>('');
  const [newCapacity, setNewCapacity] = useState<number>(4);
  const [newFloor, setNewFloor] = useState<string>('Ground Floor');

  const floors = ['ALL', 'Ground Floor', 'Family Hall', '1st Floor', 'Rooftop Lounge'];

  const filteredTables = tables.filter(
    (t) => activeFloor === 'ALL' || t.floor === activeFloor
  );

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-50 border-emerald-300 text-emerald-800';
      case 'OCCUPIED':
        return 'bg-rose-50 border-rose-300 text-rose-800';
      case 'RESERVED':
        return 'bg-amber-50 border-amber-300 text-amber-800';
      case 'BILLED':
        return 'bg-blue-50 border-blue-300 text-blue-800';
    }
  };

  const handleStartOrderForTable = (tbl: RestaurantTable) => {
    setSelectedTable(tbl.number);
    setOrderType('DINE_IN');
    router.push('/pos');
  };

  return (
    <PermissionGuard module="tables">
      <div className="flex-1 flex flex-col h-full bg-[#FAF5EC] overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-[#D9C4A5] px-8 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-brand font-bold text-[#2B180F]">Floor & Table Management</h1>
              <p className="text-xs text-[#725B49]">
                Live restaurant dining area, seating capacity, and direct POS table ordering
              </p>
            </div>

            <div className="flex items-center gap-3">
              {canAdd && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn-wood btn-wood-primary px-4 py-2 text-xs font-bold rounded-xl shadow-md"
                >
                  <Plus className="w-4 h-4 text-[#F1D18A]" />
                  <span>Add Table</span>
                </button>
              )}
            </div>
          </div>

        {/* Floor Filter Tabs */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto">
          {floors.map((floor) => (
            <button
              key={floor}
              onClick={() => setActiveFloor(floor)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFloor === floor
                  ? 'btn-wood text-white shadow-sm !border-[#D6A447]'
                  : 'bg-[#FAF5EC] text-[#5A2E19] border border-[#D9C4A5]/70 hover:bg-[#EFE3D0]'
              }`}
            >
              {floor}
            </button>
          ))}
        </div>
      </div>

      {/* Tables Grid */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredTables.map((tbl) => (
            <div
              key={tbl.id}
              className={`rounded-2xl border-2 p-5 flex flex-col justify-between transition-all bg-white shadow-sm hover:shadow-md ${
                tbl.status === 'OCCUPIED'
                  ? 'border-rose-400'
                  : tbl.status === 'RESERVED'
                  ? 'border-amber-400'
                  : 'border-[#D9C4A5] hover:border-[#8B572F]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-brand font-black text-[#2B180F]">{tbl.number}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(
                      tbl.status
                    )}`}
                  >
                    {tbl.status}
                  </span>
                </div>

                <div className="mt-2 text-xs text-[#725B49] space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#8B572F]" />
                    <span>Capacity: {tbl.capacity} Persons</span>
                  </div>
                  <p className="text-[11px] text-[#8B572F] font-medium">{tbl.floor}</p>
                </div>

                {tbl.currentTotal && (
                  <div className="mt-3 p-2 bg-[#FAF5EC] rounded-xl border border-[#D9C4A5]">
                    <span className="text-[10px] uppercase font-bold text-[#8B572F] block">
                      Active Bill
                    </span>
                    <span className="text-sm font-black text-[#3B1F12]">
                      {settings.currencySymbol} {tbl.currentTotal.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-[#FAF5EC] flex items-center gap-2">
                {tbl.status === 'OCCUPIED' ? (
                  <button
                    onClick={() => updateTableStatus(tbl.id, 'AVAILABLE')}
                    className="btn-wood-secondary flex-1 py-1.5 px-2 text-xs font-bold"
                  >
                    Release Table
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartOrderForTable(tbl)}
                    className="btn-wood flex-1 py-1.5 px-2 text-xs font-bold shadow-sm"
                  >
                    <Utensils className="w-3 h-3 text-[#F1D18A]" />
                    <span>Take Order</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    const next: TableStatus =
                      tbl.status === 'AVAILABLE'
                        ? 'RESERVED'
                        : tbl.status === 'RESERVED'
                        ? 'AVAILABLE'
                        : 'AVAILABLE';
                    updateTableStatus(tbl.id, next);
                  }}
                  className="px-2.5 py-1.5 border border-[#D9C4A5] hover:bg-[#FAF5EC] text-[#5A2E19] rounded-lg text-[11px] font-bold"
                  title="Toggle reservation"
                >
                  {tbl.status === 'RESERVED' ? 'Unreserve' : 'Reserve'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#1D0C05]/65 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 border border-[#D9C4A5]">
            <div className="flex items-center justify-between pb-2 border-b border-[#D9C4A5]">
              <h3 className="font-brand font-bold text-[#2B180F] text-base">Add New Table</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#8B572F] hover:text-[#2B180F]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#3B1F12] block mb-1">
                  Table Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. T-09, VIP-02"
                  value={newTableNo}
                  onChange={(e) => setNewTableNo(e.target.value)}
                  className="w-full p-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                />
              </div>

              <div>
                <label className="font-bold text-[#3B1F12] block mb-1">
                  Floor Section
                </label>
                <select
                  value={newFloor}
                  onChange={(e) => setNewFloor(e.target.value)}
                  className="w-full p-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                >
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="Family Hall">Family Hall</option>
                  <option value="1st Floor">1st Floor</option>
                  <option value="Rooftop Lounge">Rooftop Lounge</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#3B1F12] block mb-1">
                  Seating Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(Number(e.target.value) || 2)}
                  className="w-full p-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-wood-secondary flex-1 py-2 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newTableNo) return;
                  tables.push({
                    id: `tbl-${Date.now()}`,
                    number: newTableNo,
                    capacity: newCapacity,
                    floor: newFloor,
                    status: 'AVAILABLE',
                  });
                  setShowAddModal(false);
                  setNewTableNo('');
                }}
                className="btn-wood flex-1 py-2 rounded-xl text-xs font-bold"
              >
                Save Table
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </PermissionGuard>
);
}
