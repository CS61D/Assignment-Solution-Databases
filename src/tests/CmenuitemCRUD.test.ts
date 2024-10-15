import { describe, it, expect, beforeAll } from "vitest";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import {
  createMenuItem,
  getMenuItemById,
  updateMenuItemById,
  deleteMenuItemById,
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
describe("Menu Items CRUD Operations", () => {
  it("should create a menu item", async () => {
    const testMenuItem = {
      name: "Fries",
      price: 4.99,
    };
    const result = await createMenuItem(db, testMenuItem);
    expect(result).toBeDefined();
    expect(result.lastInsertRowid).toBeDefined();
  });

  it("should retrieve a menu item by ID", async () => {
    const testMenuItem = {
      name: "Ice cream",
      price: 4.5,
    };
    // Create a menu item first
    const createdItem = await createMenuItem(db, testMenuItem);

    const menuItem = await getMenuItemById(
      db,
      Number(createdItem.lastInsertRowid)
    );
    expect(menuItem[0]).toBeDefined(); // Should return a menu item
    expect(menuItem[0]).toEqual(
      expect.objectContaining({
        name: testMenuItem.name,
        price: testMenuItem.price,
      })
    );
  });

  it("should update a menu item by ID", async () => {
    const testMenuItem = {
      name: "Cheeseburger",
      price: 9.99,
    };
    // Create a menu item first
    const createdItem = await createMenuItem(db, testMenuItem);

    const updatedData = {
      name: "Double Cheeseburger",
      price: 12.99,
    };

    await updateMenuItemById(
      db,
      Number(createdItem.lastInsertRowid),
      updatedData
    );

    const updatedMenuItem = await getMenuItemById(
      db,
      Number(createdItem.lastInsertRowid)
    );
    expect(updatedMenuItem[0]).toEqual(
      expect.objectContaining({
        id: Number(createdItem.lastInsertRowid), // ID should remain the same
        name: updatedData.name,
        price: updatedData.price,
      })
    );
  });

  it("should delete a menu item by ID", async () => {
    const testMenuItem = {
      name: "Pizza",
      price: 12.99,
    };
    // Create a menu item first
    const createdItem = await createMenuItem(db, testMenuItem);

    await deleteMenuItemById(db, Number(createdItem.lastInsertRowid));
    const menuItem = await getMenuItemById(
      db,
      Number(createdItem.lastInsertRowid)
    );
    expect(menuItem[0]).toBeUndefined(); // Should return no menu item
  });
});
