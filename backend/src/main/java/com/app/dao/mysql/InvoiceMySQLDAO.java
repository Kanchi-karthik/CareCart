package com.app.dao.mysql;

import com.app.config.DatabaseConfig;
import java.sql.*;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

public class InvoiceMySQLDAO {

    public boolean generateInvoice(int id, int engId, double amount, String status, String dueDate, String desc) {
        String sql = "INSERT INTO ENGAGEMENT_INVOICES (INVOICE_ID, ENGAGEMENT_ID, AMOUNT, STATUS, DUE_DATE, DESCRIPTION) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, id);
            pstmt.setInt(2, engId);
            pstmt.setDouble(3, amount);
            pstmt.setString(4, status);
            pstmt.setString(5, dueDate);
            pstmt.setString(6, desc);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }
        return false;
    }

    public JSONArray getAllInvoices() {
        JSONArray arr = new JSONArray();
        String sql = "SELECT INVOICE_ID, ENGAGEMENT_ID, AMOUNT, STATUS, DUE_DATE, DESCRIPTION FROM ENGAGEMENT_INVOICES ORDER BY INVOICE_ID DESC";
        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                JSONObject obj = new JSONObject();
                obj.put("invoice_id", rs.getInt("INVOICE_ID"));
                obj.put("engagement_id", rs.getInt("ENGAGEMENT_ID"));
                obj.put("amount", rs.getDouble("AMOUNT"));
                obj.put("status", rs.getString("STATUS"));
                obj.put("issued_date", rs.getString("DUE_DATE"));
                obj.put("due_date", rs.getString("DUE_DATE"));
                obj.put("description", rs.getString("DESCRIPTION"));
                arr.add(obj);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return arr;
    }
}
