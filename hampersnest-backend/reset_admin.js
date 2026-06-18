import bcrypt from 'bcryptjs';
import { connectDB, sequelize } from './database/db.js';
import { User } from './database/models.js';

const resetPassword = async () => {
  await connectDB();
  
  const username = 'superadmin';
  const newPassword = 'password123';
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const [user, created] = await User.upsert({
    id: 1, // assuming id 1 is superadmin, or we can just find and update
    username,
    password: hashedPassword,
    role: 'Super Admin',
    isActive: true
  });
  
  console.log(`Password for ${username} has been reset to: ${newPassword}`);
  process.exit(0);
};

resetPassword();
