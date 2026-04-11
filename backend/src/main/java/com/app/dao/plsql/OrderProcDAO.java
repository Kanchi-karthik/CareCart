package com.app.dao.plsql;

import com.app.config.DatabaseConfig;
import com.app.model.Order;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import org.json.simple.JSONObject;
import org.json.simple.JSONArray;

public class OrderProcDAO {

    private static final String BASE_SQL =
        "SELECT o.*, p.NAME AS PRODUCT_NAME FROM ORACLE_ORDERS o " +
        "LEFT JOIN ORACLE_PRODUCTS p ON p.PRODUCT_ID = o.PRODUCT_ID ";

    public List<Order> getAllOrders() {
        return query(BASE_SQL + "ORDER BY o.ORDER_DATE DESC", null, null);
    }

    public List<Order> getOrdersByBuyer(String buyerId) {
        return query(BASE_SQL + "WHERE o.BUYER_ID = ? ORDER BY o.ORDER_DATE DESC", "buyer_id", buyerId);
    }

    public List<Order> getOrdersBySeller(String sellerId) {
        return query(
            "SELECT o.*, p.NAME AS PRODUCT_NAME FROM ORACLE_ORDERS o " +
            "LEFT JOIN ORACLE_PRODUCTS p ON p.PRODUCT_ID = o.PRODUCT_ID " +
            "WHERE p.SELLER_ID = ? ORDER BY o.ORDER_DATE DESC",
             "seller_id", sellerId);
    }

    private List<Order> query(String sql, String paramName, String paramValue) {
        List<Order> list = new ArrayList<>();
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            if (paramValue != null) ps.setString(1, paramValue);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) list.add(mapRowToOrder(rs));
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }

    public String placeOrder(Order o) {
        try (Connection conn = DatabaseConfig.getConnection();
             CallableStatement cs = conn.prepareCall("{CALL sp_place_order(?, ?, ?, ?, ?, ?, ?, ?, ?)}")) {
            cs.setString(1, o.getOrderId());
            cs.setString(2, o.getBuyerId());
            cs.setString(3, o.getProductId());
            cs.setInt(4, o.getQuantity());
            cs.setString(5, o.getShippingAddress());
            cs.setBigDecimal(6, o.getTaxAmount());
            cs.setBigDecimal(7, o.getDeliveryCharge());
            cs.setBigDecimal(8, o.getGrandTotal());
            cs.registerOutParameter(9, Types.VARCHAR);
            cs.execute();
            return cs.getString(9);
        } catch (SQLException e) {
            e.printStackTrace();
            return "DATABASE_ERROR: " + e.getMessage();
        }
    }

    public String updateOrderStatus(String orderId, String status, String changedBy) {
        try (Connection conn = DatabaseConfig.getConnection();
             CallableStatement cs = conn.prepareCall("{CALL sp_update_order_status(?, ?, ?, ?)}")) {
            cs.setString(1, orderId);
            cs.setString(2, status);
            cs.setString(3, changedBy);
            cs.registerOutParameter(4, Types.VARCHAR);
            cs.execute();
            return cs.getString(4);
        } catch (SQLException e) {
            e.printStackTrace();
            return "DATABASE_ERROR: " + e.getMessage();
        }
    }

    public String cancelOrder(String orderId, String reason) {
        try (Connection conn = DatabaseConfig.getConnection();
             CallableStatement cs = conn.prepareCall("{CALL sp_cancel_order(?, ?, ?)}")) {
            cs.setString(1, orderId);
            cs.setString(2, reason);
            cs.registerOutParameter(3, Types.VARCHAR);
            cs.execute();
            return cs.getString(3);
        } catch (SQLException e) {
            e.printStackTrace();
            return "DATABASE_ERROR: " + e.getMessage();
        }
    }

    public List<JSONObject> getOrderLogs(String orderId) {
        List<JSONObject> logs = new ArrayList<>();
        String sql = "SELECT * FROM ORACLE_ORDER_LOGS WHERE ORDER_ID = ? ORDER BY LOG_TIME DESC";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, orderId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    JSONObject log = new JSONObject();
                    log.put("log_id", rs.getInt("LOG_ID"));
                    log.put("order_id", rs.getString("ORDER_ID"));
                    log.put("event_type", rs.getString("EVENT_TYPE"));
                    log.put("description", rs.getString("DESCRIPTION"));
                    log.put("log_time", rs.getTimestamp("LOG_TIME") != null ? rs.getTimestamp("LOG_TIME").toString() : "");
                    log.put("location", rs.getString("LOCATION"));
                    logs.add(log);
                }
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return logs;
    }

    public void addOrderLog(String orderId, String eventType, String description, String location) {
        String sql = "INSERT INTO ORACLE_ORDER_LOGS (ORDER_ID, EVENT_TYPE, DESCRIPTION, LOCATION) VALUES (?, ?, ?, ?)";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, orderId);
            ps.setString(2, eventType);
            ps.setString(3, description);
            ps.setString(4, location);
            ps.executeUpdate();
        } catch (SQLException e) { e.printStackTrace(); }
    }

    private Order mapRowToOrder(ResultSet rs) throws SQLException {
        Order o = new Order();
        o.setOrderId(rs.getString("ORDER_ID"));
        o.setBuyerId(rs.getString("BUYER_ID"));
        o.setProductId(rs.getString("PRODUCT_ID"));
        o.setProductName(rs.getString("PRODUCT_NAME"));
        o.setQuantity(rs.getInt("QUANTITY"));
        o.setAppliedTier(rs.getString("APPLIED_TIER"));
        o.setUnitPrice(rs.getBigDecimal("UNIT_PRICE"));
        o.setTotalAmount(rs.getBigDecimal("TOTAL_AMOUNT"));
        o.setOrderDate(rs.getTimestamp("ORDER_DATE"));
        o.setStatus(rs.getString("STATUS"));
        o.setShippingAddress(rs.getString("SHIPPING_ADDRESS"));
        o.setTaxAmount(rs.getBigDecimal("TAX_AMOUNT"));
        o.setDeliveryCharge(rs.getBigDecimal("DELIVERY_CHARGE"));
        o.setGrandTotal(rs.getBigDecimal("GRAND_TOTAL"));
        return o;
    }
}
