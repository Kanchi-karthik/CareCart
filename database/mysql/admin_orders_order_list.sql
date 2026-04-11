-- Admin Orders Page: view all orders, filter by status, update order status
-- Page: /app/admin/orders | Triggered by: page load, status filter, update action
-- Test: mysql -u root -pKartk@30 carecart < admin_orders_order_list.sql

USE carecart;

-- READ: all orders with buyer and product info
SELECT o.order_id, o.status, o.quantity, o.grand_total, o.order_date,
       b.name AS buyer_name, p.name AS product_name, s.name AS seller_name
FROM orders o
JOIN buyers   b ON o.buyer_id   = b.buyer_id
JOIN products p ON o.product_id = p.product_id
LEFT JOIN sellers s ON o.seller_id = s.seller_id
ORDER BY o.order_date DESC;

-- READ: filter orders by status (PENDING / PACKED / SHIPPED / DELIVERED / CANCELLED)
SELECT order_id, buyer_id, product_id, grand_total, status
FROM orders WHERE status = 'PENDING';

-- READ: orders placed today
SELECT order_id, buyer_id, grand_total, status
FROM orders WHERE DATE(order_date) = CURDATE();

-- READ: audit log for any order (shows trigger-generated history)
SELECT log_id, old_status, new_status, changed_by, log_time
FROM order_status_log WHERE order_id = 'ORD_001'
ORDER BY log_time;

-- UPDATE: move order to next logistics stage
UPDATE orders SET status = 'PACKED'   WHERE order_id = 'ORD_001';
UPDATE orders SET status = 'SHIPPED'  WHERE order_id = 'ORD_001';
UPDATE orders SET status = 'DELIVERED' WHERE order_id = 'ORD_001';

-- MANUAL TEST (rollback-safe)
START TRANSACTION;
UPDATE orders SET status = 'PACKED' WHERE order_id = 'ORD_001';
SELECT order_id, status FROM orders WHERE order_id = 'ORD_001';
SELECT * FROM order_status_log WHERE order_id = 'ORD_001';
ROLLBACK;
