import { and, eq, gt } from "drizzle-orm";
import { customers, menuItems, orders, orderItems } from "../schemas/schema";
import { z } from "zod";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

//////////////////////////////////////// CUSTOMERS ////////////////////////////////////////

// Validation schema for customer data
export const customerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
});

// Create a Customer
export async function createCustomer(
  db: BetterSQLite3Database,
  data: z.infer<typeof customerSchema>
) {
  const validatedData = customerSchema.parse(data);
  return await db.insert(customers).values(validatedData);
}

// Get a Customer by Phone
export async function getCustomerByPhone(
  db: BetterSQLite3Database,
  phone: string
) {
  return await db.select().from(customers).where(eq(customers.phone, phone));
}

// Update a Customer by Phone
export async function updateCustomerByPhone(
  db: BetterSQLite3Database,
  phone: string,
  data: z.infer<typeof customerSchema>
) {
  const validatedData = customerSchema.partial().parse(data); // Allow partial updates
  return await db
    .update(customers)
    .set(validatedData)
    .where(eq(customers.phone, phone));
}

// Delete a Customer by Phone
export async function deleteCustomerByPhone(
  db: BetterSQLite3Database,
  phone: string
) {
  return await db.delete(customers).where(eq(customers.phone, phone));
}

//////////////////////////////////////// MENU ITEMS ////////////////////////////////////////

// Validation schema for menu item data
export const menuItemSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
});

// Create a Menu Item
export async function createMenuItem(
  db: BetterSQLite3Database,
  data: z.infer<typeof menuItemSchema>
) {
  const validatedData = menuItemSchema.parse(data);
  return await db.insert(menuItems).values(validatedData);
}

// Get a Menu Item by Name
export async function getMenuItemById(db: BetterSQLite3Database, id: number) {
  return await db.select().from(menuItems).where(eq(menuItems.id, id));
}

// Update a Menu Item by Name
export async function updateMenuItemById(
  db: BetterSQLite3Database,
  id: number,
  data: z.infer<typeof menuItemSchema>
) {
  const validatedData = menuItemSchema.partial().parse(data); // Allow partial updates
  return await db
    .update(menuItems)
    .set(validatedData)
    .where(eq(menuItems.id, id));
}

// Delete a Menu Item by Name
export async function deleteMenuItemById(
  db: BetterSQLite3Database,
  id: number
) {
  return await db.delete(menuItems).where(eq(menuItems.id, id));
}

//////////////////////////////////////// ORDERS ////////////////////////////////////////

// Validation schema for order data
export const orderSchema = z.object({
  customerId: z.number().positive(),
  totalAmount: z.number().positive(),
  orderDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
});

// Create an Order
export async function createOrder(
  db: BetterSQLite3Database,
  data: z.infer<typeof orderSchema>
) {
  const validatedData = orderSchema.parse(data);
  return await db.insert(orders).values(validatedData);
}

// Get All Orders
export async function getOrders(db: BetterSQLite3Database) {
  return await db.select().from(orders);
}

// Get an Order by ID
export async function getOrderById(db: BetterSQLite3Database, id: number) {
  return await db.select().from(orders).where(eq(orders.id, id));
}

// Update an Order
export async function updateOrder(
  db: BetterSQLite3Database,
  id: number,
  data: z.infer<typeof orderSchema>
) {
  const validatedData = orderSchema.partial().parse(data); // Allow partial updates
  return await db.update(orders).set(validatedData).where(eq(orders.id, id));
}

// Delete an Order
export async function deleteOrder(db: BetterSQLite3Database, id: number) {
  return await db.delete(orders).where(eq(orders.id, id));
}

//////////////////////////////////////// ORDER ITEMS ////////////////////////////////////////

// Validation schema for order item data
export const orderItemSchema = z.object({
  orderId: z.number().positive(),
  menuItemId: z.number().positive(),
  quantity: z.number().positive(),
});

// Create an Order Item
export async function createOrderItem(
  db: BetterSQLite3Database,
  data: z.infer<typeof orderItemSchema>
) {
  const validatedData = orderItemSchema.parse(data);
  return await db.insert(orderItems).values(validatedData);
}

// Get Order Items by Order ID
export async function getOrderItemsByOrderId(
  db: BetterSQLite3Database,
  orderId: number
) {
  return await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));
}

// Update an Order Item
export async function updateOrderItem(
  db: BetterSQLite3Database,
  orderId: number,
  menuItemId: number,
  data: z.infer<typeof orderItemSchema>
) {
  const validatedData = orderItemSchema.partial().parse(data); // Allow partial updates
  return await db
    .update(orderItems)
    .set(validatedData)
    .where(
      and(
        eq(orderItems.orderId, orderId),
        eq(orderItems.menuItemId, menuItemId)
      )
    );
}

// Delete Order Items by Order ID
export async function deleteOrderItemsByOrderId(
  db: BetterSQLite3Database,
  orderId: number
) {
  return await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
}
