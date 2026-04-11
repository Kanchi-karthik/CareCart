package com.app.dao.mysql;

import com.app.config.DatabaseConfig;
import com.app.model.Buyer;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class BuyerMySQLDAO {
    public Buyer getBuyerByUserId(String userId) {
        String mysqlSql = "SELECT * FROM buyers WHERE USER_ID = ?";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement pstmt = conn.prepareStatement(mysqlSql)) {
            pstmt.setString(1, userId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) return mapRowToBuyer(rs);
            }
        } catch (SQLException e) { System.err.println("MYSQL_BUYER_QUERY_ERROR: " + e.getMessage()); }
        return null;
    }

    public Buyer getBuyerByBuyerId(String buyerId) {
        String sql = "SELECT * FROM buyers WHERE BUYER_ID = ?";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, buyerId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) return mapRowToBuyer(rs);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public Buyer getBuyerByEmail(String email) {
        String sql = "SELECT * FROM buyers WHERE EMAIL = ?";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, email);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) return mapRowToBuyer(rs);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public List<Buyer> getAllBuyers() {
        List<Buyer> list = new ArrayList<>();
        String sql = "SELECT * FROM buyers";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) list.add(mapRowToBuyer(rs));
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }

    public boolean createBuyer(Buyer b) {
        // Clinical Intelligence: Transactional Sync across MySQL and Oracle
        String mysqlSql = "INSERT INTO buyers (BUYER_ID, USER_ID, NAME, EMAIL, PHONE, LICENSE_NO, ADDRESS, CITY, COUNTRY, VERIFICATION_STATUS, WALLET_BALANCE) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.00)";
        boolean mysqlSaved = false;
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement pstmt = conn.prepareStatement(mysqlSql)) {
            pstmt.setString(1, b.getBuyerId());
            pstmt.setString(2, b.getUserId());
            pstmt.setString(3, b.getName());
            pstmt.setString(4, b.getEmail());
            pstmt.setString(5, b.getPhone());
            pstmt.setString(6, b.getLicenseNo() != null ? b.getLicenseNo() : "REG-PENDING");
            pstmt.setString(7, b.getAddress());
            pstmt.setString(8, b.getCity());
            pstmt.setString(9, b.getCountry());
            pstmt.setString(10, b.getVerificationStatus() != null ? b.getVerificationStatus() : "VERIFIED");
            mysqlSaved = pstmt.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }

        return mysqlSaved;
    }

    public String generateStructuredBuyerId(String username, String phone) {
        String p1 = (username != null && username.length() >= 4) ? username.substring(0, 4).toUpperCase() : (username != null ? username.toUpperCase() : "BUYR");
        String p2 = (phone != null && phone.length() >= 4) ? phone.substring(phone.length() - 4) : "0000";
        return p1 + p2;
    }

    public String generateNextBuyerId() {
        return "BUY_" + (System.currentTimeMillis() % 10000);
    }

    public boolean updateWallet(String buyerId, double amount) {
        // Clinical Hub Sync: Atomic Wallet Updates across both nodes
        String mysqlSql = "UPDATE buyers SET WALLET_BALANCE = WALLET_BALANCE + ? WHERE BUYER_ID = ?";
        boolean mysqlUp = false;
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement pstmt = conn.prepareStatement(mysqlSql)) {
            pstmt.setDouble(1, amount);
            pstmt.setString(2, buyerId);
            mysqlUp = pstmt.executeUpdate() > 0;
        } catch (SQLException e) { System.err.println("MYSQL_WALLET_UPDATE_FAULT: " + e.getMessage()); }
        
        return mysqlUp;
    }

    public boolean updateBuyer(Buyer b) {
        String mysqlSql = "UPDATE buyers SET NAME=?, EMAIL=?, PHONE=?, LICENSE_NO=?, ADDRESS=?, CITY=?, COUNTRY=?, VERIFICATION_STATUS=? WHERE BUYER_ID=?";
        boolean mysqlUp = false;
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement pstmt = conn.prepareStatement(mysqlSql)) {
            pstmt.setString(1, b.getName());
            pstmt.setString(2, b.getEmail());
            pstmt.setString(3, b.getPhone());
            pstmt.setString(4, b.getLicenseNo());
            pstmt.setString(5, b.getAddress());
            pstmt.setString(6, b.getCity());
            pstmt.setString(7, b.getCountry());
            pstmt.setString(8, b.getVerificationStatus());
            pstmt.setString(9, b.getBuyerId());
            mysqlUp = pstmt.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }
        return mysqlUp;
    }

    public boolean deleteBuyer(String buyerId) {
        String mysqlSql = "DELETE FROM buyers WHERE BUYER_ID = ?";
        boolean mysqlDeleted = false;
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement pstmt = conn.prepareStatement(mysqlSql)) {
            pstmt.setString(1, buyerId);
            mysqlDeleted = pstmt.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }
        return mysqlDeleted;
    }

    private Buyer mapRowToBuyer(ResultSet rs) throws SQLException {
        Buyer b = new Buyer();
        b.setBuyerId(rs.getString("BUYER_ID"));
        b.setUserId(rs.getString("USER_ID"));
        b.setName(rs.getString("NAME"));
        b.setEmail(rs.getString("EMAIL"));
        b.setPhone(rs.getString("PHONE"));
        b.setLicenseNo(rs.getString("LICENSE_NO"));
        b.setAddress(rs.getString("ADDRESS"));
        b.setCity(rs.getString("CITY"));
        b.setCountry(rs.getString("COUNTRY"));
        b.setWalletBalance(rs.getBigDecimal("WALLET_BALANCE"));
        b.setVerificationStatus(rs.getString("VERIFICATION_STATUS"));
        return b;
    }
}
