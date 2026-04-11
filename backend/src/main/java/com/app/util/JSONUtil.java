package com.app.util;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import javax.servlet.http.HttpServletRequest;
import java.io.BufferedReader;
import java.sql.ResultSet;
import java.sql.SQLException;

public class JSONUtil {
    private static final JSONParser parser = new JSONParser();

    public static JSONObject parseRequest(HttpServletRequest request) {
        try {
            BufferedReader reader = request.getReader();
            return (JSONObject) parser.parse(reader);
        } catch (Exception e) {
            return new JSONObject();
        }
    }

    @SuppressWarnings("unchecked")
    public static JSONObject createSuccessResponse(String message) {
        JSONObject response = new JSONObject();
        response.put("status", "success");
        response.put("message", message);
        return response;
    }

    @SuppressWarnings("unchecked")
    public static JSONObject createSuccessResponse(String message, Object data) {
        JSONObject response = new JSONObject();
        response.put("status", "success");
        response.put("message", message);
        response.put("data", data);
        return response;
    }

    @SuppressWarnings("unchecked")
    public static JSONObject createErrorResponse(String error) {
        JSONObject response = new JSONObject();
        response.put("status", "error");
        response.put("message", error);
        return response;
    }

    @SuppressWarnings("unchecked")
    public static String cartItemsToJSON(ResultSet rs) throws SQLException {
        StringBuilder json = new StringBuilder("[");
        boolean first = true;
        
        while (rs.next()) {
            if (!first) json.append(",");
            JSONObject item = new JSONObject();
            item.put("cart_id", rs.getString("cart_id"));
            item.put("buyer_id", rs.getString("buyer_id"));
            item.put("product_id", rs.getString("product_id"));
            item.put("quantity", rs.getInt("quantity"));
            item.put("name", rs.getString("name"));
            item.put("image_url", rs.getString("image_url"));
            item.put("retail_price", rs.getDouble("retail_price"));
            item.put("wholesale_price", rs.getDouble("wholesale_price"));
            item.put("seller_id", rs.getString("seller_id"));
            item.put("seller_name", rs.getString("seller_name"));
            item.put("added_at", rs.getTimestamp("added_at").toString());
            json.append(item);
            first = false;
        }
        
        json.append("]");
        return json.toString();
    }

    @SuppressWarnings("unchecked")
    public static String cartItemToJSON(ResultSet rs) throws SQLException {
        JSONObject item = new JSONObject();
        if (rs.next()) {
            item.put("cart_id", rs.getString("cart_id"));
            item.put("buyer_id", rs.getString("buyer_id"));
            item.put("product_id", rs.getString("product_id"));
            item.put("quantity", rs.getInt("quantity"));
            item.put("name", rs.getString("name"));
            item.put("image_url", rs.getString("image_url"));
            item.put("retail_price", rs.getDouble("retail_price"));
            item.put("wholesale_price", rs.getDouble("wholesale_price"));
            item.put("added_at", rs.getTimestamp("added_at").toString());
        }
        return item.toString();
    }

    @SuppressWarnings("unchecked")
    public static String wishlistItemsToJSON(ResultSet rs) throws SQLException {
        StringBuilder json = new StringBuilder("[");
        boolean first = true;
        
        while (rs.next()) {
            if (!first) json.append(",");
            JSONObject item = new JSONObject();
            item.put("wishlist_id", rs.getString("wishlist_id"));
            item.put("buyer_id", rs.getString("buyer_id"));
            item.put("product_id", rs.getString("product_id"));
            item.put("priority", rs.getString("priority"));
            item.put("notes", rs.getString("notes"));
            item.put("name", rs.getString("name"));
            item.put("image_url", rs.getString("image_url"));
            item.put("retail_price", rs.getDouble("retail_price"));
            item.put("seller_id", rs.getString("seller_id"));
            item.put("seller_name", rs.getString("seller_name"));
            item.put("added_at", rs.getTimestamp("added_at").toString());
            json.append(item);
            first = false;
        }
        
        json.append("]");
        return json.toString();
    }

    @SuppressWarnings("unchecked")
    public static String wishlistItemToJSON(ResultSet rs) throws SQLException {
        JSONObject item = new JSONObject();
        if (rs.next()) {
            item.put("wishlist_id", rs.getString("wishlist_id"));
            item.put("buyer_id", rs.getString("buyer_id"));
            item.put("product_id", rs.getString("product_id"));
            item.put("priority", rs.getString("priority"));
            item.put("notes", rs.getString("notes"));
            item.put("name", rs.getString("name"));
            item.put("image_url", rs.getString("image_url"));
            item.put("retail_price", rs.getDouble("retail_price"));
            item.put("added_at", rs.getTimestamp("added_at").toString());
        }
        return item.toString();
    }
    
    // Convert ResultSet to JSONObject
    @SuppressWarnings("unchecked")
    public static JSONObject resultSetToJSONObject(ResultSet rs) throws SQLException {
        JSONObject json = new JSONObject();
        if (rs.next()) {
            java.sql.ResultSetMetaData meta = rs.getMetaData();
            int columns = meta.getColumnCount();
            for (int i = 1; i <= columns; i++) {
                json.put(meta.getColumnName(i), rs.getObject(i));
            }
        }
        return json;
    }
    
    // Convert ResultSet to JSONArray
    @SuppressWarnings("unchecked")
    public static org.json.simple.JSONArray resultSetToJSONArray(ResultSet rs) throws SQLException {
        org.json.simple.JSONArray jsonArray = new org.json.simple.JSONArray();
        while (rs.next()) {
            JSONObject json = new JSONObject();
            java.sql.ResultSetMetaData meta = rs.getMetaData();
            int columns = meta.getColumnCount();
            for (int i = 1; i <= columns; i++) {
                json.put(meta.getColumnName(i), rs.getObject(i));
            }
            jsonArray.add(json);
        }
        return jsonArray;
    }
}
