// import { drizzle } from "drizzle-orm/bun-sqlite";
// import { Database } from "bun:sqlite";
import { eq } from "drizzle-orm";
import { customers, menuItems, orders, orderItems } from "../schemas/schema";
import { z } from "zod";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

// Create schemas validation with Zod
export const customerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
});

export const menuItemSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
});

export const orderSchema = z.object({
  totalAmount: z.number().positive(),
  orderDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
});

export const orderItemSchema = z.object({
  orderId: z.number().positive(),
  menuItemId: z.number().positive(),
  quantity: z.number().positive(),
});

export const customersToOrdersSchema = z.object({
  customerId: z.number().positive(),
  orderId: z.number().positive(),
});

// CRUD Functions for Customers
export const createCustomer = async (
  db: BetterSQLite3Database,
  data: z.infer<typeof customerSchema>
) => {
  const parsedData = customerSchema.parse(data);
  return await db.insert(customers).values(parsedData);
};

export const getCustomers = async (db) => {
  return await db.select().from(customers);
};

export const getCustomerByName = async (db, name: string) => {
  return await db.select().from(customers).where(eq(customers.name, name));
};

export const updateCustomer = async (
  db,
  name: string,
  data: Partial<z.infer<typeof customerSchema>>
) => {
  const parsedData = customerSchema.partial().parse(data);
  return await db
    .update(customers)
    .set(parsedData)
    .where(eq(customers.name, name));
};

export const deleteCustomer = async (db, name: string) => {
  return await db.delete(customers).where(eq(customers.name, name));
};

// CRUD Functions for Menu Items
export const createMenuItem = async (
  db,
  data: z.infer<typeof menuItemSchema>
) => {
  const parsedData = menuItemSchema.parse(data);
  return await db.insert(menuItems).values(parsedData);
};

export const getMenuItems = async (db) => {
  return await db.select().from(menuItems);
};

export const getMenuItemById = async (db, id: number) => {
  return await db.select().from(menuItems).where(eq(menuItems.id, id));
};

export const updateMenuItem = async (
  db,
  id: number,
  data: Partial<z.infer<typeof menuItemSchema>>
) => {
  const parsedData = menuItemSchema.partial().parse(data);
  return await db.update(menuItems).set(parsedData).where(eq(menuItems.id, id));
};

export const deleteMenuItem = async (db, id: number) => {
  return await db.delete(menuItems).where(eq(menuItems.id, id));
};

// CRUD Functions for Orders
export const createOrder = async (db, data: z.infer<typeof orderSchema>) => {
  const parsedData = orderSchema.parse(data);
  return await db.insert(orders).values(parsedData);
};

export const getOrders = async (db) => {
  return await db.select().from(orders);
};

export const getOrderById = async (db, id: number) => {
  return await db.select().from(orders).where(eq(orders.id, id));
};

export const updateOrder = async (
  db,
  id: number,
  data: Partial<z.infer<typeof orderSchema>>
) => {
  const parsedData = orderSchema.partial().parse(data);
  return await db.update(orders).set(parsedData).where(eq(orders.id, id));
};

export const deleteOrder = async (db, id: number) => {
  return await db.delete(orders).where(eq(orders.id, id));
};

// CRUD Functions for Order Items
export const createOrderItem = async (
  db,
  data: z.infer<typeof orderItemSchema>
) => {
  const parsedData = orderItemSchema.parse(data);
  return await db.insert(orderItems).values(parsedData);
};

export const getOrderItemById = async (db, id: number) => {
  return await db.select().from(orderItems).where(eq(orderItems.id, id));
};

export const getOrderItemsByOrderId = async (db, orderId: number) => {
  return await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));
};

export const updateOrderItem = async (
  db,
  id: number,
  data: Partial<z.infer<typeof orderItemSchema>>
) => {
  const parsedData = orderItemSchema.partial().parse(data);
  return await db
    .update(orderItems)
    .set(parsedData)
    .where(eq(orderItems.id, id));
};

export const deleteOrderItem = async (db, id: number) => {
  return await db.delete(orderItems).where(eq(orderItems.id, id));
};

// await db.select({ value: sum(users.id) }).from(users);
