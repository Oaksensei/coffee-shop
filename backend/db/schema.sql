
USE coffee_shop;

-- 1) ROLES & USERS (auth)
CREATE TABLE roles (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE users (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(100) NULL,
  role_id       INT NOT NULL,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    DATETIME NULL,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 2) SUPPLIERS
CREATE TABLE suppliers (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,
  phone      VARCHAR(50)  NULL,
  email      VARCHAR(100) NULL,
  address    VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL
) ENGINE=InnoDB;

-- 3) INGREDIENTS (ใช้ stock_qty, cost_per_unit)
CREATE TABLE ingredients (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL UNIQUE,
  unit          ENUM('g','ml','pc') NOT NULL,
  stock_qty     DECIMAL(12,2) NOT NULL DEFAULT 0,
  reorder_point DECIMAL(12,2) NOT NULL DEFAULT 0,
  cost_per_unit DECIMAL(12,4) NULL,
  supplier_id   BIGINT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    DATETIME NULL,
  CONSTRAINT fk_ing_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4) PRODUCTS (มี description, status, unique (name,category))
CREATE TABLE products (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  category    ENUM('coffee','tea','bakery','other') NOT NULL DEFAULT 'coffee',
  price       DECIMAL(12,2) NOT NULL DEFAULT 0,
  status      ENUM('active','inactive') NOT NULL DEFAULT 'active',
  image_url   VARCHAR(255) NULL,
  description TEXT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at  DATETIME NULL,
  UNIQUE KEY uq_product_name_cat (name, category),
  KEY idx_products_category_status (category, status)
) ENGINE=InnoDB;

-- 5) PRODUCT RECIPES (ใช้คอลัมน์ qty)
CREATE TABLE product_recipes (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id    BIGINT NOT NULL,
  ingredient_id BIGINT NOT NULL,
  qty           DECIMAL(12,3) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_recipe (product_id, ingredient_id),
  CONSTRAINT fk_recipe_product FOREIGN KEY (product_id) REFERENCES products(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_recipe_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 6) STOCK MOVEMENTS (type = receive/adjust, reason free text, ref JSON/TEXT)
CREATE TABLE stock_movements (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  ingredient_id BIGINT NOT NULL,
  type         ENUM('receive','adjust') NOT NULL,
  qty          DECIMAL(12,3) NOT NULL,
  reason       VARCHAR(255) NULL,
  ref          JSON NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sm_ing FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 7) PROMOTIONS (start_at/end_at, type/value/min_spend/status)
CREATE TABLE promotions (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  code       VARCHAR(50) NOT NULL UNIQUE,
  type       ENUM('percent','amount') NOT NULL,
  value      DECIMAL(12,2) NOT NULL,
  min_spend  DECIMAL(12,2) NOT NULL DEFAULT 0,
  start_at   DATETIME NOT NULL,
  end_at     DATETIME NOT NULL,
  status     ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL
) ENGINE=InnoDB;

-- 8) ORDERS & ORDER ITEMS (sub_total/discount/total/pay_method เป็นต้น)
CREATE TABLE orders (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  status     ENUM('open','paid','cancel','refund') NOT NULL DEFAULT 'paid',
  pay_method ENUM('cash','qr','card','none') NOT NULL DEFAULT 'cash',
  sub_total  DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount   DECIMAL(12,2) NOT NULL DEFAULT 0,
  total      DECIMAL(12,2) NOT NULL DEFAULT 0,
  note       VARCHAR(255) NULL,
  customer   VARCHAR(120) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id     BIGINT NOT NULL,
  product_id   BIGINT NOT NULL,
  product_name VARCHAR(120) NOT NULL,
  qty          INT NOT NULL DEFAULT 1,
  unit_price   DECIMAL(12,2) NOT NULL,
  options_json JSON NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_oi_order   FOREIGN KEY (order_id) REFERENCES orders(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_oi_product FOREIGN KEY (product_id) REFERENCES products(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  KEY idx_order_items_order (order_id)
) ENGINE=InnoDB;

-- 9) Helpful Indexes
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_sm_created_at ON stock_movements(created_at);
