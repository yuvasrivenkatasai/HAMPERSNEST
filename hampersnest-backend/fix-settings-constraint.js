import { sequelize } from './database/db.js';

async function run() {
  console.log('Finding and dropping JSON constraints on table "settings"...');
  try {
    const [cons] = await sequelize.query(
      "SELECT constraint_name, search_condition FROM user_constraints WHERE table_name = 'settings'"
    );

    let droppedCount = 0;
    for (const con of cons) {
      const condition = String(con.SEARCH_CONDITION || '').toUpperCase();
      const name = String(con.CONSTRAINT_NAME || '');

      // Check if it's the IS JSON constraint or the specific production constraint name
      if (condition.includes('IS JSON') || name === 'SYS_C0028775') {
        const dropQuery = `ALTER TABLE "settings" DROP CONSTRAINT "${name}"`;
        await sequelize.query(dropQuery);
        console.log(`Successfully dropped constraint: ${name} (${condition || 'SYS_C0028775'})`);
        droppedCount++;
      }
    }

    if (droppedCount === 0) {
      console.log('No active JSON constraints found on "settings" table.');
    } else {
      console.log(`Successfully removed ${droppedCount} constraint(s).`);
    }
  } catch (e) {
    console.error('Error fixing settings constraint:', e);
  } finally {
    await sequelize.close();
  }
}

run();
