-- Admin Dashboard: system-wide stats (users, sellers, buyers, products, orders, revenue)
-- Page: /app/admin/dashboard | Triggered by: page load, refresh button
-- Test: mysql -u root -pKartk@30 carecart < admin_dashboard_stats.sql

USE carecart;

-- READ: total user count shown in System Health card
SELECT COUNT(*) AS total_users FROM users;

-- READ: total sellers count shown in Update Stats panel
SELECT COUNT(*) AS total_sellers FROM sellers;

-- READ: total buyers count shown in Update Stats panel
SELECT COUNT(*) AS total_buyers FROM buyers;

-- READ: total products in inventory card
SELECT COUNT(*) AS total_products FROM products WHERE status = 'ACTIVE';

-- READ: total orders for Total Completed Orders card
SELECT COUNT(*) AS total_orders FROM orders;

-- READ: total revenue for Gross Valuation card
SELECT COALESCE(SUM(grand_total), 0) AS total_revenue FROM orders;

-- READ: all stats in one combined query (used by DashboardMySQLDAO.getAdminStats)
SELECT
  (SELECT COUNT(*) FROM users)                         AS total_users,
  (SELECT COUNT(*) FROM sellers)                       AS total_sellers,
  (SELECT COUNT(*) FROM buyers)                        AS total_buyers,
  (SELECT COUNT(*) FROM products WHERE status='ACTIVE') AS total_products,
  (SELECT COUNT(*) FROM orders)                         AS total_orders,
  (SELECT COALESCE(SUM(grand_total),0) FROM orders)     AS total_revenue;

-- MANUAL TEST (rollback-safe): insert fake data, check stats, undo
START TRANSACTION;
INSERT INTO users VALUES ('USR_TEST99','testadmin','pass','ADMIN','ACTIVE',NOW());
SELECT COUNT(*) AS users_after_insert FROM users;
ROLLBACK;
SELECT COUNT(*) AS users_restored FROM users;
