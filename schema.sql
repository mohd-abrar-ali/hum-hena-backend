-- Use this schema to set up your MySQL database.

-- 1. Users Table (Customers, Workers, Admins)
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY, -- Corresponds to Firebase Auth UID
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email VARCHAR(100) UNIQUE,
  role ENUM('CUSTOMER', 'WORKER', 'ADMIN') DEFAULT 'CUSTOMER',
  status ENUM('active', 'suspended') DEFAULT 'active',
  language VARCHAR(10) DEFAULT 'en',
  fcm_token TEXT,
  avatar_url TEXT
);

-- 2. Workers Table (Extended Profile for Experts)
CREATE TABLE workers (
  user_id VARCHAR(255) PRIMARY KEY, -- Foreign key to users.id
  skill_category VARCHAR(100),
  hourly_rate DECIMAL(10, 2),
  bio TEXT,
  is_online BOOLEAN DEFAULT false,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  id_proof_url TEXT,
  wallet_balance DECIMAL(10, 2) DEFAULT 0,
  rating_avg DECIMAL(3, 2) DEFAULT 0.00,
  review_count INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Jobs Table
CREATE TABLE jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id VARCHAR(255) NOT NULL,
  worker_id VARCHAR(255), -- Can be null for broadcasted jobs
  skill_needed VARCHAR(100) NOT NULL,
  status ENUM('OPEN', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'OPEN',
  price DECIMAL(10, 2),
  otp_start VARCHAR(4),
  otp_end VARCHAR(4),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  is_paid BOOLEAN DEFAULT false,
  platform_fee DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Portfolio Table
CREATE TABLE portfolio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  worker_id VARCHAR(255) NOT NULL,
  media_type ENUM('image', 'audio', 'video'),
  url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (worker_id) REFERENCES workers(user_id) ON DELETE CASCADE
);

-- 5. Transactions Table
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  worker_id VARCHAR(255) NOT NULL,
  job_id INT,
  amount DECIMAL(10, 2) NOT NULL,
  type ENUM('CREDIT', 'DEBIT') NOT NULL,
  status ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
  reference_id VARCHAR(255), -- For payment gateway reference
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (worker_id) REFERENCES workers(user_id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL
);

-- 6. Admin Configuration Table
CREATE TABLE admin_config (
  `key` VARCHAR(50) PRIMARY KEY,
  `value` TEXT
);

-- 7. Ads Table
CREATE TABLE ads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url TEXT NOT NULL,
    target_city VARCHAR(100),
    position ENUM('TOP', 'BOTTOM') NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. CMS Table
CREATE TABLE cms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_slug VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'privacy-policy', 'terms-of-service'
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 9. Reviews Table (Implied by rating/review_count)
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    customer_id VARCHAR(255) NOT NULL,
    worker_id VARCHAR(255) NOT NULL,
    rating INT NOT NULL, -- 1 to 5
    comment TEXT,
    media_url TEXT, -- For photo/audio reviews
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (worker_id) REFERENCES workers(user_id)
);

-- 10. Withdrawal Requests Table
CREATE TABLE withdrawal_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    FOREIGN KEY (worker_id) REFERENCES workers(user_id)
);
