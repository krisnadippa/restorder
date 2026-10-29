import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { DEFAULT_MENU_ITEMS } from '../../../lib/defaultMenu';

export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      orderBy: { createdAt: 'desc' }
    });
    if (!items || items.length === 0) {
      return NextResponse.json(DEFAULT_MENU_ITEMS);
    }
    return NextResponse.json(items);
  } catch (error) {
    console.warn("GET menu error, falling back to default items:", error);
    return NextResponse.json(DEFAULT_MENU_ITEMS);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const item = await prisma.menuItem.create({
      data: {
        name: body.name,
        description: body.description,
        price: parseFloat(body.price),
        image: body.image,
        category: body.category || 'General',
        isAvailable: body.isAvailable ?? true
      }
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("POST menu error:", error);
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
}
