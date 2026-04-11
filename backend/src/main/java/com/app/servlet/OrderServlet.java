package com.app.servlet;

import com.app.dao.mysql.OrderMySQLDAO;
import com.app.dao.neo4j.RelationshipGraphDAO;
import com.app.dao.mysql.SystemSettingsDAO;
import com.app.config.DatabaseConfig;
import com.app.model.Order;
import com.app.util.JSONUtil;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import com.mongodb.client.MongoCollection;
import org.bson.Document;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@WebServlet({ "/api/orders", "/api/orders/*", "/orders", "/orders/*" })
public class OrderServlet extends HttpServlet {
    private OrderMySQLDAO mysqlDao = new OrderMySQLDAO();
    private RelationshipGraphDAO graphDao = new RelationshipGraphDAO();
    private SystemSettingsDAO settingsDao = new SystemSettingsDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");

        try {
            String action = req.getParameter("action");
            String buyerIdQuery = req.getParameter("buyer_id");
            String sellerIdQuery = req.getParameter("seller_id");
            String productId = req.getParameter("product_id");

            if ("recommendations".equalsIgnoreCase(action) && productId != null) {
                List<String> recs = graphDao.getRecommendations(productId);
                res.getWriter().print(JSONArray.toJSONString(recs));
                return;
            }

            if ("detailed".equalsIgnoreCase(action)) {
                // Returns the joined view data for granular visibility
                List<JSONObject> detailed = mysqlDao.getDetailedOrders();
                res.getWriter().print(JSONArray.toJSONString(detailed));
                return;
            }

            List<Order> list;
            if (buyerIdQuery != null) {
                list = mysqlDao.getOrdersByBuyer(buyerIdQuery); 
            } else if (sellerIdQuery != null) {
                list = mysqlDao.getOrdersBySeller(sellerIdQuery); 
            } else {
                list = mysqlDao.getAllOrders();
            }

            JSONArray arr = new JSONArray();
            if (list != null) {
                for (Order o : list) {
                    arr.add(serializeOrder(o));
                }
            }
            res.getWriter().print(arr.toJSONString());
        } catch (Exception e) {
            e.printStackTrace();
            res.setStatus(500);
            res.getWriter().print(JSONUtil.createErrorResponse("Logistics Hub Fault: " + e.getMessage()));
        }
    }

    private JSONObject serializeOrder(Order o) {
        JSONObject obj = new JSONObject();
        obj.put("order_id", o.getOrderId());
        obj.put("buyer_id", o.getBuyerId());
        obj.put("seller_id", o.getSellerId());
        obj.put("product_id", o.getProductId());
        obj.put("product_name", o.getProductName() != null ? o.getProductName() : "Medicine");
        obj.put("quantity", o.getQuantity());
        obj.put("status", o.getStatus() != null ? o.getStatus() : "PENDING");
        obj.put("shipping_address", o.getShippingAddress() != null ? o.getShippingAddress() : "");
        obj.put("order_date", o.getOrderDate() != null ? o.getOrderDate().toString() : "Recent");
        obj.put("total_amount", o.getTotalAmount() != null ? o.getTotalAmount().toString() : "0.00");
        obj.put("tax_amount", o.getTaxAmount() != null ? o.getTaxAmount().toString() : "0.00");
        obj.put("delivery_charge", o.getDeliveryCharge() != null ? o.getDeliveryCharge().toString() : "0.00");
        obj.put("grand_total", o.getGrandTotal() != null ? o.getGrandTotal().toString() : "0.00");
        obj.put("bundle_id", o.getBundleId() != null ? o.getBundleId() : "");
        return obj;
    }

    @Override
    @SuppressWarnings("unchecked")
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json");
        JSONObject data = JSONUtil.parseRequest(req);

        try {
            Map<String, String> settings = settingsDao.getSettings();
            BigDecimal handlingFee = new BigDecimal(settings.getOrDefault("HANDLING_FEE", "50.00"));
            BigDecimal gstRate = new BigDecimal(settings.getOrDefault("SERVICE_GST", "0.2"));
            String buyerId = (String) data.get("buyer_id");
            String commonOrderId = "ORD_B2B_" + System.currentTimeMillis();

            // 🧬 Deep Logistics Hub: Multi-Product Bulk Execution
            JSONArray items = (JSONArray) data.get("items");
            if (items != null && !items.isEmpty()) {
                boolean allSuccess = true;
                for (Object itemObj : items) {
                    JSONObject item = (JSONObject) itemObj;
                    Order o = new Order();
                    o.setOrderId(commonOrderId);
                    o.setBuyerId(buyerId);
                    o.setProductId((String) item.get("product_id"));
                    o.setQuantity(Integer.parseInt(item.get("quantity").toString()));
                    o.setShippingAddress((String) data.get("shipping_address"));
                    
                    BigDecimal baseVal = new BigDecimal(item.get("total_amount").toString());
                    o.setTotalAmount(baseVal);
                    o.setDeliveryCharge(handlingFee.divide(new BigDecimal(items.size()), 2, BigDecimal.ROUND_HALF_UP));
                    o.setTaxAmount(baseVal.multiply(gstRate).divide(new BigDecimal("100"), 2, BigDecimal.ROUND_HALF_UP));
                    o.setGrandTotal(o.getTotalAmount().add(o.getDeliveryCharge()).add(o.getTaxAmount()));

                    if (mysqlDao.placeOrder(o)) {
                        graphDao.mapPurchase(o.getBuyerId(), o.getProductId());
                    } else {
                        allSuccess = false;
                    }
                }
                
                if (allSuccess) {
                    MongoCollection<Document> logs = DatabaseConfig.getMongoDatabase().getCollection("order_logs");
                    logs.insertOne(new Document("orderId", commonOrderId)
                                .append("type", "BULK_CREATION")
                                .append("itemCount", items.size())
                                .append("buyerId", buyerId)
                                .append("timestamp", System.currentTimeMillis()));

                    JSONObject respObj = JSONUtil.createSuccessResponse("Bulk order synchronized with logistics hub.");
                    respObj.put("order_id", commonOrderId);
                    res.getWriter().print(respObj.toJSONString());
                } else {
                    res.setStatus(400);
                    res.getWriter().print(JSONUtil.createErrorResponse("Hyper-transaction failure. Insufficient wallet credit for complete bundle."));
                }
            } else {
                // Legacy Fallback for single-item posts
                Order o = new Order();
                o.setOrderId(commonOrderId);
                o.setBuyerId(buyerId);
                o.setProductId((String) data.get("product_id"));
                o.setQuantity(Integer.parseInt(data.get("quantity").toString()));
                o.setShippingAddress((String) data.get("shipping_address"));
                
                BigDecimal baseVal = new BigDecimal(data.get("total_amount").toString());
                o.setTotalAmount(baseVal);
                o.setDeliveryCharge(handlingFee);
                o.setTaxAmount(baseVal.multiply(gstRate).divide(new BigDecimal("100"), 2, BigDecimal.ROUND_HALF_UP));
                o.setGrandTotal(o.getTotalAmount().add(o.getDeliveryCharge()).add(o.getTaxAmount()));

                if (mysqlDao.placeOrder(o)) {
                    graphDao.mapPurchase(o.getBuyerId(), o.getProductId());
                    JSONObject respObj = JSONUtil.createSuccessResponse("Standard order placed.");
                    respObj.put("order_id", commonOrderId);
                    res.getWriter().print(respObj.toJSONString());
                } else {
                    res.setStatus(400);
                    res.getWriter().print(JSONUtil.createErrorResponse("Single-item execution failed. Verify balance."));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            res.setStatus(500);
            res.getWriter().print(JSONUtil.createErrorResponse("Logistics Engine Error: " + e.getMessage()));
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json");
        JSONObject data = JSONUtil.parseRequest(req);
        String action = req.getParameter("action");
        
        if ("bulk_dispatch_bundle".equalsIgnoreCase(action)) {
            String bundleId = (String) data.get("bundle_id");
            String courier = (String) data.get("courier");
            int count = mysqlDao.bulkDispatch(bundleId, courier);
            if (count >= 0) {
                res.getWriter().print(JSONUtil.createSuccessResponse("Dispatched " + count + " items in bundle " + bundleId));
            } else {
                res.setStatus(500);
                res.getWriter().print(JSONUtil.createErrorResponse("Bulk dispatch failure."));
            }
            return;
        }

        String orderId = (String) data.get("order_id");
        String newStatus = (String) data.get("status");
        String changedBy = data.get("changed_by") != null ? (String) data.get("changed_by") : "SYSTEM";

        try {
            if (mysqlDao.updateOrderStatus(orderId, newStatus, changedBy)) {
                MongoCollection<Document> audit = DatabaseConfig.getMongoDatabase().getCollection("audit_trail");
                audit.insertOne(new Document("orderId", orderId)
                            .append("newStatus", newStatus)
                            .append("changedBy", changedBy)
                            .append("timestamp", System.currentTimeMillis()));
                res.getWriter().print(JSONUtil.createSuccessResponse("Order status updated to " + newStatus));
            } else {
                res.getWriter().print(JSONUtil.createErrorResponse("Update rejected."));
            }
        } catch (Exception e) {
            e.printStackTrace();
            res.setStatus(500);
            res.getWriter().print(JSONUtil.createErrorResponse("Audit Fault: " + e.getMessage()));
        }
    }
}
