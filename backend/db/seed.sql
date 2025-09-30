USE coffee_shop;

-- =========
-- ROLES
-- =========
INSERT INTO roles (name) VALUES ('Admin'),('Cashier'),('Barista')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- =========
-- USERS
--  admin / hash ด้านล่างเป็น bcrypt ("admin123") — เปลี่ยนได้ภายหลัง
-- =========
INSERT INTO users (username, password_hash, full_name, role_id, is_active)
VALUES (
  'admin',
  '$2a$10$vnwuoSse1z5SEjF5YEY/YeKhvIX6tvLszYl6gFVNbpBw/H2/Ej9xa',
  'Administrator',
  (SELECT id FROM roles WHERE name='Admin'),
  1
)
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  role_id   = VALUES(role_id),
  is_active = VALUES(is_active);

-- =========
-- SUPPLIERS
-- =========
INSERT INTO suppliers (name, phone, email, address)
VALUES
('Main Beans Co.','02-000-1111','beans@example.com','Bangkok'),
('Dairy Supply','02-000-2222','milk@example.com','Bangkok')
ON DUPLICATE KEY UPDATE
  phone=VALUES(phone), email=VALUES(email), address=VALUES(address);

-- =========
-- INGREDIENTS (ใช้ stock_qty, cost_per_unit)
-- =========
INSERT INTO ingredients (name, unit, stock_qty, reorder_point, cost_per_unit, supplier_id)
VALUES
('Espresso Beans','g', 5000, 1000, 0.80, (SELECT id FROM suppliers WHERE name='Main Beans Co.')),
('Milk','ml',        10000, 2000, 0.02, (SELECT id FROM suppliers WHERE name='Dairy Supply')),
('Sugar Syrup','ml', 3000,  500,  0.01, NULL)
ON DUPLICATE KEY UPDATE
  unit=VALUES(unit),
  stock_qty=VALUES(stock_qty),
  reorder_point=VALUES(reorder_point),
  cost_per_unit=VALUES(cost_per_unit),
  supplier_id=VALUES(supplier_id);

-- =========
-- PRODUCTS (description แทน short_desc)
-- UNIQUE (name, category)
-- =========
INSERT INTO products (name, category, price, status, image_url, description)
VALUES
('Americano','coffee', 50, 'active', NULL, 'Hot/Ice'),
('Latte','coffee',     65, 'active', NULL, 'Hot/Ice'),
('Green Tea','tea',    55, 'active', NULL, 'Hot/Ice'),
('Croissant','bakery', 45, 'active', NULL, 'Butter croissant')
ON DUPLICATE KEY UPDATE
  price=VALUES(price),
  status=VALUES(status),
  image_url=VALUES(image_url),
  description=VALUES(description),
  updated_at=NOW();

-- =========
-- PRODUCT RECIPES (qty)
-- =========

-- Americano: Beans 18g
INSERT INTO product_recipes (product_id, ingredient_id, qty)
VALUES (
  (SELECT id FROM products WHERE name='Americano' AND category='coffee'),
  (SELECT id FROM ingredients WHERE name='Espresso Beans'),
  18.0
)
ON DUPLICATE KEY UPDATE qty=VALUES(qty);

-- Latte: Beans 18g + Milk 180ml
INSERT INTO product_recipes (product_id, ingredient_id, qty)
VALUES (
  (SELECT id FROM products WHERE name='Latte' AND category='coffee'),
  (SELECT id FROM ingredients WHERE name='Espresso Beans'),
  18.0
)
ON DUPLICATE KEY UPDATE qty=VALUES(qty);

INSERT INTO product_recipes (product_id, ingredient_id, qty)
VALUES (
  (SELECT id FROM products WHERE name='Latte' AND category='coffee'),
  (SELECT id FROM ingredients WHERE name='Milk'),
  180.0
)
ON DUPLICATE KEY UPDATE qty=VALUES(qty);

-- Green Tea: Syrup 30ml + Milk 150ml
INSERT INTO product_recipes (product_id, ingredient_id, qty)
VALUES (
  (SELECT id FROM products WHERE name='Green Tea' AND category='tea'),
  (SELECT id FROM ingredients WHERE name='Sugar Syrup'),
  30.0
)
ON DUPLICATE KEY UPDATE qty=VALUES(qty);

INSERT INTO product_recipes (product_id, ingredient_id, qty)
VALUES (
  (SELECT id FROM products WHERE name='Green Tea' AND category='tea'),
  (SELECT id FROM ingredients WHERE name='Milk'),
  150.0
)
ON DUPLICATE KEY UPDATE qty=VALUES(qty);

-- =========
-- PROMOTIONS (start_at / end_at / status)
-- =========
INSERT INTO promotions (code, type, value, min_spend, start_at, end_at, status)
VALUES
('WELCOME10','percent',10, 100, NOW(), DATE_ADD(NOW(), INTERVAL 6 MONTH), 'active'),
('SAVE20',   'amount', 20, 200, NOW(), DATE_ADD(NOW(), INTERVAL 3 MONTH), 'active')
ON DUPLICATE KEY UPDATE
  type=VALUES(type),
  value=VALUES(value),
  min_spend=VALUES(min_spend),
  start_at=VALUES(start_at),
  end_at=VALUES(end_at),
  status=VALUES(status),
  updated_at=NOW();
