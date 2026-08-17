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

export const INIT_INVENTORY: InventoryItem[] = [
  { id: 1,  sku: "BHN-001", name: "مسحوق غسيل فاخر",       category: "مواد الغسيل", unit: "كجم",   stock: 48,  minStock: 10,  price: 18000,   supplier: "CV Bersih Jaya",             lastRestock: "-", color: "#0EA5E9", icon: "FlaskConical" },
  { id: 2,  sku: "BHN-002", name: "سائل غسيل أبيض",         category: "مواد الغسيل", unit: "لتر",   stock: 32,  minStock: 8,   price: 24000,   supplier: "CV Bersih Jaya",             lastRestock: "-", color: "#0EA5E9", icon: "Droplets" },
  { id: 3,  sku: "BHN-003", name: "منعم أقمشة لافندر",      category: "معطرات",      unit: "لتر",   stock: 7,   minStock: 10,  price: 32000,   supplier: "PT Harum Wangi",             lastRestock: "-", color: "#8B5CF6", icon: "Droplets" },
  { id: 4,  sku: "BHN-004", name: "معطر ملابس ورد",          category: "معطرات",      unit: "لتر",   stock: 14,  minStock: 8,   price: 28000,   supplier: "PT Harum Wangi",             lastRestock: "-", color: "#8B5CF6", icon: "Droplets" },
  { id: 5,  sku: "BHN-005", name: "مبيض كلور",               category: "مواد الغسيل", unit: "لتر",   stock: 3,   minStock: 5,   price: 12000,   supplier: "CV Bersih Jaya",             lastRestock: "-", color: "#EF4444", icon: "FlaskConical" },
  { id: 6,  sku: "PKG-001", name: "أكياس تغليف 30×50 سم",   category: "تغليف",       unit: "قطعة",  stock: 850, minStock: 200, price: 350,     supplier: "Toko Plastik Maju",          lastRestock: "-", color: "#F59E0B", icon: "ShoppingBag" },
  { id: 7,  sku: "PKG-002", name: "شماعات ملابس",            category: "تغليف",       unit: "قطعة",  stock: 210, minStock: 100, price: 2500,    supplier: "Toko Plastik Maju",          lastRestock: "-", color: "#F59E0B", icon: "Shirt" },
  { id: 8,  sku: "PKG-003", name: "ورق طابعة 58 ملم",        category: "تغليف",       unit: "لفة",   stock: 12,  minStock: 5,   price: 15000,   supplier: "Toko Elektronik Serba Ada",  lastRestock: "-", color: "#F59E0B", icon: "Tag" },
  { id: 9,  sku: "ALT-001", name: "غسالة أمامية 8 كجم",     category: "معدات",       unit: "وحدة",  stock: 3,   minStock: 1,   price: 4500000, supplier: "Distributor LG",             lastRestock: "-", color: "#10B981", icon: "RefreshCw" },
  { id: 10, sku: "ALT-002", name: "مكواة بخار صناعية",       category: "معدات",       unit: "وحدة",  stock: 2,   minStock: 1,   price: 850000,  supplier: "Toko Elektronik Serba Ada",  lastRestock: "-", color: "#10B981", icon: "Wind" },
  { id: 11, sku: "ALT-003", name: "ميزان رقمي 30 كجم",       category: "معدات",       unit: "وحدة",  stock: 4,   minStock: 2,   price: 380000,  supplier: "Toko Elektronik Serba Ada",  lastRestock: "-", color: "#10B981", icon: "Boxes" },
  { id: 12, sku: "BHN-006", name: "سائل التنظيف الجاف",      category: "مواد الغسيل", unit: "لتر",   stock: 9,   minStock: 5,   price: 75000,   supplier: "PT Kimia Prima",             lastRestock: "-", color: "#6366F1", icon: "FlaskConical" },
];

export const INIT_STOCK_HISTORY: StockEntry[] = [];

export const INIT_TREASURY: TreasuryEntry[] = [];

export const INIT_USERS: AppUser[] = [
  { id: 1, name: "مدير دينور",    username: "admin", email: "admin@denurlaundry.com", password: "admin123", role: "admin", createdAt: "أغسطس 2026" },
  { id: 2, name: "كاشير رئيسي",  username: "kasir", email: "kasir@denurlaundry.com", password: "kasir123", role: "kasir", createdAt: "أغسطس 2026" },
];
