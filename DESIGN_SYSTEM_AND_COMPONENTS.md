# DESIGN SYSTEM & COMPONENT SPECIFICATION
## دينور لاندري — Laundry POS System
### Optimized for Cursor AI / Figma Make Ingestion

> **Stack:** React 18 + TypeScript · Tailwind CSS v4 · Recharts · lucide-react  
> **Direction:** RTL-first (`dir="rtl"` on root) · Arabic UI · `ج.م` / `EGP` currency  
> **Base font-size:** `14px` (all rem values relative to this)

---

## TABLE OF CONTENTS

1. [Global Design Tokens](#1-global-design-tokens)
2. [Typography System](#2-typography-system)
3. [Spacing & Layout Grid](#3-spacing--layout-grid)
4. [Localization & RTL Rules](#4-localization--rtl-rules)
5. [System Architecture & Workflow Logic](#5-system-architecture--workflow-logic)
6. [Navigation & Route Map](#6-navigation--route-map)
7. [Shared/Atomic Components](#7-sharedatomic-components)
8. [Page: لوحة التحكم — Dashboard](#8-page-لوحة-التحكم--dashboard)
9. [Page: معاملة جديدة — POS / New Transaction](#9-page-معاملة-جديدة--pos--new-transaction)
10. [Page: قائمة الطلبات — Order List](#10-page-قائمة-الطلبات--order-list)
11. [Page: العملاء — Customers](#11-page-العملاء--customers)
12. [Page: الخدمات — Services](#12-page-الخدمات--services)
13. [Page: المخزون — Inventory](#13-page-المخزون--inventory)
14. [Page: إدارة الخزينة — Treasury](#14-page-إدارة-الخزينة--treasury)
15. [Page: التقارير — Reports](#15-page-التقارير--reports)
16. [Page: الإعدادات — Settings](#16-page-الإعدادات--settings)
17. [App Shell: Sidebar + Header](#17-app-shell-sidebar--header)
18. [Data Models & Status Enums](#18-data-models--status-enums)
19. [Verbatim Arabic String Catalog](#19-verbatim-arabic-string-catalog)

---

## 1. GLOBAL DESIGN TOKENS

### 1.1 Semantic Color Palette

All values come from `src/styles/theme.css`. Tailwind v4 maps these via `@theme inline`.

#### Surface & Background
| Token (CSS var) | Tailwind class | Light `#hex` | Dark `#hex` | Semantic role |
|---|---|---|---|---|
| `--background` | `bg-background` | `#EEF2F7` | `#0A1628` | App canvas / page bg |
| `--card` | `bg-card` | `#FFFFFF` | `#0F1E35` | Panel, card, modal surface |
| `--popover` | `bg-popover` | `#FFFFFF` | `#0F1E35` | Dropdown / tooltip bg |
| `--muted` | `bg-muted` | `#E8EDF4` | `#162035` | Chip bg, table header bg |
| `--input-background` | `bg-input-background` | `#F1F5FB` | _(not set)_ | Form input fill |

#### Text / Foreground
| Token | Tailwind class | Light | Dark | Semantic role |
|---|---|---|---|---|
| `--foreground` | `text-foreground` | `#0F1B2D` | `#E2E8F0` | Primary body text |
| `--card-foreground` | `text-card-foreground` | `#0F1B2D` | `#E2E8F0` | Text on cards |
| `--muted-foreground` | `text-muted-foreground` | `#64748B` | `#64748B` | Secondary/placeholder text |

#### Brand / Interactive
| Token | Tailwind class | Light | Dark | Semantic role |
|---|---|---|---|---|
| `--primary` | `bg-primary` / `text-primary` | `#0369A1` | `#0EA5E9` | CTA buttons, links, active nav |
| `--primary-foreground` | `text-primary-foreground` | `#FFFFFF` | `#FFFFFF` | Text on primary bg |
| `--secondary` | `bg-secondary` | `#E0EEF8` | `#1E3A5F` | Pill backgrounds, selected item bg |
| `--secondary-foreground` | `text-secondary-foreground` | `#0369A1` | `#BAE6FD` | Text on secondary bg |
| `--accent` | `bg-accent` | `#0EA5E9` | `#0369A1` | Highlight, icon accent |
| `--ring` | `ring` | `#0369A1` | `#0EA5E9` | Focus ring on inputs |

#### Semantic Status Colors
| Variable/class | Hex | Role |
|---|---|---|
| `--destructive` / `bg-destructive` | `#DC2626` (light) / `#EF4444` (dark) | Delete, cancel, error |
| `bg-emerald-500` / `text-emerald-600` | `#10B981` / `#059669` | Success, completed, stock-in, treasury deposit |
| `bg-amber-500` / `text-amber-600` | `#F59E0B` | Warning, pending, in-progress |
| `bg-sky-50` / `text-sky-700` | badge processing | Processing/washing status |
| `bg-red-500` / `text-red-600` | `#EF4444` / `#DC2626` | Error, low-stock, treasury withdrawal |
| `bg-violet-50` / `text-violet-600` | purple tones | Customer stats accent |

#### Status Badge Color Map
| Status (EN key) | Arabic label | Background | Text | Border |
|---|---|---|---|---|
| `selesai` | `مكتمل` | `bg-emerald-50` | `text-emerald-700` | `border-emerald-200` |
| `proses` | `جاري المعالجة` | `bg-sky-50` | `text-sky-700` | `border-sky-200` |
| `menunggu` | `في الانتظار` | `bg-amber-50` | `text-amber-700` | `border-amber-200` |
| `batal` | `ملغي` | `bg-red-50` | `text-red-600` | `border-red-200` |

#### Service / Category Brand Colors
| Service / Category | Hex | Tailwind approx |
|---|---|---|
| غسيل جاف / مواد الغسيل | `#0EA5E9` | `sky-400` |
| غسيل رطب | `#10B981` | `emerald-500` |
| كي | `#F59E0B` | `amber-400` |
| غسيل + كي / تغليف | `#8B5CF6` | `violet-500` |
| سريع | `#EF4444` | `red-500` |
| تنظيف كيميائي | `#6366F1` | `indigo-500` |
| أحذية | `#EC4899` | `pink-500` |
| معطرات | `#8B5CF6` | `violet-500` |
| معدات | `#10B981` | `emerald-500` |

#### Treasury Semantic Colors
| Concept | Color | Class |
|---|---|---|
| `treasury-deposit` (إيداع) | `#059669` | `text-emerald-700` / inline `color: "#059669"` |
| `treasury-withdrawal` (سحب) | `#DC2626` | `text-red-600` / inline `color: "#DC2626"` |
| `treasury-deposit-bg` | badge `bg-emerald-50 border-emerald-200` | — |
| `treasury-withdrawal-bg` | badge `bg-red-50 border-red-200` | — |

#### Stock Movement Colors
| Concept | Color |
|---|---|
| `stock-in` (وارد / masuk) | `#059669` (emerald) |
| `stock-out` (صادر / keluar) | `#DC2626` (red) |

#### Sidebar Tokens
| Token | Light | Dark |
|---|---|---|
| `--sidebar` (bg) | `#0F1B2D` | `#070F1C` |
| `--sidebar-foreground` | `#CBD5E1` | `#94A3B8` |
| `--sidebar-primary` | `#0EA5E9` | `#0EA5E9` |
| `--sidebar-accent` | `#1E3A5F` | `#0F1E35` |
| `--sidebar-accent-foreground` | `#F1F5F9` | `#E2E8F0` |
| `--sidebar-border` | `rgba(255,255,255,0.06)` | `rgba(255,255,255,0.05)` |

#### Chart Palette
| Token | Hex | Usage |
|---|---|---|
| `--chart-1` | `#0EA5E9` | Revenue area / bar |
| `--chart-2` | `#10B981` | Transaction line |
| `--chart-3` | `#F59E0B` | Amber series |
| `--chart-4` | `#8B5CF6` | Violet series |
| `--chart-5` | `#EF4444` | Red series |

#### Border & Elevation
| Token | Value |
|---|---|
| `--border` | `rgba(15,27,45,0.08)` light / `rgba(255,255,255,0.07)` dark |
| `border-border` | applied to cards, table rows, inputs |
| `border-border/50` | lighter dividers |
| `border-border/60` | table row separators |
| `shadow-sm` | button hover, modal surface |
| `shadow-md` | card hover state |
| `shadow-lg` | dropdown, popover, modal |

---

## 2. TYPOGRAPHY SYSTEM

### 2.1 Font Stack

```css
/* src/styles/fonts.css */
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Tajawal:wght@300;400;500;700&family=DM+Mono:wght@400;500&display=swap');
```

| Font | Weights | Role |
|---|---|---|
| **Cairo** | 400, 500, 600, 700, 800 | Headings, section titles, modal titles, page title in header, sidebar brand |
| **Tajawal** | 300, 400, 500, 700 | Body text, labels, nav items, table content, form inputs (root font) |
| **DM Mono** | 400, 500 | Monetary values, order IDs (DNR-xxxx), SKU codes, numeric stats, percentages, date/time stamps |

### 2.2 Application Hierarchy

```
Root div:   fontFamily: "'Tajawal', sans-serif"   ← applies to all body text
Headings:   fontFamily: "'Cairo', sans-serif"       ← applied inline on h1/h2/h3 elements
Numbers:    fontFamily: "'DM Mono', monospace"      ← applied inline on price/ID spans
```

### 2.3 Type Scale

| Level | Element | Font | Size (Tailwind) | Weight | Line-height | Usage |
|---|---|---|---|---|---|---|
| **Display** | balance in treasury | DM Mono | `text-4xl` | `font-bold` | `leading-none` | Live balance card |
| **H1** | page header title | Cairo | `text-sm` (14px) | `font-semibold` | `1.5` | Main header h1 (compact) |
| **H2** | section title | Cairo | `text-sm` (14px) | `font-semibold` | `1.5` | Card headers, view titles |
| **H3** | sub-section | Cairo | `text-xs` (12px) | `font-semibold` | `1.5` | Table section headers |
| **Stat Value** | KPI numbers | DM Mono | `text-2xl` / `text-xl` | `font-bold` | `leading-none` | Dashboard/inventory stat cards |
| **Body** | table content, labels | Tajawal | `text-xs` (12px) | `font-medium` or `400` | `1.5` | Most UI text |
| **Small** | secondary text | Tajawal | `text-[11px]` | `font-medium` | `1.5` | Badges, chips, metadata |
| **Caption** | micro labels | Tajawal | `text-[10px]` | `font-medium` | `1.5` | Icon labels, sub-labels |
| **Mono value** | prices, IDs | DM Mono | `text-xs`–`text-sm` | `font-semibold`/`bold` | `1.5` | All monetary + code values |

### 2.4 Application Rules

- **Section headings** (`h2`, modal titles, view headings): always `style={{ fontFamily: "'Cairo', sans-serif" }}`
- **All price displays** (`formatRp()`): always `style={{ fontFamily: "'DM Mono', monospace" }}`
- **Order IDs** (`DNR-xxxx`): always `style={{ fontFamily: "'DM Mono', monospace" }}`
- **SKU codes** (`BHN-001`, etc.): `className="font-mono"` or `style={{ fontFamily: "'DM Mono', monospace" }}`
- **Chart axis ticks**: `fontFamily: "'Tajawal', sans-serif"` for day labels, plain for numeric axes

---

## 3. SPACING & LAYOUT GRID

### 3.1 Border Radius Scale

| Token | Computed | Tailwind | Usage |
|---|---|---|---|
| `--radius-sm` | `0.25rem` (4px) | `rounded-sm` / `rounded` | Small elements, progress bars |
| `--radius-md` | `0.375rem` (6px) | `rounded-md` | Buttons, badges |
| `--radius-lg` | `0.5rem` (8px) | `rounded-lg` | Cards, inputs, modals |
| `--radius-xl` | `0.75rem` (12px) | `rounded-xl` | Main panels, large cards |
| `9999px` | full pill | `rounded-full` | Status badges, avatar circles, toggle switch |

### 3.2 Padding Scale (most frequent values)

| Tailwind | px | Usage |
|---|---|---|
| `p-2` | 8px | Compact chips, icon buttons |
| `p-2.5` | 10px | Service mini-cards, small card cells |
| `p-3` | 12px | Modal info boxes, list items |
| `p-4` | 16px | Standard card inner padding |
| `p-5` | 20px | Wide modal padding, profile cards |
| `p-6` | 24px | Receipt modal |
| `px-3 py-2` | 12/8px | Input fields, most table cells |
| `px-4 py-3` | 16/12px | Main table rows |
| `px-4 py-2.5` | 16/10px | Table header cells |
| `py-1.5` | 6px | Compact tab/filter pills |

### 3.3 Layout Grid Patterns

```
App Shell:
  sidebar (w-56 open / w-16 collapsed) | main flex-1
  sidebar: border-l border-sidebar-border (RTL: left edge)

Main Content (p-5 padding):
  Dashboard:    grid-cols-2 lg:grid-cols-4   (stat cards)
                grid-cols-1 lg:grid-cols-3   (chart + pie)
                grid-cols-1 lg:grid-cols-3   (order table + services)
  POS:          grid-cols-1 lg:grid-cols-5   (form 3 cols + cart 2 cols)
  Inventory:    grid-cols-2 lg:grid-cols-4   (stat cards)
  Reports:      grid-cols-2 lg:grid-cols-4   (stat cards)
                grid-cols-1 lg:grid-cols-2   (charts)
  Treasury:     grid-cols-1 lg:grid-cols-3   (balance + actions)
  Settings:     grid-cols-1 lg:grid-cols-4   (tab nav 1 col + content 3 cols)
  Customers:    grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
```

### 3.4 Gap Scale

| Class | px | Usage |
|---|---|---|
| `gap-1` | 4px | Tight icon + label |
| `gap-1.5` | 6px | Badge internals, trend row |
| `gap-2` | 8px | Input + icon pairs |
| `gap-3` | 12px | Form fields, stat card internals |
| `gap-4` | 16px | Card grid columns |
| `gap-5` | 20px | Section spacing between major blocks |

### 3.5 Header Height

```
Header:       h-14  (56px), bg-card, border-b border-border
Sidebar open: w-56  (224px)
Sidebar close:w-16  (64px)
```

---

## 4. LOCALIZATION & RTL RULES

### 4.1 Root Direction

```tsx
// App() — outermost container
<div dir="rtl" className="flex h-screen bg-background overflow-hidden"
     style={{ fontFamily: "'Tajawal', sans-serif" }}>
```

All child elements inherit RTL unless explicitly overridden.

### 4.2 `dir="ltr"` Override Rules

Apply `dir="ltr"` to ANY element containing:

| Content type | Elements |
|---|---|
| Monetary amounts (`formatRp()`) | `<p>`, `<td>`, `<span>` containing price |
| Percentages (`+12.4%`, `85%`) | `<span>` for trend values, chart legend |
| Order IDs (`DNR-xxxx`) | `<span>`, `<td>` |
| SKU codes (`BHN-001`) | `<td>` |
| Weight + unit (`3 كجم`) | `<td>` |
| Stock count + unit (`48 كجم`) | `<div>`, `<td>` |
| Treasury amounts (`+3,000 ج.م`) | `<td>` |
| Number inputs (price, qty) | `<input type="number">` |
| Duration (`⏱ يومان`) | `<p>` in service cards |
| Balance display | `<p>` in KhazinehView |

### 4.3 Currency Display Format

```
Format:  {number} {symbol}
Example: 15,000 ج.م   OR   15,000 EGP

formatRp() output:  "⁦" + n.toLocaleString("en-US") + " " + _currency + "⁩"
```

- `⁦` = U+2066 LTR Isolate — forces number+symbol to render LTR within RTL context
- `⁩` = U+2069 PDI (Pop Directional Isolate) — closes the isolate
- Narrow No-Break Space (U+202F) used between number and symbol
- `"en-US"` locale keeps Western/Arabic-Indic numerals as Western digits

**Currency symbols:**
- `"ج.م"` — Arabic abbreviation for جنيه مصري (default)
- `"EGP"` — Latin abbreviation

### 4.4 Abbreviated Large Values

```
≥ 1,000,000:  "{(n/1000000).toFixed(2)} مليون ج.م"   (stat card)
              "{(n/1000000).toFixed(1)}م"              (Y-axis tick)
< 1,000,000:  formatRp(n)
Abbreviated:  "{(n/1000).toFixed(0)}ك"                (customer card)
```

All abbreviated values must be in `dir="ltr"` containers.

### 4.5 Icon / Layout Mirroring in RTL

| Element | LTR behavior | RTL override applied |
|---|---|---|
| Search icon in inputs | `left-3`, `pl-8` | `right-3`, `pr-8` ✓ |
| Header search bar | `right-3`, `pr-8` | already RTL ✓ |
| ChevronRight icon | points right | points toward reading start (left in LTR view = end in RTL) |
| Sidebar `border-l` | RTL physical left = visual right edge | Correctly separates sidebar from content ✓ |
| Sidebar `mr-auto` on toggle | pushes to left (= far end in RTL) | ✓ |

### 4.6 Text Alignment Defaults

- All card bodies, table content: inherit RTL = right-aligned
- `.text-right` class applied explicitly on some containers for clarity
- Form inputs: default RTL → Arabic text starts from right edge
- `type="number"` inputs: `dir="ltr"` so digits enter from left

---

## 5. SYSTEM ARCHITECTURE & WORKFLOW LOGIC

### 5.1 Feature Modules

```
src/app/App.tsx (monolithic — all views in one file)

Views (function components):
  DashboardView    → لوحة التحكم
  TransaksiBaru    → معاملة جديدة  (POS / new order)
  DaftarOrder      → قائمة الطلبات (order management)
  PelangganView    → العملاء        (customer CRM)
  LayananView      → الخدمات        (services catalog)
  InventoryView    → المخزون        (inventory management)
  KhazinehView     → إدارة الخزينة  (treasury)
  LaporanView      → التقارير        (reports)
  PengaturanView   → الإعدادات      (settings)
```

### 5.2 State Architecture

All state is managed in `App()` and distributed via `AppContext`:

```typescript
AppContext provides:
  orders[]         ← CRUD via add/update/deleteOrder
  customers[]      ← CRUD via add/update/deleteCustomer
  services[]       ← CRUD via add/update/deleteService
  inventory[]      ← CRUD via add/update/deleteInventoryItem
  stockHistory[]   ← append via restockItem / consumeItem
  currency         ← "ج.م" | "EGP" (global setting)
  activeNav        ← current route string
  currentUser      ← AppUser (role: "admin" | "kasir")
```

`KhazinehView` maintains its own local `transactions[]` state (not in context).

### 5.3 POS Order Workflow

```
Step 1: FORM
  ├── Customer lookup (autocomplete from customers[])
  │     OR "زيارة مباشرة" (walk-in, no customer record)
  ├── Phone number input
  ├── Notes textarea
  └── Service selection grid (active services only)
        ├── Click service card → adds to cart (qty 1)
        ├── Click again → increments qty
        └── Cart sidebar: qty stepper (−/+), remove (×), per-item price

Step 2: PAYMENT (step = "payment")
  ├── Cart summary (items × qty × price)
  ├── Subtotal + Tax (1%) + Total
  ├── Payment method: نقدي | تحويل | QRIS
  └── If نقدي: cash received input → auto-calculates change/deficit

Step 3: RECEIPT (step = "receipt")
  ├── Success animation (CheckCircle)
  ├── Order # display (DNR-xxxx)
  ├── Receipt summary
  ├── Print button (window.print())
  └── "طلب جديد" → reset all state back to Step 1

Side effects on confirmPayment():
  ├── addOrder(data) → appends to orders[] with status "menunggu"
  ├── If existing customer → updateCustomer(totalOrders+1, totalSpend+total, lastOrder=today)
  └── If new customer name → addCustomer(new record)
```

### 5.4 Order Status Lifecycle

```
menunggu (في الانتظار)
    ↓ [تعيين قيد المعالجة]
proses (جاري المعالجة)
    ↓ [تعيين مكتمل]
selesai (مكتمل)

Any status ──→ batal (ملغي)  [via إلغاء button]
```

Status transitions available in `DaftarOrder` order detail view.

### 5.5 Inventory Flow

```
Stock In  (إعادة تخزين):
  restockItem(id, qty, note)
    → inventory[id].stock += qty
    → appends StockEntry { type: "masuk", qty, saldo: newStock }

Stock Out (تسجيل الاستخدام):
  consumeItem(id, qty, note)
    → inventory[id].stock = max(0, stock - qty)
    → appends StockEntry { type: "keluar", qty, saldo: newStock }

Low-stock alert: item.stock <= item.minStock
  → rendered as red pulsing dot + alert banner with clickable chip per low item
```

### 5.6 Treasury Flow

```
Initial balance: sum(INIT_TREASURY)
  = 3000 + 2000 − 350 + 800 = 5,450 ج.م

إيداع (Deposit):
  → TreasuryEntry { type: "إيداع", amount, employee, reason }
  → prepends to transactions[] (newest first)
  → live balance = Σ(deposits) − Σ(withdrawals)

سحب (Withdrawal):
  → TreasuryEntry { type: "سحب", amount, employee, reason }
  → same prepend pattern
```

---

## 6. NAVIGATION & ROUTE MAP

```typescript
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "لوحة التحكم"   },  // Dashboard
  { icon: ShoppingCart,    label: "معاملة جديدة"  },  // POS
  { icon: ClipboardList,   label: "قائمة الطلبات" },  // Orders
  { icon: Users,           label: "العملاء"        },  // Customers
  { icon: Package,         label: "الخدمات"        },  // Services
  { icon: Boxes,           label: "المخزون"        },  // Inventory
  { icon: Landmark,        label: "إدارة الخزينة"  },  // Treasury
  { icon: BarChart3,       label: "التقارير"       },  // Reports
  { icon: Settings,        label: "الإعدادات"      },  // Settings
];
```

Routing is state-based (`activeNav` string), not URL-based. All rendered in a single `<main>` with conditional rendering.

---

## 7. SHARED/ATOMIC COMPONENTS

### 7.1 `StatusBadge`
**File:** `src/app/components/StatusBadge.tsx` (currently inline in App.tsx)

```tsx
Props: { status: "menunggu" | "proses" | "selesai" | "batal" }

DOM:
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium {cls}">
    {icon}  {label}
  </span>

States:
  selesai  → cls: "bg-emerald-50 text-emerald-700 border border-emerald-200"  icon: <CheckCircle2 size={11} />
  proses   → cls: "bg-sky-50 text-sky-700 border border-sky-200"              icon: <Loader2 size={11} className="animate-spin" />
  menunggu → cls: "bg-amber-50 text-amber-700 border border-amber-200"        icon: <Clock size={11} />
  batal    → cls: "bg-red-50 text-red-600 border border-red-200"              icon: <XCircle size={11} />
```

### 7.2 `formatRp()` — Currency Formatter
**File:** helper in `App.tsx` (not a component)

```typescript
let _currency = "ج.م";  // module-level, updated from context each render

function formatRp(n: number): string {
  return "⁦" + n.toLocaleString("en-US") + " " + _currency + "⁩";
}
// Output examples: "⁦15,000 ج.م⁩"  /  "⁦15,000 EGP⁩"
// Always wrap output in dir="ltr" container
```

### 7.3 Stat Card (Dashboard / Inventory / Reports)

**Shared pattern** used in DashboardView, InventoryView, LaporanView:

```tsx
// Dashboard variant (with trend row)
<div className="bg-card rounded-xl border border-border p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
  <div className="flex items-start justify-between">
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-foreground mt-1 leading-none" dir="ltr">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center {accent}`}>
      <Icon size={18} className="text-white" />
    </div>
  </div>
  <div className="flex items-center gap-1.5">
    {trend icon}
    <span dir="ltr" className="text-xs font-semibold {trend color}">{trendVal}</span>
    <span className="text-xs text-muted-foreground">مقارنة بالأسبوع الماضي</span>
  </div>
</div>

Props:
  label:    string (Arabic)
  value:    string (number or formatted price)
  sub:      string | undefined
  trend:    "up" | "down" | "neutral"
  trendVal: string (e.g., "+12.4%")
  icon:     LucideIcon
  accent:   Tailwind bg class (e.g., "bg-primary", "bg-emerald-500")
```

### 7.4 Toggle Switch

```tsx
// Used for: service active/inactive, payment method enable/disable, autoprint
<button onClick={toggle}
  className={`relative w-9 h-5 rounded-full transition-colors ${active ? "bg-primary" : "bg-muted-foreground/30"}`}>
  <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
        style={{ left: active ? "calc(100% - 18px)" : "2px" }} />
</button>
```

Note: Physical `left` used for thumb position (not logical `start`) — works in RTL because button is self-contained.

### 7.5 Modal Shell

```tsx
// Overlay + centered card
<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
     onClick={() => closeModal()}>
  <div className="bg-card rounded-xl border border-border p-5 w-full max-w-sm"
       onClick={(e) => e.stopPropagation()}>
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>{title}</h2>
      <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
        <X size={16} />
      </button>
    </div>
    {/* Body */}
    {children}
    {/* Footer */}
    <div className="flex gap-2 mt-4">
      <button className="flex-1 border border-border rounded-lg py-2 text-xs font-medium text-muted-foreground hover:bg-muted">إلغاء</button>
      <button className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 text-xs font-semibold hover:bg-primary/90">حفظ</button>
    </div>
  </div>
</div>
```

### 7.6 Search Input (RTL-correct)

```tsx
<div className="relative">
  <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
  <input
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="ابحث..."
    className="w-full bg-card border border-border rounded-lg pr-8 pl-4 py-2 text-xs
               focus:outline-none focus:ring-2 focus:ring-primary/30"
  />
</div>
// icon at right-3 (RTL start) with pr-8 padding to avoid overlap
```

### 7.7 Form Input

```tsx
<div>
  <label className="text-xs font-medium text-muted-foreground block mb-1">{label}</label>
  <input
    type={type}
    value={value}
    onChange={handler}
    placeholder={placeholder}
    className="w-full border border-border rounded-lg px-3 py-2 text-xs
               focus:outline-none focus:ring-2 focus:ring-primary/30 bg-input-background"
  />
</div>
// For number/price inputs: add dir="ltr"
// For select: same classes, replace input with select
```

### 7.8 Table Shell

```tsx
<div className="bg-card border border-border rounded-xl overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b border-border bg-muted/40">
          {headers.map((h) => (
            <th key={h} className="text-right px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-b border-border/60 hover:bg-muted/30 transition-colors">
            {/* cells */}
          </tr>
        ))}
      </tbody>
    </table>
    {empty && <EmptyState />}
  </div>
</div>
```

### 7.9 Action Buttons (standard variants)

```tsx
// Primary CTA
<button className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-lg px-3 py-2 text-xs font-semibold hover:bg-primary/90 transition-colors">
  <Plus size={13} /> {label}
</button>

// Secondary / Ghost
<button className="flex items-center gap-1.5 border border-border bg-card rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
  <Download size={13} /> {label}
</button>

// Destructive
<button className="flex items-center gap-1.5 border border-red-200 text-red-500 rounded-lg py-2 text-xs font-medium hover:bg-red-50 transition-colors">
  <Trash2 size={12} /> {label}
</button>

// Confirm delete (two-step)
Step 1: show destructive button
Step 2: replace with "نعم، احذف" (bg-red-500 text-white) + "إلغاء" (border)
```

---

## 8. PAGE: لوحة التحكم — Dashboard

**File:** `DashboardView()` function in `App.tsx`  
**Suggested path:** `src/features/dashboard/DashboardView.tsx`

### 8.1 Component Tree

```
DashboardView
├── StatCardGrid  (grid-cols-2 lg:grid-cols-4, gap-4)
│   ├── StatCard: إيرادات اليوم      (accent: bg-primary)
│   ├── StatCard: إجمالي طلبات الشهر (accent: bg-emerald-500)
│   ├── StatCard: الطلبات النشطة     (accent: bg-amber-500)
│   └── StatCard: إجمالي العملاء     (accent: bg-violet-500)
│
├── ChartRow  (grid-cols-1 lg:grid-cols-3, gap-4)
│   ├── WeeklyTrendChart  (lg:col-span-2)
│   │   ├── ChartHeader: "الاتجاه الأسبوعي" + date range
│   │   ├── ToggleTabs: ["الإيرادات", "المعاملات"]
│   │   └── Recharts AreaChart (height=180)
│   │       ├── LinearGradient: gP (#0EA5E9) / gT (#10B981)
│   │       ├── CartesianGrid (vertical=false, strokeDasharray="3 3")
│   │       ├── XAxis: dataKey="day", fontSize=9, Tajawal, interval=0
│   │       ├── YAxis: tickFormatter (م / ك abbreviations), width=42
│   │       ├── Tooltip: CustomTooltip
│   │       └── Area: monotone, strokeWidth=2, dot=false
│   │
│   └── ServicePieChart
│       ├── Header: "توزيع الخدمات" + "بناءً على الطلبات النشطة"
│       ├── Recharts PieChart (height=160)
│       │   ├── Pie: innerRadius=45, outerRadius=68, paddingAngle=3
│       │   └── Cell[]: colors from serviceData
│       └── LegendList: colored dot + service name + percentage (DM Mono)
│
└── BottomRow  (grid-cols-1 lg:grid-cols-3, gap-4)
    ├── RecentOrdersTable  (lg:col-span-2)
    │   ├── Header: "أحدث الطلبات" + "عرض الكل" →  قائمة الطلبات
    │   └── Table (6 rows)
    │       columns: رقم الطلب | العميل | الخدمة | الإجمالي | الحالة
    │       رقم الطلب cell: DM Mono, text-primary
    │       الإجمالي cell:  DM Mono, dir="ltr"
    │       الحالة cell:    <StatusBadge />
    │
    └── ActiveServicesCard
        ├── Header: "الخدمات النشطة"
        └── Grid: grid-cols-2, gap-2
            └── ServiceMiniButton[] (max 4)
                ├── colored icon (w-7 h-7, bg=color+"20")
                ├── service name (text-[11px] font-semibold)
                └── price/unit (text-[10px], dir="ltr", DM Mono)
                onClick → setActiveNav("معاملة جديدة")
```

### 8.2 Data Derivation

```typescript
TODAY = "5 يونيو 2026"
todayOrders  = orders.filter(date===TODAY && status!=="batal")
todayRev     = todayOrders.reduce(sum of totals)
activeOrders = orders.filter(status===menunggu || proses)
monthOrders  = orders.filter(date.includes("يونيو 2026") && status!==batal)

revenueData[7] = { day: "الاثنين"→"الأحد", pendapatan, transaksi }
  // الأحد uses live todayRev / todayOrders.length

serviceData = orders grouped by service.split("+")[0].trim()
  → { name, value: percentage, color: colors[i] }
```

### 8.3 Chart CustomTooltip

```tsx
<div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
  <p className="font-semibold text-foreground mb-1.5">{label}</p>
  {payload.map(p => (
    <p style={{ color: p.color }}>
      {p.dataKey==="pendapatan" ? "الإيرادات: " : "المعاملات: "}
      <span className="font-medium">{formatted value}</span>
    </p>
  ))}
</div>
```

---

## 9. PAGE: معاملة جديدة — POS / New Transaction

**File:** `TransaksiBaru()` in `App.tsx`  
**Suggested path:** `src/features/pos/TransaksiBaru.tsx`

### 9.1 Component Tree — Step: `"form"`

```
TransaksiBaru (step="form")
  layout: grid-cols-1 lg:grid-cols-5, gap-4

  LeftPanel (lg:col-span-3, space-y-4)
  ├── CustomerCard (bg-card border rounded-xl p-4)
  │   ├── Header: "بيانات العميل" (Cairo)
  │   ├── Grid: grid-cols-1 sm:grid-cols-2, gap-3
  │   │   ├── CustomerNameInput
  │   │   │   ├── label: "اسم العميل"
  │   │   │   ├── <input placeholder="الاسم أو زيارة مباشرة">
  │   │   │   └── SuggestionDropdown (z-20, absolute)
  │   │   │       └── CustomerRow[]: name (font-medium) + phone (text-muted-foreground ml-2)
  │   │   └── PhoneInput
  │   │       ├── label: "رقم الهاتف"
  │   │       └── <input placeholder="08xx-xxxx-xxxx">
  │   └── NotesTextarea
  │       ├── label: "ملاحظات"
  │       └── <textarea rows={2} placeholder="تعليمات خاصة...">
  │
  └── ServiceSelectionCard (bg-card border rounded-xl p-4)
      ├── Header: "اختر الخدمة" (Cairo)
      └── ServiceGrid: grid-cols-2 sm:grid-cols-3, gap-2
          └── ServiceCard[] (active services only)
              structure:
                <button relative flex-col items-start p-3 rounded-lg border>
                  {inCart && <QtyBadge: absolute top-2 right-2, w-5 h-5 bg-primary rounded-full text-[10px]>}
                  <IconBox: w-8 h-8 rounded-lg, bg=color+"20", color=color>
                  <p: text-xs font-semibold>{svc.name}</p>
                  <p dir="ltr": text-[10px]>{formatRp(svc.price)}/{svc.unit}</p>
                  <p dir="ltr": text-[10px]>⏱ {svc.duration}</p>
              states:
                default:  border-border hover:border-primary/40
                inCart:   border-primary bg-secondary/40

  RightPanel (lg:col-span-2, sticky top-0)
  └── OrderSummaryCard (bg-card border rounded-xl p-4)
      ├── Header row: "ملخص الطلب" + "حذف الكل" (if cart non-empty)
      ├── EmptyState (if cart empty)
      │   └── ShoppingCart icon + "لم يتم اختيار أي خدمة"
      ├── CartItemList (space-y-2)
      │   └── CartItemRow[] (bg-muted/40 rounded-lg p-2)
      │       ├── ItemInfo: name (text-xs font-medium) + price/unit (dir="ltr" text-[10px])
      │       ├── QtyStepper: [−] {qty (DM Mono)} [+]  (w-5 h-5 border rounded)
      │       ├── LineTotal: text-xs font-semibold dir="ltr" DM Mono (w-16 text-right)
      │       └── RemoveButton: X size={13}
      └── Totals + CTA (if cart non-empty)
          ├── border-t pt-3 space-y-1.5
          │   ├── المجموع الفرعي: {formatRp(subtotal)}
          │   ├── الضريبة (1%):  {formatRp(tax)}
          │   └── الإجمالي:      {formatRp(total)} (font-bold text-sm border-t)
          └── <button onClick → step="payment">
                <CreditCard size={15} /> معالجة الدفع
              bg-primary text-primary-foreground w-full py-2.5
```

### 9.2 Component Tree — Step: `"payment"`

```
PaymentView (max-w-md centered)
└── Card (bg-card border rounded-xl p-5)
    ├── BackButton → step="form"  (ArrowLeft)
    ├── Header: "الدفع" (Cairo)
    ├── CartSummaryBox (bg-muted/40 rounded-lg p-4 text-xs)
    │   ├── CartItem rows: name × qty unit | price
    │   ├── المجموع الفرعي
    │   ├── الضريبة (1%)
    │   └── الإجمالي (font-bold text-base)
    ├── PaymentMethodSelector
    │   └── Grid: grid-cols-3 gap-2
    │       └── MethodButton[]: ["tunai"/"نقدي", "transfer"/"تحويل", "qris"/"QRIS"]
    │           active:  border-primary bg-secondary/50 text-primary
    │           default: border-border text-muted-foreground
    ├── CashInput (shown when paymentMethod="tunai")
    │   ├── label: "المبلغ المستلم"
    │   ├── <input type="text" className="font-mono">
    │   ├── ChangeBox (emerald, if change≥0): "الباقي" | {formatRp(change)}
    │   └── DeficitBox (red, if change<0):   "المبلغ الناقص" | {formatRp(|change|)}
    └── ConfirmButton: "تأكيد الدفع"
        disabled if tunai && change < 0
```

### 9.3 Component Tree — Step: `"receipt"`

```
ReceiptView (max-w-md centered)
└── Card (bg-card border rounded-xl p-6)
    ├── SuccessIcon: w-14 h-14 bg-emerald-100 rounded-full, CheckCircle size={28} text-emerald-600
    ├── Title: "تمت المعاملة بنجاح!" (Cairo font-bold text-lg)
    ├── Subtitle: "تم إنشاء الطلب #{completedOrderId}"
    ├── ReceiptBox (bg-muted/40 rounded-lg p-4 text-xs)
    │   ├── العميل | name
    │   ├── التاريخ | date, time
    │   ├── border-t: CartItems (name × qty unit | price)
    │   ├── border-t: المجموع الفرعي | الضريبة | الإجمالي (DM Mono font-bold)
    │   └── border-t (if cash): المبلغ المدفوع | الباقي (emerald)
    └── ActionRow (flex gap-2)
        ├── PrintButton: "طباعة الإيصال" (border, Printer icon)
        └── NewOrderButton: "طلب جديد" (bg-primary) → reset()
```

---

## 10. PAGE: قائمة الطلبات — Order List

**File:** `DaftarOrder()` in `App.tsx`  
**Suggested path:** `src/features/orders/DaftarOrder.tsx`

### 10.1 Component Tree — List View

```
DaftarOrder
├── FilterBar (flex flex-wrap gap-3)
│   ├── SearchInput (flex-1 min-w-48)
│   │   └── right-3 Search icon + pr-8 input
│   ├── StatusFilterPills (flex flex-wrap gap-1)
│   │   └── FilterButton[]: ["semua","menunggu","proses","selesai","batal"]
│   │       active: bg-primary text-primary-foreground
│   │       default: bg-card border text-muted-foreground
│   └── ExportButton: "تصدير CSV" (ml-auto)
│
└── OrderTable (bg-card border rounded-xl)
    ├── CountBar: "{n} طلب موجود"
    └── Table
        headers: رقم الطلب | العميل | الخدمة | الوزن | الإجمالي | الحالة | تاريخ الاستلام | (eye)
        row cells:
          رقم الطلب:     <span DM Mono text-primary>{o.id}</span>
          العميل:        <p font-medium>{name}</p> <p text-muted>{phone}</p>
          الخدمة:        text-muted-foreground
          الوزن:         dir="ltr" → "{weight} كجم"
          الإجمالي:      DM Mono dir inherited, formatRp()
          الحالة:        <StatusBadge status={o.status} />
          تاريخ:         "{date}، {time}" (whitespace-nowrap)
          eye:           <Eye size={14} /> button
        onClick row: setSelected(o)
        empty: FileText icon + "لا توجد طلبات مطابقة"
```

### 10.2 Component Tree — Detail View

```
OrderDetail (max-w-lg)
├── BackLink: "العودة إلى القائمة" (ArrowLeft)
└── Card (bg-card border rounded-xl p-5)
    ├── HeaderRow: order.id (DM Mono text-lg text-primary) | <StatusBadge />
    ├── InfoGrid (grid-cols-2 gap-3 text-xs)
    │   └── InfoCell[]: bg-muted/40 rounded-lg p-2.5
    │       fields: العميل | الهاتف | الخدمة | الوزن | التاريخ | وقت الاستلام | الدفع | الإجمالي
    │       values: font-semibold text-foreground
    ├── NotesBox (if order.notes)
    ├── StatusChangeButtons (if not selesai/batal)
    │   ├── "تعيين قيد المعالجة" (sky colors, Loader2 icon) — shown if menunggu
    │   ├── "تعيين مكتمل" (emerald colors, CheckCircle2) — shown if menunggu/proses
    │   └── "إلغاء" (red colors, XCircle)
    └── ActionRow
        ├── PrintButton: "إيصال" (Printer icon)
        └── DeleteButton: two-step confirm ("حذف الطلب" → "نعم، احذف" + "إلغاء")
```

---

## 11. PAGE: العملاء — Customers

**File:** `PelangganView()` in `App.tsx`  
**Suggested path:** `src/features/customers/PelangganView.tsx`

### 11.1 Component Tree — List View

```
PelangganView
├── ToolBar (flex items-center gap-3)
│   ├── SearchInput (flex-1 max-w-xs)
│   ├── ExportButton: "تصدير"
│   └── AddButton: "+ عميل جديد" (bg-primary, ml-auto)
│
└── CustomerCardGrid (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3)
    └── CustomerCard[] (bg-card border rounded-xl p-4 text-right)
        ├── AvatarRow (flex items-center gap-2.5 mb-3)
        │   ├── Avatar: w-9 h-9 rounded-full bg-primary/10 text-primary, {name.charAt(0)}
        │   └── NamePhone: name (text-xs font-semibold) + phone (text-[10px] text-muted)
        ├── StatsRow (grid-cols-2 gap-2 text-center)
        │   ├── OrderCount: text-sm font-bold + "طلب"
        │   └── SpendAmount: "{(spend/1000).toFixed(0)}ك" dir="ltr" DM Mono + "إنفاق"
        └── Footer (flex justify-between mt-2.5)
            ├── StatusBadge: "نشط" (emerald) / "غير نشط" (muted)
            └── LastOrder: "آخر طلب {date}" text-[10px] text-muted
        onClick: setSelected(customer)
    empty: Users icon + "لا يوجد عملاء"
```

### 11.2 Component Tree — Detail View

```
CustomerDetail (grid-cols-1 lg:grid-cols-3 gap-4)
├── ProfileCard (bg-card border rounded-xl p-5)
│   ├── AvatarRow: w-12 h-12 rounded-full bg-primary/10 + name + status badge
│   ├── ContactInfo (space-y-2.5 text-xs text-muted-foreground)
│   │   └── InfoRow[]: [Phone, email], [Mail, email], [MapPin, address], [Calendar, "انضم {date}"]
│   ├── StatsGrid (grid-cols-2 gap-2 mt-4)
│   │   ├── TotalOrders: text-lg DM Mono + "إجمالي الطلبات"
│   │   └── TotalSpend: formatRp(totalSpend) DM Mono + "إجمالي الإنفاق"
│   └── ActionRow: "تعديل" (Edit2) + delete two-step
│
└── OrderHistoryTable (lg:col-span-2)
    ├── Header: "سجل الطلبات ({n})"
    └── Table
        headers: الرقم | الخدمة | الإجمالي | الحالة | التاريخ
        empty: "لا يوجد سجل بعد"
```

### 11.3 Add/Edit Modal

```
CustomerFormModal (max-w-sm)
├── Title: "عميل جديد" / "تعديل العميل"
└── Fields: الاسم الكامل | رقم الهاتف | البريد الإلكتروني | العنوان
    → same input pattern (border rounded-lg px-3 py-2 text-xs bg-input-background)
```

---

## 12. PAGE: الخدمات — Services

**File:** `LayananView()` in `App.tsx`  
**Suggested path:** `src/features/services/LayananView.tsx`

### 12.1 Component Tree

```
LayananView
├── Header: "إدارة الخدمات" + "{active} من {total} خدمة نشطة" + "+ إضافة خدمة"
└── ServiceCardGrid (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3)
    └── ServiceCard[] (bg-card border rounded-xl p-4)
        ├── CardHeader (flex items-start justify-between mb-3)
        │   ├── IconNameRow (flex items-center gap-2.5)
        │   │   ├── ServiceIcon: w-9 h-9 rounded-lg, bg=color+"20"
        │   │   └── NameDesc: name (text-xs font-semibold) + desc (text-[10px] text-muted)
        │   └── ToggleSwitch (active state)
        ├── StatsGrid (grid-cols-3 gap-1.5 text-[10px] text-center mb-3)
        │   ├── PriceCell: formatRp(price) (DM Mono font-bold text-xs) + "لكل {unit}"
        │   ├── DurationCell: "⏱ {duration}" + "مدة تقديرية"
        │   └── UnitCell: "{unit}" + "الوحدة"
        └── ActionRow (flex gap-1.5)
            ├── EditButton: "تعديل" (Edit2)
            └── DeleteButton: two-step confirm
        opacity-60 if inactive
```

### 12.2 Service Form Modal

```
ServiceFormModal
Fields:
  اسم الخدمة    → text input
  الوصف         → text input
  السعر (ج.م)  → number input (dir="ltr")
  الوحدة        → select: [كجم, قطعة, زوج, ورقة]
  الوقت التقديري → text input
  اللون         → color swatch picker (7 colors)
    swatches: #0EA5E9 #10B981 #F59E0B #8B5CF6 #EF4444 #6366F1 #EC4899
    selected: border-2 border-foreground scale-110
```

---

## 13. PAGE: المخزون — Inventory

**File:** `InventoryView()` in `App.tsx`  
**Suggested path:** `src/features/inventory/InventoryView.tsx`

### 13.1 Component Tree

```
InventoryView
├── StatCardRow (grid-cols-2 lg:grid-cols-4 gap-3)
│   ├── StatCard: "إجمالي الأصناف" (bg-primary, Boxes icon)
│   ├── StatCard: "مخزون منخفض"   (bg-red-500, AlertCircle icon)
│   ├── StatCard: "قيمة المخزون"  (bg-emerald-500, Tag icon) → "{n} م ج.م" dir="ltr"
│   └── StatCard: "حركات المخزون" (bg-amber-500, ArrowUpCircle icon)
│
├── LowStockAlert (if lowStock.length > 0)
│   bg-red-50 border-red-200 rounded-xl px-4 py-3
│   └── AlertBadge[]: "{name} — المتبقي {stock} {unit}"
│                      clickable → opens RestockModal
│
├── ControlBar (flex flex-wrap gap-3)
│   ├── TabButtons: "قائمة المخزون" | "سجل الحركات"
│   ├── SearchInput (if tab="stok")
│   ├── CategoryFilter pills: [الكل, مواد الغسيل, معطرات, تغليف, معدات]
│   └── ExportButton + AddButton
│
├── InventoryTable (if tab="stok")
│   headers: SKU | اسم الصنف | الفئة | المخزون | الحد الأدنى | سعر الوحدة | قيمة المخزون | المورد | (actions)
│   row details:
│     SKU:          font-mono text-[11px] text-muted-foreground
│     اسم الصنف:    icon (colored w-7 h-7 rounded-lg) + name font-medium
│     الفئة:        chip: bg-muted text-muted-foreground text-[10px] px-2 rounded-full
│     المخزون:      dir="ltr" → stock (DM Mono, red if low) + unit + pulse dot + progress bar
│     الحد الأدنى: dir="ltr" → "{minStock} {unit}"
│     سعر الوحدة:  dir="ltr" DM Mono → formatRp(price)/{unit}
│     قيمة المخزون: dir="ltr" DM Mono → formatRp(stock*price)
│     المورد:       text-muted max-w-[120px] truncate
│     actions:      إعادة تخزين (primary/10) | استخدام (amber) | Edit | Delete
│
└── StockHistoryTable (if tab="riwayat")
    headers: التاريخ | SKU | اسم الصنف | النوع | الكمية | الملاحظة | الرصيد
    النوع badge:
      masuk → "وارد" bg-emerald-50 text-emerald-700 (ArrowDownCircle icon)
      keluar → "صادر" bg-red-50 text-red-600 (ArrowUpCircle icon)
    الكمية: dir="ltr" DM Mono, color #059669 or #DC2626
    الرصيد: dir="ltr" DM Mono
```

### 13.2 Restock Modal

```
RestockModal (max-w-sm)
├── Info box: name + "SKU: {sku} · المخزون: {stock} {unit}" (dir="ltr" for value)
├── كمية الإضافة input (type="number" dir="ltr" font-mono)
├── Preview: "المخزون بعد الإضافة: {stock + qty} {unit}" (emerald, dir="ltr")
├── ملاحظة input
└── CTA: "حفظ الإضافة" (bg-primary, ArrowUpCircle icon)
```

### 13.3 Consume Modal

```
ConsumeModal (max-w-sm)
├── Info box: name + "المخزون المتاح: {stock} {unit}" (dir="ltr")
├── الكمية المستخدمة input (type="number", max=stock, dir="ltr")
├── Preview (if valid): "المتبقي بعد الاستخدام: {stock-qty} {unit}" (amber, dir="ltr")
├── Error (if qty > stock): "يتجاوز المخزون المتاح!" (red text-[10px])
├── ملاحظة input
└── CTA: "تسجيل الاستخدام" (bg-amber-500, ArrowDownCircle icon)
```

---

## 14. PAGE: إدارة الخزينة — Treasury

**File:** `KhazinehView()` in `App.tsx`  
**Suggested path:** `src/features/treasury/KhazinehView.tsx`

### 14.1 Component Tree

```
KhazinehView
├── TopRow (grid-cols-1 lg:grid-cols-3 gap-4)
│   ├── BalanceCard (lg:col-span-2, bg-card border rounded-xl p-5)
│   │   ├── Label: "إجمالي النقدية بالخزينة" (text-xs text-muted-foreground)
│   │   ├── BalanceValue: "{balance} {currency}" (text-4xl font-bold dir="ltr" DM Mono)
│   │   ├── SubText: "{n} حركة مسجلة" (text-xs text-muted)
│   │   └── MiniStats (grid-cols-2 gap-3 mt-4)
│   │       ├── DepositsBox (bg-emerald-50 border-emerald-200 rounded-lg p-3)
│   │       │   ├── "إجمالي الإيداعات" (text-[10px] text-emerald-600)
│   │       │   └── "+{total} {currency}" (dir="ltr" DM Mono text-base font-bold text-emerald-700)
│   │       └── WithdrawalsBox (bg-red-50 border-red-200 rounded-lg p-3)
│   │           ├── "إجمالي السحوبات" (text-[10px] text-red-600)
│   │           └── "-{total} {currency}" (dir="ltr" DM Mono text-base font-bold text-red-700)
│   │
│   └── ActionButtons (flex flex-col gap-3)
│       ├── DepositButton (flex-1)
│       │   bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl p-5
│       │   <Plus size={20} /> "إيداع نقدية (+)"
│       │   onClick → showModal("إيداع")
│       └── WithdrawButton (flex-1)
│           bg-red-500 hover:bg-red-600 text-white rounded-xl p-5
│           <Minus size={20} /> "سحب نقدية (-)"
│           onClick → showModal("سحب")
│
├── TransactionTable (bg-card border rounded-xl)
│   ├── Header: "سجل حركات الخزينة" (Cairo) + "{n} حركة"
│   └── Table
│       headers: التاريخ والوقت | نوع الحركة | المبلغ | الموظف | السبب / الملاحظات
│       row cells:
│         التاريخ والوقت: "{date}، {time}" whitespace-nowrap text-muted
│         نوع الحركة:    TypeBadge (rounded-full border, emerald/red)
│                          إيداع → ArrowDownCircle, emerald colors
│                          سحب  → ArrowUpCircle, red colors
│         المبلغ:         dir="ltr" DM Mono, color #059669 or #DC2626
│                          prefix: "+" or "−"
│                          "{±}{amount} {currency}"
│         الموظف:        font-medium text-foreground
│         السبب:         text-muted-foreground
│       empty: Banknote icon + "لا توجد حركات مسجلة"
│
└── TransactionModal (showModal !== null)
    ├── Header icon: w-8 h-8 rounded-lg (emerald/red bg) + Plus/Minus icon
    ├── Title: "إيداع نقدية" / "سحب نقدية" (Cairo)
    ├── المبلغ input (type="number" dir="ltr" DM Mono)
    ├── السبب input (text)
    │   placeholder: "إيرادات الكاشير..." / "مصاريف تشغيل..."
    └── Actions: "إلغاء" + "تأكيد الإيداع"/"تأكيد السحب"
        CTA color: emerald (deposit) / red (withdrawal)
        disabled if amount ≤ 0
```

### 14.2 Balance Calculation Logic

```typescript
const totalDeposits    = transactions.filter(t => t.type === "إيداع").reduce((a,t) => a + t.amount, 0);
const totalWithdrawals = transactions.filter(t => t.type === "سحب").reduce((a,t) => a + t.amount, 0);
const balance          = totalDeposits - totalWithdrawals;

// INIT_TREASURY balance: 3000 + 2000 − 350 + 800 = 5,450 ج.م
```

### 14.3 TreasuryEntry Data Model

```typescript
interface TreasuryEntry {
  id:       number;
  date:     string;    // "5 يونيو 2026"
  time:     string;    // "07:00"
  type:     "إيداع" | "سحب";
  amount:   number;
  employee: string;    // "مدير دينور" | "كاشير رئيسي"
  reason:   string;
}

// INIT_TREASURY seed:
{ id:1, "5 يونيو 2026", "07:00", "إيداع", 3000, "مدير دينور",  "رصيد افتتاحي الخزينة" }
{ id:2, "5 يونيو 2026", "11:00", "إيداع", 2000, "مدير دينور",  "إيرادات الصباح" }
{ id:3, "5 يونيو 2026", "12:30", "سحب",   350,  "مدير دينور",  "شراء مواد تنظيف" }
{ id:4, "5 يونيو 2026", "15:00", "إيداع", 800,  "كاشير رئيسي", "إيرادات ما بعد الظهر" }
```

---

## 15. PAGE: التقارير — Reports

**File:** `LaporanView()` in `App.tsx`  
**Suggested path:** `src/features/reports/LaporanView.tsx`

### 15.1 Component Tree

```
LaporanView
├── Header: "التقرير المالي" (Cairo) + "ملخص أداء دينور لاندري"
│   + PeriodTabs: ["شهري","سنوي"] + "تصدير CSV"
│
├── SummaryStatCards (grid-cols-2 lg:grid-cols-4 gap-3)
│   ├── إجمالي الإيرادات:  formatRp(totalRev)         DM Mono text-primary
│   ├── إجمالي الطلبات:    totalOrder (en-US locale)   DM Mono text-emerald-600
│   ├── متوسط الشهر:       formatRp(totalRev/6)        DM Mono text-amber-600
│   └── طلبات يونيو:       String(junOrders.length)    DM Mono text-violet-600
│       sub: formatRp(junRev)
│   All values: dir="ltr"
│
├── ChartRow (grid-cols-1 lg:grid-cols-2 gap-4)
│   ├── RevenueBarChart
│   │   ├── Title: "الإيرادات الشهرية"
│   │   └── Recharts BarChart (height=200, barSize=20)
│   │       Bar: fill="#0369A1" radius=[4,4,0,0]
│   │       YAxis: tickFormatter v => `${v/1000000}م` width=36
│   │       XAxis: dataKey="month" fontSize=11
│   │
│   └── OrdersLineChart
│       ├── Title: "عدد الطلبات الشهرية"
│       └── Recharts LineChart (height=200)
│           Line: stroke="#10B981" strokeWidth=2 dot={{r:3}}
│
└── MonthlyTable (bg-card border rounded-xl)
    ├── Header: "ملخص شهري"
    └── Table
        headers: الشهر | الإيرادات | عدد الطلبات | عملاء جدد | متوسط/طلب
        rows: monthlyReport[] (يناير – يونيو 2026)
        الإيرادات:   DM Mono text-primary
        عدد الطلبات: DM Mono
        متوسط/طلب:  DM Mono text-muted-foreground
        Total row:   bg-primary/5 font-bold border-t-2 border-primary/20
```

---

## 16. PAGE: الإعدادات — Settings

**File:** `PengaturanView()` in `App.tsx`  
**Suggested path:** `src/features/settings/PengaturanView.tsx`

### 16.1 Component Tree

```
PengaturanView (grid-cols-1 lg:grid-cols-4 gap-4)
├── TabNav (bg-card border rounded-xl p-2 h-fit)
│   └── TabButton[] (w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs)
│       tabs: معلومات المتجر(Store) | الحساب(Account) | الدفع(Payment) | الطابعة(Printer) | الأمان(Security)
│       active: bg-primary/10 text-primary
│       default: text-muted-foreground hover:bg-muted
│
└── ContentPanel (lg:col-span-3 bg-card border rounded-xl p-5)
    ├── [toko] معلومات المتجر
    │   └── Fields[]: اسم المتجر | الشعار | العنوان | رقم الهاتف | واتساب | ساعات العمل | أيام العمل
    │
    ├── [akun] إدارة الحساب
    │   ├── ProfileBox: avatar (د) + name + email + "تغيير الصورة"
    │   └── Fields[]: الاسم الكامل | اسم المستخدم | البريد الإلكتروني | رقم الهاتف
    │
    ├── [pembayaran] طرق الدفع
    │   ├── PaymentMethodList[]
    │   │   └── Row: icon + label + desc + ToggleSwitch
    │   │       methods: نقدي | تحويل بنكي (BCA) | تحويل بنكي (Mandiri) | QRIS | OVO/GoPay
    │   ├── CurrencySelector
    │   │   ├── Title: "وحدة العملة"
    │   │   ├── Subtitle: "تحدد الرمز الذي يظهر بجانب جميع المبالغ في النظام."
    │   │   ├── ToggleButtons[]: ["ج.م", "EGP"]
    │   │   │   active: border-primary bg-primary/10 text-primary shadow-sm
    │   │   │   default: border-border text-muted-foreground
    │   │   │   label text: "جنيه مصري (عربي)" / "Egyptian Pound (EGP)"
    │   │   └── Example: "مثال: 1,250 {currency}" (dir="ltr" DM Mono)
    │   └── TaxInput: "الضريبة (%)" (type="number" w-32)
    │
    ├── [printer] إعدادات الطابعة
    │   ├── Warning: AlertCircle + "تأكد من توصيل الطابعة قبل حفظ الإعدادات."
    │   ├── Fields[]: اسم الطابعة/"Epson TM-T82" | المنفذ/"USB001" | عرض الورق/"58mm"
    │   ├── AutoprintToggle: "طباعة تلقائية بعد كل معاملة" + ToggleSwitch + "مفعل"/"معطل"
    │   └── FooterTextarea: "تذييل الإيصال" + <textarea rows={3}>
    │
    └── [keamanan] أمان الحساب
        ├── StatusBox: CheckCircle (emerald) + "حسابك آمن. آخر تسجيل دخول: ..."
        ├── PasswordChange: 3 password inputs
        └── PINSection: "رمز PIN للكاشير" + 6x single-char inputs (w-8 h-8)

    Footer (all tabs): "حفظ التغييرات" (or "تم الحفظ!" in emerald) + "إعادة تعيين"
```

---

## 17. APP SHELL: Sidebar + Header

**File:** `App()` in `App.tsx`  
**Suggested path:** `src/app/App.tsx`

### 17.1 Sidebar

```
<aside> (bg-sidebar, transition w-56 ↔ w-16, border-l border-sidebar-border, RTL)
├── Brand (px-4 py-5 border-b)
│   ├── Logo: w-8 h-8 bg-primary rounded-lg, <Sparkles size={16} text-white />
│   ├── (if open) BrandText: "دينور" (Cairo, font-bold text-sm white) + "نظام المغسلة" (text-[10px])
│   └── ToggleButton: mr-auto, X (open) or Menu (closed), text-sidebar-foreground
│
├── Nav (flex-1 py-4 px-2 flex flex-col gap-0.5 overflow-y-auto)
│   └── NavButton[] per NAV_ITEMS
│       <button flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full text-right>
│         <Icon size={16} shrink-0 />
│         {if open} <span truncate>{label}</span>
│       active:  bg-sidebar-accent text-sidebar-accent-foreground font-medium
│       default: text-sidebar-foreground hover:bg-sidebar-accent/50
│
└── UserFooter (border-t border-sidebar-border px-3 py-3)
    ├── Avatar: w-7 h-7 rounded-full bg-primary, "DL" text-[10px] font-bold white
    └── (if open) UserInfo: "مدير دينور" (text-xs font-medium white) + "كاشير رئيسي" (text-[10px])
```

### 17.2 Header

```
<header> (h-14 bg-card border-b flex items-center gap-4 px-5)
├── PageTitle (flex-1)
│   ├── sub: header.sub (text-xs text-muted-foreground)
│   └── title: header.title (text-sm font-semibold Cairo)
│
├── GlobalSearch (hidden md:block, relative)
│   ├── Search icon: right-3 (RTL-correct)
│   └── input: pr-8 pl-4 py-1.5 text-xs w-56, placeholder "ابحث عن طلب أو عميل..."
│
└── NewOrderButton (bg-primary)
    <Plus size={13} /> "طلب جديد"
    onClick → setActiveNav("معاملة جديدة")
```

---

## 18. DATA MODELS & STATUS ENUMS

### 18.1 Interfaces

```typescript
type OrderStatus = "menunggu" | "proses" | "selesai" | "batal";
//   Arabic:        في الانتظار   جاري المعالجة   مكتمل      ملغي

type UserRole = "admin" | "kasir";

interface Order {
  id: string;           // "DNR-2841"
  customer: string;
  phone: string;
  service: string;      // "غسيل جاف" | "سريع + كي" | etc.
  weight: number;       // kg
  total: number;        // in EGP (integer)
  status: OrderStatus;
  date: string;         // "5 يونيو 2026"
  time: string;         // "09:14"
  paid: boolean;
  notes: string;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  joinDate: string;     // "يناير 2025"
  totalOrders: number;
  totalSpend: number;   // cumulative EGP
  lastOrder: string;    // "5 يونيو 2026"
  status: "aktif" | "tidak aktif";
}

interface ServiceItem {
  id: number;
  name: string;         // Arabic service name
  desc: string;
  price: number;        // per unit
  unit: string;         // "كجم" | "قطعة" | "زوج"
  duration: string;     // "يومان" | "6 ساعات"
  active: boolean;
  color: string;        // hex e.g. "#0EA5E9"
}

interface InventoryItem {
  id: number;
  sku: string;          // "BHN-001"
  name: string;
  category: string;     // "مواد الغسيل" | "معطرات" | "تغليف" | "معدات"
  unit: string;
  stock: number;
  minStock: number;
  price: number;        // per unit
  supplier: string;
  lastRestock: string;
  color: string;        // hex
  icon: React.ElementType;
}

interface StockEntry {
  id: number;
  date: string;
  time: string;
  sku: string;
  name: string;
  type: "masuk" | "keluar";   // وارد | صادر
  qty: number;
  unit: string;
  keterangan: string;          // reason/note
  saldo: number;               // running balance
}

interface TreasuryEntry {
  id: number;
  date: string;
  time: string;
  type: "إيداع" | "سحب";
  amount: number;
  employee: string;
  reason: string;
}
```

### 18.2 SKU Prefix Map

```typescript
const SKU_PREFIX: Record<string, string> = {
  "مواد الغسيل": "BHN",
  "معطرات":     "BWG",
  "تغليف":      "PKG",
  "معدات":      "ALT",
  // fallback: "ITM"
};
```

### 18.3 Category Color Map

```typescript
const CAT_COLOR: Record<string, string> = {
  "مواد الغسيل": "#0EA5E9",
  "معطرات":     "#8B5CF6",
  "تغليف":      "#F59E0B",
  "معدات":      "#10B981",
};
```

---

## 19. VERBATIM ARABIC STRING CATALOG

### Navigation & Shell
```
"دينور"                "نظام المغسلة"             "مدير دينور"
"كاشير رئيسي"         "لوحة التحكم"              "معاملة جديدة"
"قائمة الطلبات"        "العملاء"                  "الخدمات"
"المخزون"              "إدارة الخزينة"             "التقارير"
"الإعدادات"            "طلب جديد"                  "ابحث عن طلب أو عميل..."
```

### Status Labels
```
"مكتمل"   "جاري المعالجة"   "في الانتظار"   "ملغي"   "الكل"
"نشط"     "غير نشط"         "وارد"          "صادر"
"إيداع"   "سحب"             "مدفوع"         "غير مدفوع"
```

### POS (معاملة جديدة)
```
"بيانات العميل"       "اسم العميل"              "رقم الهاتف"
"ملاحظات"             "تعليمات خاصة..."          "الاسم أو زيارة مباشرة"
"اختر الخدمة"         "ملخص الطلب"               "حذف الكل"
"لم يتم اختيار أي خدمة"                          "زيارة مباشرة"
"المجموع الفرعي"      "الضريبة (1%)"             "الإجمالي"
"معالجة الدفع"        "الدفع"                    "طريقة الدفع"
"نقدي"                "تحويل"                    "QRIS"
"المبلغ المستلم"      "الباقي"                   "المبلغ الناقص"
"تأكيد الدفع"         "تمت المعاملة بنجاح!"      "تم إنشاء الطلب #…"
"العميل"              "التاريخ"                   "المبلغ المدفوع"
"طباعة الإيصال"       "طلب جديد"
```

### Order Management (قائمة الطلبات)
```
"ابحث برقم الطلب أو اسم العميل..."               "تصدير CSV"
"رقم الطلب"   "العميل"   "الخدمة"   "الوزن"    "الإجمالي"
"الحالة"       "تاريخ الاستلام"                  "طلب موجود"
"لا توجد طلبات مطابقة"                           "العودة إلى القائمة"
"تغيير الحالة"   "تعيين قيد المعالجة"           "تعيين مكتمل"
"إلغاء"          "إيصال"                          "نعم، احذف"
"حذف الطلب"     "وقت الاستلام"
```

### Customers (العملاء)
```
"ابحث بالاسم أو رقم الهاتف..."   "تصدير"   "عميل جديد"
"آخر طلب"   "طلب"   "إنفاق"      "لا يوجد عملاء"
"انضم"       "إجمالي الطلبات"     "إجمالي الإنفاق"
"تعديل"      "حذف"                "سجل الطلبات (n)"
"لا يوجد سجل بعد"                 "تعديل العميل"
"الاسم الكامل"   "رقم الهاتف"    "البريد الإلكتروني"   "العنوان"   "حفظ"
```

### Services (الخدمات)
```
"إدارة الخدمات"   "خدمة نشطة"   "إضافة خدمة"
"لكل …"           "مدة تقديرية"  "الوحدة"
"تعديل الخدمة"    "اسم الخدمة"   "الوصف"
"السعر (ج.م)"    "الوقت التقديري"   "اللون"
"كجم"   "قطعة"   "زوج"   "ورقة"
```

### Services — Arabic Names
```
"غسيل جاف"   "غسيل رطب"   "كي"   "غسيل + كي"
"سريع"       "تنظيف كيميائي"   "أحذية"
```

### Inventory (المخزون)
```
"إجمالي الأصناف"   "نوع من المواد"     "مخزون منخفض"
"يحتاج إعادة تخزين"   "قيمة المخزون"   "تقدير إجمالي"
"حركات المخزون"    "مسجلة"
"⚠ n صنف مخزونه منخفض — يحتاج إعادة تخزين عاجلاً"
"المتبقي"          "قائمة المخزون"    "سجل الحركات"
"ابحث بالاسم أو SKU..."
"اسم الصنف"   "الفئة"   "المخزون"   "الحد الأدنى"
"سعر الوحدة"  "قيمة المخزون"   "المورد"
"إعادة تخزين"   "استخدام"   "لا توجد أصناف"
"التاريخ"   "اسم الصنف"   "النوع"   "الكمية"   "الملاحظة"   "الرصيد"
"إعادة تخزين"   "كمية الإضافة"   "المخزون بعد الإضافة: "   "حفظ الإضافة"
"تسجيل الاستخدام"   "المخزون المتاح"   "الكمية المستخدمة"
"المتبقي بعد الاستخدام: "   "يتجاوز المخزون المتاح!"
"إضافة صنف جديد"   "المخزون الابتدائي"
"مواد الغسيل"   "معطرات"   "تغليف"   "معدات"   "الكل"
"كجم"   "لتر"   "قطعة"   "لفة"   "وحدة"   "زوج"   "ورقة"
```

### Treasury (إدارة الخزينة)
```
"إجمالي النقدية بالخزينة"   "حركة مسجلة"
"إجمالي الإيداعات"           "إجمالي السحوبات"
"إيداع نقدية (+)"            "سحب نقدية (-)"
"سجل حركات الخزينة"          "حركة"
"التاريخ والوقت"   "نوع الحركة"   "المبلغ"   "الموظف"   "السبب / الملاحظات"
"لا توجد حركات مسجلة"
"إيداع نقدية"   "سحب نقدية"
"المبلغ"   "السبب / الملاحظة"
"إيرادات الكاشير..."   "مصاريف تشغيل..."
"تأكيد الإيداع"   "تأكيد السحب"
"رصيد افتتاحي الخزينة"   "إيرادات الصباح"
"شراء مواد تنظيف"   "إيرادات ما بعد الظهر"
```

### Reports (التقارير)
```
"التقرير المالي"   "ملخص أداء دينور لاندري"
"شهري"   "سنوي"   "تصدير CSV"
"إجمالي الإيرادات"   "يناير – يونيو 2026"
"إجمالي الطلبات"     "متوسط الشهر"   "آخر 6 أشهر"   "طلبات يونيو"
"الإيرادات الشهرية"   "عدد الطلبات الشهرية"
"ملخص شهري"   "الشهر"   "عدد الطلبات"   "عملاء جدد"   "متوسط/طلب"   "الإجمالي"
```

### Settings (الإعدادات)
```
"معلومات المتجر"   "الحساب"   "الدفع"   "الطابعة"   "الأمان"
"اسم المتجر"   "الشعار"   "العنوان"   "ساعات العمل"   "أيام العمل"
"دينور لاندري"   "نظيف، سريع، موثوق"   "07:00 – 21:00"   "الاثنين – الأحد"
"إدارة الحساب"   "تغيير الصورة"   "اسم المستخدم"
"طرق الدفع"   "وحدة العملة"
"تحدد الرمز الذي يظهر بجانب جميع المبالغ في النظام."
"ج.م"   "جنيه مصري (عربي)"   "EGP"   "Egyptian Pound (EGP)"
"مثال: "   "الضريبة (%)"
"إعدادات الطابعة"   "تأكد من توصيل الطابعة قبل حفظ الإعدادات."
"اسم الطابعة"   "المنفذ"   "عرض الورق"
"طباعة تلقائية بعد كل معاملة"   "مفعل"   "معطل"   "تذييل الإيصال"
"شكراً لاستخدامك خدمات دينور لاندري. تواصل معنا على 0812-3456-7890."
"أمان الحساب"   "حسابك آمن. آخر تسجيل دخول: 5 يونيو 2026، 07:42 من جاكرتا."
"تغيير كلمة المرور"   "كلمة المرور الحالية"   "كلمة المرور الجديدة"
"تأكيد كلمة المرور الجديدة"   "رمز PIN للكاشير"
"رمز PIN مكون من 6 أرقام للوصول السريع."
"حفظ التغييرات"   "تم الحفظ!"   "إعادة تعيين"
```

### Dashboard (لوحة التحكم)
```
"إيرادات اليوم"   "إجمالي طلبات الشهر"   "الطلبات النشطة"   "إجمالي العملاء"
"مقارنة بالأسبوع الماضي"   "بانتظار الاستلام"   "مسجل"
"الاتجاه الأسبوعي"   "29 مايو – 5 يونيو 2026"
"الإيرادات"   "المعاملات"
"توزيع الخدمات"   "بناءً على الطلبات النشطة"
"أحدث الطلبات"   "عرض الكل"   "الخدمات النشطة"
"الاثنين"   "الثلاثاء"   "الأربعاء"   "الخميس"   "الجمعة"   "السبت"   "الأحد"
"الإيرادات: "   "المعاملات: "
```

---

*Document generated from live codebase — `src/app/App.tsx`, `src/styles/theme.css`, `src/styles/fonts.css`*  
*Last updated: 2026-08-14 | دينور لاندري POS v2*
