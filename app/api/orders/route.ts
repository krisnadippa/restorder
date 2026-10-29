import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { Xendit } from 'xendit-node';
import { CreateInvoiceRequest } from 'xendit-node/invoice/models';
import { orderStore } from '../../../lib/orderStore';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    const memoryOrders = orderStore.getAll();
    if (!orders || orders.length === 0) {
      return NextResponse.json(memoryOrders);
    }
    const existingIds = new Set(orders.map(o => o.id));
    const combined = [...orders, ...memoryOrders.filter(o => !existingIds.has(o.id))];
    return NextResponse.json(combined);
  } catch (error) {
    console.warn("GET orders DB failed, using memory store fallback:", error);
    return NextResponse.json(orderStore.getAll());
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, tableOrAddress, notes, items } = body;

    // Validate request
    if (!customerName || !tableOrAddress || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
    }

    // Calculate total amount & prepare order items data
    let totalAmount = 0;
    const orderItemsData = items.map((item: any) => {
      const price = parseFloat(item.price);
      const quantity = parseInt(item.quantity, 10);
      totalAmount += price * quantity;
      
      return {
        menuItemId: item.menuItemId,
        quantity: quantity,
        price: price,
        note: item.note || null
      };
    });

    // Generate Xendit Invoice
    let invoiceUrl = null;
    let xenditInvoiceId = null;
    const xenditSecretKey = process.env.XENDIT_SECRET_KEY;

    try {
      if (xenditSecretKey) {
        const xendit = new Xendit({ secretKey: xenditSecretKey });
        
        // Items must be formatted for Xendit
        const xenditItems = items.map((item: any) => ({
          name: item.name || 'Menu Item',
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity, 10),
        }));

        const invoiceRequest: CreateInvoiceRequest = {
            externalId: `ORDER-${Date.now()}`,
            amount: totalAmount,
            payerEmail: 'customer@example.com', // Optional placeholder
            description: `Order for ${customerName}`,
            items: xenditItems,
            successRedirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success/{id}`.replace('{id}', '[ID_PLACEHOLDER]'),
        };
        
        const invoiceOptions = {
            data: invoiceRequest
        };

        const invoice = await xendit.Invoice.createInvoice(invoiceOptions);
        
        invoiceUrl = invoice.invoiceUrl;
        xenditInvoiceId = invoice.id;
      } else {
        console.warn("XENDIT_SECRET_KEY is missing. Skipping Payment Gateway integration.");
      }
    } catch (e) {
      console.error("Failed to generate Xendit Invoice:", e);
      // We continue to save the order as PENDING so they can pay at cashier
    }

    let newOrder: any = null;
    try {
      newOrder = await prisma.order.create({
        data: {
          customerName,
          tableOrAddress,
          notes,
          totalAmount,
          status: 'New Order',
          paymentStatus: 'PENDING',
          xenditInvoiceId: xenditInvoiceId,
          orderItems: {
            create: orderItemsData
          }
        },
        include: {
          orderItems: true
        }
      });
    } catch (dbError) {
      console.warn("Database order creation failed, fallback to in-memory order store:", dbError);
      newOrder = orderStore.create({
        customerName,
        tableOrAddress,
        notes,
        totalAmount,
        xenditInvoiceId,
        items: orderItemsData
      });
    }

    // Fix the redirect URL to include the actual database Order ID
    if (invoiceUrl && xenditSecretKey) {
       // Return extra data so frontend knows to redirect to Xendit
       return NextResponse.json({ ...newOrder, invoiceUrl: invoiceUrl }, { status: 201 });
    }

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("POST order error:", error);
    return NextResponse.json({ error: 'Failed to submit order' }, { status: 500 });
  }
}
