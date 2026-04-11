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
 * Wishlist Management Servlet
 * Handles customer wishlist operations
 */
@WebServlet("/api/wishlist/*")
public class WishlistServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = req.getPathInfo();
        
        if (pathInfo == null || pathInfo.equals("/")) {
            // Get all wishlist items for user
            String buyerId = req.getParameter("buyer_id");
            getWishlistItems(resp, buyerId);
        } else {
            // Get specific wishlist item
            String wishlistId = pathInfo.substring(1);
            getWishlistItem(resp, wishlistId);
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        JSONObject json = JSONUtil.parseRequest(req);
        
        String buyerId = (String) json.get("buyer_id");
        String productId = (String) json.get("product_id");
        String priority = (String) json.get("priority");
        String notes = (String) json.get("notes");
        
        // Default values
        if (priority == null || priority.trim().isEmpty()) {
            priority = "MEDIUM";
        }
        if (notes == null) {
            notes = "";
        }
        
        addToWishlist(resp, buyerId, productId, priority, notes);
    }
    
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = req.getPathInfo();
        
        if (pathInfo != null && !pathInfo.equals("/")) {
            String wishlistId = pathInfo.substring(1);
            deleteWishlistItem(resp, wishlistId);
        } else {
            // Clear entire wishlist
            String buyerId = req.getParameter("buyer_id");
            clearWishlist(resp, buyerId);
        }
    }
    
    private void getWishlistItems(HttpServletResponse resp, String buyerId) throws IOException {
        String sql = "SELECT w.*, p.name, p.image_url, p.retail_price, p.wholesale_price, " +
                     "p.seller_id, s.name as seller_name " +
                     "FROM wishlist w " +
                     "JOIN products p ON w.product_id = p.product_id " +
                     "JOIN sellers s ON p.seller_id = s.seller_id " +
                     "WHERE w.buyer_id = ? " +
                     "ORDER BY w.added_at DESC";
        
        try (Connection conn = DatabaseConfig.getMySQLConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, buyerId);
            ResultSet rs = stmt.executeQuery();
            
            resp.getWriter().print(JSONUtil.wishlistItemsToJSON(rs));
        } catch (SQLException e) {
            resp.getWriter().print(JSONUtil.createErrorResponse("Error fetching wishlist: " + e.getMessage()));
            resp.setStatus(500);
        }
    }
    
    private void getWishlistItem(HttpServletResponse resp, String wishlistId) throws IOException {
        String sql = "SELECT w.*, p.name, p.image_url, p.retail_price " +
                     "FROM wishlist w JOIN products p ON w.product_id = p.product_id " +
                     "WHERE w.wishlist_id = ?";
        
        try (Connection conn = DatabaseConfig.getMySQLConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, wishlistId);
            ResultSet rs = stmt.executeQuery();
            
            resp.getWriter().print(JSONUtil.wishlistItemToJSON(rs));
        } catch (SQLException e) {
            resp.getWriter().print(JSONUtil.createErrorResponse("Error fetching wishlist item: " + e.getMessage()));
            resp.setStatus(500);
        }
    }
    
    private void addToWishlist(HttpServletResponse resp, String buyerId, String productId, 
                               String priority, String notes) throws IOException {
        // Check if item already exists
        String checkSql = "SELECT * FROM wishlist WHERE buyer_id = ? AND product_id = ?";
        
        try (Connection conn = DatabaseConfig.getMySQLConnection();
             PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {
            
            checkStmt.setString(1, buyerId);
            checkStmt.setString(2, productId);
            ResultSet rs = checkStmt.executeQuery();
            
            if (rs.next()) {
                resp.getWriter().print(JSONUtil.createErrorResponse("Product already in wishlist"));
                resp.setStatus(400);
            } else {
                String wishlistId = "WISH_" + System.currentTimeMillis();
                String insertSql = "INSERT INTO wishlist (wishlist_id, buyer_id, product_id, priority, notes, added_at) " +
                                   "VALUES (?, ?, ?, ?, ?, NOW())";
                
                try (PreparedStatement insertStmt = conn.prepareStatement(insertSql)) {
                    insertStmt.setString(1, wishlistId);
                    insertStmt.setString(2, buyerId);
                    insertStmt.setString(3, productId);
                    insertStmt.setString(4, priority);
                    insertStmt.setString(5, notes);
                    insertStmt.executeUpdate();
                    
                    resp.getWriter().print(JSONUtil.createSuccessResponse("Added to wishlist successfully", wishlistId));
                }
            }
        } catch (SQLException e) {
            resp.getWriter().print(JSONUtil.createErrorResponse("Error adding to wishlist: " + e.getMessage()));
            resp.setStatus(500);
        }
    }
    
    private void deleteWishlistItem(HttpServletResponse resp, String wishlistId) throws IOException {
        String sql = "DELETE FROM wishlist WHERE wishlist_id = ?";
        
        try (Connection conn = DatabaseConfig.getMySQLConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, wishlistId);
            int rows = stmt.executeUpdate();
            
            if (rows > 0) {
                resp.getWriter().print(JSONUtil.createSuccessResponse("Item removed from wishlist", wishlistId));
            } else {
                resp.getWriter().print(JSONUtil.createErrorResponse("Wishlist item not found"));
                resp.setStatus(404);
            }
        } catch (SQLException e) {
            resp.getWriter().print(JSONUtil.createErrorResponse("Error removing item: " + e.getMessage()));
            resp.setStatus(500);
        }
    }
    
    private void clearWishlist(HttpServletResponse resp, String buyerId) throws IOException {
        String sql = "DELETE FROM wishlist WHERE buyer_id = ?";
        
        try (Connection conn = DatabaseConfig.getMySQLConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, buyerId);
            int rows = stmt.executeUpdate();
            
            resp.getWriter().print(JSONUtil.createSuccessResponse("Wishlist cleared", String.valueOf(rows)));
        } catch (SQLException e) {
            resp.getWriter().print(JSONUtil.createErrorResponse("Error clearing wishlist: " + e.getMessage()));
            resp.setStatus(500);
        }
    }
}
