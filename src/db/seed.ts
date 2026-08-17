import type { Order, Customer, ServiceItem, InventoryItem, StockEntry, TreasuryEntry, AppUser } from "@/types";

export const INIT_ORDERS: Order[] = [];

export const INIT_CUSTOMERS: Customer[] = [
  { id: 1, name: "عميل تجريبي", phone: "0000-0000", email: "test@denurlaundry.com", address: "-", joinDate: "أغسطس 2026", totalOrders: 0, totalSpend: 0, lastOrder: "-", status: "aktif" },
];

export const INIT_SERVICES: ServiceItem[] = [
  { id: 1, name: "غسيل جاف", desc: "غسيل + تجفيف بدون كي", price: 15000, unit: "كجم", duration: "يومان", active: true, color: "#0EA5E9" },
  { id: 2, name: "غسيل رطب", desc: "غسيل رطب بدون تجفيف", price: 10000, unit: "كجم", duration: "3 أيام", active: true, color: "#10B981" },
  { id: 3, name: "كي", desc: "كي فقط بدون غسيل", price: 8000, unit: "كجم", duration: "يوم واحد", active: true, color: "#F59E0B" },
  { id: 4, name: "غسيل + كي", desc: "باقة كاملة غسيل وكي", price: 20000, unit: "كجم", duration: "يومان", active: true, color: "#8B5CF6" },
  { id: 5, name: "سريع", desc: "ينتهي خلال 6 ساعات", price: 25000, unit: "كجم", duration: "6 ساعات", active: true, color: "#EF4444" },
  { id: 6, name: "تنظيف كيميائي", desc: "تنظيف كيميائي للأقمشة الخاصة", price: 40000, unit: "قطعة", duration: "3 أيام", active: true, color: "#6366F1" },
  { id: 7, name: "أحذية", desc: "غسيل أحذية فاخر", price: 50000, unit: "زوج", duration: "يومان", active: false, color: "#EC4899" },
];

export const INIT_INVENTORY: InventoryItem[] = [];

export const INIT_STOCK_HISTORY: StockEntry[] = [];

export const INIT_TREASURY: TreasuryEntry[] = [];

export const INIT_USERS: AppUser[] = [
  { id: 1, name: "مدير دينور",    username: "admin", email: "admin@denurlaundry.com", password: "admin123", role: "admin", createdAt: "أغسطس 2026" },
  { id: 2, name: "كاشير رئيسي",  username: "kasir", email: "kasir@denurlaundry.com", password: "kasir123", role: "kasir", createdAt: "أغسطس 2026" },
];
