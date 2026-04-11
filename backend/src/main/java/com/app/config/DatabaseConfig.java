package com.app.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import org.neo4j.driver.AuthTokens;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;

public class DatabaseConfig {
    
    // 🏛️ Institutional Oracle Registry (Master Audit Hub)
    private static final String ORACLE_URL = "jdbc:oracle:thin:@localhost:1521/xepdb1";
    private static final String ORACLE_USER = "system";
    private static final String ORACLE_PASS = "1234";

    // 🏦 Transactional MySQL Hub (Logistics & Inventory)
    private static final String MYSQL_URL = "jdbc:mysql://localhost:3306/carecart?useSSL=false&allowPublicKeyRetrieval=true";
    private static final String MYSQL_USER = "root";
    private static final String MYSQL_PASS = "Kartk@30";

    // 🍃 Clinical Document Hub (MongoDB)
    private static final String MONGO_URI = "mongodb://localhost:27017";

    // 🕸️ Relationship Analytics Hub (Neo4j)
    private static final String NEO4J_URI = "bolt://localhost:7687";
    private static final String NEO4J_USER = "neo4j";
    private static final String NEO4J_PASS = "Kartk@30"; 

    private static MongoClient mongoClient = null;
    private static Driver neo4jDriver = null;

    public static Connection getOracleConnection() throws SQLException {
        try {
            Class.forName("oracle.jdbc.driver.OracleDriver");
            return DriverManager.getConnection(ORACLE_URL, ORACLE_USER, ORACLE_PASS);
        } catch (ClassNotFoundException e) {
            throw new SQLException("Oracle Driver Fault: " + e.getMessage());
        }
    }

    public static Connection getConnection() throws SQLException {
        return getMySQLConnection();
    }

    public static Connection getMySQLConnection() throws SQLException {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            return DriverManager.getConnection(MYSQL_URL, MYSQL_USER, MYSQL_PASS);
        } catch (ClassNotFoundException e) {
            throw new SQLException("MySQL Driver Fault: " + e.getMessage());
        }
    }

    public static MongoDatabase getMongoDatabase() {
        if (mongoClient == null) {
            mongoClient = MongoClients.create(MONGO_URI);
        }
        return mongoClient.getDatabase("carecart");
    }

    public static Driver getNeo4jDriver() {
        if (neo4jDriver == null) {
            neo4jDriver = GraphDatabase.driver(NEO4J_URI, AuthTokens.basic(NEO4J_USER, NEO4J_PASS));
        }
        return neo4jDriver;
    }

    public static void closeConnection(Connection conn) {
        if (conn != null) try { conn.close(); } catch (SQLException e) { e.printStackTrace(); }
    }
}
