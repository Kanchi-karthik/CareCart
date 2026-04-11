-- Updated Payout-Aware Order Placement Procedure
DELIMITER //

DROP PROCEDURE IF EXISTS sp_place_order //

CREATE PROCEDURE sp_place_order(
    IN p_order_id VARCHAR(50),
    IN p_buyer_id VARCHAR(50),
    IN p_product_id VARCHAR(50),
    IN p_quantity INT,
    IN p_shipping_address TEXT,
    IN p_tax_amount DECIMAL(10,2),
    IN p_delivery_charge DECIMAL(10,2),
    IN p_grand_total DECIMAL(10,2),
    OUT p_status_msg VARCHAR(255)
)
BEGIN
    DECLARE v_unit_price DECIMAL(10,2);
    DECLARE v_total_amount DECIMAL(10,2);
    
    -- 1. Fetch live product price (Wholesale or Retail)
    SELECT WHOLESALE_PRICE INTO v_unit_price FROM PRODUCTS WHERE PRODUCT_ID = p_product_id;
    
    -- 2. Calculate BASE amount
    SET v_total_amount = v_unit_price * p_quantity;
    
    -- 3. Insert the core order record
    INSERT INTO ORDERS (
        ORDER_ID, BUYER_ID, PRODUCT_ID, QUANTITY, UNIT_PRICE, TOTAL_AMOUNT, 
        TAX_AMOUNT, DELIVERY_CHARGE, GRAND_TOTAL,
        SHIPPING_ADDRESS, STATUS, ORDER_DATE
    ) VALUES (
        p_order_id, p_buyer_id, p_product_id, p_quantity, v_unit_price, v_total_amount,
        p_tax_amount, p_delivery_charge, p_grand_total,
        p_shipping_address, 'PENDING', NOW()
    );
    
    -- 4. Update product stock
    UPDATE PRODUCTS SET QUANTITY = QUANTITY - p_quantity WHERE PRODUCT_ID = p_product_id;
    
    SET p_status_msg = 'ORDER_SUCCESS: Financial routing initiated.';
END //

DELIMITER ;
