package com.app.dao.mongodb;

import com.app.config.MongoDBConfig;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import java.util.Date;

public class AuditLoggerDAO {
    
    /**
     * Institutional Procurement Audit:
     * Records all sensitive financial movements into MongoDB for real-time compliance.
     */
    public void logTransaction(String buyerId, String type, double amount, String status, String metadata) {
        MongoDatabase db = MongoDBConfig.getDatabase();
        if (db == null) return;
        
        MongoCollection<Document> logs = db.getCollection("procurement_audit");
        
        Document log = new Document()
            .append("timestamp", new Date())
            .append("actor_id", buyerId)
            .append("event_type", type)
            .append("amount", amount)
            .append("status", status)
            .append("details", metadata);
            
        logs.insertOne(log);
        System.out.println("MONGODB AUDIT: Event '" + type + "' recorded for Actor: " + buyerId);
    }
}
