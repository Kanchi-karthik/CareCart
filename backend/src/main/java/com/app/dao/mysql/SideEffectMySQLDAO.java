package com.app.dao.mysql;

import com.app.config.DatabaseConfig;
import com.app.model.SideEffect;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class SideEffectMySQLDAO {

    public List<SideEffect> getByProduct(String productId) {
        List<SideEffect> list = new ArrayList<>();
        String sql = "SELECT * FROM PRODUCT_SIDE_EFFECTS WHERE PRODUCT_ID = ? ORDER BY ADDED_AT DESC";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, productId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) list.add(mapRow(rs));
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }

    public boolean create(SideEffect se) {
        String id = "EFF_" + System.currentTimeMillis() % 1000000;
        String sql = "INSERT INTO PRODUCT_SIDE_EFFECTS (EFFECT_ID, PRODUCT_ID, EFFECT, SEVERITY) VALUES (?, ?, ?, ?)";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, id);
            ps.setString(2, se.getProductId());
            ps.setString(3, se.getEffect());
            ps.setString(4, se.getSeverity() != null ? se.getSeverity() : "MILD");
            return ps.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }
        return false;
    }

    public boolean delete(String effectId) {
        String sql = "DELETE FROM PRODUCT_SIDE_EFFECTS WHERE EFFECT_ID = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, effectId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }
        return false;
    }

    private SideEffect mapRow(ResultSet rs) throws SQLException {
        SideEffect se = new SideEffect();
        se.setEffectId(rs.getString("EFFECT_ID"));
        se.setProductId(rs.getString("PRODUCT_ID"));
        se.setEffect(rs.getString("EFFECT"));
        se.setSeverity(rs.getString("SEVERITY"));
        Timestamp ts = rs.getTimestamp("ADDED_AT");
        if (ts != null) se.setAddedAt(ts.toString());
        return se;
    }
}
