import { customers } from "./schemas/schema";
import {
  createCustomer,
  getCustomers,
  getCustomerByName,
  updateCustomer,
  deleteCustomer,
  createMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  createOrderItem,
  getOrderItemById,
  getOrderItemsByOrderId,
  updateOrderItem,
  deleteOrderItem,
} from "./functions/crud";
import {
  placeOrder,
  getOrdersForCustomer,
  getOrdersForDay,
} from "./functions/advanced";
import {
  drizzle,
  type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

const db = new Database("../db/database.sqlite");
const dbx = drizzle(db);


// Create a customer
export async function createCustomerHandler(event: FetchEvent) {
  const data = await event.request.json();
  const result = await createCustomer(db, data);
  return new Response(JSON.stringify(result), { status: 201 });
}
