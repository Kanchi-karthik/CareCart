// MongoDB: inquiries collection
// Module: Admin/Buyer | Page: AdminInquiries, ProductDetails | Section: Wholesale Inquiry Hub
// Shell: mongosh -> use carecart

use carecart;

// CREATE: buyer submits a new bulk inquiry
db.inquiries.insertOne({
  inquiry_id: "INQ_NEW_01",
  buyer_id:   "B-USR_BUYER1",
  product_id: "PRD_AMX_001",
  message:    "Requesting quote for 5000 units for Q2.",
  quantity:   5000,
  expected_price: 12.00,
  status:     "OPEN",
  created_at: new Date()
});

// READ: all inquiries (Admin Inquiries page table)
db.inquiries.find().sort({ created_at: -1 }).toArray();

// READ: inquiries for one buyer
db.inquiries.find({ buyer_id: "B-USR_BUYER1" }).toArray();

// READ: only OPEN inquiries awaiting admin response
db.inquiries.find({ status: "OPEN" }).toArray();

// UPDATE: admin accepts an inquiry
db.inquiries.updateOne(
  { inquiry_id: "INQ_NEW_01" },
  { $set: { status: "ACCEPTED", responded_at: new Date() } }
);

// UPDATE: admin rejects an inquiry
db.inquiries.updateOne(
  { inquiry_id: "INQ_NEW_01" },
  { $set: { status: "REJECTED" } }
);

// DELETE: remove resolved inquiry
db.inquiries.deleteOne({ inquiry_id: "INQ_NEW_01" });

// MANUAL TEST
db.inquiries.insertOne({ inquiry_id: "INQ_TMP", buyer_id: "B-1", product_id: "P-1", status: "OPEN", created_at: new Date() });
db.inquiries.findOne({ inquiry_id: "INQ_TMP" });
db.inquiries.updateOne({ inquiry_id: "INQ_TMP" }, { $set: { status: "ACCEPTED" } });
db.inquiries.findOne({ inquiry_id: "INQ_TMP" });
db.inquiries.deleteOne({ inquiry_id: "INQ_TMP" });
