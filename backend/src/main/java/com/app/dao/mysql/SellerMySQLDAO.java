package com.app.dao.mysql;

import com.app.config.DatabaseConfig;
import com.app.model.Seller;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class SellerMySQLDAO {
    public Seller getSellerByUserId(String userId) {
        String sql = "SELECT * FROM sellers WHERE USER_ID = ?";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, userId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) return mapRowToSeller(rs);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public Seller getSellerBySellerId(String sellerId) {
        String mysqlSql = "SELECT * FROM sellers WHERE SELLER_ID = ?";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement pstmt = conn.prepareStatement(mysqlSql)) {
            pstmt.setString(1, sellerId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) return mapRowToSeller(rs);
            }
        } catch (SQLException e) { System.err.println("MYSQL_SELLER_QUERY_ERROR: " + e.getMessage()); }
        return null;
    }

    public Seller getSellerByEmail(String email) {
        String mysqlSql = "SELECT * FROM sellers WHERE EMAIL = ?";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement pstmt = conn.prepareStatement(mysqlSql)) {
            pstmt.setString(1, email);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) return mapRowToSeller(rs);
            }
        } catch (SQLException e) { System.err.println("MYSQL_SELLER_BY_EMAIL_ERROR: " + e.getMessage()); }
        return null;
    }

    public Seller getSellerByName(String name) {
        String mysqlSql = "SELECT * FROM sellers WHERE NAME = ?";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement pstmt = conn.prepareStatement(mysqlSql)) {
            pstmt.setString(1, name);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) return mapRowToSeller(rs);
            }
        } catch (SQLException e) { System.err.println("MYSQL_SELLER_BY_NAME_ERROR: " + e.getMessage()); }
        return null;
    }

    public Seller getSellerByRegistrationNo(String regNo) {
        String mysqlSql = "SELECT * FROM sellers WHERE REGISTRATION_NO = ?";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement pstmt = conn.prepareStatement(mysqlSql)) {
            pstmt.setString(1, regNo);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) return mapRowToSeller(rs);
            }
        } catch (SQLException e) { System.err.println("MYSQL_SELLER_BY_REGNO_ERROR: " + e.getMessage()); }
        return null;
    }

    public List<Seller> getAllSellers() {
        List<Seller> list = new ArrayList<>();
        String sql = "SELECT * FROM sellers";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) list.add(mapRowToSeller(rs));
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }

    public boolean createSeller(Seller s) {
        String mysqlSql = "INSERT INTO sellers (SELLER_ID, USER_ID, NAME, EMAIL, PHONE, REGISTRATION_NO, ADDRESS, CITY, COUNTRY, BUSINESS_TYPE, VERIFICATION_STATUS) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        boolean mysqlSaved = false;
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement pstmt = conn.prepareStatement(mysqlSql)) {
            pstmt.setString(1, s.getSellerId());
            pstmt.setString(2, s.getUserId());
            pstmt.setString(3, s.getName());
            pstmt.setString(4, s.getEmail());
            pstmt.setString(5, s.getPhone());
            pstmt.setString(6, s.getRegistrationNo());
            pstmt.setString(7, s.getAddress());
            pstmt.setString(8, s.getCity());
            pstmt.setString(9, s.getCountry());
            pstmt.setString(10, s.getBusinessType());
            pstmt.setString(11, s.getVerificationStatus() != null ? s.getVerificationStatus() : "PENDING");
            mysqlSaved = pstmt.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }

        return mysqlSaved;
    }

    public boolean updateSeller(Seller s) {
        String mysqlSql = "UPDATE sellers SET NAME=?, EMAIL=?, PHONE=?, REGISTRATION_NO=?, ADDRESS=?, CITY=?, COUNTRY=?, BUSINESS_TYPE=?, VERIFICATION_STATUS=? WHERE SELLER_ID=?";
        boolean mysqlUp = false;
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement pstmt = conn.prepareStatement(mysqlSql)) {
            pstmt.setString(1, s.getName());
            pstmt.setString(2, s.getEmail());
            pstmt.setString(3, s.getPhone());
            pstmt.setString(4, s.getRegistrationNo());
            pstmt.setString(5, s.getAddress());
            pstmt.setString(6, s.getCity());
            pstmt.setString(7, s.getCountry());
            pstmt.setString(8, s.getBusinessType());
            pstmt.setString(9, s.getVerificationStatus());
            pstmt.setString(10, s.getSellerId());
            mysqlUp = pstmt.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }

        return mysqlUp;
    }

    public String generateNextSellerId() {
        return "SEL_" + (System.currentTimeMillis() % 100000);
    }

    public String generateStructuredSellerId(String username, String companyName) {
        // CareCart Unique Code: 3 letters from username + 4 random digits = 7 chars total
        // Example: username="seller" → "SEL" + "3042" = "SEL3042"
        String u = (username != null) ? username.replaceAll("[^a-zA-Z]", "").toUpperCase() : "SEL";
        String prefix = (u.length() >= 3) ? u.substring(0, 3) : (u + "SEL").substring(0, 3);
        int digits = 1000 + (int)(Math.random() * 9000); // 4-digit random
        String candidate = prefix + digits;
        // Ensure uniqueness by adding timestamp suffix if already taken
        if (getSellerBySellerId(candidate) != null) {
            candidate = prefix + (System.currentTimeMillis() % 10000);
        }
        return candidate;
    }

    public boolean deleteSeller(String sellerId) {
        String mysqlSql = "DELETE FROM sellers WHERE SELLER_ID = ?";
        boolean mysqlDeleted = false;
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement pstmt = conn.prepareStatement(mysqlSql)) {
            pstmt.setString(1, sellerId);
            mysqlDeleted = pstmt.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }
        return mysqlDeleted;
    }

    private Seller mapRowToSeller(ResultSet rs) throws SQLException {
        Seller s = new Seller();
        s.setSellerId(rs.getString("SELLER_ID"));
        s.setUserId(rs.getString("USER_ID"));
        s.setName(rs.getString("NAME"));
        s.setEmail(rs.getString("EMAIL"));
        s.setPhone(rs.getString("PHONE"));
        s.setRegistrationNo(rs.getString("REGISTRATION_NO"));
        s.setAddress(rs.getString("ADDRESS"));
        s.setCity(rs.getString("CITY"));
        s.setCountry(rs.getString("COUNTRY"));
        s.setBusinessType(rs.getString("BUSINESS_TYPE"));
        s.setVerificationStatus(rs.getString("VERIFICATION_STATUS"));
        return s;
    }
}
