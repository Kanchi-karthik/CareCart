package com.app.servlet;

import com.app.dao.mysql.InvoiceMySQLDAO;
import com.app.util.JSONUtil;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/api/engagement-invoices/*")
public class InvoiceServlet extends HttpServlet {
    private InvoiceMySQLDAO dao = new InvoiceMySQLDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();
        try {
            JSONArray list = dao.getAllInvoices();
            out.print(list.toJSONString());
        } catch (Exception e) {
            out.print(JSONUtil.createErrorResponse("Failed to fetch invoices."));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();
        JSONObject data = JSONUtil.parseRequest(req);
        try {
            int id = data.get("invoice_id") == null ? 0 : Integer.parseInt(data.get("invoice_id").toString());
            if (id == 0) id = (int) (System.currentTimeMillis() % 1000000); // simple id generator
            int engId = Integer.parseInt(data.get("engagement_id").toString());
            double amt = Double.parseDouble(data.get("amount").toString());
            String status = (String) data.get("status");
            String due = (String) data.get("due_date");
            String desc = (String) data.get("description");

            if (dao.generateInvoice(id, engId, amt, status, due, desc)) {
                out.print(JSONUtil.createSuccessResponse("Invoice generated."));
            } else {
                out.print(JSONUtil.createErrorResponse("Failed to generate invoice."));
            }
        } catch (Exception e) {
            out.print(JSONUtil.createErrorResponse("Invalid invoice data."));
        }
    }
}
