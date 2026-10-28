export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category: string;
  isAvailable: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
  note?: string;
}

export interface Order {
  id: string;
  customerName: string;
  tableOrAddress: string;
  notes: string | null;
  status: string;
  paymentStatus: string;
  xenditInvoiceId: string | null;
  totalAmount: number;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  price: number;
  note?: string | null;
}
