USE coffee_shop;

-- Add discount_code column to orders table
ALTER TABLE orders ADD COLUMN discount_code VARCHAR(50) NULL;

-- Show the updated table structure
DESCRIBE orders;
