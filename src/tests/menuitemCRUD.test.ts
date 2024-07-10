import { describe, it, expect, beforeEach } from "vitest";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import {
  createMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
} from "../functions/crud";

const db = drizzle(new Database("db/testdb.sqlite"));

describe("Menu Items CRUD", () => {
  it("should create a new menu item", async () => {
    const newMenuItem = {
      name: "Pizza",
      price: 12.99,
    };
    const result = await createMenuItem(db, newMenuItem);
    expect(result).toBeTruthy();
    const menuItems = await getMenuItems(db);
    expect(menuItems.length).toBe(1);
    expect(menuItems[0]).toMatchObject(newMenuItem);
  });

  it("should retrieve menu item by ID", async () => {
    const newMenuItem = {
      name: "Burger",
      price: 9.99,
    };
    await createMenuItem(db, newMenuItem);
    const menuItem = await getMenuItemById(db, 1);
    expect(menuItem).toMatchObject(newMenuItem);
  });

  it("should update menu item details", async () => {
    const newMenuItem = {
      name: "Salad",
      price: 7.99,
    };
    await createMenuItem(db, newMenuItem);
    const updatedMenuItem = { price: 8.99 };
    await updateMenuItem(db, 1, updatedMenuItem);
    const menuItem = await getMenuItemById(db, 1);
    expect(menuItem[0].price).toBe(updatedMenuItem.price);
  });

  it("should delete a menu item", async () => {
    const newMenuItem = {
      name: "Pasta",
      price: 10.99,
    };
    await createMenuItem(db, newMenuItem);
    await deleteMenuItem(db, 1);
    const menuItems = await getMenuItems(db);
    expect(menuItems).toHaveLength(0);
  });
});
