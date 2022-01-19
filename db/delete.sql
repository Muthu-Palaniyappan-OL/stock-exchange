DROP DATABASE IF EXISTS stockexchange;
DROP TABLE IF EXISTS stock;
DROP TABLE IF EXISTS dpclient;
DROP TABLE IF EXISTS dp;
DROP TABLE IF EXISTS orders;

DROP FUNCTION allstocks;
DROP FUNCTION stock_info;
DROP FUNCTION dp_pswd_check;

DROP FUNCTION read_order;
DROP FUNCTION update_order;
DROP FUNCTION delete_order;
DROP FUNCTION create_order;
DROP TRIGGER order_matcher_trigger on orders;
DROP FUNCTION order_matcher;
