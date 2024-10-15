import { describe, it, expect, beforeAll } from "vitest";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  createCustomer,
} from "../functions/crud";
import { eq, sql } from "drizzle-orm/sql";

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

describe("Orders CRUD Operations", () => {
  const testCustomer = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "1234567890",
  };

  let customerId: number;

  beforeAll(async () => {
    // Create a customer before running order tests
    const createdCustomer = await createCustomer(db, testCustomer);
    customerId = Number(createdCustomer.lastInsertRowid); // Capture the customer ID for order creation
  });

  it("should create an order", async () => {
    const testOrder = {
      customerId,
      totalAmount: 29.99,
      orderDate: "2024-10-14",
    };

    const result = await createOrder(db, testOrder);
    expect(result).toBeDefined();
    expect(result.lastInsertRowid).toBeDefined();
  });

  it("should retrieve an order by ID", async () => {
    const testOrder = {
      customerId,
      totalAmount: 18.99,
      orderDate: "2024-10-21",
    };
    // Create an order first
    const createdOrder = await createOrder(db, testOrder);

    const order = await getOrderById(db, Number(createdOrder.lastInsertRowid));
    expect(order).toBeDefined(); // Should return an order
    expect(order).toEqual(
      expect.objectContaining({
        id: Number(createdOrder.lastInsertRowid),
        customer_id: customerId,
        total_amount: testOrder.totalAmount,
        order_date: testOrder.orderDate,
      })
    );
  });

  it("should update an order by ID", async () => {
    const testOrder = {
      customerId,
      totalAmount: 32.99,
      orderDate: "2024-09-14",
    };
    // Create an order first
    const createdOrder = await createOrder(db, testOrder);

    const updatedData = {
      customerId,
      totalAmount: 39.99,
      orderDate: "2024-10-15",
    };

    await updateOrder(db, Number(createdOrder.lastInsertRowid), updatedData);

    const updatedOrder = await getOrderById(
      db,
      Number(createdOrder.lastInsertRowid)
    );
    expect(updatedOrder).toEqual(
      expect.objectContaining({
        id: Number(createdOrder.lastInsertRowid), // ID should remain the same
        customer_id: customerId,
        total_amount: updatedData.totalAmount,
        order_date: updatedData.orderDate,
      })
    );
  });

  it("should delete an order by ID", async () => {
    const testOrder = {
      customerId,
      totalAmount: 22.99,
      orderDate: "2024-10-22",
    };
    // Create an order first
    const createdOrder = await createOrder(db, testOrder);

    await deleteOrder(db, Number(createdOrder.lastInsertRowid));
    const order = await getOrderById(db, Number(createdOrder.lastInsertRowid));
    expect(order).toBeUndefined(); // Should return no order
  });
});
