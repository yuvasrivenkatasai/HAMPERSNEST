const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

async function updateDatabase() {
  console.log('Checking database for hero_banners destinations update...');
  
  // Default to SQLite (development)
  const dbPath = path.join(__dirname, 'database.sqlite');
  
  if (!fs.existsSync(dbPath)) {
    console.log(`Database not found at ${dbPath}. Ensure you are running this in the backend directory or that the database exists.`);
  }

  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false
  });

  try {
    await sequelize.authenticate();
    console.log('Connection to SQLite database established successfully.');
    
    // Safely add the column
    await sequelize.query('ALTER TABLE hero_banners ADD COLUMN destinations TEXT;');
    console.log('✅ Successfully added "destinations" column to hero_banners table.');
    
  } catch (error) {
    if (error.message && error.message.includes('duplicate column name')) {
      console.log('✅ Column "destinations" already exists in hero_banners table. No action needed.');
    } else {
      console.error('❌ Error updating database:', error.message || error);
    }
  } finally {
    await sequelize.close();
  }
}

updateDatabase();
