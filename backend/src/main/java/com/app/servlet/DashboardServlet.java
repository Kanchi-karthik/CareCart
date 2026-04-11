package com.app.servlet;

import com.app.dao.mysql.DashboardMySQLDAO;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/api/dashboard/*")
public class DashboardServlet extends HttpServlet {
    private DashboardMySQLDAO dao = new DashboardMySQLDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json");
        
        String pathInfo = req.getPathInfo();
        String role = req.getParameter("role");
        String userId = req.getParameter("user_id");
        
        // Handle path-based routing: /api/dashboard/admin
        // Also handle query param: /api/dashboard?role=ADMIN
        if ("/admin".equals(pathInfo) || "ADMIN".equalsIgnoreCase(role)) {
            res.getWriter().print(dao.getAdminStats().toJSONString());
            return;
        }

        if ("SELLER".equals(role) && userId != null) {
            res.getWriter().print(dao.getSellerStats(userId).toJSONString());
        } else if ("BUYER".equals(role) && userId != null) {
            res.getWriter().print(dao.getBuyerStats(userId).toJSONString());
        } else {
            res.getWriter().print("{\"error\": \"Invalid role or missing user_id\"}");
        }
    }
}

