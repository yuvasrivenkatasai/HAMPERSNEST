/**
 * Table Schema: orders
 * Model reference: hampersnest-backend/database/models.js (Order) & alter_orders.cjs
 */

async function ensureColumn(knex, colName, colCallback) {
  const hasCol = await knex.schema.hasColumn('orders', colName);
  if (!hasCol) {
    await knex.schema.alterTable('orders', colCallback);
  }
}

module.exports = {
  tableName: 'orders',

  async up(knex) {
    const exists = await knex.schema.hasTable('orders');
    if (!exists) {
      await knex.schema.createTable('orders', (table) => {
        table.increments('id').primary();
        table.string('orderId', 255).notNullable().unique();
        table.binary('customer').notNullable();
        table.binary('items').notNullable();
        table.integer('totalAmount').notNullable();
        table.integer('budget').defaultTo(0);
        table.string('eventType', 255).notNullable();
        table.timestamp('deliveryDate').nullable();
        table.text('notes').nullable();
        table.text('internalNotes').nullable();
        table.string('status', 50).defaultTo('Pending');
        table.string('source', 50).defaultTo('Website');
        table.string('paymentStatus', 50).defaultTo('Pending');
        table.string('paymentMethod', 255).defaultTo('');
        table.integer('advancePaid').defaultTo(0);
        table.text('history').nullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
      });
    } else {
      await ensureColumn(knex, 'budget', t => t.integer('budget').defaultTo(0));
      await ensureColumn(knex, 'deliveryDate', t => t.timestamp('deliveryDate').nullable());
      await ensureColumn(knex, 'notes', t => t.text('notes').nullable());
      await ensureColumn(knex, 'internalNotes', t => t.text('internalNotes').nullable());
      await ensureColumn(knex, 'status', t => t.string('status', 50).defaultTo('Pending'));
      await ensureColumn(knex, 'source', t => t.string('source', 50).defaultTo('Website'));
      await ensureColumn(knex, 'paymentStatus', t => t.string('paymentStatus', 50).defaultTo('Pending'));
      await ensureColumn(knex, 'paymentMethod', t => t.string('paymentMethod', 255).defaultTo(''));
      await ensureColumn(knex, 'advancePaid', t => t.integer('advancePaid').defaultTo(0));
      await ensureColumn(knex, 'history', t => t.text('history').nullable());
      await ensureColumn(knex, 'createdAt', t => t.timestamp('createdAt').defaultTo(knex.fn.now()));
      await ensureColumn(knex, 'updatedAt', t => t.timestamp('updatedAt').defaultTo(knex.fn.now()));
    }
  },

  async down(knex) {
    await knex.schema.dropTableIfExists('orders');
  }
};

