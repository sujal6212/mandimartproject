-- ============================================================
-- MANDIMART - AGRICULTURAL MARKETPLACE DATABASE SCHEMA
-- Database: mandimart
-- Compatible with MySQL 5.7+ / MySQL 8.0+ / MariaDB / phpMyAdmin
-- ============================================================

CREATE DATABASE IF NOT EXISTS `mandimart` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `mandimart`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `transactions`;
DROP TABLE IF EXISTS `chatbot_messages`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `inquiries`;
DROP TABLE IF EXISTS `bids`;
DROP TABLE IF EXISTS `auctions`;
DROP TABLE IF EXISTS `mandi_prices`;
DROP TABLE IF EXISTS `mandis`;
DROP TABLE IF EXISTS `crops`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- 1. Table: users
-- ------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(20) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('farmer', 'buyer', 'admin') NOT NULL DEFAULT 'farmer',
  `address` TEXT NULL,
  `state` VARCHAR(100) NULL,
  `district` VARCHAR(100) NULL,
  `village` VARCHAR(100) NULL,
  `pincode` VARCHAR(10) NULL,
  `business_type` VARCHAR(150) NULL,
  `contact_person` VARCHAR(150) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 2. Table: crops
-- ------------------------------------------------------------
CREATE TABLE `crops` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `farmer_id` INT NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `quantity` DECIMAL(10,2) NOT NULL,
  `unit` VARCHAR(20) NOT NULL DEFAULT 'Quintal',
  `grade` VARCHAR(10) NOT NULL DEFAULT 'A',
  `expected_price` DECIMAL(10,2) NOT NULL,
  `image` VARCHAR(255) NULL,
  `location` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `rating` DECIMAL(2,1) DEFAULT 4.8,
  `status` ENUM('active', 'sold', 'hidden') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`farmer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_crop_name` (`name`),
  INDEX `idx_crop_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 3. Table: mandis
-- ------------------------------------------------------------
CREATE TABLE `mandis` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `location` VARCHAR(200) NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `district` VARCHAR(100) NOT NULL,
  `latitude` DECIMAL(10,6) NOT NULL,
  `longitude` DECIMAL(10,6) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_mandi_location` (`state`, `district`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 4. Table: mandi_prices
-- ------------------------------------------------------------
CREATE TABLE `mandi_prices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `mandi_id` INT NOT NULL,
  `crop_name` VARCHAR(100) NOT NULL,
  `min_price` DECIMAL(10,2) NOT NULL,
  `max_price` DECIMAL(10,2) NOT NULL,
  `average_price` DECIMAL(10,2) NOT NULL,
  `price_date` DATE NOT NULL,
  `trend` ENUM('up', 'down', 'stable') DEFAULT 'stable',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`mandi_id`) REFERENCES `mandis`(`id`) ON DELETE CASCADE,
  INDEX `idx_price_crop` (`crop_name`, `price_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 5. Table: auctions
-- ------------------------------------------------------------
CREATE TABLE `auctions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `farmer_id` INT NOT NULL,
  `crop_id` INT NULL,
  `crop_name` VARCHAR(150) NOT NULL,
  `quantity` DECIMAL(10,2) NOT NULL,
  `unit` VARCHAR(20) NOT NULL DEFAULT 'Quintal',
  `grade` VARCHAR(10) NOT NULL DEFAULT 'A',
  `base_price` DECIMAL(10,2) NOT NULL,
  `current_bid` DECIMAL(10,2) NOT NULL,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `status` ENUM('active', 'ended', 'cancelled') DEFAULT 'active',
  `winner_id` INT NULL,
  `image` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `location` VARCHAR(150) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`farmer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`winner_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_auction_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 6. Table: bids
-- ------------------------------------------------------------
CREATE TABLE `bids` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `auction_id` INT NOT NULL,
  `buyer_id` INT NOT NULL,
  `bid_amount` DECIMAL(10,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`auction_id`) REFERENCES `auctions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_bid_amount` (`auction_id`, `bid_amount`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 7. Table: inquiries
-- ------------------------------------------------------------
CREATE TABLE `inquiries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `buyer_id` INT NOT NULL,
  `farmer_id` INT NOT NULL,
  `crop_id` INT NOT NULL,
  `quantity` DECIMAL(10,2) NOT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`farmer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`crop_id`) REFERENCES `crops`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 8. Table: notifications
-- ------------------------------------------------------------
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_read` (`user_id`, `is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 9. Table: chatbot_messages
-- ------------------------------------------------------------
CREATE TABLE `chatbot_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `message` TEXT NOT NULL,
  `response` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 10. Table: transactions
-- ------------------------------------------------------------
CREATE TABLE `transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `auction_id` INT NULL,
  `farmer_id` INT NOT NULL,
  `buyer_id` INT NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `status` ENUM('completed', 'pending', 'refunded') DEFAULT 'completed',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`farmer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- DEMO SEED DATA (Password for all demo accounts: password123)
-- bcrypt hash for 'password123': $2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm
-- ============================================================

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `role`, `address`, `state`, `district`, `village`, `pincode`, `business_type`, `contact_person`) VALUES
(1, 'Ramesh Kumar', 'ramesh.farmer@mandimart.in', '9876543210', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'farmer', 'VPO Taraori, Near Canal Road', 'Haryana', 'Karnal', 'Taraori', '132116', NULL, NULL),
(2, 'Sunita Devi', 'sunita.devi@mandimart.in', '9876543211', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'farmer', 'Gannaur Highway, Sector 4', 'Haryana', 'Sonipat', 'Gannaur', '131101', NULL, NULL),
(3, 'Gurpreet Singh', 'gurpreet.singh@mandimart.in', '9876543212', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'farmer', 'Farm House No. 12, GT Road', 'Punjab', 'Ludhiana', 'Sahnewal', '141120', NULL, NULL),
(4, 'Delhi Fresh Agro Wholesale', 'buyer.rajesh@delhifresh.com', '9811223344', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'buyer', 'Shed No. 14, Azadpur Subzi Mandi', 'Delhi', 'North Delhi', NULL, '110033', 'Wholesaler / Commission Agent', 'Rajesh Gupta'),
(5, 'KisanDirect Supply Chain Pvt Ltd', 'procurement@kisandirect.in', '9822334455', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'buyer', 'Plot 45, Phase 2, Udyog Vihar', 'Haryana', 'Gurugram', NULL, '122016', 'B2B Retailer & Food Processing', 'Priya Sharma'),
(6, 'MandiMart National Admin', 'admin@mandimart.gov.in', '9900112233', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'admin', 'Krishi Bhawan, Department of Agriculture', 'Delhi', 'New Delhi', NULL, '110001', 'Marketplace Administrator', 'Head Officer');

INSERT INTO `mandis` (`id`, `name`, `location`, `state`, `district`, `latitude`, `longitude`) VALUES
(1, 'Azadpur Mandi', 'Azadpur, New Delhi', 'Delhi', 'North Delhi', 28.715300, 77.177000),
(2, 'Ghazipur Mandi', 'Ghazipur, East Delhi Border', 'Delhi', 'East Delhi', 28.625600, 77.329800),
(3, 'Keshopur Mandi', 'Outer Ring Road, Vikaspuri', 'Delhi', 'West Delhi', 28.647300, 77.086200),
(4, 'Okhla Mandi', 'Near Okhla Railway Station', 'Delhi', 'South East Delhi', 28.535500, 77.275500),
(5, 'Narela Mandi', 'Anaj Mandi, Narela', 'Delhi', 'North West Delhi', 28.852400, 77.093400),
(6, 'Karnal Grain & Subzi Mandi', 'Railway Road, Karnal', 'Haryana', 'Karnal', 29.685700, 76.990500);

INSERT INTO `mandi_prices` (`id`, `mandi_id`, `crop_name`, `min_price`, `max_price`, `average_price`, `price_date`, `trend`) VALUES
(1, 1, 'Tomato', 1200.00, 1800.00, 1500.00, CURDATE(), 'up'),
(2, 2, 'Tomato', 1100.00, 1700.00, 1400.00, CURDATE(), 'stable'),
(3, 3, 'Tomato', 1250.00, 1750.00, 1520.00, CURDATE(), 'up'),
(4, 4, 'Tomato', 1150.00, 1650.00, 1420.00, CURDATE(), 'down'),
(5, 1, 'Onion', 2200.00, 2900.00, 2550.00, CURDATE(), 'up'),
(6, 2, 'Onion', 2150.00, 2800.00, 2480.00, CURDATE(), 'stable'),
(7, 1, 'Potato', 1400.00, 1950.00, 1680.00, CURDATE(), 'stable'),
(8, 6, 'Wheat', 2275.00, 2450.00, 2360.00, CURDATE(), 'up'),
(9, 1, 'Brinjal', 1300.00, 1900.00, 1600.00, CURDATE(), 'down'),
(10, 1, 'Cauliflower', 1800.00, 2600.00, 2200.00, CURDATE(), 'up'),
(11, 1, 'Carrot', 1500.00, 2200.00, 1850.00, CURDATE(), 'stable');

INSERT INTO `crops` (`id`, `farmer_id`, `name`, `quantity`, `unit`, `grade`, `expected_price`, `image`, `location`, `description`, `rating`, `status`) VALUES
(1, 1, 'Tomato (Hybrid Desi Red)', 65.00, 'Quintal', 'A+', 1550.00, 'uploads/crops/tomato.jpg', 'Karnal, Haryana', 'Freshly harvested vine-ripened tomatoes, uniform size, excellent firmness, ideal for wholesale.', 4.9, 'active'),
(2, 2, 'Red Onion (Nashik Quality)', 120.00, 'Quintal', 'A', 2450.00, 'uploads/crops/onion.jpg', 'Sonipat, Haryana', 'Dry cured medium-large red onions with tight outer skin. Well-aerated storage, zero sprouting.', 4.8, 'active'),
(3, 3, 'Potato (Kufri Jyoti Clean)', 200.00, 'Quintal', 'A', 1650.00, 'uploads/crops/potato.jpg', 'Ludhiana, Punjab', 'Premium Kufri Jyoti table potatoes. Clean oval tubers, low sugar content, graded and packed in breathable 50kg bags.', 4.7, 'active'),
(4, 1, 'Sharbati Premium Wheat', 150.00, 'Quintal', 'A+', 2380.00, 'uploads/crops/wheat.jpg', 'Karnal, Haryana', 'Golden luster Sharbati grain with low moisture (<10%), double machine cleaned, test weight 81 kg/hl.', 4.9, 'active'),
(5, 2, 'Purple Round Brinjal', 40.00, 'Quintal', 'B', 1450.00, 'uploads/crops/brinjal.jpg', 'Sonipat, Haryana', 'Glossy purple eggplants harvested fresh in the morning. Spotless skin, packed in standard crates.', 4.6, 'active'),
(6, 3, 'Snowball Cauliflower', 80.00, 'Quintal', 'A', 2150.00, 'uploads/crops/cauliflower.jpg', 'Ludhiana, Punjab', 'Compact pure white heads wrapped in crisp protective jacket leaves. Free from browning or hollow stem.', 4.8, 'active'),
(7, 1, 'Fresh Orange Carrot (Desi Sweet)', 90.00, 'Quintal', 'A', 1780.00, 'uploads/crops/carrot.jpg', 'Karnal, Haryana', 'Sweet, crisp, washed red-orange carrots. Uniform taper, no root splitting or core woodiness.', 4.7, 'active');

INSERT INTO `auctions` (`id`, `farmer_id`, `crop_id`, `crop_name`, `quantity`, `unit`, `grade`, `base_price`, `current_bid`, `start_time`, `end_time`, `status`, `winner_id`, `image`, `description`, `location`) VALUES
(1, 1, 1, 'Tomato (Hybrid Desi Red)', 50.00, 'Quintal', 'A+', 1400.00, 1620.00, DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_ADD(NOW(), INTERVAL 28 HOUR), 'active', 4, 'uploads/crops/tomato.jpg', 'Lot of 50 Quintal Grade A+ field tomatoes. Minimum bid increment ₹20/Quintal.', 'Karnal, Haryana'),
(2, 3, 3, 'Potato (Kufri Jyoti)', 100.00, 'Quintal', 'A', 1500.00, 1710.00, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 14 HOUR), 'active', 5, 'uploads/crops/potato.jpg', 'Clean washed table potatoes in 50kg standard jute bags. Fast dispatch available.', 'Ludhiana, Punjab'),
(3, 2, 2, 'Red Onion (Grade A)', 75.00, 'Quintal', 'A', 2200.00, 2420.00, DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_ADD(NOW(), INTERVAL 42 HOUR), 'active', 4, 'uploads/crops/onion.jpg', 'Sun-cured premium grade red onions. Low moisture, immediate dispatch ready.', 'Sonipat, Haryana');

INSERT INTO `bids` (`id`, `auction_id`, `buyer_id`, `bid_amount`, `created_at`) VALUES
(1, 1, 5, 1450.00, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(2, 1, 4, 1540.00, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(3, 1, 5, 1580.00, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(4, 1, 4, 1620.00, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(5, 2, 4, 1550.00, DATE_SUB(NOW(), INTERVAL 18 HOUR)),
(6, 2, 5, 1710.00, DATE_SUB(NOW(), INTERVAL 6 HOUR));

INSERT INTO `inquiries` (`id`, `buyer_id`, `farmer_id`, `crop_id`, `quantity`, `message`, `status`, `created_at`) VALUES
(1, 4, 1, 1, 40.00, 'Hello Ramesh ji, we are interested in lifting 40 Quintals tomorrow morning directly from Karnal.', 'accepted', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 5, 2, 2, 80.00, 'Namaste Sunita ji, we need 80 Quintal onions for our Gurugram distribution center. Can we inspect on Friday?', 'pending', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(3, 4, 3, 3, 150.00, 'Gurpreet ji, looking for regular supply of Kufri Jyoti. Please confirm freight charges to Azadpur.', 'pending', DATE_SUB(NOW(), INTERVAL 2 HOUR));

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `is_read`, `created_at`) VALUES
(1, 1, 'New Bid Received! 🏷️', 'Delhi Fresh Agro Wholesale placed a bid of ₹1,620/Quintal on your Tomato auction.', 0, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(2, 1, 'Buyer Inquiry Received', 'Delhi Fresh Agro Wholesale sent an inquiry for 40 Quintal Tomatoes.', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 4, 'Outbid Alert', 'Your bid on Potato Auction #2 was surpassed by KisanDirect Supply Chain (₹1,710/Quintal).', 0, DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(4, 6, 'New Crop Listing Registered', 'Ramesh Kumar listed Fresh Orange Carrot (90 Quintals) in Karnal.', 0, DATE_SUB(NOW(), INTERVAL 8 HOUR));

INSERT INTO `transactions` (`id`, `auction_id`, `farmer_id`, `buyer_id`, `amount`, `status`, `created_at`) VALUES
(1, 1, 1, 4, 81000.00, 'completed', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 2, 3, 5, 118000.00, 'completed', DATE_SUB(NOW(), INTERVAL 7 DAY));
