package com.app.servlet;

import com.app.dao.mysql.BuyerMySQLDAO;
import com.app.util.JSONUtil;
import org.json.simple.JSONObject;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.math.BigDecimal;
import com.app.config.DatabaseConfig;
import java.sql.*;

@WebServlet("/api/wallet/*")
public class WalletServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json");
        String path = req.getPathInfo();
        JSONObject data = JSONUtil.parseRequest(req);

        if ("/topup".equals(path)) {
            String userId = (String) data.get("user_id");
            BigDecimal amount = new BigDecimal(data.get("amount").toString());

            if (topupWallet(userId, amount)) {
                res.getWriter().print(JSONUtil.createSuccessResponse("Wallet topped up by ₹" + amount));
            } else {
                res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                res.getWriter().print(JSONUtil.createErrorResponse("Failed to update store balance."));
            }
        }
    }

    private boolean topupWallet(String userId, BigDecimal amount) {
        String sql = "UPDATE buyers SET wallet_balance = wallet_balance + ? WHERE USER_ID = ?";
        try (Connection conn = DatabaseConfig.getMySQLConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setBigDecimal(1, amount);
            pstmt.setString(2, userId);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}
