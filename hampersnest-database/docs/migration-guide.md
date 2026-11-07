# HampersNest Database Operations & Schema Guide

This guide details how to sync, verify, seed, and manage database schema changes using [Knex.js](https://knexjs.org/) and the modular table schemas in `schema/tables/`.

---

## 1. Table Schema Architecture

Each table is cleanly defined in its own file under `schema/tables/`:
- `users.js`
- `categories.js`
- `products.js`
- `orders.js`
- `inquiries.js`
- `settings.js`
- `gallery_items.js`
- `audit_logs.js`
- `hero_banners.js`
- `testimonials.js`
- `category_showcase.js`

To add a new column or feature to a table, simply edit that table's schema file in `schema/tables/`.

---

## 2. Available Commands

| Command | Action | Description |
| :--- | :--- | :--- |
| `npm run db:sync` | Safe Schema Sync | Creates missing tables and safely alters existing tables with new columns |
| `npm run db:verify` | Read-Only Health Check | Tests Oracle connection and lists row counts for all 11 tables |
| `npm run seed` | Seed Baseline Data | Populates default categories, superadmin, and store policies/settings |
| `npm test` | Run Automated Tests | Executes 8 unit tests in an isolated memory database |
