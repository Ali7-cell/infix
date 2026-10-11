'use client';

import React from 'react';
import { X, Printer, RotateCcw } from 'lucide-react';
import { Order } from '@/types/pos';
import { usePOS } from '@/context/POSContext';

interface ReceiptModalProps {
  order: Order;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  const { settings } = usePOS();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-[#1D0C05]/75 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8 border border-[#D9C4A5]">
        {/* Modal Top Actions with Dark Wood */}
        <div className="p-4 bg-gradient-to-r from-[#241108] via-[#3B1F12] to-[#200E06] text-white flex items-center justify-between border-b border-[#4E2B19]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D6A447] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#F1D18A]">
              Official Receipt Generated
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#4E2B19]/70 text-[#EFE3D0] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 80mm Physical Thermal Receipt Preview Paper */}
        <div className="p-6 bg-[#FAF5EC] flex justify-center">
          <div
            id="thermal-receipt"
            className="w-72 bg-white p-5 shadow-lg border-t-4 border-[#8B572F] rounded-sm font-mono text-xs text-slate-800 space-y-3"
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            {/* Header */}
            <div className="text-center space-y-1">
              <h2 className="text-base font-extrabold uppercase tracking-wider text-black">
                {settings.restaurantName}
              </h2>
              <p className="text-[10px] text-slate-500">{settings.tagline}</p>
              <p className="text-[10px] text-slate-600">{settings.address}</p>
              <p className="text-[10px] text-slate-600">Tel: {settings.phone}</p>
              <p className="text-[9px] text-slate-500">{settings.taxNumber}</p>
            </div>

            <div className="border-b border-dashed border-slate-400 my-2" />

            {/* Meta Info */}
            <div className="text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span>INVOICE #:</span>
                <span className="font-bold">INV-{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE:</span>
                <span>{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between">
                <span>ORDER TYPE:</span>
                <span className="font-bold">{order.orderType}</span>
              </div>
              {order.tableNumber && (
                <div className="flex justify-between">
                  <span>TABLE:</span>
                  <span className="font-bold">{order.tableNumber}</span>
                </div>
              )}
              {order.customerName && (
                <div className="flex justify-between">
                  <span>CUSTOMER:</span>
                  <span>{order.customerName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>CASHIER:</span>
                <span>{order.cashierName}</span>
              </div>
            </div>

            <div className="border-b border-dashed border-slate-400 my-2" />

            {/* Items Table */}
            <div>
              <div className="flex justify-between font-bold text-[11px] pb-1 border-b border-slate-200">
                <span className="w-1/2">ITEM</span>
                <span className="w-1/6 text-center">QTY</span>
                <span className="w-1/3 text-right">TOTAL</span>
              </div>
              <div className="py-2 space-y-1.5 text-[11px]">
                {order.items.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between">
                      <span className="w-1/2 font-semibold truncate">{item.name}</span>
                      <span className="w-1/6 text-center">{item.quantity}</span>
                      <span className="w-1/3 text-right">
                        {settings.currencySymbol} {item.total.toLocaleString()}
                      </span>
                    </div>
                    {item.notes && (
                      <span className="text-[9px] text-slate-500 italic block pl-1">
                        * {item.notes}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-b border-dashed border-slate-400 my-2" />

            {/* Financials Breakdown */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span>{settings.currencySymbol} {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>TAX ({order.taxRate}%):</span>
                <span>{settings.currencySymbol} {order.taxAmount.toLocaleString()}</span>
              </div>
              {order.discountValue > 0 && (
                <div className="flex justify-between">
                  <span>DISCOUNT:</span>
                  <span>- {settings.currencySymbol} {order.discountValue.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold pt-1 border-t border-slate-800">
                <span>TOTAL:</span>
                <span>{settings.currencySymbol} {order.totalAmount.toLocaleString()}</span>
              </div>

              {/* Payment Details */}
              <div className="pt-2 text-[10px] space-y-0.5 text-slate-600">
                <div className="flex justify-between">
                  <span>PAID VIA {order.paymentMethod}:</span>
                  <span>{settings.currencySymbol} {order.amountPaid.toLocaleString()}</span>
                </div>
                {order.paymentMethod === 'CASH' && (
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>CHANGE RETURNED:</span>
                    <span>{settings.currencySymbol} {order.changeDue.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-b border-dashed border-slate-400 my-2" />

            {/* Footer */}
            <div className="text-center pt-1 space-y-1">
              <p className="text-[10px] font-bold uppercase">Thank you for dining with us!</p>
              <p className="text-[9px] text-slate-500 whitespace-pre-line">{settings.receiptFooter}</p>
              <div className="pt-2 flex justify-center">
                <div className="tracking-widest font-mono text-[8px] bg-slate-100 px-3 py-1 border border-slate-300">
                  ||| | | |||| | ||| || ||||
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons / Actions */}
        <div className="p-4 bg-white border-t border-[#D9C4A5] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="btn-wood-secondary flex-1 py-2.5 px-3 text-xs font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#8B572F]" />
            <span>New Order</span>
          </button>

          <button
            onClick={handlePrint}
            className="btn-wood btn-wood-primary flex-1 py-2.5 px-3 text-xs font-bold shadow-md"
          >
            <Printer className="w-3.5 h-3.5 text-[#F1D18A]" />
            <span>Print 80mm Slip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
