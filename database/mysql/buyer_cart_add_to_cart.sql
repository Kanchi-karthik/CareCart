-- Buyer Cart Page: add item, update quantity, remove item, view cart
-- Page: /app/cart | Triggered by: Add to Cart button, quantity +/-, Remove button
-- Note: Cart is stored in localStorage on the frontend; these queries check stock eligibility
-- Test: mysql -u root -pKartk@30 carecart < buyer_cart_add_to_cart.sql

USE carecart;

-- READ: check product availability and price before adding to cart
SELECT product_id, name, retail_price, wholesale_price, stock_quantity,
       min_quantity, min_order_qty, min_wholesale_qty, status
FROM products WHERE product_id = 'CPROD001' AND status = 'ACTIVE';

-- READ: validate requested quantity does not exceed stock
SELECT product_id, name, stock_quantity
FROM products
WHERE product_id = 'CPROD001' AND stock_quantity >= 10;

-- READ: determine pricing tier based on quantity (wholesale if qty >= min_wholesale_qty)
SELECT
    product_id, name, stock_quantity,
    retail_price, wholesale_price, min_wholesale_qty,
    CASE WHEN 150 >= min_wholesale_qty THEN wholesale_price ELSE retail_price END AS applied_price,
    CASE WHEN 150 >= min_wholesale_qty THEN 'WHOLESALE' ELSE 'RETAIL' END AS tier
FROM products WHERE product_id = 'CPROD001';

-- READ: fetch full product list for the product catalog page (buyer browses before adding)
SELECT p.product_id, p.name, p.category, p.retail_price, p.wholesale_price,
       p.stock_quantity, p.image_url, s.name AS seller_name
FROM products p
JOIN sellers s ON p.seller_id = s.seller_id
WHERE p.status = 'ACTIVE'
ORDER BY p.created_at DESC;

-- READ: filter products by category
SELECT product_id, name, category, retail_price, stock_quantity
FROM products WHERE category = 'Antibiotic' AND status = 'ACTIVE';

-- MANUAL TEST: verify stock check works
SELECT 'Stock Check' AS test,
       CASE WHEN stock_quantity >= 5 THEN 'ELIGIBLE' ELSE 'OUT_OF_STOCK' END AS result
FROM products WHERE product_id = 'CPROD001';
