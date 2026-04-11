package com.app.dao.neo4j;

import com.app.config.Neo4jConfig;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;
import static org.neo4j.driver.Values.parameters;

public class RecommendationNeo4jDAO {
    
    public void trackInteraction(String buyerId, String productId, String sellerId) {
        Driver driver = Neo4jConfig.getDriver();
        if (driver == null) return; // Silent Fail for Graph analysis
        try (Session session = driver.session()) {
            session.executeWrite(tx -> {
                tx.run("MERGE (b:Buyer {id: $bid}) " +
                       "MERGE (s:Seller {id: $sid}) " +
                       "MERGE (p:Product {id: $pid}) " +
                       "MERGE (b)-[r:ACQUIRED]->(p) " +
                       "MERGE (p)-[f:FOLLOWS_SUPPLY]->(s) " +
                       "ON CREATE SET r.frequency = 1 " +
                       "ON MATCH SET r.frequency = r.frequency + 1",
                parameters("bid", buyerId, "pid", productId, "sid", sellerId));
                return null;
            });
        } catch (Exception e) {
            System.err.println("Neo4j Signal Fault (Ignored): " + e.getMessage());
        }
    }

    public void initializeGraph(String bId, String name) {
        Driver driver = Neo4jConfig.getDriver();
        if (driver == null) return;
        try (Session session = driver.session()) {
             session.run("MERGE (b:Buyer {id: $id, name: $name})", parameters("id", bId, "name", name));
        } catch (Exception e) { e.printStackTrace(); }
    }
}
