/**
 * Table Schema: hero_banners
 * Model reference: hampersnest-backend/database/models.js (HeroBanner) & alter_hero_db.cjs
 */

async function ensureColumn(knex, colName, colCallback) {
  const hasCol = await knex.schema.hasColumn('hero_banners', colName);
  if (!hasCol) {
    await knex.schema.alterTable('hero_banners', colCallback);
  }
}

module.exports = {
  tableName: 'hero_banners',

  async up(knex) {
    const exists = await knex.schema.hasTable('hero_banners');
    if (!exists) {
      await knex.schema.createTable('hero_banners', (table) => {
        table.increments('id').primary();
        table.string('title', 255).defaultTo('Main Homepage Hero');
        table.text('mainImage').nullable();
        table.text('floatingImageTop').nullable();
        table.text('floatingImageBottom').nullable();
        table.boolean('isActive').defaultTo(true);
        table.text('destinations').nullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
      });
    } else {
      await ensureColumn(knex, 'destinations', t => t.text('destinations').nullable());
      await ensureColumn(knex, 'isActive', t => t.boolean('isActive').defaultTo(true));
      await ensureColumn(knex, 'createdAt', t => t.timestamp('createdAt').defaultTo(knex.fn.now()));
      await ensureColumn(knex, 'updatedAt', t => t.timestamp('updatedAt').defaultTo(knex.fn.now()));
    }
  },

  async down(knex) {
    await knex.schema.dropTableIfExists('hero_banners');
  }
};

