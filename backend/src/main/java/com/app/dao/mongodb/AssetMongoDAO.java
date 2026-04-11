package com.app.dao.mongodb;

import com.app.config.MongoDBConfig;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.model.Filters;
import org.bson.Document;
import org.bson.types.ObjectId;
import java.io.InputStream;
import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.List;

public class AssetMongoDAO {
    private static final String COLLECTION_NAME = "assets_metadata";
    private GridFSBucket gridFSBucket;

    public AssetMongoDAO() {
        this.gridFSBucket = GridFSBuckets.create(MongoDBConfig.getDatabase(), "medicine_assets");
    }

    private MongoCollection<Document> getMetadataCollection() {
        return MongoDBConfig.getDatabase().getCollection(COLLECTION_NAME);
    }

    public String uploadAsset(String fileName, String contentType, byte[] data, String relatedToId) {
        try {
            InputStream stream = new ByteArrayInputStream(data);
            ObjectId fileId = gridFSBucket.uploadFromStream(fileName, stream);
            
            Document metadata = new Document()
                .append("file_id", fileId)
                .append("fileName", fileName)
                .append("contentType", contentType)
                .append("related_to", relatedToId)
                .append("upload_date", new java.util.Date());
            
            getMetadataCollection().insertOne(metadata);
            return fileId.toHexString();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public List<Document> getAssetsForProduct(String productId) {
        List<Document> assets = new ArrayList<>();
        try {
            for (Document doc : getMetadataCollection().find(Filters.eq("related_to", productId))) {
                assets.add(doc);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return assets;
    }
}
