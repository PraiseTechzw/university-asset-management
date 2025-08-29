-- Insert sample assets (only run after users are created and confirmed)
INSERT INTO public.assets (asset_code, name, category, brand, model, serial_number, purchase_date, purchase_price, warranty_expiry, condition, status, location, description) VALUES
('CUT-PROJ-001', 'Epson PowerLite Projector', 'projector', 'Epson', 'PowerLite 1795F', 'EP1795F001', '2023-01-15', 899.99, '2026-01-15', 'excellent', 'available', 'Lecture Hall A', 'Full HD wireless projector for presentations'),
('CUT-PROJ-002', 'BenQ Smart Projector', 'projector', 'BenQ', 'MW632ST', 'BQ632ST002', '2023-03-20', 749.99, '2026-03-20', 'good', 'available', 'Conference Room B', 'Short throw smart projector'),
('CUT-LAP-001', 'Dell Latitude Laptop', 'laptop', 'Dell', 'Latitude 5520', 'DL5520001', '2023-02-10', 1299.99, '2026-02-10', 'excellent', 'available', 'IT Department', 'Business laptop with Windows 11'),
('CUT-LAP-002', 'HP EliteBook Laptop', 'laptop', 'HP', 'EliteBook 840 G8', 'HP840G8002', '2023-04-05', 1199.99, '2026-04-05', 'good', 'issued', 'Staff Office', 'Professional laptop for staff use'),
('CUT-DESK-001', 'Dell OptiPlex Desktop', 'desktop', 'Dell', 'OptiPlex 7090', 'DO7090001', '2023-01-25', 899.99, '2026-01-25', 'excellent', 'available', 'Computer Lab 1', 'Desktop computer for lab use');
