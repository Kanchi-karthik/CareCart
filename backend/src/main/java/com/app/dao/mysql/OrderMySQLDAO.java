package com.app.dao.mysql;

import com.app.config.DatabaseConfig;
import com.app.model.Order;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import org.json.simple.JSONObject;
import org.json.simple.JSONArray;

public class OrderMySQLDAO {

    public boolean placeOrder(Order o) {
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                CallableStatement cs = conn.prepareCall("{CALL sp_place_order(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}")) {

            cs.setString(1, o.getOrderId());
            cs.setString(2, o.getBuyerId());
            cs.setString(3, o.getProductId());
            cs.setInt(4, o.getQuantity());
            cs.setString(5, o.getShippingAddress());
            cs.setBigDecimal(6, o.getTotalAmount());
            cs.setBigDecimal(7, o.getTaxAmount());
            cs.setBigDecimal(8, o.getDeliveryCharge());
            cs.setBigDecimal(9, o.getGrandTotal());
            cs.registerOutParameter(10, Types.VARCHAR);

            cs.execute();
            String result = cs.getString(10);
            System.out.println("📦 Institutional Placement Result: " + result);
            return "SUCCESS".equals(result);
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean updateOrderStatus(String orderId, String status, String changedBy) {
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                CallableStatement cs = conn.prepareCall("{CALL sp_update_order_status(?, ?, ?, ?)}")) {

            cs.setString(1, orderId);
            cs.setString(2, status);
            cs.setString(3, changedBy);
            cs.registerOutParameter(4, Types.VARCHAR);

            cs.execute();
            String result = cs.getString(4);
            System.out.println("🔄 Status Sync Result: " + result);
            return "SUCCESS".equals(result);
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<Order> getOrdersByBuyer(String buyerId) {
        List<Order> list = new ArrayList<>();
        // Advanced Join: Fetches orders with Buyer name and Product metadata via
        // Normalized Order Items
        String sql = "SELECT o.*, oi.PRODUCT_ID, oi.QUANTITY, p.NAME as PRODUCT_NAME FROM ORDERS o " +
                "JOIN ORDER_ITEMS oi ON o.ORDER_ID = oi.ORDER_ID " +
                "JOIN PRODUCTS p ON oi.PRODUCT_ID = p.PRODUCT_ID " +
                "WHERE o.BUYER_ID = ? ORDER BY o.ORDER_DATE DESC";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, buyerId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next())
                    list.add(mapRowToOrder(rs));
            }
        } catch (SQLException e) {
            System.err.println("MYSQL_BUYER_ORDER_JOIN_FAULT: " + e.getMessage());
        }
        return list;
    }

    public List<Order> getOrdersBySeller(String sellerId) {
        List<Order> list = new ArrayList<>();
        // Cross-Hub Pivot: Fetching all product line items owned by the seller
        String sql = "SELECT o.*, oi.PRODUCT_ID, oi.QUANTITY, p.NAME as PRODUCT_NAME FROM orders o " +
                "JOIN ORDER_ITEMS oi ON o.ORDER_ID = oi.ORDER_ID " +
                "JOIN products p ON oi.PRODUCT_ID = p.PRODUCT_ID " +
                "WHERE p.SELLER_ID = ? ORDER BY o.ORDER_DATE DESC";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, sellerId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next())
                    list.add(mapRowToOrder(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public Order getOrderById(String orderId) {
        String sql = "SELECT o.*, oi.PRODUCT_ID, oi.QUANTITY, p.NAME as PRODUCT_NAME FROM orders o " +
                "JOIN ORDER_ITEMS oi ON o.ORDER_ID = oi.ORDER_ID " +
                "JOIN products p ON oi.PRODUCT_ID = p.PRODUCT_ID " +
                "WHERE o.ORDER_ID = ?";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, orderId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next())
                    return mapRowToOrder(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<Order> getAllOrders() {
        List<Order> list = new ArrayList<>();
        String sql = "SELECT o.*, oi.PRODUCT_ID, oi.QUANTITY, p.NAME as PRODUCT_NAME FROM orders o " +
                "JOIN ORDER_ITEMS oi ON o.ORDER_ID = oi.ORDER_ID " +
                "JOIN products p ON oi.PRODUCT_ID = p.PRODUCT_ID " +
                "ORDER BY o.ORDER_DATE DESC";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next())
                list.add(mapRowToOrder(rs));
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<JSONObject> getDetailedOrders() {
        List<JSONObject> list = new ArrayList<>();
        // Direct View Visibility: Using VW_ORDER_DETAILS for granular product-level
        // order history
        String sql = "SELECT * FROM VW_ORDER_DETAILS ORDER BY ORDER_DATE DESC";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql);
                ResultSet rs = pstmt.executeQuery()) {
            while (rs.next()) {
                JSONObject obj = new JSONObject();
                obj.put("order_id", rs.getString("ORDER_ID"));
                obj.put("order_date", rs.getTimestamp("ORDER_DATE").toString());
                obj.put("buyer_name", rs.getString("BUYER_NAME"));
                obj.put("product_name", rs.getString("PRODUCT_NAME"));
                obj.put("quantity", rs.getInt("QUANTITY"));
                obj.put("total", rs.getBigDecimal("GRAND_TOTAL"));
                obj.put("status", rs.getString("STATUS"));
                obj.put("seller_name", rs.getString("SELLER_NAME"));
                list.add(obj);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public int bulkDispatch(String bundleId, String courier) {
        try (Connection conn = DatabaseConfig.getMySQLConnection();
                CallableStatement cs = conn.prepareCall("{CALL sp_bulk_dispatch(?, ?, ?)}")) {
            cs.setString(1, bundleId);
            cs.setString(2, courier);
            cs.registerOutParameter(3, Types.INTEGER);
            cs.execute();
            return cs.getInt(3);
        } catch (SQLException e) {
            System.err.println("BULK_DISPATCH_PROC_FAULT: " + e.getMessage());
            return -1;
        }
    }

    private Order mapRowToOrder(ResultSet rs) throws SQLException {
        Order o = new Order();
        o.setOrderId(rs.getString("ORDER_ID"));
        o.setBuyerId(rs.getString("BUYER_ID"));
        o.setProductId(rs.getString("PRODUCT_ID"));
        try {
            o.setProductName(rs.getString("PRODUCT_NAME"));
        } catch (Exception e) {
        }
        o.setQuantity(rs.getInt("QUANTITY"));
        o.setTotalAmount(rs.getBigDecimal("TOTAL_AMOUNT"));
        o.setTaxAmount(rs.getBigDecimal("TAX_AMOUNT"));
        o.setDeliveryCharge(rs.getBigDecimal("DELIVERY_CHARGE"));
        o.setGrandTotal(rs.getBigDecimal("GRAND_TOTAL"));
        o.setStatus(rs.getString("STATUS"));
        o.setShippingAddress(rs.getString("SHIPPING_ADDRESS"));
        o.setOrderDate(rs.getTimestamp("ORDER_DATE"));
        return o;
    }
}
