-- 2025-05-14_add_sales_details_and_trigger.sql

SET search_path TO inventory_ms_schema;

-- 1. Create the sales_details table
CREATE TABLE IF NOT EXISTS sales_details (
  sales_detail_id SERIAL PRIMARY KEY,

  sale_id    INT NOT NULL,
  product_id INT NOT NULL,
  purchase_id INT NOT NULL,

  quantity   INT NOT NULL,
  unit_cost  NUMERIC(10,2) NOT NULL,
  total_cost NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,

  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_sd_sale     FOREIGN KEY (sale_id)    REFERENCES sales(sale_id)    ON DELETE CASCADE,
  CONSTRAINT fk_sd_product  FOREIGN KEY (product_id) REFERENCES products(product_id),
  CONSTRAINT fk_sd_purchase FOREIGN KEY (purchase_id) REFERENCES purchases(purchase_id)
);

-- 2. Trigger function: deduct purchase stock and prevent oversell
CREATE OR REPLACE FUNCTION inventory_ms_schema.deduct_purchase_stock()
  RETURNS TRIGGER
  LANGUAGE plpgsql
AS $$
BEGIN
  -- Deduct the sold quantity from the corresponding purchase batch
  UPDATE purchases
  SET quantity = quantity - NEW.quantity
  WHERE purchase_id = NEW.purchase_id;

  -- If this made quantity negative, abort
  IF (SELECT quantity FROM purchases WHERE purchase_id = NEW.purchase_id) < 0 THEN
    RAISE EXCEPTION 'Insufficient stock in purchase %: attempted to sell %, only % available',
      NEW.purchase_id, NEW.quantity, (SELECT quantity + NEW.quantity FROM purchases WHERE purchase_id = NEW.purchase_id);
  END IF;

  RETURN NULL;  -- AFTER trigger
END;
$$;

-- 3. Attach trigger to sales_details
DROP TRIGGER IF EXISTS trg_deduct_stock ON sales_details;
CREATE TRIGGER trg_deduct_stock
  AFTER INSERT ON sales_details
  FOR EACH ROW
  EXECUTE FUNCTION inventory_ms_schema.deduct_purchase_stock();
