-- Reset products to ensure clean slate with high-fidelity data
DELETE FROM products WHERE SELLER_ID = 'dist_001';

-- Insert Comprehensive Premium Clinical Catalog
INSERT INTO products (
    PRODUCT_ID, SELLER_ID, NAME, MANUFACTURER, COMPOSITION, CATEGORY, 
    RETAIL_PRICE, SELLING_PRICE, WHOLESALE_PRICE, 
    MIN_WHOLESALE_QTY, MIN_ORDER_QTY, STOCK_QUANTITY, MIN_QUANTITY, 
    DESCRIPTION, IMAGE_URL, STATUS
) VALUES 
('prod_001', 'dist_001', 'Atorvastatin 20mg', 'Zydus Lifesciences', 'Atorvastatin Calcium 20mg', 'Cardiovascular', 
145.50, 130.00, 105.00, 100, 10, 5000, 50, 
'High-potency statin for hypercholesterolemia management and cardiovascular risk reduction.', 
'https://5.imimg.com/data5/SELLER/Default/2023/1/RP/XH/OY/14845511/atorvastatin-20mg-tablets-500x500.jpg', 'ACTIVE'),

('prod_002', 'dist_001', 'Amoxicillin 500mg', 'Cipla Ltd.', 'Amoxicillin Trihydrate 500mg', 'Antibiotics', 
98.00, 85.00, 68.00, 200, 20, 8000, 100, 
'Broad-spectrum antibiotic for the treatment of respiratory, urinary, and skin infections.', 
'https://5.imimg.com/data5/SELLER/Default/2022/10/XN/WK/PQ/13526543/amoxicillin-trihydrate-tablets-500x500.jpg', 'ACTIVE'),

('prod_003', 'dist_001', 'Metformin 500mg SR', 'Sun Pharmaceutical', 'Metformin Hydrochloride 500mg', 'Diabetic Needs', 
38.00, 32.00, 25.00, 500, 50, 15000, 200, 
'Sustained-release antihyperglycemic for glycemic control in Type 2 Diabetes Mellitus.', 
'https://5.imimg.com/data5/ANDROID/Default/2021/6/VZ/XW/WK/131713506/product-jpeg-500x500.jpg', 'ACTIVE'),

('prod_004', 'dist_001', 'Omeprazole 20mg EC', 'Dr Reddys Laboratories', 'Omeprazole 20mg', 'Gastrointestinal', 
115.00, 98.00, 75.00, 150, 15, 4000, 40, 
'Enteric-coated proton pump inhibitor (PPI) for GERD and peptic ulcer treatment.', 
'https://5.imimg.com/data5/SELLER/Default/2022/11/XI/YV/ZV/13676231/omeprazole-delayed-release-capsules-500x500.JPG', 'ACTIVE'),

('prod_005', 'dist_001', 'Azithromycin 500mg', 'Abbott India', 'Azithromycin 500mg', 'Antibiotics', 
118.00, 105.00, 82.00, 100, 5, 3000, 30, 
'Clinical-grade macrolide antibiotic for moderate to severe respiratory tract infections.', 
'https://5.imimg.com/data5/SELLER/Default/2023/3/XP/ZG/WK/15016543/azithromycin-tablets-i-p-500-mg-500x500.jpg', 'ACTIVE'),

('prod_006', 'dist_001', 'Paracetamol 650mg', 'GSK Consumer', 'Paracetamol 650mg', 'Pharmaceuticals', 
32.50, 28.00, 18.50, 1000, 100, 25000, 500, 
'Anti-pyretic and analgesic for effective management of fever and mild-to-moderate pain.', 
'https://5.imimg.com/data5/ECOM/Default/2023/3/ZR/XP/XP/117281358/d30907ad-0935-46f3-a212-984bb358380e-500x500.jpg', 'ACTIVE'),

('prod_007', 'dist_001', 'Pantoprazole 40mg', 'Alkem Laboratories', 'Pantoprazole Sodium 40mg', 'Gastrointestinal', 
142.00, 125.00, 95.00, 200, 20, 6000, 60, 
'Irreversible PPI for hypersecretory conditions and erosive esophagitis.', 
'https://5.imimg.com/data5/SELLER/Default/2021/6/VZ/XW/WK/131713506/product-jpeg-500x500.jpg', 'ACTIVE'),

('prod_008', 'dist_001', 'Telmisartan 40mg', 'Glenmark Pharma', 'Telmisartan 40mg', 'Cardiovascular', 
95.00, 82.00, 64.00, 300, 30, 9000, 90, 
'Angiotensin II Receptor Antagonist (ARB) for clinical hypertension management.', 
'https://5.imimg.com/data5/SELLER/Default/2022/9/MQ/RQ/IQ/111813506/telmisartan-40-mg-tablets-500x500.jpg', 'ACTIVE'),

('prod_009', 'dist_001', 'Montelukast 10mg', 'Lupin Pharma', 'Montelukast Sodium 10mg', 'Vitamins & Supplements', 
185.00, 160.00, 125.00, 150, 10, 4500, 45, 
'Leukotriene receptor antagonist for prophylaxis of chronic asthma and allergic rhinitis.', 
'https://5.imimg.com/data5/SELLER/Default/2022/10/XN/WK/PQ/13526543/montelukast-tablets-10mg-500x500.jpg', 'ACTIVE'),

('prod_010', 'dist_001', 'Vitamin D3 60K', 'Torrent Pharma', 'Cholecalciferol 60000 IU', 'Vitamins & Supplements', 
210.00, 185.00, 145.00, 100, 5, 3500, 35, 
'High-dose Vitamin D3 for clinical bone density management and immune support.', 
'https://5.imimg.com/data5/SELLER/Default/2023/1/RP/XH/OY/14845511/vitamin-d3-capsules-60000-iu-500x500.jpg', 'ACTIVE');
