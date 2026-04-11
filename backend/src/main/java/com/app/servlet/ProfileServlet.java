package com.app.servlet;

import com.app.config.DatabaseConfig;
import com.app.util.JSONUtil;
import org.json.simple.JSONObject;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

@WebServlet("/api/users/profile")
public class ProfileServlet extends HttpServlet {

    @Override
    @SuppressWarnings("unchecked")
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json");
        String userId = req.getParameter("user_id");
        String role = req.getParameter("role");
        
        if (userId == null || role == null) {
            res.getWriter().print(JSONUtil.createErrorResponse("Missing identity parameters"));
            return;
        }

        JSONObject profile = new JSONObject();
        boolean found = false;

        // 🏦 Step 1: Attempt retrieval from Transactional MySQL Hub
        String mysqlSql = "BUYER".equals(role) ? "SELECT * FROM buyers WHERE USER_ID = ?" : "SELECT * FROM sellers WHERE USER_ID = ?";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
             PreparedStatement pstmt = conn.prepareStatement(mysqlSql)) {
            pstmt.setString(1, userId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    mapFields(profile, rs, role);
                    found = true;
                }
            }
        } catch (Exception e) { System.err.println("MYSQL_PROFILE_ERR: " + e.getMessage()); }

        // 🏛️ Step 2: Attempt retrieval from Institutional Oracle Master (Fallback/Consensus)
        if (!found) {
            String oracleSql = "BUYER".equals(role) ? "SELECT * FROM ORACLE_BUYERS WHERE USER_ID = ?" : "SELECT * FROM ORACLE_SELLERS WHERE USER_ID = ?";
            try (Connection conn = DatabaseConfig.getOracleConnection();
                 PreparedStatement pstmt = conn.prepareStatement(oracleSql)) {
                pstmt.setString(1, userId);
                try (ResultSet rs = pstmt.executeQuery()) {
                    if (rs.next()) {
                        mapFields(profile, rs, role);
                        found = true;
                    }
                }
            } catch (Exception e) { System.err.println("ORACLE_PROFILE_ERR: " + e.getMessage()); }
        }

        if (found) {
            profile.put("status", "success");
            res.getWriter().print(profile.toJSONString());
        } else {
            res.getWriter().print(JSONUtil.createErrorResponse("Clinical profile not found in any node."));
        }
    }

    @SuppressWarnings("unchecked")
    private void mapFields(JSONObject profile, ResultSet rs, String role) throws java.sql.SQLException {
        profile.put("email", rs.getString("EMAIL"));
        profile.put("phone", rs.getString("PHONE"));
        profile.put("address", rs.getString("ADDRESS"));
        profile.put("city", rs.getString("CITY"));
        profile.put("name", rs.getString("NAME"));
        if ("BUYER".equals(role)) {
            profile.put("license_no", rs.getString("LICENSE_NO"));
        } else {
            profile.put("registration_no", rs.getString("REGISTRATION_NO"));
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json");
        PrintWriter out = res.getWriter();
        
        JSONObject data = JSONUtil.parseRequest(req);
        String userId = (String) data.get("user_id");
        String role = (String) data.get("role");

        String email = (String) data.get("email");
        String phone = (String) data.get("phone");
        String address = (String) data.get("address");
        String city = (String) data.get("city");
        String name = (String) data.get("name");

        boolean mysqlUpdated = false;

        // 🏦 Step 1: Update Transactional MySQL Hub
        String mysqlUpSql = "BUYER".equals(role) 
            ? "UPDATE buyers SET EMAIL=?, PHONE=?, ADDRESS=?, CITY=?, NAME=? WHERE USER_ID=?"
            : "UPDATE sellers SET EMAIL=?, PHONE=?, ADDRESS=?, CITY=?, NAME=? WHERE USER_ID=?";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
             PreparedStatement pStmt = conn.prepareStatement(mysqlUpSql)) {
            pStmt.setString(1, email);
            pStmt.setString(2, phone);
            pStmt.setString(3, address);
            pStmt.setString(4, city);
            pStmt.setString(5, name);
            pStmt.setString(6, userId);
            mysqlUpdated = pStmt.executeUpdate() > 0;
        } catch (Exception e) { System.err.println("MYSQL_PROFILE_SYNC_ERR: " + e.getMessage()); }

        // 🏛️ Step 2: Update Institutional Oracle Master
        String oracleUpSql = "BUYER".equals(role) 
            ? "UPDATE ORACLE_BUYERS SET EMAIL=?, PHONE=?, ADDRESS=?, CITY=?, NAME=? WHERE USER_ID=?"
            : "UPDATE ORACLE_SELLERS SET EMAIL=?, PHONE=?, ADDRESS=?, CITY=?, NAME=? WHERE USER_ID=?";
        try (Connection conn = DatabaseConfig.getOracleConnection();
             PreparedStatement pStmt = conn.prepareStatement(oracleUpSql)) {
            pStmt.setString(1, email);
            pStmt.setString(2, phone);
            pStmt.setString(3, address);
            pStmt.setString(4, city);
            pStmt.setString(5, name);
            pStmt.setString(6, userId);
            pStmt.executeUpdate();
        } catch (Exception e) { System.err.println("ORACLE_PROFILE_SYNC_ERR: " + e.getMessage()); }

        if (mysqlUpdated) {
            JSONObject response = new JSONObject();
            response.put("status", "success");
            response.put("message", "Clinical profile synchronized across nodes.");
            out.print(response.toJSONString());
        } else {
            out.print(JSONUtil.createErrorResponse("Profile update failed in primary hub. Verify account exists."));
        }
    }
}
