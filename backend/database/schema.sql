CREATE DATABASE IF NOT EXISTS violetstore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE violetstore;

CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE products (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  price INT UNSIGNED NOT NULL,
  stock INT NULL DEFAULT NULL,
  image_url VARCHAR(500) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Initial prototype catalogue: the Robux packages already shown in the frontend.
INSERT INTO products (name, description, price, stock) VALUES
  ('80 Robux', 'Top up Robux untuk akun Roblox kamu.', 11000, NULL),
  ('160 Robux', 'Top up Robux untuk akun Roblox kamu.', 22500, NULL),
  ('400 Robux', 'Top up Robux untuk akun Roblox kamu.', 56000, NULL),
  ('800 Robux', 'Top up Robux untuk akun Roblox kamu.', 112000, NULL),
  ('1700 Robux', 'Top up Robux untuk akun Roblox kamu.', 238000, NULL),
  ('4500 Robux', 'Top up Robux untuk akun Roblox kamu.', 630000, NULL);

CREATE TABLE orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(20) NOT NULL UNIQUE,
  user_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  product_name VARCHAR(150) NOT NULL,
  price INT UNSIGNED NOT NULL,
  quantity SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  total INT UNSIGNED NOT NULL,
  game_username VARCHAR(100) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  status ENUM('pending', 'processed', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

-- Create an admin after import with a PHP-generated password hash:
-- INSERT INTO users (name,email,password_hash,role) VALUES ('Administrator','admin@violetstore.test','PASSWORD_HASH','admin');
