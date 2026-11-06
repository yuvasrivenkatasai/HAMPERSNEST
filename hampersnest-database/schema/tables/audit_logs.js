/**
 * Table Schema: audit_logs
 * Model reference: hampersnest-backend/database/models.js (AuditLog) & alter.cjs
 */

module.exports = {
  tableName: 'audit_logs',

  async up(knex) {
    const exists = await knex.schema.hasTable('audit_logs');
    if (!exists) {
      await knex.schema.createTable('audit_logs', (table) => {
        table.increments('id').primary();
        table.string('adminUser', 255).notNullable();
        table.string('action', 255).notNullable();
        table.string('entity', 255).notNullable();
        table.string('entityId', 255).nullable();
        table.binary('details').nullable();
        table.string('ipAddress', 255).nullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
      });
    }
  },

  async down(knex) {
    await knex.schema.dropTableIfExists('audit_logs');
  }
};

