import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { orderStore } from '../../../../../lib/orderStore';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    const { status } = body;
    
    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // New Order, Preparing, Ready, Completed
    const validStatuses = ['New Order', 'Preparing', 'Ready', 'Completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    try {
      const order = await prisma.order.update({
        where: { id: resolvedParams.id },
        data: { status }
      });
      return NextResponse.json(order);
    } catch (dbErr) {
      console.warn("DB order status update failed, fallback to memory store:", dbErr);
    }

    const memOrder = orderStore.updateStatus(resolvedParams.id, status);
    if (memOrder) {
      return NextResponse.json(memOrder);
    }

    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  } catch (error) {
    console.error("PATCH order status error:", error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
