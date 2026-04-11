-- Admin Buyers Page: list all institutional buyers, view wallet, manage status
-- Page: /app/admin/buyers | Triggered by: page load, search, status toggle
-- Test: mysql -u root -pKartk@30 carecart < admin_buyers_list.sql

USE carecart;

-- READ: all buyers with user info and wallet balance
SELECT b.buyer_id, b.name, b.email, b.phone, b.license_no, b.wallet_balance, u.status
FROM buyers b
JOIN users u ON b.user_id = u.user_id
ORDER BY b.name;

-- READ: search buyer by name or email
SELECT b.buyer_id, b.name, b.email, b.wallet_balance
FROM buyers b
WHERE b.name LIKE '%hospital%' OR b.email LIKE '%clinic%';

-- READ: buyers with low wallet balance (below 1000)
SELECT buyer_id, name, wallet_balance FROM buyers WHERE wallet_balance < 1000.00;

-- UPDATE: top up wallet for a buyer (admin action)
UPDATE buyers SET wallet_balance = wallet_balance + 5000.00 WHERE buyer_id = 'B-USR_BUYER1';

-- UPDATE: suspend a buyer account
UPDATE users SET status = 'SUSPENDED'
WHERE user_id = (SELECT user_id FROM buyers WHERE buyer_id = 'B-USR_BUYER1');

-- DELETE: remove buyer (cascades to orders automatically)
DELETE FROM buyers WHERE buyer_id = 'B-TEST99';

-- MANUAL TEST (rollback-safe)
START TRANSACTION;
INSERT INTO users  VALUES ('USR_BT1','buytest','pass','BUYER','ACTIVE',NOW());
INSERT INTO buyers VALUES ('B-BT1','USR_BT1','Test Hospital','th@h.com','9800000000','LIC001','Delhi','Delhi',10000.00);
SELECT buyer_id, name, wallet_balance FROM buyers WHERE buyer_id = 'B-BT1';
UPDATE buyers SET wallet_balance = wallet_balance + 2000 WHERE buyer_id = 'B-BT1';
SELECT wallet_balance FROM buyers WHERE buyer_id = 'B-BT1';
ROLLBACK;
