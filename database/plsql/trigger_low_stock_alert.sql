-- MySQL Trigger: TRIG_LOW_STOCK_ALERT
-- Module: Seller | Page: StockAlerts, Seller Dashboard | Section: Inventory Surveillance
-- Shell: mysql -u root -pKartk@30 carecart

-- Definition: fires after UPDATE on products; creates alert if stock drops below 10
DELIMITER $$
DROP TRIGGER IF EXISTS TRIG_LOW_STOCK_ALERT$$
CREATE TRIGGER TRIG_LOW_STOCK_ALERT
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
    IF NEW.stock_quantity < 10 AND OLD.stock_quantity >= 10 THEN
        INSERT INTO stock_alerts (alert_id, product_id, alert_type, is_active)
        VALUES (UUID(), NEW.product_id, 'LOW_STOCK', TRUE);
    END IF;

    IF NEW.stock_quantity = 0 THEN
        INSERT INTO stock_alerts (alert_id, product_id, alert_type, is_active)
        VALUES (UUID(), NEW.product_id, 'DEPLETED', TRUE);
    END IF;
END$$
DELIMITER ;

-- HOW TO TEST: reduce stock below threshold and check alert generated

-- Step 1: See current stock
SELECT product_id, stock_quantity FROM products WHERE product_id = 'CPROD001';

-- Step 2: Reduce stock to trigger LOW_STOCK alert (use rollback to not permanently change data)
START TRANSACTION;
UPDATE products SET stock_quantity = 5 WHERE product_id = 'CPROD001';
SELECT stock_quantity FROM products WHERE product_id = 'CPROD001';

-- Step 3: Check alert was auto-created by the trigger
SELECT * FROM stock_alerts WHERE product_id = 'CPROD001';

-- Step 4: Undo
ROLLBACK;

-- Step 5: Verify stock is restored
SELECT stock_quantity AS restored FROM products WHERE product_id = 'CPROD001';

-- Verify trigger exists in the database
SHOW TRIGGERS FROM carecart LIKE 'TRIG_LOW_STOCK_ALERT';
