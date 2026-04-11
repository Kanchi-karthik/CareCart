package com.app.dao.mysql;

import com.app.config.DatabaseConfig;
import com.app.model.User;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class UserMySQLDAO {

    public User loginUserFlexible(String identifier, String password) {
        // Clinical Intelligence: First check the primary MySQL Transactional Hub
        User user = loginUser(identifier, password);
        if (user != null) return user;

        // Fallback: Check clinical emails (Buyer)
        String sqlBuyer = "SELECT u.* FROM users u JOIN buyers b ON u.USER_ID = b.USER_ID WHERE b.EMAIL = ? AND u.PASSWORD = ? AND u.STATUS = 'ACTIVE'";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
             PreparedStatement pstmt = conn.prepareStatement(sqlBuyer)) {
            pstmt.setString(1, identifier);
            pstmt.setString(2, password);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) return mapRowToUser(rs);
            }
        } catch (SQLException e) { System.err.println("MYSQL_BUYER_LOGON_ERROR: " + e.getMessage()); }

        // Fallback: Check clinical emails (Seller)
        String sqlSeller = "SELECT u.* FROM users u JOIN sellers s ON u.USER_ID = s.USER_ID WHERE s.EMAIL = ? AND u.PASSWORD = ? AND u.STATUS = 'ACTIVE'";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
             PreparedStatement pstmt = conn.prepareStatement(sqlSeller)) {
            pstmt.setString(1, identifier);
            pstmt.setString(2, password);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) return mapRowToUser(rs);
            }
        } catch (SQLException e) { System.err.println("MYSQL_SELLER_LOGON_ERROR: " + e.getMessage()); }

        return null;
    }

    public User loginUser(String username, String password) {
        // Universal Transaction Hub (MySQL): Querying primary identity node
        String sql = "SELECT * FROM users WHERE (USERNAME = ? OR USER_ID = ? OR EMAIL = ?) AND PASSWORD = ? AND STATUS = 'ACTIVE'";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, username);
            pstmt.setString(2, username);
            pstmt.setString(3, username);
            pstmt.setString(4, password);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) return mapRowToUser(rs);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    private User mapRowToUser(ResultSet rs) throws SQLException {
        User u = new User();
        u.setUserId(rs.getString("USER_ID"));
        u.setUsername(rs.getString("USERNAME"));
        u.setEmail(rs.getString("EMAIL"));
        u.setPassword(rs.getString("PASSWORD"));
        u.setRole(rs.getString("ROLE"));
        u.setStatus(rs.getString("STATUS"));
        return u;
    }

    public List<User> getAllUsers() {
        List<User> users = new ArrayList<>();
        String sql = "SELECT * FROM users";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) users.add(mapRowToUser(rs));
        } catch (SQLException e) { e.printStackTrace(); }
        return users;
    }

    public boolean createUser(User u) {
        String sql = "INSERT INTO users (USER_ID, USERNAME, EMAIL, PASSWORD, ROLE, STATUS) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, u.getUserId());
            pstmt.setString(2, u.getUsername());
            pstmt.setString(3, u.getEmail() != null ? u.getEmail() : u.getUsername());
            pstmt.setString(4, u.getPassword());
            pstmt.setString(5, u.getRole());
            pstmt.setString(6, u.getStatus() != null ? u.getStatus() : "ACTIVE");
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) { System.err.println("MYSQL_USER_CREATION_FAULT: " + e.getMessage()); }
        return false;
    }

    public boolean updateUser(User u) {
        String sql = "UPDATE users SET USERNAME=?, EMAIL=?, ROLE=?, STATUS=? WHERE USER_ID=?";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, u.getUsername());
            pstmt.setString(2, u.getEmail());
            pstmt.setString(3, u.getRole());
            pstmt.setString(4, u.getStatus());
            pstmt.setString(5, u.getUserId());
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }
        return false;
    }

    public boolean exists(String identifier) {
        String sql = "SELECT 1 FROM users WHERE USERNAME = ? OR EMAIL = ?";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, identifier);
            pstmt.setString(2, identifier);
            try (ResultSet rs = pstmt.executeQuery()) {
                return rs.next();
            }
        } catch (SQLException e) { return false; }
    }

    public boolean deleteUser(String userId) {
        String sql = "DELETE FROM users WHERE USER_ID = ?";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, userId);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }
        return false;
    }

    public String getProfileId(String userId, String role) {
        String sql = null;
        if ("BUYER".equals(role))
            sql = "SELECT BUYER_ID FROM buyers WHERE USER_ID=?";
        else if ("SELLER".equals(role))
            sql = "SELECT SELLER_ID FROM sellers WHERE USER_ID=?";
        if (sql == null) return userId;

        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, userId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) return rs.getString(1);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public String generateNextUserId() {
        return "USR_" + (System.currentTimeMillis() % 10000000);
    }
}
