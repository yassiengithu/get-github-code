import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { ProductSource } from "@/data/products";

export type OrderStatus = "preparing" | "shipped" | "in_transit" | "delivered";

export type PaymentMethodId = "cod" | "gcash" | "card";

export type PaymentStatus = "unpaid" | "under_review" | "paid" | "failed";

export interface PaymentMethodInfo {
  id: PaymentMethodId;
  name: string;
  detail?: string;
  status: PaymentStatus;
}

export interface OrderItem {
  id: number;
  name: string;
  img: string;
  price: number;
  qty: number;
  source?: ProductSource;
  sellerName?: string;
}

export interface PlacedOrder {
  id: string;
  placedAt: string; // ISO string
  status: OrderStatus;
  trackingNumber: string;
  items: OrderItem[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  name: string;
  phone: string;
  address: string;
  courier: {
    id: string;
    name: string;
    fee: number;
    etaDays: string;
    etaMaxDays: number;
  };
  payment?: PaymentMethodInfo;
}

interface OrdersContextType {
  orders: PlacedOrder[];
  addOrder: (order: PlacedOrder) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updatePaymentStatus: (orderId: string, status: PaymentStatus) => void;
  updateTrackingNumber: (orderId: string, trackingNumber: string) => void;
  clearOrders: () => void;
}

const STORAGE_KEY = "shop:orders";
const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

const normalizeOrderStatus = (status: unknown): OrderStatus => {
  if (status === "delivered") return "delivered";
  if (status === "shipped") return "shipped";
  if (status === "in_transit") return "in_transit";
  return "preparing";
};

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<PlacedOrder[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.map((order) => ({ ...order, status: normalizeOrderStatus(order?.status) }))
        : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch {
      /* ignore quota errors */
    }
  }, [orders]);

  const addOrder = (order: PlacedOrder) => {
    setOrders((prev) => [order, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  const updatePaymentStatus = (orderId: string, status: PaymentStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId && o.payment ? { ...o, payment: { ...o.payment, status } } : o,
      ),
    );
  };

  const updateTrackingNumber = (orderId: string, trackingNumber: string) => {
    const normalized = trackingNumber.trim().toUpperCase();
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, trackingNumber: normalized } : o)),
    );
  };

  const clearOrders = () => setOrders([]);

  return (
    <OrdersContext.Provider value={{ orders, addOrder, updateOrderStatus, updatePaymentStatus, updateTrackingNumber, clearOrders }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
};
