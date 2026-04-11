-- Seller Products Page: add, edit, delete and view own products
-- Page: /app/seller/products | Triggered by: page load, Add Product form, Edit, Delete button
-- Test: mysql -u root -pKartk@30 carecart < seller_products_crud.sql

USE carecart;

-- READ: all products for this seller
SELECT product_id, name, category, retail_price, wholesale_price,
       stock_quantity, status, created_at
FROM products WHERE seller_id = 'SEL_001' ORDER BY created_at DESC;

-- READ: single product detail for the Edit form
SELECT * FROM products WHERE product_id = 'CPROD001' AND seller_id = 'SEL_001';

-- CREATE: add a new product to the catalog
INSERT INTO products
  (product_id, seller_id, name, manufacturer, composition, category,
   retail_price, selling_price, wholesale_price, stock_quantity, min_quantity,
   min_order_qty, min_wholesale_qty, description, image_url, status)
VALUES
  ('CPROD_NEW', 'SEL_001', 'Ibuprofen 400mg', 'MedCorp', 'Ibuprofen', 'Analgesic',
   15.00, 14.00, 12.00, 5000, 1, 10, 100, 'Anti-inflammatory drug', '', 'ACTIVE');

-- UPDATE: edit product price and stock (Edit form save button)
UPDATE products
SET retail_price = 16.00, wholesale_price = 13.00, stock_quantity = 4500, description = 'Updated desc'
WHERE product_id = 'CPROD_NEW' AND seller_id = 'SEL_001';

-- UPDATE: deactivate a product (soft delete / hide from catalog)
UPDATE products SET status = 'INACTIVE' WHERE product_id = 'CPROD_NEW' AND seller_id = 'SEL_001';

-- DELETE: permanently remove product (only if no orders reference it)
DELETE FROM products WHERE product_id = 'CPROD_NEW' AND seller_id = 'SEL_001';

-- MANUAL TEST (rollback-safe)
START TRANSACTION;
INSERT INTO products VALUES ('CPROD_T1','SEL_001','TestDrug','Lab','X','Antibiotic',10,9,8,100,1,5,50,'Desc','','ACTIVE',NOW());
SELECT product_id, name, stock_quantity FROM products WHERE product_id = 'CPROD_T1';
UPDATE products SET stock_quantity = 200 WHERE product_id = 'CPROD_T1';
SELECT stock_quantity FROM products WHERE product_id = 'CPROD_T1';
ROLLBACK;
SELECT COUNT(*) AS cleaned FROM products WHERE product_id = 'CPROD_T1';
