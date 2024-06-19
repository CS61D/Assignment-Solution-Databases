CREATE TABLE `customers_to_orders` (
	`customer_id` integer NOT NULL,
	`order_id` integer NOT NULL,
	PRIMARY KEY(`customer_id`, `order_id`),
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
