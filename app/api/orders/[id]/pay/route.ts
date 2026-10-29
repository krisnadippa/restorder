import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { orderStore } from '../../../../../lib/orderStore';

export async function PATCH(
  req: Request, 
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    let newStatus = 'PAID';
    try {
      const body = await req.json();
      if (body && body.status) {
        newStatus = body.status;
      }
    } catch (e) {
      // Empty body is okay, default to 'PAID'
    }

    // Try updating in Database first
    try {
      const existing = await prisma.order.findUnique({
        where: { id: orderId }
      });

      if (existing) {
        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: newStatus }
        });
        return NextResponse.json(updatedOrder);
      }
    } catch (dbErr) {
      console.warn("DB payment status update failed, fallback to memory store:", dbErr);
    }

    // Fallback to in-memory order store
    const memOrder = orderStore.updatePaymentStatus(orderId, newStatus);
    if (memOrder) {
      return NextResponse.json(memOrder);
    }

    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  } catch (error) {
    console.error("Failed to process mock payment:", error);
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  }
}
