// MongoDB: product_reviews collection
// Module: Buyer | Page: ProductDetails | Section: Buyer Reviews and Ratings
// Shell: mongosh -> use carecart

use carecart;

// CREATE: buyer submits a review after purchase
db.product_reviews.insertOne({
  review_id:   "REV_001",
  product_id:  "CPROD001",
  buyer_id:    "B-USR_BUYER1",
  rating:      4,
  title:       "Good quality antibiotic",
  review_text: "Works well, delivered on time. Packaging was intact.",
  created_at:  new Date()
});

// READ: all reviews for a product (ProductDetails page)
db.product_reviews.find({ product_id: "CPROD001" }).sort({ created_at: -1 }).toArray();

// READ: average rating for a product
db.product_reviews.aggregate([
  { $match: { product_id: "CPROD001" } },
  { $group: { _id: "$product_id", avg_rating: { $avg: "$rating" }, total_reviews: { $sum: 1 } } }
]).toArray();

// UPDATE: buyer edits their review
db.product_reviews.updateOne(
  { review_id: "REV_001" },
  { $set: { rating: 5, review_text: "Excellent product, highly recommend!", updated_at: new Date() } }
);

// DELETE: admin removes inappropriate review
db.product_reviews.deleteOne({ review_id: "REV_001" });

// MANUAL TEST
db.product_reviews.insertOne({ review_id: "REV_TMP", product_id: "CPROD001", buyer_id: "B-1", rating: 3, created_at: new Date() });
db.product_reviews.findOne({ review_id: "REV_TMP" });
db.product_reviews.deleteOne({ review_id: "REV_TMP" });
