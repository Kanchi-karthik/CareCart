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

@WebServlet("/api/consultants/*")
public class ConsultantServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        
        String consultantId = req.getParameter("id");
        
        try (Connection conn = DatabaseConfig.getMySQLConnection()) {
            if (consultantId != null) {
                // Get single consultant
                String sql = "SELECT c.*, u.username, u.email, u.status FROM consultants c JOIN users u ON c.user_id = u.user_id WHERE c.consultant_id = ?";
                try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.setString(1, consultantId);
                    try (ResultSet rs = stmt.executeQuery()) {
                        if (rs.next()) {
                            JSONObject consultant = JSONUtil.resultSetToJSONObject(rs);
                            resp.getWriter().print(consultant.toJSONString());
                        } else {
                            resp.getWriter().print(JSONUtil.createErrorResponse("Consultant not found"));
                        }
                    }
                }
            } else {
                // Get all consultants
                String sql = "SELECT c.*, u.username, u.email, u.status FROM consultants c JOIN users u ON c.user_id = u.user_id ORDER BY c.created_at DESC";
                try (PreparedStatement stmt = conn.prepareStatement(sql);
                     ResultSet rs = stmt.executeQuery()) {
                    JSONArray consultants = JSONUtil.resultSetToJSONArray(rs);
                    resp.getWriter().print(consultants.toJSONString());
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            resp.getWriter().print(JSONUtil.createErrorResponse("Database error: " + e.getMessage()));
        }
    }
    
    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        
        JSONObject json = JSONUtil.parseRequest(req);
        String consultantId = (String) json.get("consultant_id");
        String status = (String) json.get("status");
        
        if (consultantId == null || status == null) {
            resp.getWriter().print(JSONUtil.createErrorResponse("Missing consultant_id or status"));
            return;
        }
        
        try (Connection conn = DatabaseConfig.getMySQLConnection()) {
            String sql = "UPDATE consultants SET verified = ?, status = ? WHERE consultant_id = ?";
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, "YES");
                stmt.setString(2, status);
                stmt.setString(3, consultantId);
                
                int rows = stmt.executeUpdate();
                if (rows > 0) {
                    JSONObject response = new JSONObject();
                    response.put("status", "success");
                    response.put("message", "Consultant updated successfully");
                    resp.getWriter().print(response.toJSONString());
                } else {
                    resp.getWriter().print(JSONUtil.createErrorResponse("Consultant not found"));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            resp.getWriter().print(JSONUtil.createErrorResponse("Database error: " + e.getMessage()));
        }
    }
}
