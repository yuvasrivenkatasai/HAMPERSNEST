# HampersNest Database Project (`hampersnest-database`)

Dedicated production database management, modular schema definitions, and migration workflows for the **HampersNest** e-commerce platform using [Knex.js](https://knexjs.org/).

---

## 📁 Clean, Modular Architecture

Each table is organized into its own dedicated file under `schema/tables/`. All historical schema alterations from backend (`alter.cjs`, `alter_hero_db.cjs`, `alter_orders.cjs`, etc.) are unified into these schemas.

```text
hampersnest-database/
│
├── schema/
│   ├── index.js                    # Schema orchestrator (syncAll & dropAll)
│   └── tables/                     # 11 Dedicated table schema files
│       ├── users.js                # Admin user authentication & RBAC permissions
│       ├── categories.js           # Multi-tier categories and subcategory hierarchy
│       ├── products.js             # Catalog, watermarks, addons, variants, stock
│       ├── orders.js               # Orders, customer info, history, payment status
│       ├── inquiries.js            # Custom gifting leads and admin assignment
│       ├── settings.js             # System settings, store config, and policies
│       ├── gallery_items.js        # Media gallery items and dimensions
│       ├── audit_logs.js           # Admin audit trail logs
│       ├── hero_banners.js         # Homepage hero banners and click destinations
│       ├── testimonials.js         # Customer reviews and ratings
│       └── category_showcase.js    # Homepage category showcase cards
│
├── migrations/
│   └── 20261107000100_sync_production_schema.js   # Master production Knex migration
│
├── seeds/
│   ├── 01_initial_categories.js    # Full category hierarchy (Weddings, Baby, Festive...)
│   ├── 02_initial_admin.js         # Default superadmin account
│   └── 03_initial_settings.js      # Default store settings, policies, and discounts
│
├── config/
│   └── index.js                    # Knex instance & health check provider
│
├── scripts/
│   ├── sync.js                     # Safe schema sync: creates or alters tables without data loss
│   ├── verify.js                   # Read-only health check & row counter across all 11 tables
│   └── seed.js                     # Runs production seeds
│
├── tests/
│   ├── schema.test.js              # Validates creation, alterations, and columns across all tables
│   └── crud.test.js                # Validates CRUD operations and seed insertion
│
├── .env.example                    # Clean production environment template
├── .env                            # Active environment configuration
├── .gitignore                      # Excluded files (credentials, databases, logs)
├── knexfile.js                     # Knex configuration with Oracle Cloud Wallet support
├── package.json                    # Project dependencies and script shortcuts
└── README.md                       # Project documentation
```

---

## 🚀 Key Commands

### 1. Synchronize / Create / Alter Tables on ANY Database
If you point this project to a **brand-new database**, it will automatically create all 11 tables.
If you point it to an **existing database**, it safely checks and applies `ALTER TABLE` for any missing columns without touching existing data:
```bash
npm run db:sync
# or via standard Knex migrations:
npm run migrate
```

### 2. Verify Database Health & Table Counts (Read-Only)
Safely tests connection and prints live row counts for all 11 tables without modifying anything:
```bash
npm run db:verify
```

### 3. Populate Initial Baseline Data
Seeds categories, default superadmin, and store policies:
```bash
npm run seed
```

### 4. Run Automated Test Suite
Executes schema validation and CRUD tests in an isolated memory database:
```bash
npm test
```
