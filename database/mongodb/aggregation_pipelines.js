// MongoDB: Aggregation Pipeline ($match, $group, $project)
// Module: Clinical Logistics Analytics | Dashboard Intelligence
// Shell: mongosh -> use carecart

use carecart;

/**
 * PIPELINE USAGE CASE: Clinical Inventory Distribution Analytics
 * Simple Explainer: We want to see how many units of medicine we have per category ("Antibiotic", "Vitamin", etc.)
 * but only for those that are currently "ACTIVE" on the marketplace.
 */

db.products.aggregate([
  
  // STAGE 1: $match (Filtering)
  // Simple: Filter to keep only active products (like WHERE in SQL).
  { 
    $match: { status: "ACTIVE" } 
  },

  // STAGE 2: $group (Grouping & Aggregating)
  // Simple: Bundle products by category and sum up their quantities (like GROUP BY).
  { 
    $group: { 
      _id: "$category", 
      totalUnits: { $sum: "$quantity" }, 
      productCount: { $sum: 1 } 
    } 
  },

  // STAGE 3: $project (Shaping & Reshaping)
  // Simple: Clean up the output names and calculate things like average units per product (like SELECT and AS).
  { 
    $project: { 
      categoryName: "$_id", 
      totalInventory: "$totalUnits", 
      totalProductsInCat: "$productCount",
      avgStockPerProduct: { $divide: ["$totalUnits", "$productCount"] },
      _id: 0 // Hide the default _id field
    } 
  },

  // STAGE 4: $sort (Ordering)
  // Simple: Show the category with the highest inventory first.
  {
    $sort: { totalInventory: -1 }
  }

]).pretty();


/**
 * PIPELINE USAGE CASE 2: Inquiry Status Dashboard
 * Simple Explainer: Count how many inquiries are "OPEN" vs "CLOSED" to show on the admin dashboard.
 */

db.inquiries.aggregate([
  {
    $group: {
      _id: "$status",
      count: { $sum: 1 }
    }
  },
  {
    $project: {
      status_label: "$_id",
      total_inquiries: "$count",
      _id: 0
    }
  }
]).forEach(printjson);

// IMPLEMENTATION IN APP:
// Used in `ProductMongoDAO.java` (getCategoryDistribution method) to provide
// real-time logistics intelligence to the Admin Dashboard.
