"use strict";
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const db = require("./database.cjs");

const isDev = process.env.NODE_ENV === "development" || process.env.ELECTRON_DEV === "true";

let mainWindow = null;
let userDataPath = null;

// ── Window ────────────────────────────────────────────────────────────────────

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: "دينور لاندري — نظام إدارة المغسلة",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: "#EEF2F7",
    show: false,
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.once("ready-to-show", () => mainWindow.show());

  mainWindow.on("close", () => {
    if (userDataPath) db.persistDb(userDataPath);
  });
}

// ── App lifecycle ─────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  userDataPath = app.getPath("userData");
  await db.initDatabase(userDataPath);
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (userDataPath) db.persistDb(userDataPath);
  if (process.platform !== "darwin") app.quit();
});

// Persist on graceful exit
process.on("exit", () => { if (userDataPath) db.persistDb(userDataPath); });

// ── IPC handlers ──────────────────────────────────────────────────────────────

function handle(channel, fn) {
  ipcMain.handle(channel, async (_event, ...args) => {
    try {
      const result = fn(...args);
      if (userDataPath) db.persistDb(userDataPath);
      return { ok: true, data: result };
    } catch (err) {
      console.error(`IPC error [${channel}]:`, err);
      return { ok: false, error: err.message };
    }
  });
}

function handleRead(channel, fn) {
  ipcMain.handle(channel, async (_event, ...args) => {
    try {
      return { ok: true, data: fn(...args) };
    } catch (err) {
      console.error(`IPC error [${channel}]:`, err);
      return { ok: false, error: err.message };
    }
  });
}

// Orders
handleRead("db:orders:get",    ()              => db.getOrders());
handle("db:orders:add",        (order)         => db.addOrder(order));
handle("db:orders:update",     (id, data)      => db.updateOrder(id, data));
handle("db:orders:delete",     (id)            => db.deleteOrder(id));

// Customers
handleRead("db:customers:get", ()              => db.getCustomers());
handle("db:customers:add",     (c)             => db.addCustomer(c));
handle("db:customers:update",  (id, data)      => db.updateCustomer(id, data));
handle("db:customers:delete",  (id)            => db.deleteCustomer(id));

// Services
handleRead("db:services:get",  ()              => db.getServices());
handle("db:services:add",      (s)             => db.addService(s));
handle("db:services:update",   (id, data)      => db.updateService(id, data));
handle("db:services:delete",   (id)            => db.deleteService(id));

// Inventory
handleRead("db:inventory:get", ()              => db.getInventory());
handle("db:inventory:add",     (item)          => db.addInventoryItem(item));
handle("db:inventory:update",  (id, data)      => db.updateInventoryItem(id, data));
handle("db:inventory:delete",  (id)            => db.deleteInventoryItem(id));

// Stock history
handleRead("db:stock:get",     ()              => db.getStockHistory());
handle("db:stock:add",         (entry)         => db.addStockEntry(entry));

// Treasury
handleRead("db:treasury:get",  ()              => db.getTreasury());
handle("db:treasury:add",      (entry)         => db.addTreasuryEntry(entry));

// Settings
handleRead("db:settings:get",  (key)           => db.getSetting(key));
handle("db:settings:set",      (key, value)    => db.setSetting(key, value));

// Reports
handleRead("db:reports:monthly", ()            => db.getMonthlyReport());
handleRead("db:reports:weekly",  ()            => db.getWeeklyChart());

// Factory reset
handle("db:factory:reset",       ()            => db.factoryReset());
