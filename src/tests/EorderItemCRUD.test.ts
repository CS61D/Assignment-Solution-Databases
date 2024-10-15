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

beforeAll(() => {
  // Disable foreign key checks
  db.run(sql`PRAGMA foreign_keys = OFF`);

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

  const testOrder = {
    totalAmount: 27.97,
    orderDate: "2024-10-14",
    customerId: 1, // Placeholder, will be updated after creating a customer
  };

  const testOrderItem = {
    orderId: 1, // Placeholder, will be updated after creating an order
    menuItemId: 1, // Placeholder, will be updated after creating a menu item
    quantity: 3,
  };

  let customerId: number;
  let orderId: number;
  let menuItemId: number;

  beforeAll(async () => {
    // Create a customer
    const createdCustomer = await createCustomer(db, testCustomer);
    customerId = Number(createdCustomer.lastInsertRowid); // Capture the customer ID

    // Create a menu item
    const createdMenuItem = await createMenuItem(db, testMenuItem);
    menuItemId = Number(createdMenuItem.lastInsertRowid); // Capture the menu item ID

    // Create an order with the newly created customer ID
    const createdOrder = await createOrder(db, {
      ...testOrder,
      customerId, // Use the created customer ID
    });
    orderId = Number(createdOrder.lastInsertRowid); // Capture the order ID
  });

  it("should create an order item", async () => {
    const orderItemData = { ...testOrderItem, orderId, menuItemId };
    const result = await createOrderItem(db, orderItemData);
    expect(result).toBeDefined();
    expect(result.lastInsertRowid).toBeDefined();
  });

  it("should retrieve order items by order ID", async () => {
    // Create an order item first
    await createOrderItem(db, { ...testOrderItem, orderId, menuItemId });

    const orderItemsList = await getOrderItemsByOrderId(db, orderId);
    expect(orderItemsList).toBeDefined();
    expect(orderItemsList).toHaveLength(1); // Expect one order item
    expect(orderItemsList[0]).toEqual(
      expect.objectContaining({
        order_id: orderId,
        menu_item_id: menuItemId,
        quantity: testOrderItem.quantity,
      })
    );
  });

  it("should update an order item", async () => {
    // Create an order item first
    const createdOrderItem = await createOrderItem(db, {
      ...testOrderItem,
      orderId,
      menuItemId,
    });

    const updatedData = {
      orderId,
      menuItemId,
      quantity: 5, // New quantity
    };

    await updateOrderItem(db, orderId, menuItemId, updatedData);

    const updatedOrderItems = await getOrderItemsByOrderId(db, orderId);
    expect(updatedOrderItems).toHaveLength(1); // Still should be one item
    expect(updatedOrderItems[0]).toEqual(
      expect.objectContaining({
        id: Number(createdOrderItem.lastInsertRowid), // ID should remain the same
        order_id: orderId,
        menu_item_id: menuItemId,
        quantity: updatedData.quantity,
      })
    );
  });

  it("should delete order items by order ID", async () => {
    // Create an order item first
    await createOrderItem(db, { ...testOrderItem, orderId, menuItemId });

    await deleteOrderItemsByOrderId(db, orderId);
    const orderItemsList = await getOrderItemsByOrderId(db, orderId);
    expect(orderItemsList).toHaveLength(0); // Should return no order items
  });
});
