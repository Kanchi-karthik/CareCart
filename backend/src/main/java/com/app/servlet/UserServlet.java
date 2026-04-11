package com.app.servlet;

import com.app.dao.mysql.UserMySQLDAO;
import com.app.dao.mysql.BuyerMySQLDAO;
import com.app.dao.mysql.SellerMySQLDAO;
import com.app.model.Buyer;
import com.app.model.Seller;
import com.app.model.User;
import com.app.util.JSONUtil;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import javax.servlet.annotation.WebServlet;

@WebServlet({ "/api/admin/users", "/api/admin/users/*" })
public class UserServlet extends HttpServlet {
    private UserMySQLDAO userDAO = new UserMySQLDAO();

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) {
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String action = request.getParameter("action");
        if ("next_val".equals(action)) {
            JSONObject obj = new JSONObject();
            obj.put("next_id", userDAO.generateNextUserId());
            out.print(obj.toJSONString());
            return;
        }

        List<User> list = userDAO.getAllUsers();
        JSONArray arr = new JSONArray();
        for (User u : list) {
            JSONObject obj = new JSONObject();
            obj.put("user_id", u.getUserId());
            obj.put("username", u.getUsername());
            obj.put("email", u.getEmail() != null ? u.getEmail() : u.getUsername());
            obj.put("role", u.getRole());
            obj.put("status", u.getStatus());
            arr.add(obj);
        }
        out.print(arr.toJSONString());
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        JSONObject data = JSONUtil.parseRequest(request);

        User u = new User();
        String userId = (String) data.get("user_id");
        String username = (String) data.get("username");
        String email = (String) data.get("email");
        if (email == null) email = username; // Fallback

        // Clinical Safety: Defensive identifier check
        if (userDAO.exists(username) || userDAO.exists(email)) {
             out.print(JSONUtil.createErrorResponse("Hyper-Check Fault: Identity '" + username + "' already mapped in Unified Logistics Hub."));
             return;
        }

        if (userId == null || userId.trim().isEmpty()) {
            userId = userDAO.generateNextUserId();
        }
        u.setUserId(userId);
        u.setUsername(username);
        u.setEmail(email);
        u.setPassword((String) data.get("password"));
        u.setRole((String) data.get("role"));
        u.setStatus((String) data.get("status"));

        if (userDAO.createUser(u)) {
            try {
                String role = u.getRole();
                String id = u.getUserId();
                if ("BUYER".equals(role)) {
                    BuyerMySQLDAO dao = new BuyerMySQLDAO();
                    Buyer b = new Buyer();
                    b.setBuyerId(dao.generateNextBuyerId());
                    b.setUserId(id);
                    b.setName(u.getUsername()); 
                    b.setEmail(u.getEmail());
                    b.setPhone("0000000000");
                    b.setAddress("CareCart Registered Node");
                    b.setCity("Hub");
                    b.setCountry("India");
                    dao.createBuyer(b);
                } else if ("SELLER".equals(role)) {
                    SellerMySQLDAO dao = new SellerMySQLDAO();
                    Seller s = new Seller();
                    s.setSellerId(dao.generateStructuredSellerId(u.getUsername(), "REG"));
                    s.setUserId(id);
                    s.setName(u.getUsername()); 
                    s.setEmail(u.getEmail());
                    s.setPhone("0000000000");
                    s.setRegistrationNo("VER_PENDING");
                    s.setAddress("Logistics Terminal");
                    s.setCity("Central");
                    s.setCountry("India");
                    s.setBusinessType("DISTRIBUTOR");
                    s.setVerificationStatus("PENDING");
                    dao.createSeller(s);
                }
            } catch (Exception e) {
                System.err.println("Admin B2B Sync Fault: " + e.getMessage());
            }
            out.print(JSONUtil.createSuccessResponse("Unified identity synchronized."));
        } else {
            out.print(JSONUtil.createErrorResponse("Persistence failure during identity mapping."));
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        JSONObject data = JSONUtil.parseRequest(request);

        User u = new User();
        u.setUserId((String) data.get("user_id"));
        u.setUsername((String) data.get("username"));
        u.setRole((String) data.get("role"));
        u.setStatus((String) data.get("status"));

        if (userDAO.updateUser(u)) {
            out.print(JSONUtil.createSuccessResponse("Account updated."));
        } else {
            out.print(JSONUtil.createErrorResponse("Failed to update account."));
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        String id = request.getParameter("id");

        if (id != null && userDAO.deleteUser(id)) {
            out.print(JSONUtil.createSuccessResponse("Account removed."));
        } else {
            out.print(JSONUtil.createErrorResponse("Failed to delete account."));
        }
    }
}
