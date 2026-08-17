import { useState } from "react";
import type React from "react";
import { AppProvider, useApp } from "./AppProvider";
import type { InventoryItem, Customer, ServiceItem, OrderStatus } from "@/types";
import {
  LayoutDashboard, ShoppingCart, ClipboardList, Users, BarChart3, Settings,
  Search, TrendingUp, TrendingDown, Package, Clock, CheckCircle2,
  XCircle, Loader2, Plus, Download, Shirt, Wind, Sparkles, RefreshCw,
  ChevronRight, Menu, X, Trash2, Edit2, Phone, Mail, MapPin, Calendar,
  Save, User, Store, CreditCard, Printer, Shield, AlertCircle, CheckCircle,
  ArrowLeft, Banknote, Receipt, Eye, FileText, Boxes, ArrowUpCircle,
  ArrowDownCircle, ShoppingBag, FlaskConical, Droplets, Tag,
  LogOut, EyeOff, UserPlus, Lock, AtSign, Minus, Landmark,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

// ─── Currency (module-level, updated each render, so formatRp needs no prop drilling)
let _currency = "ج.م";
let _priceDir: "ltr" | "rtl" = "rtl";

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatRp(n: number) {
  return n.toLocaleString("en-US") + " " + _currency;
}

function nowStamp() {
  const d = new Date();
  const months = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  return {
    date: `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`,
    time: `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`,
  };
}

function nextSku(inventory: InventoryItem[], cat: string) {
  const prefix = { "مواد الغسيل": "BHN", "معطرات": "BWG", "تغليف": "PKG", "معدات": "ALT" }[cat] ?? "ITM";
  const existing = inventory.filter((i) => i.sku.startsWith(prefix)).map((i) => parseInt(i.sku.split("-")[1]) || 0);
  const num = Math.max(...existing, 0) + 1;
  return `${prefix}-${String(num).padStart(3, "0")}`;
}

function downloadCSV(rows: string[][], filename: string) {
  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    selesai: { label: "مكتمل", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", icon: <CheckCircle2 size={11} /> },
    proses:  { label: "جاري المعالجة", cls: "bg-sky-50 text-sky-700 border border-sky-200", icon: <Loader2 size={11} className="animate-spin" /> },
    menunggu:{ label: "في الانتظار", cls: "bg-amber-50 text-amber-700 border border-amber-200", icon: <Clock size={11} /> },
    batal:   { label: "ملغي", cls: "bg-red-50 text-red-600 border border-red-200", icon: <XCircle size={11} /> },
  };
  const s = map[status] ?? map["menunggu"];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
}

// ─── Context ───────────────────────────────────────────────────────────────



// ─── Dashboard ─────────────────────────────────────────────────────────────

function DashboardView() {
  const { orders, services, customers, setActiveNav, weeklyChart } = useApp();
  const [chartView, setChartView] = useState<"pendapatan" | "transaksi">("pendapatan");

  const _months = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  const _now = new Date();
  const TODAY = `${_now.getDate()} ${_months[_now.getMonth()]} ${_now.getFullYear()}`;
  const THIS_MONTH = `${_months[_now.getMonth()]} ${_now.getFullYear()}`;
  const todayOrders = orders.filter((o) => o.date === TODAY && o.status !== "batal");
  const todayRev = todayOrders.reduce((a, o) => a + o.total, 0);
  const activeOrders = orders.filter((o) => o.status === "menunggu" || o.status === "proses");
  const monthOrders = orders.filter((o) => o.date.includes(THIS_MONTH) && o.status !== "batal");

  const revenueData = weeklyChart;

  const serviceData = (() => {
    const counts: Record<string, number> = {};
    orders.filter((o) => o.status !== "batal").forEach((o) => {
      const key = o.service.split("+")[0].trim();
      counts[key] = (counts[key] || 0) + 1;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    const colors = ["#0EA5E9","#10B981","#F59E0B","#8B5CF6","#EF4444","#6366F1"];
    return Object.entries(counts).slice(0, 5).map(([name, val], i) => ({
      name, value: Math.round((val / total) * 100), color: colors[i % colors.length],
    }));
  })();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
        <p className="font-semibold text-foreground mb-1.5">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.dataKey === "pendapatan" ? "الإيرادات: " : p.dataKey === "transaksi" ? "المعاملات: " : `${p.dataKey}: `}
            <span className="font-medium">{p.dataKey === "pendapatan" ? formatRp(p.value) : p.dataKey === "target" || p.dataKey === "aktual" ? formatRp(p.value) : `${p.value}`}</span>
          </p>
        ))}
      </div>
    );
  };

  const activeServiceList = services.filter((s) => s.active).slice(0, 4);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "إيرادات اليوم", value: todayRev >= 1000000 ? `${(todayRev/1000000).toFixed(2)} مليون ج.م` : formatRp(todayRev), sub: `${todayOrders.length} معاملة`, trend: "up" as const, trendVal: "+12.4%", icon: TrendingUp, accent: "bg-primary" },
          { label: "إجمالي طلبات الشهر", value: String(monthOrders.length), sub: "مقابل الشهر الماضي", trend: "up" as const, trendVal: "+10.2%", icon: ClipboardList, accent: "bg-emerald-500" },
          { label: "الطلبات النشطة", value: String(activeOrders.length), sub: `${activeOrders.filter(o=>o.status==="selesai").length} بانتظار الاستلام`, trend: "neutral" as const, trendVal: "—", icon: Loader2, accent: "bg-amber-500" },
          { label: "إجمالي العملاء", value: String(customers.length), sub: "مسجل", trend: "up" as const, trendVal: "+5%", icon: Users, accent: "bg-violet-500" },
        ].map(({ label, value, sub, trend, trendVal, icon: Icon, accent }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold text-foreground mt-1 leading-none" dir={_priceDir}>{value}</p>
                {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}><Icon size={18} className="text-white" /></div>
            </div>
            <div className="flex items-center gap-1.5">
              {trend === "up" ? <TrendingUp size={13} className="text-emerald-500" /> : trend === "down" ? <TrendingDown size={13} className="text-red-500" /> : null}
              <span dir="ltr" className={`text-xs font-semibold ${trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>{trendVal}</span>
              <span className="text-xs text-muted-foreground">مقارنة بالأسبوع الماضي</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>الاتجاه الأسبوعي</h2>
              <p className="text-xs text-muted-foreground">آخر 7 أيام</p>
            </div>
            <div className="flex gap-1 bg-muted rounded-lg p-0.5">
              {(["pendapatan", "transaksi"] as const).map((v) => (
                <button key={v} onClick={() => setChartView(v)} className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${chartView === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  {v === "pendapatan" ? "الإيرادات" : "المعاملات"}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.18} /><stop offset="100%" stopColor="#0EA5E9" stopOpacity={0} /></linearGradient>
                <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.18} /><stop offset="100%" stopColor="#10B981" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid key="dg" strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis key="dx" dataKey="day" tick={{ fontSize: 9, fill: "#64748B", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }} axisLine={false} tickLine={false} interval={0} />
              <YAxis key="dy" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => chartView === "pendapatan" ? (v >= 1000000 ? `${(v/1000000).toFixed(1)}م` : `${(v/1000).toFixed(0)}ك`) : String(v)} width={42} />
              <Tooltip key="dt" content={<CustomTooltip />} />
              <Area key="da" type="monotone" dataKey={chartView} stroke={chartView === "pendapatan" ? "#0EA5E9" : "#10B981"} strokeWidth={2}
                fill={chartView === "pendapatan" ? "url(#gP)" : "url(#gT)"} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex flex-col">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>توزيع الخدمات</h2>
            <p className="text-xs text-muted-foreground">بناءً على الطلبات النشطة</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie key="sp" data={serviceData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value" nameKey="name">
                  {serviceData.map((e, i) => <Cell key={`sc-${i}`} fill={e.color} stroke="none" />)}
                </Pie>
                <Tooltip key="st" formatter={(v: any) => [`${v}%`, ""]} contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid var(--border)", padding: "6px 10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
            {serviceData.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} /><span className="text-muted-foreground">{s.name}</span></div>
                <span className="font-semibold text-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>أحدث الطلبات</h2>
            <button onClick={() => setActiveNav("قائمة الطلبات")} className="text-xs text-primary font-medium flex items-center gap-0.5 hover:underline">عرض الكل <ChevronRight size={12} /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-border bg-muted/40">
                {["رقم الطلب","العميل","الخدمة","الإجمالي","الحالة"].map((h) => <th key={h} className="text-right px-4 py-2.5 font-medium text-muted-foreground">{h}</th>)}
              </tr></thead>
              <tbody>
                {orders.slice(0, 6).map((o, i) => (
                  <tr key={o.id} className={`border-b border-border/60 hover:bg-muted/30 transition-colors ${i===5?"border-none":""}`}>
                    <td className="px-4 py-2.5"><span className="font-semibold text-primary" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{o.id}</span></td>
                    <td className="px-3 py-2.5 font-medium text-foreground">{o.customer}</td>
                    <td className="px-3 py-2.5 hidden sm:table-cell text-muted-foreground">{o.service}</td>
                    <td className="px-3 py-2.5 hidden md:table-cell font-semibold text-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{formatRp(o.total)}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>الخدمات النشطة</h2>
          <div className="grid grid-cols-2 gap-2">
            {activeServiceList.map((svc) => (
              <button key={svc.id} onClick={() => setActiveNav("معاملة جديدة")}
                className="flex flex-col items-start gap-1.5 p-2.5 rounded-lg border border-border hover:border-primary/30 hover:bg-secondary/30 transition-all text-right">
                <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: svc.color + "20", color: svc.color }}><Shirt size={13} /></div>
                <div>
                  <p className="text-[11px] font-semibold text-foreground leading-tight">{svc.name}</p>
                  <p className="text-[10px] text-muted-foreground" dir={_priceDir}>{formatRp(svc.price)}/{svc.unit}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── معاملة جديدة ──────────────────────────────────────────────────────────

function TransaksiBaru() {
  const { services, customers, addOrder, updateCustomer, addCustomer } = useApp();
  const [step, setStep] = useState<"form" | "payment" | "receipt">("form");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [cart, setCart] = useState<{ id: number; name: string; price: number; unit: string; qty: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("tunai");
  const [cashPaid, setCashPaid] = useState("");
  const [completedOrderId, setCompletedOrderId] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = customerName.length > 0
    ? customers.filter((c) => c.name.toLowerCase().includes(customerName.toLowerCase())).slice(0, 5)
    : [];

  function selectCustomer(c: Customer) {
    setCustomerName(c.name); setCustomerPhone(c.phone); setShowSuggestions(false);
  }

  const activeServices = services.filter((s) => s.active);

  function addToCart(svc: typeof services[0]) {
    setCart((prev) => {
      const ex = prev.find((s) => s.id === svc.id);
      if (ex) return prev.map((s) => s.id === svc.id ? { ...s, qty: s.qty + 1 } : s);
      return [...prev, { id: svc.id, name: svc.name, price: svc.price, unit: svc.unit, qty: 1 }];
    });
  }
  function updateQty(id: number, qty: number) {
    if (qty <= 0) setCart((p) => p.filter((s) => s.id !== id));
    else setCart((p) => p.map((s) => s.id === id ? { ...s, qty } : s));
  }

  const subtotal = cart.reduce((a, s) => a + s.price * s.qty, 0);
  const tax = Math.round(subtotal * 0.01);
  const total = subtotal + tax;
  const cashNum = Number(cashPaid.replace(/\D/g, ""));
  const change = cashNum - total;
  const serviceName = cart.map((s) => `${s.name}${s.qty > 1 ? ` ×${s.qty}` : ""}`).join(" + ");
  const totalWeight = cart.filter((s) => s.unit === "كجم").reduce((a, s) => a + s.qty, 0) || cart.reduce((a, s) => a + s.qty, 0);

  function confirmPayment() {
    const stamp = nowStamp();
    const existingCustomer = customers.find((c) => c.name.toLowerCase() === customerName.toLowerCase());
    let phone = customerPhone;

    if (existingCustomer) {
      updateCustomer(existingCustomer.id, {
        totalOrders: existingCustomer.totalOrders + 1,
        totalSpend: existingCustomer.totalSpend + total,
        lastOrder: stamp.date,
      });
      phone = existingCustomer.phone || customerPhone;
    } else if (customerName.trim()) {
      addCustomer({
        name: customerName, phone: customerPhone, email: "", address: "",
        joinDate: stamp.date, totalOrders: 1, totalSpend: total,
        lastOrder: stamp.date, status: "aktif",
      });
    }

    const id = addOrder({
      customer: customerName || "زيارة مباشرة", phone,
      service: serviceName, weight: totalWeight, total,
      status: "menunggu", date: stamp.date, time: stamp.time,
      paid: true, notes,
    });
    setCompletedOrderId(id);
    setStep("receipt");
  }

  function reset() {
    setStep("form"); setCart([]); setCustomerName(""); setCustomerPhone("");
    setCashPaid(""); setNotes(""); setPaymentMethod("tunai"); setCompletedOrderId("");
  }

  if (step === "receipt") {
    return (
      <div className="flex items-start justify-center pt-4">
        <div className="bg-card border border-border rounded-xl w-full max-w-md p-6">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3"><CheckCircle size={28} className="text-emerald-600" /></div>
            <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>تمت المعاملة بنجاح!</h2>
            <p className="text-sm text-muted-foreground mt-1">تم إنشاء الطلب #{completedOrderId}</p>
          </div>
          <div className="bg-muted/40 rounded-lg p-4 text-xs space-y-2 mb-4">
            <div className="flex justify-between"><span className="text-muted-foreground">العميل</span><span className="font-medium">{customerName || "زيارة مباشرة"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">التاريخ</span><span className="font-medium">{nowStamp().date}، {nowStamp().time}</span></div>
            <div className="border-t border-border pt-2">
              {cart.map((s) => (
                <div key={s.id} className="flex justify-between py-0.5"><span className="text-muted-foreground">{s.name} × {s.qty} {s.unit}</span><span className="font-medium">{formatRp(s.price * s.qty)}</span></div>
              ))}
            </div>
            <div className="border-t border-border pt-2 space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">المجموع الفرعي</span><span>{formatRp(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">الضريبة (1%)</span><span>{formatRp(tax)}</span></div>
              <div className="flex justify-between font-bold text-sm text-foreground"><span>الإجمالي</span><span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{formatRp(total)}</span></div>
            </div>
            {paymentMethod === "tunai" && change >= 0 && (
              <div className="border-t border-border pt-2 space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">المبلغ المدفوع</span><span>{formatRp(cashNum)}</span></div>
                <div className="flex justify-between font-semibold text-emerald-600"><span>الباقي</span><span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{formatRp(change)}</span></div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 border border-border rounded-lg py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
              <Printer size={14} /> طباعة الإيصال
            </button>
            <button onClick={reset} className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 text-xs font-semibold hover:bg-primary/90 transition-colors">طلب جديد</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "payment") {
    return (
      <div className="flex items-start justify-center pt-4">
        <div className="bg-card border border-border rounded-xl w-full max-w-md p-5">
          <div className="flex items-center gap-2 mb-5">
            <button onClick={() => setStep("form")} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><ArrowLeft size={16} /></button>
            <h2 className="text-sm font-bold" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>الدفع</h2>
          </div>
          <div className="bg-muted/40 rounded-lg p-4 mb-4 text-xs space-y-1.5">
            {cart.map((s) => (
              <div key={s.id} className="flex justify-between"><span className="text-muted-foreground">{s.name} × {s.qty} {s.unit}</span><span className="font-medium">{formatRp(s.price * s.qty)}</span></div>
            ))}
            <div className="border-t border-border pt-2 space-y-1">
              <div className="flex justify-between text-muted-foreground"><span>المجموع الفرعي</span><span>{formatRp(subtotal)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>الضريبة (1%)</span><span>{formatRp(tax)}</span></div>
              <div className="flex justify-between font-bold text-base text-foreground pt-1"><span>الإجمالي</span><span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{formatRp(total)}</span></div>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-xs font-medium text-foreground mb-2">طريقة الدفع</p>
            <div className="grid grid-cols-3 gap-2">
              {[["tunai","نقدي",Banknote],["transfer","تحويل",CreditCard],["qris","QRIS",Receipt]].map(([val,label,Icon]:any) => (
                <button key={val} onClick={() => setPaymentMethod(val)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs transition-all ${paymentMethod===val?"border-primary bg-secondary/50 text-primary":"border-border text-muted-foreground hover:border-primary/30"}`}>
                  <Icon size={18} /><span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
          {paymentMethod === "tunai" && (
            <div className="mb-4">
              <p className="text-xs font-medium text-foreground mb-1.5">المبلغ المستلم</p>
              <input type="text" value={cashPaid}
                onChange={(e) => setCashPaid(e.target.value.replace(/\D/g,"").replace(/\B(?=(\d{3})+(?!\d))/g,"."))}
                placeholder="0" className="w-full border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
              {cashPaid && change >= 0 && (
                <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex justify-between text-xs">
                  <span className="text-emerald-700">الباقي</span><span className="font-bold text-emerald-700" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{formatRp(change)}</span>
                </div>
              )}
              {cashPaid && change < 0 && (
                <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2.5 flex justify-between text-xs">
                  <span className="text-red-600">المبلغ الناقص</span><span className="font-bold text-red-600" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{formatRp(Math.abs(change))}</span>
                </div>
              )}
            </div>
          )}
          <button onClick={confirmPayment} disabled={paymentMethod==="tunai" && change < 0}
            className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            تأكيد الدفع
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>بيانات العميل</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <label className="text-xs font-medium text-muted-foreground block mb-1">اسم العميل</label>
              <input value={customerName} onChange={(e) => { setCustomerName(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="الاسم أو زيارة مباشرة"
                className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background" />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                  {suggestions.map((c) => (
                    <button key={c.id} onClick={() => selectCustomer(c)}
                      className="w-full text-right px-3 py-2 text-xs hover:bg-muted transition-colors border-b border-border/50 last:border-none">
                      <span className="font-medium text-foreground">{c.name}</span>
                      <span className="text-muted-foreground ml-2">{c.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">رقم الهاتف</label>
              <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="08xx-xxxx-xxxx"
                className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background" />
            </div>
          </div>
          <div className="mt-3">
            <label className="text-xs font-medium text-muted-foreground block mb-1">ملاحظات</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="تعليمات خاصة..."
              className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background resize-none" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>اختر الخدمة</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {activeServices.map((svc) => {
              const inCart = cart.find((s) => s.id === svc.id);
              return (
                <button key={svc.id} onClick={() => addToCart(svc)}
                  className={`relative flex flex-col items-start p-3 rounded-lg border text-left transition-all hover:shadow-sm ${inCart ? "border-primary bg-secondary/40" : "border-border hover:border-primary/40"}`}>
                  {inCart && <span className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-white">{inCart.qty}</span>}
                  <div className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center" style={{ background: svc.color + "20", color: svc.color }}><Shirt size={15} /></div>
                  <p className="text-xs font-semibold text-foreground leading-tight">{svc.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5" dir={_priceDir}>{formatRp(svc.price)}/{svc.unit}</p>
                  <p className="text-[10px] text-muted-foreground" dir="ltr">⏱ {svc.duration}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-card border border-border rounded-xl p-4 sticky top-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>ملخص الطلب</h2>
            {cart.length > 0 && <button onClick={() => setCart([])} className="text-[10px] text-red-500 hover:underline">حذف الكل</button>}
          </div>
          {cart.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground"><ShoppingCart size={28} className="mx-auto mb-2 opacity-30" /><p className="text-xs">لم يتم اختيار أي خدمة</p></div>
          ) : (
            <div className="space-y-2 mb-4">
              {cart.map((s) => (
                <div key={s.id} className="flex items-center gap-2 bg-muted/40 rounded-lg p-2">
                  <div className="flex-1 min-w-0"><p className="text-xs font-medium text-foreground truncate">{s.name}</p><p className="text-[10px] text-muted-foreground" dir={_priceDir}>{formatRp(s.price)}/{s.unit}</p></div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => updateQty(s.id, s.qty-1)} className="w-5 h-5 rounded border border-border text-xs flex items-center justify-center hover:bg-muted">−</button>
                    <span className="text-xs font-semibold w-5 text-center" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{s.qty}</span>
                    <button onClick={() => updateQty(s.id, s.qty+1)} className="w-5 h-5 rounded border border-border text-xs flex items-center justify-center hover:bg-muted">+</button>
                  </div>
                  <span className="text-xs font-semibold w-16 text-right shrink-0" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{formatRp(s.price*s.qty)}</span>
                  <button onClick={() => updateQty(s.id, 0)} className="text-muted-foreground hover:text-red-500"><X size={13} /></button>
                </div>
              ))}
            </div>
          )}
          {cart.length > 0 && (
            <>
              <div className="border-t border-border pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground"><span>المجموع الفرعي</span><span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{formatRp(subtotal)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>الضريبة (1%)</span><span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{formatRp(tax)}</span></div>
                <div className="flex justify-between font-bold text-sm text-foreground pt-1 border-t border-border"><span>الإجمالي</span><span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{formatRp(total)}</span></div>
              </div>
              <button onClick={() => setStep("payment")}
                className="mt-4 w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                <CreditCard size={15} /> معالجة الدفع
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── قائمة الطلبات ──────────────────────────────────────────────────────────

function DaftarOrder() {
  const { orders, updateOrder, deleteOrder } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [selected, setSelected] = useState<Order | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("");

  const filtered = orders.filter((o) => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "semua" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function handleExport() {
    const rows = [
      ["رقم الطلب","العميل","الهاتف","الخدمة","الوزن","الإجمالي","الحالة","التاريخ","الوقت","مدفوع"],
      ...filtered.map((o) => [o.id, o.customer, o.phone, o.service, String(o.weight), String(o.total), o.status, o.date, o.time, o.paid?"نعم":"لا"]),
    ];
    downloadCSV(rows, "قائمة-طلبات-دينور.csv");
  }

  if (selected) {
    const order = orders.find((o) => o.id === selected.id) ?? selected;
    return (
      <div className="max-w-lg">
        <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors"><ArrowLeft size={14} /> العودة إلى القائمة</button>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div><span className="text-xs text-muted-foreground">رقم الطلب</span><h2 className="text-lg font-bold text-primary" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{order.id}</h2></div>
            <StatusBadge status={order.status} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs mb-4">
            {[["العميل",order.customer],["الهاتف",order.phone],["الخدمة",order.service],["الوزن",order.weight + " كجم"],
              ["التاريخ",order.date],["وقت الاستلام",order.time],["الدفع",order.paid?"مدفوع":"غير مدفوع"],["الإجمالي",formatRp(order.total)]].map(([k,v]) => (
              <div key={k as string} className="bg-muted/40 rounded-lg p-2.5"><p className="text-muted-foreground mb-0.5">{k as string}</p><p className="font-semibold text-foreground">{v as string}</p></div>
            ))}
          </div>
          {order.notes && <div className="bg-muted/40 rounded-lg p-2.5 mb-4 text-xs"><p className="text-muted-foreground mb-0.5">ملاحظات</p><p className="text-foreground">{order.notes}</p></div>}

          {order.status !== "selesai" && order.status !== "batal" && (
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">تغيير الحالة</p>
              <div className="flex gap-2 flex-wrap">
                {order.status === "menunggu" && (
                  <button onClick={() => { updateOrder(order.id,{status:"proses"}); setSelected({...order,status:"proses"}); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 border border-sky-200 text-sky-700 text-xs font-medium rounded-lg hover:bg-sky-100 transition-colors">
                    <Loader2 size={12} /> تعيين قيد المعالجة
                  </button>
                )}
                {(order.status === "menunggu" || order.status === "proses") && (
                  <button onClick={() => { updateOrder(order.id,{status:"selesai"}); setSelected({...order,status:"selesai"}); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-lg hover:bg-emerald-100 transition-colors">
                    <CheckCircle2 size={12} /> تعيين مكتمل
                  </button>
                )}
                <button onClick={() => { updateOrder(order.id,{status:"batal"}); setSelected({...order,status:"batal"}); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors">
                  <XCircle size={12} /> إلغاء
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => window.print()} className="flex-1 border border-border rounded-lg py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5"><Printer size={13} /> إيصال</button>
            {confirmDelete === order.id ? (
              <>
                <button onClick={() => { deleteOrder(order.id); setSelected(null); setConfirmDelete(null); }} className="flex-1 bg-red-500 text-white rounded-lg py-2 text-xs font-semibold">نعم، احذف</button>
                <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-border rounded-lg py-2 text-xs font-medium text-muted-foreground hover:bg-muted">إلغاء</button>
              </>
            ) : (
              <button onClick={() => setConfirmDelete(order.id)} className="flex-1 border border-red-200 text-red-500 rounded-lg py-2 text-xs font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"><Trash2 size={12} /> حذف الطلب</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const statusLabels: Record<string, string> = {
    semua: "الكل", menunggu: "في الانتظار", proses: "قيد المعالجة", selesai: "مكتمل", batal: "ملغي"
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث برقم الطلب أو اسم العميل..."
            className="w-full bg-card border border-border rounded-lg pr-8 pl-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex flex-wrap gap-1">
          {["semua","menunggu","proses","selesai","batal"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${statusFilter===s?"bg-primary text-primary-foreground":"bg-card border border-border text-muted-foreground hover:text-foreground"}`}>{statusLabels[s]}</button>
          ))}
        </div>
        <button onClick={handleExport} className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors ml-auto"><Download size={13} /> تصدير CSV</button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border"><p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">{filtered.length}</span> طلب موجود</p></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-border bg-muted/40">
              {["رقم الطلب","العميل","الخدمة","الوزن","الإجمالي","الحالة","تاريخ الاستلام",""].map((h) => <th key={h} className="text-right px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-border/60 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelected(o)}>
                  <td className="px-4 py-3"><span className="font-semibold text-primary" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{o.id}</span></td>
                  <td className="px-4 py-3"><p className="font-medium text-foreground">{o.customer}</p><p className="text-muted-foreground">{o.phone}</p></td>
                  <td className="px-4 py-3 text-muted-foreground">{o.service}</td>
                  <td className="px-4 py-3 text-muted-foreground" dir="ltr">{o.weight} كجم</td>
                  <td className="px-4 py-3 font-semibold text-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{formatRp(o.total)}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{o.date}، {o.time}</td>
                  <td className="px-4 py-3"><button className="text-muted-foreground hover:text-foreground p-1 rounded"><Eye size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground"><FileText size={28} className="mx-auto mb-2 opacity-30" /><p className="text-xs">لا توجد طلبات مطابقة</p></div>}
        </div>
      </div>
    </div>
  );
}

// ─── العملاء ─────────────────────────────────────────────────────────────

const EMPTY_CUSTOMER_FORM = { name: "", phone: "", email: "", address: "" };

function PelangganView() {
  const { customers, orders, addCustomer, updateCustomer, deleteCustomer } = useApp();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_CUSTOMER_FORM);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const filtered = customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));

  function openAdd() { setEditId(null); setForm(EMPTY_CUSTOMER_FORM); setShowForm(true); }
  function openEdit(c: Customer) { setEditId(c.id); setForm({ name: c.name, phone: c.phone, email: c.email, address: c.address }); setShowForm(true); }

  function handleSave() {
    if (!form.name.trim()) return;
    const stamp = nowStamp();
    if (editId !== null) {
      updateCustomer(editId, { name: form.name, phone: form.phone, email: form.email, address: form.address });
      if (selected?.id === editId) setSelected((p) => p ? { ...p, name: form.name, phone: form.phone, email: form.email, address: form.address } : p);
    } else {
      addCustomer({ name: form.name, phone: form.phone, email: form.email, address: form.address, joinDate: stamp.date, totalOrders: 0, totalSpend: 0, lastOrder: "-", status: "aktif" });
    }
    setShowForm(false);
  }

  function handleDelete(id: number) {
    deleteCustomer(id);
    if (selected?.id === id) setSelected(null);
    setConfirmDelete(null);
  }

  function handleExport() {
    const rows = [["الرقم","الاسم","الهاتف","البريد الإلكتروني","العنوان","إجمالي الطلبات","إجمالي الإنفاق","الحالة"],
      ...customers.map((c) => [String(c.id),c.name,c.phone,c.email,c.address,String(c.totalOrders),String(c.totalSpend),c.status])];
    downloadCSV(rows, "عملاء-دينور.csv");
  }

  if (selected) {
    const live = customers.find((c) => c.id === selected.id) ?? selected;
    const history = orders.filter((o) => o.customer === live.name);
    return (
      <div>
        <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4"><ArrowLeft size={14} /> العودة إلى القائمة</button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">{live.name.charAt(0)}</div>
              <div><h2 className="text-sm font-bold text-foreground" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>{live.name}</h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${live.status==="aktif"?"bg-emerald-50 text-emerald-700":"bg-muted text-muted-foreground"}`}>{live.status==="aktif"?"نشط":"غير نشط"}</span>
              </div>
            </div>
            <div className="space-y-2.5 text-xs">
              {[[Phone, live.phone],[Mail, live.email],[MapPin, live.address],[Calendar,`انضم ${live.joinDate}`]].map(([Icon, val]:any) => (
                <div key={val} className="flex items-start gap-2 text-muted-foreground"><Icon size={13} className="mt-0.5 shrink-0" /><span>{val || "-"}</span></div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="bg-muted/40 rounded-lg p-2.5 text-center"><p className="text-lg font-bold text-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{live.totalOrders}</p><p className="text-[10px] text-muted-foreground">إجمالي الطلبات</p></div>
              <div className="bg-muted/40 rounded-lg p-2.5 text-center"><p className="text-sm font-bold text-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{formatRp(live.totalSpend)}</p><p className="text-[10px] text-muted-foreground">إجمالي الإنفاق</p></div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => openEdit(live)} className="flex-1 border border-border rounded-lg py-2 text-xs font-medium text-muted-foreground hover:bg-muted flex items-center justify-center gap-1"><Edit2 size={12} /> تعديل</button>
              {confirmDelete === live.id ? (
                <>
                  <button onClick={() => handleDelete(live.id)} className="flex-1 bg-red-500 text-white rounded-lg py-2 text-xs font-semibold">حذف</button>
                  <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-border rounded-lg py-2 text-xs font-medium text-muted-foreground hover:bg-muted">إلغاء</button>
                </>
              ) : (
                <button onClick={() => setConfirmDelete(live.id)} className="flex-1 border border-red-200 text-red-500 rounded-lg py-2 text-xs font-medium hover:bg-red-50 flex items-center justify-center gap-1"><Trash2 size={12} /> حذف</button>
              )}
            </div>
          </div>
          <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-semibold" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>سجل الطلبات ({history.length})</h3></div>
            {history.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-xs"><FileText size={24} className="mx-auto mb-2 opacity-30" />لا يوجد سجل بعد</div>
            ) : (
              <table className="w-full text-xs"><thead><tr className="border-b border-border bg-muted/40">
                {["الرقم","الخدمة","الإجمالي","الحالة","التاريخ"].map((h) => <th key={h} className="text-right px-4 py-2.5 font-medium text-muted-foreground">{h}</th>)}
              </tr></thead><tbody>
                {history.map((o) => (
                  <tr key={o.id} className="border-b border-border/60 hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-semibold text-primary" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{o.id}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{o.service}</td>
                    <td className="px-4 py-2.5 font-semibold text-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{formatRp(o.total)}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-2.5 text-muted-foreground">{o.date}</td>
                  </tr>
                ))}
              </tbody></table>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث بالاسم أو رقم الهاتف..."
            className="w-full bg-card border border-border rounded-lg pr-8 pl-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <button onClick={handleExport} className="flex items-center gap-1.5 border border-border bg-card rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"><Download size={13} /> تصدير</button>
        <button onClick={openAdd} className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-lg px-3 py-2 text-xs font-semibold hover:bg-primary/90 transition-colors ml-auto"><Plus size={13} /> عميل جديد</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((c) => (
          <button key={c.id} onClick={() => setSelected(c)} className="bg-card border border-border rounded-xl p-4 text-right hover:shadow-md hover:border-primary/20 transition-all">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">{c.name.charAt(0)}</div>
              <div className="min-w-0"><p className="text-xs font-semibold text-foreground truncate">{c.name}</p><p className="text-[10px] text-muted-foreground">{c.phone}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-muted/40 rounded-md p-1.5"><p className="text-sm font-bold text-foreground">{c.totalOrders}</p><p className="text-[10px] text-muted-foreground">طلب</p></div>
              <div className="bg-muted/40 rounded-md p-1.5"><p className="text-[11px] font-bold text-foreground" dir={_priceDir} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{(c.totalSpend/1000).toFixed(0)}ك</p><p className="text-[10px] text-muted-foreground">إنفاق</p></div>
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${c.status==="aktif"?"bg-emerald-50 text-emerald-700":"bg-muted text-muted-foreground"}`}>{c.status==="aktif"?"نشط":"غير نشط"}</span>
              <span className="text-[10px] text-muted-foreground">آخر طلب {c.lastOrder}</span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && <div className="col-span-full text-center py-16 text-muted-foreground text-xs"><Users size={32} className="mx-auto mb-2 opacity-30" />لا يوجد عملاء</div>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-xl border border-border p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>{editId ? "تعديل العميل" : "عميل جديد"}</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              {([["الاسم الكامل","name","text","اسم العميل"],["رقم الهاتف","phone","tel","08xx-xxxx-xxxx"],["البريد الإلكتروني","email","email","example@email.com"],["العنوان","address","text","..."]] as const).map(([label,key,type,ph]) => (
                <div key={key}><label className="text-xs font-medium text-muted-foreground block mb-1">{label}</label>
                  <input type={type} value={form[key]} onChange={f(key)} placeholder={ph}
                    className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background" /></div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-border rounded-lg py-2 text-xs font-medium text-muted-foreground hover:bg-muted">إلغاء</button>
              <button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 text-xs font-semibold hover:bg-primary/90 flex items-center justify-center gap-1.5"><Save size={12} /> حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── الخدمات ───────────────────────────────────────────────────────────────

const EMPTY_SVC_FORM = { name: "", desc: "", price: "", unit: "كجم", duration: "", color: "#0EA5E9" };

function LayananView() {
  const { services, addService, updateService, deleteService } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_SVC_FORM);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  function openAdd() { setEditId(null); setForm(EMPTY_SVC_FORM); setShowForm(true); }
  function openEdit(s: ServiceItem) { setEditId(s.id); setForm({ name: s.name, desc: s.desc, price: String(s.price), unit: s.unit, duration: s.duration, color: s.color }); setShowForm(true); }
  function handleSave() {
    if (!form.name.trim() || !form.price) return;
    const data = { name: form.name, desc: form.desc, price: Number(form.price), unit: form.unit, duration: form.duration, color: form.color, active: true };
    if (editId !== null) updateService(editId, data);
    else addService(data);
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-sm font-semibold" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>إدارة الخدمات</h2>
          <p className="text-xs text-muted-foreground">{services.filter((s) => s.active).length} من {services.length} خدمة نشطة</p></div>
        <button onClick={openAdd} className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-lg px-3 py-2 text-xs font-semibold hover:bg-primary/90"><Plus size={13} /> إضافة خدمة</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {services.map((svc) => (
          <div key={svc.id} className={`bg-card border rounded-xl p-4 transition-all ${svc.active?"border-border":"border-border opacity-60"}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: svc.color+"20", color: svc.color }}><Shirt size={16} /></div>
                <div><p className="text-xs font-semibold text-foreground">{svc.name}</p><p className="text-[10px] text-muted-foreground">{svc.desc}</p></div>
              </div>
              <button onClick={() => updateService(svc.id, { active: !svc.active })}
                className={`relative w-9 h-5 rounded-full transition-colors ${svc.active?"bg-primary":"bg-muted-foreground/30"}`}>
                <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: svc.active?"calc(100% - 18px)":"2px" }} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] mb-3">
              <div className="bg-muted/40 rounded-md p-1.5"><p className="font-bold text-foreground text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{formatRp(svc.price)}</p><p className="text-muted-foreground">لكل {svc.unit}</p></div>
              <div className="bg-muted/40 rounded-md p-1.5"><p className="font-bold text-foreground text-xs">⏱ {svc.duration}</p><p className="text-muted-foreground">مدة تقديرية</p></div>
              <div className="bg-muted/40 rounded-md p-1.5"><p className="font-bold text-foreground text-xs">{svc.unit}</p><p className="text-muted-foreground">الوحدة</p></div>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => openEdit(svc)} className="flex-1 border border-border rounded-lg py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted flex items-center justify-center gap-1"><Edit2 size={11} /> تعديل</button>
              {confirmDelete === svc.id ? (
                <>
                  <button onClick={() => { deleteService(svc.id); setConfirmDelete(null); }} className="flex-1 bg-red-500 text-white rounded-lg py-1.5 text-[11px] font-semibold">حذف</button>
                  <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-border rounded-lg py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted">إلغاء</button>
                </>
              ) : (
                <button onClick={() => setConfirmDelete(svc.id)} className="flex-1 border border-red-200 text-red-500 rounded-lg py-1.5 text-[11px] font-medium hover:bg-red-50 flex items-center justify-center gap-1"><Trash2 size={11} /> حذف</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-xl border border-border p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>{editId ? "تعديل الخدمة" : "إضافة خدمة"}</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-muted-foreground block mb-1">اسم الخدمة</label><input value={form.name} onChange={f("name")} placeholder="غسيل جاف" className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background" /></div>
              <div><label className="text-xs font-medium text-muted-foreground block mb-1">الوصف</label><input value={form.desc} onChange={f("desc")} placeholder="وصف مختصر" className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-medium text-muted-foreground block mb-1">السعر (ج.م)</label><input type="number" value={form.price} onChange={f("price")} placeholder="15000" className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background" /></div>
                <div><label className="text-xs font-medium text-muted-foreground block mb-1">الوحدة</label>
                  <select value={form.unit} onChange={f("unit")} className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background">
                    {["كجم","قطعة","زوج","ورقة"].map((u) => <option key={u}>{u}</option>)}
                  </select></div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground block mb-1">الوقت التقديري</label><input value={form.duration} onChange={f("duration")} placeholder="يومان" className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background" /></div>
              <div><label className="text-xs font-medium text-muted-foreground block mb-1">اللون</label>
                <div className="flex gap-2 flex-wrap">
                  {["#0EA5E9","#10B981","#F59E0B","#8B5CF6","#EF4444","#6366F1","#EC4899"].map((c) => (
                    <button key={c} onClick={() => setForm((p) => ({ ...p, color: c }))} className={`w-7 h-7 rounded-full border-2 transition-all ${form.color===c?"border-foreground scale-110":"border-transparent"}`} style={{ background: c }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-border rounded-lg py-2 text-xs font-medium text-muted-foreground hover:bg-muted">إلغاء</button>
              <button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 text-xs font-semibold hover:bg-primary/90 flex items-center justify-center gap-1.5"><Save size={12} /> حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── المخزون ─────────────────────────────────────────────────────────────

const CATS = ["الكل","مواد الغسيل","معطرات","تغليف","معدات"];
const CAT_COLOR: Record<string, string> = {
  "مواد الغسيل": "#0EA5E9",
  "معطرات":      "#8B5CF6",
  "تغليف":       "#F59E0B",
  "معدات":       "#10B981",
};
const CAT_ICON_NAME: Record<string, string> = {
  "مواد الغسيل": "FlaskConical",
  "معطرات":      "Droplets",
  "تغليف":       "ShoppingBag",
  "معدات":       "RefreshCw",
};
const EMPTY_INV_FORM = { sku: "", name: "", category: "مواد الغسيل", unit: "كجم", stock: "", minStock: "", price: "", supplier: "" };

function InventoryView() {
  const { inventory, stockHistory, restockItem, consumeItem, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useApp();
  const [tab, setTab] = useState<"stok"|"riwayat">("stok");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("الكل");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_INV_FORM);
  const [showRestock, setShowRestock] = useState<InventoryItem | null>(null);
  const [showConsume, setShowConsume] = useState<InventoryItem | null>(null);
  const [mutQty, setMutQty] = useState("");
  const [mutNote, setMutNote] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const lowStock = inventory.filter((i) => i.stock <= i.minStock);
  const filtered = inventory.filter((i) => {
    const m = i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase());
    const c = catFilter === "الكل" || i.category === catFilter;
    return m && c;
  });
  const totalValue = inventory.reduce((a, i) => a + i.stock * i.price, 0);

  function openAdd() { setEditId(null); setForm(EMPTY_INV_FORM); setShowForm(true); }
  function openEdit(item: InventoryItem) {
    setEditId(item.id);
    setForm({ sku: item.sku, name: item.name, category: item.category, unit: item.unit, stock: String(item.stock), minStock: String(item.minStock), price: String(item.price), supplier: item.supplier });
    setShowForm(true);
  }
  function handleSave() {
    if (!form.name.trim()) return;
    const stamp = nowStamp();
    const iconName = CAT_ICON_NAME[form.category] ?? "Package";
    const color = CAT_COLOR[form.category] ?? "#64748B";
    const data = {
      sku: form.sku || nextSku(inventory, form.category),
      name: form.name, category: form.category, unit: form.unit,
      stock: Number(form.stock) || 0, minStock: Number(form.minStock) || 0,
      price: Number(form.price) || 0, supplier: form.supplier,
      lastRestock: editId !== null ? (inventory.find(i => i.id === editId)?.lastRestock ?? "-") : stamp.date,
      color, icon: iconName as unknown as React.ElementType,
    };
    if (editId !== null) updateInventoryItem(editId, data);
    else addInventoryItem(data);
    setShowForm(false);
  }
  function handleExport() {
    const rows = [["SKU","الاسم","الفئة","المخزون","الوحدة","السعر","المورد"],
      ...inventory.map((i) => [i.sku, i.name, i.category, String(i.stock), i.unit, String(i.price), i.supplier])];
    downloadCSV(rows, "مخزون-دينور.csv");
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "إجمالي الأصناف", value: String(inventory.length), sub: "نوع من المواد", color: "bg-primary", icon: Boxes },
          { label: "مخزون منخفض", value: String(lowStock.length), sub: "يحتاج إعادة تخزين", color: "bg-red-500", icon: AlertCircle },
          { label: "قيمة المخزون", value: `${(totalValue/1000000).toFixed(1)} م ج.م`, sub: "تقدير إجمالي", color: "bg-emerald-500", icon: Tag },
          { label: "حركات المخزون", value: String(stockHistory.length), sub: "مسجلة", color: "bg-amber-500", icon: ArrowUpCircle },
        ].map(({ label, value, sub, color, icon: Icon }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}><Icon size={17} className="text-white" /></div>
            <div><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
              <p className="text-xl font-bold text-foreground leading-tight" dir={_priceDir} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{value}</p>
              <p className="text-[10px] text-muted-foreground">{sub}</p></div>
          </div>
        ))}
      </div>

      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-red-700 mb-1">⚠ {lowStock.length} صنف مخزونه منخفض — يحتاج إعادة تخزين عاجلاً</p>
            <div className="flex flex-wrap gap-1.5">
              {lowStock.map((i) => (
                <button key={i.id} onClick={() => { setShowRestock(i); setMutNote(`إعادة تخزين من ${i.supplier}`); setMutQty(""); }}
                  className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-[10px] font-medium px-2 py-0.5 rounded-full border border-red-200 hover:bg-red-200 transition-colors">
                  {i.name} — المتبقي <span dir="ltr" className="inline">{i.stock} {i.unit}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-card border border-border rounded-lg p-0.5">
          {(["stok","riwayat"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${tab===t?"bg-primary text-primary-foreground":"text-muted-foreground hover:text-foreground"}`}>
              {t === "stok" ? "قائمة المخزون" : "سجل الحركات"}
            </button>
          ))}
        </div>
        {tab === "stok" && (
          <>
            <div className="relative"><Search size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث بالاسم أو SKU..." className="bg-card border border-border rounded-lg pr-7 pl-3 py-1.5 text-xs w-44 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="flex flex-wrap gap-1">
              {CATS.map((c) => (
                <button key={c} onClick={() => setCatFilter(c)} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${catFilter===c?"bg-primary text-primary-foreground":"bg-card border border-border text-muted-foreground hover:text-foreground"}`}>{c}</button>
              ))}
            </div>
            <div className="flex gap-2 ml-auto">
              <button onClick={handleExport} className="flex items-center gap-1.5 border border-border bg-card rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"><Download size={12} /> تصدير</button>
              <button onClick={openAdd} className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-primary/90"><Plus size={13} /> إضافة صنف</button>
            </div>
          </>
        )}
      </div>

      {tab === "stok" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-border bg-muted/40">
                {["SKU","اسم الصنف","الفئة","المخزون","الحد الأدنى","سعر الوحدة","قيمة المخزون","المورد",""].map((h) => <th key={h} className="text-right px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map((item) => {
                  const isLow = item.stock <= item.minStock;
                  return (
                    <tr key={item.id} className="border-b border-border/60 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{item.sku}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: item.color+"18", color: item.color }}><item.icon size={13} /></div>
                          <span className="font-medium text-foreground">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="bg-muted text-muted-foreground text-[10px] px-2 py-0.5 rounded-full font-medium">{item.category}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2" dir="ltr">
                          <span className={`font-bold text-sm ${isLow?"text-red-600":"text-foreground"}`} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{item.stock}</span>
                          <span className="text-muted-foreground">{item.unit}</span>
                          {isLow && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />}
                        </div>
                        <div className="mt-1 w-20 h-1 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${isLow?"bg-red-400":"bg-emerald-400"}`} style={{ width: `${Math.min(100,(item.stock/(item.minStock*3))*100)}%` }} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground" dir="ltr">{item.minStock} {item.unit}</td>
                      <td className="px-4 py-3 font-medium text-foreground" dir={_priceDir} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{formatRp(item.price)}/{item.unit}</td>
                      <td className="px-4 py-3 font-semibold text-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{formatRp(item.stock*item.price)}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[120px] truncate">{item.supplier}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setShowRestock(item); setMutQty(""); setMutNote(`إعادة تخزين من ${item.supplier}`); }}
                            className="flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-semibold px-2 py-1 rounded-md hover:bg-primary/20 whitespace-nowrap">
                            <ArrowUpCircle size={11} /> إعادة تخزين
                          </button>
                          <button onClick={() => { setShowConsume(item); setMutQty(""); setMutNote("استهلاك الإنتاج"); }}
                            className="flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-semibold px-2 py-1 rounded-md hover:bg-amber-100 whitespace-nowrap">
                            <ArrowDownCircle size={11} /> استخدام
                          </button>
                          <button onClick={() => openEdit(item)} className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"><Edit2 size={13} /></button>
                          {confirmDelete === item.id ? (
                            <>
                              <button onClick={() => { deleteInventoryItem(item.id); setConfirmDelete(null); }} className="px-2 py-1 bg-red-500 text-white rounded-md text-[10px] font-semibold">حذف</button>
                              <button onClick={() => setConfirmDelete(null)} className="px-2 py-1 border border-border rounded-md text-[10px] text-muted-foreground hover:bg-muted">إلغاء</button>
                            </>
                          ) : (
                            <button onClick={() => setConfirmDelete(item.id)} className="p-1.5 text-muted-foreground hover:text-red-500 rounded-md hover:bg-muted"><Trash2 size={13} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground"><Boxes size={28} className="mx-auto mb-2 opacity-30" /><p className="text-xs">لا توجد أصناف</p></div>}
          </div>
        </div>
      )}

      {tab === "riwayat" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">{stockHistory.length}</span> حركة مخزون مسجلة</p>
            <button onClick={() => { const rows = [["التاريخ","الوقت","SKU","الاسم","النوع","الكمية","الوحدة","الملاحظة","الرصيد"],...stockHistory.map((h) => [h.date,h.time,h.sku,h.name,h.type,String(h.qty),h.unit,h.keterangan,String(h.saldo)])]; downloadCSV(rows,"سجل-مخزون.csv"); }}
              className="flex items-center gap-1.5 border border-border rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"><Download size={12} /> تصدير</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-border bg-muted/40">
                {["التاريخ","SKU","اسم الصنف","النوع","الكمية","الملاحظة","الرصيد"].map((h) => <th key={h} className="text-right px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">{h}</th>)}
              </tr></thead>
              <tbody>
                {stockHistory.map((h) => (
                  <tr key={h.id} className="border-b border-border/60 hover:bg-muted/20">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{h.date}، {h.time}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{h.sku}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{h.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${h.type==="masuk"?"bg-emerald-50 text-emerald-700 border-emerald-200":"bg-red-50 text-red-600 border-red-200"}`}>
                        {h.type==="masuk"?<ArrowDownCircle size={11} />:<ArrowUpCircle size={11} />}{h.type==="masuk"?"وارد":"صادر"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold" dir="ltr" style={{ fontFamily: "'IBM Plex Mono', monospace", color: h.type==="masuk"?"#059669":"#DC2626" }}>
                      {h.type==="masuk"?"+":"−"}{h.qty} {h.unit}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{h.keterangan}</td>
                    <td className="px-4 py-3 font-semibold text-foreground" dir="ltr" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{h.saldo} {h.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showRestock && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowRestock(null)}>
          <div className="bg-card rounded-xl border border-border p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>إعادة تخزين</h2>
              <button onClick={() => setShowRestock(null)}><X size={16} className="text-muted-foreground" /></button>
            </div>
            <div className="bg-muted/40 rounded-lg p-3 mb-4 text-xs">
              <p className="font-semibold text-foreground">{showRestock.name}</p>
              <p className="text-muted-foreground mt-0.5">SKU: {showRestock.sku} · المخزون: <span className={`font-bold ${showRestock.stock<=showRestock.minStock?"text-red-600":"text-foreground"}`} dir="ltr">{showRestock.stock} {showRestock.unit}</span></p>
            </div>
            <div className="space-y-3 mb-4">
              <div><label className="text-xs font-medium text-muted-foreground block mb-1">كمية الإضافة ({showRestock.unit})</label>
                <input type="number" value={mutQty} onChange={(e) => setMutQty(e.target.value)} placeholder="0" min={1}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background font-mono" />
                {mutQty && <p className="text-[10px] text-muted-foreground mt-1">المخزون بعد الإضافة: <span className="font-bold text-emerald-600" dir="ltr">{showRestock.stock + Number(mutQty)} {showRestock.unit}</span></p>}
              </div>
              <div><label className="text-xs font-medium text-muted-foreground block mb-1">ملاحظة</label>
                <input value={mutNote} onChange={(e) => setMutNote(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background" /></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowRestock(null)} className="flex-1 border border-border rounded-lg py-2 text-xs font-medium text-muted-foreground hover:bg-muted">إلغاء</button>
              <button onClick={() => { if (!mutQty) return; restockItem(showRestock.id, Number(mutQty), mutNote); setShowRestock(null); setMutQty(""); }}
                disabled={!mutQty} className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 text-xs font-semibold hover:bg-primary/90 disabled:opacity-40 flex items-center justify-center gap-1.5">
                <ArrowUpCircle size={13} /> حفظ الإضافة
              </button>
            </div>
          </div>
        </div>
      )}

      {showConsume && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowConsume(null)}>
          <div className="bg-card rounded-xl border border-border p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>تسجيل الاستخدام</h2>
              <button onClick={() => setShowConsume(null)}><X size={16} className="text-muted-foreground" /></button>
            </div>
            <div className="bg-muted/40 rounded-lg p-3 mb-4 text-xs">
              <p className="font-semibold text-foreground">{showConsume.name}</p>
              <p className="text-muted-foreground mt-0.5">المخزون المتاح: <span className="font-bold text-foreground" dir="ltr">{showConsume.stock} {showConsume.unit}</span></p>
            </div>
            <div className="space-y-3 mb-4">
              <div><label className="text-xs font-medium text-muted-foreground block mb-1">الكمية المستخدمة ({showConsume.unit})</label>
                <input type="number" value={mutQty} onChange={(e) => setMutQty(e.target.value)} placeholder="0" min={1} max={showConsume.stock}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background font-mono" />
                {mutQty && Number(mutQty) > 0 && Number(mutQty) <= showConsume.stock &&
                  <p className="text-[10px] text-muted-foreground mt-1">المتبقي بعد الاستخدام: <span className="font-bold text-amber-600" dir="ltr">{showConsume.stock - Number(mutQty)} {showConsume.unit}</span></p>}
                {mutQty && Number(mutQty) > showConsume.stock && <p className="text-[10px] text-red-500 mt-1">يتجاوز المخزون المتاح!</p>}
              </div>
              <div><label className="text-xs font-medium text-muted-foreground block mb-1">ملاحظة</label>
                <input value={mutNote} onChange={(e) => setMutNote(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background" /></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowConsume(null)} className="flex-1 border border-border rounded-lg py-2 text-xs font-medium text-muted-foreground hover:bg-muted">إلغاء</button>
              <button onClick={() => { if (!mutQty || Number(mutQty) > showConsume.stock) return; consumeItem(showConsume.id, Number(mutQty), mutNote); setShowConsume(null); setMutQty(""); }}
                disabled={!mutQty || Number(mutQty) > showConsume.stock} className="flex-1 bg-amber-500 text-white rounded-lg py-2 text-xs font-semibold hover:bg-amber-600 disabled:opacity-40 flex items-center justify-center gap-1.5">
                <ArrowDownCircle size={13} /> تسجيل الاستخدام
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-xl border border-border p-5 w-full max-w-sm max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>{editId ? "تعديل الصنف" : "إضافة صنف جديد"}</h2>
              <button onClick={() => setShowForm(false)}><X size={16} className="text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-muted-foreground block mb-1">اسم الصنف</label><input value={form.name} onChange={f("name")} placeholder="مسحوق غسيل فاخر" className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-medium text-muted-foreground block mb-1">الفئة</label>
                  <select value={form.category} onChange={f("category")} className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background">
                    {["مواد الغسيل","معطرات","تغليف","معدات"].map((c) => <option key={c}>{c}</option>)}
                  </select></div>
                <div><label className="text-xs font-medium text-muted-foreground block mb-1">الوحدة</label>
                  <select value={form.unit} onChange={f("unit")} className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background">
                    {["كجم","لتر","قطعة","لفة","وحدة","زوج","ورقة"].map((u) => <option key={u}>{u}</option>)}
                  </select></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-medium text-muted-foreground block mb-1">المخزون الابتدائي</label><input type="number" value={form.stock} onChange={f("stock")} placeholder="0" className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background" /></div>
                <div><label className="text-xs font-medium text-muted-foreground block mb-1">الحد الأدنى</label><input type="number" value={form.minStock} onChange={f("minStock")} placeholder="0" className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background" /></div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground block mb-1">سعر الوحدة (ج.م)</label><input type="number" value={form.price} onChange={f("price")} placeholder="0" className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background" /></div>
              <div><label className="text-xs font-medium text-muted-foreground block mb-1">المورد</label><input value={form.supplier} onChange={f("supplier")} placeholder="اسم المورد" className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background" /></div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-border rounded-lg py-2 text-xs font-medium text-muted-foreground hover:bg-muted">إلغاء</button>
              <button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 text-xs font-semibold hover:bg-primary/90 flex items-center justify-center gap-1.5"><Save size={12} /> حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── التقارير ───────────────────────────────────────────────────────────────

function LaporanView() {
  const { orders, customers, monthlyReport } = useApp();
  const [period, setPeriod] = useState<"bulan"|"tahun">("bulan");

  const months = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  const currentMonth = months[new Date().getMonth()];
  const currentYear = new Date().getFullYear();

  const currentMonthOrders = orders.filter((o) => o.date.includes(`${currentMonth} ${currentYear}`) && o.status !== "batal");
  const currentMonthRev = currentMonthOrders.reduce((a, o) => a + o.total, 0);

  const reportWithCurrent = [
    ...monthlyReport.filter((m) => m.month !== currentMonth),
    { month: currentMonth, pendapatan: currentMonthRev, order: currentMonthOrders.length, pelanggan: customers.length },
  ];

  const finalMonthlyReport = reportWithCurrent.length > 0 ? reportWithCurrent : [{ month: currentMonth, pendapatan: 0, order: 0, pelanggan: 0 }];
  const totalRev = finalMonthlyReport.reduce((a, m) => a + m.pendapatan, 0);
  const totalOrder = finalMonthlyReport.reduce((a, m) => a + m.order, 0);

  const CT = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((p: any) => <p key={p.dataKey} style={{ color: p.color }}>{p.name || p.dataKey}: <span className="font-medium">{p.dataKey === "pendapatan" ? formatRp(p.value) : p.value}</span></p>)}
      </div>
    );
  };

  function handleExport() {
    const rows = [["الشهر","الإيرادات","عدد الطلبات","عملاء جدد","متوسط/طلب"],
      ...finalMonthlyReport.map((m) => [m.month + " 2026", String(m.pendapatan), String(m.order), String(m.pelanggan), String(Math.round(m.order > 0 ? m.pendapatan/m.order : 0))])];
    downloadCSV(rows, "تقرير-دينور.csv");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-sm font-semibold" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>التقرير المالي</h2><p className="text-xs text-muted-foreground">ملخص أداء دينور لاندري</p></div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-card border border-border rounded-lg p-0.5">
            {(["bulan","tahun"] as const).map((p) => <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-md text-[11px] font-medium capitalize transition-all ${period===p?"bg-primary text-primary-foreground":"text-muted-foreground hover:text-foreground"}`}>{p==="bulan"?"شهري":"سنوي"}</button>)}
          </div>
          <button onClick={handleExport} className="flex items-center gap-1.5 border border-border rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground bg-card"><Download size={13} /> تصدير CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "إجمالي الإيرادات", value: formatRp(totalRev), sub: `حتى ${currentMonth} ${currentYear}`, color: "text-primary", bg: "bg-primary/10" },
          { label: "إجمالي الطلبات", value: totalOrder.toLocaleString("en-US"), sub: `حتى ${currentMonth} ${currentYear}`, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "متوسط الشهر", value: formatRp(finalMonthlyReport.length > 0 ? Math.round(totalRev/finalMonthlyReport.length) : 0), sub: `${finalMonthlyReport.length} أشهر`, color: "text-amber-600", bg: "bg-amber-50" },
          { label: `طلبات ${currentMonth}`, value: String(currentMonthOrders.length), sub: formatRp(currentMonthRev), color: "text-violet-600", bg: "bg-violet-50" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`} dir={_priceDir} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>الإيرادات الشهرية</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={finalMonthlyReport} margin={{ top: 5, right: 5, bottom: 0, left: 0 }} barSize={20}>
              <CartesianGrid key="lg" strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis key="lx" dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis key="ly" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000000}م`} width={36} />
              <Tooltip key="lt" content={<CT />} />
              <Bar key="lb" dataKey="pendapatan" fill="#0369A1" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>عدد الطلبات الشهرية</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={finalMonthlyReport} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid key="og" strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis key="ox" dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis key="oy" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} width={30} />
              <Tooltip key="ot" content={<CT />} />
              <Line key="ol" type="monotone" dataKey="order" stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: "#10B981", strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border"><h3 className="text-xs font-semibold" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>ملخص شهري</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-border bg-muted/40">
              {["الشهر","الإيرادات","عدد الطلبات","عملاء جدد","متوسط/طلب"].map((h) => <th key={h} className="text-right px-4 py-2.5 font-medium text-muted-foreground">{h}</th>)}
            </tr></thead>
            <tbody>
              {finalMonthlyReport.map((m) => (
                <tr key={m.month} className="border-b border-border/60 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{m.month} 2026</td>
                  <td className="px-4 py-3 font-semibold text-primary" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{formatRp(m.pendapatan)}</td>
                  <td className="px-4 py-3 text-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{m.order}</td>
                  <td className="px-4 py-3 text-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{m.pelanggan}</td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{m.order > 0 ? formatRp(Math.round(m.pendapatan/m.order)) : "-"}</td>
                </tr>
              ))}
              <tr className="bg-primary/5 font-bold border-t-2 border-primary/20">
                <td className="px-4 py-3 text-foreground">الإجمالي</td>
                <td className="px-4 py-3 text-primary" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{formatRp(totalRev)}</td>
                <td className="px-4 py-3 text-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{totalOrder}</td>
                <td className="px-4 py-3 text-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>—</td>
                <td className="px-4 py-3 text-muted-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{totalOrder > 0 ? formatRp(Math.round(totalRev/totalOrder)) : "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── الإعدادات ────────────────────────────────────────────────────────────

function PengaturanView() {
  const { currency, setCurrency, factoryReset } = useApp();
  const [activeTab, setActiveTab] = useState("toko");
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tokoForm, setTokoForm] = useState({ nama: "دينور لاندري", slogan: "نظيف، سريع، موثوق", alamat: "شارع بوغور الرئيسي رقم 88، جاكرتا الشرقية", telp: "021-1234-5678", wa: "0812-3456-7890", jamBuka: "07:00 – 21:00", hariBuka: "الاثنين – الأحد" });
  const [akunForm, setAkunForm] = useState({ nama: "مدير دينور", username: "admin_denur", email: "admin@denurlaundry.com", hp: "0812-3456-7890" });
  const [pajak, setPajak] = useState("1");
  const [autoprint, setAutoprint] = useState(true);
  const [footerStruk, setFooterStruk] = useState("شكراً لاستخدامك خدمات دينور لاندري. تواصل معنا على 0812-3456-7890.");
  const [payments, setPayments] = useState([
    { id: "tunai", label: "نقدي", desc: "الدفع مباشرة عند الكاشير", active: true },
    { id: "bca", label: "تحويل بنكي (BCA)", desc: "رقم الحساب: 123-456-7890 باسم دينور لاندري", active: true },
    { id: "mandiri", label: "تحويل بنكي (Mandiri)", desc: "رقم الحساب: 098-765-4321 باسم دينور لاندري", active: true },
    { id: "qris", label: "QRIS", desc: "مسح رمز QR لجميع المحافظ الرقمية", active: true },
    { id: "ovo", label: "OVO / GoPay", desc: "الدفع عبر المحفظة الرقمية", active: false },
  ]);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const tabs = [
    { id: "toko", label: "معلومات المتجر", icon: Store },
    { id: "akun", label: "الحساب", icon: User },
    { id: "pembayaran", label: "الدفع", icon: CreditCard },
    { id: "printer", label: "الطابعة", icon: Printer },
    { id: "keamanan", label: "الأمان", icon: Shield },
    { id: "system", label: "النظام", icon: RefreshCw },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div className="bg-card border border-border rounded-xl p-2 h-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${activeTab===id?"bg-primary/10 text-primary":"text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      <div className="lg:col-span-3 bg-card border border-border rounded-xl p-5">
        {activeTab === "toko" && (
          <div>
            <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>معلومات المتجر</h2>
            <div className="space-y-3">
              {([["اسم المتجر","nama"],["الشعار","slogan"],["العنوان","alamat"],["رقم الهاتف","telp"],["واتساب","wa"],["ساعات العمل","jamBuka"],["أيام العمل","hariBuka"]] as const).map(([label,key]) => (
                <div key={key}><label className="text-xs font-medium text-muted-foreground block mb-1">{label}</label>
                  <input value={tokoForm[key]} onChange={(e) => setTokoForm((p) => ({...p,[key]:e.target.value}))} className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background" /></div>
              ))}
            </div>
          </div>
        )}
        {activeTab === "akun" && (
          <div>
            <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>إدارة الحساب</h2>
            <div className="flex items-center gap-3 mb-5 p-3 bg-muted/40 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">د</div>
              <div><p className="text-sm font-semibold text-foreground">{akunForm.nama}</p><p className="text-xs text-muted-foreground">كاشير رئيسي · {akunForm.email}</p></div>
              <button className="ml-auto border border-border rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted">تغيير الصورة</button>
            </div>
            <div className="space-y-3">
              {([["الاسم الكامل","nama"],["اسم المستخدم","username"],["البريد الإلكتروني","email"],["رقم الهاتف","hp"]] as const).map(([label,key]) => (
                <div key={key}><label className="text-xs font-medium text-muted-foreground block mb-1">{label}</label>
                  <input value={akunForm[key]} onChange={(e) => setAkunForm((p) => ({...p,[key]:e.target.value}))} className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background" /></div>
              ))}
            </div>
          </div>
        )}
        {activeTab === "pembayaran" && (
          <div>
            <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>طرق الدفع</h2>
            <div className="space-y-3 mb-4">
              {payments.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0"><CreditCard size={14} className="text-muted-foreground" /></div>
                  <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-foreground">{m.label}</p><p className="text-[10px] text-muted-foreground truncate">{m.desc}</p></div>
                  <button onClick={() => setPayments((p) => p.map((x) => x.id===m.id?{...x,active:!x.active}:x))}
                    className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${m.active?"bg-primary":"bg-muted-foreground/30"}`}>
                    <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: m.active?"calc(100% - 18px)":"2px" }} />
                  </button>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 mt-2">
              <p className="text-xs font-semibold text-foreground mb-2">وحدة العملة</p>
              <p className="text-[11px] text-muted-foreground mb-3">تحدد الرمز الذي يظهر بجانب جميع المبالغ في النظام.</p>
              <div className="flex gap-2">
                {(["ج.م", "EGP"] as const).map((sym) => (
                  <button key={sym} onClick={() => setCurrency(sym)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-semibold transition-all ${currency === sym ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
                    <span className="text-base leading-none" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{sym}</span>
                    <span className="font-normal text-[11px]">{sym === "ج.م" ? "جنيه مصري (عربي)" : "Egyptian Pound (EGP)"}</span>
                  </button>
                ))}
              </div>
              {currency && (
                <p className="text-[11px] text-muted-foreground mt-2">مثال: <span dir={_priceDir} className="font-semibold text-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>1,250 {currency}</span></p>
              )}
            </div>
            <div className="mt-4"><label className="text-xs font-medium text-muted-foreground block mb-1">الضريبة (%)</label>
              <input type="number" value={pajak} onChange={(e) => setPajak(e.target.value)} className="w-32 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background" /></div>
          </div>
        )}
        {activeTab === "printer" && (
          <div>
            <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>إعدادات الطابعة</h2>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 mb-4 text-xs text-amber-700">
              <AlertCircle size={14} className="mt-0.5 shrink-0" /><span>تأكد من توصيل الطابعة قبل حفظ الإعدادات.</span>
            </div>
            <div className="space-y-3">
              {[["اسم الطابعة","Epson TM-T82"],["المنفذ","USB001"],["عرض الورق","58mm"]].map(([label,val]) => (
                <div key={label as string}><label className="text-xs font-medium text-muted-foreground block mb-1">{label as string}</label>
                  <input defaultValue={val as string} className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background" /></div>
              ))}
              <div><label className="text-xs font-medium text-muted-foreground block mb-1">طباعة تلقائية بعد كل معاملة</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setAutoprint((p) => !p)} className={`relative w-9 h-5 rounded-full transition-colors ${autoprint?"bg-primary":"bg-muted-foreground/30"}`}>
                    <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow" style={{ left: autoprint?"calc(100% - 18px)":"2px" }} />
                  </button>
                  <span className="text-xs text-muted-foreground">{autoprint?"مفعل":"معطل"}</span>
                </div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground block mb-1">تذييل الإيصال</label>
                <textarea value={footerStruk} onChange={(e) => setFooterStruk(e.target.value)} rows={3} className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background resize-none" /></div>
            </div>
          </div>
        )}
        {activeTab === "keamanan" && (
          <div>
            <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>أمان الحساب</h2>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-700 mb-4">
              <CheckCircle size={14} className="shrink-0" /><span>حسابك آمن.</span>
            </div>
            <div className="space-y-4">
              <div><h3 className="text-xs font-semibold mb-2">تغيير كلمة المرور</h3>
                <div className="space-y-2">
                  {["كلمة المرور الحالية","كلمة المرور الجديدة","تأكيد كلمة المرور الجديدة"].map((l) => (
                    <div key={l}><label className="text-xs font-medium text-muted-foreground block mb-1">{l}</label>
                      <input type="password" placeholder="••••••••" className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background" /></div>
                  ))}
                </div>
              </div>
              <div><h3 className="text-xs font-semibold mb-1">رمز PIN للكاشير</h3>
                <p className="text-[11px] text-muted-foreground mb-2">رمز PIN مكون من 6 أرقام للوصول السريع.</p>
                <div className="flex gap-2">{[...Array(6)].map((_,i) => <input key={i} type="password" maxLength={1} className="w-8 h-8 border border-border rounded-lg text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background" />)}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "system" && (
          <div>
            <h2 className="text-sm font-bold mb-1" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>النظام</h2>
            <p className="text-[11px] text-muted-foreground mb-5">إدارة بيانات النظام وضبط المصنع.</p>

            <div className="border border-red-200 rounded-xl p-4 bg-red-50/60">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                  <RefreshCw size={16} className="text-red-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-700 mb-0.5">ضبط المصنع</p>
                  <p className="text-[11px] text-red-600 leading-relaxed">
                    يحذف هذا الإجراء جميع الطلبات، سجل المخزون، ومعاملات الخزينة بشكل نهائي. تبقى الخدمات والمخزون والإعدادات كما هي. لا يمكن التراجع عن هذا الإجراء.
                  </p>
                </div>
              </div>

              {!resetConfirm ? (
                <button
                  onClick={() => setResetConfirm(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  <RefreshCw size={13} /> ضبط المصنع
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-red-700">هل أنت متأكد؟ سيتم حذف جميع البيانات التشغيلية نهائياً.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        factoryReset();
                        setResetConfirm(false);
                        setResetDone(true);
                        setTimeout(() => setResetDone(false), 3000);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      <RefreshCw size={13} /> نعم، امسح كل شيء
                    </button>
                    <button
                      onClick={() => setResetConfirm(false)}
                      className="px-4 py-2 border border-border rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {resetDone && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                  <CheckCircle size={13} /> تم ضبط المصنع بنجاح. النظام الآن نظيف.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab !== "system" && (
        <div className="mt-5 flex items-center gap-3 pt-4 border-t border-border">
          <button onClick={handleSave} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${saved?"bg-emerald-500 text-white":"bg-primary text-primary-foreground hover:bg-primary/90"}`}>
            {saved ? <><CheckCircle size={13} /> تم الحفظ!</> : <><Save size={13} /> حفظ التغييرات</>}
          </button>
          <button className="px-4 py-2 border border-border rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted">إعادة تعيين</button>
        </div>
        )}
      </div>
    </div>
  );
}


// ─── إدارة الخزينة ──────────────────────────────────────────────────────────

function KhazinehView() {
  const { currency, treasury, addTreasuryEntry } = useApp();
  const transactions = treasury;
  const [showModal, setShowModal] = useState<"إيداع" | "سحب" | null>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const totalDeposits = transactions.filter((t) => t.type === "إيداع").reduce((a, t) => a + t.amount, 0);
  const totalWithdrawals = transactions.filter((t) => t.type === "سحب").reduce((a, t) => a + t.amount, 0);
  const balance = totalDeposits - totalWithdrawals;

  function handleAdd() {
    if (!amount || Number(amount) <= 0) return;
    const stamp = nowStamp();
    addTreasuryEntry({
      date: stamp.date, time: stamp.time,
      type: showModal!, amount: Number(amount),
      employee: "مدير دينور",
      reason: reason || (showModal === "إيداع" ? "إيداع نقدية" : "سحب نقدية"),
    });
    setShowModal(null); setAmount(""); setReason("");
  }

  return (
    <div className="space-y-5">
      {/* Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">إجمالي النقدية بالخزينة</p>
            <p className="text-4xl font-bold text-foreground mt-2 leading-none" dir={_priceDir} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {balance.toLocaleString("en-US")} {currency}
            </p>
            <p className="text-xs text-muted-foreground mt-2">{transactions.length} حركة مسجلة</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <p className="text-[10px] text-emerald-600 font-medium">إجمالي الإيداعات</p>
              <p className="text-base font-bold text-emerald-700 mt-0.5" dir={_priceDir} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>+{totalDeposits.toLocaleString("en-US")} {currency}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-[10px] text-red-600 font-medium">إجمالي السحوبات</p>
              <p className="text-base font-bold text-red-700 mt-0.5" dir={_priceDir} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>-{totalWithdrawals.toLocaleString("en-US")} {currency}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={() => { setShowModal("إيداع"); setAmount(""); setReason(""); }}
            className="flex-1 bg-emerald-500 text-white rounded-xl p-5 flex items-center justify-center gap-3 hover:bg-emerald-600 active:scale-[0.98] transition-all font-semibold text-sm shadow-sm">
            <Plus size={20} /> إيداع نقدية (+)
          </button>
          <button onClick={() => { setShowModal("سحب"); setAmount(""); setReason(""); }}
            className="flex-1 bg-red-500 text-white rounded-xl p-5 flex items-center justify-center gap-3 hover:bg-red-600 active:scale-[0.98] transition-all font-semibold text-sm shadow-sm">
            <Minus size={20} /> سحب نقدية (-)
          </button>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>سجل حركات الخزينة</h2>
          <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">{transactions.length}</span> حركة</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["التاريخ والوقت", "نوع الحركة", "المبلغ", "الموظف", "السبب / الملاحظات"].map((h) => (
                  <th key={h} className="text-right px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-border/60 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{t.date}، {t.time}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${t.type === "إيداع" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                      {t.type === "إيداع" ? <ArrowDownCircle size={11} /> : <ArrowUpCircle size={11} />}
                      {t.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold" dir={_priceDir} style={{ fontFamily: "'IBM Plex Mono', monospace", color: t.type === "إيداع" ? "#059669" : "#DC2626" }}>
                    {t.type === "إيداع" ? "+" : "−"}{t.amount.toLocaleString("en-US")} {currency}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{t.employee}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Banknote size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">لا توجد حركات مسجلة</p>
            </div>
          )}
        </div>
      </div>

      {/* Deposit / Withdraw Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(null)}>
          <div className="bg-card rounded-xl border border-border p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${showModal === "إيداع" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                  {showModal === "إيداع" ? <Plus size={16} /> : <Minus size={16} />}
                </div>
                <h2 className="text-sm font-bold" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
                  {showModal === "إيداع" ? "إيداع نقدية" : "سحب نقدية"}
                </h2>
              </div>
              <button onClick={() => setShowModal(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">المبلغ ({currency})</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" min="0"
                  dir="ltr" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background" style={{ fontFamily: "'IBM Plex Mono', monospace" }} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">السبب / الملاحظة</label>
                <input value={reason} onChange={(e) => setReason(e.target.value)}
                  placeholder={showModal === "إيداع" ? "إيرادات الكاشير..." : "مصاريف تشغيل..."}
                  className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowModal(null)} className="flex-1 border border-border rounded-lg py-2 text-xs font-medium text-muted-foreground hover:bg-muted">إلغاء</button>
              <button onClick={handleAdd} disabled={!amount || Number(amount) <= 0}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5 ${showModal === "إيداع" ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}>
                {showModal === "إيداع" ? <><Plus size={12} /> تأكيد الإيداع</> : <><Minus size={12} /> تأكيد السحب</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── App Shell ─────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "لوحة التحكم" },
  { icon: ShoppingCart, label: "معاملة جديدة" },
  { icon: ClipboardList, label: "قائمة الطلبات" },
  { icon: Users, label: "العملاء" },
  { icon: Package, label: "الخدمات" },
  { icon: Boxes, label: "المخزون" },
  { icon: Landmark, label: "إدارة الخزينة" },
  { icon: BarChart3, label: "التقارير" },
  { icon: Settings, label: "الإعدادات" },
];

const _nowHeader = new Date();
const _daysAr = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
const _monthsAr = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
const _todayLabel = `${_daysAr[_nowHeader.getDay()]}، ${_nowHeader.getDate()} ${_monthsAr[_nowHeader.getMonth()]} ${_nowHeader.getFullYear()}`;

const PAGE_HEADERS: Record<string, { title: string; sub: string }> = {
  "لوحة التحكم":  { title: "لوحة التحكم",       sub: _todayLabel },
  "معاملة جديدة": { title: "معاملة جديدة",       sub: "إدخال طلب جديد" },
  "قائمة الطلبات":{ title: "قائمة الطلبات",      sub: "إدارة جميع الطلبات" },
  "العملاء":      { title: "العملاء",             sub: "إدارة بيانات العملاء" },
  "الخدمات":      { title: "الخدمات",             sub: "إدارة الأسعار والخدمات" },
  "المخزون":        { title: "المخزون",             sub: "إدارة المخزون والمواد الخام" },
  "إدارة الخزينة": { title: "إدارة الخزينة",       sub: "متابعة النقدية والحركات المالية" },
  "التقارير":      { title: "التقارير",            sub: "تحليل مالي وأداء" },
  "الإعدادات":     { title: "الإعدادات",           sub: "تكوين نظام الكاشير" },
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

function AppShell() {
  const { activeNav, setActiveNav, currency } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  _currency = currency;
  _priceDir = currency === "EGP" ? "ltr" : "rtl";

  const header = PAGE_HEADERS[activeNav];

  return (
    <>
      <div dir="rtl" className="flex h-screen bg-background overflow-hidden" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
        <aside className={`flex flex-col bg-sidebar transition-all duration-300 ${sidebarOpen ? "w-56" : "w-16"} shrink-0 border-l border-sidebar-border`}>
          <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0"><Sparkles size={16} className="text-white" /></div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-white font-bold text-sm leading-tight" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>دينور</p>
                <p className="text-sidebar-foreground text-[10px] leading-none">نظام المغسلة</p>
              </div>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mr-auto text-sidebar-foreground hover:text-white">
              {sidebarOpen ? <X size={14} /> : <Menu size={14} />}
            </button>
          </div>
          <nav className="flex-1 py-4 px-2 flex flex-col gap-0.5 overflow-y-auto">
            {NAV_ITEMS.map(({ icon: Icon, label }) => (
              <button key={label} onClick={() => setActiveNav(label)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all w-full text-right ${activeNav===label?"bg-sidebar-accent text-sidebar-accent-foreground font-medium":"text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"}`}>
                <Icon size={16} className="shrink-0" />
                {sidebarOpen && <span className="truncate">{label}</span>}
              </button>
            ))}
          </nav>
          <div className={`border-t border-sidebar-border px-3 py-3 flex items-center gap-2.5 ${!sidebarOpen && "justify-center"}`}>
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0"><span className="text-white text-[10px] font-bold">DL</span></div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-white text-xs font-medium truncate">مدير دينور</p>
                <p className="text-sidebar-foreground text-[10px] truncate">كاشير رئيسي</p>
              </div>
            )}
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-14 bg-card border-b border-border flex items-center gap-4 px-5 shrink-0">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{header.sub}</p>
              <h1 className="text-sm font-semibold text-foreground leading-tight" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>{header.title}</h1>
            </div>
            <div className="relative hidden md:block">
              <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="ابحث عن طلب أو عميل..." className="bg-muted-foreground/5 border border-border rounded-lg pr-8 pl-4 py-1.5 text-xs w-56 focus:outline-none focus:ring-2 focus:ring-primary/30 transition" />
            </div>
            <button onClick={() => setActiveNav("معاملة جديدة")} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary/90">
              <Plus size={13} /> طلب جديد
            </button>
          </header>

          <main className="flex-1 overflow-y-auto p-5">
            {activeNav === "لوحة التحكم"   && <DashboardView />}
            {activeNav === "معاملة جديدة"  && <TransaksiBaru />}
            {activeNav === "قائمة الطلبات" && <DaftarOrder />}
            {activeNav === "العملاء"        && <PelangganView />}
            {activeNav === "الخدمات"        && <LayananView />}
            {activeNav === "المخزون"        && <InventoryView />}
            {activeNav === "إدارة الخزينة"  && <KhazinehView />}
            {activeNav === "التقارير"       && <LaporanView />}
            {activeNav === "الإعدادات"      && <PengaturanView />}
          </main>
        </div>
      </div>
    </>
  );
}
