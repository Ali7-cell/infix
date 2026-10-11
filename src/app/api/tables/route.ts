import { NextResponse } from 'next/server';
import { initialTables } from '@/data/mockData';

export async function GET() {
  return NextResponse.json({ success: true, count: initialTables.length, data: initialTables });
}
