-- Seller Orders Page: view incoming orders, update status, track delivery
-- Page: /app/seller/orders | Triggered by: page load, status dropdown change
-- Test: mysql -u root -pKartk@30 carecart < seller_orders_manage.sql

USE carecart;

-- READ: all orders for this seller with buyer info
SELECT o.order_id, o.status, o.quantity, o.grand_total, o.order_date,
       o.shipping_address, b.name AS buyer_name, p.name AS product_name
FROM orders o
JOIN buyers   b ON o.buyer_id   = b.buyer_id
JOIN products p ON o.product_id = p.product_id
WHERE o.seller_id = 'SEL_001'
ORDER BY o.order_date DESC;

-- READ: filter by order status for seller view
SELECT order_id, buyer_id, product_id, quantity, grand_total, status
FROM orders WHERE seller_id = 'SEL_001' AND status = 'PENDING';

-- UPDATE: advance order to PACKED (seller packs the shipment)
CALL sp_update_order_status('ORD_001', 'PACKED', 'SELLER', @res);
SELECT @res;

-- UPDATE: mark as SHIPPED (handed to logistics)
CALL sp_update_order_status('ORD_001', 'SHIPPED', 'SELLER', @res);
SELECT @res;

-- READ: order status history log for this order (populated by trigger)
SELECT old_status, new_status, changed_by, log_time
FROM order_status_log WHERE order_id = 'ORD_001' ORDER BY log_time;

-- READ: revenue from completed orders this month
SELECT COALESCE(SUM(grand_total), 0) AS monthly_revenue
FROM orders
WHERE seller_id = 'SEL_001' AND status = 'DELIVERED'
  AND MONTH(order_date) = MONTH(CURDATE()) AND YEAR(order_date) = YEAR(CURDATE());

-- MANUAL TEST (rollback-safe)
START TRANSACTION;
UPDATE orders SET status = 'PACKED' WHERE order_id = 'ORD_001' AND seller_id = 'SEL_001';
SELECT order_id, status FROM orders WHERE order_id = 'ORD_001';
ROLLBACK;
