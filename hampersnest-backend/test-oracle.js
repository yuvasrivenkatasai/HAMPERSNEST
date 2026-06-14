import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const dbUser = process.env.DB_USER || 'system';
const dbPassword = process.env.DB_PASSWORD || '<oracle_password>';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 1521;

const connectStrings = [
  `${dbHost}:${dbPort}/XEPDB1`,
  `${dbHost}:${dbPort}:XE`
];

async function testConnections() {
  for (const cs of connectStrings) {
    console.log(`\nTesting connection string: ${cs}`);
    const sequelize = new Sequelize({
      dialect: 'oracle',
      username: dbUser,
      password: dbPassword,
      dialectOptions: {
        connectString: cs
      },
      logging: false
    });

    try {
      await sequelize.authenticate();
      console.log(`SUCCESS: Connected using ${cs}`);
      process.exit(0);
    } catch (err) {
      console.error(`FAILED: ${err.message}`);
    }
  }
  console.log('\nAll connection attempts failed.');
  process.exit(1);
}

testConnections();
