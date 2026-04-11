// Neo4j: mapPurchase — Create ACQUIRED relationship between Buyer and Product
// Module: Buyer | Page: Checkout | Section: Graph Relationship Mapping
// Shell: Neo4j Browser -> http://localhost:7474 | Username: neo4j | Password: Kartk@30

// CREATE: merge buyer and product nodes, create ACQUIRED relationship (called on every checkout)
MERGE (b:Buyer {id: 'B-USR_BUYER1'})
MERGE (p:Product {id: 'CPROD001'})
MERGE (b)-[:ACQUIRED]->(p);

// READ: verify the relationship was created
MATCH (b:Buyer {id: 'B-USR_BUYER1'})-[:ACQUIRED]->(p:Product)
RETURN b.id AS buyer, p.id AS product;

// READ: all products acquired by a specific buyer
MATCH (b:Buyer {id: 'B-USR_BUYER1'})-[:ACQUIRED]->(p:Product)
RETURN p.id AS product_id;

// READ: all buyers who acquired a specific product
MATCH (b:Buyer)-[:ACQUIRED]->(p:Product {id: 'CPROD001'})
RETURN b.id AS buyer_id;

// READ: count how many products each buyer has acquired
MATCH (b:Buyer)-[:ACQUIRED]->(p:Product)
RETURN b.id AS buyer, count(p) AS products_acquired
ORDER BY products_acquired DESC;

// DELETE: remove relationship (for testing only — not used in production flow)
MATCH (b:Buyer {id: 'B-USR_BUYER1'})-[r:ACQUIRED]->(p:Product {id: 'CPROD001'})
DELETE r;

// DELETE: remove test nodes entirely (cleanup)
MATCH (n) WHERE n.id IN ['B-USR_BUYER1', 'CPROD001'] DETACH DELETE n;

// MANUAL TEST: create a relationship and verify
MERGE (b:Buyer {id: 'B-TEST'}) MERGE (p:Product {id: 'P-TEST'}) MERGE (b)-[:ACQUIRED]->(p);
MATCH (b:Buyer {id: 'B-TEST'})-[:ACQUIRED]->(p) RETURN b.id, p.id;
MATCH (n) WHERE n.id IN ['B-TEST', 'P-TEST'] DETACH DELETE n;
