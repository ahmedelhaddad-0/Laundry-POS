"use strict";
const path = require("path");
const fs = require("fs");

let db = null;
let SQL = null;

// ── Init ─────────────────────────────────────────────────────────────────────

async function initDatabase(userDataPath) {
  const initSqlJs = require("sql.js");
  SQL = await initSqlJs({
    locateFile: (file) =>
      path.join(__dirname, "../node_modules/sql.js/dist/", file),
  });

  const dbPath = path.join(userDataPath, "denur.db");

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
    createSchema();
    seedData();
    persistDb(userDataPath);
  }

  return dbPath;
}

function persistDb(userDataPath) {
  if (!db || !userDataPath) return;
  const dbPath = path.join(userDataPath, "denur.db");
  try {
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  } catch (e) {
    console.error("DB save error:", e);
  }
}

// ── Schema ────────────────────────────────────────────────────────────────────

function createSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      service TEXT NOT NULL,
      weight REAL NOT NULL DEFAULT 0,
      total INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'menunggu',
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      paid INTEGER NOT NULL DEFAULT 0,
      notes TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      joinDate TEXT NOT NULL DEFAULT '',
      totalOrders INTEGER NOT NULL DEFAULT 0,
      totalSpend INTEGER NOT NULL DEFAULT 0,
      lastOrder TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'aktif'
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      desc TEXT NOT NULL DEFAULT '',
      price INTEGER NOT NULL DEFAULT 0,
      unit TEXT NOT NULL DEFAULT 'كجم',
      duration TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1,
      color TEXT NOT NULL DEFAULT '#0EA5E9'
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT '',
      unit TEXT NOT NULL DEFAULT '',
      stock REAL NOT NULL DEFAULT 0,
      minStock REAL NOT NULL DEFAULT 0,
      price INTEGER NOT NULL DEFAULT 0,
      supplier TEXT NOT NULL DEFAULT '',
      lastRestock TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL DEFAULT '#0EA5E9',
      icon TEXT NOT NULL DEFAULT 'Package'
    );

    CREATE TABLE IF NOT EXISTS stock_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      sku TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      qty REAL NOT NULL,
      unit TEXT NOT NULL DEFAULT '',
      keterangan TEXT NOT NULL DEFAULT '',
      saldo REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS treasury (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      type TEXT NOT NULL,
      amount INTEGER NOT NULL DEFAULT 0,
      employee TEXT NOT NULL DEFAULT '',
      reason TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    );
  `);
}

// ── Seed ──────────────────────────────────────────────────────────────────────

function seedData() {
  // Test customer only
  const custs = [
    [1,"عميل تجريبي","0000-0000","test@denurlaundry.com","-","أغسطس 2026",0,0,"-","aktif"],
  ];
  const insc = db.prepare(`INSERT OR IGNORE INTO customers VALUES (?,?,?,?,?,?,?,?,?,?)`);
  custs.forEach((r) => insc.run(r));
  insc.free();

  // Services
  const svcs = [
    [1,"غسيل جاف","غسيل + تجفيف بدون كي",15000,"كجم","يومان",1,"#0EA5E9"],
    [2,"غسيل رطب","غسيل رطب بدون تجفيف",10000,"كجم","3 أيام",1,"#10B981"],
    [3,"كي","كي فقط بدون غسيل",8000,"كجم","يوم واحد",1,"#F59E0B"],
    [4,"غسيل + كي","باقة كاملة غسيل وكي",20000,"كجم","يومان",1,"#8B5CF6"],
    [5,"سريع","ينتهي خلال 6 ساعات",25000,"كجم","6 ساعات",1,"#EF4444"],
    [6,"تنظيف كيميائي","تنظيف كيميائي للأقمشة الخاصة",40000,"قطعة","3 أيام",1,"#6366F1"],
    [7,"أحذية","غسيل أحذية فاخر",50000,"زوج","يومان",0,"#EC4899"],
  ];
  const inss = db.prepare(`INSERT OR IGNORE INTO services VALUES (?,?,?,?,?,?,?,?)`);
  svcs.forEach((r) => inss.run(r));
  inss.free();

  // Inventory
  const inv = [
    [1,"BHN-001","مسحوق غسيل فاخر","مواد الغسيل","كجم",48,10,18000,"CV Bersih Jaya","-","#0EA5E9","FlaskConical"],
    [2,"BHN-002","سائل غسيل أبيض","مواد الغسيل","لتر",32,8,24000,"CV Bersih Jaya","-","#0EA5E9","Droplets"],
    [3,"BHN-003","منعم أقمشة لافندر","معطرات","لتر",7,10,32000,"PT Harum Wangi","-","#8B5CF6","Droplets"],
    [4,"BHN-004","معطر ملابس ورد","معطرات","لتر",14,8,28000,"PT Harum Wangi","-","#8B5CF6","Droplets"],
    [5,"BHN-005","مبيض كلور","مواد الغسيل","لتر",3,5,12000,"CV Bersih Jaya","-","#EF4444","FlaskConical"],
    [6,"PKG-001","أكياس تغليف 30×50 سم","تغليف","قطعة",850,200,350,"Toko Plastik Maju","-","#F59E0B","ShoppingBag"],
    [7,"PKG-002","شماعات ملابس","تغليف","قطعة",210,100,2500,"Toko Plastik Maju","-","#F59E0B","Shirt"],
    [8,"PKG-003","ورق طابعة 58 ملم","تغليف","لفة",12,5,15000,"Toko Elektronik Serba Ada","-","#F59E0B","Tag"],
    [9,"ALT-001","غسالة أمامية 8 كجم","معدات","وحدة",3,1,4500000,"Distributor LG","-","#10B981","RefreshCw"],
    [10,"ALT-002","مكواة بخار صناعية","معدات","وحدة",2,1,850000,"Toko Elektronik Serba Ada","-","#10B981","Wind"],
    [11,"ALT-003","ميزان رقمي 30 كجم","معدات","وحدة",4,2,380000,"Toko Elektronik Serba Ada","-","#10B981","Boxes"],
    [12,"BHN-006","سائل التنظيف الجاف","مواد الغسيل","لتر",9,5,75000,"PT Kimia Prima","-","#6366F1","FlaskConical"],
  ];
  const insi = db.prepare(`INSERT OR IGNORE INTO inventory VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  inv.forEach((r) => insi.run(r));
  insi.free();

  // Default settings
  db.run(`INSERT OR IGNORE INTO settings VALUES ('currency', 'ج.م')`);
  db.run(`INSERT OR IGNORE INTO settings VALUES ('tax', '1')`);
  db.run(`INSERT OR IGNORE INTO settings VALUES ('storeName', 'دينور لاندري')`);
  db.run(`INSERT OR IGNORE INTO settings VALUES ('autoprint', 'false')`);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function rows(res) {
  if (!res || res.length === 0) return [];
  const [{ columns, values }] = res;
  return values.map((row) => {
    const obj = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

function exec(sql, params = []) {
  return rows(db.exec(sql, params));
}

function run(sql, params = []) {
  db.run(sql, params);
}

// ── Orders ────────────────────────────────────────────────────────────────────

function getOrders() {
  return exec("SELECT * FROM orders ORDER BY date DESC, time DESC").map((o) => ({
    ...o, weight: Number(o.weight), total: Number(o.total), paid: o.paid === 1,
  }));
}

function addOrder(order) {
  run(
    `INSERT INTO orders VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [order.id, order.customer, order.phone, order.service, order.weight,
     order.total, order.status, order.date, order.time, order.paid ? 1 : 0, order.notes]
  );
}

function updateOrder(id, data) {
  const fields = Object.entries(data)
    .filter(([k]) => k !== "id")
    .map(([k, v]) => [k, k === "paid" ? (v ? 1 : 0) : v]);
  if (fields.length === 0) return;
  const sql = `UPDATE orders SET ${fields.map(([k]) => `${k}=?`).join(",")} WHERE id=?`;
  run(sql, [...fields.map(([, v]) => v), id]);
}

function deleteOrder(id) {
  run(`DELETE FROM orders WHERE id=?`, [id]);
}

// ── Customers ─────────────────────────────────────────────────────────────────

function getCustomers() {
  return exec("SELECT * FROM customers ORDER BY name").map((c) => ({
    ...c, id: Number(c.id), totalOrders: Number(c.totalOrders), totalSpend: Number(c.totalSpend),
  }));
}

function addCustomer(c) {
  run(
    `INSERT INTO customers (name,phone,email,address,joinDate,totalOrders,totalSpend,lastOrder,status)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [c.name, c.phone, c.email, c.address, c.joinDate, c.totalOrders, c.totalSpend, c.lastOrder, c.status]
  );
  const [{ id }] = exec("SELECT last_insert_rowid() AS id");
  return Number(id);
}

function updateCustomer(id, data) {
  const fields = Object.entries(data).filter(([k]) => k !== "id");
  if (fields.length === 0) return;
  run(`UPDATE customers SET ${fields.map(([k]) => `${k}=?`).join(",")} WHERE id=?`,
    [...fields.map(([, v]) => v), id]);
}

function deleteCustomer(id) {
  run(`DELETE FROM customers WHERE id=?`, [id]);
}

// ── Services ──────────────────────────────────────────────────────────────────

function getServices() {
  return exec("SELECT * FROM services ORDER BY id").map((s) => ({
    ...s, id: Number(s.id), price: Number(s.price), active: s.active === 1,
  }));
}

function addService(s) {
  run(
    `INSERT INTO services (name,desc,price,unit,duration,active,color) VALUES (?,?,?,?,?,?,?)`,
    [s.name, s.desc, s.price, s.unit, s.duration, s.active ? 1 : 0, s.color]
  );
}

function updateService(id, data) {
  const fields = Object.entries(data)
    .filter(([k]) => k !== "id")
    .map(([k, v]) => [k, k === "active" ? (v ? 1 : 0) : v]);
  if (fields.length === 0) return;
  run(`UPDATE services SET ${fields.map(([k]) => `${k}=?`).join(",")} WHERE id=?`,
    [...fields.map(([, v]) => v), id]);
}

function deleteService(id) {
  run(`DELETE FROM services WHERE id=?`, [id]);
}

// ── Inventory ─────────────────────────────────────────────────────────────────

function getInventory() {
  return exec("SELECT * FROM inventory ORDER BY id").map((i) => ({
    ...i, id: Number(i.id), stock: Number(i.stock), minStock: Number(i.minStock), price: Number(i.price),
  }));
}

function addInventoryItem(item) {
  run(
    `INSERT INTO inventory (sku,name,category,unit,stock,minStock,price,supplier,lastRestock,color,icon)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [item.sku, item.name, item.category, item.unit, item.stock, item.minStock,
     item.price, item.supplier, item.lastRestock, item.color, item.icon]
  );
}

function updateInventoryItem(id, data) {
  const fields = Object.entries(data).filter(([k]) => k !== "id");
  if (fields.length === 0) return;
  run(`UPDATE inventory SET ${fields.map(([k]) => `${k}=?`).join(",")} WHERE id=?`,
    [...fields.map(([, v]) => v), id]);
}

function deleteInventoryItem(id) {
  run(`DELETE FROM inventory WHERE id=?`, [id]);
}

// ── Stock History ─────────────────────────────────────────────────────────────

function getStockHistory() {
  return exec("SELECT * FROM stock_history ORDER BY id DESC").map((h) => ({
    ...h, id: Number(h.id), qty: Number(h.qty), saldo: Number(h.saldo),
  }));
}

function addStockEntry(entry) {
  run(
    `INSERT INTO stock_history (date,time,sku,name,type,qty,unit,keterangan,saldo)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [entry.date, entry.time, entry.sku, entry.name, entry.type,
     entry.qty, entry.unit, entry.keterangan, entry.saldo]
  );
}

// ── Treasury ──────────────────────────────────────────────────────────────────

function getTreasury() {
  return exec("SELECT * FROM treasury ORDER BY id DESC").map((t) => ({
    ...t, id: Number(t.id), amount: Number(t.amount),
  }));
}

function addTreasuryEntry(entry) {
  run(
    `INSERT INTO treasury (date,time,type,amount,employee,reason) VALUES (?,?,?,?,?,?)`,
    [entry.date, entry.time, entry.type, entry.amount, entry.employee, entry.reason]
  );
}

// ── Settings ──────────────────────────────────────────────────────────────────

function getSetting(key) {
  const r = exec("SELECT value FROM settings WHERE key=?", [key]);
  return r.length > 0 ? r[0].value : null;
}

function setSetting(key, value) {
  run(`INSERT OR REPLACE INTO settings VALUES (?,?)`, [key, value]);
}

// ── Reports ───────────────────────────────────────────────────────────────────

function getMonthlyReport() {
  // SQL-computed monthly stats from real order data
  const liveMonths = exec(`
    SELECT
      CASE
        WHEN date LIKE '%يناير%' THEN 'يناير'
        WHEN date LIKE '%فبراير%' THEN 'فبراير'
        WHEN date LIKE '%مارس%' THEN 'مارس'
        WHEN date LIKE '%أبريل%' THEN 'أبريل'
        WHEN date LIKE '%مايو%' THEN 'مايو'
        WHEN date LIKE '%يونيو%' THEN 'يونيو'
        ELSE 'أخرى'
      END AS month,
      SUM(CASE WHEN status != 'batal' THEN total ELSE 0 END) AS pendapatan,
      COUNT(CASE WHEN status != 'batal' THEN 1 END) AS "order"
    FROM orders
    GROUP BY month
  `);
  // Merge with static historical data for months not in the DB
  const historical = [
    { month: "يناير", pendapatan: 28500000, order: 312, pelanggan: 28 },
    { month: "فبراير", pendapatan: 24200000, order: 276, pelanggan: 22 },
    { month: "مارس",  pendapatan: 31800000, order: 358, pelanggan: 34 },
    { month: "أبريل", pendapatan: 29100000, order: 334, pelanggan: 29 },
    { month: "مايو",  pendapatan: 33600000, order: 374, pelanggan: 31 },
    { month: "يونيو", pendapatan: 0,         order: 0,   pelanggan: 0  },
  ];
  const live = Object.fromEntries(liveMonths.map((r) => [r.month, r]));
  return historical.map((h) => {
    const l = live[h.month];
    return l
      ? { month: h.month, pendapatan: Number(l.pendapatan) || h.pendapatan, order: Number(l.order) || h.order, pelanggan: h.pelanggan }
      : h;
  });
}

function getWeeklyChart() {
  const days = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
  const base = [
    { day: "الاثنين",   pendapatan: 1850000, transaksi: 24 },
    { day: "الثلاثاء",  pendapatan: 2340000, transaksi: 31 },
    { day: "الأربعاء",  pendapatan: 1920000, transaksi: 26 },
    { day: "الخميس",   pendapatan: 2780000, transaksi: 37 },
    { day: "الجمعة",   pendapatan: 3120000, transaksi: 43 },
    { day: "السبت",    pendapatan: 2460000, transaksi: 33 },
    { day: "الأحد",    pendapatan: 0,        transaksi: 0 },
  ];
  // Override today's entry with live data
  const todayOrders = exec(`SELECT SUM(total) AS rev, COUNT(*) AS cnt FROM orders WHERE date='5 يونيو 2026' AND status!='batal'`);
  if (todayOrders.length > 0) {
    const last = base[base.length - 1];
    last.pendapatan = Number(todayOrders[0].rev) || 0;
    last.transaksi  = Number(todayOrders[0].cnt) || 0;
  }
  return base;
}

function factoryReset() {
  db.run(`DELETE FROM orders`);
  db.run(`DELETE FROM stock_history`);
  db.run(`DELETE FROM treasury`);
  db.run(`DELETE FROM customers`);
  db.run(`DELETE FROM services`);
  db.run(`DELETE FROM inventory`);
  // Re-seed config tables (services + inventory + test customer)
  seedData();
}

module.exports = {
  initDatabase,
  persistDb,
  getOrders, addOrder, updateOrder, deleteOrder,
  getCustomers, addCustomer, updateCustomer, deleteCustomer,
  getServices, addService, updateService, deleteService,
  getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem,
  getStockHistory, addStockEntry,
  getTreasury, addTreasuryEntry,
  getSetting, setSetting,
  getMonthlyReport, getWeeklyChart,
  factoryReset,
};
