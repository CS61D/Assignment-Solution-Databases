import { describe, it, expect, beforeAll } from "vitest";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
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
  db.run(sql`DELETE FROM customers_to_orders`);

  // Re-enable foreign key checks
  db.run(sql`PRAGMA foreign_keys = ON`);
});

describe("Orders CRUD", () => {
  const newOrder = {
    totalAmount: 50.0,
    orderDate: "2024-07-01",
  };
  let newOrderId = 0;
  it("should create a new order", async () => {
    const result = await createOrder(db, newOrder);
    expect(result).toBeTruthy();
    const orders = await getOrders(db);
    expect(orders.length).toBe(1);
    newOrderId = orders[0].id;
  });

  it("should retrieve order by ID", async () => {
    const order = await getOrderById(db, newOrderId);
    expect(order[0].totalAmount).toMatchObject(newOrder.totalAmount);
    expect(order[0].orderDate).toMatchObject(newOrder.orderDate);
  });

  it("should update order details", async () => {
    const updatedOrder = { totalAmount: 80.0 };
    await updateOrder(db, newOrderId, updatedOrder);
    const order = await getOrderById(db, newOrderId);
    expect(order[0].totalAmount).toBe(updatedOrder.totalAmount);
  });

  it("should delete an order", async () => {
    await deleteOrder(db, newOrderId);
    const orders = await getOrderById(db, newOrderId);
    expect(orders).toHaveLength(0);
  });
});
