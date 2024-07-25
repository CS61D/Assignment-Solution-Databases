import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Database from "better-sqlite3";

// Initialize the database
const db = new Database("db/testdb.sqlite");

beforeAll(() => {
  // Setup: clear tables if necessary
  db.exec("PRAGMA foreign_keys = OFF");
  db.exec("DELETE FROM customers");
  db.exec("DELETE FROM menu_items");
  db.exec("DELETE FROM orders");
  db.exec("DELETE FROM order_items");
  db.exec("DELETE FROM customers_to_orders");
  db.exec("PRAGMA foreign_keys = ON");
});

describe("Schema Validation", () => {
  it("should have the correct tables", () => {
    const tables = db.prepare("SELECT name FROM sqlite_master;").all();
    const tableNames = tables.map((table) => table.name);

    expect(tableNames).toContain("customers");
    expect(tableNames).toContain("menu_items");
    expect(tableNames).toContain("orders");
    expect(tableNames).toContain("order_items");
    expect(tableNames).toContain("customers_to_orders");
  });

  it("should have correct columns in customers table", () => {
    const columns = db.prepare("PRAGMA table_info(customers);").all();
    const columnNames = columns.map((col) => col.name);

    expect(columnNames).toEqual(
      expect.arrayContaining(["id", "name", "email", "phone"])
    );
  });

  it("should have correct columns in menu_items table", () => {
    const columns = db.prepare("PRAGMA table_info(menu_items);").all();
    const columnNames = columns.map((col) => col.name);

    expect(columnNames).toEqual(
      expect.arrayContaining(["id", "name", "price"])
    );
  });

  it("should have correct columns in orders table", () => {
    const columns = db.prepare("PRAGMA table_info(orders);").all();
    const columnNames = columns.map((col) => col.name);

    expect(columnNames).toEqual(
      expect.arrayContaining(["id", "total_amount", "order_date"])
    );
  });

  it("should have correct columns in order_items table", () => {
    const columns = db.prepare("PRAGMA table_info(order_items);").all();
    const columnNames = columns.map((col) => col.name);

    expect(columnNames).toEqual(
      expect.arrayContaining(["id", "order_id", "menu_item_id", "quantity"])
    );
  });

  it("should have correct columns in customers_to_orders table", () => {
    const columns = db.prepare("PRAGMA table_info(customers_to_orders);").all();
    const columnNames = columns.map((col) => col.name);

    expect(columnNames).toEqual(
      expect.arrayContaining(["customer_id", "order_id"])
    );
  });

  it("should have correct foreign key relationships", () => {
    const foreignKeys = db
      .prepare("PRAGMA foreign_key_list(customers_to_orders);")
      .all();

    expect(foreignKeys).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          from: "customer_id",
          to: "id",
          table: "customers",
        }),
        expect.objectContaining({
          from: "order_id",
          to: "id",
          table: "orders",
        }),
      ])
    );
  });

  // Additional tests can be added to check relations and other constraints
});
