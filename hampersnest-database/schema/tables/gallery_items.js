/**
 * Table Schema: gallery_items
 * Model reference: hampersnest-backend/database/models.js (GalleryItem) & alter.cjs
 */

module.exports = {
  tableName: 'gallery_items',

  async up(knex) {
    const exists = await knex.schema.hasTable('gallery_items');
    if (!exists) {
      await knex.schema.createTable('gallery_items', (table) => {
        table.string('id', 255).primary();
        table.string('title', 255).defaultTo('');
        table.text('image').notNullable();
        table.string('category', 255).notNullable();
        table.text('description').nullable();
        table.string('fileSize', 255).defaultTo('Unknown');
        table.string('dimensions', 255).defaultTo('Unknown');
        table.string('mediaType', 50).defaultTo('Image');
        table.integer('width').defaultTo(0);
        table.integer('height').defaultTo(0);
        table.boolean('isActive').defaultTo(true);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
      });
    }
  },

  async down(knex) {
    await knex.schema.dropTableIfExists('gallery_items');
  }
};

