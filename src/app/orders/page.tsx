'use client';

import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import { Order, OrderStatus, OrderType } from '@/types/pos';
import {
  Search,
  Printer,
  Eye,
  Utensils,
  ShoppingBag,
  Bike,
  X,
} from 'lucide-react';
import { ReceiptModal } from '@/components/pos/ReceiptModal';
import { PermissionGuard } from '@/components/layout/PermissionGuard';

export default function OrdersPage() {
  const { orders, updateOrderStatus, settings, hasPermission } = usePOS();
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [reprintOrder, setReprintOrder] = useState<Order | null>(null);

  const canEdit = hasPermission('orders', 'canEdit');

  const filteredOrders = orders.filter((o) => {
    const matchType = selectedType === 'ALL' || o.orderType === selectedType;
    const matchStatus = selectedStatus === 'ALL' || o.status === selectedStatus;
    const matchSearch =
      search === '' ||
      o.orderNumber.toString().includes(search) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.tableNumber?.toLowerCase().includes(search.toLowerCase());

    return matchType && matchStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-900 border-amber-300';
      case 'PREPARING':
        return 'bg-[#FAF5EC] text-[#5A2E19] border-[#D6A447]';
      case 'READY':
        return 'bg-[#FDF8E8] text-[#8B572F] border-[#D6A447] font-bold';
      case 'SERVED':
        return 'bg-teal-50 text-teal-800 border-teal-300';
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-300';
    }
  };

  const getOrderTypeIcon = (type: OrderType) => {
    switch (type) {
      case 'DINE_IN':
        return <Utensils className="w-3.5 h-3.5 text-[#8B572F]" />;
      case 'TAKEAWAY':
        return <ShoppingBag className="w-3.5 h-3.5 text-[#D6A447]" />;
      case 'DELIVERY':
        return <Bike className="w-3.5 h-3.5 text-[#5A2E19]" />;
    }
  };

  return (
    <PermissionGuard module="orders">
      <div className="flex-1 flex flex-col h-full bg-[#FAF5EC] overflow-hidden">
      {/* Top Header */}
      <div className="bg-white border-b border-[#D9C4A5] px-8 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-brand font-bold text-[#2B180F]">Order Management</h1>
            <p className="text-xs text-[#725B49]">
              Track live kitchen orders, table billing, and settlement status
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B572F]" />
              <input
                type="text"
                placeholder="Search order #, table, customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl text-xs text-[#2B180F] focus:outline-none focus:ring-2 focus:ring-[#D6A447]/30 focus:border-[#D6A447]"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#FAF5EC] pt-3">
          {/* Order Type Tabs */}
          <div className="flex gap-1.5">
            {['ALL', 'DINE_IN', 'TAKEAWAY', 'DELIVERY'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedType === type
                    ? 'btn-wood text-white shadow-sm !border-[#D6A447]'
                    : 'bg-[#FAF5EC] text-[#5A2E19] border border-[#D9C4A5]/70 hover:bg-[#EFE3D0]'
                }`}
              >
                {type === 'ALL' ? 'All Types' : type.replace('_', '-')}
              </button>
            ))}
          </div>

          {/* Status Tabs */}
          <div className="flex gap-1.5">
            {['ALL', 'PENDING', 'PREPARING', 'READY', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedStatus === st
                    ? 'bg-[#3B1F12] text-[#F1D18A] border border-[#D6A447]'
                    : 'bg-[#FAF5EC] text-[#5A2E19] border border-[#D9C4A5]/70 hover:bg-[#EFE3D0]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="bg-white rounded-2xl border border-[#D9C4A5] shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF5EC] border-b border-[#D9C4A5] text-[#5A2E19] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Type & Details</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF5EC]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#725B49]">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF5EC]/70 transition-colors">
                    <td className="py-4 px-4 font-bold text-[#2B180F]">
                      INV-{order.orderNumber}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-[#3B1F12]">
                        {getOrderTypeIcon(order.orderType)}
                        <span>{order.orderType}</span>
                      </div>
                      <div className="text-[11px] text-[#725B49] mt-0.5">
                        {order.tableNumber && `Table: ${order.tableNumber}`}
                        {order.customerName && `Cust: ${order.customerName}`}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="max-w-[200px] truncate text-[#2B180F] font-medium">
                        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>
                      <span className="text-[11px] text-[#725B49]">
                        {order.items.length} unique dishes
                      </span>
                    </td>

                    <td className="py-4 px-4 font-black text-[#5A2E19] text-sm">
                      {settings.currencySymbol} {order.totalAmount.toLocaleString()}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          order.paymentStatus === 'PAID'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-50 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {order.paymentMethod} ({order.paymentStatus})
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-[#725B49] text-[11px]">
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-4 px-4 text-right space-x-1">
                      {canEdit && order.status !== 'COMPLETED' && (
                        <button
                          onClick={() => {
                            const nextStatus: OrderStatus =
                              order.status === 'PENDING'
                                ? 'PREPARING'
                                : order.status === 'PREPARING'
                                ? 'READY'
                                : 'COMPLETED';
                            updateOrderStatus(order.id, nextStatus);
                          }}
                          className="btn-wood text-[11px] px-2.5 py-1 rounded-lg"
                        >
                          Mark Next
                        </button>
                      )}

                      <button
                        onClick={() => setReprintOrder(order)}
                        className="p-1.5 text-[#8B572F] hover:text-[#2B180F] rounded-lg hover:bg-[#FAF5EC] transition-colors"
                        title="Print Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setViewOrder(order)}
                        className="p-1.5 text-[#8B572F] hover:text-[#2B180F] rounded-lg hover:bg-[#FAF5EC] transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Drawer */}
      {viewOrder && (
        <div className="fixed inset-0 bg-[#1D0C05]/65 backdrop-blur-xs z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 border-l border-[#D9C4A5]">
            <div className="flex items-center justify-between pb-4 border-b border-[#D9C4A5]">
              <div>
                <h3 className="text-base font-brand font-bold text-[#2B180F]">
                  Order #{viewOrder.orderNumber}
                </h3>
                <p className="text-xs text-[#725B49]">
                  {new Date(viewOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setViewOrder(null)}
                className="w-8 h-8 rounded-full bg-[#FAF5EC] border border-[#D9C4A5] flex items-center justify-center text-[#5A2E19]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Picker with Wooden Buttons */}
            <div>
              <label className="text-xs font-bold text-[#3B1F12] block mb-1.5">
                Update Kitchen / Dining Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['PENDING', 'PREPARING', 'READY', 'COMPLETED'] as OrderStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => {
                        updateOrderStatus(viewOrder.id, st);
                        setViewOrder({ ...viewOrder, status: st });
                      }}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                        viewOrder.status === st
                          ? 'btn-wood text-white !border-[#D6A447]'
                          : 'bg-[#FAF5EC] border-[#D9C4A5] text-[#5A2E19] hover:border-[#8B572F]'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#5A2E19] uppercase tracking-wider">
                Order Dishes
              </h4>
              <div className="bg-[#FAF5EC] rounded-xl p-3 border border-[#D9C4A5] divide-y divide-[#E8DCCB]">
                {viewOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#2B180F]">
                        {item.quantity}x {item.name}
                      </p>
                      {item.notes && (
                        <p className="text-[10px] text-[#8B572F] italic">
                          * {item.notes}
                        </p>
                      )}
                    </div>
                    <span className="font-black text-[#5A2E19]">
                      {settings.currencySymbol} {item.total.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="space-y-1.5 text-xs bg-gradient-to-br from-[#FAF5EC] to-[#EFE3D0] p-4 rounded-xl border border-[#D6A447]/60">
              <div className="flex justify-between text-[#725B49]">
                <span>Subtotal</span>
                <span className="font-bold text-[#2B180F]">{settings.currencySymbol} {viewOrder.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#725B49]">
                <span>Tax ({viewOrder.taxRate}%)</span>
                <span className="font-bold text-[#2B180F]">{settings.currencySymbol} {viewOrder.taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-black text-[#3B1F12] pt-2 border-t border-[#D9C4A5]">
                <span>Total Amount</span>
                <span className="font-brand">{settings.currencySymbol} {viewOrder.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setReprintOrder(viewOrder);
                setViewOrder(null);
              }}
              className="btn-wood btn-wood-primary w-full py-3.5 rounded-xl shadow-lg"
            >
              <Printer className="w-4 h-4 text-[#F1D18A]" />
              <span>Print Invoice Receipt</span>
            </button>
          </div>
        </div>
      )}

      {/* Thermal Receipt Reprint */}
      {reprintOrder && (
        <ReceiptModal
          order={reprintOrder}
          onClose={() => setReprintOrder(null)}
        />
      )}
      </div>
    </PermissionGuard>
  );
}
