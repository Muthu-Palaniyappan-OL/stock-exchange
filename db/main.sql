CREATE TABLE orders (
    orderID VARCHAR(36) PRIMARY KEY,
    stockID VARCHAR(10),
    price NUMERIC(8,2),
    qty INTEGER,
    qty_executed INTEGER,
    side INTEGER,
    executed INTEGER,
    DP BIGINT,
    Dp_client BIGINT,
    FOREIGN KEY (stockID) REFERENCES stock(SYMBOL),
    FOREIGN KEY (DP ) REFERENCES dp(dpID),
    FOREIGN KEY (Dp_client) REFERENCES dpclient(dpID)
);