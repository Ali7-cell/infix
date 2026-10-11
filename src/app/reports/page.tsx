'use client';

import React from 'react';
import { usePOS } from '@/context/POSContext';
import {
  TrendingUp,
  CreditCard,
  Banknote,
  DollarSign,
  Percent,
  Calendar,
  Printer,
  ArrowUpRight,
} from 'lucide-react';
import { PermissionGuard } from '@/components/layout/PermissionGuard';

export default function ReportsPage() {
  const { orders, expenses, settings } = usePOS();

  // Aggregate metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalTax = orders.reduce((sum, o) => sum + o.taxAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const cashOrders = orders.filter((o) => o.paymentMethod === 'CASH');
  const cardOrders = orders.filter((o) => o.paymentMethod === 'CARD');
  const onlineOrders = orders.filter((o) => o.paymentMethod === 'ONLINE');

  const cashTotal = cashOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const cardTotal = cardOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const onlineTotal = onlineOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Top Selling Items tally
  const itemMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      if (!itemMap[item.name]) {
        itemMap[item.name] = { name: item.name, qty: 0, revenue: 0 };
      }
      itemMap[item.name].qty += item.quantity;
      itemMap[item.name].revenue += item.total;
    });
  });

  const topItems = Object.values(itemMap).sort((a, b) => b.qty - a.qty).slice(0, 5);

  return (
    <PermissionGuard module="reports">
      <div className="flex-1 flex flex-col h-full bg-[#FAF5EC] overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-[#D9C4A5] px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-brand font-bold text-[#2B180F]">Daily Sales & Business Analytics</h1>
          <p className="text-xs text-[#725B49]">
            Real-time financial summary, payment method breakdown, and dish sales performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#FAF5EC] border border-[#D9C4A5] px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#5A2E19]">
            <Calendar className="w-3.5 h-3.5 text-[#D6A447]" />
            <span>Today: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>

          <button
            onClick={() => window.print()}
            className="btn-wood btn-wood-primary px-4 py-2 text-xs font-bold rounded-xl shadow-md"
          >
            <Printer className="w-3.5 h-3.5 text-[#F1D18A]" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Revenue */}
          <div className="bg-white p-5 rounded-2xl border border-[#D9C4A5] shadow-sm hover:border-[#8B572F] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#725B49]">Total Sales</span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF5EC] text-[#8B572F] border border-[#D9C4A5] flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-brand font-black text-[#2B180F] mt-2">
              {settings.currencySymbol} {totalRevenue.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#725B49] mt-1">Across {orders.length} orders today</p>
          </div>

          {/* Tax 5% Collected */}
          <div className="bg-white p-5 rounded-2xl border border-[#D9C4A5] shadow-sm hover:border-[#8B572F] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#725B49]">Tax Collected (5%)</span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF5EC] text-[#D6A447] border border-[#D9C4A5] flex items-center justify-center">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-brand font-black text-[#2B180F] mt-2">
              {settings.currencySymbol} {totalTax.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#725B49] mt-1">Applicable restaurant sales tax</p>
          </div>

          {/* Daily Expenses */}
          <div className="bg-white p-5 rounded-2xl border border-[#D9C4A5] shadow-sm hover:border-[#8B572F] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#725B49]">Total Expenses</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-brand font-black text-rose-700 mt-2">
              {settings.currencySymbol} {totalExpenses.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#725B49] mt-1">{expenses.length} overhead entries recorded</p>
          </div>

          {/* Net Margin */}
          <div className="bg-white p-5 rounded-2xl border border-[#D9C4A5] shadow-sm hover:border-[#8B572F] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#725B49]">Estimated Net</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className={`text-2xl font-brand font-black mt-2 ${netProfit >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
              {settings.currencySymbol} {netProfit.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#725B49] mt-1">Sales minus operations & supplies</p>
          </div>
        </div>

        {/* Payment Methods Breakdown & Top Selling Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Method Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-[#D9C4A5] shadow-sm">
            <h3 className="text-sm font-brand font-bold text-[#2B180F] mb-4">Payment Methods Breakdown</h3>
            <div className="space-y-4">
              {/* Cash */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="flex items-center gap-1.5 text-[#3B1F12]">
                    <Banknote className="w-4 h-4 text-[#8B572F]" />
                    Cash Settlement ({cashOrders.length} orders)
                  </span>
                  <span className="text-[#5A2E19] font-black">
                    {settings.currencySymbol} {cashTotal.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-[#FAF5EC] h-2.5 rounded-full overflow-hidden border border-[#D9C4A5]/60">
                  <div
                    className="bg-gradient-to-r from-[#8B572F] to-[#5A2E19] h-full rounded-full"
                    style={{ width: `${totalRevenue > 0 ? (cashTotal / totalRevenue) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Card */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="flex items-center gap-1.5 text-[#3B1F12]">
                    <CreditCard className="w-4 h-4 text-[#D6A447]" />
                    Credit / Debit Card ({cardOrders.length} orders)
                  </span>
                  <span className="text-[#5A2E19] font-black">
                    {settings.currencySymbol} {cardTotal.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-[#FAF5EC] h-2.5 rounded-full overflow-hidden border border-[#D9C4A5]/60">
                  <div
                    className="bg-gradient-to-r from-[#D6A447] to-[#B8793F] h-full rounded-full"
                    style={{ width: `${totalRevenue > 0 ? (cardTotal / totalRevenue) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Online */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="flex items-center gap-1.5 text-[#3B1F12]">
                    <TrendingUp className="w-4 h-4 text-[#B8793F]" />
                    Online Wallets ({onlineOrders.length} orders)
                  </span>
                  <span className="text-[#5A2E19] font-black">
                    {settings.currencySymbol} {onlineTotal.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-[#FAF5EC] h-2.5 rounded-full overflow-hidden border border-[#D9C4A5]/60">
                  <div
                    className="bg-gradient-to-r from-[#B8793F] to-[#725B49] h-full rounded-full"
                    style={{ width: `${totalRevenue > 0 ? (onlineTotal / totalRevenue) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Top Selling Dishes */}
          <div className="bg-white p-6 rounded-2xl border border-[#D9C4A5] shadow-sm">
            <h3 className="text-sm font-brand font-bold text-[#2B180F] mb-4">Top-Selling Dishes</h3>
            <div className="space-y-3">
              {topItems.length === 0 ? (
                <p className="text-xs text-[#725B49]">No dishes ordered yet today.</p>
              ) : (
                topItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#FAF5EC] border border-[#D9C4A5]">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full btn-wood text-[#F1D18A] font-black flex items-center justify-center text-[10px]">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-brand font-bold text-[#2B180F]">{item.name}</p>
                        <p className="text-[11px] text-[#725B49]">{item.qty} units sold</p>
                      </div>
                    </div>

                    <div className="text-right font-black text-[#5A2E19]">
                      {settings.currencySymbol} {item.revenue.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </PermissionGuard>
  );
}
