package com.app.dao.mysql;

import com.app.config.DatabaseConfig;
import java.sql.*;
import java.util.HashMap;
import java.util.Map;

public class SystemSettingsDAO {
    public Map<String, String> getSettings() {
        Map<String, String> settings = new HashMap<>();
        String sql = "SELECT * FROM system_settings";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                settings.put(rs.getString("setting_key"), rs.getString("setting_value"));
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return settings;
    }

    public boolean updateSetting(String key, String value) {
        String sql = "INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, key);
            pstmt.setString(2, value);
            pstmt.setString(3, value);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }
        return false;
    }
}
