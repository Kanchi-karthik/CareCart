package com.app.dao.mysql;

import com.app.config.DatabaseConfig;
import java.sql.*;
import org.json.simple.JSONObject;

public class DashboardMySQLDAO {

    @SuppressWarnings("unchecked")
    public JSONObject getAdminStats() {
        JSONObject stats = new JSONObject();
        stats.put("total_users", 0);
        stats.put("total_sellers", 0);
        stats.put("total_buyers", 0);
        stats.put("total_products", 0);
        stats.put("b2b_orders", 0);
        stats.put("b2c_orders", 0);
        stats.put("total_revenue", 0.0);

        try (Connection conn = DatabaseConfig.getMySQLConnection();
                Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM users");
            if (rs.next()) stats.put("total_users", rs.getInt(1));

            rs = stmt.executeQuery("SELECT COUNT(*) FROM sellers");
            if (rs.next()) stats.put("total_sellers", rs.getInt(1));

            rs = stmt.executeQuery("SELECT COUNT(*) FROM buyers");
            if (rs.next()) stats.put("total_buyers", rs.getInt(1));

            rs = stmt.executeQuery("SELECT COUNT(*) FROM products");
            if (rs.next()) stats.put("total_products", rs.getInt(1));

            rs = stmt.executeQuery("SELECT COUNT(*) FROM orders");
            if (rs.next()) stats.put("b2b_orders", rs.getInt(1));

            rs = stmt.executeQuery("SELECT COALESCE(SUM(GRAND_TOTAL), 0) FROM orders");
            if (rs.next()) stats.put("total_revenue", rs.getDouble(1));

        } catch (SQLException e) { System.err.println("ADMIN_STATS_ERR: " + e.getMessage()); }
        return stats;
    }

    public JSONObject getSellerStats(String userId) {
        JSONObject stats = new JSONObject();
        // 🏗️ Architecture Shift: Using MySQL Stored Procs for High-Speed Logistics Intelligence
        String sellerQ = "SELECT SELLER_ID FROM SELLERS WHERE USER_ID = ?";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement sStmt = conn.prepareStatement(sellerQ)) {
            sStmt.setString(1, userId);
            String sellerId = null;
            try (ResultSet rs = sStmt.executeQuery()) {
                if (rs.next()) sellerId = rs.getString(1);
            }
            if (sellerId != null) {
                try (CallableStatement cs = conn.prepareCall("{CALL sp_get_market_intelligence(?)}")) {
                    cs.setString(1, sellerId);
                    try (ResultSet rs = cs.executeQuery()) {
                        if (rs.next()) {
                            stats.put("wholesale_sales", rs.getDouble("annual_revenue"));
                            stats.put("active_shipments", rs.getInt("active_orders"));
                            stats.put("stock_alerts", rs.getInt("low_stock_count"));
                            stats.put("my_products", rs.getInt("total_stock"));
                        }
                    }
                }
            }
        } catch (SQLException e) { System.err.println("DASHBOARD_PROC_FAULT: " + e.getMessage()); }
        return stats;
    }

    public JSONObject getBuyerStats(String userId) {
        JSONObject stats = new JSONObject();
        // 💳 Dynamic Financial Telemetry: Wallet & Identity
        String identityQ = "SELECT BUYER_ID, wallet_balance FROM buyers WHERE USER_ID = ?";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement iStmt = conn.prepareStatement(identityQ)) {
            iStmt.setString(1, userId);
            String buyerId = null;
            try (ResultSet rs = iStmt.executeQuery()) {
                if (rs.next()) {
                    buyerId = rs.getString(1);
                    stats.put("wallet_balance", rs.getBigDecimal(2));
                }
            }
            
            if (buyerId != null) {
                // 📦 Procurement Velocity: Bulk Orders count
                String countQ = "SELECT COUNT(*) FROM orders WHERE BUYER_ID = ?";
                try (PreparedStatement cStmt = conn.prepareStatement(countQ)) {
                    cStmt.setString(1, buyerId);
                    try (ResultSet rs = cStmt.executeQuery()) {
                        if (rs.next()) stats.put("bulk_orders", rs.getInt(1));
                    }
                }
                
                // 💰 Cumulative Outflow: Total Spent
                String spendQ = "SELECT SUM(GRAND_TOTAL) FROM orders WHERE BUYER_ID = ?";
                try (PreparedStatement sStmt = conn.prepareStatement(spendQ)) {
                    sStmt.setString(1, buyerId);
                    try (ResultSet rs = sStmt.executeQuery()) {
                        if (rs.next()) stats.put("total_spent", rs.getBigDecimal(1) != null ? rs.getBigDecimal(1) : 0.0);
                    }
                }
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return stats;
    }
}
