import { NextResponse, NextRequest } from 'next/server';
import prisma from '../../../../lib/prisma';
import { orderStore } from '../../../../lib/orderStore';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    let order = null;
    try {
      order = await prisma.order.findUnique({
        where: { id },
        include: {
          orderItems: {
            include: {
              menuItem: true
            }
          }
        }
      });
    } catch (dbErr) {
      console.warn("DB findUnique order error, fallback to memory store:", dbErr);
    }

    if (!order) {
      order = orderStore.getById(id);
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Failed to fetch order details", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
