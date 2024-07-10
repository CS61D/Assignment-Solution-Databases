import { describe, it, expect, beforeEach } from "vitest";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../functions/crud";

const db = drizzle(new Database("db/testdb.sqlite"));

describe("Orders CRUD", () => {
  it("should create a new order", async () => {
    const newOrder = {
      totalAmount: 50.0,
      orderDate: "2024-07-01",
    };
    const result = await createOrder(db, newOrder);
    expect(result).toBeTruthy();
    const orders = await getOrders(db);
    expect(orders.length).toBe(1);
    expect(orders[0]).toMatchObject(newOrder);
  });

  it("should retrieve order by ID", async () => {
    const newOrder = {
      totalAmount: 60.0,
      orderDate: "2024-07-02",
    };
    await createOrder(db, newOrder);
    const order = await getOrderById(db, 1);
    expect(order).toMatchObject(newOrder);
  });

  it("should update order details", async () => {
    const newOrder = {
      totalAmount: 70.0,
      orderDate: "2024-07-03",
    };
    await createOrder(db, newOrder);
    const updatedOrder = { totalAmount: 80.0 };
    await updateOrder(db, 1, updatedOrder);
    const order = await getOrderById(db, 1);
    expect(order[0].totalAmount).toBe(updatedOrder.totalAmount);
  });

  it("should delete an order", async () => {
    const newOrder = {
      totalAmount: 90.0,
      orderDate: "2024-07-04",
    };
    await createOrder(db, newOrder);
    await deleteOrder(db, 1);
    const orders = await getOrders(db);
    expect(orders).toHaveLength(0);
  });
});
