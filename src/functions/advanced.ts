import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { eq, desc, asc } from "drizzle-orm";
import {
  customers,
  menuItems,
  orders,
  orderItems,
  customersToOrders,
} from "../schemas/schema";
import { z } from "zod";
import {
  db,
  customerSchema,
  orderSchema,
  orderItemSchema,
  menuItemSchema,
} from "./crud";

// REVIEW: Data transaction: place an order

// Helper function to create or update customer within transaction
const createOrUpdateCustomer = async (
  customerData: z.infer<typeof customerSchema>,
  tx: any // Replace 'any' with the correct type based on your db implementation
) => {
  // Check if customer already exists by email or phone (assuming unique)
  let existingCustomer = await db
    .select()
    .from(customers)
    .where(
      sql`email = ${customerData.email} OR phone = ${customerData.phone}`
    )
    .execute(tx);

  if (existingCustomer.length > 0) {
    // Update existing customer (assuming only name can be updated)
    await db
      .update(customers)
      .set({ name: customerData.name })
      .where(
        sql`email = ${customerData.email} OR phone = ${customerData.phone}`
      )
      .execute(tx);

    return existingCustomer[0];
  } else {
    // Insert new customer
    const newCustomer = await db
      .insert(customers)
      .values(customerData)
      .execute(tx);

    return newCustomer;
  }
};

export const placeOrder = async (
  customerData: z.infer<typeof customerSchema>,
  orderData: z.infer<typeof orderSchema>,
  orderItemsData: z.infer<typeof orderItemSchema>[]
) => {
  try {
    const order = await db.transaction(async (tx) => {
      // Step 1: Insert customer (if not already existing)
      const customer = await createOrUpdateCustomer(customerData, tx);

      // Step 2: Insert order
      const newOrder = await db
        .insert(orders)
        .values({
          customerId: customer.id,
          totalAmount: orderData.totalAmount,
          orderDate: orderData.orderDate,
        })
        .execute(tx);

      // Step 3: Insert order items
      const orderItemsPromises = orderItemsData.map((item) =>
        db
          .insert(orderItems)
          .values({
            orderId: newOrder.lastInsertId,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
          })
          .execute(tx)
      );
      await Promise.all(orderItemsPromises);

      return newOrder;
    });

    return order;
  } catch (error) {
    console.error("Error placing order:", error);
    throw error; // Re-throw the error for handling at a higher level
  }
};

//Retrieve all orders for a specific customer sorted by the order's creation date.
export const getOrdersForCustomer = async (customerId: number) => {
  // Get all order IDs for the customer
  const orderIds = await db
    .select()
    .from(customersToOrders)
    .where(eq(customersToOrders.customerId, customerId));

  // For each order ID, get the order details and order by date
  const ordersList = await Promise.all(
    orderIds.map(async (order) => {
      return await db
        .select()
        .from(orders)
        .where(eq(orders.id, order.orderId))
        .orderBy(desc(orders.orderDate));
    })
  );

  return ordersList;
};

// Aggregate total sales for a given day
export const getTotalSalesForDay = async (orderDate: string) => {
  const ordersToday = await db
    .select()
    .from(orders)
    .where(eq(orders.orderDate, orderDate));

  return result?.[0]?.totalAmount || 0; // Return 0 if no sales found for the day
};
