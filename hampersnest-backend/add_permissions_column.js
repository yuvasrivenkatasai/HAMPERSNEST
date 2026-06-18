import { sequelize } from './database/db.js';

async function addPermissionsColumn() {
  try {
    // Check if column already exists
    const [results] = await sequelize.query(
      "SELECT column_name FROM user_tab_columns WHERE table_name = 'users' AND column_name = 'permissions'"
    );
    
    if (results.length > 0) {
      console.log('Column "permissions" already exists in users table. No changes needed.');
    } else {
      await sequelize.query('ALTER TABLE "users" ADD "permissions" CLOB');
      console.log('Successfully added "permissions" column to users table.');
    }
    
    // Update existing Super Admin users to have full permissions
    await sequelize.query(
      `UPDATE "users" SET "permissions" = '["dashboard","orders","products","inventory","categories","inquiries","testimonials","policies","users","settings"]' WHERE "role" = 'Super Admin' AND "permissions" IS NULL`
    );
    console.log('Updated existing Super Admin users with full permissions.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addPermissionsColumn();
