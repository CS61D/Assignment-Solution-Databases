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
import { placeOrder, getOrdersForCustomer } from "./functions/advanced";

// // Create a new customer
// const newCustomer = await createCustomer({
//   name: "Emily Kyser",
//   email: "sk@example.com",
//   phone: "987-654-3210",
// });
// console.log("New Customer:", newCustomer);

// // Get all customers
// const customers = await getCustomers();
// console.log("All Customers:", customers);

// // Get customer by ID
// const customer = await getCustomerByName("Abby Smith");
// console.log("Customer by Name:", customer);

// // Update customer
// const updatedCustomer = await updateCustomer("Cady He", {
//   phone: "987-654-3210",
// });
// console.log("Updated Customer:", updatedCustomer);

// // Delete customer
// const deletedCustomer = await deleteCustomer("Cady He");
// console.log("Deleted Customer:", deletedCustomer);

// // Create some menu items
// const fries = await createMenuItem({
//   name: "French Fries",
//   price: 3.99,
// });

// const burger = await createMenuItem({
//   name: "Cheeseburger",
//   price: 5.99,
// });

// const soda = await createMenuItem({
//   name: "Soda",
//   price: 1.99,
// });

// // Get menu item by ID
// const menuItem = await getMenuItemById(1);
// console.log("Menu Item by ID:", menuItem);

// // Update menu item by ID
// const updatedMenuItem = await updateMenuItem(1, {
//   price: 4.99,
// });

// // Get all menu items
// const menuItems = await getMenuItems();
// console.log("All Menu Items:", menuItems);

// Example: Place an order
const newOrder = await placeOrder({
  customerId: 1,
  items: [
    { menuItemId: 2, quantity: 4 },
    { menuItemId: 3, quantity: 1 },
  ],
});
console.log("New Order:", newOrder);

// Example: Get orders by customer
const customerOrders = await getOrdersForCustomer(1);
console.log("Customer Orders:", customerOrders);
