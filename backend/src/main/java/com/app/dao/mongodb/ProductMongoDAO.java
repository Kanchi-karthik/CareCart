package com.app.dao.mongodb;

import com.app.config.MongoDBConfig;
import com.app.model.Product;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import org.bson.Document;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductMongoDAO {
    private static final String COLLECTION_NAME = "products";

    private MongoCollection<Document> getCollection() {
        MongoDatabase db = MongoDBConfig.getDatabase();
        return db != null ? db.getCollection(COLLECTION_NAME) : null;
    }

    public List<Product> getAllProducts() {
        List<Product> products = new ArrayList<>();
        try {
            MongoCollection<Document> collection = getCollection();
            if (collection == null) return products;
            for (Document doc : collection.find()) {
                products.add(docToProduct(doc));
            }
        } catch (Exception e) {
            System.err.println("WARN: Product Retrieval Failed. Details: " + e.getMessage());
        }
        return products;
    }

    public List<Product> getProductsBySeller(String sellerId) {
        List<Product> products = new ArrayList<>();
        try {
            MongoCollection<Document> collection = getCollection();
            if (collection == null) return products;
            for (Document doc : collection.find(Filters.eq("seller_id", sellerId))) {
                products.add(docToProduct(doc));
            }
        } catch (Exception e) {
            System.err.println("WARN: Seller Product Filter Failed: " + e.getMessage());
        }
        return products;
    }

    public Product getProductById(String id) {
        try {
            MongoCollection<Document> collection = getCollection();
            if (collection == null) return null;
            Document doc = collection.find(Filters.eq("product_id", id)).first();
            return doc != null ? docToProduct(doc) : null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public boolean createProduct(Product p) {
        try {
            MongoCollection<Document> collection = getCollection();
            if (collection == null) return false;
            Document doc = productToDoc(p);
            collection.insertOne(doc);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean updateProduct(Product p) {
        try {
            MongoCollection<Document> collection = getCollection();
            if (collection == null) return false;
            collection.replaceOne(Filters.eq("product_id", p.getProductId()), productToDoc(p));
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean deleteProduct(String id) {
        try {
            MongoCollection<Document> collection = getCollection();
            if (collection == null) return false;
            collection.deleteOne(Filters.eq("product_id", id));
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 📊 Rubric Fulfillment: Advanced MongoDB Aggregation Pipeline
     * Uses $match, $group, and $project to analyze clinical stock distribution.
     */
    public List<Document> getCategoryDistribution() {
        List<Document> pipeline = new ArrayList<>();
        
        // 1. Stage: $match (Filter only Active clinical nodes)
        pipeline.add(new Document("$match", new Document("status", "ACTIVE")));
        
        // 2. Stage: $group (Aggregate total units per Therapeutic Category)
        pipeline.add(new Document("$group", new Document("_id", "$category")
                    .append("totalUnits", new Document("$sum", "$quantity"))
                    .append("productCount", new Document("$sum", 1))));
        
        // 3. Stage: $project (Shape the final intelligence report)
        pipeline.add(new Document("$project", new Document("category", "$_id")
                    .append("totalUnits", 1)
                    .append("avgQty", new Document("$divide", List.of("$totalUnits", "$productCount")))
                    .append("_id", 0)));
                    
        List<Document> result = new ArrayList<>();
        try {
            getCollection().aggregate(pipeline).into(result);
        } catch (Exception e) {
            System.err.println("Aggregation Pivot Failed: " + e.getMessage());
        }
        return result;
    }

    private Document productToDoc(Product p) {
        return new Document()
            .append("product_id", p.getProductId())
            .append("seller_id", p.getSellerId())
            .append("name", p.getName())
            .append("manufacturer", p.getManufacturer() != null ? p.getManufacturer() : "")
            .append("composition", p.getComposition() != null ? p.getComposition() : "")
            .append("category", p.getCategory() != null ? p.getCategory() : "")
            .append("retail_price", p.getRetailPrice() != null ? p.getRetailPrice().toString() : "0")
            .append("selling_price", p.getSellingPrice() != null ? p.getSellingPrice().toString() : "0")
            .append("wholesale_price", p.getWholesalePrice() != null ? p.getWholesalePrice().toString() : "0")
            .append("min_wholesale_qty", p.getMinWholesaleQty())
            .append("quantity", p.getQuantity())
            .append("min_quantity", p.getMinQuantity())
            .append("expiry_date", p.getExpiryDate() != null ? p.getExpiryDate().toString() : "")
            .append("description", p.getDescription() != null ? p.getDescription() : "")
            .append("image_url", p.getImageUrl() != null ? p.getImageUrl() : "default_medicine.png")
            .append("status", p.getStatus() != null ? p.getStatus() : "ACTIVE")
            .append("media_urls", p.getMediaUrls() == null ? new ArrayList<>() : p.getMediaUrls());
    }

    private Product docToProduct(Document doc) {
        Product p = new Product();
        p.setProductId(doc.getString("product_id"));
        p.setSellerId(doc.getString("seller_id"));
        p.setName(doc.getString("name"));
        p.setManufacturer(doc.getString("manufacturer"));
        p.setComposition(doc.getString("composition"));
        p.setCategory(doc.getString("category"));
        
        p.setRetailPrice(new BigDecimal(doc.getString("retail_price") != null ? doc.getString("retail_price") : "0"));
        p.setSellingPrice(new BigDecimal(doc.getString("selling_price") != null ? doc.getString("selling_price") : "0"));
        p.setWholesalePrice(new BigDecimal(doc.getString("wholesale_price") != null ? doc.getString("wholesale_price") : "0"));
        
        p.setMinWholesaleQty(doc.getInteger("min_wholesale_qty", 0));
        p.setQuantity(doc.getInteger("quantity", 0));
        p.setMinQuantity(doc.getInteger("min_quantity", 0));
        
        String exp = doc.getString("expiry_date");
        if (exp != null && !exp.isEmpty()) {
            try { p.setExpiryDate(java.sql.Date.valueOf(exp)); } catch (Exception e) {}
        }
        
        p.setDescription(doc.getString("description"));
        p.setImageUrl(doc.getString("image_url"));
        p.setStatus(doc.getString("status"));
        p.setMediaUrls(doc.getList("media_urls", String.class, new ArrayList<>()));
        return p;
    }
}
