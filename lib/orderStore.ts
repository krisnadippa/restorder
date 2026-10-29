import { DEFAULT_MENU_ITEMS } from './defaultMenu';

export interface InMemoryOrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  price: number;
  note?: string | null;
  menuItem?: {
    id: string;
    name: string;
    price: number;
    image: string | null;
    category: string;
  };
}

export interface InMemoryOrder {
  id: string;
  customerName: string;
  tableOrAddress: string;
  notes: string | null;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  xenditInvoiceId: string | null;
  createdAt: string;
  updatedAt: string;
  orderItems: InMemoryOrderItem[];
}

declare const globalThis: {
  __restoOrdersGlobal?: InMemoryOrder[];
} & typeof global;

if (!globalThis.__restoOrdersGlobal) {
  globalThis.__restoOrdersGlobal = [];
}

export const orderStore = {
  getAll(): InMemoryOrder[] {
    return globalThis.__restoOrdersGlobal || [];
  },

  getById(id: string): InMemoryOrder | undefined {
    return (globalThis.__restoOrdersGlobal || []).find(o => o.id === id);
  },

  create(data: {
    customerName: string;
    tableOrAddress: string;
    notes?: string | null;
    totalAmount: number;
    xenditInvoiceId?: string | null;
    items: Array<{
      menuItemId: string;
      quantity: number;
      price: number;
      note?: string | null;
    }>;
  }): InMemoryOrder {
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const orderItems: InMemoryOrderItem[] = data.items.map((item, idx) => {
      const foundMenu = DEFAULT_MENU_ITEMS.find(m => m.id === item.menuItemId);
      return {
        id: `oi_${Date.now()}_${idx}`,
        orderId,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.price,
        note: item.note || null,
        menuItem: foundMenu ? {
          id: foundMenu.id,
          name: foundMenu.name,
          price: foundMenu.price,
          image: foundMenu.image,
          category: foundMenu.category
        } : {
          id: item.menuItemId,
          name: 'Menu Item',
          price: item.price,
          image: null,
          category: 'General'
        }
      };
    });

    const newOrder: InMemoryOrder = {
      id: orderId,
      customerName: data.customerName,
      tableOrAddress: data.tableOrAddress,
      notes: data.notes || null,
      totalAmount: data.totalAmount,
      status: 'New Order',
      paymentStatus: 'PENDING',
      xenditInvoiceId: data.xenditInvoiceId || null,
      createdAt: now,
      updatedAt: now,
      orderItems
    };

    if (!globalThis.__restoOrdersGlobal) {
      globalThis.__restoOrdersGlobal = [];
    }
    globalThis.__restoOrdersGlobal.unshift(newOrder);
    return newOrder;
  },

  updatePaymentStatus(id: string, paymentStatus: string): InMemoryOrder | undefined {
    const orders = globalThis.__restoOrdersGlobal || [];
    const order = orders.find(o => o.id === id);
    if (order) {
      order.paymentStatus = paymentStatus;
      order.updatedAt = new Date().toISOString();
      return order;
    }
    return undefined;
  },

  updateStatus(id: string, status: string): InMemoryOrder | undefined {
    const orders = globalThis.__restoOrdersGlobal || [];
    const order = orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      return order;
    }
    return undefined;
  }
};
