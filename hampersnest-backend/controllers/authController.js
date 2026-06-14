import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, AuditLog } from '../database/models.js';

const JWT_SECRET = process.env.JWT_SECRET;

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.isActive === false) {
        return res.status(403).json({ message: 'Account is disabled. Please contact Super Admin.' });
      }
      const token = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: '30d'
      });

      // Write audit log to Oracle
      await AuditLog.create({
        adminUser: user.username,
        action: 'LOGIN',
        entity: 'System',
        ipAddress: req.ip || 'Unknown'
      });

      res.json({
        _id: user.id,
        username: user.username,
        role: user.role,
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify token and return user info
// @route   GET /api/auth/verify
// @access  Private
export const verifyUser = async (req, res) => {
  try {
    res.json({
      _id: req.user.id,
      username: req.user.username,
      role: req.user.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findByPk(req.user.id);
    if (user && (await bcrypt.compare(currentPassword, user.password))) {
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      res.json({ message: 'Password changed successfully' });
    } else {
      res.status(401).json({ message: 'Invalid current password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/SuperAdmin
export const getUsers = async (req, res) => {
  if (req.user.role !== 'Super Admin') {
    return res.status(403).json({ message: 'Not authorized as Super Admin' });
  }
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create user
// @route   POST /api/auth/users
// @access  Private/SuperAdmin
export const createUser = async (req, res) => {
  if (req.user.role !== 'Super Admin') {
    return res.status(403).json({ message: 'Not authorized as Super Admin' });
  }
  const { username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword,
      role: role || 'Admin'
    });
    res.status(201).json({ id: user.id, username: user.username, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private/SuperAdmin
export const deleteUser = async (req, res) => {
  if (req.user.role !== 'Super Admin') {
    return res.status(403).json({ message: 'Not authorized as Super Admin' });
  }
  try {
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({ message: 'You cannot delete yourself' });
    }
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.destroy();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/auth/users/:id
// @access  Private/SuperAdmin
export const updateUser = async (req, res) => {
  if (req.user.role !== 'Super Admin') {
    return res.status(403).json({ message: 'Not authorized as Super Admin' });
  }
  
  const { username, password, role, isActive } = req.body;
  
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent locking out the last super admin
    if (req.params.id === req.user.id.toString() && isActive === false) {
      return res.status(400).json({ message: 'You cannot disable your own account' });
    }

    if (username) user.username = username;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    
    await user.save();
    res.json({ id: user.id, username: user.username, role: user.role, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
