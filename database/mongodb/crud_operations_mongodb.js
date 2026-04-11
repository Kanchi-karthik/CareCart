// MongoDB: CRUD Operations (Create, Read, Update, Delete)
// Module: All Collections | Section: Core Data Management
// Shell: mongosh -> use carecart

use carecart;

// 1. CREATE Operations (Inserting new records)
// Simple Way: When a user sends an inquiry or a seller adds a product.
// Implementation: Used in InquiryMongoDAO.java (createInquiry) and ProductMongoDAO.java (createProduct).

// Insert a single Inquiry
db.inquiries.insertOne({
  fullName: "John Doe",
  email: "john@example.com",
  productId: "PRD_AMX_001",
  message: "I need 500 boxes of Amoxicillin.",
  status: "OPEN",
  createdAt: new Date()
});

// Insert multiple logs (InsertMany)
db.activity_logs.insertMany([
  { action: "LOGIN", status: "SUCCESS", timestamp: new Date() },
  { action: "LOGOUT", status: "SUCCESS", timestamp: new Date() }
]);


// 2. READ Operations (Fetching data)
// Simple Way: To display products on the marketplace or show list of inquiries.
// Implementation: Used in all DAO find() methods across the app.

// Find all Active products
db.products.find({ status: "ACTIVE" }).toArray();

// Find one specific inquiry by email
db.inquiries.findOne({ email: "john@example.com" });


// 3. UPDATE Operations (Modifying existing data)
// Simple Way: When a seller updates product price or admin changes inquiry status.
// Implementation: Used in updateStatus() and updateProduct() methods.

// Update specific inquiry status to 'CLOSED'
db.inquiries.updateOne(
  { email: "john@example.com" },
  { $set: { status: "CLOSED", updatedAt: new Date() } }
);

// Update all products in a category to be Active
db.products.updateMany(
  { category: "Antibiotic" },
  { $set: { status: "ACTIVE" } }
);


// 4. DELETE Operations (Removing records)
// Simple Way: Deleting a draft product or clearing old audit logs.
// Implementation: Used in deleteProduct() in the backend.

// Delete one specific inquiry
db.inquiries.deleteOne({ productId: "TEMP_001" });

// Remove all activity logs older than 30 days
db.activity_logs.deleteMany({
  timestamp: { $lt: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) }
});
