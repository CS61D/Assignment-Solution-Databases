import {
  sqliteTable,
  integer,
  text,
  real,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const customers = sqliteTable("customers", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
});

export const menuItems = sqliteTable("menu_items", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  price: real("price").notNull(),
});

export const orders = sqliteTable("orders", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  totalAmount: real("total_amount").notNull(),
  orderDate: text("order_date").notNull(),
});

export const orderItems = sqliteTable("order_items", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  orderId: integer("order_id")
    .references(() => orders.id)
    .notNull(),
  menuItemId: integer("menu_item_id")
    .references(() => menuItems.id)
    .notNull(),
  quantity: integer("quantity").notNull(),
});

export const customersToOrders = sqliteTable(
  "customers_to_orders",
  {
    customerId: integer("customer_id")
      .notNull()
      .references(() => customers.id),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id),
  },
  (t) => ({
    pk: primaryKey({
      name: "customer_order",
      columns: [t.customerId, t.orderId],
    }),
  })
);

export const customersRelations = relations(customers, ({ many }) => ({
  customersToOrders: many(customersToOrders),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  orderItems: many(orderItems),
  customersToOrders: many(customersToOrders),
}));

export const customersToOrdersRelations = relations(
  customersToOrders,
  ({ one }) => ({
    group: one(orders, {
      fields: [customersToOrders.orderId],
      references: [orders.id],
    }),
    user: one(customers, {
      fields: [customersToOrders.customerId],
      references: [customers.id],
    }),
  })
);

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }),
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));

export const menuItemsRelations = relations(menuItems, ({ many }) => ({
  orderItems: many(orderItems),
}));
