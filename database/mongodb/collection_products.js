// MongoDB: products collection
// Module: Buyer/Seller | Page: Products, ProductDetails, AddProduct | Section: Product Catalog
// Shell: mongosh -> use carecart

use carecart;

// CREATE: insert a new product document
db.products.insertOne({
  product_id: "PRD_NEW_01",
  seller_id:  "SEL_001",
  name:        "Amoxicillin 500mg",
  composition: "Amoxicillin Trihydrate 500mg",
  category:    "Antibiotic",
  status:      "ACTIVE",
  quantity:    1000,
  description: "Broad-spectrum penicillin antibiotic.",
  stock_metadata: {
    batch_no:    "BATCH-2026-01",
    expiry_date: new Date("2028-12-31")
  }
});

// READ: find all active products
db.products.find({ status: "ACTIVE" }).toArray();

// READ: find by product_id
db.products.findOne({ product_id: "PRD_AMX_001" });

// READ: find all products for a specific seller
db.products.find({ seller_id: "SEL_001" }).toArray();

// UPDATE: change product stock quantity
db.products.updateOne(
  { product_id: "PRD_NEW_01" },
  { $set: { quantity: 800 } }
);

// UPDATE: update batch and expiry info
db.products.updateOne(
  { product_id: "PRD_NEW_01" },
  { $set: { "stock_metadata.batch_no": "BATCH-2026-02", "stock_metadata.expiry_date": new Date("2029-06-30") } }
);

// DELETE: remove product document
db.products.deleteOne({ product_id: "PRD_NEW_01" });

// MANUAL TEST: verify insert then remove
db.products.insertOne({ product_id: "PRD_TMP", seller_id: "SEL_001", name: "Test Drug", status: "ACTIVE", quantity: 10 });
db.products.findOne({ product_id: "PRD_TMP" });
db.products.deleteOne({ product_id: "PRD_TMP" });
db.products.findOne({ product_id: "PRD_TMP" }); // Should return null
