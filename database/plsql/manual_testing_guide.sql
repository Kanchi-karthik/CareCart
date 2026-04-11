-- CARECART: PL/SQL STARTUP AND TESTING GUIDANCE
-- This file is a step-by-step humanized guide to deploying and testing 
-- the CareCart Oracle/SQL core database logic.

/* 
   STEP 1: GETTING STARTED (Connecting to the Database)
   --------------------------------------------------
   To start, open your SQL tool. For SQLPlus, use this command:
   
   $ sqlplus system/1234@localhost:1521/xepdb1
*/

-- Check if you are connected
SELECT user FROM dual;

-- Ensure the tables exist (Optional: Run the schema creation script if not done)
-- DESC SELLERS;
-- DESC PRODUCTS;
-- DESC ORDERS;


/* 
   STEP 2: DEPLOYING THE LOGIC (Compiling Procedures & Triggers)
   ------------------------------------------------------------
   Before testing, you must compile the files I provided. 
   Open each .sql file in the 'plsql' folder and execute them one by one.
   
   Files to compile:
   1. proc_sp_place_order.sql
   2. trigger_low_stock_alert.sql
   3. proc_settle_payment.sql
*/


/* 
   STEP 3: RUNNING A COMPLETE TEST CYCLE (Human Flow)
   -------------------------------------------------
   Follow these 4 sub-steps to see the PL/SQL engine in action.
*/

-- Sub-Step A: Create sample data (CRUD - Create)
INSERT INTO SELLERS (SELLER_ID, FULL_NAME, EMAIL, STATUS) 
VALUES ('S_TEST_01', 'Test Pharma', 'test@pharma.com', 'ACTIVE');

INSERT INTO PRODUCTS (PRODUCT_ID, SELLER_ID, NAME, QUANTITY, UNIT_PRICE) 
VALUES ('PRD_TEST_01', 'S_TEST_01', 'Amoxicillin 500mg', 100, 5.00);

COMMIT;


-- Sub-Step B: Place an Order (Running a Procedure)
-- This procedure will automatically create an order and reduce stock.
BEGIN
   -- Syntax: SP_PLACE_ORDER(p_buyer_id, p_product_id, p_qty)
   SP_PLACE_ORDER('B_USR_001', 'PRD_TEST_01', 10);
END;
/


-- Sub-Step C: Check for Auto-Alerts (Verifying Triggers)
-- Since we started with 100 medicine units and bought 10, the stock is now 90.
-- To test the 'Low Stock Alert' trigger, let's buy 85 more units.
BEGIN
   SP_PLACE_ORDER('B_USR_001', 'PRD_TEST_01', 85);
END;
/

-- Now, verify if the trigger fired. 
-- It should have automatically inserted a record into an 'ALERTS' or 'LOGS' table.
SELECT * FROM NOTIFICATIONS WHERE PRODUCT_ID = 'PRD_TEST_01';


-- Sub-Step D: Financial Settlement (Procedure Test)
-- Once the order is delivered, we settle the payment for the seller.
BEGIN
   -- Syntax: SETTLE_PAYMENT(p_order_id)
   SETTLE_PAYMENT('ORD_TEST_01'); 
END;
/


/* 
   STEP 4: FINAL VERIFICATION (Read Operations)
   -------------------------------------------
   Run this final query to see the consolidated state of your database.
*/

SELECT 
    p.NAME AS Product, 
    p.QUANTITY AS Remaining_Stock, 
    o.STATUS AS Order_Status,
    s.FULL_NAME AS Seller_Name
FROM PRODUCTS p
JOIN SELLERS s ON p.SELLER_ID = s.SELLER_ID
LEFT JOIN ORDERS o ON o.BUYER_ID = 'B_USR_001'
WHERE p.PRODUCT_ID = 'PRD_TEST_01';


/* 
   PRO TIP: 
   If any procedure fails, use 'SHOW ERRORS' to find out why.
   Always remember to COMMIT your changes if you want them to be permanent.
*/
