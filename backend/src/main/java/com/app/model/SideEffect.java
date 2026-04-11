package com.app.model;

public class SideEffect {
    private String effectId;
    private String productId;
    private String effect;
    private String severity;
    private String addedAt;

    public String getEffectId() { return effectId; }
    public void setEffectId(String effectId) { this.effectId = effectId; }
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public String getEffect() { return effect; }
    public void setEffect(String effect) { this.effect = effect; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getAddedAt() { return addedAt; }
    public void setAddedAt(String addedAt) { this.addedAt = addedAt; }
}
