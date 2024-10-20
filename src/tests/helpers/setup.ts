import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { sql } from "drizzle-orm/sql";

export const setup = async (
	db: BetterSQLite3Database<Record<string, never>>,
) => {
	// Disable foreign key checks
	db.run(sql`PRAGMA foreign_keys = OFF`);
	db.run(sql`CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE
  )`);
	db.run(sql`CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL
  )`);
	db.run(sql`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    order_date TEXT NOT NULL
  )`);
	db.run(sql`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY,
    order_id INTEGER NOT NULL,
    menu_item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL
  )`);
	// Execute each SQL statement separately
	db.run(sql`DELETE FROM customers`);
	db.run(sql`DELETE FROM menu_items`);
	db.run(sql`DELETE FROM orders`);
	db.run(sql`DELETE FROM order_items`);

	// Re-enable foreign key checks
	db.run(sql`PRAGMA foreign_keys = ON`);
};
