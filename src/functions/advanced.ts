import { eq, desc, asc } from "drizzle-orm";
import {
  customers,
  menuItems,
  orders,
  orderItems,
  customersToOrders,
} from "../schemas/schema";
import { z } from "zod";

//  Data transaction: place an order
// Zod schemas for input validation
export const placeOrderSchema = z.object({
  customerId: z.number().positive(),
  items: z.array(
    z.object({
      menuItemId: z.number().positive(),
      quantity: z.number().positive(),
    })
  ),
});

export const placeOrder = async (
  db,
  data: z.infer<typeof placeOrderSchema>
) => {
  const { customerId, items } = placeOrderSchema.parse(data);
  let success = false;
  let orderId = 0;

  success = await db
    .transaction(async (tx) => {
      // Calculate total amount
      let totalAmount = 0;
      for (const { menuItemId, quantity } of items) {
        const menuItem = await tx
          .select()
          .from(menuItems)
          .where(eq(menuItems.id, menuItemId));
        if (!menuItem) {
          throw new Error(`Menu item with ID ${menuItemId} not found`);
        }
        const itemTotal = menuItem[0].price * quantity;
        totalAmount += itemTotal;
      }

      // Create order
      const order = await tx
        .insert(orders)
        .values({
          totalAmount,
          orderDate: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
        })
        .returning({ id: orders.id })
        .then((result) => result[0]);

      if (!order || !order.id) {
        throw new Error("Failed to create order");
      }

      orderId = order.id;

      // Insert order items
      for (const { menuItemId, quantity } of items) {
        await tx.insert(orderItems).values({
          orderId: orderId as number,
          menuItemId: menuItemId as number,
          quantity: quantity as number,
        });
      }

      // Link customer to order
      await tx.insert(customersToOrders).values({
        customerId,
        orderId: orderId as number,
      });
    })
    .then(() => true);
  return { success: success, orderId: orderId };
};

// Retrieve all orders for a specific customer sorted by the order's creation date.
export const getOrdersForCustomer = async (db, customerId: number) => {
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

// Retrieve all orders for a specific day and find the total sales for that day.
// Zod schemas for input validation
export const getOrdersForDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
});

export const totalSale = async (
  db,
  data: z.infer<typeof getOrdersForDaySchema>
) => {
  const { date } = getOrdersForDaySchema.parse(data);
  const ordersList = await db
    .select()
    .from(orders)
    .where(eq(orders.orderDate, date));

  const totalSales = ordersList.reduce(
    (total, order) => total + order.totalAmount,
    0
  );

  return { ordersList, totalSales };
};
