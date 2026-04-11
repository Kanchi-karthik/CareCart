package com.app.servlet;

import com.app.config.DatabaseConfig;
import com.app.util.JSONUtil;
import java.io.IOException;
import java.sql.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONObject;

/**
 * Cart Management Servlet
 * Handles shopping cart operations
 */
@WebServlet("/api/cart/*")
public class CartServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = req.getPathInfo();
        
        if (pathInfo == null || pathInfo.equals("/")) {
            // Get all cart items for user
            String userId = req.getParameter("user_id");
            getCartItems(resp, userId);
        } else {
            // Get specific cart item
            String cartId = pathInfo.substring(1);
            getCartItem(resp, cartId);
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        JSONObject json = JSONUtil.parseRequest(req);
        
        String buyerId = (String) json.get("buyer_id");
        String productId = (String) json.get("product_id");
        int quantity = 1;
        if (json.get("quantity") != null) {
            quantity = Integer.parseInt(json.get("quantity").toString());
        }
        
        addToCart(resp, buyerId, productId, quantity);
    }
    
    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = req.getPathInfo();
        if (pathInfo != null && !pathInfo.equals("/")) {
            String cartId = pathInfo.substring(1);
            JSONObject json = JSONUtil.parseRequest(req);
            int quantity = 1;
            if (json.get("quantity") != null) {
                quantity = Integer.parseInt(json.get("quantity").toString());
            }
            
            updateCartItem(resp, cartId, quantity);
        }
    }
    
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = req.getPathInfo();
        
        if (pathInfo != null && !pathInfo.equals("/")) {
            String cartId = pathInfo.substring(1);
            deleteCartItem(resp, cartId);
        } else {
            // Clear entire cart
            String userId = req.getParameter("user_id");
            clearCart(resp, userId);
        }
    }
    
    private void getCartItems(HttpServletResponse resp, String userId) throws IOException {
        String sql = "SELECT c.*, p.name, p.image_url, p.retail_price, p.wholesale_price, " +
                     "p.seller_id, s.name as seller_name " +
                     "FROM cart c " +
                     "JOIN products p ON c.product_id = p.product_id " +
                     "JOIN sellers s ON p.seller_id = s.seller_id " +
                     "WHERE c.buyer_id = ? " +
                     "ORDER BY c.added_at DESC";
        
        try (Connection conn = DatabaseConfig.getMySQLConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, userId);
            ResultSet rs = stmt.executeQuery();
            
            resp.getWriter().print(JSONUtil.cartItemsToJSON(rs));
        } catch (SQLException e) {
            resp.getWriter().print(JSONUtil.createErrorResponse("Error fetching cart: " + e.getMessage()));
            resp.setStatus(500);
        }
    }
    
    private void getCartItem(HttpServletResponse resp, String cartId) throws IOException {
        String sql = "SELECT c.*, p.name, p.image_url, p.retail_price, p.wholesale_price " +
                     "FROM cart c JOIN products p ON c.product_id = p.product_id " +
                     "WHERE c.cart_id = ?";
        
        try (Connection conn = DatabaseConfig.getMySQLConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, cartId);
            ResultSet rs = stmt.executeQuery();
            
            resp.getWriter().print(JSONUtil.cartItemToJSON(rs));
        } catch (SQLException e) {
            resp.getWriter().print(JSONUtil.createErrorResponse("Error fetching cart item: " + e.getMessage()));
            resp.setStatus(500);
        }
    }
    
    private void addToCart(HttpServletResponse resp, String buyerId, String productId, int quantity) throws IOException {
        // Check if item already exists
        String checkSql = "SELECT * FROM cart WHERE buyer_id = ? AND product_id = ?";
        
        try (Connection conn = DatabaseConfig.getMySQLConnection();
             PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {
            
            checkStmt.setString(1, buyerId);
            checkStmt.setString(2, productId);
            ResultSet rs = checkStmt.executeQuery();
            
            if (rs.next()) {
                // Update quantity if exists
                String cartId = rs.getString("cart_id");
                int currentQty = rs.getInt("quantity");
                
                String updateSql = "UPDATE cart SET quantity = ?, updated_at = NOW() WHERE cart_id = ?";
                try (PreparedStatement updateStmt = conn.prepareStatement(updateSql)) {
                    updateStmt.setInt(1, currentQty + quantity);
                    updateStmt.setString(2, cartId);
                    updateStmt.executeUpdate();
                    
                    resp.getWriter().print(JSONUtil.createSuccessResponse("Cart updated successfully", cartId));
                }
            } else {
                // Insert new cart item
                String cartId = "CART_" + System.currentTimeMillis();
                String insertSql = "INSERT INTO cart (cart_id, buyer_id, product_id, quantity, added_at, updated_at) " +
                                   "VALUES (?, ?, ?, ?, NOW(), NOW())";
                
                try (PreparedStatement insertStmt = conn.prepareStatement(insertSql)) {
                    insertStmt.setString(1, cartId);
                    insertStmt.setString(2, buyerId);
                    insertStmt.setString(3, productId);
                    insertStmt.setInt(4, quantity);
                    insertStmt.executeUpdate();
                    
                    resp.getWriter().print(JSONUtil.createSuccessResponse("Added to cart successfully", cartId));
                }
            }
        } catch (SQLException e) {
            resp.getWriter().print(JSONUtil.createErrorResponse("Error adding to cart: " + e.getMessage()));
            resp.setStatus(500);
        }
    }
    
    private void updateCartItem(HttpServletResponse resp, String cartId, int quantity) throws IOException {
        String sql = "UPDATE cart SET quantity = ?, updated_at = NOW() WHERE cart_id = ?";
        
        try (Connection conn = DatabaseConfig.getMySQLConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, quantity);
            stmt.setString(2, cartId);
            int rows = stmt.executeUpdate();
            
            if (rows > 0) {
                resp.getWriter().print(JSONUtil.createSuccessResponse("Cart updated successfully", cartId));
            } else {
                resp.getWriter().print(JSONUtil.createErrorResponse("Cart item not found"));
                resp.setStatus(404);
            }
        } catch (SQLException e) {
            resp.getWriter().print(JSONUtil.createErrorResponse("Error updating cart: " + e.getMessage()));
            resp.setStatus(500);
        }
    }
    
    private void deleteCartItem(HttpServletResponse resp, String cartId) throws IOException {
        String sql = "DELETE FROM cart WHERE cart_id = ?";
        
        try (Connection conn = DatabaseConfig.getMySQLConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, cartId);
            int rows = stmt.executeUpdate();
            
            if (rows > 0) {
                resp.getWriter().print(JSONUtil.createSuccessResponse("Item removed from cart", cartId));
            } else {
                resp.getWriter().print(JSONUtil.createErrorResponse("Cart item not found"));
                resp.setStatus(404);
            }
        } catch (SQLException e) {
            resp.getWriter().print(JSONUtil.createErrorResponse("Error removing item: " + e.getMessage()));
            resp.setStatus(500);
        }
    }
    
    private void clearCart(HttpServletResponse resp, String userId) throws IOException {
        String sql = "DELETE FROM cart WHERE buyer_id = ?";
        
        try (Connection conn = DatabaseConfig.getMySQLConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, userId);
            int rows = stmt.executeUpdate();
            
            resp.getWriter().print(JSONUtil.createSuccessResponse("Cart cleared", String.valueOf(rows)));
        } catch (SQLException e) {
            resp.getWriter().print(JSONUtil.createErrorResponse("Error clearing cart: " + e.getMessage()));
            resp.setStatus(500);
        }
    }
}
