package com.app.dao.oracle;

import com.app.config.DatabaseConfig;
import java.sql.*;

public class SETTLEMENT_DAO {

    /**
     * Professional CareCart Financial Hub: 
     * Finalizes the payment, triggers the PL/SQL settlement procedure,
     * and distributes funds across sellers and admin taxes.
     * Supports Alphanumeric Order IDs (ORD_...)
     */
    public boolean finalizeInstitutionalPayment(String orderId, double taxRate, double shippingFee) {
        // 1. Transactional Hub (MySQL): Persist Payment Data
        String mysqlSql = "INSERT INTO payments (PAYMENT_ID, ORDER_ID, AMOUNT, PAYMENT_METHOD, STATUS) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement pstmt = conn.prepareStatement(mysqlSql)) {
            String payId = "PAY_" + System.currentTimeMillis();
            pstmt.setString(1, payId);
            pstmt.setString(2, orderId);
            pstmt.setDouble(3, 500.00);
            pstmt.setString(4, "INSTITUTIONAL_BANKING");
            pstmt.setString(5, "COMPLETED");
            pstmt.executeUpdate();
            System.out.println("MYSQL LEDGER: Transaction archived for Order " + orderId);
        } catch (SQLException e) { System.err.println("MYSQL LEDGER FAULT: " + e.getMessage()); }

        // 2. Clinical Vault (Oracle): Authorize PL/SQL Settlement Logic (GST, Admin Tax, Payouts)
        String oracleSql = "{call PROC_SETTLE_PAYMENT(?, ?, ?)}";
        try (Connection conn = DatabaseConfig.getOracleConnection();
             CallableStatement cs = conn.prepareCall(oracleSql)) {
            cs.setString(1, orderId);
            cs.setDouble(2, taxRate);
            cs.setDouble(3, shippingFee);
            cs.execute();
            System.out.println("ORACLE VAULT: Institutional PL/SQL Logic EXECUTED for Order " + orderId);
            return true;
        } catch (SQLException e) {
            System.err.println("CRITICAL FAULT: Institutional Logic Failure: " + e.getMessage());
            return false;
        }
    }
}
