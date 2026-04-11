package com.app.dao.mysql;

import com.app.config.DatabaseConfig;
import com.app.model.Product;
import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ProductRelationalDAO {
    
    public List<Product> getAllProducts() {
        List<Product> list = new ArrayList<>();
        String sql = "SELECT p.*, s.NAME AS SELLER_NAME FROM products p LEFT JOIN sellers s ON p.SELLER_ID = s.SELLER_ID";
        
        try (Connection conn = DatabaseConfig.getMySQLConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                list.add(mapRow(rs));
            }
        } catch (Exception e) { e.printStackTrace(); }
        return list;
    }

    public List<Product> getProductsBySeller(String sellerId) {
        List<Product> list = new ArrayList<>();
        String sql = "SELECT p.*, s.NAME AS SELLER_NAME FROM products p LEFT JOIN sellers s ON p.SELLER_ID = s.SELLER_ID WHERE p.SELLER_ID = ?";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, sellerId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRow(rs));
                }
            }
        } catch (Exception e) { e.printStackTrace(); }
        return list;
    }

    public Product getProductById(String id) {
        String sql = "SELECT p.*, s.NAME AS SELLER_NAME FROM products p LEFT JOIN sellers s ON p.SELLER_ID = s.SELLER_ID WHERE p.PRODUCT_ID = ?";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) return mapRow(rs);
            }
        } catch (Exception e) { e.printStackTrace(); }
        return null;
    }

    public boolean createProduct(Product p) {
        String sql = "INSERT INTO products (PRODUCT_ID, SELLER_ID, NAME, MANUFACTURER, COMPOSITION, CATEGORY, RETAIL_PRICE, SELLING_PRICE, WHOLESALE_PRICE, MIN_WHOLESALE_QTY, MIN_ORDER_QTY, STOCK_QUANTITY, MIN_QUANTITY, DESCRIPTION, IMAGE_URL, STATUS) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, p.getProductId());
            pstmt.setString(2, p.getSellerId());
            pstmt.setString(3, p.getName());
            pstmt.setString(4, p.getManufacturer());
            pstmt.setString(5, p.getComposition());
            pstmt.setString(6, p.getCategory());
            pstmt.setBigDecimal(7, p.getRetailPrice());
            pstmt.setBigDecimal(8, p.getSellingPrice());
            pstmt.setBigDecimal(9, p.getWholesalePrice());
            pstmt.setInt(10, p.getMinWholesaleQty());
            pstmt.setInt(11, p.getMinOrderQty());
            pstmt.setInt(12, p.getQuantity());
            pstmt.setInt(13, p.getMinQuantity());
            pstmt.setString(14, p.getDescription());
            pstmt.setString(15, p.getImageUrl());
            pstmt.setString(16, p.getStatus() != null ? p.getStatus() : "ACTIVE");
            return pstmt.executeUpdate() > 0;
        } catch (Exception e) { 
            e.printStackTrace(); 
            return false;
        }
    }

    public boolean updateProduct(Product p) {
        String sql = "UPDATE products SET NAME=?, MANUFACTURER=?, COMPOSITION=?, CATEGORY=?, RETAIL_PRICE=?, SELLING_PRICE=?, WHOLESALE_PRICE=?, MIN_WHOLESALE_QTY=?, MIN_ORDER_QTY=?, STOCK_QUANTITY=?, MIN_QUANTITY=?, DESCRIPTION=?, IMAGE_URL=?, STATUS=? WHERE PRODUCT_ID=?";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, p.getName());
            pstmt.setString(2, p.getManufacturer());
            pstmt.setString(3, p.getComposition());
            pstmt.setString(4, p.getCategory());
            pstmt.setBigDecimal(5, p.getRetailPrice());
            pstmt.setBigDecimal(6, p.getSellingPrice());
            pstmt.setBigDecimal(7, p.getWholesalePrice());
            pstmt.setInt(8, p.getMinWholesaleQty());
            pstmt.setInt(9, p.getMinOrderQty());
            pstmt.setInt(10, p.getQuantity());
            pstmt.setInt(11, p.getMinQuantity());
            pstmt.setString(12, p.getDescription());
            pstmt.setString(13, p.getImageUrl());
            pstmt.setString(14, p.getStatus());
            pstmt.setString(15, p.getProductId());
            return pstmt.executeUpdate() > 0;
        } catch (Exception e) { 
            e.printStackTrace(); 
            return false;
        }
    }

    public boolean deleteProduct(String id) {
        String sql = "DELETE FROM products WHERE PRODUCT_ID = ?";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, id);
            return pstmt.executeUpdate() > 0;
        } catch (Exception e) { return false; }
    }

    private Product mapRow(ResultSet rs) throws SQLException {
        Product p = new Product();
        p.setProductId(getColumn(rs, "PRODUCT_ID", ""));
        p.setSellerId(getColumn(rs, "SELLER_ID", ""));
        p.setName(getColumn(rs, "NAME", "Unknown"));
        p.setManufacturer(getColumn(rs, "MANUFACTURER", ""));
        p.setComposition(getColumn(rs, "COMPOSITION", ""));
        p.setCategory(getColumn(rs, "CATEGORY", "General"));
        p.setRetailPrice(getBigDecimal(rs, "RETAIL_PRICE"));
        p.setSellingPrice(getBigDecimal(rs, "SELLING_PRICE"));
        p.setWholesalePrice(getBigDecimal(rs, "WHOLESALE_PRICE"));
        p.setMinWholesaleQty(getInt(rs, "MIN_WHOLESALE_QTY"));
        p.setMinOrderQty(getInt(rs, "MIN_ORDER_QTY"));
        p.setQuantity(getInt(rs, "STOCK_QUANTITY"));
        p.setMinQuantity(getInt(rs, "MIN_QUANTITY"));
        p.setDescription(getColumn(rs, "DESCRIPTION", ""));
        p.setImageUrl(getColumn(rs, "IMAGE_URL", "default_medicine.png"));
        p.setStatus(getColumn(rs, "STATUS", "ACTIVE"));
        p.setSellerName(getColumn(rs, "SELLER_NAME", "N/A"));
        return p;
    }

    private String getColumn(ResultSet rs, String col, String def) {
        try { 
            String val = rs.getString(col);
            return val != null ? val : def;
        } catch (Exception e) { return def; }
    }

    private BigDecimal getBigDecimal(ResultSet rs, String col) {
        try { 
            BigDecimal val = rs.getBigDecimal(col);
            return val != null ? val : new BigDecimal("0.00");
        } catch (Exception e) { return new BigDecimal("0.00"); }
    }

    private int getInt(ResultSet rs, String col) {
        try { return rs.getInt(col); } catch (Exception e) { return 0; }
    }
}
