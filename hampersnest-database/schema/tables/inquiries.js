/**
 * Table Schema: inquiries
 * Model reference: hampersnest-backend/database/models.js (Inquiry) & alter.cjs
 */

async function ensureColumn(knex, colName, colCallback) {
  const hasCol = await knex.schema.hasColumn('inquiries', colName);
  if (!hasCol) {
    await knex.schema.alterTable('inquiries', colCallback);
  }
}

module.exports = {
  tableName: 'inquiries',

  async up(knex) {
    const exists = await knex.schema.hasTable('inquiries');
    if (!exists) {
      await knex.schema.createTable('inquiries', (table) => {
        table.increments('id').primary();
        table.string('name', 255).notNullable();
        table.string('phone', 50).notNullable();
        table.string('email', 255).defaultTo('');
        table.string('city', 100).defaultTo('');
        table.string('eventType', 100).defaultTo('General');
        table.string('budget', 100).defaultTo('');
        table.integer('quantity').defaultTo(10);
        table.string('subject', 255).defaultTo('Custom Gifting Inquiry');
        table.text('message').notNullable();
        table.string('status', 50).defaultTo('New');
        table.text('leadNotes').nullable();
        table.string('assignedAdmin', 255).defaultTo('Unassigned');
        table.text('history').nullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
      });
    } else {
      await ensureColumn(knex, 'email', t => t.string('email', 255).defaultTo(''));
      await ensureColumn(knex, 'city', t => t.string('city', 100).defaultTo(''));
      await ensureColumn(knex, 'eventType', t => t.string('eventType', 100).defaultTo('General'));
      await ensureColumn(knex, 'budget', t => t.string('budget', 100).defaultTo(''));
      await ensureColumn(knex, 'quantity', t => t.integer('quantity').defaultTo(10));
      await ensureColumn(knex, 'subject', t => t.string('subject', 255).defaultTo('Custom Gifting Inquiry'));
      await ensureColumn(knex, 'status', t => t.string('status', 50).defaultTo('New'));
      await ensureColumn(knex, 'leadNotes', t => t.text('leadNotes').nullable());
      await ensureColumn(knex, 'assignedAdmin', t => t.string('assignedAdmin', 255).defaultTo('Unassigned'));
      await ensureColumn(knex, 'history', t => t.text('history').nullable());
      await ensureColumn(knex, 'createdAt', t => t.timestamp('createdAt').defaultTo(knex.fn.now()));
      await ensureColumn(knex, 'updatedAt', t => t.timestamp('updatedAt').defaultTo(knex.fn.now()));
    }
  },

  async down(knex) {
    await knex.schema.dropTableIfExists('inquiries');
  }
};

