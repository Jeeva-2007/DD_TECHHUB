# DD TECHHUB — Complete Database Schema (SQL & ORM Reference)

This document provides the complete database schema for **DD TECHHUB**. The database is implemented using **SQLAlchemy ORM** with **SQLite / MySQL 8** compatibility.

---

## 📊 Entity Relationship Diagram (Conceptual)

```text
┌──────────────┐         ┌──────────────┐         ┌─────────────────┐
│    users     │         │   orders     │────────<│   order_items   │
├──────────────┤         ├──────────────┤         ├─────────────────┤
│ id (PK)      │1       *│ id (PK)      │1       *│ id (PK)         │
│ user_id (UQ) │────────<│ order_id(UQ) │         │ order_id (FK)   │
│ mobile (UQ)  │         │ user_id      │         │ product_id      │
│ name         │         │ total_amount │         │ price, quantity │
└──────────────┘         │ status       │         └─────────────────┘
                         └──────┬───────┘
                                │ 1
                                │
                                ▼ 1
                         ┌──────────────┐
                         │   payments   │
                         ├──────────────┤
                         │ id (PK)      │
                         │ payment_id   │
                         │ amount       │
                         │ status       │
                         └──────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                   OPERATIONAL & AI OBSERVABILITY TABLES                │
├────────────────────────────────────────────────────────────────────────┤
│  operational_events  (Indexed: request_id, service_name, event_type,   │
│                       severity, timestamp, error_code)                 │
│                                                                        │
│  application_logs    (Indexed: service_name, level, request_id,      │
│                       timestamp, error_code)                           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Business Data Tables

### 1.1 `users` Table
Stores customer profile records. Authentication is based on `mobile`.

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    mobile VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) NULLABLE,
    password_hash VARCHAR(255) NULLABLE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX ix_users_user_id ON users (user_id);
CREATE UNIQUE INDEX ix_users_mobile ON users (mobile);
```

### 1.2 `products` Table
Stores laptops, specifications, and accessories catalog.

```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Laptops' or 'Accessories'
    price FLOAT NOT NULL,
    stock INTEGER DEFAULT 50,
    rating FLOAT DEFAULT 4.5,
    image_url TEXT NOT NULL,
    processor VARCHAR(100) NULLABLE,
    ram VARCHAR(50) NULLABLE,
    storage VARCHAR(50) NULLABLE,
    display VARCHAR(100) NULLABLE,
    graphics VARCHAR(100) NULLABLE,
    os VARCHAR(50) NULLABLE,
    warranty VARCHAR(100) NULLABLE,
    delivery VARCHAR(100) NULLABLE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX ix_products_product_id ON products (product_id);
```

### 1.3 `orders` Table
Stores customer order headers.

```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id VARCHAR(64) NOT NULL UNIQUE,
    user_id VARCHAR(64) NOT NULL,
    total_amount FLOAT NOT NULL,
    status VARCHAR(32) DEFAULT 'CONFIRMED', -- CONFIRMED, PROCESSING, SHIPPED, DELIVERED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX ix_orders_order_id ON orders (order_id);
```

### 1.4 `order_items` Table
Stores line items associated with each order.

```sql
CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id VARCHAR(64) NOT NULL,
    product_id VARCHAR(64) NOT NULL,
    product_name VARCHAR(200) NULLABLE,
    quantity INTEGER DEFAULT 1,
    price FLOAT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE
);
```

### 1.5 `payments` Table
Stores payment authorization transactions and failure records.

```sql
CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_id VARCHAR(64) NOT NULL UNIQUE,
    order_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    amount FLOAT NOT NULL,
    status VARCHAR(32) NOT NULL, -- 'SUCCESS' or 'FAILED'
    payment_method VARCHAR(32) DEFAULT 'CARD', -- CARD, UPI, NETBANKING, COD
    error_code VARCHAR(64) NULLABLE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX ix_payments_payment_id ON payments (payment_id);
```

---

## 2. Operational & Observability Tables (For Future AI Incident Agent)

### 2.1 `operational_events` Table
**Most Important Table**: Records high-level operational events, latencies, service dependencies, and failure codes. Indexed for ultra-fast query execution by the future AI Incident Resolution Engine.

```sql
CREATE TABLE operational_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id VARCHAR(64) NOT NULL UNIQUE,
    request_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NULLABLE,
    service_name VARCHAR(64) NOT NULL,   -- auth-service, otp-service, payment-service, order-service, database, etc.
    event_type VARCHAR(64) NOT NULL,     -- LOGIN_REQUEST, OTP_SEND, OTP_VERIFY, PAYMENT_FAILURE, etc.
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(32) NOT NULL,          -- SUCCESS, FAILED
    severity VARCHAR(16) NOT NULL,        -- LOW, MEDIUM, HIGH, CRITICAL
    response_time_ms INTEGER DEFAULT 0,
    metric_name VARCHAR(64) NULLABLE,
    metric_value FLOAT NULLABLE,
    threshold FLOAT NULLABLE,
    error_code VARCHAR(64) NULLABLE,      -- PAYMENT_DB_TIMEOUT, OTP_PROVIDER_TIMEOUT, etc.
    error_message TEXT NULLABLE,
    dependency VARCHAR(64) NULLABLE,     -- telegram-bot-provider, demo-payment-gateway, database, etc.
    metadata_json JSON NULLABLE
);

-- Performance Indexes for AI Agent Queries
CREATE UNIQUE INDEX ix_op_events_event_id ON operational_events (event_id);
CREATE INDEX ix_op_events_request_id ON operational_events (request_id);
CREATE INDEX ix_op_events_service_name ON operational_events (service_name);
CREATE INDEX ix_op_events_event_type ON operational_events (event_type);
CREATE INDEX ix_op_events_severity ON operational_events (severity);
CREATE INDEX ix_op_events_timestamp ON operational_events (timestamp);
CREATE INDEX ix_op_events_error_code ON operational_events (error_code);
```

### 2.2 `application_logs` Table
Stores structured microservice logs across debug levels.

```sql
CREATE TABLE application_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_id VARCHAR(64) NOT NULL UNIQUE,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    service_name VARCHAR(64) NOT NULL,
    level VARCHAR(16) NOT NULL,          -- DEBUG, INFO, WARNING, ERROR, CRITICAL
    message TEXT NOT NULL,
    request_id VARCHAR(64) NULLABLE,
    user_id VARCHAR(64) NULLABLE,
    error_code VARCHAR(64) NULLABLE,
    metadata_json JSON NULLABLE
);

CREATE UNIQUE INDEX ix_app_logs_log_id ON application_logs (log_id);
CREATE INDEX ix_app_logs_service_name ON application_logs (service_name);
CREATE INDEX ix_app_logs_level ON application_logs (level);
CREATE INDEX ix_app_logs_request_id ON application_logs (request_id);
CREATE INDEX ix_app_logs_timestamp ON application_logs (timestamp);
```
