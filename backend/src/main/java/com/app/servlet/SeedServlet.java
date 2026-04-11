package com.app.servlet;

import com.app.dao.mongodb.ProductMongoDAO;
import com.app.dao.neo4j.RecommendationNeo4jDAO;
import com.app.config.DatabaseConfig;
import com.app.model.Product;
import com.app.util.JSONUtil;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.Random;

@WebServlet("/api/dev/seed")
public class SeedServlet extends HttpServlet {
    private ProductMongoDAO mongoDao = new ProductMongoDAO();
    private RecommendationNeo4jDAO graphDao = new RecommendationNeo4jDAO();
    private Random rnd = new Random();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json");
        
        String[] categories = {"Diabetes Care", "Antibiotics", "Pain Relief", "Fever", "Surgical Items", "First Aid", "Supplements", "Digestion"};
        String[] manufacturers = {"Sun Pharma", "Cipla Ltd", "Dr. Reddy's Lab", "Lupin Pharma", "Aurobindo Pharma", "Zydus Cadila", "GlaxoSmithKline"};
        String[][] medicineNames = {
            {"Glycomet 500mg", "Amaryl 1mg", "Voglibose 0.3", "Janumet 50/500", "Galvus Met", "Istamet 50/500", "Zita-Met"},
            {"Azithral 500mg", "Taxim-O 200", "Mox 500", "Augmentin 625", "Clavam 625", "Zifi 200", "Oflox 200", "Cefakind 500"},
            {"Dolo 650", "Calpol 500", "Combiflam", "Voveran SR", "Nimulid", "Zerodol-P", "Naprosyn 500", "Brufen 400"},
            {"Crocin Advance", "Sumo 100", "Dart Tablet", "Saridon", "Pacimol 650", "Febrex Plus", "P-650"},
            {"Disposable Syringes", "Surgical Gloves", "Sterile Gauze", "IV Set (Latex)", "Bandage Rolls", "Surgical Masks", "Catheter", "Adhesive Tape"},
            {"Savlon 200ml", "Dettol 500ml", "Betadine 5%", "Cotton Wool", "Hansaplast", "Burnol", "Iodex Gel", "Moov Spray"},
            {"Limcee 500", "Zincovit", "Shelcal 500", "Becosules Z", "Neurobion Forte", "Revital H", "Evion 400", "A to Z Multivitamin"},
            {"Omez 20mg", "Pan D", "Pantocid 40", "Digene Gel", "Gelusil", "Rantac 150", "Eno Fruit Salt", "Pudin Hara"}
        };

        try {
            int count = 0;
            for (int i = 0; i < categories.length; i++) {
                String cat = categories[i];
                String[] meds = medicineNames[i];
                for (String med : meds) {
                    for (int j = 1; j <= 5; j++) { // Adjusted batch size to be faster
                        if (count >= 150) break;
                        String id = "IND-" + cat.substring(0, 3).toUpperCase() + "-" + (1000 + count);
                        String sellerId = "distributor-" + (count % 3 + 1);
                        String mfr = manufacturers[rnd.nextInt(manufacturers.length)];
                        String retail = (30 + rnd.nextInt(500)) + ".00";
                        String sell = new BigDecimal(retail).multiply(new BigDecimal("0.85")).setScale(2, RoundingMode.HALF_UP).toString();
                        String wholesale = new BigDecimal(sell).multiply(new BigDecimal("0.70")).setScale(2, RoundingMode.HALF_UP).toString();
                        
                        sync(id, sellerId, med + " (Batch-" + j + ")", cat, mfr, retail, sell, wholesale, (50 + rnd.nextInt(200)), (1000 + rnd.nextInt(5000)));
                        count++;
                    }
                }
            }
            res.getWriter().print(JSONUtil.createSuccessResponse("MDBMS Clinical Sync Status: 150 Indian Medicines Broadcasted across MySQL, MongoDB, and Neo4j."));
        } catch (Exception e) {
            String err = e.getMessage();
            res.getWriter().print(JSONUtil.createErrorResponse("Critical Seeding Error: " + err));
        }
    }

    private void sync(String id, String sel, String name, String cat, String mfr, String retail, String sell, String wholesale, int minWh, int qty) {
        // A. DOCUMENT TIER (MongoDB)
        Product p = new Product();
        p.setProductId(id); p.setSellerId(sel); p.setName(name); p.setCategory(cat); p.setManufacturer(mfr);
        p.setRetailPrice(new BigDecimal(retail)); p.setSellingPrice(new BigDecimal(sell)); p.setWholesalePrice(new BigDecimal(wholesale));
        p.setMinWholesaleQty(minWh); p.setQuantity(qty); p.setDescription("High-quality " + name + " for B2B distribution in Indian clinical markets.");
        p.setImageUrl("default_medicine.png"); p.setStatus("ACTIVE");
        mongoDao.createProduct(p);
        
        // B. GRAPH TIER (Neo4j)
        graphDao.trackInteraction("SYSTEM_DEFAULTS", id, sel);

        // C. RELATIONAL TIER (MySQL)
        String sql = "REPLACE INTO PRODUCTS (PRODUCT_ID, SELLER_ID, NAME, CATEGORY, MANUFACTURER, RETAIL_PRICE, SELLING_PRICE, WHOLESALE_PRICE, QUANTITY, STATUS) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, id); ps.setString(2, sel); ps.setString(3, name); ps.setString(4, cat); ps.setString(5, mfr);
            ps.setBigDecimal(6, new BigDecimal(retail)); ps.setBigDecimal(7, new BigDecimal(sell)); ps.setBigDecimal(8, new BigDecimal(wholesale));
            ps.setInt(9, qty);
            ps.executeUpdate();
        } catch (Exception e) { e.printStackTrace(); }
    }
}
