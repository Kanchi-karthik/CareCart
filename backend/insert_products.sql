USE carecart;
INSERT INTO products (PRODUCT_ID, SELLER_ID, NAME, MANUFACTURER, COMPOSITION, CATEGORY, RETAIL_PRICE, SELLING_PRICE, WHOLESALE_PRICE, MIN_WHOLESALE_QTY, MIN_ORDER_QTY, STOCK_QUANTITY, MIN_QUANTITY, DESCRIPTION, IMAGE_URL, STATUS) VALUES 
('PRD_CROC_001', 'SEL_BHP_001', 'Crocin Advance', 'GSK Pharma', 'Paracetamol 500mg', 'Analgesic', 30.00, 25.00, 18.00, 100, 10, 5000, 200, 'Fast relief from pain and fever.', 'crocin.png', 'ACTIVE'),
('PRD_AMOX_002', 'SEL_BHP_001', 'Amoxicillin 500mg', 'Cipla', 'Amoxicillin', 'Antibiotic', 120.00, 100.00, 75.00, 50, 5, 2000, 100, 'Broad-spectrum antibiotic.', 'amox.png', 'ACTIVE'),
('PRD_INSU_003', 'SEL_BHP_001', 'Insulin Glargine', 'Sanofi', 'Insulin', 'Anti-Diabetic', 850.00, 800.00, 650.00, 10, 1, 500, 50, 'Long-acting insulin for diabetes control.', 'insulin.png', 'ACTIVE'),
('PRD_CITR_004', 'SEL_BHP_001', 'Cetirizine 10mg', 'Dr. Reddys', 'Cetirizine Hydrochloride', 'Anti-Allergic', 45.00, 40.00, 28.00, 200, 20, 8000, 500, 'Relief from allergy symptoms.', 'cetirizine.png', 'ACTIVE'),
('PRD_AZIT_005', 'SEL_BHP_001', 'Azithromycin 500mg', 'Aurobindo', 'Azithromycin', 'Antibiotic', 150.00, 130.00, 95.00, 40, 5, 1500, 100, 'Treatment for respiratory and skin infections.', 'azithro.png', 'ACTIVE'),
('PRD_DOLO_006', 'SEL_BHP_001', 'Dolo 650', 'Micro Labs', 'Paracetamol 650mg', 'Analgesic', 40.00, 35.00, 22.00, 300, 30, 10000, 1000, 'Recommended for high fever and body ache.', 'dolo.png', 'ACTIVE'),
('PRD_ORSL_007', 'SEL_BHP_001', 'ORS Liquid', 'Johnson & Johnson', 'Electrolytes', 'Health Supplement', 60.00, 55.00, 40.00, 100, 10, 3000, 200, 'Rehydration solution.', 'ors.png', 'ACTIVE'),
('PRD_VITA_008', 'SEL_BHP_001', 'Vitamin C 500mg', 'Abbott', 'Ascorbic Acid', 'Supplements', 90.00, 80.00, 55.00, 200, 20, 4000, 300, 'Immunity booster.', 'vitc.png', 'ACTIVE');
