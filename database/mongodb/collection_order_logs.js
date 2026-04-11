// MongoDB: order_logs collection
// Module: Admin/Buyer | Page: BuyerOrders, AdminOrders | Section: Order Activity Logs
// Shell: mongosh -> use carecart

use carecart;

// CREATE: log an order event
db.order_logs.insertOne({
  log_id:    "LOG_ORD_001",
  order_id:  "ORD_001",
  buyer_id:  "B-USR_BUYER1",
  event:     "ORDER_PLACED",
  message:   "Order placed for 10 units of Amoxicillin.",
  timestamp: new Date()
});

// READ: all logs for a specific order
db.order_logs.find({ order_id: "ORD_001" }).sort({ timestamp: 1 }).toArray();

// READ: all logs for a specific buyer
db.order_logs.find({ buyer_id: "B-USR_BUYER1" }).toArray();

// READ: logs by event type
db.order_logs.find({ event: "ORDER_CANCELLED" }).toArray();

// UPDATE: correct a log message
db.order_logs.updateOne(
  { log_id: "LOG_ORD_001" },
  { $set: { message: "Order placed for 10 units of Amoxicillin 500mg." } }
);

// DELETE: clear old resolved logs
db.order_logs.deleteMany({ event: "ORDER_DELIVERED", timestamp: { $lt: new Date("2026-01-01") } });

// MANUAL TEST
db.order_logs.insertOne({ log_id: "LOG_TMP", order_id: "ORD_TMP", event: "TEST", timestamp: new Date() });
db.order_logs.findOne({ log_id: "LOG_TMP" });
db.order_logs.deleteOne({ log_id: "LOG_TMP" });
