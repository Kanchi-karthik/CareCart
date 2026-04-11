package com.app.servlet;

import com.app.dao.oracle.SellerFinancialDAO;
import com.app.util.JSONUtil;
import org.json.simple.JSONObject;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/api/sellers/financials/*")
public class SellerFinancialServlet extends HttpServlet {
    private SellerFinancialDAO dao = new SellerFinancialDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json");
        String sellerId = req.getParameter("seller_id");
        if (sellerId != null) {
            JSONObject data = dao.getFinancials(sellerId);
            res.getWriter().print(data.toJSONString());
        } else {
            res.getWriter().print(JSONUtil.createErrorResponse("Seller ID required."));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json");
        JSONObject data = JSONUtil.parseRequest(req);
        
        String sellerId = (String) data.get("seller_id");
        String bankName = (String) data.get("bankName");
        String accountNo = (String) data.get("accountNo");
        String ifscCode = (String) data.get("ifscCode");
        String holderName = (String) data.get("holderName");

        if (dao.updateFinancials(sellerId, bankName, accountNo, ifscCode, holderName)) {
            res.getWriter().print(JSONUtil.createSuccessResponse("Financial Node Updated."));
        } else {
            res.getWriter().print(JSONUtil.createErrorResponse("Sync Failure in Oracle Tier."));
        }
    }
}
