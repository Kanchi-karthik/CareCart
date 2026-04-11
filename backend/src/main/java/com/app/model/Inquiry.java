package com.app.model;

import com.google.gson.annotations.SerializedName;
import java.math.BigDecimal;
import java.sql.Timestamp;

public class Inquiry {
    private String id;
    
    @SerializedName("full_name")
    private String fullName;
    
    private String email;
    
    @SerializedName("product_id")
    private String productId;
    
    @SerializedName("buyer_id")
    private String buyerId;
    
    @SerializedName("seller_id")
    private String sellerId;
    
    private Integer quantity;
    
    @SerializedName("expected_price")
    private BigDecimal expectedPrice;
    
    private String message;
    private String status;
    private Timestamp createdAt;

    public Inquiry() {
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getBuyerId() { return buyerId; }
    public void setBuyerId(String buyerId) { this.buyerId = buyerId; }

    public String getSellerId() { return sellerId; }
    public void setSellerId(String sellerId) { this.sellerId = sellerId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getExpectedPrice() { return expectedPrice; }
    public void setExpectedPrice(BigDecimal expectedPrice) { this.expectedPrice = expectedPrice; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
