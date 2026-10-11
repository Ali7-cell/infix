'use client';

import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  MessageSquare,
  ArrowRight,
  ShoppingBag,
  Percent,
} from 'lucide-react';
import { usePOS } from '@/context/POSContext';
import { CheckoutModal } from './CheckoutModal';

export const CartSidebar: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    taxRate,
    taxAmount,
    discountValue,
    setDiscountValue,
    totalAmount,
    orderType,
    selectedTable,
    selectedCustomer,
    settings,
  } = usePOS();

  const [showCheckout, setShowCheckout] = useState(false);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [showDiscountInput, setShowDiscountInput] = useState(false);

  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setShowCheckout(true);
  };

  return (
    <aside className="w-80 lg:w-96 bg-white border-l border-[#D9C4A5] flex flex-col h-screen shrink-0 select-none shadow-xl z-10">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-[#D9C4A5] bg-[#FFFEFA]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-brand font-bold text-[#2B180F] text-lg">Current Order</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF5EC] border border-[#D6A447] text-[#5A2E19] text-xs font-bold">
              {cart.reduce((s, i) => s + i.quantity, 0)} items
            </span>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-[#8B572F] hover:text-rose-700 font-semibold transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Order Meta details */}
        <div className="mt-2.5 flex items-center justify-between text-xs text-[#725B49] bg-[#FAF5EC] p-2.5 rounded-xl border border-[#D9C4A5]/70">
          <div>
            Type: <span className="font-bold text-[#3B1F12]">{orderType}</span>
          </div>
          {orderType === 'DINE_IN' && (
            <div>
              Table: <span className="font-bold text-[#8B572F]">{selectedTable || 'None'}</span>
            </div>
          )}
          {selectedCustomer && (
            <div className="truncate max-w-[120px]">
              Cust: <span className="font-bold text-[#3B1F12]">{selectedCustomer.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FCFAF6]">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[#725B49] text-center px-4">
            <div className="w-14 h-14 rounded-full bg-[#FAF5EC] border border-[#D9C4A5] flex items-center justify-center mb-3 shadow-inner">
              <ShoppingBag className="w-6 h-6 text-[#8B572F]" />
            </div>
            <p className="text-sm font-brand font-bold text-[#3B1F12]">No dishes in order</p>
            <p className="text-xs text-[#725B49] mt-1">
              Select dishes from the menu to build the invoice.
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.menuItemId}
              className="bg-white rounded-xl p-3 border border-[#D9C4A5] hover:border-[#B8793F] transition-colors shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#2B180F] truncate">
                    {item.name}
                  </h4>
                  <div className="text-[11px] text-[#725B49] mt-0.5">
                    {settings.currencySymbol} {item.price.toLocaleString()} each
                  </div>
                  {item.notes && (
                    <div className="text-[10px] text-[#8B572F] italic mt-0.5">
                      Note: {item.notes}
                    </div>
                  )}
                </div>

                <div className="text-xs font-black text-[#5A2E19] shrink-0">
                  {settings.currencySymbol} {(item.price * item.quantity).toLocaleString()}
                </div>
              </div>

              {/* Quantity Controls & Notes action */}
              <div className="mt-2.5 pt-2 border-t border-[#FAF5EC] flex items-center justify-between">
                <button
                  onClick={() => {
                    setEditingNotesId(editingNotesId === item.menuItemId ? null : item.menuItemId);
                    setNoteInput(item.notes || '');
                  }}
                  className="text-[#8B572F] hover:text-[#3B1F12] p-1 transition-colors"
                  title="Add special instructions"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>

                {/* Wooden Style Mini Stepper */}
                <div className="flex items-center gap-1.5 bg-[#FAF5EC] border border-[#D9C4A5] rounded-lg p-0.5 shadow-inner">
                  <button
                    onClick={() => updateQuantity(item.menuItemId, -1)}
                    className="w-5 h-5 flex items-center justify-center text-[#5A2E19] hover:bg-[#EFE3D0] rounded font-bold"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-black text-[#2B180F] w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.menuItemId, 1)}
                    className="w-5 h-5 flex items-center justify-center text-[#5A2E19] hover:bg-[#EFE3D0] rounded font-bold"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.menuItemId)}
                  className="text-[#8B572F] hover:text-rose-600 p-1 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Inline Note Editor */}
              {editingNotesId === item.menuItemId && (
                <div className="mt-2 flex gap-1">
                  <input
                    type="text"
                    placeholder="e.g. Extra spicy, no onions..."
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    className="flex-1 text-[11px] px-2 py-1 bg-[#FAF5EC] border border-[#D9C4A5] rounded focus:outline-none focus:border-[#D6A447]"
                  />
                  <button
                    onClick={() => {
                      item.notes = noteInput;
                      setEditingNotesId(null);
                    }}
                    className="btn-wood text-[10px] px-2.5 py-1"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bill Calculation & Checkout Footer */}
      <div className="p-4 border-t border-[#D9C4A5] bg-[#FAF5EC] space-y-3">
        {/* Discount Toggle */}
        <div className="flex items-center justify-between text-xs">
          <button
            onClick={() => setShowDiscountInput(!showDiscountInput)}
            className="flex items-center gap-1.5 text-[#8B572F] hover:text-[#3B1F12] font-bold"
          >
            <Percent className="w-3.5 h-3.5 text-[#D6A447]" />
            <span>{discountValue > 0 ? `Discount Applied: Rs. ${discountValue}` : 'Apply Special Discount'}</span>
          </button>
        </div>

        {showDiscountInput && (
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-[#D9C4A5]">
            <span className="text-xs text-[#725B49] font-bold pl-1">Rs.</span>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={discountValue || ''}
              onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
              className="flex-1 text-xs outline-none text-[#2B180F] font-bold"
            />
            <button
              onClick={() => setShowDiscountInput(false)}
              className="text-[11px] px-2.5 py-0.5 bg-[#FAF5EC] border border-[#D9C4A5] rounded-md text-[#5A2E19] font-bold"
            >
              Done
            </button>
          </div>
        )}

        {/* Subtotal, Tax, Total */}
        <div className="space-y-1.5 text-xs text-[#725B49]">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-bold text-[#2B180F]">
              {settings.currencySymbol} {subtotal.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>Sales Tax ({taxRate}%)</span>
            <span className="font-bold text-[#2B180F]">
              {settings.currencySymbol} {taxAmount.toLocaleString()}
            </span>
          </div>

          {discountValue > 0 && (
            <div className="flex items-center justify-between text-emerald-700 font-bold">
              <span>Discount</span>
              <span>- {settings.currencySymbol} {discountValue.toLocaleString()}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-[#D9C4A5] text-sm font-black text-[#2B180F]">
            <span>Net Payable</span>
            <span className="text-lg font-brand font-black text-[#5A2E19]">
              {settings.currencySymbol} {totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Signature Zaad Wooden Button (Matching Reference) */}
        <button
          onClick={handleOpenCheckout}
          disabled={cart.length === 0}
          className="btn-wood btn-wood-primary w-full py-3.5 px-4 text-sm font-bold rounded-xl shadow-xl flex items-center justify-center gap-2"
        >
          <span>Proceed to Checkout</span>
          <span className="text-[#F1D18A] font-semibold text-xs">
            ({settings.currencySymbol} {totalAmount.toLocaleString()})
          </span>
          <ArrowRight className="w-4 h-4 ml-1 text-[#F1D18A]" />
        </button>
      </div>

      {/* Checkout Modal */}
      {showCheckout && <CheckoutModal onClose={() => setShowCheckout(false)} />}
    </aside>
  );
};
