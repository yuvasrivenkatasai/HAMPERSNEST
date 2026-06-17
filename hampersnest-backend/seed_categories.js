import { sequelize } from './database/db.js';
import { Category, Product, Setting } from './database/models.js';
import crypto from 'crypto';

const data = {
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

async function seed() {
  await sequelize.sync();
  
  const newCatIds = [];
  let firstMainId = null;
  
  for (const [mainName, subCats] of Object.entries(data)) {
    let mainCat = await Category.findOne({ where: { name: mainName, parentId: null } });
    if (!mainCat) {
      mainCat = await Category.create({
        id: crypto.randomUUID(),
        name: mainName,
        parentId: null
      });
      console.log(`Created Main: ${mainName}`);
    } else {
      console.log(`Main already exists: ${mainName}`);
    }
    newCatIds.push(mainCat.id);
    if (!firstMainId) firstMainId = mainCat.id;
    
    for (const subName of subCats) {
      let subCat = await Category.findOne({ where: { name: subName, parentId: mainCat.id } });
      if (!subCat) {
        subCat = await Category.create({
          id: crypto.randomUUID(),
          name: subName,
          parentId: mainCat.id
        });
        console.log(`Created Sub: ${subName}`);
      } else {
        console.log(`Sub already exists: ${subName}`);
      }
      newCatIds.push(subCat.id);
    }
  }
  
  const oldCats = await Category.findAll();
  for (const cat of oldCats) {
    if (!newCatIds.includes(cat.id)) {
      const productsCount = await Product.count({ where: { category: cat.id } });
      if (productsCount > 0) {
        await Product.update({ category: firstMainId, subCategory: '' }, { where: { category: cat.id } });
        console.log(`Moved ${productsCount} products from old category ${cat.name} to ${firstMainId}`);
      }
      
      const subProductsCount = await Product.count({ where: { subCategory: cat.id } });
      if (subProductsCount > 0) {
        await Product.update({ subCategory: '' }, { where: { subCategory: cat.id } });
        console.log(`Cleared subcategory for ${subProductsCount} products that were in ${cat.name}`);
      }
      
      await cat.destroy();
      console.log(`Deleted old category: ${cat.name}`);
    }
  }
  
  // Ensure the settings don't have stale popularSearches if they point to old ones.
  // Wait, let's just create a list of popular searches dynamically based on a few items
  const defaultPopular = "#WeddingReturnGifts, #BabyShowerReturnGifts, #CorporateGifts, #HousewarmingReturnGifts, #DiwaliGiftHampers";
  await Setting.upsert({ key: 'popularSearches', value: defaultPopular });
  console.log(`Updated Popular Searches settings.`);

  console.log('Seeding complete.');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
