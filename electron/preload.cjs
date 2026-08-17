"use strict";
const { contextBridge, ipcRenderer } = require("electron");

const invoke = (channel, ...args) => ipcRenderer.invoke(channel, ...args);

contextBridge.exposeInMainWorld("electronAPI", {
  // Orders
  getOrders:     ()             => invoke("db:orders:get"),
  addOrder:      (order)        => invoke("db:orders:add", order),
  updateOrder:   (id, data)     => invoke("db:orders:update", id, data),
  deleteOrder:   (id)           => invoke("db:orders:delete", id),

  // Customers
  getCustomers:  ()             => invoke("db:customers:get"),
  addCustomer:   (c)            => invoke("db:customers:add", c),
  updateCustomer:(id, data)     => invoke("db:customers:update", id, data),
  deleteCustomer:(id)           => invoke("db:customers:delete", id),

  // Services
  getServices:   ()             => invoke("db:services:get"),
  addService:    (s)            => invoke("db:services:add", s),
  updateService: (id, data)     => invoke("db:services:update", id, data),
  deleteService: (id)           => invoke("db:services:delete", id),

  // Inventory
  getInventory:       ()        => invoke("db:inventory:get"),
  addInventoryItem:   (item)    => invoke("db:inventory:add", item),
  updateInventoryItem:(id, data)=> invoke("db:inventory:update", id, data),
  deleteInventoryItem:(id)      => invoke("db:inventory:delete", id),

  // Stock history
  getStockHistory: ()           => invoke("db:stock:get"),
  addStockEntry:   (entry)      => invoke("db:stock:add", entry),

  // Treasury
  getTreasury:      ()          => invoke("db:treasury:get"),
  addTreasuryEntry: (entry)     => invoke("db:treasury:add", entry),

  // Settings
  getSetting: (key)             => invoke("db:settings:get", key),
  setSetting: (key, value)      => invoke("db:settings:set", key, value),

  // Reports
  getMonthlyReport: ()          => invoke("db:reports:monthly"),
  getWeeklyChart:   ()          => invoke("db:reports:weekly"),

  // Factory reset
  factoryReset: ()              => invoke("db:factory:reset"),
});
