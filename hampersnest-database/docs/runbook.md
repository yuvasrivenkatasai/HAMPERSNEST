# HampersNest Database Operations Runbook

## 1. Health Checks
Check connectivity and query execution:
```bash
npm run db:health
```

## 2. Seeding Data
Seed the database with appropriate environment datasets:
```bash
# Seed development dummy data
npm run seed:dev

# Seed staging test data
npm run seed:staging

# Seed production critical configurations
npm run seed:prod
```

## 3. Database Reset (Development & Staging ONLY)
To completely wipe tables, re-run all migrations from scratch, and re-seed:
```bash
npm run db:reset
```
> [!CAUTION]
> `db:reset` is hardcoded to refuse running in `production` environment to prevent data loss.

## 4. Emergency Rollback Procedure
If a migration fails or causes regression during release:
1. Run rollback on the current environment:
   ```bash
   npx knex migrate:rollback --env <environment>
   ```
2. Verify system functionality:
   ```bash
   npm run db:health
   ```
3. Check `knex_migrations` table to confirm status.

