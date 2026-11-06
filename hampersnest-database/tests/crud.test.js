const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const knex = require('knex');
const knexfile = require('../knexfile');
const { syncAll } = require('../schema');

describe('HampersNest CRUD & Seed Verification Suite', () => {
  let db;

  before(async () => {
    db = knex(knexfile.test);
    await syncAll(db);
  });

  after(async () => {
    if (db) {
      await db.destroy();
    }
  });

  test('should run seeds without throwing errors', async () => {
    const [log] = await db.seed.run();
    assert.ok(Array.isArray(log), 'Seeds should return log array');
    assert.ok(log.length > 0, 'At least one seed file should execute');
  });

  test('should verify seeded categories exist', async () => {
    const weddingCat = await db('categories').where({ name: 'Weddings' }).first();
    assert.ok(weddingCat, 'Parent category Weddings must exist');

    const subCats = await db('categories').where({ parentId: weddingCat.id });
    assert.ok(subCats.length > 0, 'Weddings must have subcategories');
  });

  test('should verify seeded superadmin user exists', async () => {
    const admin = await db('users').where({ username: 'superadmin' }).first();
    assert.ok(admin, 'superadmin user must exist');
    assert.strictEqual(admin.role, 'Super Admin');
  });

  test('should insert and fetch a rich product', async () => {
    await db('products').insert({
      id: 'prd-test-royal-trunk',
      name: 'Royal Heritage Hamper',
      price: 3999,
      discountPrice: 3499,
      image: 'https://example.com/trunk.jpg',
      category: 'cat-test',
      watermarkSettings: JSON.stringify({ enabled: true, text: 'Hampers Nest' }),
      variantsEnabled: true,
      variants: JSON.stringify([{ title: 'Large', price: 3999 }])
    });

    const prd = await db('products').where({ id: 'prd-test-royal-trunk' }).first();
    assert.ok(prd);
    assert.strictEqual(prd.price, 3999);
    assert.strictEqual(prd.discountPrice, 3499);
  });
});

