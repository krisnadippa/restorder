import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    
    // Check if item exists
    const existingItem = await prisma.menuItem.findUnique({
      where: { id: resolvedParams.id }
    });
    
    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const item = await prisma.menuItem.update({
      where: { id: resolvedParams.id },
      data: {
        name: body.name,
        description: body.description,
        price: body.price !== undefined ? parseFloat(body.price.toString()) : undefined,
        image: body.image,
        category: body.category,
        isAvailable: body.isAvailable
      }
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error("PUT menu item error:", error);
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const existingItem = await prisma.menuItem.findUnique({
      where: { id: resolvedParams.id }
    });
    
    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    await prisma.menuItem.delete({
      where: { id: resolvedParams.id }
    });
    return NextResponse.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error("DELETE menu item error:", error);
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
  }
}
