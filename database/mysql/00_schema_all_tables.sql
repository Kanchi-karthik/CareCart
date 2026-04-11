-- CareCart MySQL Schema: All Table Definitions
-- Run: mysql -u root -pKartk@30 carecart < 00_schema_all_tables.sql

USE carecart;

-- Identity hub for all platform users
CREATE TABLE IF NOT EXISTS users (
    user_id    VARCHAR(50) PRIMARY KEY,
    username   VARCHAR(100) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,
    role       ENUM('ADMIN','BUYER','SELLER') NOT NULL,
    status     VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Multi-address registry for buyers and sellers
CREATE TABLE IF NOT EXISTS addresses (
    address_id    INT AUTO_INCREMENT PRIMARY KEY,
    user_id       VARCHAR(50) NOT NULL,
    receiver_name VARCHAR(200) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city          VARCHAR(100) NOT NULL,
    state         VARCHAR(100) NOT NULL,
    zip_code      VARCHAR(20) NOT NULL,
    country       VARCHAR(100) DEFAULT 'India',
    address_type  ENUM('SHIPPING','BILLING','BOTH') DEFAULT 'SHIPPING',
    is_default    BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_address_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Institutional buyers (hospitals, clinics)
CREATE TABLE IF NOT EXISTS buyers (
    buyer_id       VARCHAR(50) PRIMARY KEY,
    user_id        VARCHAR(50) NOT NULL UNIQUE,
    name           VARCHAR(200) NOT NULL,
    email          VARCHAR(100) UNIQUE,
    phone          VARCHAR(20),
    license_no     VARCHAR(100),
    address        VARCHAR(500),
    city           VARCHAR(100),
    wallet_balance DECIMAL(15,2) DEFAULT 0.00,
    CONSTRAINT fk_buyer_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Pharmaceutical sellers (manufacturers, distributors)
CREATE TABLE IF NOT EXISTS sellers (
    seller_id      VARCHAR(50) PRIMARY KEY,
    user_id        VARCHAR(50) NOT NULL UNIQUE,
    name           VARCHAR(200) NOT NULL,
    email          VARCHAR(100) UNIQUE,
    phone          VARCHAR(20),
    registration_no VARCHAR(100),
    address        VARCHAR(500),
    city           VARCHAR(100),
    verified       BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_seller_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Medicine and product catalog
CREATE TABLE IF NOT EXISTS products (
    product_id       VARCHAR(50) PRIMARY KEY,
    seller_id        VARCHAR(50) NOT NULL,
    name             VARCHAR(200) NOT NULL,
    manufacturer     VARCHAR(200),
    composition      VARCHAR(500),
    category         VARCHAR(100),
    retail_price     DECIMAL(12,2) NOT NULL,
    selling_price    DECIMAL(12,2),
    wholesale_price  DECIMAL(12,2) NOT NULL,
    stock_quantity   INT DEFAULT 0,
    min_quantity     INT DEFAULT 1,
    min_order_qty    INT DEFAULT 1,
    min_wholesale_qty INT DEFAULT 100,
    description      TEXT,
    image_url        VARCHAR(500),
    status           VARCHAR(20) DEFAULT 'ACTIVE',
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_seller FOREIGN KEY (seller_id) REFERENCES sellers(seller_id) ON DELETE CASCADE
);

-- Procurement orders manifest
CREATE TABLE IF NOT EXISTS orders (
    order_id         VARCHAR(50) PRIMARY KEY,
    bundle_id        VARCHAR(50),
    buyer_id         VARCHAR(50) NOT NULL,
    seller_id        VARCHAR(50),
    product_id       VARCHAR(50) NOT NULL,
    quantity         INT NOT NULL,
    unit_price       DECIMAL(12,2),
    total_amount     DECIMAL(15,2),
    tax_amount       DECIMAL(12,2) DEFAULT 0.00,
    delivery_charge  DECIMAL(12,2) DEFAULT 0.00,
    grand_total      DECIMAL(15,2) NOT NULL,
    applied_tier     ENUM('RETAIL','WHOLESALE') DEFAULT 'RETAIL',
    status           VARCHAR(30) DEFAULT 'PENDING',
    shipping_address VARCHAR(500),
    order_date       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_buyer   FOREIGN KEY (buyer_id)   REFERENCES buyers(buyer_id),
    CONSTRAINT fk_order_product FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Automated audit trail for every order status change
CREATE TABLE IF NOT EXISTS order_status_log (
    log_id     VARCHAR(50) PRIMARY KEY,
    order_id   VARCHAR(50) NOT NULL,
    old_status VARCHAR(30),
    new_status VARCHAR(30),
    changed_by VARCHAR(100) DEFAULT 'SYSTEM',
    log_time   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- Stock alert hub for low inventory notifications
CREATE TABLE IF NOT EXISTS stock_alerts (
    alert_id   VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    alert_type VARCHAR(30) DEFAULT 'LOW_STOCK',
    is_active  BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alert_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Verify tables created
SHOW TABLES;
