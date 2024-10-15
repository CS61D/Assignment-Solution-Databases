import { eq, desc, asc } from "drizzle-orm";
import { customers, menuItems, orders, orderItems } from "../schemas/schema";
import { z } from "zod";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import {
  createCustomer,
  createOrder,
  createOrderItem,
  getCustomerByPhone,
  getMenuItemById,
} from "./crud";

///////////////////////////////// Question 1 ////////////////////////////////////////

// Validation schema for placing an order
export const placeOrderSchema = z.object({
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
  }),
  items: z.array(
    z.object({
      menuItemId: z.number().positive(),
      quantity: z.number().positive(),
    })
  ),
});

// Place an Order
export async function placeOrder(
  db: BetterSQLite3Database,
  data: z.infer<typeof placeOrderSchema>
) {
  const validatedData = placeOrderSchema.parse(data);

  const customerData = validatedData.customer;
  const items = validatedData.items;

  // Start a transaction
  return db.transaction(async (trx) => {
    // Check if the customer exists
    const existingCustomer = await getCustomerByPhone(trx, customerData.phone);
    let customerId: number;

    if (!existingCustomer) {
      // Create a new customer if not found
      const newCustomer = await createCustomer(trx, customerData);
      customerId = Number(newCustomer.lastInsertRowid); // Get the ID of the newly created customer
    } else {
      customerId = Number(existingCustomer.id); // Get the existing customer's ID
    }

    // Calculate the total cost of the order
    let totalAmount = 0;
    for (const item of items) {
      const menuItem = await getMenuItemById(trx, item.menuItemId); // You need to implement this function
      if (menuItem) {
        totalAmount += menuItem.price * item.quantity;
      }
    }

    // Create the order
    const newOrder = await createOrder(trx, {
      customerId,
      totalAmount,
      orderDate: new Date().toISOString().split("T")[0], // Format to YYYY-MM-DD
    });

    // Insert relevant order items
    for (const item of items) {
      await createOrderItem(trx, {
        orderId: Number(newOrder.lastInsertRowid),
        menuItemId: item.menuItemId,
        quantity: item.quantity,
      });
    }

    return {
      success: true,
      orderId: newOrder.lastInsertRowid,
    };
  });
}

///////////////////////////////// Question 2 ////////////////////////////////////////

// Validation schema for getting orders for a specific day
export const getOrdersForDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
});

// Total Sales
export async function totalSale(
  db: BetterSQLite3Database,
  data: z.infer<typeof getOrdersForDaySchema>
) {
  const validatedData = getOrdersForDaySchema.parse(data);

  const { date } = validatedData;

  // Retrieve all orders for the given date
  const ordersForDay = await db
    .select()
    .from(orders)
    .where(eq(orders.orderDate, date));

  // Sum the total amounts
  const totalSales = ordersForDay.reduce(
    (acc, order) => acc + order.totalAmount,
    0
  );

  return {
    totalSales,
  };
}

///////////////////////////////// Question 3 ////////////////////////////////////////

// Suggest Menu Items for Customer
export async function suggestMenuItemsForCustomer(
  db: BetterSQLite3Database,
  phone: string
) {
  // Fetch the customer's order history using their phone number
  const customer = await getCustomerByPhone(db, phone);

  if (!customer) {
    return [];
  }

  const customerId = Number(customer.id);

  // Join to find ordered items
  const orderedItems = await db
    .select()
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(eq(orders.customerId, customerId));

  // Count frequency of menu items
  const itemFrequency: Record<number, number> = {};

  for (const item of orderedItems) {
    itemFrequency[item.order_items.menuItemId] =
      (itemFrequency[item.order_items.menuItemId] || 0) +
      item.order_items.quantity;
  }

  // Sort menu items by frequency
  const sortedItems = Object.entries(itemFrequency)
    .sort((a, b) => b[1] - a[1]) // Sort by frequency
    .slice(0, 3) // Get top 3
    .map(([menuItemId]) => parseInt(menuItemId));

  // Retrieve full menu item objects
  const recommendedItems = await Promise.all(
    sortedItems.map(async (id) => {
      return await getMenuItemById(db, id); // You need to implement this function
    })
  );

  return recommendedItems;
}
