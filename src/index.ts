import {
  createCustomer,
  getCustomers,
  getCustomerByName,
  updateCustomer,
  deleteCustomer,
} from "./functions/crud";
import {
  placeOrder,
  getOrdersByCustomer,
  getTotalSalesByDay,
} from "./functions/advanced";

// // Create a new customer
// const newCustomer = await createCustomer({
//   name: "Cady He",
//   email: "ch@example.com",
//   phone: "345-808-5678",
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


const runAdvancedFunctions = async () => {
  // Example: Place an order
  const newOrder = await placeOrder(1, [
    { menuItemId: 1, quantity: 2 },
    { menuItemId: 2, quantity: 3 },
  ]);
  console.log("New Order:", newOrder);

  // Example: Get orders by customer
  const customerOrders = await getOrdersByCustomer(1);
  console.log("Customer Orders:", customerOrders);

  // Example: Get total sales by day
  const totalSales = await getTotalSalesByDay("2024-06-18");
  console.log("Total Sales:", totalSales);
};

runAdvancedFunctions().catch(console.error);
