package com.app.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import java.util.concurrent.TimeUnit;

public class MongoDBConfig {
    private static final String CONNECTION_STRING = "mongodb://localhost:27017/carecart";
    private static final String DATABASE_NAME = "carecart";
    private static MongoClient mongoClient = null;

    public static MongoDatabase getDatabase() {
        try {
            if (mongoClient == null) {
                // High-Performance Clinical Configuration: Strict 2000ms timeout for cloud discovery
                MongoClientSettings settings = MongoClientSettings.builder()
                    .applyConnectionString(new ConnectionString(CONNECTION_STRING))
                    .applyToSocketSettings(builder -> 
                        builder.connectTimeout(2000, TimeUnit.MILLISECONDS)
                    )
                    .applyToClusterSettings(builder -> 
                        builder.serverSelectionTimeout(2000, TimeUnit.MILLISECONDS)
                    )
                    .build();
                
                mongoClient = MongoClients.create(settings);
            }
            return mongoClient.getDatabase(DATABASE_NAME);
        } catch (Exception e) {
            System.err.println("CRITICAL: MongoDB Atlas Connectivity Fault. System switching to Relational Fallback.");
            return null;
        }
    }

    public static void close() {
        if (mongoClient != null) {
            try {
                mongoClient.close();
                mongoClient = null;
            } catch (Exception e) { e.printStackTrace(); }
        }
    }
}
