package test;

import config.DatabaseConfig;
import dao.UserDAO;
import dao.ProductDAO;
import model.User;
import model.Product;

public class TestJDBC {
    public static void main(String[] args) {
        try {
            System.out.println("Testing Connection...");
            if (DatabaseConfig.getConnection() != null) {
                System.out.println("Success!");

                UserDAO userDAO = new UserDAO();
                User u = userDAO.loginUser("admin", "admin123");
                if (u != null)
                    System.out.println("Login Test: OK");

                ProductDAO productDAO = new ProductDAO();
                System.out.println("Products Found: " + productDAO.getAllProducts().size());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
