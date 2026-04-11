-- MySQL Procedure: sp_update_order_status
-- Module: Buyer/Seller/Admin | Page: Orders (Cancel / Status Update)
-- Shell: mysql -u root -pKartk@30 carecart

-- Definition: updates order status, restores stock and wallet if CANCELLED
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_update_order_status$$
CREATE PROCEDURE sp_update_order_status(
    IN  p_order_id  VARCHAR(50),
    IN  p_new_status VARCHAR(30),
    IN  p_changed_by VARCHAR(100),
    OUT p_result    VARCHAR(50)
)
BEGIN
    DECLARE v_old_status  VARCHAR(30);
    DECLARE v_product_id  VARCHAR(50);
    DECLARE v_buyer_id    VARCHAR(50);
    DECLARE v_quantity    INT;
    DECLARE v_grand_total DECIMAL(15,2);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result = 'ERROR';
    END;

    START TRANSACTION;

    SELECT status, product_id, buyer_id, quantity, grand_total
    INTO v_old_status, v_product_id, v_buyer_id, v_quantity, v_grand_total
    FROM orders WHERE order_id = p_order_id FOR UPDATE;

    UPDATE orders SET status = p_new_status WHERE order_id = p_order_id;

    INSERT INTO order_status_log (log_id, order_id, old_status, new_status, changed_by)
    VALUES (UUID(), p_order_id, v_old_status, p_new_status, p_changed_by);

    IF p_new_status = 'CANCELLED' THEN
        UPDATE products SET stock_quantity = stock_quantity + v_quantity
        WHERE product_id = v_product_id;

        UPDATE buyers SET wallet_balance = wallet_balance + v_grand_total
        WHERE buyer_id = v_buyer_id;
    END IF;

    COMMIT;
    SET p_result = 'SUCCESS';
END$$
DELIMITER ;

-- HOW TO TEST: Cancel an order and verify stock + wallet restored
SET @res = '';
CALL sp_update_order_status('ORD_TEST_P1', 'CANCELLED', 'BUYER', @res);
SELECT @res AS result;

-- Verify order is now CANCELLED
SELECT order_id, status FROM orders WHERE order_id = 'ORD_TEST_P1';

-- Verify stock was restored
SELECT product_id, stock_quantity FROM products WHERE product_id = 'CPROD001';

-- Verify wallet was restored
SELECT buyer_id, wallet_balance FROM buyers WHERE buyer_id = 'B-USR_BUYER1';

-- Verify audit log entry was inserted
SELECT old_status, new_status, changed_by, log_time
FROM order_status_log WHERE order_id = 'ORD_TEST_P1';
