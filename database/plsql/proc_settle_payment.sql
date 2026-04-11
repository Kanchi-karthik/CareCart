-- Oracle Procedure: PROC_SETTLE_PAYMENT
-- Module: Admin | Page: Settlement / Audit Hub | Section: Institutional Financial Settlement
-- Shell: sqlplus system/1234@localhost:1521/xepdb1

-- Definition: settles an order in Oracle Master Vault, logs audit trail
CREATE OR REPLACE PROCEDURE PROC_SETTLE_PAYMENT(
    p_order_id     IN VARCHAR2,
    p_tax_rate     IN NUMBER,
    p_shipping_fee IN NUMBER
) IS
    v_total NUMBER;
BEGIN
    SELECT GRAND_TOTAL INTO v_total FROM ORACLE_ORDERS WHERE ORDER_ID = p_order_id;

    INSERT INTO ORACLE_ORDER_LOGS (LOG_ID, DESCRIPTION, LOG_TIME)
    VALUES (
        'SETTLE_' || p_order_id,
        'Settlement: Tax=' || p_tax_rate || '%, Ship=Rs.' || p_shipping_fee || ', Total=Rs.' || v_total,
        SYSTIMESTAMP
    );

    UPDATE ORACLE_ORDERS SET STATUS = 'SETTLED' WHERE ORDER_ID = p_order_id;

    DBMS_OUTPUT.PUT_LINE('Settlement complete for: ' || p_order_id);
    DBMS_OUTPUT.PUT_LINE('Total Processed: Rs.' || v_total);

EXCEPTION
    WHEN NO_DATA_FOUND THEN DBMS_OUTPUT.PUT_LINE('Order not found: ' || p_order_id);
    WHEN OTHERS        THEN DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;
/

-- HOW TO TEST in SQL*Plus
SET SERVEROUTPUT ON;

-- Step 1: Create a test order first
INSERT INTO ORACLE_ORDERS (ORDER_ID, GRAND_TOTAL, STATUS) VALUES ('ORD_SET_01', 2500, 'PENDING');

-- Step 2: Call the settlement procedure
BEGIN
    PROC_SETTLE_PAYMENT('ORD_SET_01', 12.5, 100);
END;
/

-- Step 3: Check the audit log
SELECT * FROM ORACLE_ORDER_LOGS WHERE LOG_ID = 'SETTLE_ORD_SET_01';

-- Step 4: Verify status changed to SETTLED
SELECT ORDER_ID, STATUS FROM ORACLE_ORDERS WHERE ORDER_ID = 'ORD_SET_01';

-- Step 5: Undo test data
ROLLBACK;
