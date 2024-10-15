import {
  sqliteTable,
  integer,
  text,
  real,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Define the Customers table
export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(), // Must be a non-empty string
  email: text("email").notNull(), // Must be a non-empty string and a valid email format
  phone: text("phone").notNull().unique(), // Must be non-empty and UNIQUE
});

// Define the Menu Items table
export const menuItems = sqliteTable("menu_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(), // Must be a non-empty string and UNIQUE
  price: real("price").notNull(),
});

// Define the Orders table
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id), // Foreign key to Customers table
  totalAmount: real("total_amount").notNull(),
  orderDate: text("order_date").notNull(), // Format should be YYYY-MM-DD
});

// Define the Order Items table
export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id), // Foreign key to Orders table
  menuItemId: integer("menu_item_id")
    .notNull()
    .references(() => menuItems.id), // Foreign key to Menu Items table
  quantity: integer("quantity").notNull(),
});

// Define the relationships for the orders table
export const orderRelations = relations(orders, ({ one, many }) => ({
  customerSchema: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }), // Each order belongs to one customer
  orderItemSchema: many(orderItems), // One order can have many order items
}));

// Define the relationships for the order items table
export const orderItemRelations = relations(orderItems, ({ one }) => ({
  orderSchema: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }), // Each order item belongs to one order
  menuItemSchema: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }), // Each order item corresponds to one menu item
}));

// Define the relationships for the customers table
export const customerRelations = relations(customers, ({ many }) => ({
  orderSchema: many(orders), // One customer can have many orders
}));

// Define the relationships for the menu items table
export const menuItemRelations = relations(menuItems, ({ many }) => ({
  orderItemSchema: many(orderItems), // One menu item can be in many orders
}));
