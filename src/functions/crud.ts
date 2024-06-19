import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { eq } from "drizzle-orm";
import { customers, menuItems, orders, orderItems } from "../schemas/schema";
import { z } from "zod";

export const db = drizzle(new Database("db/database.sqlite"));

// Create schemas validation with Zod
export const customerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
});

export const menuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
});

export const orderSchema = z.object({
  customerId: z.number().positive(),
  totalAmount: z.number().positive(),
  orderDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
});

export const orderItemSchema = z.object({
  orderId: z.number().positive(),
  menuItemId: z.number().positive(),
  quantity: z.number().positive(),
});

// REVIEW: CRUD Functions for Customers
export const createCustomer = async (data: z.infer<typeof customerSchema>) => {
  const parsedData = customerSchema.parse(data);
  return db.insert(customers).values(parsedData);
};

export const getCustomers = async () => {
  return await db.select().from(customers);
};

export const getCustomerByName = async (name: string) => {
  return await db.select().from(customers).where(eq(customers.name, name));
};

export const updateCustomer = async (
  name: string,
  data: Partial<z.infer<typeof customerSchema>>
) => {
  const parsedData = customerSchema.partial().parse(data);
  return await db
    .update(customers)
    .set(parsedData)
    .where(eq(customers.name, name));
};

export const deleteCustomer = async (name: string) => {
  return await db.delete(customers).where(eq(customers.name, name));
};

// REVIEW: CRUD Functions for Menu Items
// Create a new menu item
export const createMenuItem = async (data: z.infer<typeof menuItemSchema>) => {
  const parsedData = menuItemSchema.parse(data);
  return await db.insert(menuItems).values(parsedData);
};

// Get all menu items
export const getMenuItems = async () => {
  return await db.select().from(menuItems);
};

// Get menu item by ID
export const getMenuItemById = async (id: number) => {
  return await db.select().from(menuItems).where(eq(menuItems.id, id));
};

// Update menu item by ID
export const updateMenuItem = async (
  id: number,
  data: Partial<z.infer<typeof menuItemSchema>>
) => {
  const parsedData = menuItemSchema.partial().parse(data);
  return await db.update(menuItems).set(parsedData).where(eq(menuItems.id, id));
};

// Delete menu item by ID
export const deleteMenuItem = async (id: number) => {
  return await db.delete(menuItems).where(eq(menuItems.id, id));
};

// REVIEW: CRUD Functions for Orders
// Create a new order
export const createOrder = async (data: z.infer<typeof orderSchema>) => {
  const parsedData = orderSchema.parse(data);
  return await db.insert(orders).values(parsedData);
};

// Get all orders
export const getOrders = async () => {
  return await db.select().from(orders);
};

// Get order by ID
export const getOrderById = async (id: number) => {
  return await db.select().from(orders).where(eq(orders.id, id));
};

// Update order by ID
export const updateOrder = async (
  id: number,
  data: Partial<z.infer<typeof orderSchema>>
) => {
  const parsedData = orderSchema.partial().parse(data);
  return await db.update(orders).set(parsedData).where(eq(orders.id, id));
};

// Delete order by ID
export const deleteOrder = async (id: number) => {
  return await db.delete(orders).where(eq(orders.id, id));
};

// REVIEW: CRUD Functions for Order Items
// Create a new order item
export const createOrderItem = async (
  data: z.infer<typeof orderItemSchema>
) => {
  const parsedData = orderItemSchema.parse(data);
  return await db.insert(orderItems).values(parsedData);
};

// Get order item by ID
export const getOrderItemById = async (id: number) => {
  return await db.select().from(orderItems).where(eq(orderItems.id, id));
};

// Get order items by order ID
export const getOrderItemsByOrderId = async (orderId: number) => {
  return await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));
};

// Update order item by ID
export const updateOrderItem = async (
  id: number,
  data: Partial<z.infer<typeof orderItemSchema>>
) => {
  const parsedData = orderItemSchema.partial().parse(data);
  return await db
    .update(orderItems)
    .set(parsedData)
    .where(eq(orderItems.id, id));
};

// Delete order item by ID
export const deleteOrderItem = async (id: number) => {
  return await db.delete(orderItems).where(eq(orderItems.id, id));
};
