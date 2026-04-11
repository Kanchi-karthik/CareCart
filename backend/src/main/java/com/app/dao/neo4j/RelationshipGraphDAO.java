package com.app.dao.neo4j;

import com.app.config.DatabaseConfig;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;
import static org.neo4j.driver.Values.parameters;

import java.util.List;

public class RelationshipGraphDAO {
    private final Driver driver;

    public RelationshipGraphDAO() {
        this.driver = DatabaseConfig.getNeo4jDriver();
    }

    public void mapPurchase(String buyerId, String productId) {
        if (driver == null) return;
        try (Session session = driver.session()) {
            session.executeWrite(tx -> {
                tx.run("MERGE (b:Buyer {id: $bid}) " +
                       "MERGE (p:Product {id: $pid}) " +
                       "MERGE (b)-[:ACQUIRED]->(p)", 
                       parameters("bid", buyerId, "pid", productId));
                return null;
            });
        } catch (Exception e) {
            System.err.println("🕸️ Analytics Sync Offline: Relationship Hub not reachable. Continuing logistics...");
        }
    }

    public List<String> getRecommendations(String productId) {
        try (Session session = driver.session()) {
            return session.executeRead(tx -> {
                Result r = tx.run("MATCH (p1:Product {id: $pid})<-[:ACQUIRED]-(b:Buyer)-[:ACQUIRED]->(p2:Product) " +
                                  "WHERE p1 <> p2 " +
                                  "RETURN p2.id AS rec LIMIT 5",
                                  parameters("pid", productId));
                return r.list(record -> record.get("rec").asString());
            });
        }
    }
}
