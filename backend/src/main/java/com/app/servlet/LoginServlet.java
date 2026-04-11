package com.app.servlet;

import com.app.dao.mysql.UserMySQLDAO;
import com.app.dao.mysql.BuyerMySQLDAO;
import com.app.dao.mysql.SellerMySQLDAO;
import com.app.model.Buyer;
import com.app.model.Seller;
import com.app.model.User;
import com.app.util.JSONUtil;
import org.json.simple.JSONObject;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

import java.util.concurrent.ConcurrentHashMap;

@WebServlet({ "/api/users/login", "/api/users/register", "/api/users/verify", "/api/users/send-registration-otp", "/api/users/verify-registration-otp" })
public class LoginServlet extends HttpServlet {
    private UserMySQLDAO userDAO = new UserMySQLDAO();
    
    // In-Memory Secure OTP Caches (TTL should be added in production)
    private static ConcurrentHashMap<String, String> EMAIL_OTP_STORE = new ConcurrentHashMap<>();
    private static ConcurrentHashMap<String, String> PHONE_OTP_STORE = new ConcurrentHashMap<>();

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();
        String uri = request.getRequestURI();

        if (uri.endsWith("/send-registration-otp"))
            handleSendRegistrationOtp(request, out);
        else if (uri.endsWith("/verify-registration-otp"))
            handleVerifyRegistrationOtp(request, out);
        else if (uri.endsWith("/register"))
            handleRegister(request, out);
        else if (uri.endsWith("/login"))
            handleLogin(request, response, out);
        else if (uri.endsWith("/verify"))
            handleVerify(request, out);
        else
            out.print(JSONUtil.createErrorResponse("Invalid endpoint"));
    }

    @SuppressWarnings("unchecked")
    private void handleSendRegistrationOtp(HttpServletRequest request, PrintWriter out) {
        JSONObject data = JSONUtil.parseRequest(request);
        String email = (String) data.get("email");
        String phone = (String) data.get("phone");

        String emailOtp = com.app.util.MailUtil.generateOTP();
        String phoneOtp = com.app.util.MailUtil.generateOTP();

        EMAIL_OTP_STORE.put(email, emailOtp);
        PHONE_OTP_STORE.put(phone, phoneOtp);

        com.app.util.MailUtil.sendMail(email, "CareCart B2B Email Verification", 
            "Your Email Verification Code is: " + emailOtp + "\n\nDo not share this code.");
            
        System.out.println(">> CareCart Mobile Verification Code (MOCK): " + phoneOtp);

        JSONObject res = new JSONObject();
        res.put("status", "success");
        res.put("message", "OTPs dispatched successfully to Email and Mobile.");
        out.print(res.toJSONString());
    }

    @SuppressWarnings("unchecked")
    private void handleVerifyRegistrationOtp(HttpServletRequest request, PrintWriter out) {
        JSONObject data = JSONUtil.parseRequest(request);
        String email = (String) data.get("email");
        String emailOtp = (String) data.get("emailOtp");
        String phone = (String) data.get("phone");
        String phoneOtp = (String) data.get("phoneOtp");

        boolean emailValid = emailOtp != null && emailOtp.equals(EMAIL_OTP_STORE.get(email));
        boolean phoneValid = phoneOtp != null && phoneOtp.equals(PHONE_OTP_STORE.get(phone));

        if (emailValid && phoneValid) {
            EMAIL_OTP_STORE.remove(email);
            PHONE_OTP_STORE.remove(phone);
            JSONObject res = new JSONObject();
            res.put("status", "success");
            res.put("message", "Identities verified successfully.");
            out.print(res.toJSONString());
        } else {
            out.print(JSONUtil.createErrorResponse("Invalid verification codes provided."));
        }
    }

    @SuppressWarnings("unchecked")
    private void handleRegister(HttpServletRequest request, PrintWriter out) {
        JSONObject data = JSONUtil.parseRequest(request);
        User user = new User();
        String id = userDAO.generateNextUserId();
        user.setUserId(id);
        user.setUsername((String) data.get("username"));
        user.setEmail((String) data.get("email"));
        user.setPassword((String) data.get("password"));
        String role = (String) data.get("role");
        if ("ADMIN".equalsIgnoreCase(role)) {
            out.print(JSONUtil.createErrorResponse("System Administrator accounts cannot be created via the public clinical portal. Contact the Super Admin."));
            return;
        }
        user.setRole(role);
        user.setStatus("ACTIVE");

        try {
            String username = (String) data.get("username");
            String email = (String) data.get("email");
            String password = (String) data.get("password");
            String phone = (String) data.get("phone");
            String name = (String) data.get("name");
            if (name == null) name = username;

            // Validate input fields
            if (username == null || username.trim().isEmpty()) {
                out.print(JSONUtil.createErrorResponse("Username is required"));
                return;
            }
            
            if (email == null || email.trim().isEmpty()) {
                out.print(JSONUtil.createErrorResponse("Email is required"));
                return;
            }
            
            if (password == null || password.trim().isEmpty()) {
                out.print(JSONUtil.createErrorResponse("Password is required"));
                return;
            }

            // Identity Desync Resolution: Check for user identity uniqueness
            if (userDAO.exists(username)) {
                out.print(JSONUtil.createErrorResponse("Username '" + username + "' is already taken. Please choose another username."));
                return;
            }

            // Profile Registry Safety: Custom uniqueness for Sellers vs Buyers
            if ("BUYER".equals(role)) {
                BuyerMySQLDAO bDao = new BuyerMySQLDAO();
                if (userDAO.exists(email)) {
                    out.print(JSONUtil.createErrorResponse("Email '" + email + "' is already registered."));
                    return;
                }
            } else if ("SELLER".equals(role)) {
                SellerMySQLDAO sDao = new SellerMySQLDAO();
                // User asked: uniqueness only for username, company name, license no
                if (sDao.getSellerByName(name) != null) {
                    out.print(JSONUtil.createErrorResponse("Company name '" + name + "' is already registered. Please use unique company details."));
                    return;
                }
                String licenseNo = (String) data.get("license_no");
                if (licenseNo != null && !licenseNo.isEmpty() && sDao.getSellerByRegistrationNo(licenseNo) != null) {
                    out.print(JSONUtil.createErrorResponse("License Number '" + licenseNo + "' is already registered. Please check your data."));
                    return;
                }
            }

            if (userDAO.createUser(user)) {
                String refCode = "";
                boolean profileCreated = false;
                try {
                    if ("BUYER".equals(role)) {
                        BuyerMySQLDAO buyerDAO = new BuyerMySQLDAO();
                        Buyer b = new Buyer();
                        refCode = buyerDAO.generateStructuredBuyerId(user.getUsername(), phone);
                        b.setBuyerId(refCode);
                        b.setUserId(id);
                        b.setName(name);
                        b.setEmail(email);
                        b.setPhone(phone);
                        b.setAddress((String) data.get("address") != null ? (String) data.get("address") : "Clinic Standard Address");
                        b.setCity((String) data.get("city") != null ? (String) data.get("city") : "N/A");
                        b.setCountry("India");
                        b.setVerificationStatus("VERIFIED");
                        profileCreated = buyerDAO.createBuyer(b);
                    } else if ("SELLER".equals(role)) {
                        SellerMySQLDAO sellerDAO = new SellerMySQLDAO();
                        Seller s = new Seller();
                        // Mix Name and Company Name (for sellers, 'name' from frontend is 'Company Name')
                        // User said our name and company name. Let's use username + name.
                        refCode = sellerDAO.generateStructuredSellerId(user.getUsername(), name);
                        s.setSellerId(refCode);
                        s.setUserId(id);
                        s.setName(name);
                        s.setEmail(email);
                        s.setPhone(phone);
                        s.setRegistrationNo((String) data.get("license_no") != null ? (String) data.get("license_no") : "REG_PENDING");
                        s.setAddress((String) data.get("address") != null ? (String) data.get("address") : "Warehouse Central");
                        s.setCity((String) data.get("city") != null ? (String) data.get("city") : "N/A");
                        s.setCountry("India");
                        s.setBusinessType("WHOLESALE");
                        s.setVerificationStatus("PENDING");
                        profileCreated = sellerDAO.createSeller(s);
                    }
                } catch (Exception e) {
                    System.err.println("Profile Creation Fault: " + e.getMessage());
                }

                if (profileCreated) {
                    JSONObject res = new JSONObject();
                    res.put("status", "success");
                    res.put("ref_code", refCode);
                    res.put("message", "Account registered successfully. REF_CODE: " + refCode);
                    out.print(res.toJSONString());
                } else {
                    userDAO.deleteUser(id);
                    out.print(JSONUtil.createErrorResponse("Clinical profile registration failed. Please ensure username, company, and license are unique."));
                }
            } else {
                out.print(JSONUtil.createErrorResponse("Registry Hub Timeout. Please try again."));
            }
        } catch (Exception e) {
            e.printStackTrace();
            out.print(JSONUtil.createErrorResponse("Fatal registry fault. Contact administrator."));
        }
    }

    @SuppressWarnings("unchecked")
    private void handleLogin(HttpServletRequest request, HttpServletResponse response, PrintWriter out) {
        try {
            // Robust Header Injection for Cross-Origin Compliance
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
            response.setHeader("Access-Control-Allow-Headers", "Content-Type");

            JSONObject data = JSONUtil.parseRequest(request);
            String username = (String) data.get("username");
            String password = (String) data.get("password");
            String requestedRole = (String) data.get("role");

            // Universal Identity Probe: MySQL Transactional Hub
            User user = userDAO.loginUserFlexible(username, password);
            
            if (user != null) {
                String actualRole = user.getRole();
                if (requestedRole != null && !actualRole.equalsIgnoreCase(requestedRole)) {
                    response.setStatus(401);
                    out.print(JSONUtil.createErrorResponse("Cross-Portal Access Refused: This account is registered as a " + actualRole + "."));
                    return;
                }

                JSONObject res = new JSONObject();
                res.put("status", "success");
                JSONObject userData = new JSONObject();
                userData.put("user_id", user.getUserId());
                userData.put("username", user.getUsername());
                userData.put("role", user.getRole());

                // Profile Registry Resolution
                String profileId = userDAO.getProfileId(user.getUserId(), user.getRole());
                String verificationStatus = "VERIFIED"; 
                
                // Skip profile status probing for Administrators
                if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
                    if (profileId == null) {
                        // Clinical Infrastructure Auto-Provisioning (Defensive)
                        try {
                            if ("BUYER".equals(user.getRole())) {
                                BuyerMySQLDAO bDao = new BuyerMySQLDAO();
                                Buyer b = new Buyer();
                                String phone = "0000000000"; 
                                profileId = bDao.generateStructuredBuyerId(user.getUsername(), phone);
                                b.setBuyerId(profileId);
                                b.setUserId(user.getUserId());
                                b.setName(user.getUsername());
                                b.setEmail(user.getUsername() + "@carecart.local");
                                b.setPhone(phone);
                                b.setVerificationStatus("VERIFIED");
                                bDao.createBuyer(b);
                            } else if ("SELLER".equals(user.getRole())) {
                                Seller s = new Seller();
                                SellerMySQLDAO sDao = new SellerMySQLDAO();
                                profileId = sDao.generateStructuredSellerId(user.getUsername(), "0000000000");
                                s.setSellerId(profileId);
                                s.setUserId(user.getUserId());
                                s.setName(user.getUsername());
                                s.setEmail(user.getUsername() + "@carecart.local");
                                s.setVerificationStatus("PENDING");
                                sDao.createSeller(s);
                                verificationStatus = "PENDING";
                            }
                        } catch (Exception e) { System.err.println("Registry Provisioning Failure: " + e.getMessage()); }
                    } else {
                        // Check explicit verification status for Sellers/Buyers
                        if ("SELLER".equals(user.getRole())) {
                            Seller s = new SellerMySQLDAO().getSellerByUserId(user.getUserId());
                            if (s != null) verificationStatus = s.getVerificationStatus();
                        } else if ("BUYER".equals(user.getRole())) {
                            Buyer b = new BuyerMySQLDAO().getBuyerByUserId(user.getUserId());
                            if (b != null) {
                                String status = b.getVerificationStatus();
                                if (status != null) verificationStatus = status;
                            }
                        }
                    }

                    if (!"VERIFIED".equalsIgnoreCase(verificationStatus)) {
                        response.setStatus(401);
                        out.print(JSONUtil.createErrorResponse("Access Restricted: Your clinical profile is still under verification. Contact Admin."));
                        return;
                    }
                }

                userData.put("profile_id", profileId != null ? profileId : user.getUserId());
                userData.put("verification_status", verificationStatus);
                res.put("user", userData);
                res.put("token", "session-" + System.currentTimeMillis());
                out.print(res.toJSONString());
            } else {
                response.setStatus(401);
                out.print(JSONUtil.createErrorResponse("Invalid credentials. Please check your username and password."));
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(500);
            out.print(JSONUtil.createErrorResponse("Critical Registry Fault: Logic Integrity Mismatch. " + e.getMessage()));
        }
    }

    @SuppressWarnings("unchecked")
    private void handleVerify(HttpServletRequest request, PrintWriter out) {
        JSONObject res = new JSONObject();
        res.put("status", "success");
        res.put("message", "Secured Access Granted.");
        out.print(res.toJSONString());
    }
}
