import { NextResponse } from 'next/server';
import { initialMenuItems } from '@/data/mockData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  let items = [...initialMenuItems];

  if (category && category !== 'cat-all') {
    items = items.filter((i) => i.categoryId === category);
  }

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.barcode?.includes(q) ||
        i.description?.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({ success: true, count: items.length, data: items });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newItem = {
      id: `item-${Date.now()}`,
      ...body,
      isAvailable: body.isAvailable ?? true,
    };
    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
