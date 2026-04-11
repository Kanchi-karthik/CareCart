// MongoDB: product_metadata collection
// Module: Seller/Buyer | Page: ProductDetails, AddProduct | Section: Clinical Product Metadata
// Shell: mongosh -> use carecart

use carecart;

// CREATE: add rich clinical metadata for a product
db.product_metadata.insertOne({
  product_id:      "CPROD001",
  dosage_form:     "Tablet",
  dosage_strength: "500mg",
  storage_temp:    "Store below 25 degrees C",
  contraindications: ["Penicillin allergy", "Renal impairment"],
  side_effects:    ["Nausea", "Diarrhea", "Rash"],
  drug_class:      "Beta-lactam Antibiotic",
  regulatory_docs: [{ doc_type: "FDA_APPROVAL", doc_url: "https://docs.carecart/fda/amx.pdf" }],
  last_updated:    new Date()
});

// READ: fetch metadata for a product detail page
db.product_metadata.findOne({ product_id: "CPROD001" });

// UPDATE: update storage instructions
db.product_metadata.updateOne(
  { product_id: "CPROD001" },
  { $set: { storage_temp: "Store below 30 degrees C", last_updated: new Date() } }
);

// UPDATE: add a new side effect using $push
db.product_metadata.updateOne(
  { product_id: "CPROD001" },
  { $push: { side_effects: "Vomiting" } }
);

// DELETE: remove metadata when product is discontinued
db.product_metadata.deleteOne({ product_id: "CPROD001" });

// MANUAL TEST
db.product_metadata.insertOne({ product_id: "PMETA_TMP", dosage_form: "Syrup", drug_class: "Test" });
db.product_metadata.findOne({ product_id: "PMETA_TMP" });
db.product_metadata.deleteOne({ product_id: "PMETA_TMP" });
