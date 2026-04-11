// MongoDB: analytics_daily collection
// Module: Admin/Seller | Page: Analysis, Seller Dashboard | Section: Daily Analytics Metrics
// Shell: mongosh -> use carecart

use carecart;

// CREATE: record a daily analytics snapshot
db.analytics_daily.insertOne({
  snapshot_id:    "SNAP_20260330",
  date:           new Date("2026-03-30"),
  total_orders:   25,
  total_revenue:  48500.00,
  new_users:      3,
  top_category:   "Antibiotic",
  top_product_id: "CPROD001"
});

// READ: all daily snapshots sorted by date
db.analytics_daily.find().sort({ date: -1 }).toArray();

// READ: last 7 days analytics
db.analytics_daily.find({
  date: { $gte: new Date(new Date() - 7 * 24 * 60 * 60 * 1000) }
}).sort({ date: 1 }).toArray();

// UPDATE: update today's snapshot with latest numbers
db.analytics_daily.updateOne(
  { snapshot_id: "SNAP_20260330" },
  { $set: { total_orders: 30, total_revenue: 55000.00 } }
);

// DELETE: remove outdated snapshots
db.analytics_daily.deleteMany({ date: { $lt: new Date("2026-01-01") } });

// MANUAL TEST
db.analytics_daily.insertOne({ snapshot_id: "SNAP_TMP", date: new Date(), total_orders: 5, total_revenue: 1000 });
db.analytics_daily.findOne({ snapshot_id: "SNAP_TMP" });
db.analytics_daily.deleteOne({ snapshot_id: "SNAP_TMP" });
