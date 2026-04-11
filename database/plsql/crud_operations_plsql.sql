-- PL/SQL: CRUD Operations (Create, Read, Update, Delete)
-- Module: SQL Core (Sellers, Buyers, Orders) | Section: Relational Data Persistence
-- Database: Oracle/MySQL Core

-- 1. CREATE Operations (Inserting new records)
-- Simple Way: When a new seller registers or a buyer completes a purchase.
-- Implementation: Used in registration flow and order placement scripts.

-- Insert new seller (Full record creation)
INSERT INTO SELLERS (SELLER_ID, FULL_NAME, EMAIL, PASSWORD, STATUS, CREATED_AT)
VALUES ('S-USR_SELLER1', 'CareCart Pharma', 'admin@carecart.com', 'pass123', 'ACTIVE', SYSDATE);

-- Insert new buyer
INSERT INTO BUYERS (BUYER_ID, FULL_NAME, EMAIL, STATUS, REGISTERED_ON)
VALUES ('B-USR_BUYER1', 'John Doe', 'john@test.com', 'VERIFIED', SYSDATE);


-- 2. READ Operations (Fetching and Joining data)
-- Simple Way: Showing a list of orders to a seller or tracking a shipment.
-- Implementation: Core SQL queries in JDBC Controllers and Java DAOs.

-- JOIN: Fetch all orders and their items with product names
SELECT 
    O.ORDER_ID, 
    B.FULL_NAME AS BUYER, 
    P.NAME AS PRODUCT_NAME, 
    OI.QUANTITY, 
    (OI.QUANTITY * OI.UNIT_PRICE) AS ITEM_TOTAL
FROM ORDERS O
JOIN BUYERS B ON O.BUYER_ID = B.BUYER_ID
JOIN ORDER_ITEMS OI ON O.ORDER_ID = OI.ORDER_ID
JOIN PRODUCTS P ON OI.PRODUCT_ID = P.PRODUCT_ID
WHERE O.STATUS = 'PENDING';


-- 3. UPDATE Operations (Modifying existing rows)
-- Simple Way: When a product's price changes or stock is updated after a sale.
-- Implementation: Routine maintenance and transactional updates.

-- Update product inventory after a sale
UPDATE PRODUCTS 
SET QUANTITY = QUANTITY - 50 
WHERE PRODUCT_ID = 'PRD_AMX_001' AND QUANTITY >= 50;

-- Update order status to SHIPPED
UPDATE ORDERS 
SET STATUS = 'SHIPPED', UPDATED_AT = SYSDATE 
WHERE ORDER_ID = 'ORD_2024_101';


-- 4. DELETE Operations (Removing rows)
-- Simple Way: When a buyer cancels a product in the cart or removes a favorite item.
-- Implementation: Cleanup and user preferences management.

-- Delete a specific order item (e.g., product removed from basket before checkout)
DELETE FROM ORDER_ITEMS 
WHERE ORDER_ID = 'ORD_2024_101' AND PRODUCT_ID = 'PRD_TEM_099';

-- Soft Delete: Instead of actual removal, we update status to INACTIVE
UPDATE SELLERS 
SET STATUS = 'INACTIVE' 
WHERE SELLER_ID = 'S-OLD_RECORD';
