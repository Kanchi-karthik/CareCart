-- Buyer Dashboard: wallet balance, total orders count, total spend
-- Page: /app/buyer/dashboard | Triggered by: page load
-- Test: mysql -u root -pKartk@30 carecart < buyer_dashboard_wallet_stats.sql

USE carecart;

-- READ: buyer wallet balance and profile (replace 'USR_BUYER1' with actual user_id)
SELECT b.buyer_id, b.name, b.email, b.wallet_balance
FROM buyers b
WHERE b.user_id = 'USR_BUYER1';

-- READ: total number of orders placed by this buyer
SELECT COUNT(*) AS total_orders
FROM orders WHERE buyer_id = 'B-USR_BUYER1';

-- READ: total amount spent by this buyer
SELECT COALESCE(SUM(grand_total), 0) AS total_spent
FROM orders WHERE buyer_id = 'B-USR_BUYER1';

-- READ: recent 5 orders for quick activity feed
SELECT order_id, product_id, quantity, grand_total, status, order_date
FROM orders WHERE buyer_id = 'B-USR_BUYER1'
ORDER BY order_date DESC LIMIT 5;

-- READ: combined buyer stats in one query (used by BuyerDashboard component)
SELECT
  b.wallet_balance,
  (SELECT COUNT(*)         FROM orders WHERE buyer_id = b.buyer_id)             AS total_orders,
  (SELECT COALESCE(SUM(grand_total),0) FROM orders WHERE buyer_id = b.buyer_id) AS total_spent
FROM buyers b WHERE b.user_id = 'USR_BUYER1';

-- UPDATE: deduct from wallet after successful payment
UPDATE buyers SET wallet_balance = wallet_balance - 500.00
WHERE buyer_id = 'B-USR_BUYER1' AND wallet_balance >= 500.00;

-- MANUAL TEST (rollback-safe)
START TRANSACTION;
SELECT wallet_balance FROM buyers WHERE buyer_id = 'B-USR_BUYER1';
UPDATE buyers SET wallet_balance = wallet_balance - 100 WHERE buyer_id = 'B-USR_BUYER1';
SELECT wallet_balance AS after_deduct FROM buyers WHERE buyer_id = 'B-USR_BUYER1';
ROLLBACK;
SELECT wallet_balance AS restored FROM buyers WHERE buyer_id = 'B-USR_BUYER1';
