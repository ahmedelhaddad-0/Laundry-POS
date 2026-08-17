import { useState, useEffect, createContext, useContext } from "react";
import type React from "react";
import type {
  AppCtx, Order, Customer, ServiceItem, InventoryItem,
  StockEntry, TreasuryEntry, MonthlyReport, WeeklyChartPoint, AppUser,
} from "@/types";
import {
  INIT_ORDERS, INIT_CUSTOMERS, INIT_SERVICES, INIT_INVENTORY,
  INIT_STOCK_HISTORY, INIT_TREASURY, INIT_USERS,
} from "@/db/seed";
import {
  FlaskConical, Droplets, ShoppingBag, Shirt, RefreshCw,
  Wind, Boxes, Tag, Package,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  FlaskConical, Droplets, ShoppingBag, Shirt, RefreshCw, Wind, Boxes, Tag, Package,
};
function resolveIcon(name: unknown): React.ElementType {
  return ICON_MAP[name as string] ?? Package;
}

// ── Electron API type ─────────────────────────────────────────────────────────

interface ElectronResult<T> { ok: boolean; data: T; error?: string; }

interface ElectronAPI {
  getOrders(): Promise<ElectronResult<Order[]>>;
  addOrder(o: Omit<Order, "id"> & { id: string }): Promise<ElectronResult<void>>;
  updateOrder(id: string, data: Partial<Order>): Promise<ElectronResult<void>>;
  deleteOrder(id: string): Promise<ElectronResult<void>>;
  getCustomers(): Promise<ElectronResult<Customer[]>>;
  addCustomer(c: Omit<Customer, "id">): Promise<ElectronResult<number>>;
  updateCustomer(id: number, data: Partial<Customer>): Promise<ElectronResult<void>>;
  deleteCustomer(id: number): Promise<ElectronResult<void>>;
  getServices(): Promise<ElectronResult<ServiceItem[]>>;
  addService(s: Omit<ServiceItem, "id">): Promise<ElectronResult<void>>;
  updateService(id: number, data: Partial<ServiceItem>): Promise<ElectronResult<void>>;
  deleteService(id: number): Promise<ElectronResult<void>>;
  getInventory(): Promise<ElectronResult<InventoryItem[]>>;
  addInventoryItem(item: Omit<InventoryItem, "id">): Promise<ElectronResult<void>>;
  updateInventoryItem(id: number, data: Partial<InventoryItem>): Promise<ElectronResult<void>>;
  deleteInventoryItem(id: number): Promise<ElectronResult<void>>;
  getStockHistory(): Promise<ElectronResult<StockEntry[]>>;
  addStockEntry(entry: Omit<StockEntry, "id">): Promise<ElectronResult<void>>;
  getTreasury(): Promise<ElectronResult<TreasuryEntry[]>>;
  addTreasuryEntry(entry: Omit<TreasuryEntry, "id">): Promise<ElectronResult<void>>;
  getSetting(key: string): Promise<ElectronResult<string | null>>;
  setSetting(key: string, value: string): Promise<ElectronResult<void>>;
  getMonthlyReport(): Promise<ElectronResult<MonthlyReport[]>>;
  getWeeklyChart(): Promise<ElectronResult<WeeklyChartPoint[]>>;
  factoryReset(): Promise<ElectronResult<void>>;
}

declare global {
  interface Window { electronAPI?: ElectronAPI; }
}

// ── Context ───────────────────────────────────────────────────────────────────

export const AppContext = createContext<AppCtx>(null!);
export function useApp() { return useContext(AppContext); }

// ── Helpers ───────────────────────────────────────────────────────────────────

function nowStamp() {
  const d = new Date();
  const months = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  return {
    date: `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`,
    time: `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`,
  };
}

function nextOrderId(orders: Order[]) {
  const nums = orders.map((o) => parseInt(o.id.replace("DNR-", "")));
  return `DNR-${String(Math.max(...nums, 0) + 1).padStart(4, "0")}`;
}

function nextId(items: { id: number }[]) {
  return Math.max(...items.map((i) => i.id), 0) + 1;
}

function nextSku(inventory: InventoryItem[], cat: string) {
  const prefix: Record<string,string> = { "مواد الغسيل": "BHN", "معطرات": "BWG", "تغليف": "PKG", "معدات": "ALT" };
  const p = prefix[cat] ?? "ITM";
  const existing = inventory.filter((i) => i.sku.startsWith(p)).map((i) => parseInt(i.sku.split("-")[1]) || 0);
  return `${p}-${String(Math.max(...existing, 0) + 1).padStart(3, "0")}`;
}

async function unwrap<T>(promise: Promise<ElectronResult<T>>): Promise<T | null> {
  const res = await promise;
  if (!res.ok) { console.error("DB error:", res.error); return null; }
  return res.data;
}

const EMPTY_WEEKLY: WeeklyChartPoint[] = [
  { day: "الاثنين",  pendapatan: 0, transaksi: 0 },
  { day: "الثلاثاء", pendapatan: 0, transaksi: 0 },
  { day: "الأربعاء", pendapatan: 0, transaksi: 0 },
  { day: "الخميس",  pendapatan: 0, transaksi: 0 },
  { day: "الجمعة",  pendapatan: 0, transaksi: 0 },
  { day: "السبت",   pendapatan: 0, transaksi: 0 },
  { day: "الأحد",   pendapatan: 0, transaksi: 0 },
];

// ── Provider ──────────────────────────────────────────────────────────────────

const FALLBACK_USER: AppUser = INIT_USERS[0];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const api = typeof window !== "undefined" ? window.electronAPI : undefined;
  const isElectron = !!api;

  const [activeNav, setActiveNav] = useState("لوحة التحكم");
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stockHistory, setStockHistory] = useState<StockEntry[]>([]);
  const [treasury, setTreasury] = useState<TreasuryEntry[]>([]);
  const [currency, setCurrencyState] = useState("ج.م");
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport[]>([]);
  const [weeklyChart, setWeeklyChart] = useState<WeeklyChartPoint[]>(EMPTY_WEEKLY);
  const [loading, setLoading] = useState(true);

  // ── Initial load ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isElectron) {
      setOrders(INIT_ORDERS);
      setCustomers(INIT_CUSTOMERS);
      setServices(INIT_SERVICES);
      setInventory(INIT_INVENTORY.map((i) => ({ ...i, icon: resolveIcon(i.icon) })));
      setStockHistory(INIT_STOCK_HISTORY);
      setTreasury(INIT_TREASURY);
      setMonthlyReport([]);
      setWeeklyChart(EMPTY_WEEKLY);
      setLoading(false);
      return;
    }

    // Electron: load everything from SQLite
    Promise.all([
      unwrap(api!.getOrders()),
      unwrap(api!.getCustomers()),
      unwrap(api!.getServices()),
      unwrap(api!.getInventory()),
      unwrap(api!.getStockHistory()),
      unwrap(api!.getTreasury()),
      unwrap(api!.getSetting("currency")),
      unwrap(api!.getMonthlyReport()),
      unwrap(api!.getWeeklyChart()),
    ]).then(([ord, cust, svc, inv, hist, treas, curr, monthly, weekly]) => {
      if (ord)     setOrders(ord);
      if (cust)    setCustomers(cust);
      if (svc)     setServices(svc);
      if (inv)     setInventory(inv.map((i) => ({ ...i, icon: resolveIcon(i.icon) })));
      if (hist)    setStockHistory(hist);
      if (treas)   setTreasury(treas);
      if (curr)    setCurrencyState(curr);
      if (monthly) setMonthlyReport(monthly);
      setWeeklyChart(weekly ?? EMPTY_WEEKLY);
      setLoading(false);
    });
  }, [isElectron]);

  // ── Orders ────────────────────────────────────────────────────────────────

  const addOrder = (data: Omit<Order, "id">): string => {
    const id = nextOrderId(orders);
    const newOrder = { ...data, id };
    setOrders((p) => [newOrder, ...p]);
    api?.addOrder(newOrder);
    return id;
  };

  const updateOrder = (id: string, data: Partial<Order>) => {
    setOrders((p) => p.map((o) => (o.id === id ? { ...o, ...data } : o)));
    api?.updateOrder(id, data);
  };

  const deleteOrder = (id: string) => {
    setOrders((p) => p.filter((o) => o.id !== id));
    api?.deleteOrder(id);
  };

  // ── Customers ─────────────────────────────────────────────────────────────

  const addCustomer = (data: Omit<Customer, "id">): Customer => {
    const c = { ...data, id: nextId(customers) };
    setCustomers((p) => [...p, c]);
    if (api) {
      api.addCustomer(data).then((res) => {
        if (res.ok && res.data) {
          setCustomers((p) => p.map((x) => (x.id === c.id ? { ...x, id: res.data as number } : x)));
        }
      });
    }
    return c;
  };

  const updateCustomer = (id: number, data: Partial<Customer>) => {
    setCustomers((p) => p.map((c) => (c.id === id ? { ...c, ...data } : c)));
    api?.updateCustomer(id, data);
  };

  const deleteCustomer = (id: number) => {
    setCustomers((p) => p.filter((c) => c.id !== id));
    api?.deleteCustomer(id);
  };

  // ── Services ──────────────────────────────────────────────────────────────

  const addService = (data: Omit<ServiceItem, "id">) => {
    setServices((p) => [...p, { ...data, id: nextId(p) }]);
    api?.addService(data);
  };

  const updateService = (id: number, data: Partial<ServiceItem>) => {
    setServices((p) => p.map((s) => (s.id === id ? { ...s, ...data } : s)));
    api?.updateService(id, data);
  };

  const deleteService = (id: number) => {
    setServices((p) => p.filter((s) => s.id !== id));
    api?.deleteService(id);
  };

  // ── Inventory ─────────────────────────────────────────────────────────────

  const restockItem = (id: number, qty: number, keterangan: string) => {
    const stamp = nowStamp();
    const item = inventory.find((i) => i.id === id);
    if (!item) return;
    const newSaldo = item.stock + qty;
    setInventory((p) =>
      p.map((i) => i.id === id ? { ...i, stock: newSaldo, lastRestock: stamp.date } : i)
    );
    const entry: Omit<StockEntry, "id"> = {
      date: stamp.date, time: stamp.time, sku: item.sku, name: item.name,
      type: "masuk", qty, unit: item.unit, keterangan, saldo: newSaldo,
    };
    setStockHistory((p) => [{ ...entry, id: nextId(p) }, ...p]);
    if (api) {
      api.updateInventoryItem(id, { stock: newSaldo, lastRestock: stamp.date });
      api.addStockEntry(entry);
    }
  };

  const consumeItem = (id: number, qty: number, keterangan: string) => {
    const stamp = nowStamp();
    const item = inventory.find((i) => i.id === id);
    if (!item) return;
    const newSaldo = Math.max(0, item.stock - qty);
    setInventory((p) =>
      p.map((i) => i.id === id ? { ...i, stock: newSaldo } : i)
    );
    const entry: Omit<StockEntry, "id"> = {
      date: stamp.date, time: stamp.time, sku: item.sku, name: item.name,
      type: "keluar", qty, unit: item.unit, keterangan, saldo: newSaldo,
    };
    setStockHistory((p) => [{ ...entry, id: nextId(p) }, ...p]);
    if (api) {
      api.updateInventoryItem(id, { stock: newSaldo });
      api.addStockEntry(entry);
    }
  };

  const addInventoryItem = (data: Omit<InventoryItem, "id">) => {
    const resolved = { ...data, icon: resolveIcon(data.icon as unknown) };
    setInventory((p) => [...p, { ...resolved, id: nextId(p) }]);
    const iconName = typeof data.icon === "function" ? (data.icon as React.ElementType).name ?? "Package" : String(data.icon);
    api?.addInventoryItem({ ...data, icon: iconName } as never);
  };

  const updateInventoryItem = (id: number, data: Partial<InventoryItem>) => {
    setInventory((p) => p.map((i) => (i.id === id ? { ...i, ...data } : i)));
    api?.updateInventoryItem(id, data);
  };

  const deleteInventoryItem = (id: number) => {
    setInventory((p) => p.filter((i) => i.id !== id));
    api?.deleteInventoryItem(id);
  };

  // ── Treasury ──────────────────────────────────────────────────────────────

  const addTreasuryEntry = (data: Omit<TreasuryEntry, "id">) => {
    setTreasury((p) => [{ ...data, id: nextId(p) }, ...p]);
    api?.addTreasuryEntry(data);
  };

  // ── Currency ──────────────────────────────────────────────────────────────

  const setCurrency = (c: string) => {
    setCurrencyState(c);
    api?.setSetting("currency", c);
  };

  // ── Factory Reset ─────────────────────────────────────────────────────────

  const factoryReset = async () => {
    if (isElectron) {
      await api!.factoryReset();
      // Reload services and inventory from DB (they are re-seeded)
      const [svc, inv] = await Promise.all([
        unwrap(api!.getServices()),
        unwrap(api!.getInventory()),
      ]);
      if (svc) setServices(svc);
      if (inv) setInventory(inv.map((i) => ({ ...i, icon: resolveIcon(i.icon) })));
    } else {
      setServices(INIT_SERVICES);
      setInventory(INIT_INVENTORY.map((i) => ({ ...i, icon: resolveIcon(i.icon) })));
    }
    setOrders([]);
    setCustomers(INIT_CUSTOMERS);
    setStockHistory([]);
    setTreasury([]);
    setMonthlyReport([]);
    setWeeklyChart(EMPTY_WEEKLY);
  };

  // ── Context value ─────────────────────────────────────────────────────────

  const ctx: AppCtx = {
    orders, customers, services, inventory, stockHistory, treasury,
    activeNav, setActiveNav,
    currency, setCurrency,
    currentUser: FALLBACK_USER,
    logout: () => {},
    monthlyReport, weeklyChart,
    addOrder, updateOrder, deleteOrder,
    addCustomer, updateCustomer, deleteCustomer,
    addService, updateService, deleteService,
    restockItem, consumeItem,
    addInventoryItem, updateInventoryItem, deleteInventoryItem,
    addTreasuryEntry,
    factoryReset,
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
            جاري التحميل...
          </p>
        </div>
      </div>
    );
  }

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>;
}
