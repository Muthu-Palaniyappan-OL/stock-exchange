/* BASICS */

CREATE OR REPLACE FUNCTION dp_pswd_check(dp_id BIGINT, pass VARCHAR(30)) RETURNS BOOLEAN AS 
$$
    DECLARE
        dp_pass dp.password%type;
    BEGIN
        SELECT password 
        FROM dp
        INTO dp_pass
        WHERE dpid = dp_id;
        IF dp_pass = pass THEN
            RETURN TRUE;
        END IF;
        RETURN FALSE;
    END;
$$ language 'plpgsql';


/* STOCKS BASED */

CREATE OR REPLACE FUNCTION stock_info(sid VARCHAR(10))
RETURNS SETOF stock AS $$
    DECLARE
        r stock%rowtype;
    BEGIN
        FOR r IN 
            SELECT * FROM stock WHERE SYMBOL = sid
        LOOP
            RETURN NEXT r;
        END LOOP;
        RETURN;
    END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION allstocks()
RETURNS SETOF stock AS $$
    DECLARE
        r stock%rowtype;
    BEGIN
        FOR r IN 
            SELECT * FROM stock
        LOOP
            RETURN NEXT r;
        END LOOP;
        RETURN;
    END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION allorders()
RETURNS SETOF orders AS $$
    DECLARE
        r orders%rowtype;
    BEGIN
        FOR r IN 
            SELECT * FROM orders
        LOOP
            RETURN NEXT r;
        END LOOP;
        RETURN;
    END;
$$ language 'plpgsql';

/* ORDERS BASED */

CREATE OR REPLACE FUNCTION create_order(stock_ VARCHAR(10), price_ NUMERIC(8,2),  qty_ INTEGER, dp_ BIGINT, dp_client_ BIGINT, side_ INTEGER) RETURNS VARCHAR(36) AS
$$
    DECLARE
        id VARCHAR(36) := (SELECT uuid_in(overlay(overlay(md5(random()::text || ':' || clock_timestamp()::text) placing '4' from 13) placing to_hex(floor(random()*(11-8+1) + 8)::int)::text from 17)::cstring));
    BEGIN
        IF side_ = 0 THEN
            RETURN '';
        END IF;
        INSERT INTO orders VALUES 
        (id, stock_, price_, qty_, 0, side_, -1, dp_, dp_client_);
        raise notice 'inserted';
        RETURN id;
    exception when others then
        raise notice 'Exeception % %', SQLERRM, SQLSTATE;
        RETURN '';
    END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION read_order(order_ID VARCHAR(10)) 
RETURNS SETOF orders AS 
$$
    DECLARE
        r orders%rowtype;
    BEGIN
        FOR r IN (SELECT * FROM orders WHERE orderID = order_ID) LOOP
            RETURN NEXT r;
        END LOOP;
        RETURN;
    END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_order(order_ID VARCHAR(10), price_ NUMERIC(8,2),  qty_ INTEGER) 
RETURNS BOOLEAN AS 
$$
    DECLARE
        integer_var INTEGER;
        status INTEGER;
    BEGIN
        SELECT executed  INTO status FROM orders  WHERE orderID = order_ID;
        
        IF status >= 0 THEN 
            RETURN FALSE;
        END IF;
        
        UPDATE orders SET price = price_, qty = qty_ WHERE orderID = order_ID;
        GET DIAGNOSTICS integer_var = ROW_COUNT;
        RAISE NOTICE '%', integer_var;
        IF (integer_var > 0) THEN
            RETURN TRUE;
        ELSE
            RETURN FALSE;
        END IF;

        exception when others then
        raise notice 'Exeception Raised From Update % %', SQLERRM, SQLSTATE;
        RETURN FALSE;
    END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION delete_order(order_ID VARCHAR(10))
RETURNS BOOLEAN AS
$$
    DECLARE
        integer_var INTEGER;
        status INTEGER;
    BEGIN
        
        SELECT executed  INTO status FROM orders  WHERE orderID = order_ID;
        IF status >= 0 THEN 
            RETURN FALSE;
        END IF;

        DELETE FROM orders WHERE orderID = order_ID;
        GET DIAGNOSTICS integer_var = ROW_COUNT;
        RAISE NOTICE '%', integer_var;
        IF (integer_var > 0) THEN
            RETURN TRUE;
        ELSE
            RETURN FALSE;
        END IF;

        exception when others then
        raise notice 'Exeception % %', SQLERRM, SQLSTATE;
        RETURN FALSE;
    END;
$$ language 'plpgsql';

/* Core Matching Engine */

CREATE OR REPLACE FUNCTION order_matcher() 
RETURNS TRIGGER as $$
    DECLARE
        r orders%rowtype;
        count BIGINT := 1;
        anyexecution BIGINT := 0;
    BEGIN
        FOR r IN (
            SELECT * 
            FROM orders 
            WHERE stockID = new.stockID AND executed <= 0
            ORDER BY price DESC
        ) LOOP
            
            IF ((new.price < 0 AND r.price > 0) OR (new.price = r.price AND new.price > 0) AND (new.orderID <> r.orderID) OR (new.price > 0 AND r.price < 0)) AND (new.side * r.side < 0) THEN

                RAISE NOTICE 'UPDATING ID %', r.orderID;

                IF r.qty - r.qty_executed < new.qty THEN
                    UPDATE orders SET qty_executed = r.qty, executed = 1 WHERE orderID = r.orderID;
                    new.executed = 0;
                    new.qty_executed = new.qty_executed + (r.qty - r.qty_executed);
                END IF;
                IF r.qty - r.qty_executed = new.qty THEN
                    UPDATE orders SET qty_executed = r.qty, executed = 1 WHERE orderID = r.orderID;
                    anyexecution = 1;
                    new.executed = 1;
                    new.qty_executed = new.qty;
                END IF;
                IF r.qty - r.qty_executed > new.qty THEN
                    UPDATE orders SET qty_executed = qty_executed + new.qty, executed = 0 WHERE orderID = r.orderID;
                    anyexecution = 1;
                    new.executed = 1;
                    new.qty_executed = new.qty;
                END IF;

            END IF;
        
        END LOOP;

        IF anyexecution = 1 THEN
            UPDATE stock SET price = new.price, QTY = QTY + new.qty_executed WHERE SYMBOL = new.stockID;
        END IF;

        RETURN NEW;
    END;
$$ language 'plpgsql';

SELECT create_order('ZOMATO', 123, 12, 1, 71, 1);
SELECT create_order('ZOMATO', -1, 12, 1, 71, -1);
SELECT create_order('ZOMATO', 123, 15, 1, 71, 1);

CREATE OR REPLACE TRIGGER order_matcher_trigger
BEFORE INSERT ON orders FOR EACH ROW 
EXECUTE FUNCTION order_matcher();