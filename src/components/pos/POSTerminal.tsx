'use client';

import React from 'react';
import { usePOS } from '@/context/POSContext';
import { CategoryHeader } from './CategoryHeader';
import { ProductCard } from './ProductCard';
import { CartSidebar } from './CartSidebar';
import { ReceiptModal } from './ReceiptModal';
import { Utensils } from 'lucide-react';
import { PermissionGuard } from '../layout/PermissionGuard';

export const POSTerminal: React.FC = () => {
  const { menuItems, activeCategoryId, searchQuery, activeInvoice, setActiveInvoice } = usePOS();

  // Filter items based on active category & search query
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      activeCategoryId === 'cat-all' || item.categoryId === activeCategoryId;
    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.barcode?.includes(searchQuery);

    return matchesCategory && matchesSearch;
  });

  return (
    <PermissionGuard module="pos">
      <div className="flex-1 flex h-full overflow-hidden bg-[#FAF5EC]">
        {/* Left/Center Area: POS Food Catalog */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAF5EC]">
          {/* Category & Filter Bar */}
          <CategoryHeader />

          {/* Scrollable Products Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredItems.length === 0 ? (
              <div className="h-96 flex flex-col items-center justify-center text-[#725B49]">
                <div className="w-16 h-16 rounded-full bg-[#EFE3D0] border border-[#D9C4A5] flex items-center justify-center mb-3 shadow-inner">
                  <Utensils className="w-8 h-8 text-[#8B572F]" />
                </div>
                <p className="text-base font-brand font-bold text-[#3B1F12]">No menu dishes found</p>
                <p className="text-xs text-[#725B49] mt-1">
                  Try selecting a different food category or clearing search filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {filteredItems.map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Current Order / Cart Sidebar */}
        <CartSidebar />

        {/* Instant Receipt Invoice Dialog if active invoice exists */}
        {activeInvoice && (
          <ReceiptModal
            order={activeInvoice}
            onClose={() => setActiveInvoice(null)}
          />
        )}
      </div>
    </PermissionGuard>
  );
};
