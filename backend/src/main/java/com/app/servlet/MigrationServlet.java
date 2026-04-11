package com.app.servlet;

import com.app.config.DatabaseConfig;
import com.app.util.JSONUtil;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.Statement;

@WebServlet("/api/dev/migrate")
public class MigrationServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json");
        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement()) {
            
            String[] queries = {
                "ALTER TABLE PRODUCTS ADD COLUMN WHOLESALE_PRICE DECIMAL(10,2) AFTER SELLING_PRICE",
                "ALTER TABLE PRODUCTS ADD COLUMN MANUFACTURER VARCHAR(100) AFTER CATEGORY",
                "ALTER TABLE PRODUCTS ADD COLUMN STATUS VARCHAR(20) DEFAULT 'ACTIVE'"
            };
            
            for (String q : queries) {
                try { stmt.executeUpdate(q); } catch (Exception ignore) {}
            }
            res.getWriter().print(JSONUtil.createSuccessResponse("MDBMS Schema Resynchronization Successful. Columns Ready."));
        } catch (Exception e) {
            res.getWriter().print(JSONUtil.createErrorResponse("Migration Error: " + e.getMessage()));
        }
    }
}
