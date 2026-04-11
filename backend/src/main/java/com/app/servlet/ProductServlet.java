package com.app.servlet;

import com.app.dao.mongodb.ProductMongoDAO;
import com.app.dao.mysql.ProductRelationalDAO;
import com.app.model.Product;
import com.app.util.JSONUtil;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.Date;
import java.util.List;

@SuppressWarnings("unchecked")
@WebServlet("/api/products/*")
public class ProductServlet extends HttpServlet {
    private ProductMongoDAO dao = new ProductMongoDAO();
    private ProductRelationalDAO mysqlDao = new ProductRelationalDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json");

        try {
            String id = req.getParameter("id");
            if (id != null) {
                Product p = null;
                try {
                    p = dao.getProductById(id);
                } catch (Exception e) {
                    System.err.println("Mongo Hub Fetch Delay: " + e.getMessage());
                }
                
                if (p == null) {
                    p = mysqlDao.getProductById(id);
                }

                if (p != null) {
                    JSONObject obj = new JSONObject();
                    obj.put("product_id", p.getProductId());
                    obj.put("seller_id", p.getSellerId());
                    obj.put("seller_name", p.getSellerName());
                    obj.put("name", p.getName());
                    obj.put("manufacturer", p.getManufacturer());
                    obj.put("composition", p.getComposition());
                    obj.put("category", p.getCategory());
                    String imageUrl = p.getImageUrl();
                    if (imageUrl == null || imageUrl.isEmpty() || imageUrl.startsWith("data:") || imageUrl.equals("default_medicine.png") || !imageUrl.contains("/")) {
                        imageUrl = "/assets/default_medicine_icon_1774260397507.png";
                    } else if (imageUrl.contains("brain")) {
                        int lastSlash = Math.max(imageUrl.lastIndexOf('/'), imageUrl.lastIndexOf('\\'));
                        imageUrl = "/assets/" + imageUrl.substring(lastSlash + 1);
                    }
                    obj.put("image_url", imageUrl);
                    obj.put("retail_price", p.getRetailPrice() != null ? p.getRetailPrice().toString() : "0.00");
                    obj.put("selling_price", p.getSellingPrice() != null ? p.getSellingPrice().toString() : "0.00");
                    obj.put("wholesale_price", p.getWholesalePrice() != null ? p.getWholesalePrice().toString() : "0.00");
                    obj.put("min_wholesale_qty", p.getMinWholesaleQty());
                    obj.put("quantity", p.getQuantity());
                    obj.put("min_quantity", p.getMinQuantity());
                    obj.put("min_order_qty", p.getMinOrderQty());
                    obj.put("description", p.getDescription());
                    obj.put("status", p.getStatus());
                    res.getWriter().print(obj.toJSONString());
                } else {
                    res.getWriter().print(JSONUtil.createErrorResponse("Product Not Found"));
                }
                return;
            }

            // MySQL is primary – always load from MySQL first
            String sellerId = req.getParameter("seller_id");
            java.util.Map<String, Product> productMap = new java.util.LinkedHashMap<>();
            try {
                java.util.List<Product> mysqlList = (sellerId != null) ?
                        mysqlDao.getProductsBySeller(sellerId) : mysqlDao.getAllProducts();
                if (mysqlList != null) {
                    for (Product p : mysqlList) productMap.put(p.getProductId(), p);
                }
            } catch (Exception e) { System.err.println("MySQL Product Error: " + e.getMessage()); }

            // Supplement with MongoDB (skip duplicates)
            try {
                java.util.List<Product> mongoList = (sellerId != null) ?
                        dao.getProductsBySeller(sellerId) : dao.getAllProducts();
                if (mongoList != null) {
                    for (Product p : mongoList) {
                        if (!productMap.containsKey(p.getProductId())) {
                            productMap.put(p.getProductId(), p);
                        }
                    }
                }
            } catch (Exception e) { System.err.println("Mongo Hub Offline: " + e.getMessage()); }

            List<Product> list = new java.util.ArrayList<>(productMap.values());


            JSONArray arr = new JSONArray();
            if (list != null) {
                for (Product p : list) {
                    JSONObject obj = new JSONObject();
                    obj.put("product_id", p.getProductId());
                    obj.put("seller_id", p.getSellerId());
                    obj.put("seller_name", p.getSellerName());
                    obj.put("name", p.getName() != null ? p.getName() : "Unknown Medicine");
                    obj.put("category", p.getCategory() != null ? p.getCategory() : "Clinical");
                    obj.put("manufacturer", p.getManufacturer() != null ? p.getManufacturer() : "CareCart Pvt Ltd");
                    obj.put("retail_price", p.getRetailPrice() != null ? p.getRetailPrice().toString() : "0.00");
                    obj.put("selling_price", p.getSellingPrice() != null ? p.getSellingPrice().toString() : "0.00");
                    obj.put("wholesale_price", p.getWholesalePrice() != null ? p.getWholesalePrice().toString() : "0.00");
                    obj.put("min_wholesale_qty", p.getMinWholesaleQty());
                    obj.put("min_order_qty", p.getMinOrderQty());
                    obj.put("quantity", p.getQuantity());
                    obj.put("min_quantity", p.getMinQuantity());
                    String imageUrl = p.getImageUrl();
                    if (imageUrl == null || imageUrl.isEmpty() || imageUrl.startsWith("data:") || imageUrl.equals("default_medicine.png") || !imageUrl.contains("/")) {
                        imageUrl = "/assets/default_medicine_icon_1774260397507.png";
                    } else if (imageUrl.contains("brain")) {
                        // Extract filename from file URI or absolute path
                        int lastSlash = Math.max(imageUrl.lastIndexOf('/'), imageUrl.lastIndexOf('\\'));
                        imageUrl = "/assets/" + imageUrl.substring(lastSlash + 1);
                    }
                    obj.put("image_url", imageUrl);
                    arr.add(obj);
                }
            }
            res.getWriter().print(arr.toJSONString());
        } catch (Exception e) {
            e.printStackTrace();
            res.setStatus(500);
            res.getWriter().print(JSONUtil.createErrorResponse("Medicine Hub Fault: " + e.getMessage()));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json");
        JSONObject data = JSONUtil.parseRequest(req);

        Product p = new Product();
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder("CC-PRD-");
        java.util.Random rnd = new java.util.Random();
        for (int i = 0; i < 6; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        p.setProductId(sb.toString());
        p.setSellerId((String) data.get("seller_id"));
        p.setName((String) data.get("name"));
        p.setManufacturer((String) data.get("manufacturer"));
        p.setComposition((String) data.get("composition"));
        p.setCategory((String) data.get("category"));

        try {
            if (data.get("retail_price") != null) p.setRetailPrice(new BigDecimal(data.get("retail_price").toString()));
            if (data.get("selling_price") != null) p.setSellingPrice(new BigDecimal(data.get("selling_price").toString()));
            // Default selling price to retail if missing
            if (p.getSellingPrice() == null) p.setSellingPrice(p.getRetailPrice());
            
            if (data.get("wholesale_price") != null) p.setWholesalePrice(new BigDecimal(data.get("wholesale_price").toString()));
            if (data.get("min_wholesale_qty") != null) p.setMinWholesaleQty(Integer.parseInt(data.get("min_wholesale_qty").toString()));
            if (data.get("quantity") != null) p.setQuantity(Integer.parseInt(data.get("quantity").toString()));
            if (data.get("min_quantity") != null) p.setMinQuantity(Integer.parseInt(data.get("min_quantity").toString()));

            if (data.get("expiry_date") != null && !data.get("expiry_date").toString().isEmpty()) {
                p.setExpiryDate(Date.valueOf(data.get("expiry_date").toString()));
            }
        } catch (Exception e) {
            res.getWriter().print(JSONUtil.createErrorResponse("Invalid numerical format or date format.").toJSONString());
            return;
        }

        p.setDescription((String) data.get("description"));
        p.setImageUrl((String) data.get("image_url"));
        p.setStatus("ACTIVE");

        try {
            // Hybrid Persistence: Save to both Mongo and MySQL
            boolean mongoSaved = dao.createProduct(p);
            boolean mysqlSaved = mysqlDao.createProduct(p);
            
            if (mongoSaved || mysqlSaved) {
                res.getWriter().print(JSONUtil.createSuccessResponse("Product registered in hybrid vault successfully.").toJSONString());
            } else {
                res.getWriter().print(JSONUtil.createErrorResponse("Failed to register product in database clusters.").toJSONString());
            }
        } catch (Exception e) {
            res.getWriter().print(JSONUtil.createErrorResponse(e.getMessage()).toJSONString());
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json");
        JSONObject data = JSONUtil.parseRequest(req);
        String id = (String) data.get("product_id");
        
        // Fetch existing from Mongo or MySQL
        Product p = dao.getProductById(id);
        if (p == null) {
            p = mysqlDao.getProductById(id);
        }

        if (p == null) {
            res.getWriter().print(JSONUtil.createErrorResponse("Medicine Node Not Found."));
            return;
        }

        // Professional Integrity: Ensure only the asset owner can modify inventory nodes
        String requesterSellerId = (String) data.get("requester_seller_id");
        if (requesterSellerId != null && !requesterSellerId.equals(p.getSellerId())) {
             res.setStatus(403);
             res.getWriter().print(JSONUtil.createErrorResponse("Forbidden: Cross-tenant modification refused."));
             return;
        }

        p.setName((String) data.get("name"));
        p.setManufacturer((String) data.get("manufacturer"));
        p.setComposition((String) data.get("composition"));
        p.setCategory((String) data.get("category"));

        try {
            if (data.get("retail_price") != null) p.setRetailPrice(new BigDecimal(data.get("retail_price").toString()));
            if (data.get("selling_price") != null) p.setSellingPrice(new BigDecimal(data.get("selling_price").toString()));
            if (data.get("wholesale_price") != null) p.setWholesalePrice(new BigDecimal(data.get("wholesale_price").toString()));
            if (data.get("min_wholesale_qty") != null) p.setMinWholesaleQty(Integer.parseInt(data.get("min_wholesale_qty").toString()));
            if (data.get("quantity") != null) p.setQuantity(Integer.parseInt(data.get("quantity").toString()));
            if (data.get("min_quantity") != null) p.setMinQuantity(Integer.parseInt(data.get("min_quantity").toString()));
        } catch (Exception e) {}

        p.setDescription((String) data.get("description"));
        p.setImageUrl((String) data.get("image_url"));

        boolean mongoUpdated = dao.updateProduct(p);
        boolean mysqlUpdated = mysqlDao.updateProduct(p);

        if (mongoUpdated || mysqlUpdated) {
            res.getWriter().print(JSONUtil.createSuccessResponse("Medicine inventory synced successfully."));
        } else {
            res.getWriter().print(JSONUtil.createErrorResponse("Synchronization failed in database tier."));
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json");
        String id = req.getParameter("id");
        String requesterSellerId = req.getParameter("seller_id");
        
        Product p = mysqlDao.getProductById(id);
        if (p != null && requesterSellerId != null && !requesterSellerId.equals(p.getSellerId())) {
             res.setStatus(403);
             res.getWriter().print(JSONUtil.createErrorResponse("Forbidden: Cross-tenant removal refused."));
             return;
        }
        
        boolean mongoDeleted = dao.deleteProduct(id);
        boolean mysqlDeleted = mysqlDao.deleteProduct(id);

        if (mongoDeleted || mysqlDeleted) {
            res.getWriter().print(JSONUtil.createSuccessResponse("Medicine decommissioned successfully."));
        } else {
            res.getWriter().print(JSONUtil.createErrorResponse("Removal Failed."));
        }
    }
}
