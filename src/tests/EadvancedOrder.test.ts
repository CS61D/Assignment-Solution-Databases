import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import {
  createCustomer,
  createMenuItem,
  getOrderById,
  getOrderItemsByOrderId,
  getCustomerByName,
} from "../functions/crud";
import {
  placeOrder,
  getOrdersForCustomer,
  totalSale,
} from "../functions/advanced";
import { customersToOrders, menuItems } from "../schemas/schema";
import { desc, eq, sql } from "drizzle-orm/sql";

// Initialize the database
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
let customerId = 0;
let orderId = 0;
let date = new Date().toISOString().split("T")[0];
let secondOrderId = 0;

describe("Place Order", () => {
  it("should place an order and link it to the customer", async () => {
    // Create a new customer
    const newCustomer = {
      name: "Allison Doe",
      email: "allison.doe@example.com",
      phone: "321-456-7890",
    };
    await createCustomer(db, newCustomer);

    // Verify customer creation
    const customers = await getCustomerByName(db, "Allison Doe");
    expect(customers[0].name).toBe("Allison Doe");
    customerId = customers[0].id;

    // Add menu items
    const menuItem1 = { name: "Burger", price: 10.0 };
    const menuItem2 = { name: "Fries", price: 5.0 };
    await createMenuItem(db, menuItem1);
    await createMenuItem(db, menuItem2);

    // Fetch menu item IDs
    const menuItems1 = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.name, "Burger"));
    const menuItems2 = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.name, "Fries"));
    const menuItemId1 = menuItems1[0].id;
    const menuItemId2 = menuItems2[0].id;

    // Place an order
    const orderData = {
      customerId,
      items: [
        { menuItemId: menuItemId1, quantity: 2 },
        { menuItemId: menuItemId2, quantity: 3 },
      ],
    };
    const result = await placeOrder(db, orderData);

    // Verify the order is placed successfully
    expect(result.success).toBe(true);
    orderId = result.orderId;

    // Verify the order is created
    const order = await getOrderById(db, orderId);
    expect(order).toHaveLength(1);
    expect(order[0].id).toBe(orderId);

    // Verify order items are created
    const orderItems = await getOrderItemsByOrderId(db, orderId);
    expect(orderItems).toHaveLength(2);
    expect(orderItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          orderId,
          menuItemId: menuItemId1,
          quantity: 2,
        }),
        expect.objectContaining({
          orderId,
          menuItemId: menuItemId2,
          quantity: 3,
        }),
      ])
    );

    // Verify customers_to_orders is updated
    const customerOrderLinks = await db
      .select()
      .from(customersToOrders)
      .where(eq(customersToOrders.customerId, customerId))
      .where(eq(customersToOrders.orderId, orderId));
    expect(customerOrderLinks).toHaveLength(1);
    expect(customerOrderLinks[0]).toEqual(
      expect.objectContaining({ customerId, orderId })
    );
  });

  it("the same customer should be able to place another order", async () => {
    // Add menu items
    const menuItem3 = { name: "Pizza", price: 15.0 };
    await createMenuItem(db, menuItem3);

    // Fetch menu item ID
    const menuItems3 = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.name, "Pizza"));
    const menuItemId3 = menuItems3[0].id;

    // Place another order
    const orderData = {
      customerId,
      items: [{ menuItemId: menuItemId3, quantity: 1 }],
    };
    const result = await placeOrder(db, orderData);

    // Verify the order is placed successfully
    expect(result.success).toBe(true);
    secondOrderId = result.orderId;

    // Verify the order is created
    const order = await getOrderById(db, secondOrderId);
    expect(order).toHaveLength(1);
    expect(order[0].id).toBe(secondOrderId);

    // Verify order items are created
    const orderItems = await getOrderItemsByOrderId(db, secondOrderId);
    expect(orderItems).toHaveLength(1);
    expect(orderItems[0]).toEqual(
      expect.objectContaining({
        orderId: secondOrderId,
        menuItemId: menuItemId3,
        quantity: 1,
      })
    );

    // Verify customers_to_orders is updated
    const customerOrderLinks = await db
      .select()
      .from(customersToOrders)
      .where(eq(customersToOrders.customerId, customerId))
      .where(eq(customersToOrders.orderId, secondOrderId));
    expect(customerOrderLinks[0]).toEqual(
      expect.objectContaining({ customerId, orderId: secondOrderId })
    );
  });
});

describe("Get All Orders for Customer", () => {
  it("should retrieve the order placed by the customer", async () => {
    const orders = await getOrdersForCustomer(db, customerId);
    // expect(orders).toHaveLength(2);
    expect(orders[0][0].id).toBe(orderId);
    expect(orders[1][0].id).toBe(secondOrderId);
  });
});

describe("Get Total Sale By Date", () => {
  it("should get the total sales for the two orders that the cutsomer placed", async () => {
    const total = await totalSale(db, { date });
    expect(total.totalSales).toBe(50);
  });
});
