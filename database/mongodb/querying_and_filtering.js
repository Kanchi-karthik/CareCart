// MongoDB: Querying and Filtering
// Module: Admin/Buyer/Seller | All Pages with Search, Filter, Sort
// Shell: mongosh -> use carecart

use carecart;

// FILTER by exact field match
db.products.find({ category: "Antibiotic" }).toArray();

// FILTER with multiple conditions (AND)
db.products.find({ category: "Antibiotic", status: "ACTIVE" }).toArray();

// FILTER with OR condition
db.products.find({ $or: [ { category: "Antibiotic" }, { category: "Analgesic" } ] }).toArray();

// FILTER with range: products with quantity between 100 and 5000
db.products.find({ quantity: { $gte: 100, $lte: 5000 } }).toArray();

// TEXT SEARCH on product name using $regex (case-insensitive, like a search bar)
db.products.find({ name: { $regex: "amox", $options: "i" } }).toArray();

// PROJECT specific fields only (like SELECT col1, col2)
db.products.find({ status: "ACTIVE" }, { product_id: 1, name: 1, quantity: 1, _id: 0 }).toArray();

// SORT products by name ascending
db.products.find({}).sort({ name: 1 }).toArray();

// SORT inquiries by created_at descending (newest first)
db.inquiries.find({}).sort({ created_at: -1 }).toArray();

// LIMIT and SKIP for pagination (page 2, 10 items per page)
db.products.find({}).sort({ name: 1 }).skip(10).limit(10).toArray();

// COUNT matching documents
db.inquiries.countDocuments({ status: "OPEN" });

// CHECK field existence (find docs where regulatory_docs field is present)
db.product_metadata.find({ regulatory_docs: { $exists: true } }).toArray();

// FILTER with IN operator (multiple values)
db.products.find({ category: { $in: ["Antibiotic", "Analgesic", "Vitamin"] } }).toArray();

// FILTER nested field (inside stock_metadata)
db.products.find({ "stock_metadata.batch_no": "B1" }).toArray();

// FILTER with date range (orders from last 30 days)
db.order_logs.find({
  timestamp: { $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) }
}).toArray();
