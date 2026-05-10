export type SavedOrder = {
  id: string;
  item: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  payment: string;
  createdAt: string;
};

const KEY = "wiki_orders_v1";

export function loadOrders(): SavedOrder[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

export function saveOrder(o: Omit<SavedOrder, "id" | "createdAt">): SavedOrder {
  const order: SavedOrder = {
    ...o,
    id: "WS-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
    createdAt: new Date().toISOString(),
  };
  const all = loadOrders();
  all.unshift(order);
  localStorage.setItem(KEY, JSON.stringify(all));
  return order;
}

export function findOrder(id: string): SavedOrder | undefined {
  return loadOrders().find((o) => o.id === id);
}

export const PAY_LABEL: Record<string, string> = {
  cod: "Cash on Delivery",
  easypaisa: "Easypaisa",
  jazzcash: "JazzCash",
};
