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
  const allOrders = exec(`SELECT date, total FROM orders WHERE status != 'batal'`);
  const byMonth = {};
  allOrders.forEach((o) => {
    const parts = String(o.date || "").split(" ");
    if (parts.length >= 2) {
      const month = parts[1];
      if (!byMonth[month]) byMonth[month] = { pendapatan: 0, order: 0 };
      byMonth[month].pendapatan += Number(o.total) || 0;
      byMonth[month].order += 1;
    }
  });
  return Object.entries(byMonth).map(([month, data]) => ({
    month,
    pendapatan: data.pendapatan,
    order: data.order,
    pelanggan: 0,
  }));
}

function getWeeklyChart() {
  const months = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  const dayNames = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    const q = exec(
      `SELECT COALESCE(SUM(total),0) AS rev, COUNT(*) AS cnt FROM orders WHERE date=? AND status!='batal'`,
      [dateStr]
    );
    result.push({
      day: dayNames[d.getDay()],
      pendapatan: Number(q[0]?.rev) || 0,
      transaksi: Number(q[0]?.cnt) || 0,
    });
  }
  return result;
}

function factoryReset() {
  db.run(`DELETE FROM orders`);
  db.run(`DELETE FROM stock_history`);
  db.run(`DELETE FROM treasury`);
  db.run(`DELETE FROM customers`);
  db.run(`DELETE FROM services`);
  db.run(`DELETE FROM inventory`);
  db.run(`DELETE FROM settings`);
  // Re-seed default services, test customer, and default settings
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
