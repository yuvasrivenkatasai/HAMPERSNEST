const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const knex = require('knex');
const knexfile = require('../knexfile');
const { syncAll, dropAll, tables } = require('../schema');

describe('HampersNest Modular Schema Suite', () => {
  let db;

  before(async () => {
    db = knex(knexfile.test);
  });

  after(async () => {
    if (db) {
      await db.destroy();
    }
  });

  test('should synchronize all 11 production tables', async () => {
    await syncAll(db);

    for (const t of tables) {
      const exists = await db.schema.hasTable(t.tableName);
      assert.strictEqual(exists, true, `Table "${t.tableName}" must be created`);
    }
  });

  test('should verify all products columns including newer alterations', async () => {
    const expectedCols = [
      'id', 'name', 'price', 'discountPrice', 'originalPrice', 'image',
      'category', 'masterCategory', 'subCategory', 'occasion', 'stockQuantity',
      'reservedQuantity', 'lowStockThreshold', 'rating', 'description',
      'shortDescription', 'isFeatured', 'views', 'clicks', 'isActive',
      'customGiftTagEnabled', 'addonsEnabled', 'customizationText',
      'deliveryInfoText', 'videoUrls', 'tags', 'customization', 'shipping',
      'details', 'images', 'watermarkSettings', 'variantsEnabled',
      'variants', 'customAddons'
    ];

    for (const col of expectedCols) {
      const hasCol = await db.schema.hasColumn('products', col);
      assert.strictEqual(hasCol, true, `products must have column "${col}"`);
    }
  });

  test('should verify order columns match backend models', async () => {
    const expectedCols = [
      'id', 'orderId', 'customer', 'items', 'totalAmount', 'budget',
      'eventType', 'deliveryDate', 'notes', 'internalNotes', 'status',
      'source', 'paymentStatus', 'paymentMethod', 'advancePaid', 'history'
    ];

    for (const col of expectedCols) {
      const hasCol = await db.schema.hasColumn('orders', col);
      assert.strictEqual(hasCol, true, `orders must have column "${col}"`);
    }
  });

  test('should drop all tables cleanly on rollback', async () => {
    await dropAll(db);

    for (const t of tables) {
      const exists = await db.schema.hasTable(t.tableName);
      assert.strictEqual(exists, false, `Table "${t.tableName}" must be dropped`);
    }
  });
});

