-- Admin Users Page: list, search, update status, delete users
-- Page: /app/admin/users | Triggered by: page load, search bar, status toggle, delete button
-- Test: mysql -u root -pKartk@30 carecart < admin_users_user_list.sql

USE carecart;

-- READ: all users for the user list table
SELECT u.user_id, u.username, u.role, u.status, u.created_at,
       COALESCE(b.name, s.name) AS profile_name,
       COALESCE(b.email, s.email) AS email
FROM users u
LEFT JOIN buyers  b ON u.user_id = b.user_id
LEFT JOIN sellers s ON u.user_id = s.user_id
ORDER BY u.created_at DESC;

-- READ: search users by username or email
SELECT u.user_id, u.username, u.role, u.status,
       COALESCE(b.email, s.email) AS email
FROM users u
LEFT JOIN buyers  b ON u.user_id = b.user_id
LEFT JOIN sellers s ON u.user_id = s.user_id
WHERE u.username LIKE '%hospital%' OR b.email LIKE '%hospital%';

-- READ: filter users by role
SELECT user_id, username, role, status FROM users WHERE role = 'BUYER';

-- UPDATE: toggle user status between ACTIVE and SUSPENDED
UPDATE users SET status = 'SUSPENDED' WHERE user_id = 'USR_BUYER1';
UPDATE users SET status = 'ACTIVE'    WHERE user_id = 'USR_BUYER1';

-- DELETE: remove user and cascade-delete buyer/seller profile
DELETE FROM users WHERE user_id = 'USR_TEST99';

-- MANUAL TEST (rollback-safe)
START TRANSACTION;
INSERT INTO users VALUES ('USR_T1','testuser','pass','BUYER','ACTIVE',NOW());
SELECT user_id, username, role FROM users WHERE user_id = 'USR_T1';
UPDATE users SET status = 'SUSPENDED' WHERE user_id = 'USR_T1';
SELECT status FROM users WHERE user_id = 'USR_T1';
ROLLBACK;
SELECT COUNT(*) AS cleaned_up FROM users WHERE user_id = 'USR_T1';
