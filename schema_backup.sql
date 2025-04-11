--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4 (Ubuntu 17.4-1.pgdg24.04+2)
-- Dumped by pg_dump version 17.4 (Ubuntu 17.4-1.pgdg24.04+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: inventory_schema; Type: SCHEMA; Schema: -; Owner: inventory_admin
--

CREATE SCHEMA inventory_schema;


ALTER SCHEMA inventory_schema OWNER TO inventory_admin;

--
-- Name: set_updated_at(); Type: FUNCTION; Schema: inventory_schema; Owner: inventory_admin
--

CREATE FUNCTION inventory_schema.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION inventory_schema.set_updated_at() OWNER TO inventory_admin;

--
-- Name: sync_product_code(); Type: FUNCTION; Schema: inventory_schema; Owner: inventory_admin
--

CREATE FUNCTION inventory_schema.sync_product_code() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE inventory_schema.purchases
  SET product_code = NEW.product_code
  WHERE product_id = NEW.product_id;

  UPDATE inventory_schema.sales
  SET product_code = NEW.product_code
  WHERE product_id = NEW.product_id;

  RETURN NEW;
END;
$$;


ALTER FUNCTION inventory_schema.sync_product_code() OWNER TO inventory_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: products; Type: TABLE; Schema: inventory_schema; Owner: inventory_admin
--

CREATE TABLE inventory_schema.products (
    product_id integer NOT NULL,
    product_code character varying(20) NOT NULL,
    description text,
    current_price integer,
    brand character varying(50),
    is_deleted boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp without time zone
);


ALTER TABLE inventory_schema.products OWNER TO inventory_admin;

--
-- Name: products_product_id_seq; Type: SEQUENCE; Schema: inventory_schema; Owner: inventory_admin
--

CREATE SEQUENCE inventory_schema.products_product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE inventory_schema.products_product_id_seq OWNER TO inventory_admin;

--
-- Name: products_product_id_seq; Type: SEQUENCE OWNED BY; Schema: inventory_schema; Owner: inventory_admin
--

ALTER SEQUENCE inventory_schema.products_product_id_seq OWNED BY inventory_schema.products.product_id;


--
-- Name: purchases; Type: TABLE; Schema: inventory_schema; Owner: inventory_admin
--

CREATE TABLE inventory_schema.purchases (
    purchase_id integer NOT NULL,
    product_id integer NOT NULL,
    product_code character varying(20) NOT NULL,
    batch_id integer NOT NULL,
    quantity integer NOT NULL,
    cost_per_unit integer NOT NULL,
    purchase_date date,
    original_quantity integer NOT NULL,
    is_deleted boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp without time zone
);


ALTER TABLE inventory_schema.purchases OWNER TO inventory_admin;

--
-- Name: purchases_purchase_id_seq; Type: SEQUENCE; Schema: inventory_schema; Owner: inventory_admin
--

CREATE SEQUENCE inventory_schema.purchases_purchase_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE inventory_schema.purchases_purchase_id_seq OWNER TO inventory_admin;

--
-- Name: purchases_purchase_id_seq; Type: SEQUENCE OWNED BY; Schema: inventory_schema; Owner: inventory_admin
--

ALTER SEQUENCE inventory_schema.purchases_purchase_id_seq OWNED BY inventory_schema.purchases.purchase_id;


--
-- Name: sales; Type: TABLE; Schema: inventory_schema; Owner: inventory_admin
--

CREATE TABLE inventory_schema.sales (
    sale_id integer NOT NULL,
    product_id integer NOT NULL,
    product_code character varying(20) NOT NULL,
    quantity integer NOT NULL,
    sold_price integer NOT NULL,
    sale_date date,
    is_deleted boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp without time zone
);


ALTER TABLE inventory_schema.sales OWNER TO inventory_admin;

--
-- Name: sales_sale_id_seq1; Type: SEQUENCE; Schema: inventory_schema; Owner: inventory_admin
--

CREATE SEQUENCE inventory_schema.sales_sale_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE inventory_schema.sales_sale_id_seq1 OWNER TO inventory_admin;

--
-- Name: sales_sale_id_seq1; Type: SEQUENCE OWNED BY; Schema: inventory_schema; Owner: inventory_admin
--

ALTER SEQUENCE inventory_schema.sales_sale_id_seq1 OWNED BY inventory_schema.sales.sale_id;


--
-- Name: products product_id; Type: DEFAULT; Schema: inventory_schema; Owner: inventory_admin
--

ALTER TABLE ONLY inventory_schema.products ALTER COLUMN product_id SET DEFAULT nextval('inventory_schema.products_product_id_seq'::regclass);


--
-- Name: purchases purchase_id; Type: DEFAULT; Schema: inventory_schema; Owner: inventory_admin
--

ALTER TABLE ONLY inventory_schema.purchases ALTER COLUMN purchase_id SET DEFAULT nextval('inventory_schema.purchases_purchase_id_seq'::regclass);


--
-- Name: sales sale_id; Type: DEFAULT; Schema: inventory_schema; Owner: inventory_admin
--

ALTER TABLE ONLY inventory_schema.sales ALTER COLUMN sale_id SET DEFAULT nextval('inventory_schema.sales_sale_id_seq1'::regclass);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: inventory_schema; Owner: inventory_admin
--

ALTER TABLE ONLY inventory_schema.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (product_id);


--
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: inventory_schema; Owner: inventory_admin
--

ALTER TABLE ONLY inventory_schema.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (purchase_id);


--
-- Name: sales sales_pkey1; Type: CONSTRAINT; Schema: inventory_schema; Owner: inventory_admin
--

ALTER TABLE ONLY inventory_schema.sales
    ADD CONSTRAINT sales_pkey1 PRIMARY KEY (sale_id);


--
-- Name: purchases unique_product_batch; Type: CONSTRAINT; Schema: inventory_schema; Owner: inventory_admin
--

ALTER TABLE ONLY inventory_schema.purchases
    ADD CONSTRAINT unique_product_batch UNIQUE (product_code, batch_id);


--
-- Name: products unique_product_code; Type: CONSTRAINT; Schema: inventory_schema; Owner: inventory_admin
--

ALTER TABLE ONLY inventory_schema.products
    ADD CONSTRAINT unique_product_code UNIQUE (product_code);


--
-- Name: products set_products_updated_at; Type: TRIGGER; Schema: inventory_schema; Owner: inventory_admin
--

CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON inventory_schema.products FOR EACH ROW EXECUTE FUNCTION inventory_schema.set_updated_at();


--
-- Name: purchases set_purchases_updated_at; Type: TRIGGER; Schema: inventory_schema; Owner: inventory_admin
--

CREATE TRIGGER set_purchases_updated_at BEFORE UPDATE ON inventory_schema.purchases FOR EACH ROW EXECUTE FUNCTION inventory_schema.set_updated_at();


--
-- Name: sales set_sales_updated_at; Type: TRIGGER; Schema: inventory_schema; Owner: inventory_admin
--

CREATE TRIGGER set_sales_updated_at BEFORE UPDATE ON inventory_schema.sales FOR EACH ROW EXECUTE FUNCTION inventory_schema.set_updated_at();


--
-- Name: products trigger_sync_product_code; Type: TRIGGER; Schema: inventory_schema; Owner: inventory_admin
--

CREATE TRIGGER trigger_sync_product_code AFTER UPDATE OF product_code ON inventory_schema.products FOR EACH ROW EXECUTE FUNCTION inventory_schema.sync_product_code();


--
-- Name: purchases purchases_product_id_fkey; Type: FK CONSTRAINT; Schema: inventory_schema; Owner: inventory_admin
--

ALTER TABLE ONLY inventory_schema.purchases
    ADD CONSTRAINT purchases_product_id_fkey FOREIGN KEY (product_id) REFERENCES inventory_schema.products(product_id);


--
-- Name: sales sales_product_id_fkey; Type: FK CONSTRAINT; Schema: inventory_schema; Owner: inventory_admin
--

ALTER TABLE ONLY inventory_schema.sales
    ADD CONSTRAINT sales_product_id_fkey FOREIGN KEY (product_id) REFERENCES inventory_schema.products(product_id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO inventory_admin;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO inventory_admin;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO inventory_admin;


--
-- PostgreSQL database dump complete
--

