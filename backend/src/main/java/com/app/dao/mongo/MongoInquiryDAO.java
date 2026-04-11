package com.app.dao.mongo;

import com.app.config.DatabaseConfig;
import com.app.model.Inquiry;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import java.util.ArrayList;
import java.util.List;

public class MongoInquiryDAO {
    private final MongoCollection<Document> collection;

    public MongoInquiryDAO() {
        MongoDatabase db = DatabaseConfig.getMongoDatabase();
        this.collection = db.getCollection("inquiries");
    }

    public void saveInquiry(Inquiry i) {
        Document doc = new Document("inquiryId", i.getId())
                .append("fullName", i.getFullName())
                .append("email", i.getEmail())
                .append("message", i.getMessage())
                .append("timestamp", System.currentTimeMillis());
        collection.insertOne(doc);
    }

    public List<Document> getInquiriesByProduct(String productId) {
        return collection.find(new Document("productId", productId)).into(new ArrayList<>());
    }
}
