# HampersNest Database Architecture & Schema Design

## 1. Overview
The **HampersNest Database** powers the e-commerce storefront and admin dashboard. It uses **Knex.js** as the query builder and migration engine, targeting **Oracle Autonomous Cloud Database** for Production and **in-memory SQLite** for fast automated tests.

---

## 2. Production Entities & Tables (11 Tables)

```mermaid
erDiagram
    USERS ||--o{ AUDIT_LOGS : "logs"
    CATEGORIES ||--o{ PRODUCTS : "categorizes"
    CATEGORIES ||--o{ CATEGORIES : "subcategories"

    USERS {
        int id PK
        string username UK
        string password
        string role
        boolean isActive
        text permissions
        timestamp createdAt
        timestamp updatedAt
    }

    CATEGORIES {
        string id PK
        string name
        string parentId FK
        int sortOrder
        timestamp createdAt
        timestamp updatedAt
    }

    PRODUCTS {
        string id PK
        string name
        string sku
        int price
        int discountPrice
        int originalPrice
        text image
        string category FK
        string masterCategory
        string subCategory
        string occasion
        int stockQuantity
        int reservedQuantity
        int lowStockThreshold
        decimal rating
        text description
        text shortDescription
        boolean isFeatured
        int views
        int clicks
        boolean isActive
        boolean customGiftTagEnabled
        boolean addonsEnabled
        text customizationText
        text deliveryInfoText
        text videoUrls
        text tags
        text customization
        text shipping
        text details
        text images
        text watermarkSettings
        boolean variantsEnabled
        text variants
        text customAddons
        timestamp createdAt
        timestamp updatedAt
    }

    ORDERS {
        int id PK
        string orderId UK
        binary customer
        binary items
        int totalAmount
        int budget
        string eventType
        timestamp deliveryDate
        text notes
        text internalNotes
        string status
        string source
        string paymentStatus
        string paymentMethod
        int advancePaid
        text history
        timestamp createdAt
        timestamp updatedAt
    }

    INQUIRIES {
        int id PK
        string name
        string phone
        string email
        string city
        string eventType
        string budget
        int quantity
        string subject
        text message
        string status
        text leadNotes
        string assignedAdmin
        text history
        timestamp createdAt
        timestamp updatedAt
    }

    SETTINGS {
        int id PK
        string key UK
        binary value
        timestamp createdAt
        timestamp updatedAt
    }

    GALLERY_ITEMS {
        string id PK
        string title
        text image
        string category
        text description
        string fileSize
        string dimensions
        string mediaType
        int width
        int height
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }

    AUDIT_LOGS {
        int id PK
        string adminUser
        string action
        string entity
        string entityId
        binary details
        string ipAddress
        timestamp createdAt
    }

    HERO_BANNERS {
        int id PK
        string title
        text mainImage
        text floatingImageTop
        text floatingImageBottom
        boolean isActive
        text destinations
        timestamp createdAt
        timestamp updatedAt
    }

    TESTIMONIALS {
        int id PK
        string name
        text quote
        int rating
        string event
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }

    CATEGORY_SHOWCASE {
        int id PK
        string name
        string icon
        string targetCollection
        int sortOrder
        boolean isActive
        text image
        boolean isFeatured
        timestamp createdAt
        timestamp updatedAt
    }
```
