# Use Case: Neo4j Graph Relationship Model (CareCart)

## Overview
Neo4j is a NoSQL **Graph Database** used in CareCart to map complex relationships between Buyers, Sellers, and Products. While MongoDB handles metadata and PL/SQL handles transactional orders, Neo4j handles the **Social and Purchase Graphs**.

## Use Case 1: Buyer-to-Product Mapping (Purchase History)
**Scenario**: In CareCart, when a buyer checkouts, we map the **ACQUIRED** relationship between the `Buyer` and the `Product`.

### Logic (Simple Explanation)
1. **Nodes**: 
   - `Buyer`: Contains `id` and `email`.
   - `Product`: Contains `id` and `category`.
2. **Relationship**: 
   - `(Buyer)-[:ACQUIRED]->(Product)`: Represents a successful checkout.
3. **Benefit**: We can quickly find out all products a buyer has ever bought without doing 10-table joins in SQL.

---

## Use Case 2: Personalized Recommendation Engine
**Scenario**: Suggesting products to buyers based on what others have bought.

### Logic (Simple Explanation)
- **Path**: If Buyer A bought Product X and Product Y, and Buyer B bought only Product X, we can recommend Product Y to Buyer B because they share a common "purchase bridge".
- **Cypher Query**: 
  ```cypher
  MATCH (b1:Buyer)-[:ACQUIRED]->(p:Product)<-[:ACQUIRED]-(b2:Buyer)-[:ACQUIRED]->(rec:Product)
  WHERE b1.id = 'B_USER_ID' AND NOT (b1)-[:ACQUIRED]->(rec)
  RETURN rec.id AS recommended_product
  ```

---

## Implementation in App
The graph logic is implemented in **Checkout Flow** as shown in:
- `database/neo4j/buyer_checkout_map_purchase.cypher`: Documentation of the relationship create/read flow.
- `backend/.../neo4j/AssetMongoDAO.java` and similar DAOs for graph management.

### Simple Summary
- **Why Graph?** To handle "Who bought what" and "Who is connected to whom" with high performance and flexibility that SQL cannot match for multi-hop paths.
