-- NOTE: Use all_india_seed.sql (in project root) instead -- it has
-- all stations (Mumbai + Delhi + all-India) and uses INSERT IGNORE
-- so it can be run safely even if data already exists.

-- ============================================================
-- Mumbai stations (original 5)
-- ============================================================

INSERT INTO stations (id, name, address, city, latitude, longitude, distance_km, rating, created_at) VALUES
('stn_001', 'Bandra Kurla Power Hub', 'BKC Connector Road, Bandra East', 'Mumbai', 19.076, 72.870, 1.2, 4.6, NOW()),
('stn_002', 'Lower Parel Charge Point', 'Senapati Bapat Marg, Lower Parel', 'Mumbai', 18.997, 72.826, 3.8, 4.3, NOW()),
('stn_003', 'Powai Lakeside Station', 'Hiranandani Gardens, Powai', 'Mumbai', 19.120, 72.905, 6.4, 4.8, NOW()),
('stn_004', 'Andheri Highway Fast Charge', 'Western Express Highway, Andheri East', 'Mumbai', 19.114, 72.857, 5.1, 4.1, NOW()),
('stn_005', 'Worli Sea Face Chargers', 'Dr Annie Besant Road, Worli', 'Mumbai', 19.000, 72.812, 2.9, 4.5, NOW());

INSERT INTO station_amenities (station_id, amenity) VALUES
('stn_001', 'Cafe'), ('stn_001', 'Restroom'), ('stn_001', 'WiFi'),
('stn_002', 'Restroom'), ('stn_002', 'Parking'),
('stn_003', 'Cafe'), ('stn_003', 'WiFi'), ('stn_003', 'Lounge'),
('stn_004', 'Restroom'), ('stn_004', 'Convenience Store'),
('stn_005', 'Cafe'), ('stn_005', 'Restroom');

INSERT INTO ports (id, station_id, type, power_kw, price_per_kwh, status, wait_mins) VALUES
('p1', 'stn_001', 'DC Fast', 60, 18, 'available', 0),
('p2', 'stn_001', 'DC Fast', 60, 18, 'available', 0),
('p3', 'stn_001', 'AC Type 2', 22, 12, 'waiting', 15),
('p4', 'stn_001', 'AC Type 2', 22, 12, 'full', 0),
('p1', 'stn_002', 'DC Fast', 50, 19, 'waiting', 25),
('p2', 'stn_002', 'DC Fast', 50, 19, 'full', 0),
('p3', 'stn_002', 'AC Type 2', 22, 11, 'full', 0),
('p1', 'stn_003', 'DC Fast', 90, 20, 'available', 0),
('p2', 'stn_003', 'AC Type 2', 22, 12, 'available', 0),
('p3', 'stn_003', 'AC Type 2', 22, 12, 'available', 0),
('p1', 'stn_004', 'DC Fast', 120, 21, 'full', 0),
('p2', 'stn_004', 'DC Fast', 120, 21, 'waiting', 10),
('p1', 'stn_005', 'AC Type 2', 22, 12, 'available', 0),
('p2', 'stn_005', 'AC Type 2', 22, 12, 'waiting', 8),
('p3', 'stn_005', 'DC Fast', 60, 18, 'available', 0);

-- ============================================================
-- Delhi NCR stations (reduced set)
-- ============================================================

INSERT INTO stations (id, name, address, city, latitude, longitude, distance_km, rating, created_at) VALUES
('STATIC12', 'GensolCharge NDSE Grid', 'NDSE Grid, BRPL South Extension', 'Delhi', 28.568238, 77.219666, 4.1, 3.5, NOW()),
('STATIC17', 'BluSmart Nehru Place', 'BSES Bhawan, Nehru Place, New Delhi 110048', 'Delhi', 28.549427, 77.254636, 5.7, 3.5, NOW()),
('STATIC18', 'Smart E Uttam Nagar', 'Uttam Nagar East metro station', 'Delhi', 28.626722, 77.065972, 4.2, 3.5, NOW()),
('STATIC19', 'EEE Mehrauli', 'Mukteshwar dham Andheriya bagh, mehrauli', 'Delhi', 28.510291, 77.171653, 1.5, 3.5, NOW()),
('STATIC20', 'BluSmart Kapashera', 'Plot 24, Behind Fun & Food Village, Kapashera, New Delhi 110097', 'Delhi', 28.522486, 77.089232, 4.4, 3.5, NOW()),
('STATIC28', 'HPCL Mahipalpur', 'HP Pump, Mahipalpur-Gurgaon road NH-8, Mahipalpur, Delhi 110037', 'Delhi', 28.544785, 77.121449, 6.2, 3.5, NOW()),
('STATIC29', 'BluSmart IGI Airport', 'Multi Level Car Parking, Level 2, Indira Gandhi International Airport, New Delhi', 'Delhi', 28.55476, 77.08831, 12.2, 3.5, NOW()),
('STATIC30', 'BSES New Delhi Railway Station', 'New Delhi Railway Station, Pahar Ganj', 'Delhi', 28.6453, 77.2126, 4.9, 3.5, NOW()),
('STATIC38', 'PlugNgo Patparganj', 'Plug & Go, Near Swati Appt, Narwana Road, Patparganj', 'Delhi', 28.6215, 77.2935, 6.9, 3.5, NOW()),
('STATIC39', 'TPDDL Motinagar', 'Block B, No. 57, Rama Road, Motinagar', 'Delhi', 28.660575, 77.153253, 0.6, 3.5, NOW()),
('STATIC40', 'TPDDL Kingsway Camp', 'KINGSWAY CAMP', 'Delhi', 28.696585, 77.211694, 3.8, 3.5, NOW()),
('EESL359', 'EESL Khan Market', 'NDMC Parking, Khan Market, New Delhi 110003', 'Delhi', 28.600324, 77.226883, 10.3, 3.5, NOW()),
('EESL369', 'EESL Sarojini Nagar', 'NDMC Parking, Sarojini Nagar Market, New Delhi 110023', 'Delhi', 28.577259, 77.19692, 10.0, 3.5, NOW()),
('EESL420', 'EESL Lodhi Gardens', 'NDMC Parking, Gate No. 1, Lodhi Gardens, Lodhi Estate, New Delhi 110003', 'Delhi', 28.590311, 77.220163, 3.2, 3.5, NOW()),
('EESL422', 'EESL Dilli Haat', 'NDMC Parking, Dilli Haat, West Kidwai Nagar, New Delhi 110023', 'Delhi', 28.572793, 77.208662, 4.8, 3.5, NOW()),
('EESL555', 'EESL Greater Kailash I', 'Block N, Greater Kailash I, New Delhi', 'Delhi', 28.556678, 77.232601, 1.0, 3.5, NOW()),
('EESL577', 'EESL Hauz Khas SDA Market', 'SDMC Parking, SDA Market, Hauz Khas, New Delhi 110016', 'Delhi', 28.546273, 77.19711, 2.4, 3.5, NOW()),
('EESL630', 'EESL Vasant Vihar', 'SDMC Parking, Near Gold Gym, PVR Priya, Vasant Vihar, New Delhi', 'Delhi', 28.558244, 77.16444, 9.4, 3.5, NOW()),
('EESL631', 'EESL Lajpat Nagar', 'SDMC Parking, Feroze Gandhi Road, Lajpat Nagar, New Delhi', 'Delhi', 28.56793, 77.242612, 4.2, 3.5, NOW()),
('EESL429', 'EESL Connaught Place F-Block', 'Opposite IVORY Mart, F Block, Inner Circle, Connaught Place, New Delhi 110001', 'Delhi', 28.63388, 77.221078, 9.5, 3.5, NOW()),
('REVBOLT_000476', 'REVOS Pitampura', '142 Deepali Enclave, Pitampura, Delhi 110034', 'Delhi', 28.694492, 77.118912, 1.1, 3.5, NOW()),
('REVBOLT_003352', 'REVOS Lajpat Nagar', 'E-12, Ground Floor, Lajpat Nagar 1, New Delhi 110024', 'Delhi', 28.573348, 77.237226, 8.0, 3.5, NOW()),
('REVBOLT_003675', 'REVOS Vasant Kunj', 'Market, Kishan Garh, Vasant Kunj, New Delhi 110070', 'Delhi', 28.514801, 77.164351, 10.0, 3.5, NOW()),
('REVBOLT_004758', 'REVOS Laxmi Nagar', 'G57 Vikas Marg, Laxmi Nagar, Delhi 110092', 'Delhi', 28.632799, 77.280752, 9.3, 3.5, NOW()),
('REVBOLT_00009635', 'REVOS Malviya Nagar', 'H-6/9, Malviya Nagar, New Delhi 110017', 'Delhi', 28.530491, 77.209839, 6.2, 3.5, NOW());

INSERT INTO station_amenities (station_id, amenity) VALUES
('STATIC12', 'Parking'), ('STATIC12', 'Restroom'),
('STATIC17', 'Parking'),
('STATIC18', 'Parking'), ('STATIC18', 'Restroom'),
('STATIC19', 'Parking'), ('STATIC19', 'Restroom'),
('STATIC20', 'Parking'),
('STATIC28', 'Parking'), ('STATIC28', 'Cafe'),
('STATIC29', 'Parking'), ('STATIC29', 'WiFi'),
('STATIC30', 'Parking'),
('STATIC38', 'Parking'), ('STATIC38', 'WiFi'),
('STATIC39', 'Parking'),
('STATIC40', 'Parking'),
('EESL359', 'Parking'), ('EESL359', 'Restroom'),
('EESL369', 'Parking'),
('EESL420', 'Parking'), ('EESL420', 'Restroom'),
('EESL422', 'Parking'), ('EESL422', 'Restroom'), ('EESL422', 'Cafe'),
('EESL555', 'Parking'), ('EESL555', 'Restroom'), ('EESL555', 'WiFi'),
('EESL577', 'Parking'), ('EESL577', 'Restroom'),
('EESL630', 'Parking'),
('EESL631', 'Parking'),
('EESL429', 'Parking'), ('EESL429', 'Restroom'),
('REVBOLT_000476', 'Parking'),
('REVBOLT_003352', 'Parking'),
('REVBOLT_003675', 'Parking'),
('REVBOLT_004758', 'Parking'),
('REVBOLT_00009635', 'Parking');

INSERT INTO ports (id, station_id, type, power_kw, price_per_kwh, status, wait_mins) VALUES
('p1', 'STATIC12', 'DC Fast', 15, 18, 'available', 0),
('p2', 'STATIC12', 'DC Fast', 15, 18, 'available', 0),
('p1', 'STATIC17', 'DC Fast', 15, 18, 'available', 0),
('p1', 'STATIC18', 'AC Type 2', 3, 10, 'available', 0),
('p2', 'STATIC18', 'AC Type 2', 3, 10, 'available', 0),
('p3', 'STATIC18', 'AC Type 2', 3, 10, 'available', 0),
('p1', 'STATIC19', 'DC Fast', 15, 18, 'available', 0),
('p2', 'STATIC19', 'DC Fast', 15, 18, 'available', 0),
('p3', 'STATIC19', 'DC Fast', 15, 18, 'available', 0),
('p1', 'STATIC20', 'AC Type 2', 3, 10, 'available', 0),
('p2', 'STATIC20', 'AC Type 2', 3, 10, 'available', 0),
('p41', 'STATIC20', 'DC Fast', 30, 18, 'available', 0),
('p42', 'STATIC20', 'DC Fast', 30, 18, 'available', 0),
('p1', 'STATIC28', 'DC Fast', 15, 18, 'available', 0),
('p1', 'STATIC29', 'AC Type 2', 3, 10, 'available', 0),
('p8', 'STATIC29', 'DC Fast', 20, 18, 'available', 0),
('p9', 'STATIC29', 'DC Fast', 20, 18, 'available', 0),
('p1', 'STATIC30', 'DC Fast', 15, 18, 'available', 0),
('p2', 'STATIC30', 'DC Fast', 15, 18, 'available', 0),
('p1', 'STATIC38', 'DC Fast', 15, 18, 'available', 0),
('p3', 'STATIC38', 'DC Fast', 142, 21, 'available', 0),
('p1', 'STATIC39', 'DC Fast', 50, 20, 'available', 0),
('p1', 'STATIC40', 'DC Fast', 15, 18, 'available', 0),
('p1', 'EESL359', 'DC Fast', 15, 10, 'available', 0),
('p2', 'EESL359', 'DC Fast', 15, 10, 'available', 0),
('p1', 'EESL369', 'DC Fast', 15, 10, 'available', 0),
('p1', 'EESL420', 'DC Fast', 15, 10, 'available', 0),
('p2', 'EESL420', 'DC Fast', 15, 10, 'available', 0),
('p1', 'EESL422', 'DC Fast', 15, 10, 'available', 0),
('p2', 'EESL422', 'DC Fast', 22, 19, 'available', 0),
('p3', 'EESL422', 'DC Fast', 22, 19, 'available', 0),
('p6', 'EESL422', 'AC Type 2', 22, 19, 'available', 0),
('p7', 'EESL422', 'AC Type 2', 22, 19, 'available', 0),
('p1', 'EESL555', 'DC Fast', 15, 10, 'available', 0),
('p2', 'EESL555', 'DC Fast', 15, 10, 'available', 0),
('p3', 'EESL555', 'AC Type 2', 22, 19, 'available', 0),
('p1', 'EESL577', 'DC Fast', 15, 10, 'available', 0),
('p1', 'EESL630', 'DC Fast', 15, 10, 'available', 0),
('p2', 'EESL630', 'DC Fast', 15, 10, 'available', 0),
('p1', 'EESL631', 'DC Fast', 15, 10, 'available', 0),
('p1', 'EESL429', 'DC Fast', 15, 9.5, 'available', 0),
('p1', 'REVBOLT_000476', 'AC Type 2', 3, 0, 'available', 0),
('p1', 'REVBOLT_003352', 'AC Type 2', 3, 0, 'available', 0),
('p1', 'REVBOLT_003675', 'AC Type 2', 3, 0, 'available', 0),
('p1', 'REVBOLT_004758', 'AC Type 2', 3, 0, 'available', 0),
('p1', 'REVBOLT_00009635', 'AC Type 2', 3, 0, 'available', 0);
