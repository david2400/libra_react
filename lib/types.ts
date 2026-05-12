export interface OrderItem {
  id?: string;
  productCode?: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Supplier {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  category?: string;
}

export interface PurchaseOrder {
  id: number;
  orderNumber?: string;
  supplierId: number;
  supplier?: Supplier;
  createdAt: string;
  status: 'pending' | 'approved' | 'received' | 'cancelled';
  estimatedDelivery?: string;
  deliveryDate?: string;
  paymentTerms?: string;
  paymentMethod?: string;
  shippingMethod?: string;
  shippingCost?: number;
  tax?: number;
  discount?: number;
  currency?: string;
  purchaseBy?: string;
  approvedBy?: string;
  items: OrderItem[];
  notes?: string;
  internalNotes?: string;
  total: number;
}
