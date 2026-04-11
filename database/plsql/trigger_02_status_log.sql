USE carecart;

DROP TRIGGER IF EXISTS trg_auto_log_order_status_change;

DELIMITER $$

CREATE TRIGGER trg_auto_log_order_status_change
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO order_status_log (
            log_id, order_id, old_status, new_status, changed_by, log_time
        ) VALUES (
            CONCAT('LOG_', UNIX_TIMESTAMP(NOW())),
            NEW.order_id,
            OLD.status,
            NEW.status,
            'SYSTEM',
            NOW()
        );
    END IF;
END$$

DELIMITER ;
