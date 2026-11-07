# HampersNest Database Operations Runbook

## 1. Health & Connection Checks
Verify connectivity and examine row counts across all 11 production tables (Read-Only):
```bash
npm run db:verify
```

## 2. Synchronize / Create / Alter Tables
Apply schema changes, create missing tables, or add new columns to an existing database safely:
```bash
npm run db:sync
```

## 3. Populate Initial Baseline Data
Seed initial categories, superadmin user, and store settings/policies:
```bash
npm run seed
```

## 4. Run Automated Test Suite
Execute isolated in-memory test suite before committing changes:
```bash
npm test
```
