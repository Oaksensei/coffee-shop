USE coffee_shop;

-- Add discount_code column to orders table
ALTER TABLE orders ADD COLUMN discount_code VARCHAR(50) NULL AFTER customer;

-- Update existing orders to have NULL discount_code (they don't have promotions)
UPDATE orders SET discount_code = NULL WHERE discount_code IS NULL;

