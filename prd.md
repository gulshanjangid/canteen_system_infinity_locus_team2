### *Product Requirements Document (PRD): Canteen Ordering System*

*Version:* 1.0
*Date:* September 5, 2025
*Author:* Gemini AI
*Status:* Draft

### 1. Introduction

This document outlines the requirements for a Canteen Ordering System designed to manage online orders with real-time inventory control. The core feature is an inventory locking mechanism that reserves stock upon order creation and automatically releases it if the order is not confirmed (via payment or pickup) within a 15-minute window. This system aims to prevent over-ordering of limited-stock items and improve the overall efficiency of the canteen.

### 2. User Personas

* *Canteen Customer (e.g., Employee, Student):* Wants to quickly view the menu, see item availability, and place an order without the risk of their desired item being sold out after they've made a choice.
* *Canteen Admin/Staff:* Wants an easy way to manage the menu, update stock levels, and view incoming orders. Needs an accurate, automated system to handle inventory so they can focus on food preparation and service.

### 3. Functional Requirements

The project is broken down into the following epics. Each epic contains a set of specific tasks for development.

---

### *Epic 1: Menu & Inventory Management (Admin)*

*Goal:* To allow Canteen Admins to have full control over the menu items and their stock levels.

* *Task 1.1: Backend - Create Menu Item API Endpoints (CRUD)*
    * Implement a POST /api/admin/menu endpoint to create a new menu item. Request body must include name (string), description (string), price (numeric), and stock_count (integer).
    * Implement a GET /api/admin/menu endpoint to retrieve a list of all menu items.
    * Implement a GET /api/admin/menu/{itemId} endpoint to retrieve a single menu item by its ID.
    * Implement a PUT /api/admin/menu/{itemId} endpoint to update an existing menu item's details, including its stock_count.
    * Implement a DELETE /api/admin/menu/{itemId} endpoint to remove a menu item.

* **Task 1.2: Database - Design MenuItems Table**
    * Create a SQL table named MenuItems.
    * Define columns: id (Primary Key, Auto-increment), name (VARCHAR), description (TEXT), price (DECIMAL), stock_count (INTEGER, default 0), is_available (BOOLEAN, default true), created_at (TIMESTAMP), updated_at (TIMESTAMP).

* *Task 1.3: Frontend - Build Admin Management UI*
    * Create a secure admin-only page (/admin/menu).
    * Display all menu items in a table with columns for Name, Price, and Stock Count.
    * Include "Edit" and "Delete" buttons for each item in the table.
    * Add a "Create New Item" button that opens a form/modal to submit data to the POST /api/admin/menu endpoint.
    * The "Edit" button should populate the same form with existing item data for updating.

---

### *Epic 2: Customer Ordering & Inventory Locking*

*Goal:* To allow customers to browse the menu, add available items to an order, and have the system lock the stock for them transactionally.

* *Task 2.1: Frontend - Display Menu with Live Stock*
    * Create a customer-facing menu page that fetches data from a public GET /api/menu endpoint.
    * For each item, display its name, price, description, and current stock count.
    * Implement an "Add to Cart" button for each item. This button must be *disabled* and visually distinct if the item's stock_count is $0$.

* *Task 2.2: Backend - Create Order Placement Endpoint*
    * Implement a POST /api/orders endpoint. It accepts a list of {itemId, quantity} pairs.
    * This endpoint must execute within a *database transaction* to ensure atomicity.

* *Task 2.3: Backend - Implement Transactional Stock Locking Logic*
    * *Instruction:* Inside the POST /api/orders transaction:
        1.  For each item in the incoming order, read the current stock_count from the MenuItems table with a pessimistic lock (e.g., SELECT ... FOR UPDATE in SQL) to prevent race conditions.
        2.  Validate if requested_quantity \le available_stock.
        3.  If any item fails this validation, *rollback* the entire transaction and return a 409 Conflict error (e.g., "Item X is out of stock.").
        4.  If all items are available, decrement the stock_count for each MenuItem.
        5.  Create a new record in the Orders table (see Epic 3) with status = 'pending'.
        6.  *Commit* the transaction.
        7.  Return the newly created order details, including its ID and an expires_at timestamp.

* **Task 2.4: Database - Design Orders and OrderItems Tables**
    * Create a SQL table named Orders.
    * Define columns: id (Primary Key), user_id (Foreign Key), status (ENUM: 'pending', 'confirmed', 'cancelled', 'completed'), total_price (DECIMAL), created_at (TIMESTAMP), expires_at (TIMESTAMP).
    * The expires_at value must be calculated as created_at + 15 minutes.
    * Create a pivot table named OrderItems to link orders and menu items.
    * Define columns: id (Primary Key), order_id (Foreign Key), menu_item_id (Foreign Key), quantity (INTEGER), price_at_time_of_order (DECIMAL).

---

### *Epic 3: Order Auto-Cancellation*

*Goal:* To automatically find and cancel unpaid/unconfirmed orders after 15 minutes and restore the locked stock.

* *Task 3.1: Backend - Create the Cancellation Logic*
    * Develop a function/script that performs the following:
        1.  Query the Orders table for all records where status = 'pending' AND expires_at \le CURRENT_TIMESTAMP.
        2.  For each expired order found, initiate a *database transaction*.

* *Task 3.2: Backend - Implement Transactional Stock Restoration*
    * *Instruction:* Inside the cancellation transaction for each expired order:
        1.  Update the order's status in the Orders table from 'pending' to 'cancelled'.
        2.  Retrieve all associated items and quantities from the OrderItems table for that order_id.
        3.  For each item, increment the stock_count in the MenuItems table by the quantity from OrderItems.
        4.  *Commit* the transaction.

* *Task 3.3: Backend - Schedule the Cancellation Job*
    * Configure a scheduler (e.g., cron job, Celery Beat, NestJS Scheduler) to execute the cancellation logic from Task 3.1.
    * Set the job to run at a high frequency, for example, *every minute*.

---

### *Epic 4: Post-Order Customer Experience*

*Goal:* To provide customers with clear information about their order status, the 15-minute countdown, and their order history.

* *Task 4.1: Frontend - Order Status & Countdown Page*
    * After a successful order placement (POST /api/orders), redirect the user to an order status page (e.g., /orders/{orderId}).
    * Fetch the order details, including the expires_at timestamp.
    * Implement a visual countdown timer on the page that shows the remaining time until auto-cancellation.
    * Display a clear message like "Please pay or pickup within 15 minutes to confirm your order."

* *Task 4.2: Frontend - Implement Manual Cancellation*
    * Add a "Cancel Order" button to the order status page.
    * This button should only be active if the order status is 'pending'.
    * Clicking it should call a POST /api/orders/{orderId}/cancel endpoint.

* *Task 4.3: Backend - Manual Cancellation Endpoint*
    * Implement the POST /api/orders/{orderId}/cancel endpoint.
    * This endpoint will execute the same transactional stock restoration logic described in Task 3.2.

* *Task 4.4: Frontend - Order History Page*
    * Create a user-specific page (/my-orders).
    * This page will call a GET /api/orders/history endpoint to fetch all past and present orders for the logged-in user.
    * Display orders with their status (Pending, Confirmed, Cancelled, Completed), items, and date.

* *Task 4.5: Backend - Order History Endpoint*
    * Implement the GET /api/orders/history endpoint that returns a list of orders associated with the authenticated user.