import { sequelize } from './database/db.js';
import { Setting } from './database/models.js';

import { defaultPolicies } from './utils/defaultPolicies.js';

async function seed() {
  await sequelize.sync();
  
  const existingSetting = await Setting.findOne({ where: { key: 'customPolicies' } });
  
  if (existingSetting) {
    console.log('Policies already exist in the database. Merging...');
    const currentPolicies = existingSetting.value || [];
    
    // Merge existing custom ones with default ones if not present
    for (const defPolicy of defaultPolicies) {
      if (!currentPolicies.find(p => p.id === defPolicy.id)) {
        currentPolicies.push(defPolicy);
      }
    }
    await Setting.upsert({ key: 'customPolicies', value: currentPolicies });
  } else {
    console.log('Inserting default policies...');
    await Setting.upsert({ key: 'customPolicies', value: defaultPolicies });
  }

  console.log('Policies seeded successfully.');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
