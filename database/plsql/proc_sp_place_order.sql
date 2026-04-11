-- MySQL Procedure: sp_place_order
-- Module: Buyer | Page: Checkout | Section: Place Order (PAY NOW button)
-- Shell: mysql -u root -pKartk@30 carecart 

-- Definition: atomic order creation — checks stock, checks wallet, inserts order, deducts both
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_place_order$$
CREATE PROCEDURE sp_place_order(
    IN  p_order_id   VARCHAR(50),
    IN  p_buyer_id   VARCHAR(50),
    IN  p_product_id VARCHAR(50),
    IN  p_quantity   INT,
    IN  p_address    VARCHAR(500),
    OUT p_result     VARCHAR(50)
)
BEGIN
    DECLARE v_price      DECIMAL(12,2);
    DECLARE v_stock      INT;
    DECLARE v_wallet     DECIMAL(15,2);
    DECLARE v_total      DECIMAL(15,2);
    DECLARE v_seller_id  VARCHAR(50);
    DECLARE v_tier       VARCHAR(20) DEFAULT 'RETAIL';
    DECLARE v_min_w      INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result = 'ERROR';
    END;

    START TRANSACTION;

    SELECT stock_quantity, retail_price, wholesale_price, min_wholesale_qty, seller_id
    INTO v_stock, v_price, @wp, v_min_w, v_seller_id
    FROM products WHERE product_id = p_product_id FOR UPDATE;

    IF p_quantity >= v_min_w THEN
        SET v_price = @wp;
        SET v_tier  = 'WHOLESALE';
    END IF;

    SELECT wallet_balance INTO v_wallet FROM buyers WHERE buyer_id = p_buyer_id FOR UPDATE;

    SET v_total = v_price * p_quantity;

    IF v_stock < p_quantity THEN
        ROLLBACK; SET p_result = 'INSUFFICIENT_STOCK';
    ELSEIF v_wallet < v_total THEN
        ROLLBACK; SET p_result = 'INSUFFICIENT_WALLET';
    ELSE
        INSERT INTO orders (order_id, buyer_id, seller_id, product_id, quantity,
                            unit_price, total_amount, grand_total, applied_tier,
                            status, shipping_address)
        VALUES (p_order_id, p_buyer_id, v_seller_id, p_product_id, p_quantity,
                v_price, v_total, v_total, v_tier, 'PENDING', p_address);

        UPDATE products SET stock_quantity = stock_quantity - p_quantity
        WHERE product_id = p_product_id;

        UPDATE buyers SET wallet_balance = wallet_balance - v_total
        WHERE buyer_id = p_buyer_id;

        COMMIT;
        SET p_result = 'SUCCESS';
    END IF;
END$$
DELIMITER ;

-- HOW TO TEST in MySQL shell
SET @res = '';
CALL sp_place_order('ORD_TEST_P1', 'B-USR_BUYER1', 'CPROD001', 5, 'Test Hospital, Hyd', @res);
SELECT @res AS result;

-- Verify order was created
SELECT order_id, status, grand_total FROM orders WHERE order_id = 'ORD_TEST_P1';

-- Verify stock was reduced
SELECT product_id, stock_quantity FROM products WHERE product_id = 'CPROD001';

-- Verify wallet was reduced
SELECT buyer_id, wallet_balance FROM buyers WHERE buyer_id = 'B-USR_BUYER1';

-- Cleanup test order
DELETE FROM order_status_log WHERE order_id = 'ORD_TEST_P1';
DELETE FROM orders WHERE order_id = 'ORD_TEST_P1';
