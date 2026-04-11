package com.app.servlet;

import com.app.model.Product;
import com.app.util.JSONUtil;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.Date;
import com.app.dao.mysql.ProductRelationalDAO;
import java.util.UUID;

@WebServlet("/api/bulk-upload/*")
public class BulkUploadServlet extends HttpServlet {
    private ProductRelationalDAO productDAO = new ProductRelationalDAO();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json");

        // Frontend parses CSV into a JSON array of products for better security and
        // validation
        try {
            BufferedReader reader = req.getReader();
            StringBuilder builder = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                builder.append(line);
            }

            JSONParser parser = new JSONParser();
            JSONObject requestBody = (JSONObject) parser.parse(builder.toString());

            String sellerId = (String) requestBody.get("seller_id");
            JSONArray products = (JSONArray) requestBody.get("products");

            if (sellerId == null || products == null) {
                res.getWriter().print(JSONUtil.createErrorResponse("Missing seller_id or products payload."));
                return;
            }

            int successCount = 0;
            int failedCount = 0;

            for (Object obj : products) {
                JSONObject data = (JSONObject) obj;
                try {
                    Product p = new Product();
                    // Securely generate Random ID to prevent collision on massive inserts
                    p.setProductId("PRD_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                    p.setSellerId(sellerId);
                    p.setName((String) data.get("name"));
                    p.setManufacturer(
                            data.get("manufacturer") != null ? (String) data.get("manufacturer") : "Unknown Wholesale");
                    p.setComposition((String) data.get("composition"));
                    p.setCategory((String) data.get("category"));

                    p.setRetailPrice(new BigDecimal(data.get("retail_price").toString()));
                    p.setSellingPrice(new BigDecimal(data.get("selling_price") != null ? data.get("selling_price").toString() : data.get("retail_price").toString()));
                    p.setWholesalePrice(new BigDecimal(data.get("wholesale_price").toString()));
                    p.setMinWholesaleQty(Integer.parseInt(data.get("min_wholesale_qty").toString()));
                    p.setQuantity(Integer.parseInt(data.get("quantity").toString()));
                    p.setMinQuantity(Integer.parseInt(data.get("min_quantity").toString()));

                    if (data.get("expiry_date") != null && !data.get("expiry_date").toString().trim().isEmpty()) {
                        p.setExpiryDate(Date.valueOf(data.get("expiry_date").toString()));
                    }

                    p.setDescription((String) data.get("description"));

                    if (productDAO.createProduct(p)) {
                        successCount++;
                    } else {
                        failedCount++;
                    }
                } catch (Exception e) {
                    System.err.println("Bulk Insert Row Failed: " + e.getMessage());
                    failedCount++;
                }
            }

            JSONObject responseData = new JSONObject();
            responseData.put("status", "completed");
            responseData.put("total_processed", products.size());
            responseData.put("success_count", successCount);
            responseData.put("failed_count", failedCount);

            res.getWriter().print(responseData.toJSONString());

        } catch (Exception e) {
            e.printStackTrace();
            res.getWriter()
                    .print(JSONUtil.createErrorResponse("CRITICAL DATA FAILURE: Could not parse Bulk Upload Payload."));
        }
    }
}
