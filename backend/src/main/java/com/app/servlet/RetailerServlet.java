package com.app.servlet;

import com.app.config.DatabaseConfig;
import com.app.util.JSONUtil;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@WebServlet("/api/retailers/*")
public class RetailerServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        
        String retailerId = req.getParameter("id");
        
        try (Connection conn = DatabaseConfig.getMySQLConnection()) {
            if (retailerId != null) {
                // Get single buyer (retailer)
                String sql = "SELECT b.*, u.username, u.email, u.status FROM buyers b JOIN users u ON b.user_id = u.user_id WHERE b.buyer_id = ?";
                try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.setString(1, retailerId);
                    try (ResultSet rs = stmt.executeQuery()) {
                        if (rs.next()) {
                            JSONObject retailer = JSONUtil.resultSetToJSONObject(rs);
                            resp.getWriter().print(retailer.toJSONString());
                        } else {
                            resp.getWriter().print(JSONUtil.createErrorResponse("Retailer node not found in core hub"));
                        }
                    }
                }
            } else {
                // Get all buyers (retailers)
                String sql = "SELECT b.*, u.username, u.email, u.status FROM buyers b JOIN users u ON b.user_id = u.user_id";
                try (PreparedStatement stmt = conn.prepareStatement(sql);
                     ResultSet rs = stmt.executeQuery()) {
                    JSONArray retailers = JSONUtil.resultSetToJSONArray(rs);
                    resp.getWriter().print(retailers.toJSONString());
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            resp.getWriter().print(JSONUtil.createErrorResponse("Retailer Bridge Fault: " + e.getMessage()));
        }
    }
    
    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        
        JSONObject json = JSONUtil.parseRequest(req);
        String retailerId = (String) json.get("retailer_id");
        String status = (String) json.get("verification_status") != null ? (String) json.get("verification_status") : (String) json.get("status");
        
        if (retailerId == null || status == null) {
            resp.getWriter().print(JSONUtil.createErrorResponse("Missing identifier or status trace"));
            return;
        }
        
        try (Connection conn = DatabaseConfig.getMySQLConnection()) {
            String sql = "UPDATE buyers SET verification_status = ? WHERE buyer_id = ?";
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, status);
                stmt.setString(2, retailerId);
                
                int rows = stmt.executeUpdate();
                if (rows > 0) {
                    JSONObject response = new JSONObject();
                    response.put("status", "success");
                    response.put("message", "Retailer updated successfully");
                    resp.getWriter().print(response.toJSONString());
                } else {
                    resp.getWriter().print(JSONUtil.createErrorResponse("Retailer not found"));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            resp.getWriter().print(JSONUtil.createErrorResponse("Database error: " + e.getMessage()));
        }
    }
}
