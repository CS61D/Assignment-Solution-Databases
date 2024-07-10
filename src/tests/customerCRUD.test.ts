import { describe, it, expect, beforeEach } from "vitest";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import {
  createCustomer,
  getCustomers,
  getCustomerByName,
  updateCustomer,
  deleteCustomer,
} from "../functions/crud";

const db = drizzle(new Database("db/testdb.sqlite"));

describe("Customer CRUD", () => {
  it("should create a new customer", async () => {
    const newCustomer = {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "123-456-7890",
    };
    const result = await createCustomer(db, newCustomer);
    expect(result).toBeTruthy();
    const customers = await getCustomers(db);
    expect(customers.length).toBe(1);
    expect(customers[0]).toMatchObject(newCustomer);
  });

  it("should retrieve customer by name", async () => {
    const newCustomer = {
      name: "Jane Doe",
      email: "jane.doe@example.com",
      phone: "098-765-4321",
    };
    await createCustomer(db, newCustomer);
    const customer = await getCustomerByName(db, "Jane Doe");
    expect(customer).toHaveLength(1);
    expect(customer[0]).toMatchObject(newCustomer);
  });

  it("should update customer details", async () => {
    const newCustomer = {
      name: "Alice",
      email: "alice@example.com",
      phone: "123-123-1234",
    };
    await createCustomer(db, newCustomer);
    const updatedCustomer = { email: "alice.new@example.com" };
    await updateCustomer(db, "Alice", updatedCustomer);
    const customer = await getCustomerByName(db, "Alice");
    expect(customer[0].email).toBe(updatedCustomer.email);
  });

  it("should delete a customer", async () => {
    const newCustomer = {
      name: "Bob",
      email: "bob@example.com",
      phone: "456-456-4567",
    };
    await createCustomer(db, newCustomer);
    await deleteCustomer(db, "Bob");
    const customers = await getCustomers(db);
    expect(customers).toHaveLength(0);
  });
});
