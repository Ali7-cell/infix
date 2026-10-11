'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { MenuItem } from '@/types/pos';
import { usePOS } from '@/context/POSContext';

interface ProductCardProps {
  item: MenuItem;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
  const { addToCart, settings } = usePOS();

  return (
    <div
      onClick={() => item.isAvailable && addToCart(item)}
      className={`group relative bg-white rounded-2xl border border-[#D9C4A5] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#B8793F] transition-all duration-300 flex flex-col cursor-pointer ${
        !item.isAvailable ? 'opacity-50 pointer-events-none' : 'hover:-translate-y-1'
      }`}
    >
      {/* Food Image Container */}
      <div className="relative w-full h-36 bg-[#FAF5EC] overflow-hidden">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#8B572F]/50 font-serif">
            Zaad Kitchen
          </div>
        )}

        {/* Quick Add Button overlay - Circular Wooden Button Matching Reference */}
        <div 
          className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full btn-wood btn-wood-circle text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
          title="Add to order"
        >
          <Plus className="w-4 h-4 text-[#F1D18A] stroke-[2.5]" />
        </div>

        {/* Category Pill Tag */}
        {item.categoryName && (
          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-[#2B180F]/85 backdrop-blur-md text-[#F1D18A] border border-[#D6A447]/60 rounded-md text-[10px] font-bold tracking-wide">
            {item.categoryName}
          </span>
        )}
      </div>

      {/* Info Section */}
      <div className="p-3.5 flex flex-col flex-1 justify-between bg-white">
        <div>
          <h3 className="font-brand font-bold text-[#2B180F] text-sm leading-tight group-hover:text-[#8B572F] transition-colors line-clamp-1">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-[11px] text-[#725B49] line-clamp-1 mt-0.5 font-normal">
              {item.description}
            </p>
          )}
        </div>

        {/* Price Tag with Wood Brown & Gold */}
        <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-[#FAF5EC]">
          <span className="text-sm font-black text-[#5A2E19] flex items-center gap-1">
            <span className="text-xs text-[#D6A447] font-bold">{settings.currencySymbol}</span>
            {item.price.toLocaleString()}
          </span>
          {item.barcode && (
            <span className="text-[10px] text-[#725B49]/70 font-mono">
              #{item.barcode}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
