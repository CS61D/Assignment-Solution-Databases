import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import {
	createOrder,
	getOrders,
	getOrderById,
	updateOrder,
	deleteOrder,
	createCustomer,
} from "../functions/crud";
import { eq, sql } from "drizzle-orm/sql";

import { setup } from "./helpers/setup";

// Initialize the database
const db = drizzle(new Database("db/testdb.sqlite"));

// Setup: Create the customers table if it does not exist
beforeAll(() => {
	setup(db);
});

describe("Orders CRUD Operations", () => {
	const testCustomer = {
		name: "John Doe",
		email: "john.doe@example.com",
		phone: "1234567890",
	};

	let customerId: number;

	beforeAll(async () => {
		// Create a customer before running order tests
		const createdCustomer = await createCustomer(db, testCustomer);
		customerId = Number(createdCustomer.lastInsertRowid); // Capture the customer ID for order creation
	});

	it("should create an order", async () => {
		const testOrder = {
			customerId,
			totalAmount: 29.99,
			orderDate: "2024-10-14",
		};

		const result = await createOrder(db, testOrder);
		expect(result).toBeDefined();
		expect(result.lastInsertRowid).toBeDefined();
	});
	it("should retrieve all orders", async () => {
		const testOrder1 = {
			customerId,
			totalAmount: 16.99,
			orderDate: "2024-10-23",
		};

		const testOrder2 = {
			customerId,
			totalAmount: 19.99,
			orderDate: "2024-10-24",
		};

		// Create an order first
		const createdOrder1 = await createOrder(db, testOrder1);
		const createOrder2 = await createOrder(db, testOrder2);

		const order1 = await getOrderById(
			db,
			Number(createdOrder1.lastInsertRowid),
		);
		const order2 = await getOrderById(db, Number(createOrder2.lastInsertRowid));
		expect(order1).toBeDefined(); // Should return an order
		expect(order2).toBeDefined(); // Should return an order

		// Retrieve all orders
		const orders = await getOrders(db);
		expect(orders).toBeDefined();
		expect(orders.length).toBeGreaterThanOrEqual(2); // At least 2 orders should be returned
	});

	it("should retrieve an order by ID", async () => {
		const testOrder = {
			customerId,
			totalAmount: 18.99,
			orderDate: "2024-10-21",
		};
		// Create an order first
		const createdOrder = await createOrder(db, testOrder);

		const order = await getOrderById(db, Number(createdOrder.lastInsertRowid));
		expect(order).toBeDefined(); // Should return an order
		expect(order).toEqual(
			expect.objectContaining({
				id: Number(createdOrder.lastInsertRowid),
				customerId: customerId,
				totalAmount: testOrder.totalAmount,
				orderDate: testOrder.orderDate,
			}),
		);
	});

	it("should update an order by ID", async () => {
		const testOrder = {
			customerId,
			totalAmount: 32.99,
			orderDate: "2024-09-14",
		};
		// Create an order first
		const createdOrder = await createOrder(db, testOrder);

		const updatedData = {
			customerId,
			totalAmount: 39.99,
			orderDate: "2024-10-15",
		};

		await updateOrder(db, Number(createdOrder.lastInsertRowid), updatedData);

		const updatedOrder = await getOrderById(
			db,
			Number(createdOrder.lastInsertRowid),
		);
		expect(updatedOrder).toEqual(
			expect.objectContaining({
				id: Number(createdOrder.lastInsertRowid), // ID should remain the same
				customerId: customerId,
				totalAmount: updatedData.totalAmount,
				orderDate: updatedData.orderDate,
			}),
		);
	});

	it("should delete an order by ID", async () => {
		const testOrder = {
			customerId,
			totalAmount: 22.99,
			orderDate: "2024-10-22",
		};
		// Create an order first
		const createdOrder = await createOrder(db, testOrder);

		await deleteOrder(db, Number(createdOrder.lastInsertRowid));
		const order = await getOrderById(db, Number(createdOrder.lastInsertRowid));
		expect(order).toBeNull(); // Should return no order
	});
});
