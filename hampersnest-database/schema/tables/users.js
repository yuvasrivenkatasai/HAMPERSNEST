/**
 * Table Schema: users
 * Model reference: hampersnest-backend/database/models.js (User)
 */

async function ensureColumn(knex, colName, colCallback) {
  const hasCol = await knex.schema.hasColumn('users', colName);
  if (!hasCol) {
    await knex.schema.alterTable('users', colCallback);
  }
}

module.exports = {
  tableName: 'users',

  async up(knex) {
    const exists = await knex.schema.hasTable('users');
    if (!exists) {
      await knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('username', 255).notNullable().unique();
        table.string('password', 255).notNullable();
        table.string('role', 50).defaultTo('Admin');
        table.boolean('isActive').defaultTo(true);
        table.text('permissions').nullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
      });
    } else {
      // Alter existing table if missing any columns
      await ensureColumn(knex, 'role', t => t.string('role', 50).defaultTo('Admin'));
      await ensureColumn(knex, 'isActive', t => t.boolean('isActive').defaultTo(true));
      await ensureColumn(knex, 'permissions', t => t.text('permissions').nullable());
      await ensureColumn(knex, 'createdAt', t => t.timestamp('createdAt').defaultTo(knex.fn.now()));
      await ensureColumn(knex, 'updatedAt', t => t.timestamp('updatedAt').defaultTo(knex.fn.now()));
    }
  },

  async down(knex) {
    await knex.schema.dropTableIfExists('users');
  }
};

