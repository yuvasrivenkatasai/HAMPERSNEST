# HampersNest Knex Migration Guide

This guide details how to create, test, and deploy database schema changes using [Knex.js](https://knexjs.org/).

---

## 1. Creating a New Migration

Generate a new timestamped migration file:

```bash
# General Knex CLI
npx knex migrate:make add_loyalty_points_to_users

# Or using the package npm shortcut
npm run migrate:make -- add_loyalty_points_to_users
```

By default, place production-ready migrations in `migrations/production/`. If the migration is experimental or specific to staging/development, place it in `migrations/staging/` or `migrations/development/`.

---

## 2. Anatomy of a Migration File

Every migration file must export an `up` and a `down` function:

```javascript
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.integer('loyalty_points').defaultTo(0);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('loyalty_points');
  });
};
```

---

## 3. Running Migrations

| Environment | Command | Description |
| :--- | :--- | :--- |
| **Development** | `npm run migrate:dev` | Runs migrations across `production/` & `development/` |
| **Staging** | `npm run migrate:staging` | Runs migrations across `production/` & `staging/` |
| **Production** | `npm run migrate:prod` | Runs production migrations only |
| **Rollback** | `npm run migrate:rollback` | Rolls back the most recent migration batch |
| **Check Status** | `npm run migrate:status` | Shows completed and pending migrations |

---

## 4. Testing Migrations Locally

Always execute tests before committing:

```bash
# Run all test suites
npm test

# Run migration tests specifically
npm run test:migrations
```

