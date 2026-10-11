'use client';

import React, { useState } from 'react';
import { X, CreditCard, Banknote, Smartphone, Printer } from 'lucide-react';
import { usePOS } from '@/context/POSContext';
import { PaymentMethod } from '@/types/pos';
import { ReceiptModal } from './ReceiptModal';

interface CheckoutModalProps {
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose }) => {
  const { totalAmount, createOrder, settings, activeInvoice, setActiveInvoice } = usePOS();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashTendered, setCashTendered] = useState<number>(totalAmount);
  const [showReceipt, setShowReceipt] = useState(false);

  const changeDue = Math.max(0, cashTendered - totalAmount);

  const quickCashPresets = [
    { label: 'Exact', value: totalAmount },
    { label: 'Rs. 500', value: 500 },
    { label: 'Rs. 1,000', value: 1000 },
    { label: 'Rs. 2,000', value: 2000 },
    { label: 'Rs. 5,000', value: 5000 },
  ];

  const handleCompleteOrder = () => {
    const order = createOrder(paymentMethod, paymentMethod === 'CASH' ? cashTendered : totalAmount);
    setShowReceipt(true);
  };

  return (
    <>
      <div className="fixed inset-0 bg-[#1D0C05]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-[#D9C4A5]">
          {/* Header in Dark Walnut Wood */}
          <div className="px-6 py-4 border-b border-[#4E2B19] flex items-center justify-between bg-gradient-to-r from-[#241108] via-[#3B1F12] to-[#200E06] text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#D6A447]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/zaad-logo.jpg" alt="Zaad Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-base font-brand font-bold text-[#F1D18A]">Checkout & Payment</h3>
                <p className="text-[11px] text-[#D9C4A5]">Select settlement method to generate official receipt</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#4E2B19]/70 text-[#EFE3D0] hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-5 bg-[#FAF5EC]/40">
            {/* Total Amount Display Banner */}
            <div className="bg-gradient-to-br from-[#FAF5EC] to-[#EFE3D0] border-2 border-[#D6A447] rounded-2xl p-4 text-center shadow-md">
              <span className="text-[11px] uppercase font-bold tracking-widest text-[#8B572F]">Total Amount Due</span>
              <div className="text-3xl font-brand font-black text-[#3B1F12] mt-1">
                {settings.currencySymbol} {totalAmount.toLocaleString()}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3B1F12]">Settlement Method</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('CASH');
                    setCashTendered(totalAmount);
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'CASH'
                      ? 'btn-wood text-white !border-[#D6A447] shadow-md'
                      : 'bg-white border-[#D9C4A5] hover:border-[#8B572F] text-[#5A2E19]'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span className="text-xs font-bold">Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('CARD');
                    setCashTendered(totalAmount);
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'CARD'
                      ? 'btn-wood text-white !border-[#D6A447] shadow-md'
                      : 'bg-white border-[#D9C4A5] hover:border-[#8B572F] text-[#5A2E19]'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs font-bold">Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('ONLINE');
                    setCashTendered(totalAmount);
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'ONLINE'
                      ? 'btn-wood text-white !border-[#D6A447] shadow-md'
                      : 'bg-white border-[#D9C4A5] hover:border-[#8B572F] text-[#5A2E19]'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <span className="text-xs font-bold">Online</span>
                </button>
              </div>
            </div>

            {/* Cash Calculations */}
            {paymentMethod === 'CASH' && (
              <div className="space-y-3.5 bg-white p-4 rounded-2xl border border-[#D9C4A5] shadow-sm">
                {/* Presets */}
                <div className="flex flex-wrap gap-2">
                  {quickCashPresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setCashTendered(preset.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        cashTendered === preset.value
                          ? 'btn-wood text-white !border-[#D6A447]'
                          : 'bg-[#FAF5EC] text-[#5A2E19] border-[#D9C4A5] hover:border-[#8B572F]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Tendered Input */}
                <div className="flex items-center justify-between gap-4">
                  <label className="text-xs font-bold text-[#5A2E19] shrink-0">
                    Amount Tendered:
                  </label>
                  <div className="flex items-center gap-2 bg-[#FAF5EC] px-3 py-2 rounded-xl border border-[#D9C4A5] flex-1 max-w-[200px]">
                    <span className="text-xs text-[#8B572F] font-bold">{settings.currencySymbol}</span>
                    <input
                      type="number"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(Number(e.target.value) || 0)}
                      className="w-full text-right text-sm font-bold text-[#2B180F] outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* Change Due */}
                <div className="flex items-center justify-between pt-2 border-t border-[#E8DCCB] text-sm">
                  <span className="font-bold text-[#5A2E19]">Change Due:</span>
                  <span className={`font-black text-base ${changeDue > 0 ? 'text-emerald-700' : 'text-[#3B1F12]'}`}>
                    {settings.currencySymbol} {changeDue.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer / Complete */}
          <div className="p-5 border-t border-[#D9C4A5] bg-[#FAF5EC] flex gap-3">
            <button
              onClick={onClose}
              className="btn-wood-secondary flex-1 py-3 px-4 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleCompleteOrder}
              disabled={paymentMethod === 'CASH' && cashTendered < totalAmount}
              className="btn-wood btn-wood-primary flex-1 py-3 px-4 text-xs font-bold shadow-lg"
            >
              <Printer className="w-4 h-4 text-[#F1D18A]" />
              <span>Complete & Print Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Show Receipt Modal after finishing order */}
      {showReceipt && activeInvoice && (
        <ReceiptModal
          order={activeInvoice}
          onClose={() => {
            setShowReceipt(false);
            onClose();
          }}
        />
      )}
    </>
  );
};
