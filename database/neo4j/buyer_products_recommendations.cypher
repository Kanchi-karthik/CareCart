// Neo4j: getRecommendations — Find products bought by buyers who bought this product
// Module: Buyer | Page: ProductDetails | Section: "You May Also Need" Recommendation Engine
// Shell: Neo4j Browser -> http://localhost:7474 | Username: neo4j | Password: Kartk@30

// READ: recommend products bought by other buyers who also bought CPROD001
MATCH (p1:Product {id: 'CPROD001'})<-[:ACQUIRED]-(b:Buyer)-[:ACQUIRED]->(p2:Product)
WHERE p1 <> p2
RETURN p2.id AS recommended_product, count(b) AS strength
ORDER BY strength DESC
LIMIT 5;

// READ: all buyer-product relationships in the graph (full network view)
MATCH (b:Buyer)-[:ACQUIRED]->(p:Product)
RETURN b.id AS buyer, p.id AS product;

// READ: strength of each product recommendation from a given product
MATCH (source:Product {id: 'CPROD001'})<-[:ACQUIRED]-(b:Buyer)-[:ACQUIRED]->(rec:Product)
WHERE source <> rec
RETURN rec.id AS recommendation, count(b) AS buyer_overlap
ORDER BY buyer_overlap DESC;

// READ: most popular products across all buyers
MATCH (b:Buyer)-[:ACQUIRED]->(p:Product)
RETURN p.id AS product_id, count(b) AS total_buyers
ORDER BY total_buyers DESC
LIMIT 10;

// READ: buyers who share purchase patterns (bought at least 2 same products)
MATCH (b1:Buyer)-[:ACQUIRED]->(p:Product)<-[:ACQUIRED]-(b2:Buyer)
WHERE b1 <> b2
RETURN b1.id, b2.id, count(p) AS shared_purchases
ORDER BY shared_purchases DESC;

// MANUAL TEST: seed data and run recommendation
MERGE (b1:Buyer {id: 'B-TEST1'}) MERGE (b2:Buyer {id: 'B-TEST2'})
MERGE (pA:Product {id: 'P-A'})   MERGE (pB:Product {id: 'P-B'})
MERGE (b1)-[:ACQUIRED]->(pA)     MERGE (b2)-[:ACQUIRED]->(pA)
MERGE (b2)-[:ACQUIRED]->(pB);

// Run recommendation for pA — should recommend pB
MATCH (src:Product {id: 'P-A'})<-[:ACQUIRED]-(b:Buyer)-[:ACQUIRED]->(rec:Product)
WHERE src <> rec
RETURN rec.id AS recommended_product, count(b) AS strength;

// Cleanup test data
MATCH (n) WHERE n.id IN ['B-TEST1', 'B-TEST2', 'P-A', 'P-B'] DETACH DELETE n;
