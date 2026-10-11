import { NextResponse } from 'next/server';
import { initialOrders } from '@/data/mockData';

export async function GET() {
  return NextResponse.json({ success: true, count: initialOrders.length, data: initialOrders });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const createdOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: (initialOrders[0]?.orderNumber || 1000) + 1,
      ...payload,
      createdAt: new Date().toISOString(),
    };
    return NextResponse.json({ success: true, data: createdOrder }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 400 });
  }
}
