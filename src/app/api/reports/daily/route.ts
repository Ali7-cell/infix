import { NextResponse } from 'next/server';
import { initialOrders, initialExpenses } from '@/data/mockData';

export async function GET() {
  const totalRevenue = initialOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalTax = initialOrders.reduce((sum, o) => sum + o.taxAmount, 0);
  const totalExpenses = initialExpenses.reduce((sum, e) => sum + e.amount, 0);

  const cashTotal = initialOrders
    .filter((o) => o.paymentMethod === 'CASH')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const cardTotal = initialOrders
    .filter((o) => o.paymentMethod === 'CARD')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return NextResponse.json({
    success: true,
    data: {
      totalRevenue,
      totalTax,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      cashTotal,
      cardTotal,
      orderCount: initialOrders.length,
    },
  });
}
