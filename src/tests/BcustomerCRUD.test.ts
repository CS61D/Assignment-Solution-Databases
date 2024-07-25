import { describe, it, expect, beforeAll } from "vitest";
import {
  createCustomer,
  getCustomerByName,
  updateCustomer,
  deleteCustomer,
} from "../functions/crud";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
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

describe("Customer CRUD", () => {
  const newCustomer = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
  };
  it("should create a new customer", async () => {
    const result = await createCustomer(db, newCustomer);
    expect(result).toBeTruthy();
    const customers = await getCustomerByName(db, "John Doe");
    expect(customers.length).toBe(1);
    expect(customers[0]).toMatchObject(newCustomer);
  });

  it("should retrieve customer by name", async () => {
    const customer = await getCustomerByName(db, "John Doe");
    expect(customer).toHaveLength(1);
    expect(customer[0]).toMatchObject(newCustomer);
  });

  it("should update customer details", async () => {
    const updatedCustomer = { email: "john.new@example.com" };
    await updateCustomer(db, "John Doe", updatedCustomer);
    const customer = await getCustomerByName(db, "John Doe");
    expect(customer[0].email).toBe(updatedCustomer.email);
  });

  it("should delete a customer", async () => {
    await deleteCustomer(db, "John Doe");
    const customers = await getCustomerByName(db, "John Doe");
    expect(customers).toHaveLength(0);
  });
});
