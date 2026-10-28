import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma'; // app/api/orders/[id]/status/route.ts -> 5 levels up. Wait: 
// app / api / orders / [id] / status / route.ts
// route.ts -> status -> [id] -> orders -> api -> app -> root (6 levels?)
// Let's count carefully.
// route.ts is in folder `status`.
// ../ gives `[id]`
// ../../ gives `orders`
// ../../../ gives `api`
// ../../../../ gives `app`
// ../../../../../ gives root. Yes, 5 times.
// Let's use 5.

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

    const order = await prisma.order.update({
      where: { id: resolvedParams.id },
      data: { status }
    });
    
    return NextResponse.json(order);
  } catch (error) {
    console.error("PATCH order status error:", error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
