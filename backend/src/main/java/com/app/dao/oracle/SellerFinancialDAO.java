package com.app.dao.oracle;

import com.app.config.DatabaseConfig;
import java.sql.*;

public class SellerFinancialDAO {

    public boolean updateFinancials(String sellerId, String bankName, String accountNo, String ifsc, String holder) {
        String sql = "MERGE INTO SELLER_FINANCIALS target " +
                     "USING (SELECT ? AS SELLER_ID FROM DUAL) source " +
                     "ON (target.SELLER_ID = source.SELLER_ID) " +
                     "WHEN MATCHED THEN " +
                     "  UPDATE SET BANK_NAME = ?, ACCOUNT_NO = ?, IFSC_CODE = ?, HOLDER_NAME = ? " +
                     "WHEN NOT MATCHED THEN " +
                     "  INSERT (FIN_ID, SELLER_ID, BANK_NAME, ACCOUNT_NO, IFSC_CODE, HOLDER_NAME) " +
                     "  VALUES (SEQ_BANK_ID.NEXTVAL, ?, ?, ?, ?, ?)";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setString(1, sellerId);
            ps.setString(2, bankName);
            ps.setString(3, accountNo);
            ps.setString(4, ifsc);
            ps.setString(5, holder);
            ps.setString(6, sellerId);
            ps.setString(7, bankName);
            ps.setString(8, accountNo);
            ps.setString(9, ifsc);
            ps.setString(10, holder);
            
            int affected = ps.executeUpdate();
            return affected > 0;
            
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public org.json.simple.JSONObject getFinancials(String sellerId) {
        String sql = "SELECT * FROM SELLER_FINANCIALS WHERE SELLER_ID = ?";
        org.json.simple.JSONObject obj = new org.json.simple.JSONObject();
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setString(1, sellerId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    obj.put("bank_name", rs.getString("BANK_NAME"));
                    obj.put("account_no", rs.getString("ACCOUNT_NO"));
                    obj.put("ifsc_code", rs.getString("IFSC_CODE"));
                    obj.put("holder_name", rs.getString("HOLDER_NAME"));
                }
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return obj;
    }
}
