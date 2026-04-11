-- Buyer Checkout Page: place order, deduct stock, lock wallet via sp_place_order
-- Page: /app/checkout | Triggered by: PLACE ORDER / PAY NOW button
-- Test: mysql -u root -pKartk@30 carecart < buyer_checkout_place_order.sql

USE carecart;

-- READ: verify buyer has sufficient wallet balance before placing order
SELECT buyer_id, wallet_balance
FROM buyers WHERE buyer_id = 'B-USR_BUYER1' AND wallet_balance >= 1500.00;

-- READ: verify product has enough stock before placing order
SELECT product_id, stock_quantity
FROM products WHERE product_id = 'CPROD001' AND stock_quantity >= 10;

-- CALL: place order using atomic stored procedure (inserts order + deducts stock + locks wallet)
SET @result = '';
CALL sp_place_order('ORD_NEW_01', 'B-USR_BUYER1', 'CPROD001', 10, '123 Main Street, Hyd', @result);
SELECT @result AS order_status;

-- READ: confirm order was created
SELECT order_id, status, quantity, grand_total FROM orders WHERE order_id = 'ORD_NEW_01';

-- READ: confirm stock was deducted after order
SELECT product_id, stock_quantity FROM products WHERE product_id = 'CPROD001';

-- READ: confirm wallet was deducted after order
SELECT buyer_id, wallet_balance FROM buyers WHERE buyer_id = 'B-USR_BUYER1';

-- READ: confirm audit log entry was created by trigger
SELECT log_id, new_status, log_time FROM order_status_log WHERE order_id = 'ORD_NEW_01';

-- MANUAL TEST: run the full checkout flow and undo
START TRANSACTION;
SET @res = '';
CALL sp_place_order('ORD_TEST_CHK', 'B-USR_BUYER1', 'CPROD001', 2, 'Test Address', @res);
SELECT @res AS procedure_result;
SELECT order_id, status, grand_total FROM orders WHERE order_id = 'ORD_TEST_CHK';
ROLLBACK;
SELECT COUNT(*) AS cleaned_up FROM orders WHERE order_id = 'ORD_TEST_CHK';
