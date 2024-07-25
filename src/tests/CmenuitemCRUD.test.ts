import { describe, it, expect, beforeAll } from "vitest";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import {
  createMenuItem,
  getMenuItemByName,
  updateMenuItemByName,
  deleteMenuItemByName,
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
describe("Menu Items CRUD", () => {
  const newMenuItem = {
    name: "Pizza",
    price: 12.99,
  };
  it("should create a new menu item", async () => {
    const result = await createMenuItem(db, newMenuItem);
    expect(result).toBeTruthy();
    const menuItem = await getMenuItemByName(db, "Pizza");
    expect(menuItem.length).toBe(1);
    expect(menuItem[0]).toMatchObject(newMenuItem);
  });

  it("should update menu item details", async () => {
    const updatedMenuItem = { price: 8.99 };
    await updateMenuItemByName(db, "Pizza", updatedMenuItem);
    const menuItem = await getMenuItemByName(db, "Pizza");
    expect(menuItem[0].price).toBe(updatedMenuItem.price);
  });

  it("should delete a menu item", async () => {
    await deleteMenuItemByName(db, "Pizza");
    const menuItems = await getMenuItemByName(db, "Pizza");
    expect(menuItems).toHaveLength(0);
  });
});
