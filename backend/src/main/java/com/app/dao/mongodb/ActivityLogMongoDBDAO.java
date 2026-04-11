package com.app.dao.mongodb;

import com.app.config.MongoDBConfig;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class ActivityLogMongoDBDAO {
    private static final String COLLECTION_NAME = "activity_logs";

    public void logActivity(String userId, String action, String description) {
        MongoDatabase db = MongoDBConfig.getDatabase();
        if (db == null) return;
        
        MongoCollection<Document> collection = db.getCollection(COLLECTION_NAME);
        Document doc = new Document("user_id", userId)
                .append("action", action)
                .append("description", description)
                .append("timestamp", new Date());
        
        collection.insertOne(doc);
    }

    public List<Document> getLogsByUserId(String userId) {
        List<Document> logs = new ArrayList<>();
        MongoDatabase db = MongoDBConfig.getDatabase();
        if (db == null) return logs;

        db.getCollection(COLLECTION_NAME)
                .find(new Document("user_id", userId))
                .sort(new Document("timestamp", -1))
                .into(logs);
        return logs;
    }
}
