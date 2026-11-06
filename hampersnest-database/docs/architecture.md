# HampersNest Database Architecture & Schema Design

## 1. Overview
The **HampersNest Database** is designed to power the e-commerce store and admin management system. It utilizes **Knex.js** as the SQL query builder and migration engine, supporting PostgreSQL, MySQL, SQLite3, and Oracle DB seamlessly.

---

## 2. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ AUDIT_LOGS : "triggers"
    CATEGORIES ||--o{ PRODUCTS : "groups"
    ORDERS ||--|{ ORDER_ITEMS : "contains"
    PRODUCTS ||--o{ ORDER_ITEMS : "referenced_in"
    PROMOTIONS ||--o{ ORDERS : "applied_to"

    USERS {
        int id PK
        string username UK
        string password
        string role
        boolean is_active
        text permissions
        datetime created_at
        datetime updated_at
    }

    CATEGORIES {
        int id PK
        string name UK
        string slug UK
        text description
        string image
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    PRODUCTS {
        string id PK
        string name
        string sku UK
        int price
        int discount_price
        int original_price
        text image
        text images
        text video_urls
        string category
        string master_category
        string sub_category
        string occasion
        text tags
        int stock
        text description
        boolean is_featured
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    ORDERS {
        string id PK
        string customer_name
        string customer_email
        string customer_phone
        text shipping_address
        int total_amount
        string status
        string payment_method
        string payment_status
        datetime created_at
        datetime updated_at
    }

    ORDER_ITEMS {
        int id PK
        string order_id FK
        string product_id FK
        string product_name
        int quantity
        int unit_price
        datetime created_at
        datetime updated_at
    }

    PROMOTIONS {
        int id PK
        string code UK
        string discount_type
        int discount_value
        int min_purchase
        datetime start_date
        datetime end_date
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    SETTINGS {
        int id PK
        string key UK
        text value
        string group
        string description
        datetime created_at
        datetime updated_at
    }

    AUDIT_LOGS {
        int id PK
        string action
        string entity
        string entity_id
        int user_id
        text payload
        string ip_address
        datetime created_at
    }
```

---

## 3. Schema Conventions
- **Table Names**: Lowercase, plural, snake_case (`users`, `orders`, `order_items`).
- **Primary Keys**:
  - Auto-incrementing integers (`id`) for internal tables (`users`, `categories`, `promotions`, `settings`).
  - UUID / Prefixed strings (`id`) for externally exposed entities (`products`, `orders`).
- **Timestamps**: Every table contains `created_at` and `updated_at` timestamps using ISO 8601 formatting.
- **Foreign Keys**: Enforce referential integrity with cascading or nullifying options:
  - `orders` -> `order_items` (`ON DELETE CASCADE`)
  - `products` -> `order_items` (`ON DELETE SET NULL`)

