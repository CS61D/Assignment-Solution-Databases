import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import {
	createMenuItem,
	getMenuItemById,
	updateMenuItemById,
	deleteMenuItemById,
} from "../functions/crud";
import { eq, sql } from "drizzle-orm/sql";
import { setup } from "./helpers/setup";

// Initialize the database
const db = drizzle(new Database("db/testdb.sqlite"));

// Setup: Create the customers table if it does not exist
beforeAll(() => {
	setup(db);
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
			Number(createdItem.lastInsertRowid),
		);
		expect(menuItem).toBeDefined(); // Should return a menu item
		expect(menuItem).toEqual(
			expect.objectContaining({
				name: testMenuItem.name,
				price: testMenuItem.price,
			}),
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
			updatedData,
		);

		const updatedMenuItem = await getMenuItemById(
			db,
			Number(createdItem.lastInsertRowid),
		);
		expect(updatedMenuItem).toEqual(
			expect.objectContaining({
				id: Number(createdItem.lastInsertRowid), // ID should remain the same
				name: updatedData.name,
				price: updatedData.price,
			}),
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
			Number(createdItem.lastInsertRowid),
		);
		expect(menuItem).toBeNull(); // Should return no menu item
	});
});
