export const orderStatuses = ["pending", "confirmed", "shipped", "completed", "cancelled"] as const;
export type OrderStatus = typeof orderStatuses[number];

export type OrderItem = {
  id: number;
  product_id: string;
  product_name: string;
  product_slug: string;
  size: string;
  quantity: number;
  unit_price: number;
};

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  subtotal: number;
  status: OrderStatus;
  created_at: string;
  order_items: OrderItem[];
};
