# CareCart: Database Metric Documentation Index

This document maps all required database metrics to their respective files and provides a simple explanation of where and how they are implemented in the CareCart application.

---

## 1. Use Case for Neo4j (Graph Mapping)
- **File**: `database/neo4j/use_case_graph_relations.md`
- **What it is**: Explains why we use a graph database (Neo4j) alongside SQL and NoSQL.
- **Implementation**: Used during **Checkout** to link `(Buyer)-[:ACQUIRED]->(Product)`. It enables high-speed purchase history tracking and personalized recommendations.

## 2. PL/SQL Procedures
- **Files**: 
  - `database/plsql/proc_sp_place_order.sql` (Checkout)
  - `database/plsql/proc_settle_payment.sql` (Finance)
- **What it is**: Server-side logic to handle complex transactions.
- **Implementation**: When a buyer places an order, the SQL procedure automatically updates inventory, creates order logs, and manages wallet balances in a single atomic step.

## 3. Triggers
- **Files**: 
  - `database/plsql/trigger_low_stock_alert.sql` (Inventory Management)
  - `database/plsql/trigger_payout_routing.sql` (Payment Processing)
- **What it is**: Automatic actions that run when data is changed.
- **Implementation**: If a product's quantity drops below 10, the **Low Stock Trigger** automatically creates a notification. If a status changes to 'SHIPPED', the **Log Trigger** records it in the history table.

## 4. Exception Handling
- **File**: `database/mongodb/exception_handling_patterns.js`
- **What it is**: Patterns to prevent the database or app from crashing when errors occur (duplicate keys, missing collections).
- **Implementation**: Used in **InquiryMongoDAO.java** to catch duplicate inquiry IDs and in **ProductMongoDAO.java** to handle disconnected database states.

## 5. CRUD Operations (PL/SQL & MongoDB)
- **Files**: 
  - `database/plsql/crud_operations_plsql.sql` (Oracle/MySQL)
  - `database/mongodb/crud_operations_mongodb.js` (Document Store)
- **What it is**: The 4 core actions (Create, Read, Update, Delete).
- **Implementation**: 
  - **CREATE**: Registering sellers or adding new inquiry documents.
  - **READ**: Displaying list of products on the frontend.
  - **UPDATE**: Modifying product prices or inquiry status.
  - **DELETE**: Soft-deleting old logs or inactive sellers.

## 6. Querying & Filtering (MongoDB)
- **File**: `database/mongodb/querying_and_filtering.js`
- **What it is**: Advanced ways to find data using $regex, $or, $in, and sorting.
- **Implementation**: Powering the **Search Bar** on the product page and filtering by category (Antibiotics, Vitamin, etc.).

## 7. Use of Pipeline Stages ($match, $group, $project)
- **File**: `database/mongodb/aggregation_pipelines.js`
- **What it is**: Multi-stage data processing ("The Pipeline").
- **Implementation**: Used for **Clinical Analytics** — it filters active products (`$match`), groups them by category (`$group`), and calculates total stock units (`$project`) to show as charts on the Admin Dashboard.
