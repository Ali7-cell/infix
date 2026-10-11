'use client';

import React from 'react';
import { Search, Utensils, Bike, ShoppingBag, MapPin, UserCheck, X } from 'lucide-react';
import { usePOS } from '@/context/POSContext';
import { OrderType } from '@/types/pos';

export const CategoryHeader: React.FC = () => {
  const {
    categories,
    activeCategoryId,
    setActiveCategoryId,
    searchQuery,
    setSearchQuery,
    orderType,
    setOrderType,
    tables,
    selectedTable,
    setSelectedTable,
    selectedCustomer,
    setSelectedCustomer,
    customers,
  } = usePOS();

  const [showTableSelect, setShowTableSelect] = React.useState(false);
  const [showCustomerSelect, setShowCustomerSelect] = React.useState(false);

  const orderTypes: { type: OrderType; label: string; icon: React.ElementType }[] = [
    { type: 'DINE_IN', label: 'Dine-In', icon: Utensils },
    { type: 'TAKEAWAY', label: 'Takeaway', icon: ShoppingBag },
    { type: 'DELIVERY', label: 'Delivery', icon: Bike },
  ];

  return (
    <div className="bg-white border-b border-[#D9C4A5] px-6 py-4 space-y-3.5 shadow-sm">
      {/* Top bar: Order Type selector, Table/Customer Info, Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Order Types Wooden Switcher */}
        <div className="flex bg-[#FAF5EC] p-1 rounded-xl gap-1.5 border border-[#D9C4A5]/80 shadow-inner">
          {orderTypes.map((ot) => {
            const Icon = ot.icon;
            const isActive = orderType === ot.type;
            return (
              <button
                key={ot.type}
                onClick={() => setOrderType(ot.type)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'btn-wood text-white shadow-sm !border-[#D6A447]'
                    : 'text-[#5A2E19] hover:text-[#2B180F] hover:bg-[#EFE3D0]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F1D18A]' : 'text-[#8B572F]'}`} />
                <span>{ot.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Context Button (Table selector for Dine-in or Customer for Delivery) */}
        <div className="flex items-center gap-3">
          {orderType === 'DINE_IN' && (
            <div className="relative">
              <button
                onClick={() => setShowTableSelect(!showTableSelect)}
                className="btn-wood-secondary flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold !border-[#D9C4A5] hover:!border-[#8B572F]"
              >
                <MapPin className="w-3.5 h-3.5 text-[#D6A447]" />
                <span>Table: <strong className="text-[#3B1F12]">{selectedTable || 'Select Table'}</strong></span>
              </button>

              {showTableSelect && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-[#D9C4A5] rounded-2xl shadow-2xl p-3.5 z-30 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E8DCCB]">
                    <span className="text-xs font-bold text-[#3B1F12]">Select Floor Table</span>
                    <button onClick={() => setShowTableSelect(false)} className="text-[#8B572F] hover:text-[#3B1F12]">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
                    {tables.map((tbl) => (
                      <button
                        key={tbl.id}
                        onClick={() => {
                          setSelectedTable(tbl.number);
                          setShowTableSelect(false);
                        }}
                        className={`p-2 rounded-xl text-xs font-bold text-center border transition-all ${
                          selectedTable === tbl.number
                            ? 'btn-wood text-white !border-[#D6A447]'
                            : tbl.status === 'OCCUPIED'
                            ? 'bg-[#FDF2F0] text-rose-800 border-rose-300'
                            : 'bg-[#FAF5EC] text-[#5A2E19] border-[#D9C4A5] hover:border-[#8B572F]'
                        }`}
                      >
                        {tbl.number}
                        <span className="block text-[10px] font-normal opacity-80">
                          {tbl.status === 'OCCUPIED' ? 'Busy' : `${tbl.capacity}p`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {(orderType === 'DELIVERY' || orderType === 'TAKEAWAY') && (
            <div className="relative">
              <button
                onClick={() => setShowCustomerSelect(!showCustomerSelect)}
                className="btn-wood-secondary flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold !border-[#D9C4A5]"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#D6A447]" />
                <span>
                  {selectedCustomer ? (
                    <strong className="text-[#3B1F12]">{selectedCustomer.name}</strong>
                  ) : (
                    'Add Customer'
                  )}
                </span>
              </button>

              {showCustomerSelect && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-[#D9C4A5] rounded-2xl shadow-2xl p-3.5 z-30 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E8DCCB]">
                    <span className="text-xs font-bold text-[#3B1F12]">Select Registered Customer</span>
                    <button onClick={() => setShowCustomerSelect(false)} className="text-[#8B572F] hover:text-[#3B1F12]">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-52 overflow-y-auto space-y-1">
                    {customers.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedCustomer(c);
                          setShowCustomerSelect(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex flex-col ${
                          selectedCustomer?.id === c.id
                            ? 'bg-[#FAF5EC] text-[#3B1F12] border border-[#D6A447] font-semibold'
                            : 'hover:bg-[#FAF5EC] text-[#5A2E19]'
                        }`}
                      >
                        <span className="font-bold">{c.name}</span>
                        <span className="text-[11px] text-[#725B49]">{c.phone}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search Box with Gold Outline Focus */}
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B572F]" />
            <input
              type="text"
              placeholder="Search food, dish code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-7 py-1.5 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl text-xs text-[#2B180F] placeholder-[#8B572F]/60 focus:outline-none focus:ring-2 focus:ring-[#D6A447]/30 focus:border-[#D6A447]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B572F] hover:text-[#2B180F]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Pills Navigation - Wooden Button Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((category) => {
          const isSelected = activeCategoryId === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategoryId(category.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                isSelected
                  ? 'btn-wood text-white shadow-md !border-[#D6A447] scale-[1.02]'
                  : 'bg-[#FAF5EC] text-[#5A2E19] border border-[#D9C4A5]/70 hover:bg-[#EFE3D0] hover:text-[#2B180F] hover:border-[#8B572F]'
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
