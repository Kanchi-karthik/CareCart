-- 🏛️ Institutional Oracle Master Procedures
-- Designed for M.Tech CSE - MDBMS Review

CREATE OR REPLACE PROCEDURE PROC_SETTLE_PAYMENT(
    p_order_id      IN VARCHAR2,
    p_tax_rate      IN NUMBER,
    p_shipping_fee  IN NUMBER
) IS
    v_total NUMBER;
BEGIN
    -- 1. Fetch current order amount
    SELECT GRAND_TOTAL INTO v_total FROM ORACLE_ORDERS WHERE ORDER_ID = p_order_id;
    
    -- 2. Log the settlement initiation
    INSERT INTO ORACLE_ORDER_LOGS (LOG_ID, DESCRIPTION, LOG_TIME)
    VALUES (
        'SETTLE_' || p_order_id, 
        'Institutional settlement started. Tax Rate: ' || p_tax_rate || '%, Shipping: ₹' || p_shipping_fee,
        SYSTIMESTAMP
    );
    
    -- 3. Update the Master Audit view
    UPDATE ORACLE_ORDERS SET STATUS = 'SETTLED' WHERE ORDER_ID = p_order_id;
    
    DBMS_OUTPUT.PUT_LINE('Pharmaceutical Settlement Complete for ' || p_order_id);
    DBMS_OUTPUT.PUT_LINE('Final Institutional Audit Anchorage: SUCCESS');
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('Error: Order ' || p_order_id || ' not found in Oracle vault.');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error in Institutional Settle: ' || SQLERRM);
END;
/
