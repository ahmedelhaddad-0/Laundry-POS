import type React from "react";

export type OrderStatus = "menunggu" | "proses" | "selesai" | "batal";
export type UserRole = "admin" | "kasir";

export interface AppUser {
  id: number; name: string; username: string; email: string;
  password: string; role: UserRole; createdAt: string;
}

export interface Order {
  id: string; customer: string; phone: string; service: string;
  weight: number; total: number; status: OrderStatus;
  date: string; time: string; paid: boolean; notes: string;
}

export interface Customer {
  id: number; name: string; phone: string; email: string; address: string;
  joinDate: string; totalOrders: number; totalSpend: number;
  lastOrder: string; status: "aktif" | "tidak aktif";
}

export interface ServiceItem {
  id: number; name: string; desc: string; price: number; unit: string;
  duration: string; active: boolean; color: string;
}

export interface InventoryItem {
  id: number; sku: string; name: string; category: string; unit: string;
  stock: number; minStock: number; price: number; supplier: string;
  lastRestock: string; color: string; icon: React.ElementType;
}

export interface StockEntry {
  id: number; date: string; time: string; sku: string; name: string;
  type: "masuk" | "keluar"; qty: number; unit: string;
  keterangan: string; saldo: number;
}

export interface TreasuryEntry {
  id: number; date: string; time: string; type: "إيداع" | "سحب";
  amount: number; employee: string; reason: string;
}

export interface AppSetting {
  key: string; value: string;
}

export interface MonthlyReport {
  month: string; pendapatan: number; order: number; pelanggan: number;
}

export interface WeeklyChartPoint {
  day: string; pendapatan: number; transaksi: number;
}

export interface AppCtx {
  orders: Order[];
  customers: Customer[];
  services: ServiceItem[];
  inventory: InventoryItem[];
  stockHistory: StockEntry[];
  treasury: TreasuryEntry[];
  currentUser: AppUser;
  logout: () => void;
  currency: string;
  setCurrency: (c: string) => void;
  activeNav: string;
  setActiveNav: (n: string) => void;
  addOrder: (data: Omit<Order, "id">) => string;
  updateOrder: (id: string, data: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  addCustomer: (data: Omit<Customer, "id">) => Customer;
  updateCustomer: (id: number, data: Partial<Customer>) => void;
  deleteCustomer: (id: number) => void;
  addService: (data: Omit<ServiceItem, "id">) => void;
  updateService: (id: number, data: Partial<ServiceItem>) => void;
  deleteService: (id: number) => void;
  restockItem: (id: number, qty: number, note: string) => void;
  consumeItem: (id: number, qty: number, note: string) => void;
  addInventoryItem: (data: Omit<InventoryItem, "id">) => void;
  updateInventoryItem: (id: number, data: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: number) => void;
  addTreasuryEntry: (data: Omit<TreasuryEntry, "id">) => void;
  monthlyReport: MonthlyReport[];
  weeklyChart: WeeklyChartPoint[];
  factoryReset: () => void;
}
