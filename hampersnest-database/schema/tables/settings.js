/**
 * Table Schema: settings
 * Model reference: hampersnest-backend/database/models.js (Setting)
 */

module.exports = {
  tableName: 'settings',

  async up(knex) {
    const exists = await knex.schema.hasTable('settings');
    if (!exists) {
      await knex.schema.createTable('settings', (table) => {
        table.increments('id').primary();
        table.string('key', 255).notNullable().unique();
        table.binary('value').nullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
      });
    }
  },

  async down(knex) {
    await knex.schema.dropTableIfExists('settings');
  }
};

