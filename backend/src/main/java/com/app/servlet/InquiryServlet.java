package com.app.servlet;

import com.app.config.DatabaseConfig;
import com.app.util.JSONUtil;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/api/inquiries/*")
public class InquiryServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        
        String inquiryId = req.getParameter("id");
        
        com.mongodb.client.MongoCollection<org.bson.Document> collection = com.app.config.DatabaseConfig.getMongoDatabase().getCollection("inquiries");
        
        try {
            if (inquiryId != null) {
                org.bson.Document doc = collection.find(new org.bson.Document("id", inquiryId)).first();
                if (doc != null) {
                    resp.getWriter().print(doc.toJson());
                } else {
                    resp.getWriter().print(JSONUtil.createErrorResponse("Inquiry not found"));
                }
            } else {
                JSONArray arr = new JSONArray();
                for (org.bson.Document doc : collection.find().sort(new org.bson.Document("created_at", -1))) {
                    JSONObject obj = new JSONObject();
                    obj.put("id", doc.getString("id"));
                    obj.put("email", doc.getString("email"));
                    obj.put("message", doc.getString("message"));
                    obj.put("status", doc.getString("status"));
                    obj.put("created_at", doc.get("created_at") != null ? doc.get("created_at").toString() : "");
                    arr.add(obj);
                }
                resp.getWriter().print(arr.toJSONString());
            }
        } catch (Exception e) {
            e.printStackTrace();
            resp.getWriter().print(JSONUtil.createErrorResponse("MongoDB Core Fault: " + e.getMessage()));
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        String inquiryId = req.getParameter("id");
        String status = req.getParameter("status");
        
        com.mongodb.client.MongoCollection<org.bson.Document> collection = com.app.config.DatabaseConfig.getMongoDatabase().getCollection("inquiries");
        
        try {
            long modified = collection.updateOne(
                new org.bson.Document("id", inquiryId),
                new org.bson.Document("$set", new org.bson.Document("status", status))
            ).getModifiedCount();
            
            if (modified > 0) {
                JSONObject r = new JSONObject();
                r.put("status", "success");
                r.put("message", "Inquiry status updated successfully in document store.");
                resp.getWriter().print(r.toJSONString());
            } else {
                resp.getWriter().print(JSONUtil.createErrorResponse("Inquiry not found in MongoDB."));
            }
        } catch (Exception e) {
            e.printStackTrace();
            resp.getWriter().print(JSONUtil.createErrorResponse("Collection update failed: " + e.getMessage()));
        }
    }
}
