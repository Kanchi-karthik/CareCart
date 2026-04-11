-- Oracle Trigger: trg_payout_routing
-- Module: Admin | Page: Settlement/Audit Hub | Section: Automated 95/5 Revenue Split
-- Shell: sqlplus system/1234@localhost:1521/xepdb1

-- Definition: fires after INSERT on ORACLE_ORDERS; auto-calculates and logs 95/5 payout split
CREATE OR REPLACE TRIGGER trg_payout_routing
AFTER INSERT ON ORACLE_ORDERS
FOR EACH ROW
DECLARE
    v_admin_tax_percent NUMBER := 5;
    v_admin_cut         NUMBER;
    v_seller_cut        NUMBER;
BEGIN
    v_admin_cut  := (:NEW.GRAND_TOTAL * v_admin_tax_percent) / 100;
    v_seller_cut := :NEW.GRAND_TOTAL - v_admin_cut;

    DBMS_OUTPUT.PUT_LINE('Order ' || :NEW.ORDER_ID || ' payout routed.');
    DBMS_OUTPUT.PUT_LINE('Seller receives: Rs.' || v_seller_cut);
    DBMS_OUTPUT.PUT_LINE('Tax to Admin:    Rs.' || v_admin_cut);

    INSERT INTO ORACLE_ORDER_LOGS (LOG_ID, DESCRIPTION, LOG_TIME)
    VALUES (
        'PAYOUT_' || :NEW.ORDER_ID,
        'Split: Rs.' || v_seller_cut || ' (Seller 95%) / Rs.' || v_admin_cut || ' (Tax 5%)',
        SYSTIMESTAMP
    );
END;
/

-- HOW TO TEST in SQL*Plus
SET SERVEROUTPUT ON;

-- Step 1: Insert a test order (trigger fires automatically)
INSERT INTO ORACLE_ORDERS (ORDER_ID, GRAND_TOTAL, STATUS)
VALUES ('ORD_PAY_01', 4000, 'PENDING');

-- Step 2: Watch the console output for the split calculation
-- Expected: Seller = Rs.3800, Admin Tax = Rs.200

-- Step 3: View the audit log created by the trigger
SELECT * FROM ORACLE_ORDER_LOGS WHERE LOG_ID = 'PAYOUT_ORD_PAY_01';

-- Step 4: Undo test
ROLLBACK;

-- Verify trigger was created
SELECT TRIGGER_NAME, STATUS FROM USER_TRIGGERS WHERE TRIGGER_NAME = 'TRG_PAYOUT_ROUTING';
