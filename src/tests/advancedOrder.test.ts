import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3"; // Ensure correct import based on your setup
import {
	placeOrder,
	totalSale,
	suggestMenuItemsForCustomer,
} from "../functions/advanced";
import {
	createCustomer,
	createMenuItem,
	deleteOrder,
	getCustomerByPhone,
	getOrderById,
} from "../functions/crud";
import { orders, orderItems } from "../schemas/schema";
import { eq, sql } from "drizzle-orm/sql";
import { setup } from "./helpers/setup";

const db = drizzle(new Database("db/testdb.sqlite"));

// Setup: Create the customers table if it does not exist
beforeAll(() => {
	setup(db);
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

	const testMenuItem2 = {
		name: "Pizza",
		price: 12.99,
	};

	const testMenuItem3 = {
		name: "Ice Cream",
		price: 5.99,
	};

	const testMenuItem4 = {
		name: "Fries",
		price: 3.99,
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

	const testOrderData2 = {
		customer: testCustomer,
		items: [
			{
				menuItemId: 2, // Placeholder, will be updated after creating a menu item
				quantity: 1,
			},
		],
	};

	const testOrderData3 = {
		customer: testCustomer,
		items: [
			{
				menuItemId: 3, // Placeholder, will be updated after creating a menu item
				quantity: 1,
			},
		],
	};

	const testOrderData4 = {
		customer: testCustomer,
		items: [
			{
				menuItemId: 4, // Placeholder, will be updated after creating a menu item
				quantity: 2,
			},
		],
	};

	const testOrderData5 = {
		customer: testCustomer,
		items: [
			{
				menuItemId: 1, // Placeholder, will be updated after creating a menu item
				quantity: 1,
			},
		],
	};

	const testOrderData6 = {
		customer: testCustomer,
		items: [
			{
				menuItemId: 3, // Placeholder, will be updated after creating a menu item
				quantity: 1,
			},
		],
	};

	const testOrderData7 = {
		customer: testCustomer,
		items: [
			{
				menuItemId: 4, // Placeholder, will be updated after creating a menu item
				quantity: 1,
			},
		],
	};

	const testOrderData8 = {
		customer: testCustomer,
		items: [
			{
				menuItemId: 3, // Placeholder, will be updated after creating a menu item
				quantity: 1,
			},
		],
	};

	let menuItemId: number;
	let menuItemId2: number;
	let menuItemId3: number;
	let menuItemId4: number;

	beforeAll(async () => {
		// Create a menu item
		const createdMenuItem = await createMenuItem(db, testMenuItem);
		const createdMenuItem2 = await createMenuItem(db, testMenuItem2);
		const createdMenuItem3 = await createMenuItem(db, testMenuItem3);
		const createdMenuItem4 = await createMenuItem(db, testMenuItem4);
		menuItemId = Number(createdMenuItem.lastInsertRowid); // Capture the menu item ID
		menuItemId2 = Number(createdMenuItem2.lastInsertRowid); // Capture the menu item ID
		menuItemId3 = Number(createdMenuItem3.lastInsertRowid); // Capture the menu item ID
		menuItemId4 = Number(createdMenuItem4.lastInsertRowid); // Capture the menu item
		// Update the test order data with the valid menu item ID
		testOrderData.items[0].menuItemId = menuItemId;
		testOrderData2.items[0].menuItemId = menuItemId2;
		testOrderData3.items[0].menuItemId = menuItemId3;
		testOrderData4.items[0].menuItemId = menuItemId4;
	});

	it("should place an order and create a customer if not exists", async () => {
		const result = await placeOrder(db, testOrderData);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("orderId"); // Ensure an order ID is returned

		const order = await getOrderById(db, Number(result.orderId));
		expect(order).toBeDefined();
		expect(order).toEqual(
			expect.objectContaining({
				customerId: 1,
				id: 1,
				orderDate: new Date().toISOString().split("T")[0],
				totalAmount: 21.98,
			}),
		);

		// Validate the customer
		const customer = await getCustomerByPhone(db, testCustomer.phone);
		expect(customer).toBeDefined();

		// Validate the order items
		const orderItem = await db
			.select()
			.from(orderItems)
			.where(eq(orderItems.orderId, Number(result.orderId)));
		expect(orderItem).toHaveLength(1);
		expect(orderItem[0]).toEqual(
			expect.objectContaining({
				menuItemId: menuItemId,
				quantity: testOrderData.items[0].quantity,
			}),
		);

		// delete the order
		await deleteOrder(db, Number(result.orderId));

		// Validate the order is deleted
		const orderDeleted = await getOrderById(db, Number(result.orderId));
		expect(orderDeleted).toBeNull();
	});

	it("should calculate total sales for a specific day", async () => {
		// Place an order to have sales data
		await placeOrder(db, testOrderData);
		// Place another order for today
		await placeOrder(db, testOrderData2);

		const date = new Date().toISOString().split("T")[0]; // Get today's date
		const result = await totalSale(db, { date });

		expect(result).toBeDefined();
		const totalSales =
			testOrderData.items[0].quantity * testMenuItem.price +
			testOrderData2.items[0].quantity * testMenuItem2.price;
		expect(result.totalSales).toEqual(totalSales); // Expect the total sales for today

		// delete the order
		await deleteOrder(db, 1);
		await deleteOrder(db, 2);

		// Validate the order is deleted
		const orderDeleted = await getOrderById(db, 1);
		expect(orderDeleted).toBeNull();
		const orderDeleted2 = await getOrderById(db, 2);
		expect(orderDeleted2).toBeNull();
	});

	it("should suggest menu items for a customer based on order history", async () => {
		// Place an order to have order history
		await placeOrder(db, testOrderData);

		const result = await suggestMenuItemsForCustomer(db, testCustomer.phone);

		expect(result).toBeDefined();
		expect(result).toHaveLength(1); // Expect at least one recommended item
		expect(result[0]).toHaveProperty("name", testMenuItem.name); // Check the recommended item matches

		// place another order
		await placeOrder(db, testOrderData2);
		await placeOrder(db, testOrderData3);
		await placeOrder(db, testOrderData4);
		await placeOrder(db, testOrderData5);
		await placeOrder(db, testOrderData6);
		await placeOrder(db, testOrderData7);
		await placeOrder(db, testOrderData8);

		const result2 = await suggestMenuItemsForCustomer(db, testCustomer.phone);
		// the recommended items should be item 3, 1, and 4
		expect(result2).toBeDefined();
		expect(result2).toHaveLength(3); // Expect at least one recommended item
		// take out the id field of each item in the result
		const result2NoId = result2.map((item) => {
			const { id, name, price } = item;
			return name;
		});
		expect(result2NoId).toContain(testMenuItem3.name);
		expect(result2NoId).toContain(testMenuItem.name);
		expect(result2NoId).toContain(testMenuItem4.name);
	});
});
