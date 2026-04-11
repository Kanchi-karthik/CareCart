USE carecart;

DROP TRIGGER IF EXISTS trg_auto_create_stock_alert;

DELIMITER $$

CREATE TRIGGER trg_auto_create_stock_alert
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
    IF NEW.stock_quantity <= NEW.min_quantity AND OLD.stock_quantity > NEW.min_quantity THEN
        INSERT IGNORE INTO stock_alerts (
            alert_id, product_id, alert_type, is_active, created_at
        ) VALUES (
            CONCAT('ALERT_', NEW.product_id, '_', UNIX_TIMESTAMP()),
            NEW.product_id,
            'LOW_STOCK',
            TRUE,
            NOW()
        );
    END IF;
    
    IF NEW.stock_quantity > NEW.min_quantity AND OLD.stock_quantity <= NEW.min_quantity THEN
        UPDATE stock_alerts 
        SET is_active = FALSE 
        WHERE product_id = NEW.product_id AND alert_type = 'LOW_STOCK';
    END IF;
END$$

DELIMITER ;
