-- Admin Sellers Page: list all sellers, verify or reject pending sellers
-- Page: /app/admin/sellers | Triggered by: page load, VERIFY button, search
-- Test: mysql -u root -pKartk@30 carecart < admin_sellers_verification.sql

USE carecart;

-- READ: all sellers joined with user info
SELECT s.seller_id, s.name, s.email, s.phone, s.registration_no, s.verified, u.status
FROM sellers s
JOIN users u ON s.user_id = u.user_id
ORDER BY s.seller_id;

-- READ: only unverified sellers awaiting approval (shows in pending queue on dashboard)
SELECT s.seller_id, s.name, s.email, s.registration_no
FROM sellers s
JOIN users u ON s.user_id = u.user_id
WHERE s.verified = FALSE;

-- UPDATE: verify a seller (VERIFY button click)
UPDATE sellers SET verified = TRUE WHERE seller_id = 'SEL_001';

-- UPDATE: reject / suspend a seller
UPDATE sellers  SET verified = FALSE WHERE seller_id = 'SEL_001';
UPDATE users    SET status = 'SUSPENDED'
WHERE user_id = (SELECT user_id FROM sellers WHERE seller_id = 'SEL_001');

-- DELETE: remove seller and cascade to products
DELETE FROM sellers WHERE seller_id = 'SEL_TEST';

-- MANUAL TEST (rollback-safe)
START TRANSACTION;
INSERT INTO users   VALUES ('USR_ST1','selltest','pass','SELLER','ACTIVE',NOW());
INSERT INTO sellers VALUES ('SEL_ST1','USR_ST1','TestPharma','t@t.com','9900000000','REG001','Hyd','Hyd',FALSE);
SELECT seller_id, name, verified FROM sellers WHERE seller_id = 'SEL_ST1';
UPDATE sellers SET verified = TRUE WHERE seller_id = 'SEL_ST1';
SELECT verified FROM sellers WHERE seller_id = 'SEL_ST1';
ROLLBACK;
