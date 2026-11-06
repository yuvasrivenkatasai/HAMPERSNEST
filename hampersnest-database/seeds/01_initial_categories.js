/**
 * Production Seed: Categories and Subcategories Tree
 * Derived from hampersnest-backend/seed_categories.js
 * Fully idempotent: only inserts categories that do not already exist.
 *
 * @param { import("knex").Knex } knex
 */
const crypto = require('crypto');

const categoryData = {
  "Weddings": [
    "Wedding Return Gifts",
    "Engagement Return Gifts",
    "Bridal Shower Gifts",
    "Haldi Ceremony Gifts",
    "Sangeet Ceremony Gifts",
    "Mehendi Ceremony Gifts"
  ],
  "Baby Celebrations": [
    "Baby Shower Return Gifts",
    "Naming Ceremony Gifts",
    "Cradle Ceremony Gifts",
    "First Birthday Gifts",
    "Kids Birthday Return Gifts"
  ],
  "Traditional Ceremonies": [
    "Half Saree Ceremony Gifts",
    "Upanayanam (Thread Ceremony) Gifts",
    "Housewarming Return Gifts"
  ],
  "Special Occasions": [
    "Birthday Return Gifts",
    "Anniversary Gifts",
    "Graduation Celebration Gifts",
    "Retirement Gifts",
    "Achievement & Award Gifts",
    "Thank You Hampers"
  ],
  "Festive Hampers": [
    "Diwali Gift Hampers",
    "Sankranti Gift Hampers",
    "Ugadi Gift Hampers",
    "Christmas Gift Hampers",
    "Eid Gift Hampers",
    "Valentine's Day Gifts",
    "Mother's Day Gifts",
    "Father's Day Gifts",
    "Teacher Appreciation Gifts"
  ],
  "Corporate Gifting": [
    "Corporate Gifts",
    "Employee Appreciation Gifts",
    "Client & Business Gifts",
    "Event Giveaways",
    "Conference & Seminar Gifts"
  ]
};

exports.seed = async function(knex) {
  let mainSort = 1;

  for (const [mainName, subCats] of Object.entries(categoryData)) {
    // 1. Ensure parent category exists
    let parent = await knex('categories').where({ name: mainName, parentId: null }).first();
    let parentId;

    if (!parent) {
      parentId = 'cat-' + crypto.randomUUID();
      await knex('categories').insert({
        id: parentId,
        name: mainName,
        parentId: null,
        sortOrder: mainSort++
      });
    } else {
      parentId = parent.id;
    }

    // 2. Ensure subcategories exist
    let subSort = 1;
    for (const subName of subCats) {
      const exists = await knex('categories').where({ name: subName, parentId }).first();
      if (!exists) {
        await knex('categories').insert({
          id: 'sub-' + crypto.randomUUID(),
          name: subName,
          parentId: parentId,
          sortOrder: subSort++
        });
      }
    }
  }
};

