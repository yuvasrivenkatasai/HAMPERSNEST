import bcrypt from 'bcryptjs';
import { connectDB, sequelize } from './database/db.js';
import { User } from './database/models.js';

const addCustomAdmin = async () => {
  await connectDB();
  
  const username = 'superadmin@hampersnest.com';
  const newPassword = 'qc22!a&Io1JQSXR26q';
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  // Create or update the user
  const [user, created] = await User.findOrCreate({
    where: { username },
    defaults: {
      password: hashedPassword,
      role: 'Super Admin',
      isActive: true
    }
  });

  if (!created) {
    user.password = hashedPassword;
    user.role = 'Super Admin';
    user.isActive = true;
    await user.save();
  }
  
  console.log(`User ${username} has been successfully added/updated with the provided password.`);
  process.exit(0);
};

addCustomAdmin();
