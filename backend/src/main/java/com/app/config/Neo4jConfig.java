package com.app.config;

import org.neo4j.driver.AuthTokens;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;

public class Neo4jConfig {
    private static final String URI = "neo4j://127.0.0.1:7687";
    private static final String USERNAME = "neo4j";
    private static final String PASSWORD = "Kartk@30";
    private static Driver driver = null;

    public static Driver getDriver() {
        try {
            if (driver == null) {
                driver = GraphDatabase.driver(URI, AuthTokens.basic(USERNAME, PASSWORD));
            }
            return driver;
        } catch (Exception e) {
            System.err.println("CRITICAL: Neo4j Relationship Engine DOWN. Graph Analysis will be unavailable.");
            return null;
        }
    }

    public static void close() {
        if (driver != null) {
            try {
                driver.close();
                driver = null;
            } catch (Exception e) { e.printStackTrace(); }
        }
    }
}
