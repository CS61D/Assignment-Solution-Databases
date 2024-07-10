import { describe, it, expect, beforeEach } from "vitest";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import {
  createOrderItem,
  getOrderItemById,
  getOrderItemsByOrderId,
  updateOrderItem,
  deleteOrderItem,
} from "../functions/crud";

const db = drizzle(new Database("db/testdb.sqlite"));

describe("Order Items CRUD", () => {
  it("should create a new order item", async () => {
    const newOrderItem = {
      orderId: 1,
      menuItemId: 1,
      quantity: 2,
    };
    const result = await createOrderItem(db, newOrderItem);
    expect(result).toBeTruthy();
    const orderItem = await getOrderItemById(db, 1);
    expect(orderItem).toMatchObject(newOrderItem);
  });

  it("should retrieve order items by order ID", async () => {
    const newOrderItem = {
      orderId: 1,
      menuItemId: 2,
      quantity: 1,
    };
    await createOrderItem(db, newOrderItem);
    const orderItems = await getOrderItemsByOrderId(db, 1);
    expect(orderItems.length).toBe(1);
    expect(orderItems[0]).toMatchObject(newOrderItem);
  });

  it("should update order item details", async () => {
    const newOrderItem = {
      orderId: 1,
      menuItemId: 3,
      quantity: 3,
    };
    await createOrderItem(db, newOrderItem);
    const updatedOrderItem = { quantity: 4 };
    await updateOrderItem(db, 1, updatedOrderItem);
    const orderItem = await getOrderItemById(db, 1);
    expect(orderItem[0].quantity).toBe(updatedOrderItem.quantity);
  });

  it("should delete an order item", async () => {
    const newOrderItem = {
      orderId: 1,
      menuItemId: 4,
      quantity: 2,
    };
    await createOrderItem(db, newOrderItem);
    await deleteOrderItem(db, 1);
    const orderItems = await getOrderItemsByOrderId(db, 1);
    expect(orderItems).toHaveLength(0);
  });
});
