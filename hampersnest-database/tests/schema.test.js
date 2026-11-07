const { test, describe } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const { tables, syncAll, dropAll } = require('../schema');
const knexfile = require('../knexfile');

describe('HampersNest Production Schema & Integrity Suite', () => {
  test('should load Knexfile with Oracle Cloud Production configuration', () => {
    assert.ok(knexfile.production, 'knexfile.production must exist');
    assert.strictEqual(knexfile.production.client, 'oracledb');
    assert.ok(knexfile.production.connection, 'Production connection config must exist');
    assert.strictEqual(knexfile.production.connection.user, 'HAMPERSNEST');
  });

  test('should register all 11 required production tables', () => {
    assert.strictEqual(tables.length, 11, 'Must have exactly 11 production tables');
    
    const expectedTables = [
      'users',
      'categories',
      'products',
      'orders',
      'inquiries',
      'settings',
      'gallery_items',
      'audit_logs',
      'hero_banners',
      'testimonials',
      'category_showcase'
    ];

    const registeredNames = tables.map(t => t.tableName);
    for (const name of expectedTables) {
      assert.ok(registeredNames.includes(name), `Table "${name}" must be registered`);
    }
  });

  test('every table schema module must export tableName, up, and down functions', () => {
    for (const t of tables) {
      assert.ok(typeof t.tableName === 'string' && t.tableName.length > 0, `Table must have string tableName`);
      assert.ok(typeof t.up === 'function', `Table "${t.tableName}" must export an async up() function`);
      assert.ok(typeof t.down === 'function', `Table "${t.tableName}" must export an async down() function`);
    }
  });

  test('orchestrator should export syncAll and dropAll handlers', () => {
    assert.ok(typeof syncAll === 'function', 'syncAll must be a function');
    assert.ok(typeof dropAll === 'function', 'dropAll must be a function');
  });

  test('all production seeds must exist and export valid seed functions', () => {
    const seedsDir = path.join(__dirname, '..', 'seeds');
    const files = fs.readdirSync(seedsDir).filter(f => f.endsWith('.js'));
    assert.ok(files.length >= 3, 'Must have at least 3 initial seed files');

    for (const file of files) {
      const seedModule = require(path.join(seedsDir, file));
      assert.ok(typeof seedModule.seed === 'function', `Seed ${file} must export seed() function`);
    }
  });
});
