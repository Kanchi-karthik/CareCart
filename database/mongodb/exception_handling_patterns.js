// MongoDB: Exception Handling Patterns
// Module: All | Section: Error Handling in Mongo Shell and Java Backend
// Shell: mongosh -> use carecart

use carecart;

// PATTERN 1: Try-Catch in Mongo Shell script
try {
  db.products.insertOne({ product_id: "PRD_AMX_001", name: "Duplicate Test" });
  print("Insert SUCCESS");
} catch (e) {
  if (e.code === 11000) {
    print("ERROR: Duplicate product_id. Document already exists: " + e.message);
  } else {
    print("ERROR: Unexpected error - " + e.message);
  }
}
// APPLICATION USAGE:
// Implemented in `InquiryMongoDAO.java` and `ProductMongoDAO.java` (createProduct)
// to prevent API crashes by catching database-level failures.

// PATTERN 2: Check before insert to avoid duplicate key error
var exists = db.products.findOne({ product_id: "PRD_AMX_001" });
if (!exists) {
  db.products.insertOne({ product_id: "PRD_AMX_001", name: "Amoxicillin", status: "ACTIVE" });
  print("Inserted successfully.");
} else {
  print("Skipped: Product already exists.");
}
// APPLICATION USAGE:
// Pattern used in `InquiryServlet.java` pre-checks to avoid duplicate 
// ID submissions before calling the MongoDB persistence layer.

// PATTERN 3: Handle null/missing collection gracefully
var col = db.getCollection("invalid_collection");
if (col.countDocuments() === 0) {
  print("Collection is empty or does not exist.");
}
// APPLICATION USAGE:
// Used in `ProductMongoDAO.java`'s `getCollection()` and `ActivityLogMongoDBDAO.java`
// to handle null database connections safely during maintenance.

// PATTERN 4: Validate required fields before insert
function safeInsertInquiry(doc) {
  if (!doc.buyer_id || !doc.product_id || !doc.message) {
    print("ERROR: Missing required fields (buyer_id, product_id, message).");
    return;
  }
  db.inquiries.insertOne(doc);
  print("Inquiry inserted successfully.");
}
safeInsertInquiry({ buyer_id: "B-1", product_id: "P-1", message: "Need 1000 units" });
safeInsertInquiry({ buyer_id: "B-1" }); // Will print error

// APPLICATION USAGE:
// Validation patterns implemented in `ProductMongoDAO.java` (productToDoc)
// to ensure model-to-document conversion provides safe defaults for all fields.

// PATTERN 5: Aggregation error handled with try-catch (pipeline stage failure)
try {
  var result = db.products.aggregate([
    { $match:   { status: "ACTIVE" } },
    { $group:   { _id: "$category", total: { $sum: "$quantity" } } },
    { $project: { category: "$_id", total: 1, _id: 0 } }
  ]).toArray();
  printjson(result);
} catch (e) {
  print("Aggregation failed: " + e.message);
}
// APPLICATION USAGE:
// Implemented in `ProductMongoDAO.java`'s `getCategoryDistribution()` method
// to handle compute failures in the inventory analytics pipeline.

// PATTERN 6: Update with no match check (upsert false by default — no silent fail)
var updateResult = db.products.updateOne(
  { product_id: "NON_EXISTENT" },
  { $set: { status: "INACTIVE" } }
);
if (updateResult.matchedCount === 0) {
  print("WARNING: No document found to update.");
} else {
  print("Updated " + updateResult.modifiedCount + " document(s).");
}
// APPLICATION USAGE:
// Used in `InquiryServlet.java` (doPut) and `InquiryMongoDAO.java` (updateStatus)
// to ensure meaningful UI updates by checking if matches actually occurred.
