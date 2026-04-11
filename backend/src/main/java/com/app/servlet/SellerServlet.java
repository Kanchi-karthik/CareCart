package com.app.servlet;

import com.app.dao.mysql.SellerMySQLDAO;
import com.app.model.Seller;
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

@WebServlet("/api/sellers/*")
public class SellerServlet extends HttpServlet {
    private SellerMySQLDAO dao = new SellerMySQLDAO();

    @Override
    @SuppressWarnings("unchecked")
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        String action = req.getParameter("action");
        if ("check-status".equals(action)) {
            String sid = req.getParameter("id");
            String email = req.getParameter("email");
            
            JSONObject obj = new JSONObject();
            Seller s = (sid != null) ? dao.getSellerBySellerId(sid) : dao.getSellerByEmail(email);
            
            if (s != null) {
                obj.put("status", "success");
                obj.put("verification_status", s.getVerificationStatus());
                obj.put("seller_id", s.getSellerId());
                obj.put("name", s.getName());
                obj.put("role", "SELLER");
                
                if ("PENDING".equals(s.getVerificationStatus())) {
                    obj.put("timeline", "Requested to Admin: Your clinical profile is currently under review. Access will be granted upon administrator approval.");
                } else if ("REJECTED".equals(s.getVerificationStatus())) {
                    obj.put("timeline", "Application Rejected: Please contact support for details regarding your clinical documentation.");
                } else {
                    obj.put("timeline", "Verification complete. You may now access the professional portal.");
                }
            } else {
                // Try Buyer lookup
                Buyer b = (sid != null) ? new com.app.dao.mysql.BuyerMySQLDAO().getBuyerByBuyerId(sid) : new com.app.dao.mysql.BuyerMySQLDAO().getBuyerByEmail(email);
                if (b != null) {
                    obj.put("status", "success");
                    obj.put("verification_status", "VERIFIED"); // Buyers are auto-verified
                    obj.put("seller_id", b.getBuyerId()); 
                    obj.put("name", b.getName());
                    obj.put("role", "BUYER");
                    obj.put("timeline", "Your clinician account is active. Direct access enabled.");
                } else {
                    obj.put("status", "error");
                    obj.put("message", "No valid application found for the provided details.");
                }
            }
            res.getWriter().print(obj.toJSONString());
            return;
        }

        String id = req.getParameter("id");
        if (id != null && !"next_val".equals(action)) {
            // First try by SELLER_ID
            Seller s = dao.getSellerBySellerId(id);
            // If not found, try by USER_ID
            if (s == null) s = dao.getSellerByUserId(id);
            if (s != null) {
                res.getWriter().print(serializeSeller(s).toJSONString());
            } else {
                res.getWriter().print(JSONUtil.createErrorResponse("Seller profile not found."));
            }
            return;
        }

        String userId = req.getParameter("user_id");
        if (userId != null) {
            Seller s = dao.getSellerByUserId(userId);
            if (s != null) {
                res.getWriter().print(serializeSeller(s).toJSONString());
            } else {
                res.getWriter().print(JSONUtil.createErrorResponse("Seller profile not found."));
            }
            return;
        }


        List<Seller> list = dao.getAllSellers();
        JSONArray arr = new JSONArray();
        for (Seller s : list) arr.add(serializeSeller(s));
        res.getWriter().print(arr.toJSONString());
    }

    private JSONObject serializeSeller(Seller s) {
        JSONObject obj = new JSONObject();
        obj.put("seller_id", s.getSellerId());
        obj.put("user_id", s.getUserId());
        obj.put("company_name", s.getName()); // Changed from getCompanyName
        obj.put("email", s.getEmail());
        obj.put("phone", s.getPhone());
        obj.put("business_reg_no", s.getRegistrationNo()); // Changed from getBusinessRegNo
        obj.put("address", s.getAddress());
        obj.put("city", s.getCity());
        obj.put("country", s.getCountry());
        obj.put("business_type", s.getBusinessType());
        obj.put("verification_status", s.getVerificationStatus());
        return obj;
    }

    @Override
    @SuppressWarnings("unchecked")
    protected void doPut(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json");
        JSONObject data = JSONUtil.parseRequest(req);
        String sellerId = (String) data.get("seller_id");
        Seller s = dao.getSellerBySellerId(sellerId);

        if (s == null) {
            res.getWriter().print(JSONUtil.createErrorResponse("Seller Profile not found for update."));
            return;
        }

        if (data.get("company_name") != null) s.setName((String) data.get("company_name"));
        if (data.get("email") != null) s.setEmail((String) data.get("email"));
        if (data.get("phone") != null) s.setPhone((String) data.get("phone"));
        if (data.get("business_reg_no") != null) s.setRegistrationNo((String) data.get("business_reg_no"));
        if (data.get("address") != null) s.setAddress((String) data.get("address"));
        if (data.get("city") != null) s.setCity((String) data.get("city"));
        if (data.get("country") != null) s.setCountry((String) data.get("country"));
        if (data.get("business_type") != null) s.setBusinessType((String) data.get("business_type"));
        if (data.get("verification_status") != null) {
            String status = (String) data.get("verification_status");
            if ("REJECTED".equals(status)) {
                // Wise Deletion: Remove clinical profile AND user credentials on rejection
                String userId = s.getUserId();
                if (dao.deleteSeller(sellerId)) {
                    new com.app.dao.mysql.UserMySQLDAO().deleteUser(userId);
                    res.getWriter().print(JSONUtil.createSuccessResponse("Seller application REJECTED: Profile and user purged."));
                    return;
                }
            } else {
                s.setVerificationStatus(status);
            }
        }

        if (dao.updateSeller(s)) {
            res.getWriter().print(JSONUtil.createSuccessResponse("Seller clinical profile updated successfully."));
        } else {
            res.getWriter().print(JSONUtil.createErrorResponse("Update failed in persistence tier."));
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json");
        JSONObject data = JSONUtil.parseRequest(req);
        Seller s = new Seller();
        
        String username = (String) data.get("username");
        String company = (String) data.get("company_name");
        s.setSellerId(dao.generateStructuredSellerId(username, company));

        s.setUserId((String) data.get("user_id"));
        s.setName(company); // Changed from setCompanyName
        s.setEmail((String) data.get("email"));
        s.setPhone((String) data.get("phone"));
        s.setRegistrationNo((String) data.get("business_reg_no")); // Changed from setBusinessRegNo
        s.setAddress((String) data.get("address"));
        s.setCity((String) data.get("city"));
        s.setCountry((String) data.get("country"));
        s.setBusinessType((String) data.get("business_type"));

        if (dao.createSeller(s)) {
            JSONObject resp = new JSONObject();
            resp.put("status", "success");
            resp.put("message", "Seller Profile Registered. Pending admin approval.");
            resp.put("seller_id", s.getSellerId());
            res.getWriter().print(resp.toJSONString());
        } else {
            res.getWriter().print(JSONUtil.createErrorResponse("Seller Registration failed."));
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    protected void doDelete(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json");
        String sid = req.getParameter("id");
        if (sid == null) {
            res.getWriter().print(JSONUtil.createErrorResponse("ID required for termination."));
            return;
        }

        Seller s = dao.getSellerBySellerId(sid);
        if (s != null) {
            String userId = s.getUserId();
            System.out.println("[AUDIT] Initiating clinical purge for Seller: " + sid + " (User: " + userId + ")");
            // Wise Deletion: Remove clinical profile AND user credentials
            if (dao.deleteSeller(sid)) {
                new com.app.dao.mysql.UserMySQLDAO().deleteUser(userId);
                System.out.println("[AUDIT] Purge completed successfully for Node: " + sid);
                res.getWriter().print(JSONUtil.createSuccessResponse("Seller profile and user credentials purged successfully."));
            } else {
                System.err.println("[AUDIT] Purge failure in persistence tier for Node: " + sid);
                res.getWriter().print(JSONUtil.createErrorResponse("Deletion failed in persistence tier."));
            }
        } else {
            res.getWriter().print(JSONUtil.createErrorResponse("Seller not found."));
        }
    }
}
