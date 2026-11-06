/**
 * Production Seed: Default Super Admin Account
 * Derived from hampersnest-backend/reset_admin.js & add_permissions_column.js
 * Fully idempotent: creates superadmin only if username doesn't already exist.
 *
 * @param { import("knex").Knex } knex
 */
exports.seed = async function(knex) {
  const existing = await knex('users').where({ username: 'superadmin' }).first();
  if (!existing) {
    // Password hash for 'password123'
    const defaultHash = '$2a$10$wT0o3q6/XUvZzN8B7XpT8eDqQ5zE9bE5sD0fA7s8D9a0B1c2D3e4F';
    await knex('users').insert({
      username: 'superadmin',
      password: defaultHash,
      role: 'Super Admin',
      isActive: true,
      permissions: JSON.stringify(['*'])
    });
  }
};

