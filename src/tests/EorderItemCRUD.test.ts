import { describe, it, expect, beforeAll } from "vitest";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import {
  createOrderItem,
  getOrderItemsByOrderId,
  updateOrderItem,
  deleteOrderItemsByOrderId,
  createMenuItem,
  createOrder,
  createCustomer,
} from "../functions/crud";
import { eq, or, sql } from "drizzle-orm/sql";

const db = drizzle(new Database("db/testdb.sqlite"));

// Setup: Create the customers table if it does not exist
beforeAll(() => {
  // Disable foreign key checks
  db.run(sql`PRAGMA foreign_keys = OFF`);
  db.run(sql`CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE
  )`);
  db.run(sql`CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL
  )`);
  db.run(sql`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    order_date TEXT NOT NULL
  )`);
  db.run(sql`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY,
    order_id INTEGER NOT NULL,
    menu_item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL
  )`);
  // Execute each SQL statement separately
  db.run(sql`DELETE FROM customers`);
  db.run(sql`DELETE FROM menu_items`);
  db.run(sql`DELETE FROM orders`);
  db.run(sql`DELETE FROM order_items`);

  // Re-enable foreign key checks
  db.run(sql`PRAGMA foreign_keys = ON`);
});

describe("Order Items Functions", () => {
  const testMenuItem = {
    name: "Pasta",
    price: 8.99,
  };

  const testCustomer = {
    name: "John Doe",
    email: "john@example.com",
    phone: "1234567890",
  };

  const testOrder1 = {
    totalAmount: 27.97,
    orderDate: "2024-10-14",
    customerId: 1, // Placeholder, will be updated after creating a customer
  };

  const testOrder2 = {
    totalAmount: 35.96,
    orderDate: "2024-10-15",
    customerId: 1, // Placeholder, will be updated after creating a customer
  };

  const testOrder3 = {
    totalAmount: 19.98,
    orderDate: "2024-10-16",
    customerId: 1, // Placeholder, will be updated after creating a customer
  };

  let customerId: number;
  let orderId1: number;
  let orderId2: number;
  let orderId3: number;
  let menuItemId: number;

  beforeAll(async () => {
    // Create a customer
    const createdCustomer = await createCustomer(db, testCustomer);
    customerId = Number(createdCustomer.lastInsertRowid); // Capture the customer ID

    // Create a menu item
    const createdMenuItem = await createMenuItem(db, testMenuItem);
    menuItemId = Number(createdMenuItem.lastInsertRowid); // Capture the menu item ID
  });

  it("should create an order item", async () => {
    // Create an order with the newly created customer ID
    const createdOrder = await createOrder(db, {
      ...testOrder1,
      customerId, // Use the created customer ID
    });
    orderId1 = Number(createdOrder.lastInsertRowid); // Capture the order ID
    const testOrderItem = {
      orderId: 1, // Placeholder, will be updated after creating an order
      menuItemId: 1, // Placeholder, will be updated after creating a menu item
      quantity: 3,
    };
    const orderItemData = { ...testOrderItem, orderId1, menuItemId };
    const result = await createOrderItem(db, orderItemData);
    expect(result).toBeDefined();
    expect(result.lastInsertRowid).toBeDefined();
  });

  it("should retrieve order items by order ID", async () => {
    // Create an order with the newly created customer ID
    const createdOrder = await createOrder(db, {
      ...testOrder2,
      customerId, // Use the created customer ID
    });
    orderId2 = Number(createdOrder.lastInsertRowid); // Capture the order ID
    const testOrderItem = {
      orderId: 2, // Placeholder, will be updated after creating an order
      menuItemId: 1, // Placeholder, will be updated after creating a menu item
      quantity: 3,
    };
    // Create an order item first
    await createOrderItem(db, {
      ...testOrderItem,
      orderId: orderId2,
      menuItemId,
    });

    const orderItemsList = await getOrderItemsByOrderId(db, orderId2);
    expect(orderItemsList).toBeDefined();
    expect(orderItemsList).toEqual(
      expect.objectContaining({
        orderId: orderId2,
        menuItemId: menuItemId,
        quantity: testOrderItem.quantity,
      })
    );
  });

  it("should update an order item", async () => {
    // Create an order with the newly created customer ID
    const createdOrder = await createOrder(db, {
      ...testOrder1,
      customerId, // Use the created customer ID
    });
    orderId3 = Number(createdOrder.lastInsertRowid); // Capture the order ID
    const testOrderItem = {
      orderId: 3, // Placeholder, will be updated after creating an order
      menuItemId: 1, // Placeholder, will be updated after creating a menu item
      quantity: 3,
    };
    // Create an order item first
    const createdOrderItem = await createOrderItem(db, {
      ...testOrderItem,
      orderId: orderId3,
      menuItemId,
    });

    const updatedData = {
      orderId: orderId3,
      menuItemId,
      quantity: 5, // New quantity
    };

    await updateOrderItem(db, orderId3, menuItemId, updatedData);

    const updatedOrderItems = await getOrderItemsByOrderId(db, orderId3);
    expect(updatedOrderItems).toBeDefined();
    expect(updatedOrderItems).toEqual(
      expect.objectContaining({
        id: Number(createdOrderItem.lastInsertRowid), // ID should remain the same
        orderId: orderId3,
        menuItemId: menuItemId,
        quantity: updatedData.quantity,
      })
    );
  });

  it("should delete order items by order ID", async () => {
    // Create an order item first
    const orderItemsList = await getOrderItemsByOrderId(db, orderId1);
    expect(orderItemsList).toBeDefined();
    await deleteOrderItemsByOrderId(db, orderId1);
    const deletedOrderItems = await getOrderItemsByOrderId(db, orderId1);
    expect(deletedOrderItems).toBeNull();

    const orderItemsList2 = await getOrderItemsByOrderId(db, orderId2);
    expect(orderItemsList2).toBeDefined();
    await deleteOrderItemsByOrderId(db, orderId2);
    const deletedOrderItems2 = await getOrderItemsByOrderId(db, orderId2);
    expect(deletedOrderItems2).toBeNull();

    const orderItemsList3 = await getOrderItemsByOrderId(db, orderId3);
    expect(orderItemsList3).toBeDefined();
    await deleteOrderItemsByOrderId(db, orderId3);
    const deletedOrderItems3 = await getOrderItemsByOrderId(db, orderId3);
    expect(deletedOrderItems3).toBeNull();
  });
});
