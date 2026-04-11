import java.sql.*;

public class DBCheck {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/carecart";
        String user = "root";
        String pass = "Kartk@30";
        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT * FROM PRODUCTS LIMIT 5");
            ResultSetMetaData meta = rs.getMetaData();
            for (int i = 1; i <= meta.getColumnCount(); i++) {
                System.out.println("Column: " + meta.getColumnName(i));
            }
            int count = 0;
            while(rs.next()) {
                System.out.println("Found: " + rs.getString("NAME"));
                count++;
            }
            System.out.println("Total Found: " + count);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
