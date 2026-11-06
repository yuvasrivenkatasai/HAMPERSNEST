/**
 * HampersNest Schema Registry
 * Central orchestrator for all 11 production database tables.
 */

const users = require('./tables/users');
const categories = require('./tables/categories');
const products = require('./tables/products');
const orders = require('./tables/orders');
const inquiries = require('./tables/inquiries');
const settings = require('./tables/settings');
const galleryItems = require('./tables/gallery_items');
const auditLogs = require('./tables/audit_logs');
const heroBanners = require('./tables/hero_banners');
const testimonials = require('./tables/testimonials');
const categoryShowcase = require('./tables/category_showcase');

const tables = [
  users,
  categories,
  products,
  orders,
  inquiries,
  settings,
  galleryItems,
  auditLogs,
  heroBanners,
  testimonials,
  categoryShowcase
];

/**
 * Creates missing tables and safely alters existing ones with new columns
 * @param { import("knex").Knex } knex
 */
async function syncAll(knex) {
  for (const table of tables) {
    await table.up(knex);
  }
}

/**
 * Drops all tables in reverse dependency order
 * @param { import("knex").Knex } knex
 */
async function dropAll(knex) {
  for (let i = tables.length - 1; i >= 0; i--) {
    await tables[i].down(knex);
  }
}

module.exports = {
  tables,
  syncAll,
  dropAll,
  users,
  categories,
  products,
  orders,
  inquiries,
  settings,
  galleryItems,
  auditLogs,
  heroBanners,
  testimonials,
  categoryShowcase
};

