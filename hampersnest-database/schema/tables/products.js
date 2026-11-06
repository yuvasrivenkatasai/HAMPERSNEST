/**
 * Table Schema: products
 * Model reference: hampersnest-backend/database/models.js (Product) & alter.cjs
 */

async function ensureColumn(knex, colName, colCallback) {
  const hasCol = await knex.schema.hasColumn('products', colName);
  if (!hasCol) {
    await knex.schema.alterTable('products', colCallback);
  }
}

module.exports = {
  tableName: 'products',

  async up(knex) {
    const exists = await knex.schema.hasTable('products');
    if (!exists) {
      await knex.schema.createTable('products', (table) => {
        table.string('id', 255).primary();
        table.string('name', 255).notNullable();
        table.string('sku', 255).nullable();
        table.integer('price').notNullable();
        table.integer('discountPrice').defaultTo(0);
        table.integer('originalPrice').defaultTo(0);
        table.text('image').notNullable();
        table.string('category', 255).notNullable();
        table.string('masterCategory', 255).defaultTo('Traditional');
        table.string('subCategory', 255).defaultTo('');
        table.string('occasion', 255).defaultTo('');
        table.integer('stockQuantity').defaultTo(0);
        table.integer('reservedQuantity').defaultTo(0);
        table.integer('lowStockThreshold').defaultTo(5);
        table.decimal('rating', 3, 2).defaultTo(4.5);
        table.text('description').nullable();
        table.text('shortDescription').nullable();
        table.boolean('isFeatured').defaultTo(false);
        table.integer('views').defaultTo(0);
        table.integer('clicks').defaultTo(0);
        table.boolean('isActive').defaultTo(true);
        table.boolean('customGiftTagEnabled').defaultTo(true);
        table.boolean('addonsEnabled').defaultTo(true);
        table.text('customizationText').nullable();
        table.text('deliveryInfoText').nullable();
        table.text('videoUrls').nullable();
        table.text('tags').nullable();
        table.text('customization').nullable();
        table.text('shipping').nullable();
        table.text('details').nullable();
        table.text('images').nullable();
        table.text('watermarkSettings').nullable();
        table.boolean('variantsEnabled').defaultTo(false);
        table.text('variants').nullable();
        table.text('customAddons').nullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
      });
    } else {
      // Alter table to add any missing columns safely
      await ensureColumn(knex, 'sku', t => t.string('sku', 255).nullable());
      await ensureColumn(knex, 'discountPrice', t => t.integer('discountPrice').defaultTo(0));
      await ensureColumn(knex, 'originalPrice', t => t.integer('originalPrice').defaultTo(0));
      await ensureColumn(knex, 'masterCategory', t => t.string('masterCategory', 255).defaultTo('Traditional'));
      await ensureColumn(knex, 'subCategory', t => t.string('subCategory', 255).defaultTo(''));
      await ensureColumn(knex, 'occasion', t => t.string('occasion', 255).defaultTo(''));
      await ensureColumn(knex, 'stockQuantity', t => t.integer('stockQuantity').defaultTo(0));
      await ensureColumn(knex, 'reservedQuantity', t => t.integer('reservedQuantity').defaultTo(0));
      await ensureColumn(knex, 'lowStockThreshold', t => t.integer('lowStockThreshold').defaultTo(5));
      await ensureColumn(knex, 'rating', t => t.decimal('rating', 3, 2).defaultTo(4.5));
      await ensureColumn(knex, 'description', t => t.text('description').nullable());
      await ensureColumn(knex, 'shortDescription', t => t.text('shortDescription').nullable());
      await ensureColumn(knex, 'isFeatured', t => t.boolean('isFeatured').defaultTo(false));
      await ensureColumn(knex, 'views', t => t.integer('views').defaultTo(0));
      await ensureColumn(knex, 'clicks', t => t.integer('clicks').defaultTo(0));
      await ensureColumn(knex, 'isActive', t => t.boolean('isActive').defaultTo(true));
      await ensureColumn(knex, 'customGiftTagEnabled', t => t.boolean('customGiftTagEnabled').defaultTo(true));
      await ensureColumn(knex, 'addonsEnabled', t => t.boolean('addonsEnabled').defaultTo(true));
      await ensureColumn(knex, 'customizationText', t => t.text('customizationText').nullable());
      await ensureColumn(knex, 'deliveryInfoText', t => t.text('deliveryInfoText').nullable());
      await ensureColumn(knex, 'videoUrls', t => t.text('videoUrls').nullable());
      await ensureColumn(knex, 'tags', t => t.text('tags').nullable());
      await ensureColumn(knex, 'customization', t => t.text('customization').nullable());
      await ensureColumn(knex, 'shipping', t => t.text('shipping').nullable());
      await ensureColumn(knex, 'details', t => t.text('details').nullable());
      await ensureColumn(knex, 'images', t => t.text('images').nullable());
      await ensureColumn(knex, 'watermarkSettings', t => t.text('watermarkSettings').nullable());
      await ensureColumn(knex, 'variantsEnabled', t => t.boolean('variantsEnabled').defaultTo(false));
      await ensureColumn(knex, 'variants', t => t.text('variants').nullable());
      await ensureColumn(knex, 'customAddons', t => t.text('customAddons').nullable());
      await ensureColumn(knex, 'createdAt', t => t.timestamp('createdAt').defaultTo(knex.fn.now()));
      await ensureColumn(knex, 'updatedAt', t => t.timestamp('updatedAt').defaultTo(knex.fn.now()));
    }
  },

  async down(knex) {
    await knex.schema.dropTableIfExists('products');
  }
};

