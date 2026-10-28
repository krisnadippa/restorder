import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Verify this webhook actually comes from Xendit via Callback Token
    // In production, ensure you set process.env.XENDIT_WEBHOOK_TOKEN
    const incomingToken = req.headers.get('x-callback-token');
    const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN;
    
    if (expectedToken && incomingToken !== expectedToken) {
      console.warn("Unauthorized webhook attempt block");
      return NextResponse.json({ error: 'Unauthorized webhook' }, { status: 401 });
    }

    const { id, status } = body; 
    
    // Find the order that correlates to this invoice ID
    if (id && status === 'PAID') {
        const order = await prisma.order.findFirst({
            // @ts-ignore: Prisma client cache is stale on Windows dev server
            where: { xenditInvoiceId: id }
        });

        if (order) {
            await prisma.order.update({
                where: { id: order.id },
                // @ts-ignore: Prisma client cache is stale on Windows dev server
                data: { paymentStatus: 'PAID' }
            });
            console.log(`Order ${order.id} marked as PAID via webhook`);
        } else {
             console.warn(`Webhook received for unknown invoice ${id}`);
        }
    }

    // Acknowledge receipt back to Xendit
    return NextResponse.json({ success: true, message: 'Webhook processed' }, { status: 200 });

  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
