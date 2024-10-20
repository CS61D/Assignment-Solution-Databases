import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
	createCustomer,
	deleteCustomerByPhone,
	getCustomerByPhone,
	updateCustomerByPhone,
} from "../functions/crud";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, sql } from "drizzle-orm/sql";
import { setup } from "./helpers/setup";

// Initialize the database
const db = drizzle(new Database("db/testdb.sqlite"));

// Setup: Create the customers table if it does not exist
beforeAll(() => {
	setup(db);
});

describe("Customer CRUD Operations", () => {
	it("should create a customer", async () => {
		const testCustomer = {
			name: "John Doe",
			email: "john.doe@example.com",
			phone: "123-456-7890",
		};

		const result = await createCustomer(db, testCustomer);
		expect(result).toBeDefined();
		expect(result.lastInsertRowid).toBeDefined();
	});

	it("should retrieve a customer by phone", async () => {
		const testCustomer = {
			name: "John Dain",
			email: "john.doe@example.com",
			phone: "123-456-7891",
		};

		// Create a customer first
		await createCustomer(db, testCustomer);

		const customer = await getCustomerByPhone(db, testCustomer.phone);
		expect(customer).toEqual(
			expect.objectContaining({
				name: testCustomer.name,
				email: testCustomer.email,
				phone: testCustomer.phone,
			}),
		);
	});

	it("should update a customer by phone", async () => {
		const testCustomer = {
			name: "John Don",
			email: "john.doe@example.com",
			phone: "123-456-7892",
		};

		// Create a customer first
		await createCustomer(db, testCustomer);

		const updatedData = {
			name: "John Smith",
			email: "john.smith@example.com",
			phone: "123-456-7892",
		};

		await updateCustomerByPhone(db, testCustomer.phone, updatedData);

		const updatedCustomer = await getCustomerByPhone(db, testCustomer.phone);
		expect(updatedCustomer).toEqual(
			expect.objectContaining({
				name: updatedData.name,
				email: updatedData.email,
				phone: testCustomer.phone, // Phone should remain the same
			}),
		);
	});

	it("should delete a customer by phone", async () => {
		const testCustomer = {
			name: "John Dow",
			email: "john.doe@example.com",
			phone: "123-456-7893",
		};

		// Create a customer first
		await createCustomer(db, testCustomer);

		await deleteCustomerByPhone(db, testCustomer.phone);
		const customer = await getCustomerByPhone(db, testCustomer.phone);
		expect(customer).toBeNull(); // Should return no customer
	});
});
