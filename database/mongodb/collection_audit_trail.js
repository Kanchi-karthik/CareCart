// MongoDB: audit_trail collection
// Module: Admin | Page: Admin Dashboard, Settlement Hub | Section: System Audit Records
// Shell: mongosh -> use carecart

use carecart;

// CREATE: log a system audit event
db.audit_trail.insertOne({
  audit_id:   "AUD_001",
  action:     "USER_VERIFIED",
  performed_by: "ADMIN",
  target_id:  "SEL_001",
  description: "Seller SEL_001 verified by admin.",
  timestamp:  new Date()
});

// READ: full audit trail sorted by latest
db.audit_trail.find().sort({ timestamp: -1 }).toArray();

// READ: audit events for a specific target (seller, buyer, order)
db.audit_trail.find({ target_id: "SEL_001" }).toArray();

// READ: audit events by action type
db.audit_trail.find({ action: "ORDER_CANCELLED" }).toArray();

// UPDATE: add resolution note to an audit entry
db.audit_trail.updateOne(
  { audit_id: "AUD_001" },
  { $set: { resolved: true, resolution_note: "Verified manually." } }
);

// DELETE: archive old audit entries (older than 6 months)
db.audit_trail.deleteMany({ timestamp: { $lt: new Date("2025-10-01") } });

// MANUAL TEST
db.audit_trail.insertOne({ audit_id: "AUD_TMP", action: "TEST", performed_by: "ADMIN", timestamp: new Date() });
db.audit_trail.findOne({ audit_id: "AUD_TMP" });
db.audit_trail.deleteOne({ audit_id: "AUD_TMP" });
