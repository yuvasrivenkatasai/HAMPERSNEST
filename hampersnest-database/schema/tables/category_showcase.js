/**
 * Table Schema: category_showcase
 * Model reference: hampersnest-backend/database/models.js (CategoryShowcase) & alter.cjs
 */

async function ensureColumn(knex, colName, colCallback) {
  const hasCol = await knex.schema.hasColumn('category_showcase', colName);
  if (!hasCol) {
    await knex.schema.alterTable('category_showcase', colCallback);
  }
}

module.exports = {
  tableName: 'category_showcase',

  async up(knex) {
    const exists = await knex.schema.hasTable('category_showcase');
    if (!exists) {
      await knex.schema.createTable('category_showcase', (table) => {
        table.increments('id').primary();
        table.string('name', 255).notNullable();
        table.string('icon', 100).defaultTo('fa-solid fa-gift');
        table.text('image').nullable();
        table.boolean('isFeatured').defaultTo(false);
        table.string('targetCollection', 255).notNullable();
        table.integer('sortOrder').defaultTo(0);
        table.boolean('isActive').defaultTo(true);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
      });
    } else {
      await ensureColumn(knex, 'image', t => t.text('image').nullable());
      await ensureColumn(knex, 'isFeatured', t => t.boolean('isFeatured').defaultTo(false));
      await ensureColumn(knex, 'sortOrder', t => t.integer('sortOrder').defaultTo(0));
      await ensureColumn(knex, 'isActive', t => t.boolean('isActive').defaultTo(true));
      await ensureColumn(knex, 'createdAt', t => t.timestamp('createdAt').defaultTo(knex.fn.now()));
      await ensureColumn(knex, 'updatedAt', t => t.timestamp('updatedAt').defaultTo(knex.fn.now()));
    }
  },

  async down(knex) {
    await knex.schema.dropTableIfExists('category_showcase');
  }
};

