/**
 * Master Production Migration for HampersNest Database
 * Imports modular table schemas from schema/index.js
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const { syncAll, dropAll } = require('../schema');

exports.up = async function(knex) {
  await syncAll(knex);
};

exports.down = async function(knex) {
  await dropAll(knex);
};

