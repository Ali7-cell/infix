'use client';

import React from 'react';
import { usePOS } from '@/context/POSContext';
import { Flame, Clock, CheckCircle, Printer, Utensils } from 'lucide-react';
import { KOTTicket } from '@/types/pos';
import { PermissionGuard } from '@/components/layout/PermissionGuard';

export default function KitchenPage() {
  const { kots, updateKOTStatus, orders, hasPermission } = usePOS();
  const canEdit = hasPermission('kitchen', 'canEdit');

  // Active tickets in kitchen
  const activeKOTs = kots.length > 0
    ? kots
    : orders
        .filter((o) => o.status === 'PENDING' || o.status === 'PREPARING')
        .map((o) => ({
          id: `kot-${o.id}`,
          kotNumber: o.orderNumber,
          orderId: o.id,
          orderNumber: o.orderNumber,
          tableNumber: o.tableNumber,
          orderType: o.orderType,
          status: (o.status === 'PENDING' ? 'PREPARING' : 'READY') as KOTTicket['status'],
          createdAt: o.createdAt,
          items: o.items.map((i) => ({ name: i.name, quantity: i.quantity, notes: i.notes })),
        }));

  return (
    <PermissionGuard module="kitchen">
      <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-[#1E0C05] via-[#2A1308] to-[#180903] text-[#FAF5EC] overflow-hidden select-none">
      {/* KDS Header */}
      <div className="bg-[#150702]/90 border-b border-[#4E2B19] px-8 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B572F] to-[#5A2E19] border border-[#D6A447] flex items-center justify-center text-[#F1D18A] shadow-lg shadow-[#D6A447]/20">
            <Flame className="w-6 h-6 animate-pulse text-[#F1D18A]" />
          </div>
          <div>
            <h1 className="text-lg font-brand font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#FFF6E5] via-[#F1D18A] to-[#D6A447]">
              Kitchen Display System (KDS)
            </h1>
            <p className="text-xs text-[#D6A447] font-semibold">
              Zaad Live Kitchen Order Tickets (KOT)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1 bg-[#2D1409] text-[#F1D18A] rounded-full text-xs font-bold border border-[#D6A447]/60 shadow-inner">
            {activeKOTs.length} Active Orders Cooking
          </span>
        </div>
      </div>

      {/* KOT Cards Grid */}
      <div className="flex-1 overflow-y-auto p-8">
        {activeKOTs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[#B8793F]">
            <Utensils className="w-16 h-16 mb-4 text-[#8B572F]" />
            <h3 className="text-lg font-brand font-bold text-[#EFE3D0]">All Kitchen Tickets Prepared!</h3>
            <p className="text-xs text-[#A27756] mt-1">
              New dish orders from the POS terminal will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeKOTs.map((kot) => (
              <div
                key={kot.id}
                className="bg-[#261006]/95 rounded-2xl border-2 border-[#4E2B19] hover:border-[#D6A447] overflow-hidden shadow-2xl flex flex-col justify-between transition-all"
              >
                {/* Ticket Top bar */}
                <div className="bg-[#1D0C05] p-4 border-b border-[#4E2B19] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-[#F1D18A] tracking-wider">
                      KOT #{kot.kotNumber}
                    </span>
                    <h4 className="text-base font-brand font-bold text-white mt-0.5">
                      {kot.tableNumber ? `Table: ${kot.tableNumber}` : kot.orderType}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[#D9C4A5] bg-[#34160A] px-2.5 py-1 rounded-lg border border-[#4E2B19]">
                    <Clock className="w-3.5 h-3.5 text-[#D6A447]" />
                    <span>
                      {new Date(kot.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-4 space-y-2.5 flex-1 overflow-y-auto">
                  {kot.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#1D0C05]/80 p-3 rounded-xl border border-[#4E2B19]/80"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-base text-[#FAF5EC]">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#3B1F12] text-[#F1D18A] border border-[#D6A447]/40 font-bold">
                          PREP
                        </span>
                      </div>
                      {item.notes && (
                        <div className="mt-1.5 text-xs text-[#F1D18A] bg-[#3B1F12]/60 border border-[#8B572F] px-2 py-1 rounded font-medium">
                          Note: {item.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Bottom Actions */}
                <div className="p-4 bg-[#180903] border-t border-[#4E2B19] flex items-center gap-2">
                  {canEdit && (
                    <button
                      onClick={() => updateKOTStatus(kot.id, 'READY')}
                      className="flex-1 py-2.5 px-3 bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl text-xs font-bold border border-emerald-500 shadow-md flex items-center justify-center gap-1.5 transition-all"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-300" />
                      <span>Mark Prepared</span>
                    </button>
                  )}

                  <button
                    onClick={() => window.print()}
                    className="p-2.5 bg-[#3B1F12] hover:bg-[#5A2E19] text-[#F1D18A] border border-[#D6A447]/60 rounded-xl transition-colors"
                    title="Print KOT Slip"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </PermissionGuard>
  );
}
