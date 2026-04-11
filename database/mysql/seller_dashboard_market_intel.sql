-- Seller Dashboard: revenue, active orders, stock alerts, product count via sp_get_market_intelligence
-- Page: /app/seller/dashboard | Triggered by: page load
-- Test: mysql -u root -pKartk@30 carecart < seller_dashboard_market_intel.sql

USE carecart;

-- READ: resolve seller_id from user_id (used by backend before calling procedure)
SELECT seller_id FROM sellers WHERE user_id = 'USR_SELLER1';

-- CALL: market intelligence procedure returns revenue, orders, stock, alerts for this seller
CALL sp_get_market_intelligence('SEL_001');

-- READ: manual breakdown of what the procedure returns
SELECT
  (SELECT COUNT(*)                    FROM orders    WHERE seller_id='SEL_001' AND status != 'CANCELLED') AS active_orders,
  (SELECT COALESCE(SUM(grand_total),0) FROM orders   WHERE seller_id='SEL_001' AND status='DELIVERED')    AS annual_revenue,
  (SELECT COUNT(*)                    FROM products   WHERE seller_id='SEL_001')                           AS total_products,
  (SELECT COALESCE(SUM(stock_quantity),0) FROM products WHERE seller_id='SEL_001')                        AS total_stock,
  (SELECT COUNT(*)                    FROM stock_alerts sa JOIN products p ON sa.product_id=p.product_id
   WHERE p.seller_id='SEL_001' AND sa.is_active=TRUE)                                                     AS low_stock_count;

-- READ: all active stock alerts for this seller's products
SELECT p.name, sa.alert_type, sa.created_at
FROM stock_alerts sa
JOIN products p ON sa.product_id = p.product_id
WHERE p.seller_id = 'SEL_001' AND sa.is_active = TRUE;

-- MANUAL TEST (call procedure and verify output)
CALL sp_get_market_intelligence('SEL_001');
