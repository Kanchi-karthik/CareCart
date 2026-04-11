package com.app.servlet;

import com.app.dao.mysql.BuyerMySQLDAO;
import com.app.model.Buyer;
import com.app.util.JSONUtil;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet("/api/buyers/*")
public class BuyerServlet extends HttpServlet {
    private BuyerMySQLDAO dao = new BuyerMySQLDAO();

    @Override
    @SuppressWarnings("unchecked")
    protected void doOptions(HttpServletRequest req, HttpServletResponse res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    @SuppressWarnings("unchecked")
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setContentType("application/json");
        String action = req.getParameter("action");
        if ("next_val".equals(action)) {
            JSONObject obj = new JSONObject();
            obj.put("next_id", dao.generateNextBuyerId());
            res.getWriter().print(obj.toJSONString());
            return;
        }
        List<Buyer> list = dao.getAllBuyers();
        JSONArray arr = new JSONArray();
        for (Buyer b : list) {
            JSONObject obj = new JSONObject();
            obj.put("buyer_id", b.getBuyerId());
            obj.put("user_id", b.getUserId());
            obj.put("organization_name", b.getName()); 
            obj.put("email", b.getEmail());
            obj.put("phone", b.getPhone());
            obj.put("license_no", b.getLicenseNo());
            obj.put("address", b.getAddress());
            obj.put("city", b.getCity());
            obj.put("country", b.getCountry());
            obj.put("wallet_balance", b.getWalletBalance());
            obj.put("verification_status", b.getVerificationStatus());
            arr.add(obj);
        }
        res.getWriter().print(arr.toJSONString());
    }

    @Override
    @SuppressWarnings("unchecked")
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setContentType("application/json");
        JSONObject data = JSONUtil.parseRequest(req);
        Buyer b = new Buyer();
        b.setBuyerId(dao.generateNextBuyerId());
        b.setUserId((String) data.get("user_id"));
        b.setName((String) data.get("organization_name") != null ? (String) data.get("organization_name") : (String) data.get("name"));
        b.setEmail((String) data.get("email"));
        b.setPhone((String) data.get("phone"));
        b.setAddress((String) data.get("address"));
        b.setCity((String) data.get("city"));
        b.setCountry((String) data.get("country"));
        if (dao.createBuyer(b)) {
            res.getWriter().print(JSONUtil.createSuccessResponse("Buyer Profile Registered Successfuly."));
        } else {
            res.getWriter().print(JSONUtil.createErrorResponse("Buyer Registration failed."));
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    protected void doPut(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setContentType("application/json");
        String action = req.getParameter("action");
        if ("fund".equals(action)) {
            JSONObject data = JSONUtil.parseRequest(req);
            String buyerId = (String) data.get("buyer_id");
            double amount = data.get("amount") != null ? ((Number) data.get("amount")).doubleValue() : 0;
            if (dao.updateWallet(buyerId, amount)) {
                res.getWriter().print(JSONUtil.createSuccessResponse("Funds synchronized successfully."));
            } else {
                res.getWriter().print(JSONUtil.createErrorResponse("Financial node sync failed."));
            }
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    protected void doDelete(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setContentType("application/json");
        String bid = req.getParameter("id");
        if (bid == null) {
            res.getWriter().print(JSONUtil.createErrorResponse("ID required for termination."));
            return;
        }

        Buyer b = dao.getBuyerByBuyerId(bid);
        if (b != null) {
            String userId = b.getUserId();
            System.out.println("[AUDIT] Initiating clinical purge for Buyer: " + bid + " (User: " + userId + ")");
            // Wise Deletion: Remove clinical profile AND user credentials
            if (dao.deleteBuyer(bid)) {
                new com.app.dao.mysql.UserMySQLDAO().deleteUser(userId);
                System.out.println("[AUDIT] Purge completed successfully for Node: " + bid);
                res.getWriter().print(JSONUtil.createSuccessResponse("Buyer profile and associated user account purged."));
            } else {
                System.err.println("[AUDIT] Purge failure in persistence tier for Node: " + bid);
                res.getWriter().print(JSONUtil.createErrorResponse("Termination failed in persistence tier."));
            }
        } else {
            res.getWriter().print(JSONUtil.createErrorResponse("Buyer not found."));
        }
    }
}
