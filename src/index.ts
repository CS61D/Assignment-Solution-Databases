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
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";

const db = drizzle(new Database("db/database.sqlite"));

// // Create a new customer
// const newCustomer = await createCustomer(db, {
//   name: "Emily Kyser",
//   email: "sk@example.com",
//   phone: "987-654-3210",
// });
// console.log("New Customer:", newCustomer);

// // Get all customers
// const customers = await getCustomers(db);
// console.log("All Customers:", customers);

// // Get customer by ID
// const customer = await getCustomerByName(db, "Abby Smith");
// console.log("Customer by Name:", customer);

// // Update customer
// const updatedCustomer = await updateCustomer(db, "Cady He", {
//   phone: "987-654-3210",
// });
// console.log("Updated Customer:", updatedCustomer);

// // Delete customer
// const deletedCustomer = await deleteCustomer(db, "Cady He");
// console.log("Deleted Customer:", deletedCustomer);

// // Create some menu items
// const fries = await createMenuItem(db, {
//   name: "French Fries",
//   price: 3.99,
// });

// const burger = await createMenuItem(db, {
//   name: "Cheeseburger",
//   price: 5.99,
// });

// const soda = await createMenuItem(db, {
//   name: "Soda",
//   price: 1.99,
// });

// // Get menu item by ID
// const menuItem = await getMenuItemById(db, 1);
// console.log("Menu Item by ID:", menuItem);

// // Update menu item by ID
// const updatedMenuItem = await updateMenuItem(db, 1, {
//   price: 4.99,
// });

// // Get all menu items
// const menuItems = await getMenuItems(db);
// console.log("All Menu Items:", menuItems);

// // Example: Place an order
// const newOrder = await placeOrder(db, {
//   customerId: 1,
//   items: [
//     { menuItemId: 2, quantity: 4 },
//     { menuItemId: 3, quantity: 1 },
//   ],
// });
// console.log("New Order:", newOrder);

// // Example: Get orders by customer
// const customerOrders = await getOrdersForCustomer(db, 1);
// console.log("Customer Orders:", customerOrders);

// // Example: find the total sales for a specific day
// const totalSales = await getOrdersForDay(db, { date: "2024-06-28" });
// console.log("Total Sales for Day:", totalSales);
