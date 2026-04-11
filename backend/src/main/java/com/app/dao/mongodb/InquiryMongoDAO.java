package com.app.dao.mongodb;

import com.app.config.MongoDBConfig;
import com.app.model.Inquiry;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Sorts;
import com.mongodb.client.model.Updates;
import org.bson.Document;
import org.bson.types.ObjectId;
import java.util.ArrayList;
import java.util.List;

public class InquiryMongoDAO {
    private static final String COLLECTION_NAME = "inquiries";

    private MongoCollection<Document> getCollection() {
        return MongoDBConfig.getDatabase().getCollection(COLLECTION_NAME);
    }

    public boolean createInquiry(Inquiry inquiry) {
        try {
            Document doc = new Document()
                    .append("fullName", inquiry.getFullName())
                    .append("email", inquiry.getEmail())
                    .append("productId", inquiry.getProductId())
                    .append("buyerId", inquiry.getBuyerId())
                    .append("sellerId", inquiry.getSellerId())
                    .append("quantity", inquiry.getQuantity())
                    .append("expectedPrice", inquiry.getExpectedPrice() != null ? inquiry.getExpectedPrice().toString() : null)
                    .append("message", inquiry.getMessage())
                    .append("status", inquiry.getStatus() != null ? inquiry.getStatus() : "OPEN")
                    .append("createdAt", new java.util.Date());
            getCollection().insertOne(doc);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<Inquiry> getAllInquiries() {
        List<Inquiry> inquiries = new ArrayList<>();
        try {
            for (Document doc : getCollection().find().sort(Sorts.descending("createdAt"))) {
                Inquiry inq = new Inquiry();
                inq.setId(doc.getObjectId("_id").toHexString());
                inq.setFullName(doc.getString("fullName"));
                inq.setEmail(doc.getString("email"));
                inq.setProductId(doc.getString("productId"));
                inq.setBuyerId(doc.getString("buyerId"));
                inq.setSellerId(doc.getString("sellerId"));
                inq.setQuantity(doc.getInteger("quantity"));
                String priceStr = doc.getString("expectedPrice");
                if (priceStr != null) inq.setExpectedPrice(new java.math.BigDecimal(priceStr));
                inq.setMessage(doc.getString("message"));
                inq.setStatus(doc.getString("status"));
                java.util.Date date = doc.getDate("createdAt");
                if (date != null) inq.setCreatedAt(new java.sql.Timestamp(date.getTime()));
                inquiries.add(inq);
            }
        } catch (Exception e) { e.printStackTrace(); }
        return inquiries;
    }

    public List<Inquiry> getInquiriesBySeller(String sellerId) {
        List<Inquiry> inquiries = new ArrayList<>();
        try {
            for (Document doc : getCollection().find(Filters.eq("sellerId", sellerId)).sort(Sorts.descending("createdAt"))) {
                Inquiry inq = new Inquiry();
                inq.setId(doc.getObjectId("_id").toHexString());
                inq.setFullName(doc.getString("fullName"));
                inq.setEmail(doc.getString("email"));
                inq.setProductId(doc.getString("productId"));
                inq.setBuyerId(doc.getString("buyerId"));
                inq.setSellerId(doc.getString("sellerId"));
                inq.setQuantity(doc.getInteger("quantity"));
                String priceStr = doc.getString("expectedPrice");
                if (priceStr != null) inq.setExpectedPrice(new java.math.BigDecimal(priceStr));
                inq.setMessage(doc.getString("message"));
                inq.setStatus(doc.getString("status"));
                java.util.Date date = doc.getDate("createdAt");
                if (date != null) inq.setCreatedAt(new java.sql.Timestamp(date.getTime()));
                inquiries.add(inq);
            }
        } catch (Exception e) { e.printStackTrace(); }
        return inquiries;
    }

    public List<Inquiry> getInquiriesByBuyer(String buyerId) {
        List<Inquiry> inquiries = new ArrayList<>();
        try {
            for (Document doc : getCollection().find(Filters.eq("buyerId", buyerId)).sort(Sorts.descending("createdAt"))) {
                Inquiry inq = new Inquiry();
                inq.setId(doc.getObjectId("_id").toHexString());
                inq.setFullName(doc.getString("fullName"));
                inq.setEmail(doc.getString("email"));
                inq.setProductId(doc.getString("productId"));
                inq.setBuyerId(doc.getString("buyerId"));
                inq.setSellerId(doc.getString("sellerId"));
                inq.setQuantity(doc.getInteger("quantity"));
                String priceStr = doc.getString("expectedPrice");
                if (priceStr != null) inq.setExpectedPrice(new java.math.BigDecimal(priceStr));
                inq.setMessage(doc.getString("message"));
                inq.setStatus(doc.getString("status"));
                java.util.Date date = doc.getDate("createdAt");
                if (date != null) inq.setCreatedAt(new java.sql.Timestamp(date.getTime()));
                inquiries.add(inq);
            }
        } catch (Exception e) { e.printStackTrace(); }
        return inquiries;
    }

    public boolean updateStatus(String id, String status) {
        try {
            getCollection().updateOne(Filters.eq("_id", new ObjectId(id)), Updates.set("status", status));
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
