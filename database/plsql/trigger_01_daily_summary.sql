USE carecart;

-- Drop if exists
DROP TRIGGER IF EXISTS trg_update_daily_summary_on_order;

DELIMITER $$

CREATE TRIGGER trg_update_daily_summary_on_order
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    DECLARE v_date DATE;
    SET v_date = DATE(NEW.order_date);
    
    INSERT INTO daily_sales_summary (
        summary_id, summary_date, total_orders, total_revenue,
        avg_order_value, unique_buyers, created_at
    ) VALUES (
        CONCAT('SUM_', DATE_FORMAT(v_date, '%Y%m%d')),
        v_date,
        1,
        NEW.grand_total,
        NEW.grand_total,
        1,
        NOW()
    )
    ON DUPLICATE KEY UPDATE
        total_orders = total_orders + 1,
        total_revenue = total_revenue + NEW.grand_total,
        avg_order_value = total_revenue / total_orders,
        updated_at = NOW();
END$$

DELIMITER ;
