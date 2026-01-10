
-- Mock Data for Hum Hena App

-- 1. Create Users
-- Customers
INSERT INTO `users` (`id`, `phone`, `first_name`, `last_name`, `email`, `role`) VALUES
('CUST001', '+919876543210', 'Ravi', 'Kumar', 'ravi.k@example.com', 'CUSTOMER'),
('CUST002', '+919876543211', 'Priya', 'Sharma', 'priya.s@example.com', 'CUSTOMER');

-- Workers
INSERT INTO `users` (`id`, `phone`, `first_name`, `last_name`, `email`, `role`) VALUES
('WORK001', '+918888888801', 'Suresh', 'Singh', 'suresh.p@example.com', 'WORKER'),
('WORK002', '+918888888802', 'Mina', 'Devi', 'mina.e@example.com', 'WORKER'),
('WORK003', '+918888888803', 'Amit', 'Patel', 'amit.m@example.com', 'WORKER'),
('WORK004', '+918888888804', 'Deepa', 'Gupta', 'deepa.c@example.com', 'WORKER'),
('WORK005', '+918888888805', 'Rajesh', 'Verma', 'rajesh.f@example.com', 'WORKER');

-- Admin
INSERT INTO `users` (`id`, `phone`, `first_name`, `last_name`, `email`, `role`) VALUES
('ADMIN001', '+919999999999', 'Admin', 'User', 'admin@humhena.com', 'ADMIN');

-- 2. Create Worker Profiles
INSERT INTO `workers` (`user_id`, `skill_category`, `hourly_rate`, `bio`, `is_online`, `latitude`, `longitude`, `verification_status`, `id_proof_url`, `rating_avg`)
VALUES
  ('WORK001', 'Plumber', 250.00, '5 years of experience in residential plumbing.', TRUE, 28.6139, 77.2090, 'verified', 'http://example.com/id/suresh.jpg', 4.5),
  ('WORK002', 'Electrician', 300.00, 'Certified electrician for all your wiring needs.', TRUE, 28.6150, 77.2100, 'verified', 'http://example.com/id/mina.jpg', 4.8),
  ('WORK003', 'Carpenter', 200.00, 'Custom furniture and repairs.', FALSE, 28.6200, 77.2200, 'pending', 'http://example.com/id/amit.jpg', 4.2),
  ('WORK004', 'Cleaner', 150.00, 'Thorough and reliable home cleaning services.', TRUE, 28.6250, 77.2150, 'verified', 'http://example.com/id/deepa.jpg', 4.9),
  ('WORK005', 'Appliance Repair', 275.00, 'Fixing all major home appliances.', FALSE, 28.6300, 77.2300, 'rejected', 'http://example.com/id/rajesh.jpg', 3.9);

-- 3. Set Admin Configuration
INSERT INTO `admin_config` (`key`, `value`) VALUES
('commission_rate', '0.10'), -- 10% commission
('emergency_contact', '+91100');

-- 4. Add CMS Content
INSERT INTO `cms` (`page_slug`, `title`, `content`) VALUES
('privacy-policy', 'Privacy Policy', '<h1>Privacy Policy</h1><p>Your data is safe with us. We do not share your personal information.</p>'),
('terms-of-service', 'Terms of Service', '<h1>Terms of Service</h1><p>By using Hum Hena, you agree to our terms...</p>');
