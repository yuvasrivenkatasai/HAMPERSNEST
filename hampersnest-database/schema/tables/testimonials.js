/**
 * Table Schema: testimonials
 * Model reference: hampersnest-backend/database/models.js (Testimonial) & alter.cjs
 */

module.exports = {
  tableName: 'testimonials',

  async up(knex) {
    const exists = await knex.schema.hasTable('testimonials');
    if (!exists) {
      await knex.schema.createTable('testimonials', (table) => {
        table.increments('id').primary();
        table.string('name', 255).notNullable();
        table.text('quote').notNullable();
        table.integer('rating').defaultTo(5);
        table.string('event', 255).defaultTo('');
        table.boolean('isActive').defaultTo(true);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
      });
    }
  },

  async down(knex) {
    await knex.schema.dropTableIfExists('testimonials');
  }
};

