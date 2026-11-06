/**
 * Table Schema: categories
 * Model reference: hampersnest-backend/database/models.js (Category)
 */

async function ensureColumn(knex, colName, colCallback) {
  const hasCol = await knex.schema.hasColumn('categories', colName);
  if (!hasCol) {
    await knex.schema.alterTable('categories', colCallback);
  }
}

module.exports = {
  tableName: 'categories',

  async up(knex) {
    const exists = await knex.schema.hasTable('categories');
    if (!exists) {
      await knex.schema.createTable('categories', (table) => {
        table.string('id', 255).primary();
        table.string('name', 255).notNullable();
        table.string('parentId', 255).nullable();
        table.integer('sortOrder').defaultTo(0);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
      });
    } else {
      await ensureColumn(knex, 'parentId', t => t.string('parentId', 255).nullable());
      await ensureColumn(knex, 'sortOrder', t => t.integer('sortOrder').defaultTo(0));
      await ensureColumn(knex, 'createdAt', t => t.timestamp('createdAt').defaultTo(knex.fn.now()));
      await ensureColumn(knex, 'updatedAt', t => t.timestamp('updatedAt').defaultTo(knex.fn.now()));
    }
  },

  async down(knex) {
    await knex.schema.dropTableIfExists('categories');
  }
};

