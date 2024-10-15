import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3"; // Ensure correct import based on your setup
import {
  placeOrder,
  totalSale,
  suggestMenuItemsForCustomer,
} from "../functions/advanced";
import { createCustomer, createMenuItem } from "../functions/crud";
import { orders, orderItems } from "../schemas/schema";
import { eq, sql } from "drizzle-orm/sql";

// Initialize the database
const db = drizzle(new Database("db/testdb.sqlite"));

beforeAll(() => {
  // Disable foreign key checks
  db.run(sql`PRAGMA foreign_keys = OFF`);

  // Clear the tables before each test
  db.run(sql`DELETE FROM order_items`);
  db.run(sql`DELETE FROM orders`);
  db.run(sql`DELETE FROM menu_items`);
  db.run(sql`DELETE FROM customers`);

  // Re-enable foreign key checks
  db.run(sql`PRAGMA foreign_keys = ON`);
});

describe("Order Functions", () => {
  const testCustomer = {
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "9876543210",
  };

  const testMenuItem = {
    name: "Burger",
    price: 10.99,
  };

  const testOrderData = {
    customer: testCustomer,
    items: [
      {
        menuItemId: 1, // Placeholder, will be updated after creating a menu item
        quantity: 2,
      },
    ],
  };

  let customerId: number;
  let menuItemId: number;

  beforeAll(async () => {
    // Create a customer
    const createdCustomer = await createCustomer(db, testCustomer);
    customerId = Number(createdCustomer.lastInsertRowid); // Capture the customer ID

    // Create a menu item
    const createdMenuItem = await createMenuItem(db, testMenuItem);
    menuItemId = Number(createdMenuItem.lastInsertRowid); // Capture the menu item ID

    // Update the test order data with the valid menu item ID
    testOrderData.items[0].menuItemId = menuItemId;
  });

  it("should place an order and create a customer if not exists", async () => {
    const result = await placeOrder(db, testOrderData);
    expect(result).toBeDefined();
    expect(result).toHaveProperty("orderId"); // Ensure an order ID is returned

    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, Number(result.orderId)));
    expect(order).toHaveLength(1);
    expect(order[0]).toEqual(
      expect.objectContaining({
        customerId: customerId, // Ensure the order is linked to the correct customer
      })
    );

    // Validate the order items
    const orderItem = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, Number(result.orderId)));
    expect(orderItem).toHaveLength(1);
    expect(orderItem[0]).toEqual(
      expect.objectContaining({
        menu_item_id: menuItemId,
        quantity: testOrderData.items[0].quantity,
      })
    );
  });

  it("should calculate total sales for a specific day", async () => {
    // Place an order to have sales data
    await placeOrder(db, testOrderData);

    const date = new Date().toISOString().split("T")[0]; // Get today's date
    const result = await totalSale(db, { date });

    expect(result).toBeDefined();
    expect(result.totalSales).toBeGreaterThan(0); // Ensure total sales is greater than 0
  });

  it("should suggest menu items for a customer based on order history", async () => {
    // Place an order to have order history
    await placeOrder(db, testOrderData);

    const result = await suggestMenuItemsForCustomer(db, testCustomer.phone);

    expect(result).toBeDefined();
    expect(result.recommendedItems).toHaveLength(1); // Expect at least one recommended item
    expect(result.recommendedItems[0]).toHaveProperty(
      "name",
      testMenuItem.name
    ); // Check the recommended item matches
  });
});
